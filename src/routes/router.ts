import { createRouter, redirect, createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import { registerRoute } from './register';
import { chatsRoute, chatsIndexRoute } from './chats';
import { chatRoute } from './chat';

// Index route - redirect to /chats
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/chats' });
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  registerRoute,
  chatsRoute.addChildren([chatsIndexRoute, chatRoute]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
