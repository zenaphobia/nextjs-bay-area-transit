import { transit_realtime } from "gtfs-realtime-bindings";

export type Tram = {
  Trip: transit_realtime.ITripDescriptor;
  StopTimeUpdate: transit_realtime.TripUpdate.IStopTimeUpdate;
  nextStop: transit_realtime.TripUpdate.IStopTimeUpdate | undefined;
};

export type Stop = {
  Name: string;
  id: string;
  trams: Tram[];
};

export type StationTrams = {
  Name: string;
  trams: Tram[];
};

export type stopList = {
  Name: string;
  id: string;
  Location: {
    Longitude: string;
    Latitude: string;
  };
}[];
