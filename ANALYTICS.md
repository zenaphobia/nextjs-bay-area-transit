# Analytics

## Why we collect

Analytics in this app exist for **one reason: to improve the app experience.**

We track usage to understand which features people actually use, where flows break down, and where load times hurt. We do **not** sell data, share it with third parties beyond the analytics provider, or use it for advertising. If a measurement isn't going to change a product or performance decision, we don't capture it.

## How to add an event

Use the `track()` helper from [src/lib/analytics.ts](src/lib/analytics.ts):

```tsx
import { track } from "@/lib/analytics";

<Button onClick={() => track("nav_click", { label: "trip_planner" })}>
  Trip Planner
</Button>
```

The helper is a no-op when `gtag` isn't loaded (dev, ad blockers, GA disabled), so call sites don't need guards.

## Naming convention: `area_action`

All event names follow `{area}_{action}`, lowercase, snake_case.

- **area** — the part of the app the event happened in (`nav`, `trip`, `station`, `map`, `alert`, `settings`)
- **action** — what the user did (`click`, `search`, `select`, `open`, `dismiss`, `submit`)

Examples:

| Event           | When it fires                              |
| --------------- | ------------------------------------------ |
| `nav_click`     | A navbar button is clicked                 |
| `trip_search`   | User submits a trip planner query          |
| `station_select`| User picks a station from a list           |
| `map_pan`       | User pans the map (sampled, not every px)  |
| `alert_dismiss` | User dismisses a service alert             |

Keep the vocabulary small. If you find yourself inventing a new area, check whether an existing one fits first — `nav_*` and `header_*` would be a smell.

## Parameters

Pass details as the second argument:

```ts
track("trip_search", { from: "embarcadero", to: "mont", label: "quick_search" });
```

Conventions:

- `label` — a free-form sub-identifier (which button, which list item)
- `value` — must be a **number** if used (GA4 reserved param)
- `currency` — must be an ISO 4217 code if used (GA4 reserved param)
- Avoid PII. No names, emails, precise coordinates, or anything that identifies a person. Station names and route IDs are fine; "the user's home address" is not.

## What not to track

- Anything that would still be useful if we deleted it tomorrow — if you can't name the decision it informs, skip it.
- High-frequency continuous events (scroll position, every map pan, mousemove). Sample or debounce.
- Anything containing user-entered free text.

## Where events go

Events are sent to Google Analytics 4 via the `@next/third-parties/google` `<GoogleAnalytics>` component in [src/app/layout.tsx](src/app/layout.tsx). The measurement ID is set via `NEXT_PUBLIC_GA_ID`.

To verify an event is firing, see the "How to ensure the Google tag is working" notes — easiest path is GA4 → Admin → DebugView with the GA Debugger extension enabled.
