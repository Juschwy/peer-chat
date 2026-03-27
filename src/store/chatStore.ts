import { create } from 'zustand';
import type { Account } from '@/schemas/account';
import type { Contact } from '@/schemas/contact';
import type { Message } from '@/schemas/message';
import type { CallRecord } from '@/schemas/callRecord';
import { AccountSchema } from '@/schemas/account';
import { ContactSchema } from '@/schemas/contact';
import { MessageSchema } from '@/schemas/message';
import { CallRecordSchema } from '@/schemas/callRecord';
import type { CallType } from '@/schemas/callRecord';
import {
  accountStorage,
  contactStorage,
  messageStorage,
  callRecordStorage,
} from '@/storage/storageInstances';

// ─── Active Call State ───────────────────────────────────────
export interface ActiveCall {
  callId: string;
  peerId: string;
  type: CallType;
  direction: 'inbound' | 'outbound';
  status: 'ringing' | 'connected';
  startedAt: Date;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

// ─── Store Interface ─────────────────────────────────────────
export interface ChatState {
  account: Account | null;
  contacts: Contact[];
  messages: Message[];
  callRecords: CallRecord[];
  activeCall: ActiveCall | null;
  onlinePeers: Set<string>;
  initialized: boolean;

  initialize: () => Promise<void>;
  setAccount: (account: Account) => Promise<void>;
  addContact: (contact: Contact) => Promise<void>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
  addMessage: (message: Message) => Promise<void>;
  updateMessage: (id: string, updates: Partial<Message>) => Promise<void>;
  getMessagesByContact: (contactId: string) => Message[];
  addCallRecord: (record: CallRecord) => Promise<void>;
  updateCallRecord: (id: string, updates: Partial<CallRecord>) => Promise<void>;
  setActiveCall: (call: ActiveCall | null) => void;
  setPeerOnline: (peerId: string) => void;
  setPeerOffline: (peerId: string) => void;
  syncState: (partial: {
    account?: Account | null;
    contacts?: Contact[];
    messages?: Message[];
    callRecords?: CallRecord[];
  }) => void;
}

// ─── Store Implementation ────────────────────────────────────
export const useChatStore = create<ChatState>()((set, get) => ({
  account: null,
  contacts: [],
  messages: [],
  callRecords: [],
  activeCall: null,
  onlinePeers: new Set<string>(),
  initialized: false,

  initialize: async () => {
    try {
      const [account, contacts, messages, callRecords] = await Promise.all([
        accountStorage.get('current'),
        contactStorage.getAll(),
        messageStorage.getAll(),
        callRecordStorage.getAll(),
      ]);

      const validAccount = account ? AccountSchema.safeParse(account) : null;
      const validContacts = contacts
        .map((c) => ContactSchema.safeParse(c))
        .filter((r) => r.success)
        .map((r) => r.data!);
      const validMessages = messages
        .map((m) => MessageSchema.safeParse(m))
        .filter((r) => r.success)
        .map((r) => r.data!);
      const validCallRecords = callRecords
        .map((c) => CallRecordSchema.safeParse(c))
        .filter((r) => r.success)
        .map((r) => r.data!);

      set({
        account: validAccount?.success ? validAccount.data : null,
        contacts: validContacts,
        messages: validMessages,
        callRecords: validCallRecords,
        initialized: true,
      });
    } catch (error) {
      console.error('Failed to initialize store:', error);
      set({ initialized: true });
    }
  },

  setAccount: async (account) => {
    const parsed = AccountSchema.parse(account);
    await accountStorage.set('current', parsed);
    set({ account: parsed });
    broadcastUpdate({ account: parsed });
  },

  addContact: async (contact) => {
    const parsed = ContactSchema.parse(contact);
    await contactStorage.set(parsed.id, parsed);
    set((s) => ({
      contacts: [...s.contacts.filter((c) => c.id !== parsed.id), parsed],
    }));
    broadcastUpdate({ contacts: get().contacts });
  },

  updateContact: async (id, updates) => {
    const existing = get().contacts.find((c) => c.id === id);
    if (!existing) return;
    const parsed = ContactSchema.parse({ ...existing, ...updates });
    await contactStorage.set(parsed.id, parsed);
    set((s) => ({
      contacts: s.contacts.map((c) => (c.id === id ? parsed : c)),
    }));
    broadcastUpdate({ contacts: get().contacts });
  },

  removeContact: async (id) => {
    await contactStorage.remove(id);
    set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) }));
    broadcastUpdate({ contacts: get().contacts });
  },

  addMessage: async (message) => {
    const parsed = MessageSchema.parse(message);
    await messageStorage.set(parsed.id, parsed);
    set((s) => ({
      messages: [...s.messages.filter((m) => m.id !== parsed.id), parsed],
    }));
    broadcastUpdate({ messages: get().messages });
  },

  updateMessage: async (id, updates) => {
    const existing = get().messages.find((m) => m.id === id);
    if (!existing) return;
    const parsed = MessageSchema.parse({ ...existing, ...updates });
    await messageStorage.set(parsed.id, parsed);
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? parsed : m)),
    }));
    broadcastUpdate({ messages: get().messages });
  },

  getMessagesByContact: (contactId) => {
    const { account, messages } = get();
    if (!account) return [];
    return messages
      .filter(
        (m) =>
          (m.senderId === account.id && m.receiverId === contactId) ||
          (m.senderId === contactId && m.receiverId === account.id),
      )
      .sort((a, b) => new Date(a.sentTimestamp).getTime() - new Date(b.sentTimestamp).getTime());
  },

  addCallRecord: async (record) => {
    const parsed = CallRecordSchema.parse(record);
    await callRecordStorage.set(parsed.id, parsed);
    set((s) => ({
      callRecords: [...s.callRecords.filter((c) => c.id !== parsed.id), parsed],
    }));
    broadcastUpdate({ callRecords: get().callRecords });
  },

  updateCallRecord: async (id, updates) => {
    const existing = get().callRecords.find((c) => c.id === id);
    if (!existing) return;
    const parsed = CallRecordSchema.parse({ ...existing, ...updates });
    await callRecordStorage.set(parsed.id, parsed);
    set((s) => ({
      callRecords: s.callRecords.map((c) => (c.id === id ? parsed : c)),
    }));
    broadcastUpdate({ callRecords: get().callRecords });
  },

  setActiveCall: (call) => set({ activeCall: call }),

  setPeerOnline: (peerId) => {
    set((s) => {
      const newSet = new Set(s.onlinePeers);
      newSet.add(peerId);
      return { onlinePeers: newSet };
    });
  },

  setPeerOffline: (peerId) => {
    set((s) => {
      const newSet = new Set(s.onlinePeers);
      newSet.delete(peerId);
      return { onlinePeers: newSet };
    });
  },

  syncState: (partial) => {
    set((s) => ({
      ...s,
      ...(partial.account !== undefined ? { account: partial.account } : {}),
      ...(partial.contacts ? { contacts: partial.contacts } : {}),
      ...(partial.messages ? { messages: partial.messages } : {}),
      ...(partial.callRecords ? { callRecords: partial.callRecords } : {}),
    }));
  },
}));

// ─── BroadcastChannel ────────────────────────────────────────
const CHANNEL_NAME = 'peer-chat-sync';
let broadcastChannel: BroadcastChannel | null = null;

try {
  broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  broadcastChannel.onmessage = (event) => {
    const data = event.data;
    if (data?.type === 'STATE_UPDATE') {
      useChatStore.getState().syncState(data.payload);
    }
  };
} catch {
  console.warn('BroadcastChannel not supported');
}

function broadcastUpdate(payload: {
  account?: Account | null;
  contacts?: Contact[];
  messages?: Message[];
  callRecords?: CallRecord[];
}) {
  try {
    broadcastChannel?.postMessage({ type: 'STATE_UPDATE', payload });
  } catch {
    /* ignore */
  }
}
