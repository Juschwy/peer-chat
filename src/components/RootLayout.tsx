import { Outlet, useNavigate } from '@tanstack/react-router';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { NavRail } from '@/components/NavRail';
import { MobileTopBar } from '@/components/MobileTopBar';
import { MobileBottomBar } from '@/components/MobileBottomBar';
import { useConnection } from '@/hooks';
import { useChatStore } from '@/store';
import { useEffect } from 'react';

export function RootComponent() {
  const { isConnected, isLeader } = useConnection();
  const account = useChatStore((s) => s.account);
  const initialized = useChatStore((s) => s.initialized);
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  useEffect(() => {
    if (!initialized) return;
    if (!account) {
      navigate({ to: '/register' });
    }
  }, [account, initialized, navigate]);

  if (!initialized) {
    return null;
  }

  // Register page — no chrome
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
      </Box>
    );
  }

  // Desktop: NavRail | content
  return (
    <Box sx={{ display: 'flex', height: '100dvh' }}>
      <NavRail isConnected={isConnected} />
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
