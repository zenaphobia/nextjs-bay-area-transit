"use client";

import { Bell, Bookmark, Map, Route } from "lucide-react";
import { memo, useState, type ComponentType, type SVGProps } from "react";
import { View, views } from "./types";
import { Button } from "../ui/button";
import { motion } from "motion/react";
import { useTransitStore } from "@/stores/global";

const viewIcons: Record<View, ComponentType<SVGProps<SVGSVGElement>>> = {
  trips: Route,
  map: Map,
  savedTrips: Bookmark,
  alerts: Bell,
};

const Navbar = memo(function Navbar() {
  const currentView = useTransitStore((s) => s.currentView);
  const setCurrentView = useTransitStore((s) => s.setCurrentView);
  const CurrentIcon = viewIcons[currentView];
  const currentIndex = views.indexOf(currentView);

  return (
    <nav
      className="w-[80%] border-primary-foreground border rounded-lg mb-4"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-4 relative p-4">
        <motion.div
          aria-hidden="true"
          animate={{ x: `${currentIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="absolute inset-y-4 left-6 w-[calc((100%-3rem)/4)] border-primary/15 border bg-secondary flex items-center justify-center rounded-md"
        >
          <CurrentIcon aria-hidden="true" className="size-6" />
        </motion.div>

        {views.map((v) => {
          const Icon = viewIcons[v];
          return (
            <li key={v} className="flex flex-col items-center gap-1 rounded-md">
              <Button
                onClick={() => {
                  setCurrentView(v);
                }}
                className="p-4 hover:bg-transparent!"
                size={"lg"}
                variant={"ghost"}
              >
                <Icon aria-hidden="true" className="size-6" />
              </Button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
});

export default Navbar;
