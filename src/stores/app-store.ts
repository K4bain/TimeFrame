import { create } from 'zustand';

interface AppState {
  activeSite: string | null;
  activeSnapshot: string | null;
  compareMode: boolean;
  setActiveSite: (site: string) => void;
  setActiveSnapshot: (timestamp: string) => void;
  toggleCompareMode: () => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeSite: null,
  activeSnapshot: null,
  compareMode: false,

  setActiveSite: (site) => set({ activeSite: site }),
  setActiveSnapshot: (timestamp) => set({ activeSnapshot: timestamp }),
  toggleCompareMode: () => set((s) => ({ compareMode: !s.compareMode })),
  reset: () => set({ activeSite: null, activeSnapshot: null, compareMode: false }),
}));
