import { useMemo, useState } from "react";
import TransitCard from "./TransitCard";
import { StationTrams } from "@/types/types";
import { Button } from "./ui/button";
import { Stops } from "@/app/page";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { useTransitStore } from "@/stores/global";

function StopPanel({ stops }: { stops: Stops }) {
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
        </DrawerHeader>
        <div className="border border-white/25 rounded-lg p-2 h-full flex flex-col gap-4 bg-black">
          <ul className="space-y-2 overflow-y-auto">
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
              <div className="text-center">
                <p className="opacity-50">No trains scheduled</p>
              </div>
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
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default StopPanel;
