import { createRootRoute } from '@tanstack/react-router';
import { RootComponent } from '@/components/RootLayout';

export const rootRoute = createRootRoute({
  component: RootComponent,
});
