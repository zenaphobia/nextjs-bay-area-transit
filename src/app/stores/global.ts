import { create } from "zustand";

interface GlobalStore {
  scale: number;
  activeStop: string | null;
  setScale: (scale: number) => void;
  setActiveStop: (stop: string | null) => void;
}

export const useTransitStore = create<GlobalStore>((set) => ({
  scale: 1,
  activeStop: null,
  setScale: (scale) => set({ scale }),
  setActiveStop: (stop) => set({ activeStop: stop }),
}));
