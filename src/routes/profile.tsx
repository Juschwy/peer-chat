import {createFileRoute} from '@tanstack/react-router';
import {useCallback, useRef, useState} from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import {useChatStore} from '@/store/chatStore';
import {useNotification} from '@/hooks/notificationContext';
import {ShareDialog} from '@/components/ShareDialog';
import {getInitials, stringToColor} from '@/utils/avatar';

function ProfilePage() {
  const account = useChatStore((s) => s.account);
  const setAccount = useChatStore((s) => s.setAccount);
  const { notify } = useNotification();
  const [shareOpen, setShareOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!account) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(account.id);
      notify('Peer ID copied to clipboard!', 'success');
    } catch {
      notify('Failed to copy', 'error');
    }
  };

  const handleStartEdit = () => {
    setNameValue(account.name);
    setEditingName(true);
  };

  const handleSaveName = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed.length < 2) {
      notify('Username must be at least 2 characters', 'warning');
      return;
    }
    try {
      await setAccount({ ...account, name: trimmed });
      setEditingName(false);
      notify('Username updated!', 'success');
    } catch {
      notify('Failed to update username', 'error');
    }
  };

  const handleAvatarSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 100_000) {
        notify('Image too large. Please use an image under 100KB.', 'warning');
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const data = reader.result as string;
        try {
          await setAccount({ ...account, avatar: data });
          notify('Avatar updated!', 'success');
        } catch {
          notify('Failed to update avatar', 'error');
        }
      };
      reader.readAsDataURL(file);
    },
    [account, setAccount, notify],
  );

  const handleRemoveAvatar = async () => {
    try {
      await setAccount({ ...account, avatar: undefined });
      notify('Avatar removed', 'info');
    } catch {
      notify('Failed to remove avatar', 'error');
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'auto',
        p: { xs: 2, md: 4 },
        maxWidth: 600,
        mx: 'auto',
      }}
    >
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Profile
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 3 }}>
          {/* Avatar */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
                src={account.avatar || undefined}
              sx={{
                width: 96,
                height: 96,
                bgcolor: stringToColor(account.name),
                fontSize: 36,
              }}
            >
              {getInitials(account.name)}
            </Avatar>
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
                width: 30,
                height: 30,
              }}
            >
              <PhotoCameraIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarSelect}
            />
          </Box>

          {account.avatar && (
            <Button size="small" color="error" onClick={handleRemoveAvatar}>
              Remove Avatar
            </Button>
          )}

          {/* Name */}
          {editingName ? (
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', width: '100%', maxWidth: 280 }}>
              <TextField
                size="small"
                fullWidth
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setEditingName(false);
                }}
                autoFocus
              />
              <IconButton size="small" color="primary" onClick={handleSaveName}>
                <CheckIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => setEditingName(false)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="h6" fontWeight={600}>
                {account.name}
              </Typography>
              <IconButton size="small" onClick={handleStartEdit}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ p: 0 }}>
          {/* Peer ID */}
          <Box sx={{ px: 2.5, py: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block' }}>
              Peer ID
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="body2"
                sx={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all', flex: 1 }}
              >
                {account.id}
              </Typography>
              <Tooltip title="Copy Peer ID">
                <IconButton size="small" onClick={handleCopy}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Divider />

          {/* Share */}
          <Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<QrCode2Icon />}
              onClick={() => setShareOpen(true)}
              size="small"
            >
              Share QR Code
            </Button>
          </Box>
        </CardContent>
      </Card>

      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} />
    </Box>
  );
}

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

