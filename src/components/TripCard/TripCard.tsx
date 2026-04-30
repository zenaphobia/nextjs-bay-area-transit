"use client";
import { Node } from "@/types/otp";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { TramFront, Footprints } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { twJoin, twMerge } from "tailwind-merge";
import { Button } from "../ui/button";
import { getColorByLine } from "@/transit/utils";
import Countdown, { Fragment } from "../Countdown/Countdown";
import { useTransitStore } from "@/stores/global";

type Props = {
  trip: Node;
};

const TRIP_COUNTDOWN_FRAGMENT: Fragment[] = ["minutes", "seconds"];

const TripCard = memo(function TripCard({ trip }: Props) {
  const setActiveTrip = useTransitStore((s) => s.setActiveTrip);
  const activeTrip = useTransitStore((s) => s.activeTrip);
  const articleRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const departureTimeString = useMemo(
    () =>
      new Date(
        trip.legs[0].from.departure?.scheduledTime as string,
      ).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" }),
    [trip],
  );
  const departureDate = useMemo(
    () => new Date(trip.legs[0].from.departure?.scheduledTime as string),
    [trip],
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
    const msUntilThreshold = departureDate.getTime() * 1000;

    return msUntilThreshold <= 0 ? true : false;
  });

  const handleStartTrip = useCallback(() => {
    setActiveTrip(trip);
  }, [setActiveTrip, trip]);

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
    <article
      ref={articleRef}
      className={twMerge(
        "p-1 cursor-pointer",
        departed && "opacity-50 pointer-events-none",
      )}
      onClick={handleExpandCallback}
    >
      <Card>
        <CardContent>
          <div
            className="flex items-center gap-2 w-full"
            key={`${trip.legs[0].mode}-${trip.legs[0].from.name}-${trip.legs[0].to.name}-${trip.legs[0].from.departure?.scheduledTime ?? trip.legs[0].to.arrival?.scheduledTime}-compact`}
          >
            <span className="inline-block align-middle border-r border-r-foreground/10 pr-2">
              <TramFront size={20} />
            </span>
            <span className="w-5/6 inline-block align-middle text-sm opacity-75">
              <span>
                {trip.legs[0].from.name} → {trip.legs[0].to.name}
              </span>
            </span>
            {priority ? (
              <Countdown
                target={trip.legs[0].from.departure!.scheduledTime}
                fragment={TRIP_COUNTDOWN_FRAGMENT}
              />
            ) : (
              <h3 className="text-lg font-bold w-1/2 text-right">
                {departed ? "Departed" : departureTimeString}
              </h3>
            )}
          </div>
          <AnimatePresence mode="popLayout">
            <motion.div
              className={twJoin("space-y-2", expanded && "mt-8")}
              transition={{ duration: 0.15 }}
              key={expanded ? "expanded" : "compact"}
              initial={{ opacity: 0, y: expanded ? -8 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: expanded ? 8 : -8 }}
            >
              {expanded && (
                <>
                  {trip.legs.map((l, index) => {
                    const isLast = index === trip.legs.length - 1;
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
                            className={getColorByLine(
                              l.route?.shortName,
                              "text",
                            )}
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
                              className={getColorByLine(
                                l.route?.shortName,
                                "text",
                              )}
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
                  <Button
                    variant={activeTrip ? "destructive" : "default"}
                    onClick={handleStartTrip}
                    className="w-full mt-4"
                  >
                    {activeTrip ? "Start New Trip" : "Start Trip"}
                  </Button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </article>
  );
});

export default TripCard;
