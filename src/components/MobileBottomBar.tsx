import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { OnlineAvatar } from './OnlineAvatar';
import { ProfileDialog } from './ProfileDialog';
import { useChatStore } from '@/store';

interface MobileBottomBarProps {
  isConnected: boolean;
}

export function MobileBottomBar({ isConnected }: MobileBottomBarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const account = useChatStore((s) => s.account);
  const navigate = useNavigate();

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          px: 2,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 'max(8px, env(safe-area-inset-bottom))',
        }}
      >
        <Tooltip title="Chats">
          <IconButton onClick={() => navigate({ to: '/chats' })} color="primary">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ChatBubbleIcon />
              <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1.2 }}>
                Chats
              </Typography>
            </Box>
          </IconButton>
        </Tooltip>
        <Tooltip title="Profile">
          <IconButton onClick={() => setProfileOpen(true)} sx={{ p: 0.25 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {account ? (
                <OnlineAvatar name={account.name} online={isConnected} size={28} />
              ) : (
                <ChatBubbleIcon />
              )}
              <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1.2, mt: 0.25 }}>
                Profile
              </Typography>
            </Box>
          </IconButton>
        </Tooltip>
      </Paper>
      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
