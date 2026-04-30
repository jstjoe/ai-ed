import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import type { Task, TimeBucket } from '../types';

export function useTasks(whatsNextTime?: TimeBucket) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = whatsNextTime
        ? await api.tasks.whatsNext(whatsNextTime)
        : await api.tasks.list();
      setTasks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [whatsNextTime]);

  useEffect(() => { fetch(); }, [fetch]);

  return { tasks, loading, error, refetch: fetch };
}
