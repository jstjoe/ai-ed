import { Router, Request, Response } from 'express';
import db from '../db';
import type { TimeEstimate } from '../types';

const router = Router();

const TIME_BUCKETS: Record<string, TimeEstimate[]> = {
  '5m':   ['5m', 'unknown'],
  '15m':  ['5m', '15m', 'unknown'],
  '30m':  ['5m', '15m', '30m', 'unknown'],
  '1h':   ['5m', '15m', '30m', '1h', 'unknown'],
  '2-3h': ['5m', '15m', '30m', '1h', '2h', 'unknown'],
  '3+h':  ['5m', '15m', '30m', '1h', '2h', '3h+', 'unknown'],
};

const TASK_JOIN = `
  SELECT t.*, s.name as status_name, s.color as status_color,
         s.is_done as status_is_done, s.is_terminal as status_is_terminal
  FROM tasks t
  JOIN statuses s ON t.status_id = s.id
`;

router.get('/whats-next', (req: Request, res: Response) => {
  const time = req.query.time as string;
  const bucket = TIME_BUCKETS[time];
  if (!bucket) return res.status(400).json({ error: 'Invalid time parameter' });

  const placeholders = bucket.map(() => '?').join(',');
  const tasks = db.prepare(`
    ${TASK_JOIN}
    WHERE s.is_done = 0 AND s.is_terminal = 0
      AND t.time_estimate IN (${placeholders})
    ORDER BY
      CASE t.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
      t.due_date ASC NULLS LAST,
      t.created_at ASC
  `).all(...bucket);

  res.json(tasks);
});

router.get('/', (req: Request, res: Response) => {
  const { status_id } = req.query;
  if (status_id) {
    const tasks = db.prepare(`${TASK_JOIN} WHERE t.status_id = ? ORDER BY t.created_at ASC`).all(status_id);
    return res.json(tasks);
  }
  const tasks = db.prepare(`${TASK_JOIN} ORDER BY s.position ASC, t.created_at ASC`).all();
  res.json(tasks);
});

router.get('/:id', (req: Request, res: Response) => {
  const task = db.prepare(`${TASK_JOIN} WHERE t.id = ?`).get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Not found' });
  res.json(task);
});

router.post('/', (req: Request, res: Response) => {
  const { title, description, status_id, time_estimate, priority = 'medium', due_date } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  if (!status_id) return res.status(400).json({ error: 'status_id is required' });
  if (!time_estimate) return res.status(400).json({ error: 'time_estimate is required' });

  const result = db.prepare(`
    INSERT INTO tasks (title, description, status_id, time_estimate, priority, due_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title, description ?? null, status_id, time_estimate, priority, due_date ?? null);

  const created = db.prepare(`${TASK_JOIN} WHERE t.id = ?`).get(result.lastInsertRowid);
  res.status(201).json(created);
});

router.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const allowed = ['title', 'description', 'status_id', 'time_estimate', 'priority', 'due_date'];
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const key of allowed) {
    if (key in req.body) {
      fields.push(`${key} = ?`);
      values.push(req.body[key] ?? null);
    }
  }

  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

  fields.push("updated_at = datetime('now')");
  values.push(id);
  db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  const updated = db.prepare(`${TASK_JOIN} WHERE t.id = ?`).get(id);
  res.json(updated);
});

router.delete('/:id', (req: Request, res: Response) => {
  const existing = db.prepare('SELECT id FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
