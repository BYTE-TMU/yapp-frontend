# Onboarding

## Overview

This folder contains the post-signup onboarding wizard shown to new users before they reach the main app. It's a single multi-step form component that collects profile info, an optional profile picture, walks through a features overview, and marks the user's account as onboarded.

### Onboarding.jsx (576 lines)

**Purpose:** Five-step onboarding flow (`welcome` → `profile` → `picture` → `features` → `complete`) run after registration/email verification, ending with a redirect to `/home`.

**Key Features:**
- Step progression driven by a `ONBOARDING_STEPS` array and a `currentStep` index, with a progress-dot indicator at the top of the card
- Decodes the JWT in `localStorage` to pre-fill user context (`useEffect` on mount); redirects to `/login` if no token is present or decoding fails
- Profile step: collects `full_name`, `bio` (500-char limit with live counter), `program` (via the shared `Program` component from `../pages/profile/Program`), and `location`
- Picture step: client-side file validation (JPEG/PNG/GIF/WebP, 5MB max), live preview via `FileReader`, upload happens only when advancing past this step (not on file selection)
- Features step: static informational cards (Connect with Students, Direct Messages, Events & Discussions, Campus Waypoint, Share & Engage) — no data fetching
- "Skip for now" is available on the profile/picture steps and short-circuits straight to completion (still calls the onboarding-complete endpoint)
- `handleNext` performs step-specific side effects — saves the profile on leaving step 1, uploads the picture on leaving step 2 — before advancing

**State Management:**
- `currentStep` — index into `ONBOARDING_STEPS`
- `loading` / `uploadingPicture` — per-action loading flags, disable the Next button
- `error` — validation/API error message shown above the nav buttons
- `currentUser` — decoded JWT payload
- `profileForm` — `{ full_name, bio, program, location }`
- `profilePicture` / `profilePicturePreview` — selected `File` and its data-URL preview
- `fileInputRef` — ref to the hidden file input, triggered by the visible "Upload/Change Photo" buttons

**API Integration:**
```javascript
POST ${API_BASE_URL}/users/me/picture/upload
Headers: Authorization: Bearer <token>
Body: FormData { profile_picture: File }
// Called from uploadProfilePicture(), skipped if no picture was selected

PUT ${API_BASE_URL}/users/me
Headers: Authorization, Content-Type: application/json
Body: { full_name, bio, program, location }
// Called from saveProfile() when advancing past the profile step

PATCH ${API_BASE_URL}/users/me/onboarding
Headers: Authorization, Content-Type: application/json
Body: { onboarding_completed: true }
// Called from markOnboardingComplete(), on both "Start Exploring" (complete) and "Skip for now"
```
All requests build headers manually via a local `getAuthHeaders()` helper (except the multipart upload, which omits `Content-Type` so the browser sets the correct boundary).

## Related Documentation

- [src/components/pages/profile/](../pages/profile/) — `Program` component reused here for program selection, and the profile page this data ultimately feeds
- [src/services/config.js](../../services/) — `API_BASE_URL` used for all requests in this component
