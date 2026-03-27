import { useMemo, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Box, List, Typography, IconButton, Divider, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useChatStore } from '@/store/chatStore';
import { ContactListItem } from '@/components/ContactListItem';
import { AddContactDialog } from '@/components/AddContactDialog';

export function Sidebar({ onSelectContact }: { onSelectContact?: () => void } = {}) {
  const contacts = useChatStore((s) => s.contacts);
  const messages = useChatStore((s) => s.messages);
  const account = useChatStore((s) => s.account);
  const onlinePeers = useChatStore((s) => s.onlinePeers);
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { chatId?: string };
  const selectedId = params.chatId;
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  // Sort contacts by last message time
  const sortedContacts = useMemo(() => {
    if (!account) return contacts;
    return [...contacts].sort((a, b) => {
      const aMessages = messages.filter(
        (m) =>
          (m.senderId === account.id && m.receiverId === a.id) ||
          (m.senderId === a.id && m.receiverId === account.id),
      );
      const bMessages = messages.filter(
        (m) =>
          (m.senderId === account.id && m.receiverId === b.id) ||
          (m.senderId === b.id && m.receiverId === account.id),
      );
      const aLast = aMessages.length
        ? new Date(aMessages[aMessages.length - 1].sentTimestamp).getTime()
        : 0;
      const bLast = bMessages.length
        ? new Date(bMessages[bMessages.length - 1].sentTimestamp).getTime()
        : 0;
      return bLast - aLast;
    });
  }, [contacts, messages, account]);

  const getLastMessage = (contactId: string) => {
    if (!account) return undefined;
    const contactMessages = messages.filter(
      (m) =>
        (m.senderId === account.id && m.receiverId === contactId) ||
        (m.senderId === contactId && m.receiverId === account.id),
    );
    return contactMessages.length ? contactMessages[contactMessages.length - 1] : undefined;
  };

  const getUnreadCount = (contactId: string) => {
    if (!account) return 0;
    return messages.filter(
      (m) => m.senderId === contactId && m.receiverId === account.id && !m.readTimestamp,
    ).length;
  };

  return (
    <Box
      sx={{
        width: { xs: '100%', md: 320 },
        minWidth: { xs: 'auto', md: 320 },
        borderRight: { xs: 0, md: 1 },
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          {isMobile ? 'Chats' : 'Peer Chat'}
        </Typography>
        <Tooltip title="Add Contact">
          <IconButton onClick={() => setAddOpen(true)} size="small" color="primary">
            <PersonAddIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider />
      <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
        {sortedContacts.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" variant="body2">
              No contacts yet. Add a contact to start chatting!
            </Typography>
          </Box>
        ) : (
          sortedContacts.map((contact) => (
            <ContactListItem
              key={contact.id}
              contact={contact}
              selected={selectedId === contact.id}
              online={onlinePeers.has(contact.id)}
              lastMessage={getLastMessage(contact.id)}
              unreadCount={getUnreadCount(contact.id)}
              onClick={() => {
                navigate({ to: '/chats/$chatId', params: { chatId: contact.id } });
                onSelectContact?.();
              }}
            />
          ))
        )}
      </List>
      <AddContactDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </Box>
  );
}
