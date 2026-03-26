import { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Chip, Box, useMediaQuery, useTheme } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { ProfileDialog } from './ProfileDialog';
import { useThemeStore } from '@/store';

interface AppHeaderProps {
  isConnected: boolean;
  isLeader: boolean;
}

export function AppHeader({ isConnected, isLeader }: AppHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const themeMode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar variant="dense" sx={{ gap: 0.5 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {isMobile ? 'PC' : 'Peer Chat'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {!isLeader && (
              <Chip label={isMobile ? 'Inactive' : 'Inactive tab'} color="warning" size="small" variant="outlined" />
            )}
            <Chip
              icon={isConnected ? <WifiIcon /> : <WifiOffIcon />}
              label={isConnected ? 'Online' : 'Offline'}
              color={isConnected ? 'success' : 'default'}
              size="small"
              variant="outlined"
            />
            <IconButton onClick={toggleTheme} size="small">
              {themeMode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
            <IconButton onClick={() => setProfileOpen(true)} size="small">
              <PersonIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
