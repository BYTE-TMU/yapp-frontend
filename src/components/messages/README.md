# Messaging Components

## Overview

This folder implements the direct-messaging feature: the conversation list, an individual chat thread with real-time updates, message composition (text, emoji, image attachments), typing indicators, and a sidebar-style list of event discussion threads. Real-time delivery is handled by `messageService` (a WebSocket-based service in `src/services/`) rather than by these components directly — `MessageChat.jsx` is the orchestrator that wires `messageService` subscriptions into local component state. A small `utils/` subfolder provides Eastern-time formatting helpers and JWT/user-lookup helpers shared across the chat components.

## Component Architecture

```
MessagesList (conversation list)          EventsList (event discussion threads)
        │
        ▼ (on conversation select)
MessageChat  ─── owns WebSocket subscription lifecycle via messageService
   ├── ChatHeader     (participant info, typing status)
   ├── MessageList     ── MessageBubble (×N, grouped)
   │                  └── DateSeparator, TypingIndicator
   └── MessageInput    ── EmojiPicker
```

### ChatHeader.jsx (95 lines)

**Purpose:** Header bar for an open chat thread — participant avatar, name, verified badge, and typing status.

**Key Features:**
- Clicking the avatar or username navigates to `/profile/${conversation.other_participant?._id}` via `useNavigate`
- Renders a verified checkmark icon when `other_participant.verified` is true
- Shows a "typing..." status line built from `typingUsers` (singular/dual/"N people" phrasing)
- Optional mobile back button (`onBack` prop)

**Props:** `conversation`, `getProfilePictureUrl`, `typingUsers` (default `[]`), `onBack`

**Imports:** `UserAvatar` from `@/components/badges/UserAvatar`

---

### DateSeperator.jsx (12 lines)

**Purpose:** Small pill showing "Today" / "Yesterday" / a full date between groups of messages.

**Key Features:** Delegates formatting entirely to `formatDateSeparator` from `./utils/easternTimeUtils`.

**Props:** `createdAt`

---

### EmojiPicker.jsx (39 lines)

**Purpose:** A static grid emoji picker popover for message composition.

**Key Features:** Hardcoded list of ~150 emoji rendered in an 8-column grid; no search/filter/categories.

**Props:** `onEmojiClick(emoji)`

---

### EventsList.jsx (214 lines)

**Purpose:** Lists the events the current user is attending, as an alternate "conversations" tab that links into per-event discussion threads.

**Key Features:**
- Fetches on mount and exposes a manual "Try Again" retry button on error
- Formats relative dates (Today/Tomorrow/weekday/short date) and times locally (not via `utils/easternTimeUtils`)
- Clicking an event navigates to `/events/${event._id}/thread`
- Accepts an `externalLoading` prop that ORs with its own internal loading state

**Props:** `loading` (external loading flag, default combined with internal state)

**State Management:** `events`, `loading`, `error`

**API Integration:**
```javascript
GET ${API_BASE_URL}/events/attending?limit=50&include_past=false
Headers: Authorization: Bearer <token> (if present), Content-Type: application/json
```

---

### MessageBubble.jsx (322 lines)

**Purpose:** Renders a single message — text and/or image attachment — with grouped-bubble rounding, edited indicator, status icon, and timestamp-on-tap.

**Key Features:**
- Wrapped in `React.memo` with the component-internal comment noting this is a deliberate fix to prevent unnecessary re-renders
- For non-optimistic image messages with an `attachment_s3_key`, fetches a presigned URL rather than trusting a public `attachment_url` (private S3 attachments)
- Optimistic messages (`message.isOptimistic`) use `attachment_url` directly, skipping the presign fetch
- Click toggles a timestamp under the bubble (`toggleTimeDisplay`)
- Status icon reflects one of four states: `sending` (spinner), `queued` (clock icon), `failed` (alert icon), `sent` (checkmark) — all memoized via `useMemo`
- Bubble corner-rounding varies based on `isFirstInGroup`/`isLastInGroup` to visually merge consecutive messages from the same sender
- Theme-aware via `useTheme()` from `@/contexts/ThemeContext`

**Props:** `message`, `isMyMessage`, `isFirstInGroup`, `isLastInGroup`, `showAvatar`, `showSender`, `getProfilePictureUrl`

**State Management:** `showTime`, `imageError`, `imageUrl`, `loadingImage`

**API Integration:**
```javascript
GET ${API_BASE_URL}/messages/attachment/${encodeURIComponent(s3_key)}
Headers: Authorization: Bearer <token>
Response: { presigned_url }
// Only called for real (non-optimistic) image messages with an attachment_s3_key
```

---

### MessageChat.jsx (847 lines)

**Purpose:** The main chat-thread orchestrator — owns the WebSocket subscription lifecycle, message state, pagination, optimistic sending, and typing indicators for one open conversation. Composes `ChatHeader`, `MessageList`, and `MessageInput`.

**Key Features:**
- On conversation change, resets all local state, ensures `messageService` is connected, fetches the first page of messages, and subscribes to both message and typing events for that conversation ID; cleans up subscriptions on unmount/conversation change
- Optimistic send: builds a temporary message with a `temp_${Date.now()}_${Math.random()}` id and `isOptimistic: true`, inserts it immediately, then replaces it in place once the real message round-trips through the WebSocket subscription (with a 5-second fallback timer in case the subscription is slow)
- Deduplicates incoming messages via a `messagesRef` (a `Map` of processed message IDs) plus a secondary content+sender+timestamp-proximity check, since the same message can otherwise arrive via both the fetch and the subscription
- Normalizes sender info for the current user's own messages to always show `{ username: 'You' }`, overriding whatever the server sent — commented as a deliberate fix for account-switching bugs
- Infinite-scroll pagination for older messages (50 per page) triggered when the scroll container nears the top, with scroll-position preservation so the viewport doesn't jump
- Tracks connection status (`connected`/`disconnected`/`failed`) from `messageService` and shows a dismissible offline banner with a manual "Retry" button; reconnection triggers a "quiet" resync (`fetchMessagesQuietly`) without a full loading screen
- Smart auto-scroll: only scrolls to the bottom automatically if the user was already near the bottom when a new message arrives

**Props:** `conversation`, `onNewMessage`, `onBack`

**State Management:** `messages`, `loading`, `sending`, `connectionStatus`, `retryCount`, `showOfflineMessage`, `typingUsers`, `loadingOlderMessages`, `hasMoreMessages`, `currentPage` — plus numerous refs for scroll position, dedup tracking, and subscription handles

**API Integration:** Does not call `fetch` directly — all network/real-time I/O goes through `messageService` (`src/services/messageService.js`):
```javascript
messageService.connect()
messageService.getMessages(conversationId, page, perPage)
messageService.sendMessage(conversationId, senderId, content, attachedImage)
messageService.subscribeToMessages(conversationId, handler)
messageService.subscribeToTyping(conversationId, handler)
messageService.startTyping(conversationId) / stopTyping(conversationId)
messageService.markConversationAsRead(conversationId)  // (used by MessagesList, not this file)
```

**Imports:** `useTheme` from `../../contexts/ThemeContext`; `showOfflineError`/`showSendMessageError` from `../../utils/toastNotifications`; time helpers from `./utils/easternTimeUtils`; `getCurrentUserIdentifier`/`getProfilePictureUrl`/`fetchUserInfo` from `./utils/userUtils`

---

### MessageInput.jsx (506 lines)

**Purpose:** The composer bar — text input, emoji picker, image attachment, send button, typing-indicator triggers.

**Key Features:**
- Debounced typing indicator: calls `onTypingStart` once, then `onTypingStop` after 3 seconds of inactivity (cleared/reset on every keystroke); also stops on blur (with a 1s grace delay) and on unmount/conversation change
- Enter sends the message (Shift+Enter is not specially handled for newlines — the input is a single-line `<input>`, not a `<textarea>`)
- Image attachment: validates type (`png`/`jpg`/`jpeg`/`gif`/`webp`) and size (5MB max) client-side, shows toast errors via `utils/toastNotifications` on failure, then uploads before send so the message can include the resulting URL/S3 key
- Attached image shows a removable preview chip above the composer before sending
- Send button only appears once there's text or an attachment; disabled while `sending` or `disabled` (e.g. connection lost)
- Character counter appears once the message exceeds 800 characters (1000 max, enforced via `maxLength`)
- Emoji picker closes on outside click (`mousedown` listener on `emojiPickerRef`)

**Props:** `conversation`, `onSendMessage`, `sending`, `disabled`, `onTypingStart`, `onTypingStop`

**State Management:** `newMessage`, `showEmojiPicker`, `isTyping`, `uploadingImage`, `attachedImage`

**API Integration:**
```javascript
POST ${API_BASE_URL}/messages/upload-attachment
Headers: Authorization: Bearer <token>
Body: FormData { image: File }
Response: { imageUrl, s3_key, filename }
```

---

### MessageList.jsx (360 lines)

**Purpose:** Renders the scrollable message pane — groups consecutive same-sender messages, inserts date separators, shows a typing-indicator row, and manages scroll-to-bottom behavior.

**Key Features:**
- `forwardRef` — the scroll container ref is owned by `MessageChat.jsx` so it can drive both auto-scroll and the "load older messages" scroll-position logic
- Groups messages via `useMemo`: a new group starts when the sender changes, a date separator is due (`shouldShowDateSeparator`), or the gap since the previous message exceeds 5 minutes
- Auto-scrolls to bottom on initial load; for subsequent updates, only auto-scrolls if the user was already near the bottom (checked via `scrollHeight - scrollTop - clientHeight < 100`)
- Renders a "Loading older messages..." spinner at the top while paginating backward, and a "Beginning of conversation" divider once `hasMoreMessages` is false
- Empty state ("No messages yet") shown only when there are truly no messages, no typing users, and nothing is loading/sending
- Internally splits rendering into a memoized `MessageGroup` sub-component to avoid re-rendering unrelated groups

**Props:** `messages`, `currentUserIdentifier`, `getProfilePictureUrl`, `typingUsers`, `onScroll`, `loadingOlderMessages`, `hasMoreMessages`, `sending`

**Imports:** `MessageBubble`, `DateSeparator` (from `./DateSeperator`), `TypingIndicator`, `shouldShowDateSeparator` from `./utils/easternTimeUtils`, `getDefaultProfilePicture` from `../../utils/profileUtils`

---

### MessagePerson.jsx (231 lines)

**Purpose:** A single row in the conversation list — avatar, name, last-message preview, timestamp, unread indicator.

**Key Features:**
- Resolves the current user's identifier from either `localStorage.getItem('user')` (JSON) or by decoding the JWT in `localStorage.getItem('token')`, trying several possible payload field names (`userId`, `id`, `_id`, `user_id`, `sub`, `username`)
- Unread detection prefers the backend-provided `unread_count` field; falls back to comparing the last message's sender against the current user if `unread_count` isn't present
- A selected conversation is never shown as unread, regardless of `unread_count`
- Truncates the last-message preview to 40 characters
- Shows an online-status dot when `other_participant.online` is true, and either a numeric unread badge (`99+` cap) or a plain pulsing dot depending on the count

**Props:** `conversation`, `isSelected`, `onClick`, `formatTime`

**Imports:** `UserAvatar` from `../badges/UserAvatar`; `getProfilePictureUrl`/`getDefaultProfilePicture` from `../../utils/profileUtils`

---

### MessagesList.jsx (177 lines)

**Purpose:** The conversation list panel — sorts and renders conversations as `MessagePerson` rows, and marks the selected conversation as read.

**Key Features:**
- On `selectedConversation` change, calls `messageService.markConversationAsRead` after a 1-second delay (to let messages load first), then notifies the parent via `onConversationsUpdate` if any messages were actually marked read
- Sorts conversations by `last_message_at` (falling back to `created_at`), newest first
- Separate loading and empty states

**Props:** `conversations`, `selectedConversation`, `onConversationSelect`, `loading`, `onConversationsUpdate`

**API Integration:**
```javascript
messageService.markConversationAsRead(conversationId) // returns count of messages marked read
```

---

### RealtimeDebugger.jsx (215 lines)

**Purpose:** A developer-only debug panel for exercising `messageService`'s real-time pub/sub directly — not used in normal user-facing flows. Useful for manually verifying that messages sent in one browser tab arrive live in another.

**Key Features:**
- Shows subscription status, live message count, and a scrolling debug log (last 20 entries)
- Buttons to send a test message, re-test the connection, list active subscriptions, and clear logs

**Props:** `conversationId`, `currentUserId`

**API Integration:**
```javascript
messageService.getMessages(conversationId)
messageService.subscribeToMessages(conversationId, handler)
messageService.sendMessage(conversationId, currentUserId, testMessage)
messageService.getActiveSubscriptions()
```

---

### TypingIndicator.jsx (48 lines)

**Purpose:** Animated "..." bubble shown when one or more users are typing.

**Key Features:** Three staggered bouncing dots plus text (singular/dual/"N people" phrasing, matching `ChatHeader`'s wording). Returns `null` when `typingUsers` is empty.

**Props:** `typingUsers` (default `[]`)

**Imports:** `useTheme` from `../../contexts/ThemeContext`

---

## messages/utils/

Two small utility modules shared by the chat components above, kept in their own subfolder rather than warranting a separate README.

### easternTimeUtils.js (182 lines)

**Purpose:** Centralizes all message/conversation timestamp formatting in `America/New_York` time, so timestamps are consistent regardless of the viewer's local timezone.

**Key Features:**
- `formatMessageTime(timestamp)` — `h:mm AM/PM` in Eastern time, used by `MessageBubble`
- `formatDateSeparator(timestamp)` — "Today" / "Yesterday" / full weekday+date, used by `DateSeparator`
- `shouldShowDateSeparator(currentMessage, previousMessage)` — compares Eastern-time calendar dates, used by `MessageList` for grouping
- `sortMessagesByTime(messages)` — ascending sort (oldest first), used by `MessageChat`
- `formatConversationTime(timestamp)` — relative "now"/"Xm"/"Xh"/"Xd"/short-date, used for conversation list timestamps
- `sortConversationsByTime(conversations)` — descending sort by `last_message_at`/`created_at`
- Every function wraps its logic in try/catch and returns a safe empty/default value on invalid dates

---

### userUtils.js (86 lines)

**Purpose:** JWT decoding and user-lookup helpers used by `MessageChat.jsx`.

**Key Features:**
- `getCurrentUserIdentifier()` — decodes the JWT in `localStorage`, returns `payload.user_id` as a string; clears stale `localStorage.user` data if no token is present
- `getProfilePictureUrl(profilePic)` — returns the picture as-is if it's already a full URL, otherwise builds a URL against a **hardcoded `http://localhost:5000`** (does not use `API_BASE_URL` from `src/services/config.js` — worth checking before relying on this in non-local environments; `src/utils/profileUtils.js` is the environment-aware equivalent used elsewhere in this folder)
- `fetchUserInfo(userId)` — tries several **hardcoded `http://localhost:5000`** endpoint guesses (`/users/profile/:id`, `/users/:id/profile`, `/users/:id`, `/api/users/:id`) in sequence until one responds `ok`, falling back to a synthesized `{ _id, username: 'User ####', profile_picture: '' }` if all fail

**API Integration:** See above — note both functions bypass `API_BASE_URL` and target `localhost:5000` directly.

## Related Documentation

- [src/services/messageService.js](../../services/) — WebSocket connection, subscription, and send/receive logic that `MessageChat.jsx` depends on
- [src/services/config.js](../../services/) — `API_BASE_URL` used by most fetches in this folder (see the `userUtils.js` note above for the exception)
- [src/contexts/README.md](../../contexts/README.md) — `ThemeContext`, used by several components here
- [src/components/badges/README.md](../badges/README.md) — `UserAvatar`, used by `ChatHeader` and `MessagePerson`
- [src/utils/](../../utils/) — `profileUtils.js` and `toastNotifications.js`, used throughout this folder
