import type { Message } from '@/schemas';
import type { Contact } from '@/schemas';
import type { Account } from '@/schemas';
import { IndexedDBAdapter } from './IndexedDBAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import type { StorageAdapter } from './StorageAdapter';

export const messageStorage: StorageAdapter<Message> = new IndexedDBAdapter<Message>(
  'peer-chat-db',
  'messages',
);

export const contactStorage: StorageAdapter<Contact> = new IndexedDBAdapter<Contact>(
  'peer-chat-db-contacts',
  'contacts',
);

export const accountStorage: StorageAdapter<Account> = new LocalStorageAdapter<Account>(
  'peer-chat-account',
);

export type { StorageAdapter } from './StorageAdapter';
