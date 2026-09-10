# Home Feed

## Overview

This folder contains the main authenticated feed page (`Home.jsx`) and its directly-owned `posts/` subfolder (`PostItem.jsx`). `Home.jsx` is the landing page after login: it renders the events strip, the post feed (with Recent/Following/Trending tabs), the activities sidebar, and — as of the most recent change — the Cyber Summit TMU-exclusive banner and promo modal. Two nested folders hold the rest of the tree's complexity and have their own READMEs: [`events/`](./events/README.md) (event cards, event modal, ticketing/check-in, event threads) and [`activities/`](./activities/README.md) (Would You Rather, What's On Your Mind, Daily Motivation).

### FileName reference

| File | Lines | Role |
|---|---|---|
| `Home.jsx` | 400 | Main feed page |
| `posts/PostItem.jsx` | 431 | Single post card (like/delete/comment) |

## Files

### Home.jsx (400 lines)

**Purpose:** The primary post-login landing page. Composes the events strip, the tabbed post feed, the activities sidebar, and the Cyber Summit banner/promo modal.

**Key Features:**
- Resolves the current user client-side: tries `sessionStorage.getItem('currentUser')` first, then falls back to decoding the JWT payload from `localStorage.getItem('token')` (base64-decoding the middle segment) and caching the result back into `sessionStorage`.
- Three feed tabs — `recent`, `following`, `trending` — switched via `handleFeedTypeChange`, each hitting a different backend endpoint (see API Integration below). Trending additionally has a `today` / `week` / `month` period selector (`handleTrendingPeriodChange`).
- Infinite scroll on the `recent`/`following` feeds: a scroll listener on the page's own scrollable container (`mainContentRef`, not `document`) calls `fetchPosts` for the next page once the user is within 1000px of the bottom. Trending is treated as a **fixed top-3 snapshot** — `hasMore` is forced `false` and no scroll-triggered pagination runs for it.
- A `RefreshAnimation` wrapper (from `@/components/common/RefreshAnimation`) smooths out feed-type/period switches and manual refreshes; `LoadingDots` (from `@/components/common/LoadingDots`) is the loading indicator.
- Renders `EventItem` inline (events strip) plus an `EventItemModal` opened via "View All Events", and `HomepageActivities` in a 40%-width sidebar alongside the 60%-width post list.
- **Cyber Summit integration** (new): on mount, a dedicated `useEffect` calls `GET ${API_BASE_URL}/users/me` (with the bearer token) and reads `data.profile?.is_verified`. Eligibility is computed as `data.profile?.is_verified === true && isCyberSummitWindowOpen()`, where `isCyberSummitWindowOpen()` is imported from `@/components/pages/cyber-summit/constants` and compares `new Date()` against a hardcoded cutoff (`CYBER_SUMMIT_CUTOFF = 2026-10-01T23:59:00-04:00`, i.e. Oct 1, 2026, 11:59 PM EDT). This means the actual verification flag consumed by the frontend is `is_verified` on the `/users/me` profile response — not a field named `is_tmu_verified`.
  - If eligible, `CyberSummitBanner` (imported from `@/components/pages/cyber-summit/CyberSummitBanner`) is rendered above the Events section with `eligible={cyberSummitEligible}` (the component itself returns `null` when `eligible` is falsy, so it's always mounted but conditionally renders).
  - If eligible **and** the user hasn't dismissed it before (checked via `localStorage.getItem('cyberSummitPromoSeen')`), a one-time interstitial `CyberSummitPromoModal` (from `@/components/pages/cyber-summit/CyberSummitPromoModal`) is shown; closing it (`closeCyberSummitPromo`) sets `localStorage.setItem('cyberSummitPromoSeen', 'true')` so it won't reappear on subsequent visits.
  - Eligibility/window logic is entirely client-side (fetches `/users/me`, computes the cutoff in JS) — there is no dedicated `/cyber-summit/...` backend endpoint called from this file.

**State:**
- `posts`, `loading`, `error`, `page`, `hasMore`, `loadingMore` — feed data and pagination
- `currentUser` — decoded/cached user object
- `isEventModalOpen` — controls the "View All Events" `EventItemModal`
- `cyberSummitEligible` — result of the `/users/me` verification + window check
- `showCyberSummitPromo` — controls the one-time `CyberSummitPromoModal`
- `feedType` (`'recent' | 'following' | 'trending'`), `trendingPeriod` (`'today' | 'week' | 'month'`)
- `refreshing` — drives `RefreshAnimation` during feed-type/period changes and manual refresh
- `mainContentRef` — ref to the scrollable page container used for the custom scroll listener

**API Integration:**
```javascript
GET ${API_BASE_URL}/users/me
Headers: { Authorization: `Bearer ${token}` }
// reads response.profile?.is_verified for Cyber Summit eligibility

GET ${API_BASE_URL}/posts/feed?page={pageNum}&limit=20
// default 'recent' feed, no auth header required

GET ${API_BASE_URL}/posts/following-feed?page={pageNum}&limit=20
Headers: { Authorization: `Bearer ${token}` }  // only attached for this feed type

GET ${API_BASE_URL}/posts/trending?page=1&limit=3&period={today|week|month}
// fixed top-3 snapshot, always page=1, no further pagination
```

**Child components rendered:** `PostItem` (`./posts/PostItem`), `EventItem` and `EventItemModal` (`./events/`), `HomepageActivities` (`./activities/HomepageActivities`), `CyberSummitBanner` and `CyberSummitPromoModal` (`../cyber-summit/`), `RefreshAnimation` and `LoadingDots` (`@/components/common/`).

---

### posts/PostItem.jsx (431 lines)

**Purpose:** Renders a single post card in the feed — author avatar/username, timestamp, text content, up to 4 images in a responsive grid, like button, comment-count button, and an owner-only delete flow.

**Key Features:**
- Fetches the current user on mount (only if a token exists) to determine `isOwnPost` (`currentUser._id === post.user_id`), which gates the "more options" (`MoreHorizontal`) menu and delete action.
- Checks like status per-post on mount (`checkLikeStatus`, keyed off `post._id`) so the heart icon reflects whether *this* logged-in user has already liked the post.
- Optimistic-ish like toggling: `handleLike` POSTs and then sets `liked`/`likesCount` from the response.
- Delete flow: confirmation popup (`showDeleteConfirm`) rendered as a fixed-position overlay, then `DELETE` request; on success calls the `onPostDeleted(post._id)` callback prop so the parent list can remove the post, and fires a `showPostDeletedSuccess()` toast.
- Renders up to 4 images with distinct grid layouts per count (1: single large, 2: two-column, 3: one large + two-column, 4: 2x2 grid); broken images are hidden via `onError` (`e.target.style.display = 'none'`).
- Uses shared `showLoginRequired`, `showPostDeletedSuccess`, `showPostDeleteError`, `showPostLikeError`, `showNetworkError` toast helpers from `@/utils/toastNotifications`, and `UserAvatar` from `@/components/badges/UserAvatar` for the profile picture (click-to-navigate to `/profile/{user_id}`).
- Clicking the username, avatar, or comment icon navigates via `react-router-dom`'s `useNavigate` (`/profile/{user_id}` or `/post/{post._id}/comments`); the like button does not navigate.

**Props:**
```javascript
{
  post: object,           // Required — post document (_id, user_id, username, content, images[], likes_count, comments_count, created_at, ...)
  onPostDeleted: function // Optional — callback(post._id) invoked after a successful delete
}
```

**State:**
- `liked`, `likesCount` — like UI state, seeded from `post.likes_count` and refined by `checkLikeStatus`
- `loading` — like button in-flight guard
- `deleting` — delete button in-flight guard
- `showDeleteConfirm` — delete confirmation overlay visibility
- `showMenu` — "more options" dropdown visibility
- `currentUser` — fetched user profile, used only to compute `isOwnPost`

**API Integration:**
```javascript
GET ${API_BASE_URL}/users/me
Headers: { Authorization: `Bearer ${token}` }, credentials: 'include'

GET ${API_BASE_URL}/posts/{post._id}/like-status
Headers: { Authorization: `Bearer ${token}` }

POST ${API_BASE_URL}/posts/{post._id}/like
Headers: { Authorization: `Bearer ${token}` }

DELETE ${API_BASE_URL}/posts/{post._id}
Headers: { Authorization: `Bearer ${token}` }
```

## Index — nested subfolders

- [`events/README.md`](./events/README.md) — `EventItem`, `EventModal`, `EventItemModal`, `EventThread`, `AttendeeManagementPanel`, `ScannerModal`, `TicketQRModal`, and the `thread/` sub-subfolder (event-thread chat UI).
- [`activities/README.md`](./activities/README.md) — `HomepageActivities` plus the nested `DailyMotivation/`, `WOYM/`, and `WYR/` subfolders.

## Related Documentation

- [src/components/pages/cyber-summit/](../cyber-summit/) — `CyberSummitBanner`, `CyberSummitPromoModal`, and the `constants.js` eligibility window/pricing values consumed by `Home.jsx`
- [src/components/badges/UserAvatar.jsx](../../../badges/) — avatar component used by `PostItem`
- [src/utils/toastNotifications.js](../../../../utils/) — toast helpers used by `PostItem`
- [src/services/config.js](../../../../services/) — `API_BASE_URL` used throughout
- [src/contexts/README.md](../../../../contexts/README.md) — `ThemeContext` used by `PostItem`
