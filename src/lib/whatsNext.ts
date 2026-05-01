import { Status, Task, TIME_BUCKET_BY_ID, TimeBucketId } from "./types";

const PRIORITY_WEIGHT: Record<Task["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/**
 * Returns active tasks (not done/cancelled) that fit within the given time
 * budget, sorted by priority then by oldest first.
 *
 * - If the user has `unknown` minutes available, we show everything except completed.
 * - Tasks with an `unknown` estimate are always included (they might fit).
 * - Otherwise we include tasks whose estimate <= budget.
 */
export function selectWhatsNext(
  tasks: Task[],
  statuses: Status[],
  bucketId: TimeBucketId,
  limit = 5,
): Task[] {
  const completedStatusIds = new Set(
    statuses.filter((s) => s.isDone || s.isCancelled).map((s) => s.id),
  );
  const budget = TIME_BUCKET_BY_ID[bucketId]?.minutes ?? null;

  const candidates = tasks.filter((t) => {
    if (completedStatusIds.has(t.statusId)) return false;
    if (budget == null) return true;
    const taskMinutes = TIME_BUCKET_BY_ID[t.timeEstimate]?.minutes;
    if (taskMinutes == null) return true; // unknown estimate: optimistic include
    return taskMinutes <= budget;
  });

  candidates.sort((a, b) => {
    const p = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    if (p !== 0) return p;
    return a.createdAt - b.createdAt;
  });

  return candidates.slice(0, limit);
}
