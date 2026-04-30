import { v4 as uuid } from 'uuid';
import { db } from './db';
import type { Status, Task, TerminalKind } from './types';

const LOCAL_USER_ID = 'local';

export interface MoveTaskResult {
  task: Task;
  fromTerminal: TerminalKind;
  toTerminal: TerminalKind;
}

export interface Repository {
  listTasks(): Promise<Task[]>;
  listStatuses(): Promise<Status[]>;

  createTask(input: NewTaskInput): Promise<Task>;
  updateTask(id: string, patch: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  moveTask(id: string, toStatusId: string, newSortOrder?: number): Promise<MoveTaskResult>;
  reorderTasksInStatus(statusId: string, orderedIds: string[]): Promise<void>;

  createStatus(input: NewStatusInput): Promise<Status>;
  updateStatus(id: string, patch: Partial<Status>): Promise<Status>;
  deleteStatus(id: string): Promise<void>;
  reorderStatuses(orderedIds: string[]): Promise<void>;
  countTasksInStatus(statusId: string): Promise<number>;
}

export type NewTaskInput = {
  title: string;
  description?: string;
  priority?: Task['priority'];
  estimateMinutes?: number | null;
  dueDate?: string | null;
  tags?: string[];
  statusId: string;
};

export type NewStatusInput = {
  name: string;
  color: string;
  terminalKind?: TerminalKind;
};

function nowIso() {
  return new Date().toISOString();
}

class IndexedDbRepository implements Repository {
  listTasks(): Promise<Task[]> {
    return db.tasks.toArray();
  }
  listStatuses(): Promise<Status[]> {
    return db.statuses.orderBy('order').toArray();
  }

  async createTask(input: NewTaskInput): Promise<Task> {
    const maxSort = (await db.tasks.where('statusId').equals(input.statusId).toArray())
      .reduce((m, t) => Math.max(m, t.sortOrder), -1);
    const task: Task = {
      id: uuid(),
      userId: LOCAL_USER_ID,
      title: input.title.trim(),
      description: input.description ?? '',
      priority: input.priority ?? 'med',
      estimateMinutes: input.estimateMinutes ?? null,
      dueDate: input.dueDate ?? null,
      tags: input.tags ?? [],
      statusId: input.statusId,
      sortOrder: maxSort + 1,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      completedAt: null,
    };
    await db.tasks.add(task);
    return task;
  }

  async updateTask(id: string, patch: Partial<Task>): Promise<Task> {
    const existing = await db.tasks.get(id);
    if (!existing) throw new Error(`Task ${id} not found`);
    const next: Task = { ...existing, ...patch, id, updatedAt: nowIso() };
    await db.tasks.put(next);
    return next;
  }

  async deleteTask(id: string): Promise<void> {
    await db.tasks.delete(id);
  }

  async moveTask(id: string, toStatusId: string, newSortOrder?: number): Promise<MoveTaskResult> {
    const task = await db.tasks.get(id);
    if (!task) throw new Error(`Task ${id} not found`);
    const fromStatus = await db.statuses.get(task.statusId);
    const toStatus = await db.statuses.get(toStatusId);
    if (!toStatus) throw new Error(`Status ${toStatusId} not found`);

    const fromTerminal = fromStatus?.terminalKind ?? null;
    const toTerminal = toStatus.terminalKind;

    let sortOrder = newSortOrder;
    if (sortOrder === undefined) {
      const maxSort = (await db.tasks.where('statusId').equals(toStatusId).toArray())
        .reduce((m, t) => Math.max(m, t.sortOrder), -1);
      sortOrder = maxSort + 1;
    }

    const completedAt =
      toTerminal !== null ? (task.completedAt ?? nowIso())
      : null;

    const next: Task = {
      ...task,
      statusId: toStatusId,
      sortOrder,
      completedAt,
      updatedAt: nowIso(),
    };
    await db.tasks.put(next);
    return { task: next, fromTerminal, toTerminal };
  }

  async reorderTasksInStatus(statusId: string, orderedIds: string[]): Promise<void> {
    await db.transaction('rw', db.tasks, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        const t = await db.tasks.get(orderedIds[i]);
        if (!t) continue;
        if (t.statusId !== statusId || t.sortOrder !== i) {
          await db.tasks.put({ ...t, statusId, sortOrder: i, updatedAt: nowIso() });
        }
      }
    });
  }

  async createStatus(input: NewStatusInput): Promise<Status> {
    const all = await db.statuses.toArray();
    const maxOrder = all.reduce((m, s) => Math.max(m, s.order), -1);
    const status: Status = {
      id: uuid(),
      name: input.name.trim(),
      color: input.color,
      order: maxOrder + 1,
      terminalKind: input.terminalKind ?? null,
    };
    await db.statuses.add(status);
    return status;
  }

  async updateStatus(id: string, patch: Partial<Status>): Promise<Status> {
    const existing = await db.statuses.get(id);
    if (!existing) throw new Error(`Status ${id} not found`);
    const next: Status = { ...existing, ...patch, id };
    await db.statuses.put(next);
    return next;
  }

  async deleteStatus(id: string): Promise<void> {
    const count = await this.countTasksInStatus(id);
    if (count > 0) {
      throw new Error(
        `Status has ${count} task(s). Move them to another status before deleting.`
      );
    }
    await db.statuses.delete(id);
  }

  async reorderStatuses(orderedIds: string[]): Promise<void> {
    await db.transaction('rw', db.statuses, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        const s = await db.statuses.get(orderedIds[i]);
        if (!s) continue;
        if (s.order !== i) await db.statuses.put({ ...s, order: i });
      }
    });
  }

  countTasksInStatus(statusId: string): Promise<number> {
    return db.tasks.where('statusId').equals(statusId).count();
  }
}

export const repository: Repository = new IndexedDbRepository();
