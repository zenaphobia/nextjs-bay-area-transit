export const views = ["trips", "map", "savedTrips", "alerts"] as const;
export type View = (typeof views)[number];
