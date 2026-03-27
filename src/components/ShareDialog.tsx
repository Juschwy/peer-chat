import { useMemo, useState } from 'react';
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
import { QRCodeSVG } from 'qrcode.react';
import { useChatStore } from '@/store/chatStore';
import { useNotification } from '@/hooks/notificationContext';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ShareDialog({ open, onClose }: ShareDialogProps) {
  const account = useChatStore((s) => s.account);
  const { notify } = useNotification();
  const [copiedLink, setCopiedLink] = useState(false);

  const connectUrl = useMemo(() => {
    if (!account) return '';
    const base = window.location.origin;
    return `${base}/connect/${account.id}`;
  }, [account]);

  if (!account) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(connectUrl);
      setCopiedLink(true);
      notify('Connect link copied!', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      notify('Failed to copy', 'error');
    }
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(account.id);
      notify('Peer ID copied!', 'success');
    } catch {
      notify('Failed to copy', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Share your Profile</DialogTitle>
      <DialogContent>
        <Box
            sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5, py: 2}}
        >
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Scan this QR code or share the link so others can connect with you.
          </Typography>

          {/* QR Code */}
          <Box
            sx={{
              p: 2,
              bgcolor: '#ffffff',
              borderRadius: 2,
              display: 'inline-flex',
            }}
          >
            <QRCodeSVG value={connectUrl} size={200} level="M" includeMargin={false}/>
          </Box>

          {/* Connect link */}
          <Box sx={{ width: '100%' }}>
            <Typography
                variant="caption"
                color="text.secondary"
                gutterBottom
                sx={{display: 'block'}}
            >
              Connect Link
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  wordBreak: 'break-all',
                  flex: 1,
                }}
              >
                {connectUrl}
              </Typography>
              <Tooltip title={copiedLink ? 'Copied!' : 'Copy link'}>
                <IconButton size="small" onClick={handleCopyLink}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Peer ID */}
          <Box sx={{ width: '100%' }}>
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
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  wordBreak: 'break-all',
                  flex: 1,
                }}
              >
                {account.id}
              </Typography>
              <Tooltip title="Copy Peer ID">
                <IconButton size="small" onClick={handleCopyId}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
