import { Button } from "@/components/ui/button";
import { useTransitStore } from "@/stores/global";
import { getColorByLine } from "@/transit/utils";
import { TramFront, Footprints } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";

const ActiveTripPlanel = memo(function ActiveTripPanel() {
  const activeTrip = useTransitStore((s) => s.activeTrip);
  const setActiveTrip = useTransitStore((s) => s.setActiveTrip);
  const [collapsed, setCollapsed] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!activeTrip) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [activeTrip]);

  const currentLegIndex = useMemo(() => {
    if (!activeTrip?.legs) return -1;
    let idx = -1;
    for (let i = 0; i < activeTrip.legs.length; i++) {
      const dep = activeTrip.legs[i].from.departure?.scheduledTime;
      if (!dep) continue;
      console.log("idx", new Date(dep).getTime(), now);
      if (new Date(dep).getTime() > now) {
        idx = i;
        break;
      } else break;
    }
    return idx;
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

  useEffect(() => {
    console.log({ currentLegIndex });
  }, [currentLegIndex, activeTrip]);

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
          className="font-mono bg-secondary w-full overflow-hidden"
          aria-labelledby="active-trip-title"
        >
          <header className="p-4 w-full">
            <h2 id="active-trip-title" className="text-lg font-semibold">
              Current Trip
            </h2>
            {`${start?.name} → ${end?.name} `}
          </header>
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
                        </motion.div>
                      );
                    })}
                  {activeTrip && (
                    <Button
                      onClick={handleCancelTrip}
                      className="w-full"
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
