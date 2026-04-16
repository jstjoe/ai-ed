export type TimeEstimate = '5m' | '15m' | '30m' | '60m' | '2-3h' | '3+h' | 'unknown';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  statusId: string;
  timeEstimate: TimeEstimate;
  priority: Priority;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Status {
  id: string;
  name: string;
  color: string;
  order: number;
  isTerminal: boolean;
  terminalType?: 'done' | 'cancelled';
}

export interface AppSettings {
  statuses: Status[];
}

export const TIME_ESTIMATES: { value: TimeEstimate; label: string; minutes: number }[] = [
  { value: '5m', label: '5 minutes', minutes: 5 },
  { value: '15m', label: '15 minutes', minutes: 15 },
  { value: '30m', label: '30 minutes', minutes: 30 },
  { value: '60m', label: '1 hour', minutes: 60 },
  { value: '2-3h', label: '2–3 hours', minutes: 150 },
  { value: '3+h', label: '3+ hours', minutes: 300 },
  { value: 'unknown', label: 'Unknown', minutes: Infinity },
];

export const TIME_BUDGETS: { value: TimeEstimate; label: string; minutes: number }[] = [
  { value: '5m', label: '5 minutes', minutes: 5 },
  { value: '15m', label: '15 minutes', minutes: 15 },
  { value: '30m', label: '30 minutes', minutes: 30 },
  { value: '60m', label: '1 hour', minutes: 60 },
  { value: '2-3h', label: '2–3 hours', minutes: 150 },
  { value: '3+h', label: '3+ hours', minutes: 300 },
];

export const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const DEFAULT_STATUSES: Status[] = [
  { id: 'backlog', name: 'Backlog', color: '#64748b', order: 0, isTerminal: false },
  { id: 'todo', name: 'To Do', color: '#3b82f6', order: 1, isTerminal: false },
  { id: 'in-progress', name: 'In Progress', color: '#f59e0b', order: 2, isTerminal: false },
  { id: 'in-review', name: 'In Review', color: '#8b5cf6', order: 3, isTerminal: false },
  { id: 'done', name: 'Done', color: '#22c55e', order: 4, isTerminal: true, terminalType: 'done' },
  { id: 'cancelled', name: 'Cancelled', color: '#ef4444', order: 5, isTerminal: true, terminalType: 'cancelled' },
];
