import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import { useChatStore } from '@/store/chatStore';
import { useNotification } from '@/hooks/notificationContext';
import { ContactSchema } from '@/schemas/contact';
import { connectionManager } from '@/connection/ConnectionManager';

interface AddContactDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddContactDialog({ open, onClose }: AddContactDialogProps) {
  const [peerId, setPeerId] = useState('');
  const [nickname, setNickname] = useState('');
  const addContact = useChatStore((s) => s.addContact);
  const { notify } = useNotification();

  const handleAdd = async () => {
    const trimmedId = peerId.trim();
    if (!trimmedId) {
      notify('Please enter a Peer ID', 'warning');
      return;
    }

    const trimmedNickname = nickname.trim();

    try {
      const contact = ContactSchema.parse({
        id: trimmedId,
          name: trimmedId.substring(0, 8), // Provisional name, will be updated by ping
        nickname: trimmedNickname || undefined,
        avatar: '',
        publicKey: trimmedId,
      });
      await addContact(contact);

      // Try to connect to the peer to get their real name via ping
      connectionManager.connectToPeer(trimmedId).catch(() => {
        // Peer might be offline
      });

      notify('Contact added! Connecting…', 'success');
      setPeerId('');
      setNickname('');
      onClose();
    } catch {
      notify('Invalid contact data', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add Contact</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Peer ID"
          fullWidth
          variant="outlined"
          value={peerId}
          onChange={(e) => setPeerId(e.target.value)}
          helperText="Enter the other person's Peer ID"
        />
        <TextField
          margin="dense"
          label="Nickname (optional)"
          fullWidth
          variant="outlined"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          helperText="Give them a custom name, or leave blank"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Their username will be fetched automatically when they come online.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
