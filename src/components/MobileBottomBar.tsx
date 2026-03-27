import { useNavigate } from '@tanstack/react-router';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PhoneIcon from '@mui/icons-material/Phone';
import { OnlineAvatar } from '@/components/OnlineAvatar';
import { useChatStore } from '@/store/chatStore';

interface MobileBottomBarProps {
  isConnected: boolean;
}

export function MobileBottomBar({ isConnected }: MobileBottomBarProps) {
  const account = useChatStore((s) => s.account);
  const navigate = useNavigate();

  const NavItem = ({ icon, label, onTap }: { icon: React.ReactNode; label: string; onTap: () => void }) => (
    <IconButton onClick={onTap} sx={{ p: 0.5 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {icon}
        <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1.2 }}>
          {label}
        </Typography>
      </Box>
    </IconButton>
  );

  return (
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
        justifyContent: 'space-around',
        pb: 'max(8px, env(safe-area-inset-bottom))',
      }}
    >
      <NavItem icon={<ChatBubbleIcon color="primary" />} label="Chats" onTap={() => navigate({ to: '/chats' })} />
      <NavItem icon={<PhoneIcon />} label="Calls" onTap={() => navigate({ to: '/calls' })} />
      <IconButton onClick={() => navigate({ to: '/profile' })} sx={{ p: 0.25 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {account ? (
            <OnlineAvatar name={account.name} avatar={account.avatar} online={isConnected} size={28} />
          ) : (
            <ChatBubbleIcon />
          )}
          <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1.2, mt: 0.25 }}>
            Profile
          </Typography>
        </Box>
      </IconButton>
    </Paper>
  );
}
