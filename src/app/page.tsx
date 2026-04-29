"use client";
import { useTransitFeed } from "../transit/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { transit_realtime } from "gtfs-realtime-bindings";
import { StationTrams, Stop } from "@/types/types";
import BartMap from "@/components/BartMap/BartMap";
import StopPanel from "@/components/StopPanel";
import TripPlannerPanel from "@/Panels/TripPlannerPanel";
import ActiveTripPlanel from "@/Panels/ActiveTripPanel";

export default function Page() {
  const transitFeed = useTransitFeed();
  const stopTramMap = useMemo(() => {
    const map: Map<
      string,
      {
        Trip: transit_realtime.ITripDescriptor;
        StopTimeUpdate: transit_realtime.TripUpdate.IStopTimeUpdate;
        nextStop: transit_realtime.TripUpdate.IStopTimeUpdate | undefined;
      }[]
    > = new Map();

    transitFeed.trams?.entity.forEach((feedEntity) => {
      feedEntity.tripUpdate?.stopTimeUpdate?.forEach((stu, index) => {
        if (!stu.stopId) return;
        if (!map.has(stu.stopId)) map.set(stu.stopId, []);

        const nextStop = feedEntity.tripUpdate?.stopTimeUpdate?.[index + 1];

        map.get(stu.stopId)!.push({
          Trip: feedEntity.tripUpdate?.trip as transit_realtime.ITripDescriptor,
          StopTimeUpdate: stu,
          nextStop,
        });
      });
    });

    return map;
  }, [transitFeed.trams]);

  const stopList = useMemo(() => {
    if (!transitFeed.stops) return [];

    return transitFeed.stops.Contents.dataObjects.ScheduledStopPoint.map(
      (stop) => ({
        Name: stop.Name,
        id: stop.id,
        Location: stop.Location,
      }),
    );
  }, [transitFeed.stops]);

  const stops = useMemo(() => {
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

  const [activeStopName, setActiveStopName] = useState<string>();

  const activeStop = useMemo<StationTrams | undefined>(() => {
    if (!activeStopName) return undefined;
    const matchingStops = stops.filter((s) => s.Name === activeStopName);
    const trams = matchingStops.flatMap((s) => s.trams);
    return { Name: activeStopName, trams };
  }, [activeStopName, stops]);

  const handleSelect = useCallback((stop: string | undefined) => {
    setActiveStopName(stop);
  }, []);

  const loaded = useMemo(() => {
    if (!transitFeed.loaded) {
      transitFeed.getFeed();
    }

    return transitFeed.loaded;
  }, [transitFeed]);

  useEffect(() => {
    return transitFeed.startPoll();
  }, [transitFeed]);

  return (
    <main className="text-white overflow-hidden flex flex-col gap-8 items-center justify-center w-screen h-screen font-mono">
      {!loaded && <div>Loading...</div>}
      <BartMap />
      <TripPlannerPanel stopList={stopList} />
      {/* <ActiveTripPlanel /> */}
      {activeStop && <StopPanel activeStop={activeStop} />}
    </main>
  );
}
