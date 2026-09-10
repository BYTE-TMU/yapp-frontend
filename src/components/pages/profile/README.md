# Profile — User Profile, Followers, Friends & Events

## Overview

This folder implements the user profile experience at `/profile` (own profile) and `/profile/:userId` (another user's profile). `Profile.jsx` is the orchestrator — it fetches the profile, drives edit mode, and composes the rest of the files here: a program picker for the profile-edit form, a mutual-friends strip, an attending-events sidebar (with its own event card), and two nearly-identical follower/following list modals. `Likes.jsx` is a related but separately-routed page (`/likes`) for a user's liked posts, linked to from here.

### Profile.jsx (749 lines)

**Purpose:** The profile page itself — the orchestrator for this whole folder.

**Key Features:**
- Same component serves both "my profile" (`isOwnProfile = !userId`) and "someone else's profile" (`userId` present), branching UI and API calls accordingly
- Edit mode (own profile only) for `full_name`, `bio`, `website`, `location`, and `program` (via `Program.jsx`), plus profile-picture upload
- For other users: Follow/Unfollow and Message action buttons; Message starts (or resumes) a conversation and navigates to `/messages?conversation=<id>`
- Followers/Following counts are buttons that open `FollowerModal` / `FollowingModal`
- Composes `FriendList` (own profile only), `ProfileEvents`, and renders recent posts via the shared `PostItem`
- "Liked Posts" button (own profile only) navigates to `/likes?from=profile`

**State:** `profile`, `loading`, `error`, `isEditing`, `messagingUser`, `editForm` (`full_name`, `bio`, `website`, `location`, `program`), `uploadingImage`, `isFollowerModalOpen`, `isFollowingModalOpen`

**API Integration:**
```javascript
// Fetch — own profile
GET ${API_BASE_URL}/users/me/enhanced?include_posts=true&posts_limit=10
// falls back to GET ${API_BASE_URL}/users/me?include_posts=true&posts_limit=10 on 404

// Fetch — another user's profile
GET ${API_BASE_URL}/users/profile/${userId}/enhanced?include_posts=true&posts_limit=10

PUT  ${API_BASE_URL}/users/me                       Body: editForm
POST ${API_BASE_URL}/users/me/picture/upload         (multipart FormData)
POST ${API_BASE_URL}/users/${userId}/follow
POST ${API_BASE_URL}/users/${userId}/start-conversation
```

### Program.jsx (316 lines)

**Purpose:** Searchable dropdown for picking a TMU undergraduate program, used inside `Profile.jsx`'s edit form.

**Key Features:**
- Hardcoded list of roughly 70 TMU undergraduate programs across 6 faculties (Arts, Ted Rogers School of Management, Community Services, Engineering & Architectural Science, Science, The Creative School)
- Live filter-as-you-type against program name, faculty, and degree type; click-outside closes the dropdown
- Reports whether the typed value is an exact match via `onValidation`; a manually-typed program that isn't in the list is still accepted
- Links out to TMU's official undergraduate programs page

**Props:** `value`, `onChange`, `onValidation`

**State:** `inputValue`, `isDropdownOpen`, `filteredPrograms`

**API Integration:** None — fully static, client-side data.

### FriendList.jsx (184 lines)

**Purpose:** Horizontal strip of mutual friends shown on the profile (own profile only).

**Key Features:** Avatar row (first 7) with a small verified checkmark badge on verified friends, a "+N More" overflow tile, loading skeleton and empty/error states.

**Props:** `userId`, `isOwnProfile`

**API Integration:**
```javascript
GET ${API_BASE_URL}/users/me/friends          (own profile)
GET ${API_BASE_URL}/users/${userId}/friends   (other profile)
```

### ProfileEvents.jsx (223 lines)

**Purpose:** Sidebar list of events the profiled user is attending, rendered next to the posts column on `Profile.jsx`.

**Key Features:** Renders one `EventCard` per event; clicking a card opens the shared `EventModal` (from `home/events/`) in a `createPortal`; decodes the JWT to pass `currentUser` into that modal; manual refresh button.

**Props:** `userId`, `isOwnProfile`

**API Integration:**
```javascript
GET ${API_BASE_URL}/events/attending?limit=10&include_past=true                 (own, authenticated)
GET ${API_BASE_URL}/events/user/${userId}/attending?limit=10&include_past=true  (other, public)
```

### EventCard.jsx (139 lines)

**Purpose:** Compact event summary card, used only by `ProfileEvents.jsx`.

**Key Features:** Relative time-status badge (Today / Tomorrow / N days / Past Event, color-coded), a rotating emoji icon, and date/time/location/attendee-count rows.

**Props:** `event`, `onEventClick`

**API Integration:** None — presentational only.

### FollowerModal.jsx (314 lines) / FollowingModal.jsx (317 lines)

**Purpose:** Portal-rendered modals listing a profile's followers / following, opened from `Profile.jsx`'s stat buttons.

**Key Features:**
- Structurally near-identical: both resolve "own profile" by decoding the JWT for a user id (falling back to a `/me` endpoint if decoding fails), both support per-row follow/unfollow, both use a theme-scoped custom scrollbar class and close on Escape/backdrop click
- `FollowingModal` removes a user from the visible list entirely when unfollowed (rather than just flipping a flag), since an unfollowed user shouldn't remain in "following"
- Clicking a row's avatar/name navigates to `/profile/:id` and closes the modal

**Props:** `isOpen`, `onClose`, `userId`, `isOwnProfile`

**API Integration:**
```javascript
// FollowerModal
GET ${API_BASE_URL}/users/${targetUserId}/followers   (fallback: /users/me/followers)
// FollowingModal
GET ${API_BASE_URL}/users/${targetUserId}/following    (fallback: /users/me/following)
// Both
POST ${API_BASE_URL}/users/${id}/follow
```

### Likes.jsx (197 lines)

**Purpose:** Full paginated list of the current user's liked posts, routed at `/likes` (reached from `Profile.jsx` via `/likes?from=profile`, which shows a back button).

**Key Features:** "Load More" pagination, reuses the shared `PostItem` for rendering, shows a running total of liked posts.

**State:** `likedPosts`, `loading`, `error`, `page`, `hasMore`, `totalLiked`, `loadingMore`

**API Integration:**
```javascript
GET ${API_BASE_URL}/posts/liked?page=${page}&limit=20
```

## Related Documentation

- [src/components/pages/README.md](../README.md) — sibling top-level pages
- [src/components/pages/home/events/README.md](../home/events/README.md) — `EventModal`, opened from `ProfileEvents`
- [src/components/badges/README.md](/src/components/badges/README.md) — `UserAvatar`, `OgBadge` used throughout Profile
- [src/contexts/README.md](/src/contexts/README.md) — theme context used across all files here
