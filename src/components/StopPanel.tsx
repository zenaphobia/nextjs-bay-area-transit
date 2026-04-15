import { useState } from "react";
import TransitCard from "./TransitCard";
import { StationTrams } from "@/types/types";
import { motion } from "motion/react";
import { Button } from "./ui/button";

function StopPanel({ activeStop }: { activeStop: StationTrams }) {
  const [showingAll, setShowingAll] = useState(false);

  return (
    <motion.aside
      key={activeStop.Name}
      initial={{ y: 25 }}
      animate={{ y: 0 }}
      className="space-y-4 h-[300px] w-full absolute bottom-2"
    >
      <div className="border border-white/25 rounded-lg p-2 h-full flex flex-col gap-4 bg-black">
        <button className="w-[75px] h-1.25 min-h-1.25 mx-auto mt-2 bg-foreground rounded-full"></button>
        <p className="text-center text-xl">{activeStop.Name}</p>
        <hr className="opacity-25" />
        <ul className="space-y-2 overflow-y-auto">
          {activeStop.trams.length > 0 ? (
            activeStop.trams
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

          {activeStop.trams.length >= 5 && !showingAll && (
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
    </motion.aside>
  );
}

export default StopPanel;
