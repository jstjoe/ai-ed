export type Priority = 'low' | 'med' | 'high';

export type TerminalKind = 'done' | 'cancelled' | null;

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: Priority;
  estimateMinutes: number | null;
  dueDate: string | null;
  tags: string[];
  statusId: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface Status {
  id: string;
  name: string;
  color: string;
  order: number;
  terminalKind: TerminalKind;
}
