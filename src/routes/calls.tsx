import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Chip,
} from '@mui/material';
import CallMadeIcon from '@mui/icons-material/CallMade';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CallMissedIcon from '@mui/icons-material/CallMissed';
import PhoneIcon from '@mui/icons-material/Phone';
import VideocamIcon from '@mui/icons-material/Videocam';
import { useChatStore } from '@/store/chatStore';
import { UserAvatar } from '@/components/UserAvatar';
import type { CallRecord } from '@/schemas/callRecord';

function formatCallTime(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(start: Date | string, end?: Date | string) {
  if (!end) return '';
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const remSec = sec % 60;
  return `${min}m ${remSec}s`;
}

function CallStatusIcon({ record }: { record: CallRecord }) {
  if (record.status === 'missed') return <CallMissedIcon fontSize="small" color="error" />;
  if (record.status === 'rejected') return <CallMissedIcon fontSize="small" color="warning" />;
  if (record.direction === 'outbound') return <CallMadeIcon fontSize="small" color="success" />;
  return <CallReceivedIcon fontSize="small" color="success" />;
}

function CallsPage() {
  const callRecords = useChatStore((s) => s.callRecords);
  const contacts = useChatStore((s) => s.contacts);

  const sortedRecords = useMemo(
      () =>
          [...callRecords].sort(
              (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
          ),
    [callRecords],
  );

  const getContactName = (peerId: string) => {
    const contact = contacts.find((c) => c.id === peerId);
    return contact?.nickname || contact?.name || peerId.substring(0, 8);
  };

  const getContactAvatar = (peerId: string) => {
    const contact = contacts.find((c) => c.id === peerId);
    return contact?.avatar;
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Calls
        </Typography>
      </Box>

      {sortedRecords.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">No call history yet</Typography>
        </Box>
      ) : (
        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {sortedRecords.map((record) => {
            const name = getContactName(record.peerId);
            return (
              <ListItem key={record.id} disablePadding>
                <ListItemButton sx={{ py: 1.5 }}>
                  <ListItemAvatar>
                    <UserAvatar name={name} avatar={getContactAvatar(record.peerId)} size={40} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CallStatusIcon record={record} />
                        <Typography
                            variant="body1"
                            fontWeight={record.status === 'missed' ? 600 : 400}
                        >
                          {name}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatCallTime(record.startedAt)}
                        </Typography>
                        {record.endedAt && (
                          <Typography variant="caption" color="text.secondary">
                            · {formatDuration(record.startedAt, record.endedAt)}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <Chip
                    icon={record.type === 'video' ? <VideocamIcon /> : <PhoneIcon />}
                    label={record.type === 'video' ? 'Video' : 'Audio'}
                    size="small"
                    variant="outlined"
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
}

export const Route = createFileRoute('/calls')({
  component: CallsPage,
});
