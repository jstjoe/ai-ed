import type { Task } from '@/types/task';
import type { AppSettings } from '@/types/settings';

export interface IStorageAdapter {
  getTasks(): Promise<Task[]>;
  saveTasks(tasks: Task[]): Promise<void>;
  getSettings(): Promise<AppSettings | null>;
  saveSettings(settings: AppSettings): Promise<void>;
}
