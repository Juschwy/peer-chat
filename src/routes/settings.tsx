import {createFileRoute} from '@tanstack/react-router';
import {Box, Card, CardContent, Divider, Switch, Typography,} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import InfoIcon from '@mui/icons-material/Info';
import {useThemeStore} from '@/store/themeStore';

function SettingsPage() {
  const themeMode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'auto',
        p: { xs: 2, md: 4 },
        maxWidth: 600,
        mx: 'auto',
      }}
    >
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Settings
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ p: 0 }}>
          {/* Theme */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2.5,
              py: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <DarkModeIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  Dark Mode
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Toggle dark and light theme
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={themeMode === 'dark'}
              onChange={toggleTheme}
              size="small"
            />
          </Box>

          <Divider />

          {/* Version */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2.5,
              py: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <InfoIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  Version
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Application version
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {import.meta.env.PACKAGE_VERSION}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

