import { useEffect, useState } from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { router } from '@/routes';
import { useChatStore } from '@/store';

export function App() {
  const initialize = useChatStore((s) => s.initialize);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initialize().then(() => setReady(true));
  }, [initialize]);

  if (!ready) return null;

  return <RouterProvider router={router} />;
}
