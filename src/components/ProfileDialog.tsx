import { useState } from 'react';
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
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useChatStore } from '@/store';
import { useNotification } from '@/hooks';
import { UserAvatar } from './UserAvatar';

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileDialog({ open, onClose }: ProfileDialogProps) {
  const account = useChatStore((s) => s.account);
  const { notify } = useNotification();
  const [copied, setCopied] = useState(false);

  if (!account) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(account.id);
      setCopied(true);
      notify('Peer ID copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify('Failed to copy', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>My Profile</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
          <UserAvatar name={account.name} size={80} />
          <Typography variant="h6">{account.name}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {account.id}
            </Typography>
            <Tooltip title={copied ? 'Copied!' : 'Copy Peer ID'}>
              <IconButton size="small" onClick={handleCopy}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Share your Peer ID with others so they can connect with you.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
