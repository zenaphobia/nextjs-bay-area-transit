"use client";
import StationPicker from "@/components/StationPicker/StationPicker";
import TripCard from "@/components/TripCard/TripCard";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { Edge, OTPResponse } from "@/types/otp";
import { memo, useCallback, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { stopList } from "@/types/types";
import { Star, TramFront, Trash } from "lucide-react";
import { useLocalStorage } from "@/lib/hooks";
import { useTransitStore } from "@/stores/global";
import { SavedRoute } from "@/types/localStorage";
import { ChevronDownIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";

export type Stop = {
  Name: string;
  id: string;
  Location: { Latitude: string; Longitude: string };
};

type OTPInputVariables = {
  originLat: number;
  originLon: number;
  destLat: number;
  destLon: number;
  dateTime: string;
};

const GetTripsButton = memo(function GetTripsButton({
  onClick,
  isDisabled,
  isLoading,
}: {
  onClick: (() => void) | (() => Promise<unknown>);
  isDisabled: boolean;
  isLoading: boolean;
}) {
  return (
    <Button
      size="lg"
      onClick={onClick}
      disabled={isDisabled}
      className="w-7/8 text-md"
    >
      {isLoading && <Spinner />}
      Find Routes
    </Button>
  );
});

const SaveTripButton = memo(function SaveTripButton({
  originStation,
  destinationStation,
}: {
  originStation: Stop | undefined;
  destinationStation: Stop | undefined;
}) {
  const LOCALSTORAGE_KEY = "savedTrips_v1";
  const localStorage = useLocalStorage<SavedRoute[]>({
    key: LOCALSTORAGE_KEY,
    defaultValue: [],
  });

  const isSaved = localStorage.value.some((trip) => {
    if (
      originStation?.id === trip.origin.id &&
      destinationStation?.id === trip.destination.id
    ) {
      return true;
    } else {
      return false;
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSave = useCallback(
    (name?: string) => {
      if (!originStation || !destinationStation) return;

      if (isSaved) {
        localStorage.setValue((prev) =>
          prev.filter(
            (trip) =>
              originStation.id !== trip.origin.id ||
              destinationStation.id !== trip.destination.id,
          ),
        );
      } else {
        localStorage.setValue((prev) => [
          ...prev,
          {
            name:
              name ?? `${originStation?.Name} to ${destinationStation?.Name}`,
            origin: originStation,
            destination: destinationStation,
          },
        ]);
      }
    },
    [originStation, destinationStation, isSaved, localStorage],
  );

  return (
    <>
      {isSaved ? (
        <Button
          disabled={!originStation || !destinationStation}
          onClick={() => handleSave()}
          size="lg"
          className="flex flex-1"
          variant={"outline"}
        >
          <Star fill={isSaved ? "white" : "transparent"} />
        </Button>
      ) : (
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              disabled={!originStation || !destinationStation}
              size="lg"
              className="flex flex-1"
              variant={"outline"}
            >
              <Star fill={isSaved ? "white" : "transparent"} />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Save Trip</DrawerTitle>
              <DrawerDescription>
                Add a name to your custom route
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-4">
              <Input
                ref={inputRef}
                autoFocus
                defaultValue={
                  originStation && destinationStation
                    ? `${originStation?.Name} to ${destinationStation?.Name}`
                    : ""
                }
              ></Input>
              <Button
                onClick={() => {
                  handleSave(inputRef.current?.value);
                }}
                size={"lg"}
                className="w-full"
              >
                Save Route
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
});

type Props = {
  stopList: stopList;
};

const SavedTripsList = memo(function SavedTripsList({
  handleSelect,
}: {
  handleSelect: (trip: SavedRoute) => void;
}) {
  const LOCALSTORAGE_KEY = "savedTrips_v1";

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

  return (
    <Collapsible className="rounded-md">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="group w-full">
          Saved Trips
          <ChevronDownIcon className="ml-auto group-data-[state=open]:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex max-h-[150px] overflow-y-auto flex-col items-start gap-2 pt-2 text-sm overflow-hidden">
        <ul className="w-full space-y-2">
          {localStorage.value.length > 0 &&
            localStorage.value.map((route) => (
              <li key={route.origin.Name + route.destination.Name}>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 flex"
                    variant="outline"
                    onClick={() => {
                      handleSelect(route);
                    }}
                  >
                    {route.name}
                  </Button>
                  <Button
                    onClick={() => {
                      handleDelete(route);
                    }}
                    variant={"destructive"}
                  >
                    <Trash />
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
});

const TripPlannerPanel = memo(function TripPlannerPanel({ stopList }: Props) {
  const [originStation, setOriginStation] = useState<Stop>();
  const [destinationStation, setDestinationStation] = useState<Stop>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | unknown>(null);
  const [trips, setTrips] = useState<Edge[]>([]);
  const plannerOpen = useTransitStore((s) => s.plannerOpen);
  const setPlannerOpen = useTransitStore((s) => s.setPlannerOpen);
  const isDisabled = !originStation || !destinationStation || isLoading;

  const handleDepartingStationSelect = useCallback(
    (station: Stop | undefined) => {
      setOriginStation(station);
    },
    [],
  );

  const handleDestinationStationSelect = useCallback(
    (station: Stop | undefined) => {
      setDestinationStation(station);
    },
    [],
  );

  const clearTrip = useCallback(() => {
    setTrips([]);
    setOriginStation(undefined);
    setDestinationStation(undefined);
  }, []);

  const handleSelect = useCallback((stop: SavedRoute) => {
    setOriginStation(stop.origin);
    setDestinationStation(stop.destination);
  }, []);

  const handleFetch = useCallback(async () => {
    if (!originStation || !destinationStation) return;

    setIsLoading(true);

    const query = `
    query PlanTrip($originLat: CoordinateValue!, $originLon: CoordinateValue!, $destLat: CoordinateValue!, $destLon: CoordinateValue!, $dateTime: OffsetDateTime) {
      planConnection(
        origin: {location: {coordinate: {latitude: $originLat, longitude: $originLon}}}
        destination: {location: {coordinate: {latitude: $destLat, longitude: $destLon}}}
        dateTime: {earliestDeparture: $dateTime}
        modes: {transit: {transit: [{mode: SUBWAY}]}}
      ) {
          edges {
            node {
              start
              end
              legs {
                mode
                from { name lat lon departure { scheduledTime estimated { time delay } } }
                to { name lat lon arrival { scheduledTime estimated { time delay } } }
                route { gtfsId longName shortName }
              }
            }
          }
          }
          }
        `;

    const variables: OTPInputVariables = {
      originLat: Number(originStation.Location.Latitude),
      originLon: Number(originStation.Location.Longitude),
      destLat: Number(destinationStation.Location.Latitude),
      destLon: Number(destinationStation.Location.Longitude),
      dateTime: new Date().toISOString(),
    };

    try {
      const endpoint = process.env.NEXT_PUBLIC_OTP_URL;

      if (!endpoint) {
        throw new Error("[handleFetch] OTP URL env not found!");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });

      const { data } = (await response.json()) as OTPResponse;

      console.log(data.planConnection);
      setTrips(data.planConnection.edges);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [originStation, destinationStation]);

  return (
    <Drawer open={plannerOpen} onOpenChange={setPlannerOpen}>
      <DrawerTrigger asChild className="absolute right-8 top-8">
        <motion.div whileTap={{ scale: 1.1 }}>
          <Button className="rounded-full h-12 w-12" variant={"outline"}>
            <TramFront></TramFront>
          </Button>
        </motion.div>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Trip Planner</DrawerTitle>
          <DrawerDescription>
            Find the best route between any two Bay Area stations.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 overflow-hidden h-screen flex flex-col font-mono gap-4">
          <section className="space-y-8 mb-8">
            <div className="space-y-4">
              <StationPicker
                label="Choose Origin Station"
                value={originStation}
                items={stopList}
                id="departing"
                onChange={handleDepartingStationSelect}
              />
              <StationPicker
                label="Choose Destination Station"
                value={destinationStation}
                items={stopList}
                id="destination"
                onChange={handleDestinationStationSelect}
              />
              <SavedTripsList handleSelect={handleSelect} />
            </div>

            <div className="flex gap-2 items-center justify-between">
              <GetTripsButton
                onClick={handleFetch}
                isDisabled={isDisabled}
                isLoading={isLoading}
              ></GetTripsButton>
              <SaveTripButton
                destinationStation={destinationStation}
                originStation={originStation}
              />
            </div>
          </section>
          <TripSection trips={trips} />
        </div>
      </DrawerContent>
    </Drawer>
  );
});

const TripSection = memo(function TripSection({ trips }: { trips: Edge[] }) {
  return (
    <>
      {trips.length > 0 ? (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-1 flex-col justify-between overflow-hidden"
        >
          <TripList trips={trips} />
          <div className="text-center text-sm opacity-50 mt-4">
            <span>{trips?.length} trips found</span>
          </div>
        </motion.section>
      ) : (
        <div className="flex flex-col gap-4 items-center justify-center w-full h-full opacity-50">
          <TramFront size={"52"}></TramFront>
          <p>Pick your start and end stations to get going.</p>
        </div>
      )}
    </>
  );
});

const TripList = memo(function TripList({ trips }: { trips: Edge[] }) {
  return (
    <ul className="space-y-8 overflow-y-auto">
      {trips.map((t, i) => {
        return (
          <motion.li
            key={t.node.start + t.node.end}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ scrollbarGutter: "stable" }}
          >
            <p className="text-sm opacity-50 mb-1">
              Trip {i + 1}/{trips.length}
            </p>
            <TripCard trip={t.node} />
          </motion.li>
        );
      })}
    </ul>
  );
});

export default TripPlannerPanel;
