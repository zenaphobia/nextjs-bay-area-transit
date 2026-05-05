"use client";
import { useTransitFeed } from "../transit/hooks";
import { useEffect, useMemo } from "react";
import type { transit_realtime } from "gtfs-realtime-bindings";
import { Stop, Tram } from "@/types/types";
import BartMap from "@/components/BartMap/BartMap";
import TripPlannerPanel from "@/Panels/TripPlannerPanel";
import ActiveTripPlanel from "@/Panels/ActiveTripPanel";
import Navbar from "@/components/Navbar/Navbar";
import { useTransitStore } from "@/stores/global";
import SavedTripsPanel from "@/Panels/SavedTripsPanel";
import AlertsPanel from "@/Panels/AlertsPanel";
import { Toaster } from "@/components/ui/sonner";

export type Station = {
  Name: string;
  id: string;
  trams: {
    Trip: transit_realtime.ITripDescriptor;
    StopTimeUpdate: transit_realtime.TripUpdate.IStopTimeUpdate;
    platform: string;
  }[];
}[];

export type stopList = {
  Name: string;
  id: string;
  Location: {
    Longitude: string;
    Latitude: string;
  };
}[];

export default function Page() {
  const transitFeed = useTransitFeed();
  const serviceAlerts = transitFeed.serviceAlerts;
  const stopIdPlatformMap = useMemo(() => {
    const map = new Map<string, string>();

    transitFeed.stops?.Contents.dataObjects.ScheduledStopPoint.forEach(
      (station) => {
        map.set(station.id, station.Extensions.PlatformCode);
      },
    );

    return map;
  }, [transitFeed.stops]);
  const stopTramMap = useMemo(() => {
    const map: Map<string, Tram[]> = new Map();

    transitFeed.trams?.entity.forEach((feedEntity) => {
      feedEntity.tripUpdate?.stopTimeUpdate?.forEach((stu, index) => {
        if (!stu.stopId) {
          console.log("No stopID provided, skipping");
          return;
        }

        if (!map.has(stu.stopId)) map.set(stu.stopId, []);

        map.get(stu.stopId)!.push({
          Trip: feedEntity.tripUpdate?.trip as transit_realtime.ITripDescriptor,
          StopTimeUpdate: stu,
          platform: stopIdPlatformMap.get(stu.stopId) ?? "",
        });
      });
    });

    return map;
  }, [transitFeed.trams, stopIdPlatformMap]);

  const stopList = useMemo(() => {
    if (!transitFeed.stops) return [];

    return transitFeed.stops.Contents.dataObjects.ScheduledStopPoint.map(
      (stop) => ({
        Name: stop.Name,
        id: stop.id,
        Location: stop.Location,
        platform: stop.Extensions.PlatformCode,
      }),
    );
  }, [transitFeed.stops]);

  const stops: Station = useMemo(() => {
    if (!transitFeed.stops) return [];

    return transitFeed.stops?.Contents.dataObjects.ScheduledStopPoint.map(
      (stop) => {
        const trams = stopTramMap.get(stop.id) ?? [];
        return {
          Name: stop.Name,
          id: stop.id,
          trams,
        } satisfies Stop;
      },
    );
  }, [stopTramMap, transitFeed.stops]);

  const loaded = useMemo(() => {
    if (!transitFeed.loaded) {
      transitFeed.getFeed();
    }

    return transitFeed.loaded;
  }, [transitFeed]);

  useEffect(() => {
    return transitFeed.startPoll();
  }, [transitFeed]);

  const currentView = useTransitStore((s) => s.currentView);
  const Panel = {
    trips: <TripPlannerPanel stopList={stopList} />,
    map: <BartMap stopList={stopList} stops={stops} />,
    savedTrips: <SavedTripsPanel />,
    alerts: <AlertsPanel alerts={serviceAlerts} />,
  }[currentView];

  return (
    <>
      <main className="text-white overflow-hidden relative flex flex-col items-center justify-center w-screen h-dvh font-mono">
        <ActiveTripPlanel />
        <section className="overflow-hidden flex-1 min-h-0 w-full">
          {Panel}
        </section>
        <Navbar />
      </main>
      <Toaster />
    </>
  );
}
