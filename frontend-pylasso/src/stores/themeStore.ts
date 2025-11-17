import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  colorScheme: 'light' | 'dark';
  toggleColorScheme: () => void;
  setColorScheme: (scheme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      colorScheme: 'light',
      toggleColorScheme: () =>
        set((state) => ({ colorScheme: state.colorScheme === 'light' ? 'dark' : 'light' })),
      setColorScheme: (scheme) => set({ colorScheme: scheme })
    }),
    { name: 'theme-storage' } // stored in localStorage
  )
);
