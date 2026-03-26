import { CssBaseline, ThemeProvider } from '@mui/material';
import { NotificationProvider } from '@/hooks/useNotification';
import { useThemeStore } from '@/store';
import { lightTheme, darkTheme } from '@/theme';
import { App } from '@/App.tsx';

export function Root() {
  const mode = useThemeStore((s) => s.mode);
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </ThemeProvider>
  );
}
