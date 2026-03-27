import { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import type { Message } from '@/schemas/message';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  accountId: string;
}

export function MessageList({ messages, accountId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">No messages yet. Say hello!</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === accountId} />
      ))}
      <div ref={bottomRef} />
    </Box>
  );
}
