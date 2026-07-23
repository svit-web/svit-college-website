import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  theme: 'light' | 'dark' | 'system';

  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  setMobileNavOpen: (value: boolean) => void;
  setTheme: (theme: UIState['theme']) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      theme: 'system',

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
      setMobileNavOpen: (value) => set({ mobileNavOpen: value }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'admin-ui-prefs', // localStorage key — fine here, this runs in the real browser app, not a Claude artifact
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, theme: s.theme }),
    }
  )
);

// ---- Selector hooks: each returns a primitive so components only re-render
// when that specific primitive changes, not on every UI store update ----
export const useSidebarCollapsed = () => useUIStore((s) => s.sidebarCollapsed);
export const useTheme = () => useUIStore((s) => s.theme);
