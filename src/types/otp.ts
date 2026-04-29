export type OTPResponse = {
  data: {
    planConnection: PlanConnection;
  };
};

export type PlanConnection = {
  edges: Edge[];
};

export type Edge = {
  node: Node;
};

export type Node = {
  start: string;
  end: string;
  legs: Leg[];
};

export type EstimatedTime = {
  time: string;
  delay: number;
};

export type Leg = {
  mode: string;
  from: StopDetails;
  to: StopDetails;
  route: Route | null;
};

export type Route = {
  gtfsId: string;
  longName: string;
  shortName: string;
};

export type StopDetails = {
  name: string;
  lat: number;
  lon: number;
  departure?: {
    scheduledTime: string;
    estimated: EstimatedTime | null;
  };
  arrival?: {
    scheduledTime: string;
    estimated: EstimatedTime | null;
  };
};
