import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { useChatStore } from '@/store';
import { useNotification } from '@/hooks';
import { ContactSchema } from '@/schemas';
import { connectionManager } from '@/connection';

interface AddContactDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddContactDialog({ open, onClose }: AddContactDialogProps) {
  const [peerId, setPeerId] = useState('');
  const [name, setName] = useState('');
  const addContact = useChatStore((s) => s.addContact);
  const { notify } = useNotification();

  const handleAdd = async () => {
    const trimmedId = peerId.trim();
    const trimmedName = name.trim();
    if (!trimmedId || !trimmedName) {
      notify('Please fill in all fields', 'warning');
      return;
    }

    try {
      const contact = ContactSchema.parse({
        id: trimmedId,
        name: trimmedName,
        avatar: '',
        publicKey: trimmedId,
      });
      await addContact(contact);

      // Try to connect to the peer
      connectionManager.connectToPeer(trimmedId).catch(() => {
        // Peer might be offline
      });

      notify(`Contact "${trimmedName}" added!`, 'success');
      setPeerId('');
      setName('');
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
          label="Display Name"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
