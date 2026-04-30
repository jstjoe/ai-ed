import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import type { Status } from '../types';

export function useStatuses() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.statuses.list();
      setStatuses(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load statuses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { statuses, loading, error, refetch: fetch };
}
