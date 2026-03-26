import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Box, IconButton, Tooltip } from '@mui/material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { OnlineAvatar } from './OnlineAvatar';
import { ProfileDialog } from './ProfileDialog';
import { useChatStore, useThemeStore } from '@/store';

interface NavRailProps {
  isConnected: boolean;
}

export function NavRail({ isConnected }: NavRailProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const account = useChatStore((s) => s.account);
  const themeMode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const navigate = useNavigate();

  return (
    <>
      <Box
        sx={{
          width: 64,
          minWidth: 64,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 1.5,
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          height: '100%',
        }}
      >
        {/* Top — nav items */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Chats" placement="right">
            <IconButton onClick={() => navigate({ to: '/chats' })} color="primary" size="small">
              <ChatBubbleIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Bottom — theme toggle + profile */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Tooltip title={themeMode === 'dark' ? 'Light mode' : 'Dark mode'} placement="right">
            <IconButton onClick={toggleTheme} size="small">
              {themeMode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          {account && (
            <Tooltip title="Profile" placement="right">
              <IconButton onClick={() => setProfileOpen(true)} sx={{ p: 0.25 }}>
                <OnlineAvatar name={account.name} online={isConnected} size={32} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
