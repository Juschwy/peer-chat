import { createFileRoute } from '@tanstack/react-router';
import { EmptyChatArea } from '@/components/EmptyChatArea';

export const Route = createFileRoute('/chats/')({
  component: EmptyChatArea,
});

