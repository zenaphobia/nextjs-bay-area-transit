"use client";
import { AlertTriangle, Info } from "lucide-react";
import { memo } from "react";

type AlertSeverity = "info" | "warning";

type Alert = {
  id: string;
  severity: AlertSeverity;
  title: string;
  body: string;
  postedAt: string;
};

const SAMPLE_ALERTS: Alert[] = [
  {
    id: "1",
    severity: "warning",
    title: "Yellow Line delays",
    body: "Trains are running 10–15 minutes behind schedule due to track maintenance near 24th St Mission.",
    postedAt: "2026-04-30T08:12:00Z",
  },
  {
    id: "2",
    severity: "info",
    title: "Weekend service change",
    body: "Trains between Embarcadero and West Oakland will single-track this Saturday from 8pm to 5am.",
    postedAt: "2026-04-29T17:00:00Z",
  },
  {
    id: "3",
    severity: "info",
    title: "New schedule effective May 5",
    body: "Updated weekday timetables take effect Monday. Check station signage for details.",
    postedAt: "2026-04-28T12:30:00Z",
  },
];

const severityIcon: Record<AlertSeverity, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
};

const severityClass: Record<AlertSeverity, string> = {
  info: "text-foreground/70",
  warning: "text-yellow-500",
};

const AlertsPanel = memo(function AlertsPanel() {
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
        <ul className="space-y-3">
          {SAMPLE_ALERTS.map((alert) => {
            const Icon = severityIcon[alert.severity];
            return (
              <li
                key={alert.id}
                className="flex gap-3 p-3 rounded-md border border-foreground/10"
              >
                <Icon
                  aria-hidden="true"
                  className={`size-5 shrink-0 mt-0.5 ${severityClass[alert.severity]}`}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{alert.title}</h3>
                  <p className="text-sm opacity-75 mt-1">{alert.body}</p>
                  <time
                    dateTime={alert.postedAt}
                    className="text-xs opacity-50 mt-2 block"
                  >
                    {new Date(alert.postedAt).toLocaleString("en", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </time>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
});

export default AlertsPanel;
