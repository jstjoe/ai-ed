import { v4 as uuid } from 'uuid';
import { db } from './db';
import type { Status } from './types';

const DEFAULT_STATUSES: Omit<Status, 'id'>[] = [
  { name: 'Backlog',     color: '#94a3b8', order: 0, terminalKind: null },
  { name: 'To Do',       color: '#3b82f6', order: 1, terminalKind: null },
  { name: 'In Progress', color: '#f59e0b', order: 2, terminalKind: null },
  { name: 'Blocked',     color: '#ef4444', order: 3, terminalKind: null },
  { name: 'Done',        color: '#22c55e', order: 4, terminalKind: 'done' },
  { name: 'Cancelled',   color: '#71717a', order: 5, terminalKind: 'cancelled' },
];

export async function ensureSeeded(): Promise<void> {
  const count = await db.statuses.count();
  if (count > 0) return;
  await db.statuses.bulkAdd(
    DEFAULT_STATUSES.map((s) => ({ ...s, id: uuid() }))
  );
}
