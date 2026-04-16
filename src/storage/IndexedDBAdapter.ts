import { openDB, type IDBPDatabase } from 'idb';
import type { Task } from '@/types/task';
import type { AppSettings } from '@/types/settings';
import type { IStorageAdapter } from './StorageAdapter';

const DB_NAME = 'tasktracker';
const DB_VERSION = 1;

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    },
  });
}

export class IndexedDBAdapter implements IStorageAdapter {
  async getTasks(): Promise<Task[]> {
    const db = await getDB();
    return db.getAll('tasks');
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('tasks', 'readwrite');
    await tx.store.clear();
    await Promise.all(tasks.map((t) => tx.store.put(t)));
    await tx.done;
  }

  async getSettings(): Promise<AppSettings | null> {
    const db = await getDB();
    return db.get('settings', 'app') ?? null;
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    const db = await getDB();
    await db.put('settings', settings, 'app');
  }
}
