import type { Task } from '@/types/task';
import type { StatusConfig } from '@/types/settings';
import { durationFitsSlot, type TimeSlot } from './duration';

function scoreTask(task: Task, statuses: StatusConfig[]): number {
  let score = 0;
  const status = statuses.find((s) => s.id === task.statusId);
  if (status) {
    score -= (statuses.length - status.sortOrder) * 10;
  }
  const priorityBonus: Record<string, number> = { high: 30, medium: 15, low: 0 };
  if (task.priority) {
    score -= priorityBonus[task.priority] ?? 0;
  }
  const ageMs = Date.now() - new Date(task.createdAt).getTime();
  const ageDays = ageMs / 86_400_000;
  score -= Math.min(ageDays * 0.5, 20);
  return score;
}

export function rankTasks(
  tasks: Task[],
  statuses: StatusConfig[],
  slot: TimeSlot
): Task[] {
  const active = statuses.filter((s) => !s.isTerminal);
  const filtered = tasks.filter((t) => {
    const status = statuses.find((s) => s.id === t.statusId);
    if (!status || status.isTerminal) return false;
    return durationFitsSlot(t.duration, slot);
  });
  return filtered
    .map((t) => ({ task: t, score: scoreTask(t, active) }))
    .sort((a, b) => a.score - b.score || a.task.sortOrder - b.task.sortOrder)
    .map(({ task }) => task);
}
