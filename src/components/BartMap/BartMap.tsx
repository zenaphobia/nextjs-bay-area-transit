"use client";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useCallback, useEffect, useRef, useState } from "react";
import BartMapSVG from "./bart_condensed.svg";
import { useTransitStore } from "@/stores/global";
import StopPanel from "../StopPanel";
import { Stops, stopList } from "@/app/page";
import StationPicker, { Stop } from "../StationPicker/StationPicker";

export default function BartMap({
  stops,
  stopList,
}: {
  stops: Stops;
  stopList: stopList;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const stations = useRef<SVGElement>(null);
  const details = useRef<SVGElement>(null);
  const [ready, setReady] = useState(false);

  const scale = useTransitStore((s) => s.scale);
  const setScale = useTransitStore((s) => s.setScale);

  useEffect(() => {
    if (!svgRef.current) return;

    stations.current = svgRef.current.querySelector<SVGElement>(
      "#bart_condensed_svg__stations",
    );
    details.current = svgRef.current.querySelector<SVGElement>(
      "#bart_condensed_svg__detail",
    );

    if (stations.current) stations.current.style.opacity = ".15";

    if (details.current) details.current.style.opacity = "0";

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, []);

  useEffect(() => {
    if (!stations.current || !details.current) return;

    if (scale < 2) {
      stations.current.style.opacity = ".15";
      details.current.style.opacity = "0";
    }

    if (scale > 2) {
      stations.current.style.opacity = "1";
      details.current.style.opacity = ".15";
    }

    if (scale > 3) {
      details.current.style.opacity = "1";
    }
  }, [scale]);

  const setActiveStation = useTransitStore((s) => s.setActiveStop);

  const handleStationChange = useCallback(
    (stop: Stop | undefined) => {
      setActiveStation(stop?.Name ?? null);
    },
    [setActiveStation],
  );

  return (
    <div className="w-screen h-screen left-0 top-0 relative">
      <StationPicker
        className="absolute top-8 left-1/2 -translate-x-1/2 z-[10] px-4"
        id="stop picker"
        items={stopList}
        label="Choose Station"
        onChange={handleStationChange}
      />
      <TransformWrapper
        onTransform={(_, { scale }) => {
          setScale(Math.round(scale));
        }}
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{ width: "100%", height: "100%" }}
        >
          <BartMapSVG
            className="*:transition-opacity transition-opacity duration-500"
            style={{ opacity: ready ? "1" : "0" }}
            ref={svgRef}
          />
        </TransformComponent>
      </TransformWrapper>
      <StopPanel stops={stops} />
    </div>
  );
}
