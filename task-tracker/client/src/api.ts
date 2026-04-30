import type { Task, Status, TimeBucket } from './types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  tasks: {
    list: () => request<Task[]>('/api/tasks'),
    whatsNext: (time: TimeBucket) => request<Task[]>(`/api/tasks/whats-next?time=${time}`),
    get: (id: number) => request<Task>(`/api/tasks/${id}`),
    create: (data: Omit<Task, 'id' | 'created_at' | 'updated_at'>) =>
      request<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Task>) =>
      request<Task>(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) => request<{ ok: boolean }>(`/api/tasks/${id}`, { method: 'DELETE' }),
  },
  statuses: {
    list: () => request<Status[]>('/api/statuses'),
    create: (data: Omit<Status, 'id' | 'position'>) =>
      request<Status>('/api/statuses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Status>) =>
      request<Status>(`/api/statuses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    reorder: (ids: number[]) =>
      request<{ ok: boolean }>('/api/statuses/reorder', { method: 'PATCH', body: JSON.stringify({ ids }) }),
    delete: (id: number) => request<{ ok: boolean }>(`/api/statuses/${id}`, { method: 'DELETE' }),
  },
};
