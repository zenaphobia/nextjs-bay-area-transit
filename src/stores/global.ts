import { Node } from "@/types/otp";
import { create } from "zustand";

interface GlobalStore {
  scale: number;
  activeStop: string | null;
  activeTrip: Node | null;
  plannerOpen: boolean;
  activeTripPanelOpen: boolean;
  setActiveTrip: (trip: Node | null) => void;
  setScale: (scale: number) => void;
  setActiveStop: (stop: string | null) => void;
  setPlannerOpen: (open: boolean) => void;
  setActiveTripPanelOpen: (open: boolean) => void;
  startTrip: (trip: Node) => void;
}

export const useTransitStore = create<GlobalStore>((set) => ({
  scale: 1,
  activeStop: null,
  activeTrip: null,
  plannerOpen: false,
  activeTripPanelOpen: false,
  setActiveTrip: (activeTrip) => set({ activeTrip }),
  setScale: (scale) => set({ scale }),
  setActiveStop: (stop) => set({ activeStop: stop }),
  setPlannerOpen: (plannerOpen) => set({ plannerOpen }),
  setActiveTripPanelOpen: (activeTripPanelOpen) => set({ activeTripPanelOpen }),
  startTrip: (trip) =>
    set({
      activeTrip: trip,
      plannerOpen: false,
      activeTripPanelOpen: true,
    }),
}));
