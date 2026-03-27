import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { NavRail } from '@/components/NavRail';
import { MobileTopBar } from '@/components/MobileTopBar';
import { MobileBottomBar } from '@/components/MobileBottomBar';
import { CallOverlay } from '@/components/CallOverlay';
import { useConnection } from '@/hooks/useConnection';
import { useChatStore } from '@/store/chatStore';
import { useEffect } from 'react';

function RootComponent() {
  const { isConnected } = useConnection();
  const account = useChatStore((s) => s.account);
  const initialized = useChatStore((s) => s.initialized);
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  useEffect(() => {
    if (!initialized) return;
    if (!account) {
      navigate({ to: '/register', search: { redirect: window.location.pathname } });
    }
  }, [account, initialized, navigate]);

  if (!initialized) return null;

  if (!account) {
    return <Outlet />;
  }

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
        <MobileTopBar />
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Outlet />
        </Box>
        <MobileBottomBar isConnected={isConnected} />
        <CallOverlay />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100dvh' }}>
      <NavRail isConnected={isConnected} />
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Outlet />
      </Box>
      <CallOverlay />
    </Box>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
