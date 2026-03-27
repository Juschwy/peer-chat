import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useState, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  IconButton,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { v4 as uuidv4 } from 'uuid';
import { useChatStore } from '@/store/chatStore';
import { useNotification } from '@/hooks/notificationContext';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [avatarData, setAvatarData] = useState<string | undefined>();
  const setAccount = useChatStore((s) => s.setAccount);
  const { notify } = useNotification();
  const navigate = useNavigate();
  const search = useSearch({ from: '/register' }) as { redirect?: string };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100_000) {
      notify('Image too large. Please use an image under 100KB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarData(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [notify]);

  const handleRegister = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      notify('Please enter a username', 'warning');
      return;
    }
    if (trimmed.length < 2) {
      notify('Username must be at least 2 characters', 'warning');
      return;
    }

    try {
      const account = {
        id: uuidv4(),
        name: trimmed,
        avatar: avatarData,
        privateKey: uuidv4(),
      };
      await setAccount(account);
      notify(`Welcome, ${trimmed}!`, 'success');

      // Redirect to the page the user was on before registration
      const redirectTo = search?.redirect;
      if (redirectTo && redirectTo !== '/register') {
        navigate({ to: redirectTo });
      } else {
        navigate({ to: '/chats' });
      }
    } catch {
      notify('Failed to create account', 'error');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100dvh',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', mx: 2 }}>
        <CardContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 4, alignItems: 'center' }}
        >
          <ChatIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            Peer Chat
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Decentralized peer-to-peer messaging.
            <br />
            No servers. No accounts. Just connections.
          </Typography>

          {/* Avatar picker */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={avatarData}
              sx={{ width: 80, height: 80, bgcolor: 'action.hover', fontSize: 32 }}
            >
              {username.trim() ? username.trim()[0].toUpperCase() : '?'}
            </Avatar>
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              sx={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
                width: 28,
                height: 28,
              }}
            >
              <PhotoCameraIcon sx={{ fontSize: 14 }} />
            </IconButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarSelect}
            />
          </Box>

          <TextField
            fullWidth
            label="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
            autoFocus
            size="small"
          />
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleRegister}
            disabled={!username.trim()}
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export const Route = createFileRoute('/register')({
  component: RegisterPage,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || undefined,
  }),
});

