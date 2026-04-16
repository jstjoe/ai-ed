import type { Task } from '@/types/task';
import type { StatusConfig } from '@/types/settings';

export function selectTasksByStatus(tasks: Task[], statusId: string): Task[] {
  return tasks
    .filter((t) => t.statusId === statusId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function selectActiveStatuses(statuses: StatusConfig[]): StatusConfig[] {
  return [...statuses].sort((a, b) => a.sortOrder - b.sortOrder);
}
