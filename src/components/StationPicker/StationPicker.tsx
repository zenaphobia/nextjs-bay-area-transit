import React, {
  InputEventHandler,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import "./styles.css";
import { twMerge } from "tailwind-merge";
import { Input } from "../ui/input";
import { Stop } from "@/app/plan/page";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import { ButtonGroup } from "../ui/button-group";
import { CircleX } from "lucide-react";

type Props = {
  id: string;
  items: Stop[];
  onChange: (station: Stop | undefined) => void;
  label: string;
  value?: Stop;
};

const DataList = memo(function DataList({
  items,
  onChange,
  id,
  label,
  value,
}: Props) {
  const uniqueStops = useMemo(() => {
    return items.filter(
      (stop, i, arr) => arr.findIndex((s) => s.Name === stop.Name) === i,
    );
  }, [items]);

  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredStops = useMemo(() => {
    return uniqueStops.filter((stop) =>
      stop.Name.toLowerCase().includes(input.toLowerCase()),
    );
  }, [uniqueStops, input]);

  const [station, setStation] = useState("");

  const handleSelect = useCallback(
    (station: Stop | undefined) => {
      console.log("handleSelect called: ", station);
      onChange(station);
      setStation(station?.Name ?? "");
      setInput(station?.Name ?? "");
      setIsFocused(false);
      if (inputRef.current && station?.Name) {
        inputRef.current.value = station.Name;
      }

      if (!station) inputRef.current!.value = "";
    },
    [onChange],
  );

  const clearField = useCallback(() => {
    handleSelect(undefined);
  }, [handleSelect]);

  const handleOnFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleOnBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleInput = useCallback<InputEventHandler<HTMLInputElement>>((e) => {
    setInput(e.currentTarget.value);
  }, []);

  useEffect(() => {
    if (value) {
      console.log("Value changed");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSelect(value);
    }
  }, [value, handleSelect]);

  return (
    <div className="w-full relative">
      <Field>
        <ButtonGroup>
          <Input
            ref={inputRef}
            placeholder={label}
            onFocus={handleOnFocus}
            onBlur={handleOnBlur}
            className="relative w-full p-4"
            onInput={handleInput}
          ></Input>
          <Button
            size={"lg"}
            className="p-4"
            onClick={clearField}
            variant={"outline"}
          >
            <CircleX></CircleX>
          </Button>
        </ButtonGroup>
      </Field>
      {isFocused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="w-full shadow-sm absolute top-10 space-y-4 bg-background border border-white/25 rounded-md text-white p-2 z-[100]"
          id={`station_list-${id}`}
        >
          <motion.ul
            className="max-h-[250px] overflow-y-auto overflow-x-hidden"
            style={{ scrollbarGutter: "stable" }}
          >
            <AnimatePresence initial={false}>
              {filteredStops.map((stop) => (
                <StationItem
                  key={stop.Name}
                  stop={stop}
                  isSelected={station === stop.Name}
                  onSelect={handleSelect}
                  inputRef={inputRef}
                />
              ))}
            </AnimatePresence>
          </motion.ul>
        </motion.div>
      )}
    </div>
  );
});

const StationItem = memo(function StationItem({
  stop,
  isSelected,
  onSelect,
  inputRef,
}: {
  stop: Stop;
  isSelected: boolean;
  onSelect: (stop: Stop) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onSelect(stop);
      if (inputRef.current) inputRef.current.value = stop.Name;
    },
    [stop, onSelect, inputRef],
  );

  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className={twMerge(
        "bg-transparent cursor-pointer hover:bg-white/5 px-2 py-1 rounded-md transition-colors",
        isSelected && "bg-white/10",
      )}
      onMouseDown={handleMouseDown}
    >
      {stop.Name}
    </motion.li>
  );
});

export default DataList;
