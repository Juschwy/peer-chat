import { createRoute } from '@tanstack/react-router';
import { RegisterPage } from '@/components/RegisterPage';
import { rootRoute } from './root';


export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});
