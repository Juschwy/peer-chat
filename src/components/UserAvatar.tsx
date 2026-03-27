import { Avatar as MuiAvatar } from '@mui/material';
import { getInitials, stringToColor } from '@/utils/avatar';

interface UserAvatarProps {
  name: string;
  avatar?: string;
  size?: number;
}

export function UserAvatar({ name, avatar, size = 40 }: UserAvatarProps) {
  if (avatar) {
    return <MuiAvatar src={avatar} sx={{ width: size, height: size }} />;
  }

  return (
    <MuiAvatar
      sx={{
        width: size,
        height: size,
        bgcolor: stringToColor(name),
        fontSize: size * 0.4,
      }}
    >
      {getInitials(name)}
    </MuiAvatar>
  );
}
