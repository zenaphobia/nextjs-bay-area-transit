# Bay Area Transit Application

A real-time BART transit tracker built with React, TypeScript, and Next.js. This project pairs the 511 MTC API's GTFS Realtime feed with an interactive map and stop-centric departure UI.

> **Status:** Work-in-progress. Core architecture is in place; trip planning and final polish are underway.

## Stack

- **Frontend:** React · TypeScript · Next.js · Framer Motion · Tailwind CSS
- **Map:** react-zoom-pan-pinch
- **Backend:** Cloudflare Worker proxying GTFS Realtime protobuf data
- **Routing:** OpenTripPlanner (GraphQL) with BART GTFS Static + OSM data
- **Deployment:** Netlify

## Features

- **Live departure cards** — stop-centric view showing all upcoming arrivals across lines, with time-based card states (hero countdown ≤ 5 min, compact displays absolute time)
- **Interactive BART map** — drag, pinch, and zoom with graphic fade-in/fade-out animation for better visibility
- **Real-time polling** — `useTransitFeed` hook drives efficient protobuf polling via Cloudflare Worker

## Roadmap

### OpenTripPlanner Integration

OTP powers the trip planning side of the app. Remaining work:

- [x] Finalize GraphQL query and validate response data on the frontend
- [x] Build trip planner view from Adobe XD mockups
- [x] Integrate on-device persistent storage for saved trips
- [x] Deploy OTP server (Fly.io)
- [ ] Poll general alerts from 511 API and cache with KV
- [ ] Build bottom nav bar (Map, Trips, Saved Trips, Alerts)

### Map Polish

The BART map is interactive but needs refinement:

- [ ] Add per-stop click handlers to surface departures in the UI
- [ ] Expand map viewport for mobile so routes aren't clipped

### Final UX Pass

Once individual views are solid, take a holistic pass at the user flow, transitions between stops, trip planning, and the 3D hero scene. Make sure everything feels cohesive.
