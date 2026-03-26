import type { StorageAdapter } from './StorageAdapter';

export class LocalStorageAdapter<T> implements StorageAdapter<T> {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  private key(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get(key: string): Promise<T | null> {
    const raw = localStorage.getItem(this.key(key));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: T): Promise<void> {
    localStorage.setItem(this.key(key), JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(this.key(key));
  }

  async getAll(): Promise<T[]> {
    const items: T[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(this.prefix + ':')) {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            items.push(JSON.parse(raw) as T);
          } catch {
            // skip invalid entries
          }
        }
      }
    }
    return items;
  }

  async query(fn: (item: T) => boolean): Promise<T[]> {
    const all = await this.getAll();
    return all.filter(fn);
  }
}
