import { Badge } from '@mui/material';
import { UserAvatar } from './UserAvatar';

interface OnlineAvatarProps {
  name: string;
  avatar?: string;
  online: boolean;
  size?: number;
}

export function OnlineAvatar({ name, avatar, online, size = 40 }: OnlineAvatarProps) {
  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      variant="dot"
      sx={{
        '& .MuiBadge-badge': {
          backgroundColor: online ? '#44b700' : '#bdbdbd',
          color: online ? '#44b700' : '#bdbdbd',
          boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`,
        },
      }}
    >
      <UserAvatar name={name} avatar={avatar} size={size} />
    </Badge>
  );
}
