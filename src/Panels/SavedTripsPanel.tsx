"use client";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/lib/hooks";
import { SavedRoute } from "@/types/localStorage";
import { Trash } from "lucide-react";
import { memo, useCallback } from "react";
import { useTransitStore } from "@/stores/global";
import { ArrowUpRightIcon } from "lucide-react";
import { BookmarkOff } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const LOCALSTORAGE_KEY = "savedTrips_v1";

const SavedTripsPanel = memo(function SavedTripsPanel() {
  const localStorage = useLocalStorage<SavedRoute[]>({
    key: LOCALSTORAGE_KEY,
    defaultValue: [],
  });

  const handleDelete = useCallback(
    (passedRoute: SavedRoute) => {
      localStorage.setValue((prev) =>
        prev.filter(
          (route) =>
            route.origin.id !== passedRoute.origin.id ||
            route.destination.id !== passedRoute.destination.id,
        ),
      );
    },
    [localStorage],
  );

  const setOriginStation = useTransitStore((s) => s.setOriginStation);
  const setDestinationStation = useTransitStore((s) => s.setDestinationStation);
  const setCurrentView = useTransitStore((s) => s.setCurrentView);

  const handleStationSet = (route: SavedRoute) => {
    setOriginStation(route.origin);
    setDestinationStation(route.destination);
    setCurrentView("trips");
  };

  return (
    <section
      className="font-mono p-4 h-full flex flex-col"
      aria-labelledby="saved-trips-title"
    >
      <header className="p-4 w-full">
        <h2 id="saved-trips-title" className="text-lg font-semibold">
          Saved Trips
        </h2>
        <p className="text-sm opacity-75">
          Routes you&apos;ve saved for quick access.
        </p>
      </header>
      <div className="p-4 flex flex-1 overflow-hidden">
        {localStorage.value.length === 0 ? (
          <NoSavedTrips />
        ) : (
          <ul className="space-y-2 w-full h-full overflow-y-auto">
            {localStorage.value.map((route) => (
              <li
                key={route.origin.Name + route.destination.Name}
                className="flex gap-2 bg-secondary/50 p-2 rounded-lg"
              >
                <Button
                  onClick={() => {
                    handleStationSet(route);
                  }}
                  variant={"ghost"}
                  className="flex-1 flex items-center overflow-hidden px-3 rounded-md"
                >
                  <span className="text-sm truncate w-full">{route.name}</span>
                </Button>
                <Button
                  onClick={() => handleDelete(route)}
                  variant="destructive"
                  aria-label={`Delete ${route.name}`}
                >
                  <Trash />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
});

function NoSavedTrips() {
  const setCurrentView = useTransitStore((s) => s.setCurrentView);

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookmarkOff />
        </EmptyMedia>
        <EmptyTitle>No Saved Trips Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t saved any trips yet. Get started by saving one in the
          trip planner.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button
          onClick={() => {
            setCurrentView("trips");
          }}
        >
          Find Routes
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export default SavedTripsPanel;
