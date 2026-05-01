import { prisma } from "./client";
import { getCurrentUser } from "../auth";
import type { Duration, Priority } from "../duration";

export async function listTasks() {
  const user = getCurrentUser();
  return prisma.task.findMany({
    where: { ownerId: user.id },
    orderBy: [{ position: "asc" }],
    include: { status: true },
  });
}

export async function createTask(input: {
  title: string;
  description?: string;
  statusId: string;
  duration: Duration;
  priority: Priority;
  dueDate: Date | null;
}) {
  const user = getCurrentUser();
  const last = await prisma.task.findFirst({
    where: { ownerId: user.id, statusId: input.statusId },
    orderBy: { position: "desc" },
  });
  const position = (last?.position ?? 0) + 1024;
  return prisma.task.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      statusId: input.statusId,
      duration: input.duration,
      priority: input.priority,
      dueDate: input.dueDate,
      position,
      ownerId: user.id,
    },
  });
}

export async function updateTask(
  id: string,
  patch: {
    title?: string;
    description?: string | null;
    statusId?: string;
    duration?: Duration;
    priority?: Priority;
    dueDate?: Date | null;
  }
) {
  const user = getCurrentUser();
  return prisma.task.update({
    where: { id, ownerId: user.id },
    data: patch,
  });
}

export async function deleteTask(id: string) {
  const user = getCurrentUser();
  return prisma.task.delete({ where: { id, ownerId: user.id } });
}

/**
 * Move a task to a target status, inserting at the given index in that column.
 * Uses fractional positions; rebalances only when neighbors collide.
 */
export async function moveTask(input: {
  id: string;
  targetStatusId: string;
  targetIndex: number;
}) {
  const user = getCurrentUser();
  const { id, targetStatusId, targetIndex } = input;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.ownerId !== user.id) throw new Error("Not found");

  const colTasks = await prisma.task.findMany({
    where: { ownerId: user.id, statusId: targetStatusId, NOT: { id } },
    orderBy: { position: "asc" },
  });

  const before = colTasks[targetIndex - 1];
  const after = colTasks[targetIndex];

  let newPosition: number;
  if (!before && !after) newPosition = 1024;
  else if (!before && after) newPosition = after.position - 1024;
  else if (before && !after) newPosition = before.position + 1024;
  else newPosition = (before!.position + after!.position) / 2;

  const targetStatus = await prisma.status.findUnique({
    where: { id: targetStatusId },
  });
  const completedAt =
    targetStatus?.kind === "DONE" || targetStatus?.kind === "CANCELLED"
      ? new Date()
      : null;

  const updated = await prisma.task.update({
    where: { id },
    data: {
      statusId: targetStatusId,
      position: newPosition,
      completedAt,
    },
  });

  return { task: updated, statusKind: targetStatus?.kind ?? "ACTIVE" };
}
