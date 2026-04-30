import Dexie, { type Table } from 'dexie';
import type { Task, Status } from './types';

class AppDatabase extends Dexie {
  tasks!: Table<Task, string>;
  statuses!: Table<Status, string>;

  constructor() {
    super('ai-ed-tasks');
    this.version(1).stores({
      tasks: 'id, statusId, dueDate, priority, createdAt, sortOrder',
      statuses: 'id, order',
    });
  }
}

export const db = new AppDatabase();
