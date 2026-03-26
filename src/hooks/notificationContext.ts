import { createContext, useContext } from 'react';
import type { AlertColor } from '@mui/material';

export interface NotificationContextType {
  notify: (message: string, severity?: AlertColor) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  notify: () => {},
});

export function useNotification() {
  return useContext(NotificationContext);
}
