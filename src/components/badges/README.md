# Badge Components

## Overview

This folder contains small, presentational badge and avatar components used throughout event cards, chat, and profile UI. Most are thin wrappers around the shared `Badge`/`Avatar` primitives in `src/components/ui/`, adding an icon, a piece of event/user data, and fixed positioning classes. None of these components fetch data themselves — they render whatever is passed in via props.

### AtendeesBadge.jsx (13 lines)

**Purpose:** Displays an event's attendee count, absolutely positioned over an event card image.

**Key Features:**
- Renders a `Users` icon (lucide-react) plus `event.attendees_count`
- Falls back to `0` if the count is missing
- Positioned `absolute bottom-3 right-3` for overlay use on event cards

**Props:**
- `event` — event object; reads `event.attendees_count`

---

### DateBadge.jsx (17 lines)

**Purpose:** Displays an event's formatted date, absolutely positioned over an event card image.

**Key Features:**
- Renders a `Calendar` icon plus the formatted date
- Formats the date via `formatEventDate` imported from `@/utils/dateTimeUtils`
- Positioned `absolute top-3 left-3`

**Props:**
- `event` — event object; reads `event.event_datetime`

---

### LikeBadge.jsx (22 lines)

**Purpose:** Displays an event's like count with a heart icon.

**Key Features:**
- Renders a `Heart` icon plus `event.likes_count` (defaults to `0`)
- `onClick` calls `e.stopPropagation()` but the actual like-toggle logic is not implemented (comment: "Add like functionality here") — currently non-functional as an interactive control
- Styled with destructive/red color variants

**Props:**
- `event` — event object; reads `event.likes_count`

---

### OgBadge.jsx (19 lines)

**Purpose:** Small badge shown on the profiles of users who joined before an "OG" cutoff date, with a hover tooltip.

**Key Features:**
- Renders the Yapp icon (`@/assets/Yapp web icon.png`) with `aria-label="OG Yapp Member"`
- Hover reveals a tooltip reading "OG Yapp Member 😎"
- Styling lives in the co-located `OgBadge.css`

**Props:** None — purely presentational, no data-driven props.

---

### UserAvatar.jsx (69 lines)

**Purpose:** The shared user avatar component used across badges, messages, and profile UI, with optional click-to-navigate behavior.

**Key Features:**
- Built on the `Avatar`/`AvatarImage`/`AvatarFallback` primitives from `@/components/ui/avatar`
- Size variants (`xs`, `default`, `sm`, `md`, `lg`) defined via `cva` (`class-variance-authority`)
- Guards against a null/undefined `user` to avoid a `TypeError` on `user.profile_picture`, rendering a fallback avatar instead
- When `redirectOnClick` is set, clicking navigates to `/profile/${user.user_id}` via `useNavigate` and stops event propagation
- Resolves the image source through `getProfilePictureUrl`/`getDefaultProfilePicture` from `@/utils/profileUtils`
- Merges class names with `cn` from `@/utils/cnUtils`

**Props:**
- `user` — user object (reads `user.user_id`, `user.profile_picture`, `user.username`)
- `size` — one of the `cva` size variants
- `className` — additional classes merged via `cn`
- `redirectOnClick` — boolean; if true, clicking the avatar navigates to the user's profile

---

### UserBadge.jsx (16 lines)

**Purpose:** Compact badge combining a small `UserAvatar` with a username, used to tag a user inline (e.g. "posted by").

**Key Features:**
- Composes `UserAvatar` (size `xs`) with the shared `Badge` primitive
- `withImage` prop toggles whether the avatar is shown
- Falls back through `username` prop → `user.username` → `'Unknown'`

**Props:**
- `user` — user object
- `username` — optional override string, takes priority over `user.username`
- `withImage` — boolean, default `true`; controls whether the avatar renders

## Usage Patterns

- Event overlay badges (`AtendeesBadge`, `DateBadge`, `LikeBadge`) are designed to be stacked as absolutely-positioned children inside a `relative` event card image container.
- `UserAvatar` is the canonical avatar component — other folders (`messages/`, `header/`) import it directly (e.g. `ChatHeader.jsx` imports `UserAvatar` from `@/components/badges/UserAvatar`) rather than re-implementing avatar rendering.
- All badge components import the base `Badge` from `@/components/ui/badge` and extend it with icons/content rather than building custom pill styling from scratch.

## Related Documentation

- [src/components/ui/README.md](../ui/README.md) — base `Badge`/`Avatar` primitives these components wrap
- [src/utils/](../../utils/) — `profileUtils`, `dateTimeUtils`, `cnUtils` used by these components
- [src/components/messages/README.md](../messages/README.md) — heaviest consumer of `UserAvatar`
