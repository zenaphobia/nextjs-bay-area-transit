"use client";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/lib/hooks";
import { SavedRoute } from "@/types/localStorage";
import { Trash } from "lucide-react";
import { memo, useCallback } from "react";
import { Stop } from "./TripPlannerPanel";
import { useTransitStore } from "@/stores/global";

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
    <section className="font-mono p-4" aria-labelledby="saved-trips-title">
      <header className="p-4">
        <h2 id="saved-trips-title" className="text-lg font-semibold">
          Saved Trips
        </h2>
        <p className="text-sm opacity-75">
          Routes you&apos;ve saved for quick access.
        </p>
      </header>
      <div className="p-4">
        {localStorage.value.length === 0 ? (
          <p className="text-sm opacity-50 text-center py-8">
            No saved trips yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {localStorage.value.map((route) => (
              <li
                key={route.origin.Name + route.destination.Name}
                className="flex gap-2"
              >
                <Button
                  onClick={() => {
                    handleStationSet(route);
                  }}
                  className="flex-1 flex items-center px-3 rounded-md border border-foreground/10"
                >
                  <span className="text-sm">{route.name}</span>
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

export default SavedTripsPanel;
