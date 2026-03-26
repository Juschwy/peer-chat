import { createRoute } from '@tanstack/react-router';
import { ChatsLayout } from '@/components/ChatsLayout';
import { EmptyChatArea } from '@/components';
import { rootRoute } from './root';

export const chatsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chats',
  component: ChatsLayout,
});

export const chatsIndexRoute = createRoute({
  getParentRoute: () => chatsRoute,
  path: '/',
  component: EmptyChatArea,
});
