import { useNavigate } from '@tanstack/react-router';
import { Box, IconButton, Tooltip } from '@mui/material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PhoneIcon from '@mui/icons-material/Phone';
import SettingsIcon from '@mui/icons-material/Settings';
import { OnlineAvatar } from '@/components/OnlineAvatar';
import { useChatStore } from '@/store/chatStore';

interface NavRailProps {
  isConnected: boolean;
}

export function NavRail({ isConnected }: NavRailProps) {
  const account = useChatStore((s) => s.account);
  const navigate = useNavigate();

  return (
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
        <Tooltip title="Calls" placement="right">
          <IconButton onClick={() => navigate({ to: '/calls' })} size="small">
            <PhoneIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Bottom — settings + profile */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Settings" placement="right">
          <IconButton onClick={() => navigate({ to: '/settings' })} size="small">
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        {account && (
          <Tooltip title="Profile" placement="right">
            <IconButton onClick={() => navigate({ to: '/profile' })} sx={{ p: 0.25 }}>
                <OnlineAvatar
                    name={account.name}
                    avatar={account.avatar}
                    online={isConnected}
                    size={32}
                />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}
