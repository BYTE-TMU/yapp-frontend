# Common Components

## Overview

This folder holds small, reusable presentational and utility components shared across pages — loading indicators, page/refresh transitions, a decorative background, and a Leaflet map search overlay. None of these are feature-specific; they're generic building blocks composed into feature pages elsewhere in the app.

### AnimatedBackground.jsx (10 lines)

**Purpose:** Decorative, fixed-position blurred gradient background used behind page content.

**Key Features:**
- Two large blurred, pulsing circles (`animate-pulse`) positioned top-right and bottom-left
- `fixed inset-0 md:ml-64 pointer-events-none` — accounts for the desktop sidebar width and never intercepts clicks

**Props:** None.

---

### LoadingDots.jsx (31 lines)

**Purpose:** Three bouncing dots used as the app's standard loading indicator, replacing an older spinning-ring design.

**Key Features:**
- Three `div`s with staggered `animationDelay` (0ms, 150ms, 300ms) using Tailwind's `animate-bounce`
- `role="status" aria-label="Loading"` for accessibility

**Props:**
- `size` — dot diameter in px (default `9`)
- `color` — Tailwind background class (default `'bg-orange-500'`)

---

### LoadingSpinner.jsx (29 lines)

**Purpose:** A minimal spinning-ring loading indicator, used as an alternative to `LoadingDots`.

**Key Features:**
- Four preset sizes (`sm`, `md`, `lg`, `xl`) mapped to Tailwind height/width/border classes
- `role="status" aria-label="Loading"` for accessibility

**Props:**
- `size` — `'sm' | 'md' | 'lg' | 'xl'` (default `'md'`)
- `className` — additional wrapper classes

---

### LocationSearchBar.jsx (265 lines)

**Purpose:** An address search overlay rendered inside a Leaflet `MapContainer`, used to search and fly the map to an address.

**Key Features:**
- Must be rendered as a child of `<MapContainer>` — it calls `useMap()` from `react-leaflet` to access the map instance
- Disables Leaflet's click/scroll propagation on the widget via `L.DomEvent.disableClickPropagation`/`disableScrollPropagation` so map interactions don't swallow the search UI's events
- Debounces input (300ms) before searching; requires at least 2 characters
- On selecting a result, calls `map.flyTo([lat, lng], 18, ...)` to animate the map, and invokes the optional `onSelect({ lat, lng, address })` callback
- Enter key selects the first result; blur closes the dropdown unless a result is mid-click (guarded via `selectingRef`)
- Shows an inline error state if the search request fails

**Props:**
- `onSelect({ lat, lng, address })` — optional callback fired when a result is picked. If omitted, the bar only navigates the map without notifying the parent.

**API Integration:**
```javascript
searchAddress(query) // imported from ../../services/locationiqService
```
Delegates the actual address lookup to `locationiqService`; this component only handles debouncing, the dropdown UI, and map navigation.

---

### PageTransition.jsx (37 lines)

**Purpose:** Wraps page content in a fade-in transition that re-triggers on route change.

**Key Features:**
- Uses `useLocation()` from `react-router-dom` to detect navigation
- Hides content on route change, then reveals it after a 200ms delay with a `600ms` opacity transition (custom cubic-bezier easing)

**Props:**
- `children` — the page content to fade in

---

### RefreshAnimation.jsx (61 lines)

**Purpose:** Overlay that shows a brief loading animation while content is being refreshed (e.g. pull-to-refresh), then fades the content back in.

**Key Features:**
- Composes `LoadingDots` (size 12) with a "Refreshing..." label
- Cross-fades between a loading state and the `children` content based on the `isRefreshing` prop
- Adds a short delay (100ms) after `isRefreshing` becomes `false` before showing content, to avoid an abrupt flash

**Props:**
- `isRefreshing` — boolean; when true, shows the loading state instead of `children`
- `children` — the content to render once refreshing completes

## Usage Patterns

- `LoadingDots` and `LoadingSpinner` are two independent loading indicators used in different places across the app (e.g. `LoadingDots` is used by `messages/EventsList.jsx` and `messages/MessagesList.jsx`) — there isn't a single canonical spinner, so check nearby code for which one a given page already uses before adding a new usage.
- `LocationSearchBar` is coupled to `react-leaflet`/Leaflet and only makes sense inside a `MapContainer` tree (e.g. the Waypoint map feature).
- `PageTransition` and `RefreshAnimation` both solve "avoid a flash of unstyled/empty content," but at different granularities — `PageTransition` wraps a whole route, `RefreshAnimation` wraps a refreshable content region within a page.

## Related Documentation

- [src/services/locationiqService.js](../../services/) — geocoding/address search backing `LocationSearchBar`
- [src/components/ui/README.md](../ui/README.md) — lower-level UI primitives (buttons, cards) these components are often composed with
- [src/components/pages/waypoint/](../pages/waypoint/) — primary consumer of `LocationSearchBar`
