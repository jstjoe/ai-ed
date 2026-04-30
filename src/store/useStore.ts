import { create } from 'zustand';
import { repository, type NewStatusInput, type NewTaskInput } from '../data/repository';
import { ensureSeeded } from '../data/seed';
import type { Status, Task } from '../data/types';
import { fireForTransition } from '../lib/confetti';

interface AppState {
  tasks: Task[];
  statuses: Status[];
  loaded: boolean;
  error: string | null;

  hydrate: () => Promise<void>;

  createTask: (input: NewTaskInput) => Promise<Task>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, toStatusId: string, newSortOrder?: number) => Promise<void>;
  reorderTasksInStatus: (statusId: string, orderedIds: string[]) => Promise<void>;

  createStatus: (input: NewStatusInput) => Promise<Status>;
  updateStatus: (id: string, patch: Partial<Status>) => Promise<void>;
  deleteStatus: (id: string) => Promise<void>;
  reorderStatuses: (orderedIds: string[]) => Promise<void>;

  clearError: () => void;
}

async function refresh(set: (p: Partial<AppState>) => void) {
  const [tasks, statuses] = await Promise.all([
    repository.listTasks(),
    repository.listStatuses(),
  ]);
  set({ tasks, statuses });
}

export const useStore = create<AppState>((set, get) => ({
  tasks: [],
  statuses: [],
  loaded: false,
  error: null,

  hydrate: async () => {
    if (get().loaded) return;
    await ensureSeeded();
    await refresh(set);
    set({ loaded: true });
  },

  createTask: async (input) => {
    const task = await repository.createTask(input);
    await refresh(set);
    return task;
  },

  updateTask: async (id, patch) => {
    await repository.updateTask(id, patch);
    await refresh(set);
  },

  deleteTask: async (id) => {
    await repository.deleteTask(id);
    await refresh(set);
  },

  moveTask: async (id, toStatusId, newSortOrder) => {
    const result = await repository.moveTask(id, toStatusId, newSortOrder);
    fireForTransition(result.fromTerminal, result.toTerminal);
    await refresh(set);
  },

  reorderTasksInStatus: async (statusId, orderedIds) => {
    await repository.reorderTasksInStatus(statusId, orderedIds);
    await refresh(set);
  },

  createStatus: async (input) => {
    const status = await repository.createStatus(input);
    await refresh(set);
    return status;
  },

  updateStatus: async (id, patch) => {
    await repository.updateStatus(id, patch);
    await refresh(set);
  },

  deleteStatus: async (id) => {
    try {
      await repository.deleteStatus(id);
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
    await refresh(set);
  },

  reorderStatuses: async (orderedIds) => {
    await repository.reorderStatuses(orderedIds);
    await refresh(set);
  },

  clearError: () => set({ error: null }),
}));
