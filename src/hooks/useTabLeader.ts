import { useSyncExternalStore } from 'react';

const TAB_CHANNEL = 'peer-chat-tab-leader';
const TAB_ID = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

let isLeaderState = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot() {
  return isLeaderState;
}

let channel: BroadcastChannel | null = null;

try {
  channel = new BroadcastChannel(TAB_CHANNEL);

  // On load, claim leadership
  isLeaderState = true;
  channel.postMessage({ type: 'CLAIM', tabId: TAB_ID });

  channel.onmessage = (event) => {
    const data = event.data;
    if (data.type === 'CLAIM' && data.tabId !== TAB_ID) {
      // Another tab claimed - last one to claim wins, so we become follower
      isLeaderState = false;
      notifyListeners();
    }
    if (data.type === 'RELEASE' && data.tabId !== TAB_ID) {
      // Another tab released - try to claim
      isLeaderState = true;
      channel?.postMessage({ type: 'CLAIM', tabId: TAB_ID });
      notifyListeners();
    }
  };

  window.addEventListener('beforeunload', () => {
    channel?.postMessage({ type: 'RELEASE', tabId: TAB_ID });
  });
} catch {
  isLeaderState = true;
}

export function useIsLeaderTab(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function getIsLeader(): boolean {
  return isLeaderState;
}
