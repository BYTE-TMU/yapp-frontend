# Home Activities

## Overview

This folder contains the "Activities" sidebar shown alongside the post feed on the home page: an auto-cycling carousel (`HomepageActivities.jsx`) that rotates between three independent mini-features, each living in its own nested subfolder — `WYR/` (Would You Rather / "Hot Takes"), `WOYM/` (What's On Your Mind), and `DailyMotivation/`. Each subfolder is only 1-2 files, so — per the style guide for this pass — they're all documented together in this single README with a `##` subheading per subfolder rather than three more nested READMEs.

| File | Lines | Role |
|---|---|---|
| `HomepageActivities.jsx` | 139 | Carousel shell that cycles the three activities below |
| `WYR/WouldYouRather.jsx` | 393 | "Hot Takes" list — fetch/create/vote/delete |
| `WYR/WYRItem.jsx` | 301 | Single hot-take card (vote buttons or animated result bars) |
| `WOYM/WhatsOnYourMind.jsx` | 343 | Mini status-post feed — fetch/create/delete |
| `WOYM/MindPost.jsx` | 118 | Single status-post speech bubble |
| `DailyMotivation/DailyMotivation.jsx` | 63 | Static motivational-quotes card |

## HomepageActivities.jsx (139 lines)

**Purpose:** The carousel shell rendered by `Home.jsx` (`<HomepageActivities />`). Owns no activity data itself — it only manages which of the three child activities (`WouldYouRather`, `WhatsOnYourMind`, `DailyMotivation`) is currently visible and animates the transition between them.

**Key Features:**
- Horizontal slide transition (`translateX(-${current * 100}%)`) between the three activities, each rendered as a full-width flex child so all three are mounted simultaneously (not lazy-mounted per slide).
- Auto-cycles every 3 seconds via `setInterval`, advancing to `(current + 1) % activities.length`; pauses on mouse hover/enter (`isPaused`, set by `onMouseEnter`/`onMouseLeave`).
- Dot indicators below the carousel allow manual navigation (`handleDotClick`).
- Dynamically measures and animates the container height (`ResizeObserver` on the active slide's `scrollHeight`, minimum 240px) so the carousel resizes smoothly as each activity's content height differs (e.g. `WhatsOnYourMind`'s post list vs. `DailyMotivation`'s fixed 3 quotes).
- Contains an unused `PlaceholderActivity` helper component (renders a "(Coming soon)" placeholder) that isn't referenced by the current `activities` array — leftover scaffolding for a not-yet-added fourth activity.

**Props:** None.

**State:** `current` (active slide index), `prev`, `isAnimating`, `containerHeight`, `isPaused`

**API Integration:** None directly — purely a layout/animation shell around the three child components below, which each fetch their own data.

---

## WYR/ — Would You Rather ("Hot Takes")

Despite the folder name, the UI copy and component logic present this as "Hot Takes": single-statement prompts other users vote 🔥 (fire) or 🗑️ (garbage) on, rather than classic two-option "would you rather" pairs.

### WYR/WouldYouRather.jsx (393 lines)

**Purpose:** Fetches and lists hot-take questions, handles voting, question creation, and question deletion.

**Key Features:**
- Fetches all questions on mount and again on a 48-hour `setInterval` ("to avoid an ever-growing list" per an inline comment) — not a live poll, just a very slow periodic refresh.
- `reorderQuestions`: unvoted questions are Fisher-Yates shuffled and shown first; already-voted questions sink to the bottom — recomputed only on fetch/create, not after every vote (a vote updates the question in place via `setQuestions` map without reordering, "until the next page load/refresh").
- Inline create-question form (toggled by `showCreateForm`) with client-side validation: required, 2-200 characters.
- Delete is owner-only: `canDelete` compares the JWT-decoded `currentUserId` (checked across `sub`/`_id`/`id`/`user_id` token shapes) against `question.created_by`; confirmed via `showDeleteConfirmation('hot take')` toast before the DELETE call.
- Extensive `console.log` debug tracing left in (`🔍 Frontend: ...`) around every fetch/vote call.

**Props:** None.

**State:** `questions`, `loading`, `error`, `deleting`, `showCreateForm`, `newStatement`, `creating`; `currentUserId` derived via `useMemo` from the JWT.

**API Integration:**
```javascript
const API_URL = `${API_BASE_URL}/api/activities/wouldyourather`;

GET    ${API_URL}                    // list questions (with each question's user_vote if authenticated)
POST    ${API_URL}/vote              // Body: { option: 'fire'|'garbage', question_id }
POST    ${API_URL}/create            // Body: { statement }
DELETE  ${API_URL}/{questionId}
```
All requests: `mode: 'cors'`, `credentials: 'include'`, and `Authorization: Bearer <token>` when a token exists.

### WYR/WYRItem.jsx (301 lines)

**Purpose:** Renders one hot-take card — either the two vote buttons (before the current user has voted) or animated result bars (after voting).

**Key Features:**
- `showResults` is driven entirely by the `userVote` prop (`'fire'` / `'garbage'` / falsy) — once a vote exists, the card permanently shows results for that question (no "vote again" or "undo" path).
- Result bars animate from a neutral 50/50 split up to the real percentages on a short delay (`setTimeout(..., 50)`) "to avoid both bars growing from the left" (per the code's own comment), then transition width over 700ms.
- Each result bar has a minimum 5% width floor so small percentages remain visible/clickable-looking, and the user's own vote gets a colored ring highlight.
- Owner-only inline delete confirmation (shown/hidden via local `showDeleteConfirm` state, distinct from the parent's toast-based confirmation used elsewhere in this folder).
- Contains multiple `console.log` debug statements tracing prop values and vote handling.

**Props:**
```javascript
{
  question: object,    // { _id, statement, votes_fire, votes_garbage, creator_name, created_at, ... }
  onVote: function,    // (questionId, 'fire'|'garbage') => Promise
  onDelete: function,  // (questionId) => void
  userVote: 'fire' | 'garbage' | null,
  canDelete: boolean,
}
```

**State:** `voting`, `votingOption`, `showDeleteConfirm`, `clickedButton` (brief press animation), `animatedPercentageFire`, `animatedPercentageGarbage`

**API Integration:** None directly — voting/deleting are delegated to the `onVote`/`onDelete` callback props implemented in `WouldYouRather.jsx`.

---

## WOYM/ — What's On Your Mind

### WOYM/WhatsOnYourMind.jsx (343 lines)

**Purpose:** A miniature status-post feed inside the activities sidebar — users write a short text post, see everyone else's, and can delete their own.

**Key Features:**
- Fetches the current user (`/users/me`) separately from the posts list, then uses `reorderPosts` to shuffle other users' posts to the top and push the current user's own posts to the bottom, recomputed after every fetch, create, and delete.
- Inline composer at the top (not a modal): textarea capped at 500 characters with a live counter, submit disabled while empty or posting.
- Owner-only delete is inferred from the post payload's `is_own_post` flag (set server-side) rather than a client-side ID comparison — see `MindPost.jsx` below.
- Same extensive `console.log` debug tracing pattern as `WouldYouRather.jsx` (`🔍 Frontend: ...`).

**Props:** None.

**State:** `posts`, `loading`, `error`, `deleting`, `currentUser`, `newPost`, `posting`

**API Integration:**
```javascript
const API_URL = `${API_BASE_URL}/api/activities/whatsonmind`;

GET    ${API_BASE_URL}/users/me       // fetch current user for avatar + reordering
GET    ${API_URL}                     // list posts
POST   ${API_URL}/create              // Body: { content }
DELETE ${API_URL}/{postId}
```

### WOYM/MindPost.jsx (118 lines)

**Purpose:** Renders a single "What's on your mind" post as a speech-bubble card with avatar, username, relative timestamp, and an owner-only delete button.

**Key Features:**
- Relative timestamp formatting: "Just now" / "{n}m ago" / "{n}h ago" / "{n}d ago" / falls back to a localized date once older than 7 days.
- Delete button is rendered only when `post.is_own_post` is truthy (a flag set by the backend, not computed client-side) and shows an inline spinner while `isDeleting`.
- Uses `getProfilePictureUrl`/`getDefaultProfilePicture` from `@/utils/profileUtils` for the avatar, with an `onError` fallback.

**Props:**
```javascript
{
  post: object,        // { _id, username, profile_picture, content, created_at, is_own_post }
  onDelete: function,  // (postId) => void
  isDeleting: boolean,
}
```

**State:** None (fully controlled by props).

**API Integration:** None directly — `onDelete` is the callback prop implemented in `WhatsOnYourMind.jsx`.

---

## DailyMotivation/

### DailyMotivation/DailyMotivation.jsx (63 lines)

**Purpose:** A static card showing three hardcoded motivational quotes. The simplest of the three activities.

**Key Features:**
- Quotes (`motives` state) are a hardcoded array of `{ text, author }` initialized both in `useState`'s initializer and redundantly re-set to the identical array inside a mount-time `useEffect` — there is no fetch, randomization, or actual "daily" rotation despite the component and section name; an inline comment notes "You can add logic here to fetch different quotes daily" as a TODO.
- Purely presentational otherwise: a bordered card with a title and each quote rendered in its own bordered sub-box.

**Props:** None.

**State:** `motives` (static array, effectively never changes).

**API Integration:** None — no network calls in this file.

## Related Documentation

- [`../README.md`](../README.md) — parent `Home.jsx`, which renders `HomepageActivities` in the sidebar next to the post feed.
- [src/services/config.js](../../../../../services/) — `API_BASE_URL`, used by `WouldYouRather.jsx` and `WhatsOnYourMind.jsx`.
- [src/utils/profileUtils.js](../../../../../utils/) — `getProfilePictureUrl`/`getDefaultProfilePicture`, used by `MindPost.jsx` and `WhatsOnYourMind.jsx`.
- [src/utils/toastNotifications.js](../../../../../utils/) — `showDeleteConfirmation`, used by both `WouldYouRather.jsx` and `WhatsOnYourMind.jsx` for delete confirmations.
- [src/contexts/README.md](../../../../../contexts/README.md) — `ThemeContext`, used across every file in this folder for dark/light styling.
- [src/components/ui/](../../../../ui/) — shared `Button` primitive used by `WhatsOnYourMind.jsx` and `WouldYouRather.jsx`.
