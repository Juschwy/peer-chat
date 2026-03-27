import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Avatar,
} from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import CallIcon from '@mui/icons-material/Call';
import VideocamIcon from '@mui/icons-material/Videocam';
import { useChatStore } from '@/store/chatStore';
import { connectionManager } from '@/connection/ConnectionManager';
import { getInitials, stringToColor } from '@/utils/avatar';

export function CallOverlay() {
  const activeCall = useChatStore((s) => s.activeCall);
  const contacts = useChatStore((s) => s.contacts);
  const [elapsed, setElapsed] = useState(0);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const contact = useMemo(
    () => contacts.find((c) => c.id === activeCall?.peerId),
    [contacts, activeCall?.peerId],
  );
  const displayName = contact?.nickname || contact?.name || activeCall?.peerId?.substring(0, 8) || '';

  // Timer for connected calls
  useEffect(() => {
    if (activeCall?.status !== 'connected') { setElapsed(0); return; }
    const start = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [activeCall?.status]);

  // Attach remote stream
  useEffect(() => {
    if (remoteVideoRef.current && activeCall?.remoteStream) {
      remoteVideoRef.current.srcObject = activeCall.remoteStream;
    }
  }, [activeCall?.remoteStream]);

  // Attach local stream
  useEffect(() => {
    if (localVideoRef.current && activeCall?.localStream) {
      localVideoRef.current.srcObject = activeCall.localStream;
    }
  }, [activeCall?.localStream]);

  if (!activeCall) return null;

  const isVideo = activeCall.type === 'video';
  const isRinging = activeCall.status === 'ringing';
  const isInbound = activeCall.direction === 'inbound';

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open fullScreen={isVideo && !isRinging} maxWidth="xs" fullWidth={!isVideo || isRinging}>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          p: 4,
          position: 'relative',
          bgcolor: 'background.default',
          minHeight: isVideo && !isRinging ? '100vh' : 300,
        }}
      >
        {/* Video elements */}
        {isVideo && !isRinging && (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                background: '#000',
              }}
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: 'absolute',
                bottom: 100,
                right: 16,
                width: 120,
                height: 160,
                objectFit: 'cover',
                borderRadius: 8,
                zIndex: 2,
                border: '2px solid rgba(255,255,255,0.3)',
              }}
            />
          </>
        )}

        {/* Audio-only or ringing UI */}
        {(!isVideo || isRinging) && (
          <>
            <Avatar
              src={contact?.avatar}
              sx={{ width: 80, height: 80, bgcolor: stringToColor(displayName), fontSize: 32 }}
            >
              {getInitials(displayName)}
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              {displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isRinging
                ? isInbound
                  ? `Incoming ${isVideo ? 'video' : 'audio'} call…`
                  : 'Ringing…'
                : formatTime(elapsed)}
            </Typography>
          </>
        )}

        {/* Connected audio — show timer overlay */}
        {!isRinging && isVideo && (
          <Box sx={{ position: 'absolute', top: 16, left: 0, right: 0, textAlign: 'center', zIndex: 3 }}>
            <Typography variant="body2" sx={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              {displayName} · {formatTime(elapsed)}
            </Typography>
          </Box>
        )}

        {/* Controls */}
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            zIndex: 3,
            ...(isVideo && !isRinging ? { position: 'absolute', bottom: 32 } : {}),
          }}
        >
          {isRinging && isInbound && (
            <>
              <IconButton
                onClick={() => connectionManager.answerCall()}
                sx={{ bgcolor: 'success.main', color: '#fff', '&:hover': { bgcolor: 'success.dark' }, width: 56, height: 56 }}
              >
                {isVideo ? <VideocamIcon /> : <CallIcon />}
              </IconButton>
              <IconButton
                onClick={() => connectionManager.rejectCall()}
                sx={{ bgcolor: 'error.main', color: '#fff', '&:hover': { bgcolor: 'error.dark' }, width: 56, height: 56 }}
              >
                <CallEndIcon />
              </IconButton>
            </>
          )}

          {isRinging && !isInbound && (
            <IconButton
              onClick={() => connectionManager.endCall()}
              sx={{ bgcolor: 'error.main', color: '#fff', '&:hover': { bgcolor: 'error.dark' }, width: 56, height: 56 }}
            >
              <CallEndIcon />
            </IconButton>
          )}

          {!isRinging && (
            <IconButton
              onClick={() => connectionManager.endCall()}
              sx={{ bgcolor: 'error.main', color: '#fff', '&:hover': { bgcolor: 'error.dark' }, width: 56, height: 56 }}
            >
              <CallEndIcon />
            </IconButton>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

