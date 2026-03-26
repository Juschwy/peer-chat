import { useState, useCallback, type ReactNode } from 'react';
import { Snackbar, Alert, type AlertColor } from '@mui/material';
import { NotificationContext } from './notificationContext';

interface Notification {
  id: number;
  message: string;
  severity: AlertColor;
}


let notificationId = 0;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Notification[]>([]);

  const notify = useCallback((message: string, severity: AlertColor = 'error') => {
    const id = ++notificationId;
    setQueue((prev) => [...prev, { id, message, severity }]);
  }, []);

  const handleClose = (id: number) => {
    setQueue((prev) => prev.filter((n) => n.id !== id));
  };

  const current = queue[0];

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {current && (
        <Snackbar
          open
          autoHideDuration={4000}
          onClose={() => handleClose(current.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => handleClose(current.id)}
            severity={current.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {current.message}
          </Alert>
        </Snackbar>
      )}
    </NotificationContext.Provider>
  );
}
