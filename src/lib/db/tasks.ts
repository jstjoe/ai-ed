import { prisma } from "./client";
import { getCurrentUser } from "../auth";
import type { Duration, Priority } from "../duration";

const POSITION_STEP = 1024;
// If the gap between neighbors collapses below this, rebalance the column.
const COLLAPSE_THRESHOLD = 1e-6;

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
  const position = (last?.position ?? 0) + POSITION_STEP;
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
 * Move a task to `targetStatusId`, inserting at `targetIndex` within that
 * column. Runs in a single transaction so concurrent moves can't read stale
 * positions. Falls back to a column rebalance if the fractional gap collapses.
 */
export async function moveTask(input: {
  id: string;
  targetStatusId: string;
  targetIndex: number;
}) {
  const user = getCurrentUser();
  const { id, targetStatusId, targetIndex } = input;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.task.findUnique({ where: { id } });
    if (!existing || existing.ownerId !== user.id) {
      throw new Error("Task not found.");
    }

    const targetStatus = await tx.status.findUnique({
      where: { id: targetStatusId },
    });
    if (!targetStatus) throw new Error("Target status not found.");

    const colTasks = await tx.task.findMany({
      where: { ownerId: user.id, statusId: targetStatusId, NOT: { id } },
      orderBy: { position: "asc" },
    });

    const before = colTasks[targetIndex - 1];
    const after = colTasks[targetIndex];

    let newPosition: number;
    if (!before && !after) newPosition = POSITION_STEP;
    else if (!before && after) newPosition = after.position - POSITION_STEP;
    else if (before && !after) newPosition = before.position + POSITION_STEP;
    else newPosition = (before!.position + after!.position) / 2;

    const completedAt =
      targetStatus.kind === "DONE" || targetStatus.kind === "CANCELLED"
        ? new Date()
        : null;

    // Detect fractional collapse — if newPosition coincides with a neighbor
    // (or rounds to the same float), rebalance the destination column.
    const collidesBefore =
      before !== undefined &&
      Math.abs(newPosition - before.position) < COLLAPSE_THRESHOLD;
    const collidesAfter =
      after !== undefined &&
      Math.abs(newPosition - after.position) < COLLAPSE_THRESHOLD;

    if (collidesBefore || collidesAfter) {
      // Build the desired final order of the column (with the moved task
      // inserted) and reassign clean integer positions.
      const ordered = [...colTasks];
      ordered.splice(targetIndex, 0, { ...existing, statusId: targetStatusId });
      await Promise.all(
        ordered.map((t, idx) =>
          tx.task.update({
            where: { id: t.id },
            data: {
              position: (idx + 1) * POSITION_STEP,
              ...(t.id === id
                ? { statusId: targetStatusId, completedAt }
                : {}),
            },
          })
        )
      );
      const updated = await tx.task.findUniqueOrThrow({ where: { id } });
      return { task: updated, statusKind: targetStatus.kind };
    }

    const updated = await tx.task.update({
      where: { id },
      data: {
        statusId: targetStatusId,
        position: newPosition,
        completedAt,
      },
    });

    return { task: updated, statusKind: targetStatus.kind };
  });
}
