import type { Message } from '@/schemas/message';
import type { Contact } from '@/schemas/contact';
import type { Account } from '@/schemas/account';
import type { CallRecord } from '@/schemas/callRecord';
import { IndexedDBAdapter } from '@/storage/IndexedDBAdapter';
import { LocalStorageAdapter } from '@/storage/LocalStorageAdapter';
import type { StorageAdapter } from '@/storage/StorageAdapter';

export const messageStorage: StorageAdapter<Message> = new IndexedDBAdapter<Message>(
  'peer-chat-db',
  'messages',
);

export const contactStorage: StorageAdapter<Contact> = new IndexedDBAdapter<Contact>(
  'peer-chat-db-contacts',
  'contacts',
);

export const callRecordStorage: StorageAdapter<CallRecord> = new IndexedDBAdapter<CallRecord>(
  'peer-chat-db-calls',
  'calls',
);

export const accountStorage: StorageAdapter<Account> = new LocalStorageAdapter<Account>(
  'peer-chat-account',
);
