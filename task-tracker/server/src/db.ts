import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'tasks.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS statuses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    color       TEXT NOT NULL DEFAULT '#6b7280',
    position    INTEGER NOT NULL DEFAULT 0,
    is_done     INTEGER NOT NULL DEFAULT 0,
    is_terminal INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT NOT NULL,
    description   TEXT,
    status_id     INTEGER NOT NULL REFERENCES statuses(id),
    time_estimate TEXT NOT NULL CHECK(time_estimate IN ('5m','15m','30m','1h','2h','3h+','unknown')),
    priority      TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
    due_date      TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const statusCount = (db.prepare('SELECT COUNT(*) as c FROM statuses').get() as { c: number }).c;
if (statusCount === 0) {
  const insert = db.prepare(
    'INSERT INTO statuses (name, color, position, is_done, is_terminal) VALUES (?, ?, ?, ?, ?)'
  );
  const seedStatuses = db.transaction(() => {
    insert.run('Backlog',     '#6b7280', 0, 0, 0);
    insert.run('Todo',        '#3b82f6', 1, 0, 0);
    insert.run('In Progress', '#f59e0b', 2, 0, 0);
    insert.run('Review',      '#8b5cf6', 3, 0, 0);
    insert.run('Done',        '#22c55e', 4, 1, 0);
    insert.run('Cancelled',   '#ef4444', 5, 0, 1);
  });
  seedStatuses();
}

export default db;
