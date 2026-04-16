import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Task } from '@/types/task';
import { getStorageAdapter } from '@/storage/storageFactory';

interface TaskState {
  tasks: Task[];
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, patch: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatusId: string, newSortOrder: number) => void;
  setTasks: (tasks: Task[]) => void;
}

const idbStorage = {
  getItem: async (_name: string): Promise<string | null> => {
    const adapter = getStorageAdapter();
    const tasks = await adapter.getTasks();
    if (!tasks || tasks.length === 0) return null;
    return JSON.stringify({ state: { tasks, _hasHydrated: false } });
  },
  setItem: async (_name: string, value: string): Promise<void> => {
    const adapter = getStorageAdapter();
    const parsed = JSON.parse(value) as { state: { tasks: Task[] } };
    await adapter.saveTasks(parsed.state.tasks);
  },
  removeItem: async (_name: string): Promise<void> => {
    const adapter = getStorageAdapter();
    await adapter.saveTasks([]);
  },
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      setTasks: (tasks) => set({ tasks }),

      addTask: (task) =>
        set((s) => ({ tasks: [...s.tasks, task] })),

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
          ),
        })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      moveTask: (taskId, newStatusId, newSortOrder) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  statusId: newStatusId,
                  sortOrder: newSortOrder,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        })),
    }),
    {
      name: 'tasks',
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
