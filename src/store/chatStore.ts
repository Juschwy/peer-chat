import { create } from 'zustand';
import type { Account, Contact, Message } from '@/schemas';
import { AccountSchema, ContactSchema, MessageSchema } from '@/schemas';
import { accountStorage, contactStorage, messageStorage } from '@/storage';

export interface ChatState {
  account: Account | null;
  contacts: Contact[];
  messages: Message[];
  onlinePeers: Set<string>;
  initialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  setAccount: (account: Account) => Promise<void>;
  addContact: (contact: Contact) => Promise<void>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
  addMessage: (message: Message) => Promise<void>;
  updateMessage: (id: string, updates: Partial<Message>) => Promise<void>;
  getMessagesByContact: (contactId: string) => Message[];
  setPeerOnline: (peerId: string) => void;
  setPeerOffline: (peerId: string) => void;

  // Sync from broadcast
  syncState: (partial: { account?: Account | null; contacts?: Contact[]; messages?: Message[] }) => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  account: null,
  contacts: [],
  messages: [],
  onlinePeers: new Set<string>(),
  initialized: false,

  initialize: async () => {
    try {
      const account = await accountStorage.get('current');
      const contacts = await contactStorage.getAll();
      const messages = await messageStorage.getAll();

      // Validate all data from storage
      const validAccount = account ? AccountSchema.safeParse(account) : null;
      const validContacts = contacts
        .map((c) => ContactSchema.safeParse(c))
        .filter((r) => r.success)
        .map((r) => r.data!);
      const validMessages = messages
        .map((m) => MessageSchema.safeParse(m))
        .filter((r) => r.success)
        .map((r) => r.data!);

      set({
        account: validAccount?.success ? validAccount.data : null,
        contacts: validContacts,
        messages: validMessages,
        initialized: true,
      });
    } catch (error) {
      console.error('Failed to initialize store:', error);
      set({ initialized: true });
    }
  },

  setAccount: async (account: Account) => {
    const parsed = AccountSchema.parse(account);
    await accountStorage.set('current', parsed);
    set({ account: parsed });
    broadcastUpdate({ account: parsed });
  },

  addContact: async (contact: Contact) => {
    const parsed = ContactSchema.parse(contact);
    await contactStorage.set(parsed.id, parsed);
    set((state) => ({
      contacts: [...state.contacts.filter((c) => c.id !== parsed.id), parsed],
    }));
    broadcastUpdate({ contacts: get().contacts });
  },

  updateContact: async (id: string, updates: Partial<Contact>) => {
    const existing = get().contacts.find((c) => c.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    const parsed = ContactSchema.parse(updated);
    await contactStorage.set(parsed.id, parsed);
    set((state) => ({
      contacts: state.contacts.map((c) => (c.id === id ? parsed : c)),
    }));
    broadcastUpdate({ contacts: get().contacts });
  },

  removeContact: async (id: string) => {
    await contactStorage.remove(id);
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== id),
    }));
    broadcastUpdate({ contacts: get().contacts });
  },

  addMessage: async (message: Message) => {
    const parsed = MessageSchema.parse(message);
    await messageStorage.set(parsed.id, parsed);
    set((state) => ({
      messages: [...state.messages.filter((m) => m.id !== parsed.id), parsed],
    }));
    broadcastUpdate({ messages: get().messages });
  },

  updateMessage: async (id: string, updates: Partial<Message>) => {
    const existing = get().messages.find((m) => m.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    const parsed = MessageSchema.parse(updated);
    await messageStorage.set(parsed.id, parsed);
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? parsed : m)),
    }));
    broadcastUpdate({ messages: get().messages });
  },

  getMessagesByContact: (contactId: string) => {
    const state = get();
    const accountId = state.account?.id;
    if (!accountId) return [];
    return state.messages
      .filter(
        (m) =>
          (m.senderId === accountId && m.receiverId === contactId) ||
          (m.senderId === contactId && m.receiverId === accountId),
      )
      .sort((a, b) => new Date(a.sentTimestamp).getTime() - new Date(b.sentTimestamp).getTime());
  },

  setPeerOnline: (peerId: string) => {
    set((state) => {
      const newSet = new Set(state.onlinePeers);
      newSet.add(peerId);
      return { onlinePeers: newSet };
    });
  },

  setPeerOffline: (peerId: string) => {
    set((state) => {
      const newSet = new Set(state.onlinePeers);
      newSet.delete(peerId);
      return { onlinePeers: newSet };
    });
  },

  syncState: (partial) => {
    set((state) => ({
      ...state,
      ...(partial.account !== undefined ? { account: partial.account } : {}),
      ...(partial.contacts ? { contacts: partial.contacts } : {}),
      ...(partial.messages ? { messages: partial.messages } : {}),
    }));
  },
}));

// BroadcastChannel for multi-tab sync
const CHANNEL_NAME = 'peer-chat-sync';
let broadcastChannel: BroadcastChannel | null = null;

try {
  broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  broadcastChannel.onmessage = (event) => {
    const data = event.data;
    if (data && data.type === 'STATE_UPDATE') {
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
}) {
  try {
    broadcastChannel?.postMessage({ type: 'STATE_UPDATE', payload });
  } catch {
    // ignore
  }
}
