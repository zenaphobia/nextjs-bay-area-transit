import { useEffect, useMemo, useState } from "react";
import TransitCard from "./TransitCard";
import { StationTrams } from "@/types/types";
import { Button } from "./ui/button";
import { Station } from "@/app/page";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { Card, CardContent } from "./ui/card";
import { TramFront } from "lucide-react";
import { useTransitStore } from "@/stores/global";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";

function StopPanel({ stops }: { stops: Station }) {
  const [showingAll, setShowingAll] = useState(false);
  const activeStopName = useTransitStore((s) => s.activeStop);
  const setActiveStop = useTransitStore((s) => s.setActiveStop);
  const activeStop = useMemo<StationTrams | undefined>(() => {
    if (!activeStopName) return undefined;
    const matchingStops = stops.filter((s) => s.Name === activeStopName);
    const trams = matchingStops.flatMap((s) => s.trams);
    return { Name: activeStopName, trams };
  }, [activeStopName, stops]);

  return (
    <Drawer
      open={Boolean(activeStop)}
      onOpenChange={(open) => {
        if (!open) setActiveStop(null);
      }}
    >
      <DrawerContent className="font-mono">
        <DrawerHeader>
          <DrawerTitle>{activeStop?.Name}</DrawerTitle>
          <DrawerDescription>
            See upcoming departures for this station
          </DrawerDescription>
        </DrawerHeader>
        <ul className="space-y-2 overflow-y-auto px-2">
          {activeStop && activeStop?.trams.length > 0 ? (
            activeStop?.trams
              ?.sort((a, b) => {
                const depA = Number(
                  a.StopTimeUpdate.departure?.time ?? Infinity,
                );
                const depB = Number(
                  b.StopTimeUpdate.departure?.time ?? Infinity,
                );
                return depA - depB;
              })
              .slice(0, showingAll ? activeStop.trams.length : 5)
              .map((tram) => (
                <TransitCard
                  key={
                    tram.Trip.tripId +
                    tram.StopTimeUpdate.stopId! +
                    tram.StopTimeUpdate.departure?.time
                  }
                  tram={tram}
                />
              ))
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <TramFront />
                </EmptyMedia>
                <EmptyTitle>No live departures</EmptyTitle>
                <EmptyDescription>
                  See Trip Planner for scheduled service.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {activeStop && activeStop.trams.length >= 5 && !showingAll && (
            <Button
              onClick={() => {
                setShowingAll(true);
              }}
              className="w-full dark"
            >
              Load More
            </Button>
          )}
        </ul>
      </DrawerContent>
    </Drawer>
  );
}

export default StopPanel;
