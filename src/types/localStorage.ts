import { type Stop } from "@/Panels/TripPlannerPanel";

export type SavedRoute = {
  origin: Stop;
  destination: Stop;
  name: string;
};
