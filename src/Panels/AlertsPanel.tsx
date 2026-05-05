"use client";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useTransitStore } from "@/stores/global";
import { ServiceAlerts } from "@/transit/hooks";
import { AlertTriangle, BellOff, CircleAlert } from "lucide-react";
import { memo } from "react";

const AlertsPanel = memo(function AlertsPanel({
  alerts,
}: {
  alerts: ServiceAlerts | undefined;
}) {
  return (
    <section className="font-mono h-screen p-4" aria-labelledby="alerts-title">
      <header className="p-4">
        <h2 id="alerts-title" className="text-lg font-semibold">
          Alerts
        </h2>
        <p className="text-sm opacity-75">
          Service advisories and schedule changes.
        </p>
      </header>
      <div className="p-4">
        {alerts === undefined ? (
          <ErrorFetchingServiceAlerts />
        ) : alerts.Entities.length === 0 ? (
          <NoServiceAlerts />
        ) : (
          <ul className="space-y-3">
            {alerts.Entities.map((alert) => {
              const Icon = AlertTriangle;
              return (
                <li
                  key={alert.Id}
                  className="flex gap-3 p-3 rounded-md border border-foreground/10"
                >
                  <Icon
                    aria-hidden="true"
                    className="size-5 shrink-0 mt-0.5 text-yellow-500"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">
                      {alert.Alert.HeaderText.Translations[0].Text}
                    </h3>
                    <p className="text-sm opacity-75 mt-1">
                      {alert.Alert.DescriptionText.Translations[0].Text}
                    </p>
                    <time
                      dateTime={alerts.Header.Timestamp.toString()}
                      className="text-xs opacity-50 mt-2 block"
                    >
                      {new Date(alerts.Header.Timestamp * 1000).toLocaleString(
                        "en",
                        {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        },
                      )}
                    </time>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
});

function ErrorFetchingServiceAlerts() {
  const setCurrentView = useTransitStore((s) => s.setCurrentView);

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleAlert />
        </EmptyMedia>
        <EmptyTitle>Couldn&apos;t load alerts</EmptyTitle>
        <EmptyDescription>
          Service alerts are temporarily unavailable. Please try again later.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button
          onClick={() => {
            setCurrentView("trips");
          }}
        >
          Find Trips
        </Button>
      </EmptyContent>
    </Empty>
  );
}

function NoServiceAlerts() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BellOff />
        </EmptyMedia>
        <EmptyTitle>No active alerts</EmptyTitle>
        <EmptyDescription>
          All transit services are running as scheduled.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export default AlertsPanel;
