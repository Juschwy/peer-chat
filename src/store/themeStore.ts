import { create } from 'zustand';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  toggle: () => void;
}

function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem('peer-chat-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useThemeStore = create<ThemeState>()((set) => ({
  mode: getInitialMode(),
  toggle: () =>
    set((state) => {
      const next = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('peer-chat-theme', next);
      return { mode: next };
    }),
}));
