import { Node } from "@/types/otp";
import { create } from "zustand";

interface GlobalStore {
  scale: number;
  activeStop: string | null;
  activeTrip: Node | null;
  setActiveTrip: (trip: Node | null) => void;
  setScale: (scale: number) => void;
  setActiveStop: (stop: string | null) => void;
}

export const useTransitStore = create<GlobalStore>((set) => ({
  scale: 1,
  activeStop: null,
  activeTrip: null,
  setActiveTrip: (activeTrip) => set({ activeTrip }),
  setScale: (scale) => set({ scale }),
  setActiveStop: (stop) => set({ activeStop: stop }),
}));
