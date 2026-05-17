"use client";
import { Node } from "@/types/otp";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { TramFront, Footprints } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { twJoin, twMerge } from "tailwind-merge";
import { Button } from "../ui/button";
import { getColorByLine } from "@/transit/utils";
import Countdown, { Fragment } from "../Countdown/Countdown";
import DelayPill from "./DelayPill";
import { useTransitStore } from "@/stores/global";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ROUTE_TERMINUS } from "@/transit/constants";

type Props = {
  trip: Node;
  stopIdPlatformMap: Map<string, string>;
};

const TRIP_COUNTDOWN_FRAGMENT: Fragment[] = ["minutes", "seconds"];

const TripCard = memo(function TripCard({ trip, stopIdPlatformMap }: Props) {
  const activeTrip = useTransitStore((s) => s.activeTrip);
  const setActiveTrip = useTransitStore((s) => s.setActiveTrip);
  const articleRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const firstLegDepartureTime = useMemo(
    () =>
      trip.legs[0].from.departure?.estimated?.time ??
      (trip.legs[0].from.departure?.scheduledTime as string),
    [trip],
  );
  const departureDate = useMemo(
    () => new Date(firstLegDepartureTime),
    [firstLegDepartureTime],
  );
  const [priority, setPriority] = useState(() => {
    const msUntilThreshold =
      departureDate.getTime() - Date.now() - 10 * 60 * 1000;

    return msUntilThreshold <= 0 ? true : false;
  });
  const handleExpandCallback = useCallback(() => {
    setExpanded((prev) => !prev);

    if (articleRef.current) {
      articleRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [articleRef]);
  const [departed, setDeparted] = useState(() => {
    return departureDate.getTime() - Date.now() <= 0;
  });
  const hasDelays = useMemo(() => {
    return trip.legs.find((l) => {
      if (l.from.departure?.estimated) {
        const delay = !l.from.departure?.estimated?.time
          ? undefined
          : Math.floor(
              (new Date(l.from.departure.estimated.time).getTime() -
                new Date(l.from.departure.scheduledTime).getTime()) /
                1000 /
                60,
            );
        if (delay) return true;
      }
    });
  }, [trip]);

  const departureTimeString = useMemo(
    () =>
      new Date(firstLegDepartureTime).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      }),
    [firstLegDepartureTime],
  );

  const handleStartTrip = useCallback(() => {
    setActiveTrip(trip);
  }, [activeTrip, setActiveTrip, trip]);

  useEffect(() => {
    const msUntilThreshold =
      departureDate.getTime() - Date.now() - 5 * 60 * 1000;

    if (msUntilThreshold <= 0) return;

    const timeoutId = setTimeout(() => {
      setPriority(true);
    }, msUntilThreshold);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [departureDate]);

  return (
    <Card
      ref={articleRef}
      className={twMerge(
        "cursor-pointer py-0",
        departed && "opacity-50 pointer-events-none",
      )}
    >
      <CardHeader>
        <div
          onClick={handleExpandCallback}
          className="flex pt-4 items-center gap-2 w-full"
        >
          <span className="inline-block align-middle border-r border-r-foreground/10 pr-2">
            <TramFront size={20} />
          </span>
          <span className="w-5/6 inline-block align-middle text-sm opacity-75">
            <span>
              {trip.legs[0].from.name} → {trip.legs[0].to.name}
            </span>
          </span>
          <div className="flex flex-col gap-1 w-1/2 justify-end">
            <DelayPill
              delay={hasDelays ? "Delayed" : undefined}
              className="self-end w-max"
            />
            {priority && !departed ? (
              <Countdown
                target={firstLegDepartureTime}
                fragment={TRIP_COUNTDOWN_FRAGMENT}
                onDone={() => {
                  setDeparted(true);
                }}
              />
            ) : (
              <h3 className="text-lg font-bold text-right">
                {departed ? "Departed" : departureTimeString}
              </h3>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="popLayout">
          <motion.div
            className={twJoin("space-y-2", expanded && "pb-4")}
            transition={{ duration: 0.15 }}
            key={expanded ? "expanded" : "compact"}
            initial={{ opacity: 0, y: expanded ? -8 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: expanded ? 8 : -8 }}
          >
            {expanded && !departed && (
              <>
                {trip.legs.map((l, index) => {
                  const isLast = index === trip.legs.length - 1;
                  const delay = !l.from.departure?.estimated?.time
                    ? undefined
                    : Math.floor(
                        (new Date(l.from.departure.estimated.time).getTime() -
                          new Date(l.from.departure.scheduledTime).getTime()) /
                          1000 /
                          60,
                      );
                  const platform = l.from.stop
                    ? stopIdPlatformMap.get(l.from.stop.gtfsId.split(":")[1])
                    : undefined;
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
                        <div className="flex flex-wrap gap-2 items-center mt-0.5">
                          <p className="font-black">
                            {l.from.departure &&
                              (delay
                                ? new Date(
                                    l.from.departure.estimated!.time,
                                  ).toLocaleTimeString("en", {
                                    minute: "numeric",
                                    hour: "numeric",
                                  })
                                : new Date(
                                    l.from.departure.scheduledTime,
                                  ).toLocaleTimeString("en", {
                                    minute: "numeric",
                                    hour: "numeric",
                                  }))}
                          </p>
                          <span
                            className={twMerge(
                              getColorByLine(l.route?.shortName, "bg"),
                              getColorByLine(l.route?.shortName, "content"),
                              "px-2 rounded-full space-x-2 font-bold",
                            )}
                          >
                            {l.route?.shortName && (
                              <span>{l.route?.shortName[0]} •</span>
                            )}
                            <span>
                              {l.route?.shortName
                                ? ROUTE_TERMINUS[l.route.shortName].compact
                                : "Walk"}
                            </span>
                          </span>
                          {platform && (
                            <span
                              className={twMerge(
                                getColorByLine(l.route?.shortName, "text"),
                                "text-xs text-nowrap",
                              )}
                            >
                              Platform {platform}
                            </span>
                          )}
                          <DelayPill delay={delay} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <StartTripButton onHandleStart={handleStartTrip} />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
});

export const StartTripButton = memo(function StartTripButton({
  onHandleStart,
}: {
  onHandleStart: () => void;
}) {
  const activeTrip = useTransitStore((s) => s.activeTrip);

  return (
    <>
      {activeTrip ? (
        <Dialog>
          <form>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full text-base">
                Start Trip
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-lg">
                  Replace active trip?
                </DialogTitle>
                <DialogDescription className="text-pretty">
                  You already have a trip in progress. Starting this one will
                  replace it.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button className="text-base" size="lg" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    className="text-base"
                    size="lg"
                    onClick={onHandleStart}
                  >
                    Replace Trip
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </form>
        </Dialog>
      ) : (
        <Button className="w-full text-base" size="lg" onClick={onHandleStart}>
          Start Trip
        </Button>
      )}
    </>
  );
});

export default TripCard;
