import { useEffect, useMemo } from 'react';
import { Box, Typography, IconButton, useMediaQuery, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from '@tanstack/react-router';
import { useChatStore } from '@/store';
import { connectionManager } from '@/connection';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { OnlineAvatar } from './OnlineAvatar';

interface ChatAreaProps {
  chatId: string;
}

export function ChatArea({ chatId }: ChatAreaProps) {
  const account = useChatStore((s) => s.account);
  const contacts = useChatStore((s) => s.contacts);
  const messages = useChatStore((s) => s.messages);
  const onlinePeers = useChatStore((s) => s.onlinePeers);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const navigate = useNavigate();

  const contact = useMemo(
    () => contacts.find((c) => c.id === chatId),
    [contacts, chatId],
  );

  const chatMessages = useMemo(() => {
    if (!account) return [];
    return messages
      .filter(
        (m) =>
          (m.senderId === account.id && m.receiverId === chatId) ||
          (m.senderId === chatId && m.receiverId === account.id),
      )
      .sort((a, b) => new Date(a.sentTimestamp).getTime() - new Date(b.sentTimestamp).getTime());
  }, [messages, account, chatId]);

  const isOnline = onlinePeers.has(chatId);

  // Mark messages as read when chat is open
  useEffect(() => {
    if (!account) return;
    connectionManager.markMessagesAsRead(chatId);
  }, [chatId, chatMessages.length, account]);

  const handleSend = (text: string) => {
    connectionManager.sendMessage(chatId, text);
  };

  if (!contact) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Contact not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        {isMobile && (
          <IconButton size="small" onClick={() => navigate({ to: '/chats' })}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <OnlineAvatar name={contact.name} avatar={contact.avatar} online={isOnline} size={36} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {contact.name}
          </Typography>
          <Typography
            variant="caption"
            color="text.disabled"
            noWrap
            sx={{ fontFamily: 'monospace', fontSize: '0.65rem' }}
          >
            {contact.id}
          </Typography>
        </Box>
        <Typography variant="caption" color={isOnline ? 'success.main' : 'text.disabled'}>
          {isOnline ? 'Online' : 'Offline'}
        </Typography>
      </Box>

      {/* Messages */}
      <MessageList messages={chatMessages} accountId={account?.id ?? ''} />

      {/* Input */}
      <MessageInput onSend={handleSend} />
    </Box>
  );
}
