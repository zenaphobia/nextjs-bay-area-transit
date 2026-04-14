import { memo, useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import "./styles.css";
import { twMerge } from "tailwind-merge";

type Props = {
  id: string;
  items: { Name: string; id: string }[];
  onChange: (station: string | undefined) => void;
};

const DataList = memo(function DataList({ items, onChange, id }: Props) {
  const uniqueStops = useMemo(() => {
    return items.filter(
      (stop, i, arr) => arr.findIndex((s) => s.Name === stop.Name) === i,
    );
  }, [items]);

  const [input, setInput] = useState("");

  const filteredStops = useMemo(() => {
    return uniqueStops.filter((stop) =>
      stop.Name.toLowerCase().includes(input.toLowerCase()),
    );
  }, [uniqueStops, input]);

  const popoverRef = useRef<HTMLDivElement>(null);

  const [station, setStation] = useState("");

  function handleSelect(station: string) {
    onChange(station);
    setStation(station);
    if (popoverRef.current) popoverRef.current.hidePopover();
  }

  return (
    <div className="p-2 w-full top-4 absolute left-0 overflow-hidden">
      <div className="w-full p-2 relative">
        <button
          popoverTarget="station_list"
          className="w-full cursor-pointer px-2 py-1 shadow-md bg-background rounded-full text-white active:bg-white/80 transition-all border border-white/25"
        >
          Find Station
        </button>
        <motion.div
          ref={popoverRef}
          className="w-[80%] shadow-sm space-y-4 left-1/2 -translate-x-1/2 top-20 bg-background border border-white/25 rounded-md text-white p-2"
          id="station_list"
          popover="hint"
        >
          <input
            autoFocus
            popoverTarget="station_list"
            name="Station Finder"
            id="Station Finder"
            onInput={(e) => {
              const el = e.target as HTMLInputElement;

              if (el) setInput(el.value as string);
            }}
            placeholder="Search stations..."
            className="border text-sm px-3 py-1 border-white/25 rounded-full w-full"
            list={id}
          />
          <motion.ul
            className="max-h-[250px] overflow-y-auto overflow-x-hidden"
            style={{ scrollbarGutter: "stable" }}
          >
            <AnimatePresence initial={false}>
              {filteredStops.map((stop) => (
                <motion.li
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className={twMerge(
                    "bg-transparent cursor-pointer hover:bg-white/5 px-2 py-1 rounded-md transition-colors",
                    station === stop.Name && "bg-white/10",
                  )}
                  onClick={() => {
                    handleSelect(stop.Name);
                  }}
                  key={stop.Name}
                >
                  {stop.Name}
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </motion.div>
      </div>
    </div>
  );
});

export default DataList;
