import Peer, {type DataConnection, type MediaConnection} from 'peerjs';
import {
  type CallAnswerContent,
  type CallOfferContent,
  type PeerMessage,
  PeerMessageSchema,
  type PingContent,
} from '@/schemas/peerMessage';
import {type FileAttachment, type Message, MessageSchema} from '@/schemas/message';
import type {CallType} from '@/schemas/callRecord';
import {useChatStore} from '@/store/chatStore';
import {v4 as uuidv4} from 'uuid';
import {getIsLeader} from '@/hooks/useTabLeader';

type NotifyFn = (message: string, severity?: 'error' | 'warning' | 'info' | 'success') => void;

// ─── Debug Logger ────────────────────────────────────────────────
function logDebug(direction: 'SEND' | 'RECV', peerId: string, data: unknown) {
  const timestamp = new Date().toISOString();
  const label = direction === 'SEND' ? '📤 OUT' : '📥 IN ';
  console.debug(`[PeerChat] ${label} ${timestamp} | peer=${peerId}`, data);
}

class ConnectionManager {
  private peer: Peer | null = null;
  private connections = new Map<string, DataConnection>();
  private pingIntervals = new Map<string, ReturnType<typeof setInterval>>();
  private pingTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
  private notifyFn: NotifyFn = () => {};
  private _isConnected = false;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private listeners = new Set<() => void>();
  private activeMediaConnection: MediaConnection | null = null;

  get isConnected(): boolean {
    return this._isConnected;
  }

  setNotify(fn: NotifyFn) {
    this.notifyFn = fn;
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  // ─── Ping Content ──────────────────────────────────────────
  private getOwnPingContent(): PingContent | null {
    const account = useChatStore.getState().account;
    if (!account) return null;
    return { peerId: account.id, name: account.name, avatar: account.avatar };
  }

  // ─── Initialize ────────────────────────────────────────────
  async initialize(peerId: string): Promise<void> {
    if (!getIsLeader()) {
      this.notifyFn('Another tab is active. Connection disabled in this tab.', 'warning');
      return;
    }
    if (this.peer) this.destroy();

    return new Promise<void>((resolve, reject) => {
      this.peer = new Peer(peerId, { debug: 1 });

      this.peer.on('open', () => {
        console.debug('[PeerChat] Peer opened:', peerId);
        this._isConnected = true;
        this.emit();
        this.pingAllContacts();
        resolve();
      });

      this.peer.on('connection', (conn) => {
        console.debug('[PeerChat] Incoming connection from:', conn.peer);
        this.setupDataConnection(conn);
      });

      this.peer.on('call', (mediaConn) => {
        console.debug('[PeerChat] Incoming media call from:', mediaConn.peer);
        this.handleIncomingCall(mediaConn);
      });

      this.peer.on('disconnected', () => {
        console.debug('[PeerChat] Peer disconnected');
        this._isConnected = false;
        this.emit();
        this.attemptReconnect();
      });

      this.peer.on('error', (err) => {
        console.error('[PeerChat] Peer error:', err);

        // Only notify for errors that are NOT "peer offline / unreachable"
        const silentTypes = new Set(['peer-unavailable', 'network', 'disconnected', 'socket-error', 'socket-closed']);
        if (!silentTypes.has(err.type)) {
          this.notifyFn(
              err.type === 'unavailable-id'
                  ? 'Peer ID already in use. Try refreshing.'
                  : `Connection error: ${err.message || err.type}`,
              'error',
          );
        }

        this._isConnected = false;
        this.emit();
        reject(err);
      });

      this.peer.on('close', () => {
        this._isConnected = false;
        this.emit();
      });
    });
  }

  // ─── Data Connection Setup ─────────────────────────────────
  private setupDataConnection(conn: DataConnection) {
    conn.on('open', () => this.registerConnection(conn));
    conn.on('error', (err) => {
      console.error('[PeerChat] Connection error:', err);
      // Don't notify — this typically means the peer went offline
      this.handleConnectionLost(conn.peer);
    });
  }

  private registerConnection(conn: DataConnection) {
    const peerId = conn.peer;
    const existing = this.connections.get(peerId);
    if (existing && existing !== conn) existing.close();

    this.connections.set(peerId, conn);
    useChatStore.getState().setPeerOnline(peerId);
    this.startPing(peerId);
    this.emit();

    conn.on('data', (data) => {
      logDebug('RECV', peerId, data);
      this.handleMessage(peerId, data);
    });

    conn.on('close', () => this.handleConnectionLost(peerId));
    conn.on('error', () => this.handleConnectionLost(peerId));
  }

  private handleConnectionLost(peerId: string) {
    this.connections.delete(peerId);
    this.stopPing(peerId);
    useChatStore.getState().setPeerOffline(peerId);
    this.emit();
  }

  connectToPeer(peerId: string): Promise<DataConnection> {
    return new Promise((resolve, reject) => {
      if (!this.peer) return reject(new Error('Peer not initialized'));

      const existing = this.connections.get(peerId);
      if (existing?.open) return resolve(existing);

      const conn = this.peer.connect(peerId, { reliable: true });
      conn.on('open', () => { this.registerConnection(conn); resolve(conn); });
      conn.on('error', reject);
      setTimeout(() => { if (!conn.open) { conn.close(); reject(new Error('Connection timeout')); } }, 10000);
    });
  }

  // ─── Ping Management ───────────────────────────────────────
  private pingAllContacts() {
    const { contacts } = useChatStore.getState();
    for (const c of contacts) this.connectAndPing(c.id);
  }

  private connectAndPing(peerId: string) {
    this.connectToPeer(peerId)
      .then(() => this.sendPing(peerId))
      .catch(() => { useChatStore.getState().setPeerOffline(peerId); this.emit(); });
  }

  private sendPing(peerId: string) {
    const content = this.getOwnPingContent();
    if (content) this.sendDirect(peerId, { type: 'PING_SEND', content });
  }

  private sendPingReply(peerId: string) {
    const content = this.getOwnPingContent();
    if (content) this.sendDirect(peerId, { type: 'PING_RECEIVE', content });
  }

  private startPing(peerId: string) {
    this.stopPing(peerId);
    this.sendPing(peerId);
    const interval = setInterval(() => {
      const conn = this.connections.get(peerId);
      if (conn?.open) {
        this.sendPing(peerId);
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
    if (interval) { clearInterval(interval); this.pingIntervals.delete(peerId); }
    this.clearPingTimeout(peerId);
  }

  private setPingTimeout(peerId: string) {
    this.clearPingTimeout(peerId);
    const timeout = setTimeout(() => {
      useChatStore.getState().setPeerOffline(peerId);
      this.emit();
      const conn = this.connections.get(peerId);
      if (conn) { conn.close(); this.connections.delete(peerId); }
      this.stopPing(peerId);
    }, 10000);
    this.pingTimeouts.set(peerId, timeout);
  }

  private clearPingTimeout(peerId: string) {
    const timeout = this.pingTimeouts.get(peerId);
    if (timeout) { clearTimeout(timeout); this.pingTimeouts.delete(peerId); }
  }

  private attemptReconnect() {
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      if (this.peer && !this.peer.destroyed && this.peer.disconnected) {
        this.peer.reconnect();
      }
    }, 3000);
  }

  // ─── Message Handling ──────────────────────────────────────
  private handleMessage(fromPeerId: string, rawData: unknown) {
    const result = PeerMessageSchema.safeParse(rawData);
    if (!result.success) {
      console.error('[PeerChat] Invalid envelope from', fromPeerId, result.error.issues);
      this.notifyFn('Received invalid message format', 'error');
      this.sendDirect(fromPeerId, { type: 'MESSAGE_RETURN_INVALID', content: { reason: 'Invalid format' } });
      return;
    }

    const { type, content } = result.data;

    switch (type) {
      case 'PING_SEND':
        this.handlePing(fromPeerId, content as PingContent, true);
        break;
      case 'PING_RECEIVE':
        this.handlePing(fromPeerId, content as PingContent, false);
        break;
      case 'MESSAGE_SEND':
        this.handleIncomingChatMessage(fromPeerId, content as Message);
        break;
      case 'MESSAGE_RETURN_RECEIVED': {
        const c = content as { messageId: string; receivedTimestamp: string };
        this.updateMessageTimestamp(c.messageId, { receivedTimestamp: new Date(c.receivedTimestamp) });
        break;
      }
      case 'MESSAGE_RETURN_READ': {
        const c = content as { messageId: string; readTimestamp: string };
        this.updateMessageTimestamp(c.messageId, { readTimestamp: new Date(c.readTimestamp) });
        break;
      }
      case 'MESSAGE_RETURN_INVALID':
        this.notifyFn('Remote peer reported invalid message', 'warning');
        break;
      case 'CALL_OFFER':
        this.handleCallOffer(fromPeerId, content as CallOfferContent);
        break;
      case 'CALL_ANSWER':
        this.handleCallAnswer(fromPeerId, content as CallAnswerContent);
        break;
      case 'CALL_REJECT':
        this.handleCallReject(fromPeerId);
        break;
      case 'CALL_END':
        this.handleCallEnd(fromPeerId);
        break;
    }
  }

  private updateMessageTimestamp(messageId: string, updates: Partial<Message>) {
    const store = useChatStore.getState();
    if (store.messages.find((m) => m.id === messageId)) {
      store.updateMessage(messageId, updates);
    }
  }

  // ─── Ping Handlers ─────────────────────────────────────────
  private handlePing(fromPeerId: string, content: PingContent, isRequest: boolean) {
    this.ensureContact(fromPeerId, content.name, content.avatar);
    useChatStore.getState().setPeerOnline(fromPeerId);
    this.clearPingTimeout(fromPeerId);
    if (isRequest) this.sendPingReply(fromPeerId);
    this.resendUndeliveredMessages(fromPeerId);
  }

  private ensureContact(peerId: string, name: string, avatar?: string | null) {
    const store = useChatStore.getState();
    const existing = store.contacts.find((c) => c.id === peerId);
    if (!existing) {
      store.addContact({ id: peerId, name, avatar: avatar ?? '', publicKey: peerId });
    } else {
      const updates: Record<string, string> = {};
      if (existing.name !== name) updates.name = name;
      if (avatar && existing.avatar !== avatar) updates.avatar = avatar;
      if (Object.keys(updates).length > 0) store.updateContact(peerId, updates);
    }
  }

  // ─── Chat Message Handling ─────────────────────────────────
  private handleIncomingChatMessage(fromPeerId: string, content: Message) {
    const now = new Date();
    useChatStore.getState().addMessage({ ...content, receivedTimestamp: now });

    // Ensure we have a contact
    const store = useChatStore.getState();
    if (!store.contacts.find((c) => c.id === fromPeerId)) {
      store.addContact({ id: fromPeerId, name: fromPeerId.substring(0, 8), avatar: '', publicKey: fromPeerId });
      this.sendPing(fromPeerId);
    }

    // Send received ack
    const ack: PeerMessage = {
      type: 'MESSAGE_RETURN_RECEIVED',
      content: { messageId: content.id, receivedTimestamp: now.toISOString() },
    };
    this.sendDirect(fromPeerId, ack) || this.sendToPeer(fromPeerId, ack);
  }

  private resendUndeliveredMessages(peerId: string) {
    const { account, messages } = useChatStore.getState();
    if (!account) return;
    const undelivered = messages.filter(
      (m) => m.senderId === account.id && m.receiverId === peerId && !m.receivedTimestamp,
    );
    for (const msg of undelivered) {
      this.sendDirect(peerId, { type: 'MESSAGE_SEND', content: JSON.parse(JSON.stringify(msg)) });
    }
  }

  // ─── Send Message ──────────────────────────────────────────
  sendMessage(receiverId: string, textContent: string, attachments?: FileAttachment[]): Message | null {
    const { account } = useChatStore.getState();
    if (!account) { this.notifyFn('No account found', 'error'); return null; }

    const message: Message = {
      id: uuidv4(),
      senderId: account.id,
      receiverId,
      sentTimestamp: new Date(),
      textContent,
      attachments: attachments?.length ? attachments : undefined,
    };

    const result = MessageSchema.safeParse(message);
    if (!result.success) {
      this.notifyFn('Invalid outgoing message', 'error');
      return null;
    }

    useChatStore.getState().addMessage(result.data);
    this.sendToPeer(receiverId, { type: 'MESSAGE_SEND', content: JSON.parse(JSON.stringify(result.data)) });
    return result.data;
  }

  // ─── Read Receipts ─────────────────────────────────────────
  markMessagesAsRead(contactId: string) {
    const { account, messages } = useChatStore.getState();
    if (!account) return;

    const unread = messages.filter(
      (m) => m.senderId === contactId && m.receiverId === account.id && !m.readTimestamp,
    );
    if (!unread.length) return;

    const now = new Date();
    for (const msg of unread) {
      useChatStore.getState().updateMessage(msg.id, { readTimestamp: now });
      const ack: PeerMessage = { type: 'MESSAGE_RETURN_READ', content: { messageId: msg.id, readTimestamp: now.toISOString() } };
      this.sendDirect(contactId, ack) || this.sendToPeer(contactId, ack);
    }
  }

  // ─── Call Management ───────────────────────────────────────
  async startCall(peerId: string, callType: CallType): Promise<void> {
    if (!this.peer) { this.notifyFn('Not connected', 'error'); return; }
    const { account } = useChatStore.getState();
    if (!account) return;

    const callId = uuidv4();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video',
      });

      const mediaConn = this.peer.call(peerId, stream);
      this.activeMediaConnection = mediaConn;

      useChatStore.getState().setActiveCall({
        callId,
        peerId,
        type: callType,
        direction: 'outbound',
        status: 'ringing',
        startedAt: new Date(),
        localStream: stream,
        remoteStream: null,
      });

      useChatStore.getState().addCallRecord({
        id: callId,
        peerId,
        type: callType,
        status: 'outgoing',
        startedAt: new Date(),
        direction: 'outbound',
      });

      // Send call offer via data channel
      this.sendToPeer(peerId, { type: 'CALL_OFFER', content: { callId, callType } });

      mediaConn.on('stream', (remoteStream) => {
        const active = useChatStore.getState().activeCall;
        if (active?.callId === callId) {
          useChatStore.getState().setActiveCall({ ...active, status: 'connected', remoteStream });
        }
      });

      mediaConn.on('close', () => this.cleanupCall(callId));
      mediaConn.on('error', () => { this.notifyFn('Call error', 'error'); this.cleanupCall(callId); });
    } catch (err) {
      this.notifyFn('Could not access microphone/camera', 'error');
      console.error('[PeerChat] getUserMedia error:', err);
    }
  }

  private handleIncomingCall(mediaConn: MediaConnection) {
    // Store the media connection — we'll answer it when the user accepts
    this.activeMediaConnection = mediaConn;
    mediaConn.on('close', () => {
      const active = useChatStore.getState().activeCall;
      if (active) this.cleanupCall(active.callId);
    });
  }

  private handleCallOffer(fromPeerId: string, content: CallOfferContent) {
    const store = useChatStore.getState();
    if (store.activeCall) {
      // Already in a call — reject
      this.sendToPeer(fromPeerId, { type: 'CALL_REJECT', content: { callId: content.callId } });
      return;
    }

    store.setActiveCall({
      callId: content.callId,
      peerId: fromPeerId,
      type: content.callType,
      direction: 'inbound',
      status: 'ringing',
      startedAt: new Date(),
      localStream: null,
      remoteStream: null,
    });

    store.addCallRecord({
      id: content.callId,
      peerId: fromPeerId,
      type: content.callType,
      status: 'missed', // Will update if answered
      startedAt: new Date(),
      direction: 'inbound',
    });
  }

  async answerCall(): Promise<void> {
    const active = useChatStore.getState().activeCall;
    if (!active || active.direction !== 'inbound' || !this.activeMediaConnection) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: active.type === 'video',
      });

      this.activeMediaConnection.answer(stream);
      useChatStore.getState().setActiveCall({ ...active, status: 'connected', localStream: stream });
      useChatStore.getState().updateCallRecord(active.callId, { status: 'answered' });
      this.sendToPeer(active.peerId, { type: 'CALL_ANSWER', content: { callId: active.callId } });

      this.activeMediaConnection.on('stream', (remoteStream) => {
        const curr = useChatStore.getState().activeCall;
        if (curr?.callId === active.callId) {
          useChatStore.getState().setActiveCall({ ...curr, remoteStream });
        }
      });
    } catch {
      this.notifyFn('Could not access microphone/camera', 'error');
      this.rejectCall();
    }
  }

  rejectCall() {
    const active = useChatStore.getState().activeCall;
    if (!active) return;
    useChatStore.getState().updateCallRecord(active.callId, { status: 'rejected', endedAt: new Date() });
    this.sendToPeer(active.peerId, { type: 'CALL_REJECT', content: { callId: active.callId } });
    this.cleanupCall(active.callId);
  }

  endCall() {
    const active = useChatStore.getState().activeCall;
    if (!active) return;
    useChatStore.getState().updateCallRecord(active.callId, { endedAt: new Date() });
    this.sendToPeer(active.peerId, { type: 'CALL_END', content: { callId: active.callId } });
    this.cleanupCall(active.callId);
  }

  private handleCallAnswer(_fromPeerId: string, content: CallAnswerContent) {
    const active = useChatStore.getState().activeCall;
    if (active?.callId === content.callId) {
      useChatStore.getState().setActiveCall({ ...active, status: 'connected' });
      useChatStore.getState().updateCallRecord(active.callId, { status: 'answered' });
    }
  }

  private handleCallReject(fromPeerId: string) {
    const active = useChatStore.getState().activeCall;
    if (active?.peerId === fromPeerId) {
      useChatStore.getState().updateCallRecord(active.callId, { status: 'rejected', endedAt: new Date() });
      this.cleanupCall(active.callId);
      this.notifyFn('Call was rejected', 'info');
    }
  }

  private handleCallEnd(fromPeerId: string) {
    const active = useChatStore.getState().activeCall;
    if (active?.peerId === fromPeerId) {
      useChatStore.getState().updateCallRecord(active.callId, { endedAt: new Date() });
      this.cleanupCall(active.callId);
    }
  }

  private cleanupCall(_callId: string) {
    const active = useChatStore.getState().activeCall;
    if (active) {
      active.localStream?.getTracks().forEach((t) => t.stop());
      active.remoteStream?.getTracks().forEach((t) => t.stop());
    }
    this.activeMediaConnection?.close();
    this.activeMediaConnection = null;
    useChatStore.getState().setActiveCall(null);
  }

  // ─── Send Helpers ──────────────────────────────────────────
  sendToPeer(peerId: string, message: PeerMessage) {
    if (!this.sendDirect(peerId, message)) {
      this.connectToPeer(peerId)
        .then((conn) => { logDebug('SEND', peerId, message); conn.send(message); })
        .catch(() => { useChatStore.getState().setPeerOffline(peerId); this.emit(); });
    }
  }

  /** Returns true if sent successfully */
  private sendDirect(peerId: string, message: PeerMessage): boolean {
    const conn = this.connections.get(peerId);
    if (conn?.open) {
      logDebug('SEND', peerId, message);
      conn.send(message);
      return true;
    }
    return false;
  }

  // ─── Utility ───────────────────────────────────────────────
  getConnectedPeers(): string[] {
    return Array.from(this.connections.keys());
  }

  isConnectedToPeer(peerId: string): boolean {
    return !!this.connections.get(peerId)?.open;
  }

  destroy() {
    if (this.reconnectTimeout) { clearTimeout(this.reconnectTimeout); this.reconnectTimeout = null; }
    this.pingIntervals.forEach((i) => clearInterval(i));
    this.pingIntervals.clear();
    this.pingTimeouts.forEach((t) => clearTimeout(t));
    this.pingTimeouts.clear();
    this.connections.forEach((c) => c.close());
    this.connections.clear();
    this.cleanupCall('');
    if (this.peer) { this.peer.destroy(); this.peer = null; }
    this._isConnected = false;
    this.emit();
  }
}

export const connectionManager = new ConnectionManager();
