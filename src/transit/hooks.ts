import { useCallback, useMemo, useRef, useState } from "react";
import { fetchFeed } from "./utils";
import { transit_realtime } from "gtfs-realtime-bindings";

const endpoint = process.env.NEXT_PUBLIC_WORKER_URL_BASE;

export type ServiceAlerts = {
  Header: {
    GtfsRealtimeVersion: string;
    incrementality: number;
    Timestamp: number;
  };
  Entities: ServiceEntity[];
};

type ServiceEntity = {
  Id: string;
  Alert: {
    ActivePeriods: unknown[];
    InformedEntites: { AgecnyID: string; Trip: null }[];
    Url: LanguageStruct;
    HeaderText: LanguageStruct;
    DescriptionText: LanguageStruct;
  };
};

type LanguageStruct = {
  Translations: {
    Text: string;
    Language: string;
  }[];
};

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
  const [serviceAlerts, setServiceAlerts] = useState<ServiceAlerts>();
  const [loaded, setLoaded] = useState(false);

  // const filterDeparted = useCallback(
  //   (trams: Omit<transit_realtime.FeedMessage, "toJSON">) => {
  //     const now = Date.now();
  //     return {
  //       ...trams,
  //       entity: trams.entity.map((entity) => {
  //         if (!entity.tripUpdate?.stopTimeUpdate) return entity;
  //         return {
  //           ...entity,
  //           tripUpdate: {
  //             ...entity.tripUpdate,
  //             stopTimeUpdate: entity.tripUpdate.stopTimeUpdate.filter(
  //               (stu) => (stu.departure?.time as number) * 1000 - now > 0,
  //             ),
  //           },
  //         };
  //       }),
  //     };
  //   },
  //   [],
  // );

  const getFeed = useCallback(async () => {
    try {
      const [tramRes, stopRes, alertsRes] = await Promise.all([
        fetchFeed(`${endpoint}?type=trams`),
        fetch(`${endpoint}?type=stops`),
        fetch(`${endpoint}?type=alerts`),
      ]);

      const trams = tramRes.toJSON() as Omit<
        transit_realtime.FeedMessage,
        "toJSON"
      >;

      setTrams(trams);
      if (!stopRes.ok) throw new Error("Could not fetch feed");
      const stopData = await stopRes.json();

      if (!alertsRes.ok) {
        console.error("Could not fetch service alerts");
      } else {
        const serviceAlertData = (await alertsRes.json()) as ServiceAlerts;
        setServiceAlerts(serviceAlertData);
      }

      setStops(stopData);
      setLoaded(true);
    } catch (e) {
      console.error("Failed to load data from API: ", e);
    }
  }, []);

  const inflight = useRef(false);

  const startPoll = useCallback(() => {
    console.debug("Poll started");

    const intervalID = setInterval(async () => {
      if (inflight.current) return;

      try {
        console.debug("Polling data");
        inflight.current = true;
        const res = await fetchFeed(`${endpoint}?type=trams`);
        const serviceRes = await fetch(`${endpoint}?type=alerts`);
        const serviceData = (await serviceRes.json()) as ServiceAlerts;
        const trams = res.toJSON() as Omit<
          transit_realtime.FeedMessage,
          "toJSON"
        >;
        setServiceAlerts(serviceData);
        setTrams(trams);
      } catch (err) {
        console.error("[startPoll] Failed to fetch data: ", err);
      } finally {
        inflight.current = false;
      }
    }, 1000 * 60);

    return () => clearInterval(intervalID);
  }, []);

  return useMemo(
    () => ({
      getFeed,
      loaded,
      trams,
      stops,
      startPoll,
      serviceAlerts,
    }),
    [getFeed, loaded, trams, stops, startPoll, serviceAlerts],
  );
}
