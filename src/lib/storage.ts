import { AppData, CURRENT_SCHEMA_VERSION, DEFAULT_STATUSES } from "./types";

/**
 * Storage adapter interface. The localStorage adapter is the default, but the
 * surface is shaped so a future server adapter (REST/Postgres) can drop in
 * without changes to the store.
 */
export interface StorageAdapter {
  load(): Promise<AppData>;
  save(data: AppData): Promise<void>;
}

const STORAGE_KEY = "ai-ed-tasks/v1";

const empty = (): AppData => ({
  tasks: [],
  statuses: DEFAULT_STATUSES.map((s) => ({ ...s })),
  version: CURRENT_SCHEMA_VERSION,
});

function migrate(raw: unknown): AppData {
  if (!raw || typeof raw !== "object") return empty();
  const data = raw as Partial<AppData>;
  const statuses =
    Array.isArray(data.statuses) && data.statuses.length > 0
      ? data.statuses
      : DEFAULT_STATUSES.map((s) => ({ ...s }));
  return {
    tasks: Array.isArray(data.tasks) ? data.tasks : [],
    statuses,
    version: CURRENT_SCHEMA_VERSION,
  };
}

export const localStorageAdapter: StorageAdapter = {
  async load() {
    if (typeof window === "undefined") return empty();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return empty();
      return migrate(JSON.parse(raw));
    } catch {
      return empty();
    }
  },
  async save(data) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
};
