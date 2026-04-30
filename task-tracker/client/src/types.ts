export type TimeEstimate = '5m' | '15m' | '30m' | '1h' | '2h' | '3h+' | 'unknown';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TimeBucket = '5m' | '15m' | '30m' | '1h' | '2-3h' | '3+h';

export interface Status {
  id: number;
  name: string;
  color: string;
  position: number;
  is_done: number;
  is_terminal: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status_id: number;
  time_estimate: TimeEstimate;
  priority: Priority;
  due_date?: string;
  created_at: string;
  updated_at: string;
  status_name?: string;
  status_color?: string;
  status_is_done?: number;
  status_is_terminal?: number;
}

export const TIME_ESTIMATE_LABELS: Record<TimeEstimate, string> = {
  '5m': '5 min',
  '15m': '15 min',
  '30m': '30 min',
  '1h': '1 hour',
  '2h': '2 hours',
  '3h+': '3+ hours',
  'unknown': 'Unknown',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-gray-700 text-gray-300',
  medium: 'bg-blue-900 text-blue-300',
  high: 'bg-orange-900 text-orange-300',
  urgent: 'bg-red-900 text-red-300',
};

export const TIME_BUCKET_LABELS: Record<TimeBucket, string> = {
  '5m': '5 min',
  '15m': '15 min',
  '30m': '30 min',
  '1h': '1 hour',
  '2-3h': '2–3 hours',
  '3+h': '3+ hours',
};
