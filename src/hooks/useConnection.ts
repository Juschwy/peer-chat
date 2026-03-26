import { useEffect, useSyncExternalStore } from 'react';
import { connectionManager } from '@/connection';
import { useChatStore } from '@/store';
import { useNotification } from '@/hooks/notificationContext';
import { useIsLeaderTab } from '@/hooks/useTabLeader';

export function useConnection() {
  const account = useChatStore((s) => s.account);
  const { notify } = useNotification();
  const isLeader = useIsLeaderTab();

  const isConnected = useSyncExternalStore(
    (cb) => connectionManager.subscribe(cb),
    () => connectionManager.isConnected,
  );

  useEffect(() => {
    connectionManager.setNotify(notify);
  }, [notify]);

  useEffect(() => {
    if (!account || !isLeader) return;

    connectionManager.initialize(account.id).catch((err) => {
      console.error('Failed to initialize peer:', err);
    });

    return () => {
      connectionManager.destroy();
    };
  }, [account, isLeader]);

  return { isConnected, isLeader };
}
