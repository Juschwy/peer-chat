import { createFileRoute, Outlet, useParams } from '@tanstack/react-router';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Sidebar } from '@/components/Sidebar';

function ChatsLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const params = useParams({ strict: false }) as { chatId?: string };
  const hasChatOpen = !!params.chatId;

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', height: '100%' }}>
        {!hasChatOpen ? (
          <Box sx={{ width: '100%', height: '100%' }}>
            <Sidebar />
          </Box>
        ) : (
          <Box sx={{ flex: 1, height: '100%' }}>
            <Outlet />
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Sidebar />
      <Outlet />
    </Box>
  );
}

export const Route = createFileRoute('/chats')({
  component: ChatsLayout,
});

