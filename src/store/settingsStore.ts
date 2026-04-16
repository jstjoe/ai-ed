import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StatusConfig, AppSettings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';
import { getStorageAdapter } from '@/storage/storageFactory';

interface SettingsState {
  settings: AppSettings;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addStatus: (status: StatusConfig) => void;
  updateStatus: (id: string, patch: Partial<Omit<StatusConfig, 'id'>>) => void;
  deleteStatus: (id: string) => void;
  reorderStatuses: (ordered: StatusConfig[]) => void;
  setDefaultStatus: (id: string) => void;
}

const idbStorage = {
  getItem: async (_name: string): Promise<string | null> => {
    const adapter = getStorageAdapter();
    const data = await adapter.getSettings();
    return data ? JSON.stringify({ state: { settings: data, _hasHydrated: false } }) : null;
  },
  setItem: async (_name: string, value: string): Promise<void> => {
    const adapter = getStorageAdapter();
    const parsed = JSON.parse(value) as { state: { settings: AppSettings } };
    await adapter.saveSettings(parsed.state.settings);
  },
  removeItem: async (_name: string): Promise<void> => {
    const adapter = getStorageAdapter();
    await adapter.saveSettings(DEFAULT_SETTINGS);
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),

      addStatus: (status) =>
        set((s) => ({
          settings: {
            ...s.settings,
            statuses: [...s.settings.statuses, status],
          },
        })),

      updateStatus: (id, patch) =>
        set((s) => ({
          settings: {
            ...s.settings,
            statuses: s.settings.statuses.map((st) =>
              st.id === id ? { ...st, ...patch } : st
            ),
          },
        })),

      deleteStatus: (id) =>
        set((s) => ({
          settings: {
            ...s.settings,
            statuses: s.settings.statuses.filter((st) => st.id !== id),
            defaultStatusId:
              s.settings.defaultStatusId === id
                ? (s.settings.statuses.find((st) => st.id !== id)?.id ?? '')
                : s.settings.defaultStatusId,
          },
        })),

      reorderStatuses: (ordered) =>
        set((s) => ({
          settings: {
            ...s.settings,
            statuses: ordered.map((st, i) => ({ ...st, sortOrder: i })),
          },
        })),

      setDefaultStatus: (id) =>
        set((s) => ({
          settings: { ...s.settings, defaultStatusId: id },
        })),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
