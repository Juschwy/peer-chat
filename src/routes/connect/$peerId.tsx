import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useChatStore } from '@/store/chatStore';
import { useNotification } from '@/hooks/notificationContext';
import { connectionManager } from '@/connection/ConnectionManager';
function ConnectPage() {
  const { peerId } = Route.useParams();
  const account = useChatStore((s) => s.account);
  const contacts = useChatStore((s) => s.contacts);
  const addContact = useChatStore((s) => s.addContact);
  const navigate = useNavigate();
  const { notify } = useNotification();
  const alreadyAdded = contacts.some((c) => c.id === peerId);
  const isSelf = account?.id === peerId;
  const handleConnect = async () => {
    if (!account || isSelf) return;
    try {
      await addContact({
        id: peerId,
        name: peerId.substring(0, 8),
        avatar: '',
        publicKey: peerId,
      });
      connectionManager.connectToPeer(peerId).catch(() => {});
      notify('Contact added! Connecting…', 'success');
      navigate({ to: '/chats/$chatId', params: { chatId: peerId } });
    } catch {
      notify('Failed to add contact', 'error');
    }
  };
  const handleGoToChat = () => {
    navigate({ to: '/chats/$chatId', params: { chatId: peerId } });
  };
  if (!account) {
    return null;
  }
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 4, alignItems: 'center' }}
        >
          <ChatIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={700} textAlign="center">
            Connect with Peer
          </Typography>
          {isSelf ? (
            <>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                This is your own Peer ID. You can't add yourself as a contact.
              </Typography>
              <Button variant="contained" onClick={() => navigate({ to: '/chats' })}>
                Go to Chats
              </Button>
            </>
          ) : alreadyAdded ? (
            <>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                You already have this peer as a contact.
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontFamily: 'monospace', wordBreak: 'break-all', textAlign: 'center' }}
                color="text.disabled"
              >
                {peerId}
              </Typography>
              <Button variant="contained" startIcon={<ChatIcon />} onClick={handleGoToChat}>
                Open Chat
              </Button>
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Someone wants to connect with you. Add them as a contact to start chatting.
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontFamily: 'monospace', wordBreak: 'break-all', textAlign: 'center' }}
                color="text.disabled"
              >
                {peerId}
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={handleConnect}
                size="large"
                fullWidth
              >
                Add & Connect
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
export const Route = createFileRoute('/connect/$peerId')({
  component: ConnectPage,
});
