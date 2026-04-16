export interface StatusConfig {
  id: string;
  name: string;
  color: string;
  isTerminal: boolean;
  isDone: boolean;
  sortOrder: number;
}

export interface AppSettings {
  statuses: StatusConfig[];
  defaultStatusId: string;
  version: number;
}

export const DEFAULT_STATUSES: StatusConfig[] = [
  { id: 'backlog',     name: 'Backlog',      color: '#94a3b8', isTerminal: false, isDone: false, sortOrder: 0 },
  { id: 'todo',        name: 'Todo',         color: '#60a5fa', isTerminal: false, isDone: false, sortOrder: 1 },
  { id: 'in-progress', name: 'In Progress',  color: '#f59e0b', isTerminal: false, isDone: false, sortOrder: 2 },
  { id: 'in-review',   name: 'In Review',    color: '#a78bfa', isTerminal: false, isDone: false, sortOrder: 3 },
  { id: 'blocked',     name: 'Blocked',      color: '#ef4444', isTerminal: false, isDone: false, sortOrder: 4 },
  { id: 'done',        name: 'Done',         color: '#22c55e', isTerminal: true,  isDone: true,  sortOrder: 5 },
  { id: 'cancelled',   name: 'Cancelled',    color: '#f87171', isTerminal: true,  isDone: false, sortOrder: 6 },
];

export const DEFAULT_SETTINGS: AppSettings = {
  statuses: DEFAULT_STATUSES,
  defaultStatusId: 'todo',
  version: 1,
};
