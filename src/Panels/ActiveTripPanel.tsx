import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useTransitStore } from "@/stores/global";
import { getColorByLine } from "@/transit/utils";
import { TramFront, Footprints } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

const ActiveTripPlanel = memo(function ActiveTripPanel() {
  const activeTrip = useTransitStore((s) => s.activeTrip);
  const setActiveTrip = useTransitStore((s) => s.setActiveTrip);
  const visible = useTransitStore((s) => s.activeTripPanelOpen);
  const setVisible = useTransitStore((s) => s.setActiveTripPanelOpen);

  const handleCancelTrip = useCallback(() => {
    setActiveTrip(null);
    setVisible(false);
  }, [setActiveTrip, setVisible]);

  const snapPoints = ["55px", 1];

  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);

  useEffect(() => {
    console.log({ snap });
  }, [snap]);

  return (
    <Drawer
      open={Boolean(activeTrip)}
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      modal={false}
    >
      <DrawerTrigger>CLick</DrawerTrigger>
      <DrawerContent className="h-screen font-mono">
        <DrawerHeader>
          <DrawerTitle>Current Trip</DrawerTitle>
          <DrawerDescription>
            See details about your current trip
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <div>
            {activeTrip &&
              activeTrip.legs.map((l, index) => {
                const isLast = index === activeTrip.legs.length - 1;
                return (
                  <div
                    key={`${l.mode}-${l.from.name}-${l.to.name}-${l.from.departure?.scheduledTime ?? l.to.arrival?.scheduledTime}-full`}
                    className="flex gap-3"
                  >
                    <div className="flex flex-col items-center">
                      <span className="shrink-0 mb-1">
                        {l.mode === "SUBWAY" ? (
                          <TramFront size={18} />
                        ) : (
                          <Footprints size={18} />
                        )}
                      </span>
                      {!isLast && (
                        <div className="w-[2px] flex-1 bg-foreground/20 my-1" />
                      )}
                    </div>

                    <div className="pb-4">
                      <h4
                        className={getColorByLine(l.route?.shortName, "text")}
                      >
                        {l.from.name} → {l.to.name}
                      </h4>
                      <div className="flex gap-2 items-center mt-0.5">
                        <p className="font-black">
                          {l.from.departure &&
                            new Date(
                              l.from.departure.scheduledTime,
                            ).toLocaleTimeString("en", {
                              minute: "numeric",
                              hour: "numeric",
                            })}
                        </p>
                        <span
                          className={twMerge(
                            getColorByLine(l.route?.shortName, "bg"),
                            "w-2 h-2 rounded-full",
                          )}
                        />
                        <span
                          className={getColorByLine(l.route?.shortName, "text")}
                        >
                          {l.route?.shortName
                            ? l.route.shortName.split("-")[0] + " Line"
                            : "Walk"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          <Button
            onClick={handleCancelTrip}
            className="w-full"
            size={"lg"}
            variant={"destructive"}
          >
            End Trip
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
});

export default ActiveTripPlanel;
