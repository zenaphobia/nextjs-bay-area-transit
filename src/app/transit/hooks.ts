import { useState } from "react";
import { fetchFeed } from "./utils";
import { transit_realtime } from "gtfs-realtime-bindings";

const endpoint = process.env.NEXT_PUBLIC_WORKER_URL_BASE;

export type ScheduledStopPoint = {
  id: string;
  Extensions: {
    locationType: string;
    PlatformCode: string;
    ParentStation: string;
    ValidBetween: { FromDate: string; ToDate: string };
  };
  Name: string;
  Url: string | null;
  Location: { Longitude: string; Latitude: string };
  StopType: string;
};

interface TransitStop {
  ResponseTimestamp: string;
  dataObjects: {
    id: "BA";
    ScheduledStopPoint: ScheduledStopPoint[];
  };
}

interface TransitContent {
  Contents: TransitStop;
}

export function useTransitFeed() {
  const [trams, setTrams] =
    useState<Omit<transit_realtime.FeedMessage, "toJSON">>();
  const [stops, setStops] = useState<TransitContent>();
  const [loaded, setLoaded] = useState(false);

  async function getFeed() {
    try {
      const [tramRes, stopRes] = await Promise.all([
        fetchFeed(`${endpoint}?type=trams`),
        fetch(`${endpoint}?type=stops`),
      ]);

      const trams = tramRes.toJSON() as Omit<
        transit_realtime.FeedMessage,
        "toJSON"
      >;

      setTrams(filterDeparted(trams));

      if (!stopRes.ok) throw new Error("Could not fetch feed");
      const stopData = await stopRes.json();

      setStops(stopData);
      setLoaded(true);
    } catch (e) {
      console.error("Failed to load data from API: ", e);
    }
  }

  function filterDeparted(trams: Omit<transit_realtime.FeedMessage, "toJSON">) {
    const now = Date.now();
    return {
      ...trams,
      entity: trams.entity.map((entity) => {
        if (!entity.tripUpdate?.stopTimeUpdate) return entity;
        return {
          ...entity,
          tripUpdate: {
            ...entity.tripUpdate,
            stopTimeUpdate: entity.tripUpdate.stopTimeUpdate.filter(
              (stu) => (stu.departure?.time as number) * 1000 - now > 0,
            ),
          },
        };
      }),
    };
  }

  let inflight = false;

  function startPoll() {
    console.log("Poll started");

    const intervalID = setInterval(async () => {
      if (inflight) return;

      try {
        console.log("Polling data");
        inflight = true;
        const res = await fetchFeed(`${endpoint}?type=trams`);
        const trams = res.toJSON() as Omit<
          transit_realtime.FeedMessage,
          "toJSON"
        >;
        setTrams(filterDeparted(trams));
      } catch (err) {
        console.error("[startPoll] Failed to fetch data: ", err);
      } finally {
        inflight = false;
      }
    }, 1000 * 60);

    return () => clearInterval(intervalID);
  }

  return {
    getFeed,
    loaded,
    trams,
    stops,
    startPoll,
  };
}
