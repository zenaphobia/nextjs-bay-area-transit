import { Button } from "@/components/ui/button";
import { useTransitStore } from "@/stores/global";
import { ROUTE_TERMINUS } from "@/transit/constants";
import { getColorByLine } from "@/transit/utils";
import { TramFront, Footprints } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Separator } from "@/components/ui/separator";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ChevronDown } from "lucide-react";
import DelayPill from "@/components/TripCard/DelayPill";
import { useInterval } from "@/components/Countdown/hooks";
import { legQuery } from "@/queries/graphiql";

type Props = {
  stopIdPlatformMap: Map<string, string>;
};

const ActiveTripPlanel = memo(function ActiveTripPanel({
  stopIdPlatformMap,
}: Props) {
  const activeTrip = useTransitStore((s) => s.activeTrip);
  const setActiveTrip = useTransitStore((s) => s.setActiveTrip);
  const [collapsed, setCollapsed] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const endpoint = process.env.NEXT_PUBLIC_OTP_URL;

  useEffect(() => {
    if (!activeTrip) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [activeTrip]);

  useInterval(
    () => {
      if (!activeTrip) return;
      if (!endpoint) {
        throw new Error("No endpoint");
      }

      Promise.all(
        activeTrip.legs.map(async (leg) => {
          if (leg.mode === "WALK") return leg;
          if (!leg.id) {
            console.warn("No ID provided for leg update");
            return leg;
          }

          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: legQuery,
              variables: { id: leg.id },
            }),
          });
          if (!res.ok) return leg;

          const { data } = await res.json();
          return {
            ...leg,
            from: { ...leg.from, departure: data.leg.from.departure },
            to: { ...leg.to, arrival: data.leg.to.arrival },
          };
        }),
      ).then((updatedLegs) => {
        setActiveTrip({ ...activeTrip, legs: updatedLegs });
      });
    },
    activeTrip ? 1000 * 60 : null,
  );

  const currentLegIndex = useMemo(() => {
    if (!activeTrip?.legs) return -1;
    let idx = 0;
    try {
      for (let i = 0; i < activeTrip.legs.length; i++) {
        const departure = activeTrip.legs[i].from.departure;
        const dep = departure?.estimated?.time ?? departure?.scheduledTime;
        if (!dep) continue;
        if (now > new Date(dep).getTime()) {
          idx = i;
        } else break;
      }
      return idx;
    } catch {
      console.error("Failed to get currentLegIndex");
      return -1;
    }
  }, [activeTrip, now]);

  const handleCancelTrip = useCallback(() => {
    setActiveTrip(null);
    setCollapsed(true);
  }, [setActiveTrip]);

  const start =
    activeTrip?.legs[0].from.name === "Origin"
      ? activeTrip?.legs[0].to
      : activeTrip?.legs[0].from;
  const end =
    activeTrip?.legs[activeTrip.legs.length - 1].from.name === "Origin"
      ? activeTrip?.legs[activeTrip.legs.length - 1].to
      : activeTrip?.legs[activeTrip.legs.length - 1].from;

  const ease = [0.32, 0.72, 0, 1] as const;

  return (
    <AnimatePresence initial={false}>
      {activeTrip && (
        <motion.section
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            height: { duration: 0.35, ease },
            opacity: { duration: 0.25, ease },
          }}
          onClick={() => {
            setCollapsed((prev) => !prev);
          }}
          className="font-mono bg-secondary w-full overflow-hidden z-[20] cursor-pointer"
          aria-labelledby="active-trip-title"
        >
          <header className="p-4 w-full flex justify-between items-center">
            <div>
              <h2 id="active-trip-title" className="text-lg font-semibold">
                Current Trip
              </h2>
              {`${start?.name} → ${end?.name} `}
            </div>
            <ChevronDown
              className="transition-transform"
              style={{
                transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
              }}
            />
          </header>

          <Separator />

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="trip-details"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: { duration: 0.35, ease },
                  opacity: { duration: 0.25, ease, delay: 0.05 },
                }}
                className="overflow-hidden"
              >
                <div className="p-4">
                  {activeTrip &&
                    activeTrip.legs.map((l, index) => {
                      const isLast = index === activeTrip.legs.length - 1;
                      const isPast = index < currentLegIndex;
                      const isCurrent = index === currentLegIndex;
                      const delay = !l.from.departure?.estimated?.time
                        ? undefined
                        : Math.floor(
                            (new Date(
                              l.from.departure.estimated.time,
                            ).getTime() -
                              new Date(
                                l.from.departure.scheduledTime,
                              ).getTime()) /
                              1000 /
                              60,
                          );
                      const platform = l.from.stop
                        ? stopIdPlatformMap.get(
                            l.from.stop.gtfsId.split(":")[1],
                          )
                        : undefined;
                      return (
                        <motion.div
                          key={`${l.mode}-${l.from.name}-${l.to.name}-${l.from.departure?.scheduledTime ?? l.to.arrival?.scheduledTime}-full`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: isPast ? 0.4 : 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            ease,
                            delay: 0.08 + index * 0.05,
                          }}
                          className={twMerge(
                            "flex gap-3",
                            isCurrent && "font-semibold",
                          )}
                        >
                          <div className="flex flex-col items-center pl-4">
                            <div className="relative shrink-0 mb-1">
                              {isCurrent && (
                                <span className="absolute size-2">
                                  <span className="absolute -left-4 top-1/2  inline-flex h-full w-full animate-ping rounded-full bg-greenline opacity-75"></span>
                                  <span className="absolute -left-4 top-1/2 inline-flex size-2 rounded-full bg-greenline"></span>
                                </span>
                              )}
                              {l.mode === "SUBWAY" ? (
                                <TramFront size={18} />
                              ) : (
                                <Footprints size={18} />
                              )}
                            </div>
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
                            <div className="flex flex-wrap gap-2 items-center mt-0.5">
                              <p className="font-black">
                                {l.from.departure &&
                                  new Date(
                                    delay
                                      ? l.from.departure.estimated!.time
                                      : l.from.departure.scheduledTime,
                                  ).toLocaleTimeString("en", {
                                    minute: "numeric",
                                    hour: "numeric",
                                  })}
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
                        </motion.div>
                      );
                    })}
                  {activeTrip && (
                    <Button
                      onClick={handleCancelTrip}
                      className="w-full text-base"
                      size={"lg"}
                      variant={"destructive"}
                    >
                      End Trip
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      )}
    </AnimatePresence>
  );
});

export default ActiveTripPlanel;
