import { Box, Typography, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import type { Message } from '@/schemas';
import { useMemo, useState, type MouseEvent } from 'react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function formatTs(d: Date | string | undefined): string {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleString([], {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const time = useMemo(() => {
    const d = new Date(message.sentTimestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [message.sentTimestamp]);

  const statusIcon = useMemo(() => {
    if (!isOwn) return null;
    if (message.readTimestamp) return '✓✓';
    if (message.receivedTimestamp) return '✓';
    return '⏳';
  }, [isOwn, message.readTimestamp, message.receivedTimestamp]);

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: isOwn ? 'flex-end' : 'flex-start',
          mb: 0.5,
          px: 2,
        }}
      >
        <Box
          onContextMenu={handleContextMenu}
          sx={{
            maxWidth: '70%',
            bgcolor: isOwn ? 'primary.main' : 'action.hover',
            color: isOwn ? 'primary.contrastText' : 'text.primary',
            borderRadius: '8px',
            px: 1.5,
            py: 0.75,
            cursor: 'context-menu',
          }}
        >
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {message.textContent}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mt: 0.25 }}>
            <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem' }}>
              {time}
            </Typography>
            {statusIcon && (
              <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem' }}>
                {statusIcon}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Context menu */}
      <Menu
        open={!!contextMenu}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined}
      >
        <MenuItem
          onClick={() => { setContextMenu(null); setInfoOpen(true); }}
          sx={{ gap: 1, fontSize: '0.875rem' }}
        >
          <InfoIcon fontSize="small" /> Info
        </MenuItem>
      </Menu>

      {/* Info dialog */}
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Message Info</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Message</Typography>
              <Typography variant="body2">{message.textContent}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Message ID</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{message.id}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Sent</Typography>
              <Typography variant="body2">{formatTs(message.sentTimestamp)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Received</Typography>
              <Typography variant="body2">{formatTs(message.receivedTimestamp)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Read</Typography>
              <Typography variant="body2">{formatTs(message.readTimestamp)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">From → To</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {message.senderId.substring(0, 8)}… → {message.receiverId.substring(0, 8)}…
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
