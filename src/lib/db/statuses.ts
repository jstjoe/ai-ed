import { prisma } from "./client";
import type { StatusKind } from "../duration";

export async function listStatuses() {
  return prisma.status.findMany({ orderBy: { order: "asc" } });
}

export async function listStatusesWithTasks() {
  return prisma.status.findMany({
    orderBy: { order: "asc" },
    include: {
      tasks: {
        orderBy: { position: "asc" },
      },
    },
  });
}

export async function createStatus(input: {
  name: string;
  color: string;
  kind: StatusKind;
}) {
  const last = await prisma.status.findFirst({ orderBy: { order: "desc" } });
  const order = (last?.order ?? -1) + 1;
  return prisma.status.create({ data: { ...input, order } });
}

export async function updateStatus(
  id: string,
  patch: { name?: string; color?: string; kind?: StatusKind }
) {
  return prisma.status.update({ where: { id }, data: patch });
}

export async function reorderStatuses(orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, idx) =>
      prisma.status.update({ where: { id }, data: { order: idx } })
    )
  );
}

export async function deleteStatus(id: string, reassignTo?: string) {
  const taskCount = await prisma.task.count({ where: { statusId: id } });
  if (taskCount > 0) {
    if (!reassignTo) {
      throw new Error(
        `Cannot delete status with ${taskCount} task(s); choose a status to move them to.`
      );
    }
    await prisma.task.updateMany({
      where: { statusId: id },
      data: { statusId: reassignTo },
    });
  }

  // Ensure at least one DONE and one CANCELLED kind remains.
  const target = await prisma.status.findUnique({ where: { id } });
  if (!target) return;
  if (target.kind === "DONE") {
    const others = await prisma.status.count({
      where: { kind: "DONE", NOT: { id } },
    });
    if (others === 0)
      throw new Error("At least one Done-kind status is required.");
  }
  if (target.kind === "CANCELLED") {
    const others = await prisma.status.count({
      where: { kind: "CANCELLED", NOT: { id } },
    });
    if (others === 0)
      throw new Error("At least one Cancelled-kind status is required.");
  }

  return prisma.status.delete({ where: { id } });
}
