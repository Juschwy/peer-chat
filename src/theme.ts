import { createTheme, type ThemeOptions } from '@mui/material';

const shared: ThemeOptions = {
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, padding: '8px 20px' },
        sizeLarge: { padding: '12px 24px', fontSize: '1rem' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 10 } },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { borderRadius: 8, marginLeft: 4, marginRight: 4 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(12px)',
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...shared,
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#0ea5e9',
      light: '#38bdf8',
      dark: '#0284c7',
    },
    background: {
      default: '#eef2f7',
      paper: 'rgba(255, 255, 255, 0.72)',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    divider: 'rgba(148, 163, 184, 0.2)',
    success: {
      main: '#22c55e',
    },
  },
});

export const darkTheme = createTheme({
  ...shared,
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    secondary: {
      main: '#38bdf8',
      light: '#7dd3fc',
      dark: '#0ea5e9',
    },
    background: {
      default: '#0a1628',
      paper: 'rgba(15, 30, 56, 0.75)',
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
    },
    divider: 'rgba(100, 150, 220, 0.12)',
    success: {
      main: '#4ade80',
    },
  },
});
