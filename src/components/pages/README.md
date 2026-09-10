# Pages — Top-Level Routes

## Overview

This folder holds the page-level components rendered directly by `AuthRoutes.jsx` — the screens a user lands on for a given URL, as opposed to the smaller reusable pieces under `src/components/`. The files documented here are the ones that live directly in `src/components/pages/` (no subfolder); each feature area with more than a couple of files (create flow, home feed, profile, settings, the campus map, and the Cyber Summit promo) has its own subfolder with its own README, indexed at the bottom of this file.

### CommentsPage.jsx (316 lines)

**Purpose:** Full-page post detail view with its comment thread, routed at `/post/:postId/comments`.

**Key Features:**
- Renders the parent post via the shared `PostItem` component, then a comment composer and list below it
- 500-character comment limit with live counter
- Delete button on comments shown only while a token is present in `localStorage` (client-side check only — the backend still enforces ownership)
- Inline SVG data-URI fallback avatar when a commenter has no `profile_picture`
- "Go Back" / "Try Again" states for missing posts and network errors

**State:** `post`, `comments`, `newComment`, `loading`, `submitting`, `error`

**API Integration:**
```javascript
GET    ${API_BASE_URL}/comments/post/${postId}
POST   ${API_BASE_URL}/comments/create   Body: { post_id, content }
DELETE ${API_BASE_URL}/comments/${commentId}
```

### Feedback.jsx (327 lines)

**Purpose:** In-app feedback form at `/feedback` (general / bug report / feature request).

**Key Features:**
- Type selector (general, bug, feature), 5-star rating picker, subject/message fields, optional email
- Two-stage success UI: a brief "Success!" animation, then a "Thank You" panel with a "Submit Another Feedback" action

**State:** `feedback` (`type`, `rating`, `subject`, `message`, `email`), `isSubmitting`, `submitted`, `submitSuccess`

**API Integration:**
```javascript
POST ${API_BASE_URL}/api/feedback
Body: { type, rating, subject, message, email }
```

### LandingPage.jsx (770 lines)

**Purpose:** Public marketing homepage at `/` for logged-out visitors.

**Key Features:**
- Typewriter-effect rotating hero tagline
- Custom `useReveal` (IntersectionObserver scroll-reveal) and `useMarquee` (draggable, auto-scrolling "day in the life" ticker) hooks defined locally in the file
- Hero background video is dynamically `import()`-ed only on `md+` screens (`matchMedia('(min-width: 768px)')`) to avoid a ~1.5MB download on mobile
- Phone-mockup app preview, testimonials, and an FAQ accordion, all static content
- Links to `/login`, `/signup`, `/privacy`, `/terms`

**State:** `openFaq`, `typedText`, `currentTextIndex`, `videoSrc`, plus one reveal-ref pair per section

**API Integration:** None — fully static/marketing content.

### Messages.jsx (496 lines)

**Purpose:** Messaging inbox at `/messages`, with a tab switch between direct-message conversations and event discussion threads.

**Key Features:**
- Split view: conversation/event list on the left, active chat or a placeholder on the right (collapses to a single pane on mobile, toggled by whether a conversation is selected)
- Deep-links into a specific conversation via the `?conversation=<id>` query param
- Background-syncs MongoDB conversations into Supabase (`messageService.ensureConversationExists`) so the realtime layer knows about them, then subscribes to each conversation for live message updates
- Delegates rendering to `MessagesList`, `MessageChat`, and `EventsList` (in `src/components/messages/`)

**State:** `selectedConversation`, `conversations`, `loading`, `activeTab` (`'messages'` | `'events'`)

**API Integration:**
```javascript
GET ${API_BASE_URL}/messages/conversations
GET ${API_BASE_URL}/messages/conversations/${conversationId}
```
Realtime updates come through `messageService` (Supabase), not REST polling.

### PrivacyPolicy.jsx (398 lines) / TermsAndConditions.jsx (376 lines)

**Purpose:** Static legal pages at `/privacy` and `/terms`, credited to BYTE (Build Your Technical Experience) at TMU, last updated March 27, 2026.

**Key Features:**
- Small local presentational helpers (`Section`, `SubSection`, `BulletList`, and — in `TermsAndConditions.jsx` only — `LabeledList`) used to lay out the legal copy
- Sticky header with the Yapp logo and a "Back" link to `/`

**API Integration:** None — static text content only.

### Trending.jsx (195 lines)

**Purpose:** Standalone trending-posts page, ranked by likes over a selectable period (today / this week / this month), with scroll-based infinite loading and `#1`, `#2`... rank badges on each `PostItem`.

> **Not currently routed.** There is no `<Route>` for it in `AuthRoutes.jsx`, and it isn't imported anywhere else — `Home.jsx` has its own separate, inline trending snapshot instead. Treat this file as orphaned/dead code unless a route is added.

**State:** `posts`, `loading`, `error`, `page`, `hasMore`, `loadingMore`, `trendingPeriod`

**API Integration:**
```javascript
GET ${API_BASE_URL}/posts/trending?page=${page}&limit=20&period=${trendingPeriod}
```

### Users.jsx (468 lines)

**Purpose:** User search and discovery page at `/users`.

**Key Features:**
- Debounced (300ms, 2-character minimum) live search by username or TMU email
- "People You Might Know" recommendations grid (logged-in users only) with mutual-connection counts and inline follow/unfollow
- Skeleton loading states for both the recommendations grid and the search results list

**State:** `searchQuery`, `users`, `loading`, `error`, `recommendations`, `recLoading`, `followingIds`

**API Integration:**
```javascript
GET  ${API_BASE_URL}/users/recommendations?limit=8
POST ${API_BASE_URL}/users/${userId}/follow
GET  ${API_BASE_URL}/users/search?q=${query}&limit=20
```

## Subfolders

Each has its own README with full component-level detail:

- [`create/`](./create/README.md) — post/event creation forms
- [`home/`](./home/README.md) — the main feed, events, and activities
- [`profile/`](./profile/README.md) — user profile, followers/following, friends
- [`settings/`](./settings/README.md) — account settings and password change
- [`waypoint/`](./waypoint/README.md) — the real-time campus map
- [`cyber-summit/`](./cyber-summit/README.md) — the TMU-exclusive Cyber Summit promo

## Related Documentation

- [src/AuthRoutes.jsx](/src/AuthRoutes.jsx) — route definitions for every page in this folder
- [src/contexts/README.md](/src/contexts/README.md) — theme context used throughout these pages
- [src/components/authentication/README.md](/src/components/authentication/README.md) — login/session flow that gates the private routes here
- [src/services/README.md](/src/services/README.md) — `API_BASE_URL`, `messageService`, and `locationiqService` used across these pages
