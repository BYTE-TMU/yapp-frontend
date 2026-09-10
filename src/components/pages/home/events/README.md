# Events

## Overview

This folder holds every component for the Events feature reachable from the home feed: the horizontal event carousel and its details modal, the "View All Events" browser modal, QR-code-based check-in (ticket display + camera scanner), manual attendee management, event cancellation, and the event-specific group chat ("event thread"), whose own sub-components live in the nested `thread/` folder. The real file inventory (via `ls`) is larger than a quick glance suggests — it includes `AttendeeManagementPanel.jsx`, which is easy to miss:

| File | Lines | Role |
|---|---|---|
| `EventItem.jsx` | 422 | Home-page carousel of upcoming events |
| `EventModal.jsx` | 751 | Single event's detail modal (attend/like/ticket/check-in) |
| `EventItemModal.jsx` | 679 | "View All Events" searchable browser modal |
| `EventThread.jsx` | 537 | Event group-chat page (`/events/:eventId/thread`) |
| `AttendeeManagementPanel.jsx` | 416 | Host-side manual attendee list (approve/waitlist/check-in) |
| `ScannerModal.jsx` | 384 | Host-side camera QR scanner for check-in |
| `TicketQRModal.jsx` | 155 | Attendee-side "My Ticket" QR code display |
| `QR_CHECKIN.md` | — | Backend QR check-in design doc (see Related Documentation) |
| `thread/ETHeader.jsx` | 238 | Event thread page header (title, stats, notifications, leave) |
| `thread/ETInput.jsx` | 321 | Event thread composer (text + up to 4 images, reply mode) |
| `thread/ETPost.jsx` | 259 | Single event-thread post/notification + its replies |
| `thread/ETPostsFeed.jsx` | 65 | Renders the list of `ETPost`s, filters out join/leave notifications |
| `thread/ETReply.jsx` | 151 | Single reply to an event-thread post |

## Files

### EventItem.jsx (422 lines)

**Purpose:** Renders the horizontal carousel of upcoming events on the home feed (inside `Home.jsx`'s "Events" section).

**Key Features:**
- Fetches up to 10 upcoming events on mount and displays them in a `Carousel` (from `@/components/ui/carousel`) using `Card`/`CardHeader`/`CardFooter` primitives (`@/components/ui/card`).
- Client-side "windowing": `getVisibleEvents()` shows at most 7 cards around `currentIndex` when there are more events than that, to keep the carousel DOM light.
- Clicking a card that's within the currently "expanded" 3-card window opens `EventModal`; clicking one outside that window instead re-centers the carousel on it (`handleEventClick`).
- Owner-only delete: `canDeleteEvent` compares the JWT-decoded current user ID against `event.user_id`; delete calls `POST /events/{id}/cancel` after a `showDeleteConfirmation` toast confirmation.
- Falls back to a deterministic `picsum.photos` seeded image when an event has no `image`.
- Renders `DateBadge`, `AtendeesBadge`, `UserBadge`, `LikeBadge` from `@/components/badges/`.

**Props:** None (self-contained; fetches its own data). Note: despite `Home.jsx` passing `currentUser={currentUser}`, the component's signature (`function EventItem()`) does not declare or use a `currentUser` prop — it derives its own user ID from the JWT internally.

**State:** `events`, `currentIndex`, `loading`, `error`, `currentUserId`, `deletingEvent`, `selectedEvent`, `isModalOpen`

**API Integration:**
```javascript
GET ${API_BASE_URL}/events/feed?limit=10&include_past=false

POST ${API_BASE_URL}/events/{eventId}/cancel
Headers: { Authorization: `Bearer ${token}` }, credentials: 'include'
```

---

### EventModal.jsx (751 lines)

**Purpose:** The full event detail modal — date/location/attendee/like info, join/leave, friends-attending list, and the entry points into the three check-in sub-flows (`TicketQRModal`, `ScannerModal`, `AttendeeManagementPanel`).

**Key Features:**
- On open, fetches full event details via a combined endpoint, with a fallback path that fetches attendance/like status separately if the combined call fails.
- Attendance toggle (`toggleAttendance`): on **joining**, closes the modal and navigates to `/events/{id}/thread`; on leaving, just updates counts.
- Like toggle with optimistic count updates.
- "View on Map" button appears when the event has coordinates (checked via `hasLocationCoordinates()`, which handles three possible coordinate shapes: direct `latitude`/`longitude`, `lat`/`lng`, or a `"lat, lng"` string embedded in `location`); stores event data into `sessionStorage.navigateToEvent` and routes to `/waypoint`.
- Past-event handling: `checkIfEventPast` disables the Join button and check-in section once `event_datetime` has passed.
- Check-in section (non-past events only):
  - **"My Ticket"** button — shown to attendees or the host — opens `TicketQRModal`.
  - **"Check-Ins"** button — shown only to the host (`event.user_id === currentUser` id, checked across `sub`/`_id`/`id`/`user_id` token shapes) — first calls `navigator.mediaDevices.enumerateDevices()` to check for a camera *without* opening a stream (avoids blocking `html5-qrcode`); opens `ScannerModal` if a camera exists, otherwise falls back to `AttendeeManagementPanel` with a `showCameraDenied()` toast.
  - `ScannerModal` and `AttendeeManagementPanel` can each hand off to the other (`onSwitchToList`, `onSwitchToScanner`) so the host can switch between camera and manual-list check-in without re-opening the parent modal.

**Props:**
```javascript
{
  event: object,       // event document (or null)
  isOpen: boolean,
  onClose: function,
  currentUser: object, // decoded JWT payload
}
```

**State:** `eventDetails`, `loading`, `isAttending`, `isLiked`, `attendingFriends`, `totalAttendees`, `likesCount`, `actionLoading` (`{like, attend}`), `isPastEvent`, `showTicketModal`, `showScannerModal`, `showManagementPanel`

**API Integration:**
```javascript
GET  ${API_BASE_URL}/events/{id}/details          // primary; includes is_attending, is_liked, attending_friends, total_attendees
GET  ${API_BASE_URL}/events/{id}/attend-status     // fallback if /details fails
GET  ${API_BASE_URL}/events/{id}/like-status       // fallback if /details fails
GET  ${API_BASE_URL}/events/{id}/details           // also used to refresh attending_friends after a join/leave
POST ${API_BASE_URL}/events/{id}/attend            // toggle join/leave
POST ${API_BASE_URL}/events/{id}/like              // toggle like
```
All requests send `Authorization: Bearer <token>` and `credentials: 'include'`.

---

### EventItemModal.jsx (679 lines)

**Purpose:** The "View All Events" full-screen modal opened from `Home.jsx` — a searchable, infinite-scrolling list of all upcoming events, each row opening the same `EventModal` on click.

**Key Features:**
- Fetches up to 50 upcoming events on open; client-side search (debounced 300ms) filters by title/description/location/username via `useMemo`.
- Client-side "infinite scroll" is simulated: `itemsToShow` starts at 6 and grows by 6 (with an artificial 300ms delay) either on scrolling past 90% of the list container or via a "Load More Events" button — this is pagination over the already-fetched 50-event array, not additional network requests.
- Same owner-delete flow as `EventItem.jsx` (`POST /events/{id}/cancel`).
- Theme-aware custom scrollbar styling injected via an inline `<style>` block keyed to a per-instance class name (`event-modal-scrollbar-{dark|light}`).
- Selecting a row opens the shared `EventModal` in a second, higher z-index portal layer.

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: function,
}
```

**State:** `events`, `loading`, `error`, `currentUserId`, `deletingEvent`, `selectedEvent`, `isEventModalOpen`, `searchTerm`, `debouncedSearchTerm`, `itemsToShow`, `isLoadingMore`, `hasMoreToLoad`

**API Integration:**
```javascript
GET  ${API_BASE_URL}/events/feed?limit=50&include_past=false
Headers: credentials: 'include'

POST ${API_BASE_URL}/events/{eventId}/cancel
Headers: { Authorization: `Bearer ${token}` }, credentials: 'include'
```

---

### TicketQRModal.jsx (155 lines)

**Purpose:** Attendee-facing "My Ticket" modal — fetches a short-lived signed ticket token and renders it as a QR code for the host to scan at the door.

**Key Features:**
- Fetches a ticket token on open, renders it with `QRCodeSVG` (from `qrcode.react`).
- Countdown timer (`timeLeft`, formatted `mm:ss`) computed from `expires_in` (seconds) returned by the backend; turns red under 2 minutes remaining.
- **Auto-refresh:** when the countdown crosses the 60-seconds-remaining mark, it silently re-fetches a new ticket token so the QR code never actually expires while the modal stays open — matching the 20-minute JWT expiry and "frontend auto-refreshes when < 60 seconds remain" behavior documented in the backend's `QR_CHECKIN.md`.
- Manual refresh button available at any time.

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: function,
  eventId: string,
  eventTitle: string,
}
```

**State:** `ticketToken`, `loading`, `expiresAt` (client-computed `Date.now() + expires_in*1000`), `timeLeft`

**API Integration:**
```javascript
GET ${API_BASE_URL}/events/{eventId}/my-ticket
Headers: { Authorization: `Bearer ${token}` }, credentials: 'include'
// Response: { ticket_token, expires_in, event_id }
```

**Further reading:** see `yapp-backend/events/QR_CHECKIN.md` for the full ticket-token lifecycle (JWT payload shape, 20-minute expiry, signing key) — this component is the "Attendee phone" side of the flow described there.

---

### ScannerModal.jsx (384 lines)

**Purpose:** Host-facing camera QR scanner — reads an attendee's ticket QR code with the device camera and checks them in, mirroring the "Host phone" half of the `QR_CHECKIN.md` flow.

**Key Features:**
- Wraps the `html5-qrcode` library (`Html5Qrcode`, restricted to `Html5QrcodeSupportedFormats.QR_CODE`); tries the rear camera (`facingMode: 'environment'`) first and falls back to the front camera (`facingMode: 'user'`) if unavailable.
- Two scan modes: guided (a fixed `qrbox` sized to the container, 260–380px, with a corner-bracket reticle) and "free scan" (`Maximize2`/`Square` toggle) which omits `qrbox` entirely so the whole camera frame is decoded — more forgiving of angle/distance.
- On a successful decode, POSTs the raw token to the check-in endpoint; shows a 2.5s result overlay (success / already-checked-in warning / error) before unlocking `processingRef` for the next scan. Explicitly avoids the library's built-in `pause()` because it renders a black overlay on some mobile browsers — a `processingRef` guard is used instead.
- On camera-permission denial, shows a `showCameraDenied()` toast and calls `onSwitchToList?.()` to hand off to `AttendeeManagementPanel`.
- Aggressively tears down camera tracks on close/unmount (`stopScanner` both calls the library's `stop()`/`clear()` and manually stops every `<video>` element's `MediaStreamTrack`s) to guarantee the camera indicator light turns off.

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: function,
  eventId: string,
  onSwitchToList: function, // hands off to AttendeeManagementPanel
}
```

**State:** `scanning`, `cameraError`, `lastResult` (`{type, username, profile_picture, message}`), `resultFading`, `freeScanMode`

**API Integration:**
```javascript
POST ${API_BASE_URL}/events/{eventId}/checkin
Headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, credentials: 'include'
Body: { token: decodedText }   // the raw scanned QR payload
// Response includes: already_checked_in?, username, profile_picture, ...
```

**Further reading:** `yapp-backend/events/QR_CHECKIN.md` documents this exact endpoint's request/response shapes and the host-auto-attendance edge case.

---

### AttendeeManagementPanel.jsx (416 lines)

**Purpose:** Host-facing manual attendee list — an alternative to `ScannerModal` for checking people in without a camera, plus approve/waitlist management for pending RSVPs.

**Key Features:**
- Detects camera availability on open (`navigator.mediaDevices.enumerateDevices`) purely to decide whether to show a "switch to scanner" button (`onSwitchToScanner`) — it does not open the camera itself.
- Three tabs — Approved / Pending / Waitlist — each with a live count from `stats`; the Approved tab treats attendance records with no `status` field as approved (legacy-record fallback, matching the backend's documented default).
- Client-side search filters the currently-fetched attendee list by username/full name.
- Approved-tab rows get a "Check In" action (manual equivalent of a QR scan, sends `user_id` instead of a token); Pending-tab rows get Approve/Waitlist actions; Waitlist-tab rows get an Approve action.
- Per-row `actionLoading` state (keyed by user id) drives inline spinners on each action button.

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: function,
  eventId: string,
  onSwitchToScanner: function | null, // only offered when the panel was opened by the host (see EventModal)
}
```

**State:** `attendees`, `stats`, `loading`, `activeTab` (`'approved' | 'pending' | 'waitlisted'`), `searchTerm`, `actionLoading`, `hasCamera`

**API Integration:**
```javascript
GET   ${API_BASE_URL}/events/{eventId}/attendees-by-status
Headers: { Authorization: `Bearer ${token}` }, credentials: 'include'
// Response: { attendees: [...], stats: { total_rsvp, approved, pending, waitlisted, checked_in } }

POST  ${API_BASE_URL}/events/{eventId}/checkin
Body: { user_id: userId }   // manual check-in (no QR token)

PATCH ${API_BASE_URL}/events/{eventId}/attendees/{userId}/status
Body: { status: 'approved' | 'waitlisted' }
```

**Further reading:** `yapp-backend/events/QR_CHECKIN.md` documents `attendees-by-status`, the manual-check-in body shape, and the status-update endpoint in full, including pagination query params (`status`, `page`, `limit`) this component doesn't currently use (it fetches a single unpaginated page).

---

### EventThread.jsx (537 lines)

**Purpose:** The event-specific group chat page, routed at `/events/:eventId/thread`. Composes the `thread/` sub-components and owns all thread data-fetching and mutation logic.

**Key Features:**
- Redirects to `/login` if no JWT is present; otherwise decodes the token client-side for `currentUser`.
- Loads thread metadata (`fetchThreadInfo`) and the post list (`fetchPosts`) in parallel once both `eventId` and `currentUser` are available; a `403` from either is treated as "you must be attending this event" and rendered as a full-page error state.
- Posting supports text and up to 4 images via `FormData` (`multipart/form-data`, so no explicit `Content-Type` header is set) and supports threaded replies via a `reply_to` field when `replyingTo` is set.
- Notifications: posts whose `post_type` ends in `_notification` (`join_notification`/`leave_notification`) are filtered out of the main feed (`ETPostsFeed`) but passed separately into `ETHeader`'s notification bell.
- "Leave Event" calls the same `POST /events/{id}/attend` toggle endpoint used by `EventModal` (leaving is just un-attending); `ETHeader` navigates back to `/Home` on success.
- Like/delete/edit operate on both top-level posts and nested replies (an `isReply`/`parentPostId` pair threads through `handleLikePost`/`handleDeletePost`/`handleEditPost` to update the right nested array in state).

**Props:** None — reads `eventId` from the URL via `useParams()`.

**State:** `threadInfo`, `posts`, `newPostContent`, `loading`, `posting`, `currentUser`, `error`, `replyingTo`

**API Integration:**
```javascript
GET    ${API_BASE_URL}/eventthreads/{eventId}/info
GET    ${API_BASE_URL}/eventthreads/{eventId}/posts?limit=50&sort_order=-1
POST   ${API_BASE_URL}/eventthreads/{eventId}/posts        // FormData: content, post_type, reply_to?, image (0-4 files)
POST   ${API_BASE_URL}/eventthreads/posts/{postId}/like
DELETE ${API_BASE_URL}/eventthreads/posts/{postId}
PUT    ${API_BASE_URL}/eventthreads/posts/{postId}         // Body: { content }
POST   ${API_BASE_URL}/events/{eventId}/attend             // "Leave Event" (toggle)
```
All requests use `credentials: 'include'` plus `Authorization: Bearer <token>` when present.

## thread/ subfolder

Sub-components rendered exclusively by `EventThread.jsx`; none fetch data themselves — all are presentational and driven entirely by props/callbacks passed down from `EventThread`.

### thread/ETHeader.jsx (238 lines)

**Purpose:** Fixed page header for the event thread — back button, event title/description, attendee/post/date stats, a notification bell dropdown (join/leave activity), and the "Leave Event" action with a confirmation modal.

**Props:** `threadInfo`, `onLeaveEvent`, `notifications` (default `[]`), `chatPostCount`, `getProfilePictureUrl`, `formatTime`

**State:** `showLeaveModal`, `isLeaving`, `showNotifications` (closed via an outside-click listener on `notifRef`)

**API Integration:** None directly — `onLeaveEvent` is a callback into `EventThread.handleLeaveEvent`, which itself calls `POST /events/{eventId}/attend`. On success, navigates to `/Home`.

### thread/ETInput.jsx (321 lines)

**Purpose:** The message composer at the top of the thread — auto-resizing textarea, up to 4 image attachments with previews, and a reply-context banner.

**Key Features:**
- Auto-resize textarea height on content change.
- Client-side image validation before upload: type allowlist (`png`/`jpg`/`jpeg`/`gif`/`webp`), 10MB size cap per file, 4-image cap total — invalid selections show `showMaxImagesError`/`showInvalidFileTypeError`/`showFileSizeError` toasts (`@/utils/toastNotifications`, via relative import).
- Object-URL previews are revoked (`URL.revokeObjectURL`) on removal and on unmount to avoid memory leaks.
- Delegates the actual submit to the `onSubmit(e, selectedImages)` prop (implemented as `EventThread.handlePostSubmit`), then clears local image state.

**Props:** `newPostContent`, `setNewPostContent`, `onSubmit`, `posting`, `replyingTo`, `setReplyingTo`, `currentUser`, `getProfilePictureUrl`

**State:** `selectedImages`, `imagePreviews`, `uploadingImages` (declared but not actually toggled anywhere in this file)

**API Integration:** None directly — purely composes the payload consumed by `EventThread`'s `POST /eventthreads/{eventId}/posts`.

### thread/ETPost.jsx (259 lines)

**Purpose:** Renders one thread post: either a compact join/leave notification pill, or a full post card with avatar, content, up to 4 images, like/reply actions, an owner-only edit/delete dropdown, and its nested `ETReply` list.

**Key Features:**
- `post.post_type === 'join_notification'` / `'leave_notification'` short-circuit into a small colored pill (green/red) instead of the full card.
- Inline edit mode swaps the content into a `<textarea>` with Save/Cancel, calling the `onEdit` prop.
- Image grid layout varies by count (1/2/3/4), with 3-image layout giving the first image a full-width row; clicking an image opens it in a new tab.
- Renders `UserAvatar` and `UserBadge` from `@/components/badges/`.

**Props:** `post`, `currentUser`, `onLike`, `onDelete`, `onEdit`, `onReply`, `getProfilePictureUrl`, `formatTime`, `canEditOrDelete`

**State:** `showDropdown`, `editingPost`, `editContent`

**API Integration:** None directly — all actions are callback props implemented in `EventThread.jsx`.

### thread/ETPostsFeed.jsx (65 lines)

**Purpose:** Thin list wrapper around `ETPost` — filters out `*_notification` post types (those are shown in `ETHeader`'s bell instead) and renders loading/empty states.

**Props:** `posts`, `loading`, `currentUser`, `onLike`, `onDelete`, `onEdit`, `onReply`, `getProfilePictureUrl`, `formatTime`, `canEditOrDelete` (all passed straight through to each `ETPost`)

**State:** None.

**API Integration:** None.

### thread/ETReply.jsx (151 lines)

**Purpose:** Renders a single reply nested under an `ETPost` — smaller avatar/text, its own like button, image grid (max width capped tighter than top-level posts), and an owner-only edit/delete dropdown.

**Props:** `reply`, `parentPostId`, `currentUser`, `onLike`, `onDelete`, `onEdit`, `getProfilePictureUrl`, `formatTime`, `canEditOrDelete`

**State:** `showDropdown`, `editingReply`, `editContent`

**API Integration:** None directly — `onLike`/`onDelete`/`onEdit` are wired by `ETPost` back up to `EventThread`'s handlers with `isReply=true` and the parent post id.

## Related Documentation

- [`yapp-backend/events/QR_CHECKIN.md`](../../../../../../yapp-backend/events/QR_CHECKIN.md) — backend design doc for the QR check-in system. Directly relevant to `TicketQRModal.jsx` (`GET /events/{id}/my-ticket`), `ScannerModal.jsx` and `AttendeeManagementPanel.jsx` (`POST /events/{id}/checkin`, `PATCH .../attendees/{user_id}/status`, `GET .../checkin-stats`, `GET .../attendees-by-status`) — all four endpoints documented there are called from this folder's components.
- [`../README.md`](../README.md) — parent `Home.jsx` / `posts/` documentation; `EventItem` and `EventItemModal` are both rendered from `Home.jsx`.
- [src/components/badges/](../../../../badges/) — `UserAvatar`, `UserBadge`, `DateBadge`, `AtendeesBadge`, `LikeBadge` used throughout this folder.
- [src/components/ui/](../../../../ui/) — `Carousel`, `Card`, `Button` primitives used by `EventItem.jsx`.
- [src/utils/toastNotifications.js](../../../../../utils/) — shared toast helpers used across nearly every file in this folder.
- [src/contexts/README.md](../../../../../contexts/README.md) — `ThemeContext`, used by `EventItemModal.jsx`, `EventThread.jsx`, and the `thread/` components.
