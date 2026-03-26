export interface StorageAdapter<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  getAll(): Promise<T[]>;
  query(fn: (item: T) => boolean): Promise<T[]>;
}
