import { createRoute } from '@tanstack/react-router';
import { ConnectPage } from '@/components/ConnectPage';
import { rootRoute } from './root';

export const connectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/connect/$peerId',
  component: ConnectPage,
});
