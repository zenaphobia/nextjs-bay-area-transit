# Bay Area Transit Application

A real-time BART transit tracker built with React, TypeScript, and Next.js. This project pairs the 511 MTC API's GTFS Realtime feed with an interactive map, stop-centric departure UI, and OpenTripPlanner-powered routing.

> **Status:** Work-in-progress. Core features and infrastructure are in place; remaining work is on map polish, push notifications, and a final UX pass.

## Stack

- **Frontend:** React · TypeScript · Next.js · Framer Motion · Tailwind CSS · Zustand
- **Map:** react-zoom-pan-pinch
- **Backend:** Cloudflare Worker proxying 511 GTFS Realtime protobuf data
- **Routing:** OpenTripPlanner (GraphQL) with BART GTFS Static + OSM data, deployed on Fly.io
- **PWA:** Web App Manifest + service worker (installable, offline-shell)
- **Deployment:** Netlify

## Features

### Live departures
- **Stop-centric departure cards** — all upcoming arrivals across lines, with time-based card states (hero countdown ≤ 5 min, compact view shows absolute time)
- **Real-time polling** — `useTransitFeed` hook drives efficient protobuf polling via the Cloudflare Worker
- **Delay surfacing** — `DelayPill` component renders `+X MIN` when GTFS-RT reports a delay; departure times reflect the realtime (delay-baked-in) timestamp
- **Service alerts panel** — 511 alerts pulled alongside the feed and surfaced in a dedicated panel

### Trip planning
- **OpenTripPlanner integration** — GraphQL `planConnection` query against the deployed OTP server; multi-leg results with walking + transit segments
- **Trip card** — expandable per-leg breakdown, color-coded by line, with realtime delay handling on each leg's departure
- **Saved trips** — origin/destination pairs persisted to localStorage (with cross-tab sync) via the `useLocalStorage` hook; toggle save/unsave from any trip search
- **Active trip panel** — sticky header that tracks an in-progress trip, highlighting the current leg and updating per-leg times against the realtime feed

### Map
- **Interactive BART map** — drag, pinch, and zoom (react-zoom-pan-pinch), with graphic fade-in/fade-out animation for visibility at different zoom levels

### App shell
- **Bottom nav bar** — Map, Trips, Saved Trips, Alerts
- **Station picker / station panel** — focused per-station view
- **Splash animation** — wordmark splash on first load
- **PWA install** — manifest, icons, and service worker registration so the app installs to the home screen

## Infrastructure

- **Cloudflare Worker** ([src/worker](src/worker)) — proxies the 511 GTFS-RT protobuf feed (trams, stops) to the browser and caches general service alerts in its own KV pair, all consumed via `useTransitFeed`
- **OpenTripPlanner server** — deployed on Fly.io with BART GTFS Static + OSM data; consumed via GraphQL from the trip planner
- **Analytics** — lightweight `track()` helper ([src/lib/analytics.ts](src/lib/analytics.ts)) with `area_action` event naming convention; see [ANALYTICS.md](ANALYTICS.md)
- **PWA scaffolding** — [src/app/manifest.ts](src/app/manifest.ts), [src/app/register-sw.tsx](src/app/register-sw.tsx), [public/sw.js](public/sw.js) (currently a passthrough shell — see TODO)

## TODO

### Push notifications via PWA service worker
[public/sw.js](public/sw.js) is currently a no-op shell that just claims clients. Wire it up so the app can:
- Subscribe the user to push notifications (`PushManager.subscribe`) with a VAPID key
- Handle `push` events to show notifications for delays, alerts on saved/active trips, and "your train is approaching"
- Handle `notificationclick` to focus or open the relevant panel
- Persist the subscription server-side (likely a new Worker route) so the backend can fan out pushes when the 511 feed reports relevant changes

### Other remaining work
- [ ] Add Storybook to the project for component-level development and documentation
- [ ] Wire up Chromatic for visual regression + interaction tests on Storybook stories (basic integration coverage on `TripCard`, `DelayPill`, `ActiveTripPanel`, etc.)
- [ ] Add per-stop click handlers on the BART map to surface departures in the UI
- [ ] Expand map viewport for mobile so routes aren't clipped
- [ ] Final UX pass: holistic review of transitions between stops, trip planning, and active-trip states for cohesion
