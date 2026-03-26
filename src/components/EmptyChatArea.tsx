import { Box, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

export function EmptyChatArea() {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        color: 'text.secondary',
      }}
    >
      <ChatIcon sx={{ fontSize: 64, opacity: 0.3 }} />
      <Typography variant="h6" color="text.secondary">
        Select a chat to start messaging
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Choose a contact from the sidebar or add a new one
      </Typography>
    </Box>
  );
}
