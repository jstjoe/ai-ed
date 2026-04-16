import { IndexedDBAdapter } from './IndexedDBAdapter';
import type { IStorageAdapter } from './StorageAdapter';

let instance: IStorageAdapter | null = null;

export function getStorageAdapter(): IStorageAdapter {
  if (!instance) {
    instance = new IndexedDBAdapter();
  }
  return instance;
}
