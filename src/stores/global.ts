import { View } from "@/components/Navbar/types";
import { Stop } from "@/Panels/TripPlannerPanel";
import { Node } from "@/types/otp";
import { create } from "zustand";

interface GlobalStore {
  scale: number;
  activeStop: string | null;
  activeTrip: Node | null;
  currentView: View;
  originStation: Stop | undefined;
  destinationStation: Stop | undefined;
  setDestinationStation: (station: Stop | undefined) => void;
  setOriginStation: (station: Stop | undefined) => void;
  setCurrentView: (v: View) => void;
  setActiveTrip: (trip: Node | null) => void;
  setScale: (scale: number) => void;
  setActiveStop: (stop: string | null) => void;
}

export const useTransitStore = create<GlobalStore>((set) => ({
  scale: 1,
  activeStop: null,
  activeTrip: null,
  currentView: "trips",
  originStation: undefined,
  destinationStation: undefined,
  setOriginStation: (originStation: Stop | undefined) => set({ originStation }),
  setDestinationStation: (destinationStation: Stop | undefined) =>
    set({ destinationStation }),
  setCurrentView: (view) => set({ currentView: view }),
  setActiveTrip: (activeTrip) => set({ activeTrip }),
  setScale: (scale) => set({ scale }),
  setActiveStop: (stop) => set({ activeStop: stop }),
}));
