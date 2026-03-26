import { createRoute } from '@tanstack/react-router';
import { ChatPage } from '@/components/ChatPage';
import { chatsRoute } from './chats';


export const chatRoute = createRoute({
  getParentRoute: () => chatsRoute,
  path: '$chatId',
  component: ChatPage,
});
