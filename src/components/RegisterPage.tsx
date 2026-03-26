import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { v4 as uuidv4 } from 'uuid';
import { useChatStore } from '@/store';
import { useNotification } from '@/hooks';

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const setAccount = useChatStore((s) => s.setAccount);
  const { notify } = useNotification();
  const navigate = useNavigate();

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
        privateKey: uuidv4(),
      };
      await setAccount(account);
      notify(`Welcome, ${trimmed}!`, 'success');
      navigate({ to: '/chats' });
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
          <ChatIcon sx={{ fontSize: 56, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            Peer Chat
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Decentralized peer-to-peer messaging.
            <br />
            No servers. No accounts. Just connections.
          </Typography>
          <TextField
            fullWidth
            label="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
            autoFocus
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
