export const views = ["map", "trips", "savedTrips", "alerts"] as const;
export type View = (typeof views)[number];
