"use client";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useEffect, useRef, useState } from "react";
import BartMapSVG from "./bart_condensed.svg";
import { useTransitStore } from "@/stores/global";

export default function BartMap() {
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

  return (
    <div className="w-full h-full">
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
    </div>
  );
}
