import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useThemeStore } from '@/store';

export function MobileTopBar() {
  const themeMode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar variant="dense">
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          Peer Chat
        </Typography>
        <IconButton onClick={toggleTheme} size="small">
          {themeMode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
