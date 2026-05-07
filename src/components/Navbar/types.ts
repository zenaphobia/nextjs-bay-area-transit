export const views = [
  "trip_view",
  "map_view",
  "savedTrips_view",
  "alerts_view",
] as const;
export type View = (typeof views)[number];
