import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from '@tanstack/react-router';

export function MobileTopBar() {
  const navigate = useNavigate();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar variant="dense">
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          Peer Chat
        </Typography>
        <IconButton onClick={() => navigate({ to: '/settings' })} size="small">
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
