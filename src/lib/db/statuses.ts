import { prisma } from "./client";
import { getCurrentUser } from "../auth";
import type { StatusKind } from "../duration";

export async function listStatuses() {
  return prisma.status.findMany({ orderBy: { order: "asc" } });
}

export async function listStatusesWithTasks() {
  const user = getCurrentUser();
  return prisma.status.findMany({
    orderBy: { order: "asc" },
    include: {
      tasks: {
        where: { ownerId: user.id },
        orderBy: { position: "asc" },
      },
    },
  });
}

export async function getStatusTaskCounts(): Promise<Record<string, number>> {
  const user = getCurrentUser();
  const rows = await prisma.task.groupBy({
    by: ["statusId"],
    where: { ownerId: user.id },
    _count: { _all: true },
  });
  return Object.fromEntries(rows.map((r) => [r.statusId, r._count._all]));
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

/**
 * Atomic reassign-then-delete. The action layer is responsible for invariant
 * checks (e.g. keeping at least one of each StatusKind).
 */
export async function deleteStatus(id: string, reassignTo?: string) {
  return prisma.$transaction(async (tx) => {
    const taskCount = await tx.task.count({ where: { statusId: id } });
    if (taskCount > 0) {
      if (!reassignTo) {
        throw new Error(
          `Cannot delete status with ${taskCount} task(s); choose a status to move them to.`
        );
      }
      await tx.task.updateMany({
        where: { statusId: id },
        data: { statusId: reassignTo },
      });
    }
    return tx.status.delete({ where: { id } });
  });
}

export async function countStatusesByKind(): Promise<Record<StatusKind, number>> {
  const rows = await prisma.status.groupBy({
    by: ["kind"],
    _count: { _all: true },
  });
  const counts: Record<string, number> = { ACTIVE: 0, DONE: 0, CANCELLED: 0 };
  for (const r of rows) counts[r.kind] = r._count._all;
  return counts as Record<StatusKind, number>;
}

export async function getStatus(id: string) {
  return prisma.status.findUnique({ where: { id } });
}
