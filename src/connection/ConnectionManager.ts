import Peer, { type DataConnection } from 'peerjs';
import {
  PeerMessageSchema,
  MessageSchema,
  PingContentSchema,
  type PeerMessage,
  type Message,
  type PingContent,
} from '@/schemas';
import { useChatStore } from '@/store';
import { v4 as uuidv4 } from 'uuid';
import { getIsLeader } from '@/hooks/useTabLeader';

type NotifyFn = (message: string, severity?: 'error' | 'warning' | 'info' | 'success') => void;

// ─── Debug Logger ────────────────────────────────────────────────
function logDebug(direction: 'SEND' | 'RECV', peerId: string, data: unknown) {
  const timestamp = new Date().toISOString();
  const label = direction === 'SEND' ? '📤 OUT' : '📥 IN ';
  console.debug(`[PeerChat] ${label} ${timestamp} | peer=${peerId}`, data);
}

class ConnectionManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private pingIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private pingTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private notifyFn: NotifyFn = () => {};
  private _isConnected = false;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private listeners = new Set<() => void>();

  get isConnected(): boolean {
    return this._isConnected;
  }

  setNotify(fn: NotifyFn) {
    this.notifyFn = fn;
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  // ─── Get own account info for pings ──────────────────────────
  private getOwnPingContent(): PingContent | null {
    const account = useChatStore.getState().account;
    if (!account) return null;
    return { peerId: account.id, name: account.name };
  }

  // ─── Initialize ──────────────────────────────────────────────
  async initialize(peerId: string): Promise<void> {
    if (!getIsLeader()) {
      this.notifyFn('Another tab is active. Connection disabled in this tab.', 'warning');
      return;
    }

    if (this.peer) {
      this.destroy();
    }

    return new Promise<void>((resolve, reject) => {
      this.peer = new Peer(peerId, {
        debug: 1,
      });

      this.peer.on('open', () => {
        console.debug('[PeerChat] Peer opened with id:', peerId);
        this._isConnected = true;
        this.emit();
        // Ping all existing contacts to check who's online
        this.pingAllContacts();
        resolve();
      });

      this.peer.on('connection', (conn) => {
        console.debug('[PeerChat] Incoming connection from:', conn.peer);
        this.handleIncomingConnection(conn);
      });

      this.peer.on('disconnected', () => {
        console.debug('[PeerChat] Peer disconnected');
        this._isConnected = false;
        this.emit();
        this.attemptReconnect();
      });

      this.peer.on('error', (err) => {
        console.error('[PeerChat] Peer error:', err);
        if (err.type === 'unavailable-id') {
          this.notifyFn('Peer ID already in use. Try refreshing.', 'error');
        }
        this._isConnected = false;
        this.emit();
        reject(err);
      });

      this.peer.on('close', () => {
        console.debug('[PeerChat] Peer closed');
        this._isConnected = false;
        this.emit();
      });
    });
  }

  // ─── Ping all contacts on startup ───────────────────────────
  private pingAllContacts() {
    const store = useChatStore.getState();
    const contacts = store.contacts;
    console.debug(`[PeerChat] Pinging ${contacts.length} existing contacts...`);
    for (const contact of contacts) {
      this.connectAndPing(contact.id);
    }
  }

  private connectAndPing(peerId: string) {
    this.connectToPeer(peerId)
      .then(() => {
        console.debug(`[PeerChat] Connected to ${peerId}, sending PING_SEND`);
        this.sendPing(peerId);
      })
      .catch(() => {
        console.debug(`[PeerChat] Could not reach ${peerId}, marking offline`);
        useChatStore.getState().setPeerOffline(peerId);
        this.emit();
      });
  }

  // ─── Send a ping with account info ──────────────────────────
  private sendPing(peerId: string) {
    const content = this.getOwnPingContent();
    if (!content) return;
    const msg: PeerMessage = { type: 'PING_SEND', content };
    this.sendToPeerDirect(peerId, msg);
  }

  // ─── Send a pong (ping reply) with account info ─────────────
  private sendPingReply(peerId: string) {
    const content = this.getOwnPingContent();
    if (!content) return;
    const msg: PeerMessage = { type: 'PING_RECEIVE', content };
    this.sendToPeerDirect(peerId, msg);
  }

  private attemptReconnect() {
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      if (this.peer && !this.peer.destroyed && !this.peer.disconnected) return;
      if (this.peer && !this.peer.destroyed) {
        console.debug('[PeerChat] Attempting reconnect...');
        this.peer.reconnect();
      }
    }, 3000);
  }

  private handleIncomingConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.registerConnection(conn);
    });

    conn.on('error', (err) => {
      console.error('[PeerChat] Incoming connection error:', err);
    });
  }

  private registerConnection(conn: DataConnection) {
    const peerId = conn.peer;
    // Close existing connection to same peer
    const existing = this.connections.get(peerId);
    if (existing && existing !== conn) {
      existing.close();
    }

    this.connections.set(peerId, conn);
    useChatStore.getState().setPeerOnline(peerId);
    this.startPing(peerId);
    this.emit();

    conn.on('data', (data) => {
      logDebug('RECV', peerId, data);
      this.handleMessage(peerId, data);
    });

    conn.on('close', () => {
      console.debug(`[PeerChat] Connection closed: ${peerId}`);
      this.connections.delete(peerId);
      this.stopPing(peerId);
      this.clearPingTimeout(peerId);
      useChatStore.getState().setPeerOffline(peerId);
      this.emit();
    });

    conn.on('error', (err) => {
      console.error(`[PeerChat] Connection error with ${peerId}:`, err);
      this.connections.delete(peerId);
      this.stopPing(peerId);
      this.clearPingTimeout(peerId);
      useChatStore.getState().setPeerOffline(peerId);
      this.emit();
    });
  }

  connectToPeer(peerId: string): Promise<DataConnection> {
    return new Promise((resolve, reject) => {
      if (!this.peer) {
        reject(new Error('Peer not initialized'));
        return;
      }

      const existing = this.connections.get(peerId);
      if (existing && existing.open) {
        resolve(existing);
        return;
      }

      console.debug(`[PeerChat] Connecting to peer: ${peerId}`);
      const conn = this.peer.connect(peerId, { reliable: true });

      conn.on('open', () => {
        this.registerConnection(conn);
        resolve(conn);
      });

      conn.on('error', (err) => {
        reject(err);
      });

      // Timeout
      setTimeout(() => {
        if (!conn.open) {
          conn.close();
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  // ─── Message handling ────────────────────────────────────────
  private handleMessage(fromPeerId: string, rawData: unknown) {
    // Validate envelope
    const envelopeResult = PeerMessageSchema.safeParse(rawData);
    if (!envelopeResult.success) {
      console.debug('[PeerChat] Invalid envelope from', fromPeerId, envelopeResult.error);
      this.notifyFn('Received invalid message format', 'error');
      this.sendToPeer(fromPeerId, {
        type: 'MESSAGE_RETURN_INVALID',
        content: { reason: 'Invalid message format' },
      });
      return;
    }

    const envelope = envelopeResult.data;

    switch (envelope.type) {
      case 'PING_SEND':
        this.handlePingSend(fromPeerId, envelope.content);
        break;

      case 'PING_RECEIVE':
        this.handlePingReceive(fromPeerId, envelope.content);
        break;

      case 'MESSAGE_SEND':
        this.handleIncomingChatMessage(fromPeerId, envelope.content);
        break;

      case 'MESSAGE_RETURN_RECEIVED': {
        const content = envelope.content as { messageId: string; receivedTimestamp: string };
        if (content?.messageId) {
          useChatStore.getState().updateMessage(content.messageId, {
            receivedTimestamp: new Date(content.receivedTimestamp),
          });
        }
        break;
      }

      case 'MESSAGE_RETURN_READ': {
        const content = envelope.content as { messageId: string; readTimestamp: string };
        if (content?.messageId) {
          useChatStore.getState().updateMessage(content.messageId, {
            readTimestamp: new Date(content.readTimestamp),
          });
        }
        break;
      }

      case 'MESSAGE_RETURN_INVALID':
        this.notifyFn('Remote peer reported invalid message', 'warning');
        break;

      default:
        break;
    }
  }

  // ─── Ping handlers ──────────────────────────────────────────
  private handlePingSend(fromPeerId: string, content: unknown) {
    const parsed = PingContentSchema.safeParse(content);
    if (parsed.success) {
      this.ensureContact(fromPeerId, parsed.data.name);
    }
    useChatStore.getState().setPeerOnline(fromPeerId);
    this.clearPingTimeout(fromPeerId);
    // Reply with our own info
    this.sendPingReply(fromPeerId);
  }

  private handlePingReceive(fromPeerId: string, content: unknown) {
    const parsed = PingContentSchema.safeParse(content);
    if (parsed.success) {
      this.ensureContact(fromPeerId, parsed.data.name);
    }
    useChatStore.getState().setPeerOnline(fromPeerId);
    this.clearPingTimeout(fromPeerId);
  }

  // ─── Auto-add or update contact from ping/message ───────────
  private ensureContact(peerId: string, name: string) {
    const store = useChatStore.getState();
    const existing = store.contacts.find((c) => c.id === peerId);
    if (!existing) {
      // Auto-add the contact
      console.debug(`[PeerChat] Auto-adding contact: ${name} (${peerId})`);
      store.addContact({
        id: peerId,
        name,
        avatar: '',
        publicKey: peerId,
      });
    } else if (existing.name !== name) {
      // Update name if it changed
      console.debug(`[PeerChat] Updating contact name: ${existing.name} → ${name} (${peerId})`);
      store.updateContact(peerId, { name });
    }
  }

  // ─── Incoming chat message ──────────────────────────────────
  private handleIncomingChatMessage(fromPeerId: string, content: unknown) {
    const result = MessageSchema.safeParse(content);
    if (!result.success) {
      this.notifyFn('Received invalid chat message', 'error');
      this.sendToPeer(fromPeerId, {
        type: 'MESSAGE_RETURN_INVALID',
        content: { reason: 'Invalid message schema' },
      });
      return;
    }

    const message = result.data;
    const now = new Date();
    const withReceived: Message = {
      ...message,
      receivedTimestamp: now,
    };

    // Auto-add contact if we don't have them yet (use peerId as fallback name)
    this.ensureContactFromMessage(fromPeerId);

    useChatStore.getState().addMessage(withReceived);

    // Send received acknowledgement
    this.sendToPeer(fromPeerId, {
      type: 'MESSAGE_RETURN_RECEIVED',
      content: { messageId: message.id, receivedTimestamp: now.toISOString() },
    });
  }

  private ensureContactFromMessage(peerId: string) {
    const store = useChatStore.getState();
    const existing = store.contacts.find((c) => c.id === peerId);
    if (!existing) {
      // We don't have this contact — add with peerId as provisional name
      // The name will be updated on the next ping exchange
      console.debug(`[PeerChat] Auto-adding contact from message: ${peerId}`);
      store.addContact({
        id: peerId,
        name: peerId.substring(0, 8),
        avatar: '',
        publicKey: peerId,
      });
      // Send a ping to get their real name
      this.sendPing(peerId);
    }
  }

  // ─── Send message ───────────────────────────────────────────
  sendMessage(receiverId: string, textContent: string): Message | null {
    const store = useChatStore.getState();
    const account = store.account;
    if (!account) {
      this.notifyFn('No account found', 'error');
      return null;
    }

    const message: Message = {
      id: uuidv4(),
      senderId: account.id,
      receiverId,
      sentTimestamp: new Date(),
      textContent,
    };

    // Validate outgoing
    const result = MessageSchema.safeParse(message);
    if (!result.success) {
      this.notifyFn('Invalid outgoing message', 'error');
      return null;
    }

    // Store in state (persists via store middleware)
    store.addMessage(result.data);

    // Send via PeerJS
    const peerMessage: PeerMessage = {
      type: 'MESSAGE_SEND',
      content: result.data,
    };
    this.sendToPeer(receiverId, peerMessage);

    return result.data;
  }

  // ─── Send helpers ───────────────────────────────────────────
  /** Send to peer, trying to connect first if no open connection */
  sendToPeer(peerId: string, message: PeerMessage) {
    const conn = this.connections.get(peerId);
    if (conn && conn.open) {
      logDebug('SEND', peerId, message);
      conn.send(message);
    } else {
      // Try to connect and send
      this.connectToPeer(peerId)
        .then((newConn) => {
          logDebug('SEND', peerId, message);
          newConn.send(message);
        })
        .catch(() => {
          console.debug(`[PeerChat] Failed to send to ${peerId} (offline)`);
          useChatStore.getState().setPeerOffline(peerId);
          this.emit();
        });
    }
  }

  /** Send directly to an already-connected peer (no connect fallback) */
  private sendToPeerDirect(peerId: string, message: PeerMessage) {
    const conn = this.connections.get(peerId);
    if (conn && conn.open) {
      logDebug('SEND', peerId, message);
      conn.send(message);
    }
  }

  // ─── Read receipts ─────────────────────────────────────────
  markMessagesAsRead(contactId: string) {
    const store = useChatStore.getState();
    const account = store.account;
    if (!account) return;

    const unread = store.messages.filter(
      (m) => m.senderId === contactId && m.receiverId === account.id && !m.readTimestamp,
    );

    const now = new Date();
    for (const msg of unread) {
      store.updateMessage(msg.id, { readTimestamp: now });
      this.sendToPeer(contactId, {
        type: 'MESSAGE_RETURN_READ',
        content: { messageId: msg.id, readTimestamp: now.toISOString() },
      });
    }
  }

  // ─── Ping interval management ──────────────────────────────
  private startPing(peerId: string) {
    this.stopPing(peerId);
    // Send an initial ping immediately
    this.sendPing(peerId);

    const interval = setInterval(() => {
      const conn = this.connections.get(peerId);
      if (conn && conn.open) {
        this.sendPing(peerId);
        // Set a timeout — if no PING_RECEIVE comes back, mark offline
        this.setPingTimeout(peerId);
      } else {
        this.stopPing(peerId);
        useChatStore.getState().setPeerOffline(peerId);
        this.emit();
      }
    }, 15000);
    this.pingIntervals.set(peerId, interval);
  }

  private stopPing(peerId: string) {
    const interval = this.pingIntervals.get(peerId);
    if (interval) {
      clearInterval(interval);
      this.pingIntervals.delete(peerId);
    }
    this.clearPingTimeout(peerId);
  }

  private setPingTimeout(peerId: string) {
    this.clearPingTimeout(peerId);
    const timeout = setTimeout(() => {
      console.debug(`[PeerChat] Ping timeout for ${peerId}, marking offline`);
      useChatStore.getState().setPeerOffline(peerId);
      this.emit();
      // Close the stale connection
      const conn = this.connections.get(peerId);
      if (conn) {
        conn.close();
        this.connections.delete(peerId);
      }
      this.stopPing(peerId);
    }, 10000); // 10 second timeout for pong response
    this.pingTimeouts.set(peerId, timeout);
  }

  private clearPingTimeout(peerId: string) {
    const timeout = this.pingTimeouts.get(peerId);
    if (timeout) {
      clearTimeout(timeout);
      this.pingTimeouts.delete(peerId);
    }
  }

  // ─── Utility ───────────────────────────────────────────────
  getConnectedPeers(): string[] {
    return Array.from(this.connections.keys());
  }

  isConnectedToPeer(peerId: string): boolean {
    const conn = this.connections.get(peerId);
    return !!conn && conn.open;
  }

  destroy() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.pingIntervals.forEach((interval) => clearInterval(interval));
    this.pingIntervals.clear();
    this.pingTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.pingTimeouts.clear();
    this.connections.forEach((conn) => conn.close());
    this.connections.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this._isConnected = false;
    this.emit();
  }
}

// Singleton
export const connectionManager = new ConnectionManager();
