import { createTheme, type ThemeOptions } from '@mui/material';

const shared: ThemeOptions = {
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
    h4: { fontWeight: 600, letterSpacing: '-0.02em', fontSize: '1.5rem' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em', fontSize: '1.25rem' },
    h6: { fontWeight: 600, letterSpacing: '-0.005em', fontSize: '1rem' },
    subtitle1: { fontWeight: 600, fontSize: '0.875rem' },
    body1: { fontSize: '0.875rem' },
    body2: { fontSize: '0.8125rem' },
    caption: { fontSize: '0.75rem' },
    button: { textTransform: 'none', fontWeight: 500, fontSize: '0.875rem' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 6, padding: '5px 16px', fontWeight: 500 },
        sizeLarge: { padding: '8px 20px' },
        sizeSmall: { padding: '3px 12px', fontSize: '0.8125rem' },
        outlined: {
          borderColor: 'var(--mui-palette-divider)',
        },
      },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: { borderRadius: 8, backgroundImage: 'none' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 12, backgroundImage: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 20, fontWeight: 500, fontSize: '0.75rem' } },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { borderRadius: 6, marginLeft: 4, marginRight: 4 },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'var(--mui-palette-divider)' },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: '0.75rem', borderRadius: 6 },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: { padding: 8 },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...shared,
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: {
      main: '#0969da',
      light: '#54aeff',
      dark: '#0550ae',
    },
    secondary: {
      main: '#6e7781',
    },
    background: {
      default: '#f6f8fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2328',
      secondary: '#656d76',
    },
    divider: '#d1d9e0',
    success: {
      main: '#1a7f37',
    },
    error: {
      main: '#d1242f',
    },
    warning: {
      main: '#9a6700',
    },
    action: {
      hover: 'rgba(208, 215, 222, 0.32)',
      selected: 'rgba(208, 215, 222, 0.48)',
    },
  },
});

export const darkTheme = createTheme({
  ...shared,
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: {
      main: '#4493f8',
      light: '#6cb6ff',
      dark: '#388bfd',
    },
    secondary: {
      main: '#8b949e',
    },
    background: {
      default: '#0d1117',
      paper: '#151b23',
    },
    text: {
      primary: '#e6edf3',
      secondary: '#8b949e',
    },
    divider: '#3d444d',
    success: {
      main: '#3fb950',
    },
    error: {
      main: '#f85149',
    },
    warning: {
      main: '#d29922',
    },
    action: {
      hover: 'rgba(177, 186, 196, 0.12)',
      selected: 'rgba(177, 186, 196, 0.2)',
    },
  },
});
