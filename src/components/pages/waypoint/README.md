# Waypoint — Real-Time Campus Map

## Overview

Waypoint is the real-time interactive campus map at `/waypoint`, built on `react-leaflet` with LocationIQ map tiles. Users can drop time-limited pins ("waypoints") of six types — food, study, group, social, event, and other — that other users can browse, like, bookmark, and (for event-type pins) join. `Waypoint.jsx` is a large orchestrator component that owns essentially all state and API calls; the rest of the folder is presentational children (`WaypointHeader`, `WaypointMap`, `WaypointModal`, `WaypointPopup`, `WaypointLegend`, `WaypointStats`, `WaypointNavigationOverlay`) plus two non-component utility modules (`leafletSetup.js`, `waypointIcons.js`). One file, `SavedWaypointsNavigator.jsx`, is unused dead code — see its section below.

Event-type waypoints are cross-referenced against the Events feature: `Waypoint.jsx` fuzzy-matches event-type waypoint pins against `/events/feed` data (by title and, where available, by coordinate proximity) to know whether the current user is attending and how many people are, and lets users join/leave the underlying event directly from the map popup.

### Waypoint.jsx (1222 lines) — orchestrator

**Purpose:** The `/waypoint` page component. Owns all waypoint/saved-waypoint state, every API call in this folder, keyboard navigation, and a 30-second auto-refresh; composes `WaypointHeader`, `WaypointMap`, and `WaypointModal`.

**Key Features:**
- Fetches campus waypoints, then — only if any are event-type and the user is logged in — fetches the events feed once and fuzzy-matches each event waypoint to a real event (title match, then coordinate-proximity match, with a couple of looser fallback passes) to attach `isAttending`/`attendeesCount`
- Placement mode: toggling it lets the next map click open `WaypointModal` at that location, reverse-geocoding the address in the background (skipped if the location already came from the search bar with a resolved address)
- Saved waypoints ("bookmarks"): fetches the user's bookmarked waypoints, then supports Previous/Next navigation between them with both on-screen buttons and Left/Right/Escape keyboard shortcuts (implemented directly in this file, not via `SavedWaypointsNavigator.jsx` — see that file's note)
- Type filters (`activeFilters`, a `Set` of visible types) passed down to `WaypointMap`'s filter overlay
- Auto-refreshes waypoints every 30 seconds to catch server-side expiry cleanup
- Reads a `navigateToEvent` key from `sessionStorage` on mount to auto-fly to and open a specific event waypoint when arriving from elsewhere in the app (e.g. an event's "View on map" action)
- All toast/confirmation UI (login-required prompts, delete confirmations, join/leave feedback) comes from `src/utils/toastNotifications.js`

**State:** `waypoints`, `showCreateModal`, `newPinLocation`, `resolvedAddress`, `addressLoading`, `loading`, `error`, `refreshing`, `placementMode`, `targetWaypoint`, `shouldOpenPopup`, `savedWaypoints`, `currentSavedIndex`, `isNavigatingSaved`, `isNavigating`, `searchedLocation`, `activeFilters`

**API Integration:**
```javascript
GET    ${API_BASE_URL}/waypoint/campus/tmu?radius=2
GET    ${API_BASE_URL}/events/feed?limit=100&include_past=false   (attendance cross-reference)
GET    ${API_BASE_URL}/events/${eventId}/attend-status
GET    ${API_BASE_URL}/waypoint/my-bookmarks
POST   ${API_BASE_URL}/waypoint/create
  Body: { title, description, type, latitude, longitude, address, expires_in_hours: 24 }
POST   ${API_BASE_URL}/waypoint/${waypointId}/join
POST   ${API_BASE_URL}/waypoint/${waypointId}/like
POST   ${API_BASE_URL}/waypoint/${waypointId}/bookmark
DELETE ${API_BASE_URL}/waypoint/${waypointId}
POST   ${API_BASE_URL}/events/${eventId}/attend
POST   ${API_BASE_URL}/events/${eventId}/cancel
```

### WaypointHeader.jsx (149 lines)

**Purpose:** Top bar for the Waypoint page — title, and action buttons for Saved / Refresh / Place (or, while navigating saved waypoints, a counter badge and an Exit button).

**Props:** `placementMode`, `onTogglePlacementMode`, `onRefresh`, `refreshing`, `waypointCount`, `error`, `onClearError`, `onOpenSavedWaypoints`, `isNavigatingSaved`, `currentSavedIndex`, `savedWaypointsCount`, `onPreviousSaved`, `onNextSaved`, `onExitSavedNavigation`

**Key Features:** Status line that changes copy depending on mode (placement / saved-navigation / idle); dismissible error banner; uses the shared `Button` UI primitive and `cn()` class-merge helper.

**API Integration:** None — pure presentational, all actions delegated via props.

### WaypointMap.jsx (411 lines)

**Purpose:** The Leaflet map itself — markers, popups, the type-filter dropdown, and the fixed campus/SLC landmark pins.

**Key Features:**
- Fixed campus marker (`campusIcon`) and Student Learning Centre marker (`slcIcon`) always shown, in addition to live waypoint markers (`createCustomIcon(type)`)
- Each waypoint marker has a hover `Tooltip` (title) and a click `Popup` rendering `WaypointPopup`
- `MapClickHandler` (internal) only fires `onMapClick` while `placementMode` is on
- `MapNavigator` (internal) smoothly `flyTo`s a `targetWaypoint` and can auto-open its popup — used both for saved-waypoint navigation and the session-storage event-deep-link on mount
- `FilterOverlay` (internal) — a dropdown of the six waypoint types with active/inactive toggle chips and a reset action
- Embeds `LocationSearchBar` for address search, and renders a pulsing "create waypoint here" marker at a searched location if provided
- Composes `WaypointLegend`, `WaypointStats`, and `WaypointNavigationOverlay` as map overlays

**Props:** `waypoints`, `placementMode`, `refreshing`, `onMapClick`, `onJoinWaypoint`, `onDeleteWaypoint`, `onLikeWaypoint`, `onBookmarkWaypoint`, `onJoinEvent`, `getCurrentUser`, `TMU_COORDS`, `ZOOM_LEVEL`, `targetWaypoint`, `shouldOpenPopup`, saved-navigation props (`isNavigatingSaved`, `currentSavedWaypoint`, `currentSavedIndex`, `savedWaypointsCount`, `onPreviousSaved`, `onNextSaved`), `onSearchSelect`, `searchedPinLocation`, `activeFilters`, `onToggleFilter`, `onClearFilters`

**API Integration:** None directly — tile layer is fetched from LocationIQ (`VITE_LOCATIONIQ_API_KEY`); all data actions are delegated to `Waypoint.jsx` via callback props.

### WaypointPopup.jsx (229 lines)

**Purpose:** Content rendered inside a waypoint marker's Leaflet `Popup` — the detail card for a single waypoint.

**Key Features:**
- Detects event-type waypoints (`type === 'event'` or a `📅` title prefix) and parses an embedded `Event on YYYY-MM-DD at HH:MM` line out of the description to show an upcoming/past badge
- Owner-only delete button (copy changes to "Cancel event" for event waypoints)
- "Get Directions" button opens Apple Maps (iOS/Mac) or Google Maps (everyone else) to the waypoint's coordinates
- Join/leave button for event waypoints (non-owners only), with a confirmation prompt before leaving
- Like/Bookmark buttons that redirect to a "please log in" toast when `currentUserId` is missing

**Props:** `waypoint`, `isOwner`, `onLike`, `onBookmark`, `onDelete`, `onJoinEvent`, `currentUserId`

**API Integration:** None directly — all actions call back up to the handlers passed from `Waypoint.jsx` via `WaypointMap`.

### WaypointModal.jsx (214 lines)

**Purpose:** "Create Waypoint" form modal, opened by `Waypoint.jsx` after a placement-mode map click.

**Key Features:** Type dropdown (food/study/group/social/event/other), title (100 char) and description (500 char) fields with counters, an optional location-name field that pre-fills from the reverse-geocoded address once it resolves, and a static "expires after 1 week" notice (the actual `create` call sends `expires_in_hours: 24`, i.e. this copy is out of sync with the real 24-hour expiry — worth fixing).

**Props:** `isOpen`, `onClose`, `onSubmit`, `location`, `address`, `addressLoading`

**API Integration:** None directly — calls `onSubmit`, which `Waypoint.jsx` wires to `POST /waypoint/create`.

### WaypointLegend.jsx (18 lines)

**Purpose:** Small always-visible key (desktop only) mapping each emoji marker to its waypoint type. Static, no props or state.

### WaypointStats.jsx (38 lines)

**Purpose:** Bottom-left overlay chip showing the live waypoint count, a "Live updates" indicator, and conditional "Placement mode" / "Updating..." badges.

**Props:** `waypointCount`, `placementMode`, `refreshing`

### WaypointNavigationOverlay.jsx (103 lines)

**Purpose:** Bottom-center overlay shown while navigating saved (bookmarked) waypoints — Previous/Next buttons, a position indicator ("Saved Waypoint 3 of 12"), a dot pager (capped display for large lists), and a keyboard-shortcut hint.

**Props:** `isVisible`, `currentWaypoint`, `currentIndex`, `totalCount`, `onPrevious`, `onNext`

### SavedWaypointsNavigator.jsx (262 lines)

**Purpose:** A self-contained modal for browsing bookmarked waypoints (its own data fetch, Previous/Next, keyboard nav, dot pager).

> **Unused.** This component is not imported anywhere in the codebase. `Waypoint.jsx` implements equivalent saved-waypoint browsing itself (`fetchSavedWaypoints`, `goToPreviousSaved`/`goToNextSaved`, its own keyboard handler) and renders `WaypointNavigationOverlay` instead of this component. Treat this file as dead code unless it gets wired up.

**API Integration (if it were used):**
```javascript
GET ${API_BASE_URL}/waypoint/my-bookmarks
```

### waypointIcons.js (177 lines)

**Purpose:** Non-component module exporting Leaflet `divIcon` factories/instances: `createCustomIcon(type)` (color + emoji per waypoint type), `campusIcon`, `slcIcon`, and `searchCreateIcon` (the pulsing green "+" pin used for search-result waypoint creation).

### leafletSetup.js (11 lines)

**Purpose:** Non-component module that patches Leaflet's default marker icon URLs to point at a CDN (works around a known Leaflet/bundler asset-resolution issue). Imported once for its side effect.

## Related Documentation

- [src/components/pages/README.md](../README.md) — sibling top-level pages
- [src/components/pages/create/README.md](../create/README.md) — `EventLocationMap.jsx`, which shares the same LocationIQ tile setup and marker style
- [src/components/common/README.md](/src/components/common/README.md) — `LocationSearchBar`
- [src/services/README.md](/src/services/README.md) — `locationiqService`, `API_BASE_URL`
- [src/utils/README.md](/src/utils/README.md) — `toastNotifications`, `cnUtils`
