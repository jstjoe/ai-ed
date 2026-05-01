"use client";

import { create } from "zustand";
import { localStorageAdapter, StorageAdapter } from "./storage";
import {
  AppData,
  CURRENT_SCHEMA_VERSION,
  DEFAULT_STATUSES,
  Status,
  Task,
} from "./types";

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

type CompletionEvent = { taskId: string; kind: "done" | "cancelled" };

interface StoreState extends AppData {
  hydrated: boolean;
  /**
   * Bumped each time a task transitions into a done/cancelled status. The
   * confetti component subscribes to this and fires on change.
   */
  lastCompletion: CompletionEvent | null;

  hydrate(): Promise<void>;

  addTask(input: Omit<Task, "id" | "order" | "createdAt" | "updatedAt">): void;
  updateTask(id: string, patch: Partial<Omit<Task, "id">>): void;
  deleteTask(id: string): void;
  moveTask(id: string, statusId: string, beforeTaskId?: string | null): void;

  addStatus(name: string, color: string): void;
  updateStatus(id: string, patch: Partial<Omit<Status, "id">>): void;
  deleteStatus(id: string): void;
  reorderStatuses(orderedIds: string[]): void;
}

let adapter: StorageAdapter = localStorageAdapter;

export function setStorageAdapter(a: StorageAdapter) {
  adapter = a;
}

async function persist(state: AppData) {
  const data: AppData = {
    tasks: state.tasks,
    statuses: state.statuses,
    version: CURRENT_SCHEMA_VERSION,
  };
  await adapter.save(data);
}

export const useStore = create<StoreState>()((set, get) => ({
  tasks: [],
  statuses: DEFAULT_STATUSES.map((s) => ({ ...s })),
  version: CURRENT_SCHEMA_VERSION,
  hydrated: false,
  lastCompletion: null,

  async hydrate() {
    if (get().hydrated) return;
    const data = await adapter.load();
    set({ ...data, hydrated: true });
  },

  addTask(input) {
    const now = Date.now();
    const sameColumn = get().tasks.filter((t) => t.statusId === input.statusId);
    const order =
      sameColumn.length === 0
        ? 0
        : Math.max(...sameColumn.map((t) => t.order)) + 1;
    const task: Task = {
      id: newId(),
      ...input,
      order,
      createdAt: now,
      updatedAt: now,
    };
    const next = { ...get(), tasks: [...get().tasks, task] };
    set({ tasks: next.tasks });
    void persist(next);
  },

  updateTask(id, patch) {
    const state = get();
    const prev = state.tasks.find((t) => t.id === id);
    if (!prev) return;
    const updated: Task = { ...prev, ...patch, updatedAt: Date.now() };

    let completion: CompletionEvent | null = state.lastCompletion;
    if (patch.statusId && patch.statusId !== prev.statusId) {
      const newStatus = state.statuses.find((s) => s.id === patch.statusId);
      if (newStatus?.isDone) {
        completion = { taskId: id, kind: "done" };
        updated.completedAt = Date.now();
      } else if (newStatus?.isCancelled) {
        completion = { taskId: id, kind: "cancelled" };
        updated.completedAt = Date.now();
      } else {
        updated.completedAt = undefined;
      }
    }

    const tasks = state.tasks.map((t) => (t.id === id ? updated : t));
    set({ tasks, lastCompletion: completion });
    void persist({ ...state, tasks });
  },

  deleteTask(id) {
    const state = get();
    const tasks = state.tasks.filter((t) => t.id !== id);
    set({ tasks });
    void persist({ ...state, tasks });
  },

  moveTask(id, statusId, beforeTaskId) {
    const state = get();
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;

    const others = state.tasks.filter((t) => t.id !== id);
    const column = others
      .filter((t) => t.statusId === statusId)
      .sort((a, b) => a.order - b.order);

    let insertIndex = column.length;
    if (beforeTaskId != null) {
      const idx = column.findIndex((t) => t.id === beforeTaskId);
      if (idx >= 0) insertIndex = idx;
    }

    const reorderedColumn = [
      ...column.slice(0, insertIndex),
      { ...task, statusId },
      ...column.slice(insertIndex),
    ].map((t, i) => ({ ...t, order: i }));

    let completion: CompletionEvent | null = state.lastCompletion;
    if (statusId !== task.statusId) {
      const newStatus = state.statuses.find((s) => s.id === statusId);
      if (newStatus?.isDone) completion = { taskId: id, kind: "done" };
      else if (newStatus?.isCancelled)
        completion = { taskId: id, kind: "cancelled" };

      const movedIdx = reorderedColumn.findIndex((t) => t.id === id);
      if (movedIdx >= 0) {
        const moved = reorderedColumn[movedIdx];
        reorderedColumn[movedIdx] = {
          ...moved,
          completedAt:
            newStatus?.isDone || newStatus?.isCancelled
              ? Date.now()
              : undefined,
          updatedAt: Date.now(),
        };
      }
    }

    const otherTasks = others.filter((t) => t.statusId !== statusId);
    const tasks = [...otherTasks, ...reorderedColumn];
    set({ tasks, lastCompletion: completion });
    void persist({ ...state, tasks });
  },

  addStatus(name, color) {
    const state = get();
    const id = `status_${newId().slice(0, 8)}`;
    const statuses = [...state.statuses, { id, name, color }];
    set({ statuses });
    void persist({ ...state, statuses });
  },

  updateStatus(id, patch) {
    const state = get();
    const statuses = state.statuses.map((s) =>
      s.id === id ? { ...s, ...patch } : s,
    );
    set({ statuses });
    void persist({ ...state, statuses });
  },

  deleteStatus(id) {
    const state = get();
    if (state.statuses.length <= 1) return;
    const fallback = state.statuses.find((s) => s.id !== id)!;
    const statuses = state.statuses.filter((s) => s.id !== id);
    const tasks = state.tasks.map((t) =>
      t.statusId === id ? { ...t, statusId: fallback.id } : t,
    );
    set({ statuses, tasks });
    void persist({ ...state, statuses, tasks });
  },

  reorderStatuses(orderedIds) {
    const state = get();
    const byId = new Map(state.statuses.map((s) => [s.id, s]));
    const statuses = orderedIds
      .map((id) => byId.get(id))
      .filter((s): s is Status => Boolean(s));
    set({ statuses });
    void persist({ ...state, statuses });
  },
}));
