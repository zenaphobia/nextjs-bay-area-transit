"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Tram } from "../types/types";
import { AnimatePresence, motion } from "motion/react";
import { twJoin, twMerge } from "tailwind-merge";
import { getColorByLine } from "../transit/utils";
import { ROUTE_TERMINUS } from "../transit/constants";
import Countdown from "./Countdown/Countdown";

const TramCard = memo(function TramCard({ tram }: { tram: Tram }) {
  const departureTimeString = new Date(
    (tram.StopTimeUpdate.departure?.time as number) * 1000,
  ).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" });

  const departureDate = useMemo(
    () => new Date((tram.StopTimeUpdate.departure?.time as number) * 1000),
    [tram.StopTimeUpdate.departure?.time],
  );

  const delay = tram.StopTimeUpdate.arrival?.delay;
  const [display, setDisplay] = useState<"full" | "compact">(() => {
    const now = Date.now();
    const distanceInMin = Math.floor(
      (departureDate.getTime() - now) / 1000 / 60,
    );

    return distanceInMin <= 5 ? "full" : "compact";
  });
  const toggleView = useCallback(() => {
    setDisplay((prev) => {
      if (prev === "compact") return "full";
      return "compact";
    });
  }, []);
  const terminus = ROUTE_TERMINUS[`${tram.Trip.routeId}`];
  const [hasDeparted, setHasDeparted] = useState(false);

  useEffect(() => {
    const msUntilThreshold =
      departureDate.getTime() - Date.now() - 5 * 60 * 1000;

    if (msUntilThreshold <= 0) return;

    const timeoutId = setTimeout(() => {
      setDisplay("full");
    }, msUntilThreshold);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [departureDate]);

  return (
    <motion.li
      layout
      className={twJoin(
        "border border-white/15 overflow-hidden gap-1 rounded-lg flex justify-between",
        hasDeparted && "opacity-50",
      )}
    >
      <AnimatePresence mode="wait">
        <button onClick={toggleView} className="w-full h-full flex">
          {display === "full" ? (
            <motion.div
              layout
              key="full"
              transition={{ duration: 0.5 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-between gap-1 w-full"
            >
              <div
                className={twMerge(
                  "min-w-5 h-auto",
                  getColorByLine(tram.Trip.routeId as string),
                )}
              ></div>
              <div className="flex justify-between w-full p-4">
                <div className="flex flex-col gap-1 text-left">
                  <h3 className="font-bold text-lg opacity-80">
                    {terminus.full}
                  </h3>
                  <p
                    className={twMerge(
                      "text-xs",
                      getColorByLine(tram.Trip.routeId as string, "text"),
                    )}
                  >
                    {tram.Trip.routeId?.split("-")[0]} → {terminus.full}
                  </p>
                </div>

                <div className="flex flex-col gap-1 text-right">
                  {delay ? (
                    <div className="flex px-4 py-0.5 text-center justify-center text-xs rounded-full bg-red-900">
                      <h2 className="font-bold text-center">
                        +{Math.floor(delay / 60)} MIN
                      </h2>
                    </div>
                  ) : null}
                  {!hasDeparted ? (
                    <motion.div exit={{ opacity: 0 }}>
                      <Countdown
                        onDone={() => {
                          setHasDeparted(true);
                        }}
                        target={departureDate}
                        fragment={["minutes", "seconds"]}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <h6>Departed</h6>
                    </motion.div>
                  )}
                  <h4 className="text-sm opacity-50">{departureTimeString}</h4>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              layout
              key="compact"
              transition={{ duration: 0.5 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-full justify-between items-center gap-4"
            >
              <div
                className={twMerge(
                  "min-w-5 h-full",
                  getColorByLine(tram.Trip.routeId as string),
                )}
              ></div>
              <div className="w-full gap-2 flex justify-between items-center">
                <h3 className="font-bold text-sm opacity-75 w-max-[25%] truncate">
                  {terminus.compact}
                </h3>
                <p
                  className={twMerge(
                    "text-xs",
                    getColorByLine(tram.Trip.routeId as string, "text"),
                  )}
                >
                  {tram.Trip.routeId?.split("-")[0]} → {terminus.compact}
                </p>
                {delay ? (
                  <div className="flex px-1 text-center justify-center text-[10px] min-w-[50px] rounded-full bg-red-900">
                    <h2 className="font-bold text-center">
                      +{Math.floor(delay / 60)} MIN
                    </h2>
                  </div>
                ) : null}
                <h1 className="text-lg font-bold mr-4 min-w-1/4">
                  {departureTimeString}
                </h1>
              </div>
            </motion.div>
          )}
        </button>
      </AnimatePresence>
    </motion.li>
  );
});

export default TramCard;
