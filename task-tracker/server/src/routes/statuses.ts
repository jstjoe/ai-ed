import { Router, Request, Response } from 'express';
import db from '../db';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const statuses = db.prepare('SELECT * FROM statuses ORDER BY position ASC').all();
  res.json(statuses);
});

router.post('/', (req: Request, res: Response) => {
  const { name, color = '#6b7280', is_done = 0, is_terminal = 0 } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const maxPos = (db.prepare('SELECT MAX(position) as m FROM statuses').get() as { m: number | null }).m ?? -1;
  const stmt = db.prepare(
    'INSERT INTO statuses (name, color, position, is_done, is_terminal) VALUES (?, ?, ?, ?, ?)'
  );
  const result = stmt.run(name, color, maxPos + 1, is_done ? 1 : 0, is_terminal ? 1 : 0);
  const created = db.prepare('SELECT * FROM statuses WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

router.patch('/reorder', (req: Request, res: Response) => {
  const { ids } = req.body as { ids: number[] };
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });

  const update = db.prepare('UPDATE statuses SET position = ? WHERE id = ?');
  const reorder = db.transaction(() => {
    ids.forEach((id, index) => update.run(index, id));
  });
  reorder();
  res.json({ ok: true });
});

router.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, color, is_done, is_terminal } = req.body;

  const existing = db.prepare('SELECT * FROM statuses WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const fields: string[] = [];
  const values: unknown[] = [];

  if (name !== undefined)        { fields.push('name = ?');        values.push(name); }
  if (color !== undefined)       { fields.push('color = ?');       values.push(color); }
  if (is_done !== undefined)     { fields.push('is_done = ?');     values.push(is_done ? 1 : 0); }
  if (is_terminal !== undefined) { fields.push('is_terminal = ?'); values.push(is_terminal ? 1 : 0); }

  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

  values.push(id);
  db.prepare(`UPDATE statuses SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  const updated = db.prepare('SELECT * FROM statuses WHERE id = ?').get(id);
  res.json(updated);
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const taskCount = (
    db.prepare('SELECT COUNT(*) as c FROM tasks WHERE status_id = ?').get(id) as { c: number }
  ).c;
  if (taskCount > 0) {
    return res.status(409).json({ error: `Cannot delete: ${taskCount} task(s) use this status` });
  }
  db.prepare('DELETE FROM statuses WHERE id = ?').run(id);
  res.json({ ok: true });
});

export default router;
