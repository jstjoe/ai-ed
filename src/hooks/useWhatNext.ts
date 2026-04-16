import { useMemo } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { useSettingsStore } from '@/store/settingsStore';
import { rankTasks } from '@/utils/taskRanking';
import type { TimeSlot } from '@/utils/duration';

export function useWhatNext(slot: TimeSlot) {
  const tasks = useTaskStore((s) => s.tasks);
  const statuses = useSettingsStore((s) => s.settings.statuses);

  return useMemo(
    () => rankTasks(tasks, statuses, slot),
    [tasks, statuses, slot]
  );
}

export type { TimeSlot };
