import { Button } from "@/components/ui/button";
import { useTransitStore } from "@/stores/global";
import { getColorByLine } from "@/transit/utils";
import { TramFront, Footprints } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";

const ActiveTripPlanel = memo(function ActiveTripPanel() {
  const activeTrip = useTransitStore((s) => s.activeTrip);
  const setActiveTrip = useTransitStore((s) => s.setActiveTrip);
  const [collapsed, setCollapsed] = useState(true);

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

  return (
    <AnimatePresence mode="wait">
      {activeTrip && (
        <motion.section
          initial={{ height: "0px" }}
          animate={{ height: "auto" }}
          onClick={() => {
            setCollapsed((prev) => !prev);
          }}
          className="font-mono bg-secondary w-full"
          aria-labelledby="active-trip-title"
        >
          <header className="p-4 w-full">
            <h2 id="active-trip-title" className="text-lg font-semibold">
              Current Trip
            </h2>
            {`${start?.name} → ${end?.name} `}
          </header>
          {!collapsed && (
            <motion.div
              initial={{ height: "0px" }}
              animate={{ height: "auto" }}
              className="p-4"
            >
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
            </motion.div>
          )}
        </motion.section>
      )}
    </AnimatePresence>
  );
});

export default ActiveTripPlanel;
