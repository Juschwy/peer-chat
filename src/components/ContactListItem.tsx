import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Typography,
} from '@mui/material';
import { OnlineAvatar } from './OnlineAvatar';
import type { Contact, Message } from '@/schemas';
import { useMemo } from 'react';

interface ContactListItemProps {
  contact: Contact;
  selected: boolean;
  online: boolean;
  lastMessage?: Message;
  unreadCount: number;
  onClick: () => void;
}

export function ContactListItem({
  contact,
  selected,
  online,
  lastMessage,
  unreadCount,
  onClick,
}: ContactListItemProps) {
  const displayName = contact.nickname || contact.name;

  const preview = useMemo(() => {
    if (!lastMessage) return 'No messages yet';
    const text = lastMessage.textContent;
    return text.length > 35 ? text.slice(0, 35) + '…' : text;
  }, [lastMessage]);

  const time = useMemo(() => {
    if (!lastMessage) return '';
    const d = new Date(lastMessage.sentTimestamp);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }, [lastMessage]);

  return (
    <ListItem disablePadding>
      <ListItemButton selected={selected} onClick={onClick} sx={{ py: 1.5 }}>
        <ListItemAvatar>
          <OnlineAvatar name={displayName} avatar={contact.avatar} online={online} />
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography
              variant="body1"
              fontWeight={unreadCount > 0 ? 700 : 400}
              noWrap
            >
              {displayName}
            </Typography>
          }
          secondary={
            <>
              {contact.nickname && (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  noWrap
                  component="span"
                  sx={{ display: 'block', fontSize: '0.7rem' }}
                >
                  {contact.name}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" noWrap component="span" sx={{ display: 'block' }}>
                {preview}
              </Typography>
            </>
          }
        />
        {(time || unreadCount > 0) && (
          <Typography
            variant="caption"
            color={unreadCount > 0 ? 'primary' : 'text.secondary'}
            sx={{ ml: 1, whiteSpace: 'nowrap', alignSelf: 'flex-start', mt: 0.5 }}
          >
            {unreadCount > 0 && (
              <Typography
                component="span"
                variant="caption"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderRadius: '50%',
                  px: 0.75,
                  py: 0.25,
                  mr: 0.5,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                }}
              >
                {unreadCount}
              </Typography>
            )}
            {time}
          </Typography>
        )}
      </ListItemButton>
    </ListItem>
  );
}
