import { create } from 'zustand';

export const useAppStore = create((set) => ({
  user: null,
  setUser: (userData) => set({ user: userData }),
  logout: () => set({ user: null }),
  
  currentOrder: null,
  setOrder: (order) => set({ currentOrder: order }),
}));