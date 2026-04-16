export const DURATIONS = ['5m', '15m', '30m', '60m', '2-3h', '3h+', 'unknown'] as const;
export type Duration = typeof DURATIONS[number];

export const DURATION_MINUTES: Record<Duration, number> = {
  '5m': 5,
  '15m': 15,
  '30m': 30,
  '60m': 60,
  '2-3h': 180,
  '3h+': Infinity,
  'unknown': -1,
};

export const DURATION_LABELS: Record<Duration, string> = {
  '5m': '5 min',
  '15m': '15 min',
  '30m': '30 min',
  '60m': '1 hour',
  '2-3h': '2–3 hours',
  '3h+': '3+ hours',
  'unknown': 'Unknown',
};

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  statusId: string;
  duration: Duration;
  priority?: Priority;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  sortOrder: number;
}
