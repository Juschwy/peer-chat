import { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Tooltip,
  TextField,
  Divider,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import type { Contact } from '@/schemas/contact';
import { useChatStore } from '@/store/chatStore';
import { useNotification } from '@/hooks/notificationContext';
import { OnlineAvatar } from './OnlineAvatar';

interface ContactInfoDialogProps {
  open: boolean;
  onClose: () => void;
  contact: Contact;
  online: boolean;
}

export function ContactInfoDialog({ open, onClose, contact, online }: ContactInfoDialogProps) {
  const { notify } = useNotification();
  const updateContact = useChatStore((s) => s.updateContact);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameValue, setNicknameValue] = useState('');

  // Reset nickname value when dialog opens (without useEffect + setState)
  const prevOpenRef = useRef(false);
  if (open && !prevOpenRef.current) {
    setNicknameValue(contact.nickname ?? '');
    setEditingNickname(false);
  }
  prevOpenRef.current = open;

  const displayName = contact.nickname || contact.name;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contact.id);
      notify('Peer ID copied to clipboard!', 'success');
    } catch {
      notify('Failed to copy', 'error');
    }
  };

  const handleSaveNickname = async () => {
    const trimmed = nicknameValue.trim();
    await updateContact(contact.id, { nickname: trimmed || undefined });
    setEditingNickname(false);
    if (trimmed) {
      notify(`Nickname set to "${trimmed}"`, 'success');
    } else {
      notify('Nickname removed', 'info');
    }
  };

  const handleCancelEdit = () => {
    setNicknameValue(contact.nickname ?? '');
    setEditingNickname(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Contact Info</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
          <OnlineAvatar name={displayName} avatar={contact.avatar} online={online} size={80} />

          {/* Display name (nickname or name) */}
          <Typography variant="h6">{displayName}</Typography>

          {/* Original name if nickname is set */}
          {contact.nickname && (
            <Typography variant="body2" color="text.secondary">
              {contact.name}
            </Typography>
          )}

          {/* Online status */}
          <Typography
            variant="caption"
            color={online ? 'success.main' : 'text.disabled'}
            sx={{ fontWeight: 600 }}
          >
            {online ? '● Online' : '● Offline'}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Nickname edit */}
        <Box sx={{ py: 1 }}>
            <Typography
                variant="caption"
                color="text.secondary"
                gutterBottom
                sx={{display: 'block'}}
            >
            Nickname
          </Typography>
          {editingNickname ? (
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Set a nickname…"
                value={nicknameValue}
                onChange={(e) => setNicknameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveNickname();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                autoFocus
              />
              <IconButton size="small" color="primary" onClick={handleSaveNickname}>
                <CheckIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleCancelEdit}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">{contact.nickname || '—'}</Typography>
              <IconButton size="small" onClick={() => setEditingNickname(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Username (remote name) */}
        <Box sx={{ py: 1 }}>
            <Typography
                variant="caption"
                color="text.secondary"
                gutterBottom
                sx={{display: 'block'}}
            >
            Username
          </Typography>
          <Typography variant="body2">{contact.name}</Typography>
        </Box>

        {/* Peer ID */}
        <Box sx={{ py: 1 }}>
            <Typography
                variant="caption"
                color="text.secondary"
                gutterBottom
                sx={{display: 'block'}}
            >
            Peer ID
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              variant="body2"
              sx={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}
            >
              {contact.id}
            </Typography>
            <Tooltip title="Copy Peer ID">
              <IconButton size="small" onClick={handleCopy}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
