import { create } from 'zustand';

interface UIState {
  showMainMenu: boolean;
  setShowMainMenu: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  showMainMenu: true,
  setShowMainMenu: (show: boolean) => set({ showMainMenu: show }),
}));
