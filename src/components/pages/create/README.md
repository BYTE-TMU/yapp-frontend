# Create — Post & Event Composer

## Overview

This folder implements the `/create` page: a tabbed composer for making a new post or a new event. `Create.jsx` is the tab shell; `CreatePost.jsx` and `CreateEvent.jsx` are the two independent forms it switches between; `EventLocationMap.jsx` is a Leaflet map picker embedded inside the event form for choosing a location.

### Create.jsx (72 lines)

**Purpose:** Tab container that switches between `CreatePost` and `CreateEvent`, routed at `/create`.

**Key Features:** Post/Event tab switcher with animated active-state styling; glass-morphism form container that scales slightly when a child input is focused.

**State:** `activeTab` (`'post'` | `'event'`), `isFormFocused`

**API Integration:** None directly — all requests happen in the child forms.

### CreatePost.jsx (528 lines)

**Purpose:** Composer for a text/image post.

**Key Features:**
- 280-character counter that shifts color as the limit approaches
- Up to 4 image attachments, 5MB each, with previews and per-image removal
- Emoji picker, hashtag suggestions, and @mention suggestions — all backed by static, hardcoded lists in this file (the mention list is 5 mock users, not a live user search); each inserts text at the current cursor position in the textarea
- Click-outside handling closes any open dropdown

**State:** `content`, `isSubmittingPost`, `postMessage`, `postError`, `selectedImages`, `imagePreviewUrls`, `uploadingImages`, `showEmojiPicker`, `showHashtagSuggestions`, `showMentionSuggestions`

**API Integration:**
```javascript
POST ${API_BASE_URL}/posts/upload-image   (multipart FormData, once per image)
POST ${API_BASE_URL}/posts/create
Body: { content, images: [imageUrl, ...] }
```

### CreateEvent.jsx (570 lines)

**Purpose:** Composer for a new event.

**Key Features:**
- Optional cover image upload (5MB limit) with preview/remove
- Date and time pickers with human-readable formatted previews, date input floored at today
- Embeds `EventLocationMap` for an optional pinned location, with an editable custom location name that auto-fills from the resolved address (but won't overwrite a name the user already typed)
- Optional max-attendee cap
- Surfaces a distinct success message when the backend reports the event also created a Waypoint map pin (`data.waypoint_created`)

**State:** `eventTitle`, `eventDescription`, `eventDate`, `eventTime`, `eventLocation`, `locationTitle`, `maxAttendees`, `isSubmittingEvent`, `eventMessage`, `eventError`, `selectedImage`, `imagePreviewUrl`, `uploadingImage`

**API Integration:**
```javascript
POST ${API_BASE_URL}/events/upload-image   (multipart FormData)
POST ${API_BASE_URL}/events/create
Body: {
  title, description, event_date, event_time,
  location, location_title, latitude, longitude,
  max_attendees, image
}
```

### EventLocationMap.jsx (224 lines)

**Purpose:** Leaflet map picker embedded in `CreateEvent`, letting the user click a spot on campus (or search an address) to set the event's location.

**Key Features:**
- Toggleable map view, defaulting to TMU campus coordinates (`43.6577, -79.3788`)
- Clicking the map immediately reports raw coordinates so a pin appears instantly, then resolves a human-readable address in the background via reverse geocoding
- Embeds `LocationSearchBar` (`src/components/common/`) for address-based search-and-select
- Uses the same custom event-pin `L.divIcon` marker style as the main Waypoint map

**Props:** `selectedLocation`, `onLocationSelect`, `onLocationClear`

**API Integration:** Uses `reverseGeocode(lat, lng)` from `src/services/locationiqService.js`; map tiles from LocationIQ (`VITE_LOCATIONIQ_API_KEY`). No direct backend calls.

## Related Documentation

- [src/components/pages/README.md](../README.md) — sibling top-level pages
- [src/components/common/README.md](/src/components/common/README.md) — `LocationSearchBar`
- [src/services/README.md](/src/services/README.md) — `locationiqService`, `API_BASE_URL`
- [src/components/pages/waypoint/README.md](../waypoint/README.md) — the campus map that events can also appear on
