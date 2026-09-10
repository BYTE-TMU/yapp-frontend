# Cyber Summit — TMU-Exclusive Promo

## Overview

This folder implements a limited-time promotion for verified TMU students: a discount off Cyber Summit tickets, surfaced through a dedicated gated route plus two promo surfaces on the Home feed. `constants.js` centralizes the offer's configuration (cutoff date, registration link, discount math). `CyberSummitExclusive.jsx` is the standalone page at `/cyber-summit/tmu-exclusive`. `CyberSummitBanner.jsx` and `CyberSummitPromoModal.jsx` are two independent surfaces mounted on `Home.jsx` — a persistent banner and a one-time popup — both driven by eligibility state that `Home.jsx` computes itself (not from this folder). `ByteIcon.jsx` and `ByteAttribution.jsx` render the presenting org's (BYTE) logo, reused across all three promo surfaces.

**Eligibility check** (duplicated in both `CyberSummitExclusive.jsx` and `Home.jsx` rather than shared): fetch `GET ${API_BASE_URL}/users/me` with the stored JWT, and treat the user as eligible only if `data.profile?.is_verified === true` **and** `isCyberSummitWindowOpen()` (i.e. `new Date() < CYBER_SUMMIT_CUTOFF`). There is no dedicated TMU-verification flag here — this reuses the existing `is_verified` field on the user profile.

### constants.js (14 lines)

**Purpose:** Single source of truth for the offer's terms, imported by every other file in this folder.

**Exports:**
- `CYBER_SUMMIT_CUTOFF` — `new Date('2026-10-01T23:59:00-04:00')`. Hardcoded to the EDT (UTC-4) offset, with a comment noting Oct 1, 2026 falls before DST ends (Nov 1, 2026), so `-04:00` is deliberately correct — not a bug to "fix" to `-05:00`.
- `REGISTRATION_URL` — currently a placeholder (`https://example.com/tmu-science-society-cyber-summit`), marked `// TODO: replace with the finalized TMU Science Society registration link`. All three UI surfaces link out to this URL in a new tab; there is no in-app checkout or Stripe integration in this folder.
- `ORIGINAL_PRICE` — `60`
- `DISCOUNT_PERCENT` — `50`
- `DISCOUNTED_PRICE` — derived: `Math.round(ORIGINAL_PRICE * (1 - DISCOUNT_PERCENT / 100))` → `30`
- `isCyberSummitWindowOpen()` — `() => new Date() < CYBER_SUMMIT_CUTOFF`, a simple client-side clock check with no server-side enforcement of the cutoff

**API Integration:** None — pure constants and a date comparison.

### CyberSummitExclusive.jsx (80 lines)

**Purpose:** The gated route component at `/cyber-summit/tmu-exclusive` (registered in `AuthRoutes.jsx` under `PrivateRoute`, so a logged-out visitor is redirected to `/login` before this component ever runs).

**Key Features:**
- On mount, fetches the current user's `is_verified` flag and combines it with `isCyberSummitWindowOpen()` to compute `eligible`
- While the check is in flight, renders nothing (`if (loading) return null`)
- If not eligible (unverified, or the window has closed), redirects to `/` via `<Navigate to="/" replace />` — there is no distinct "verify your account to unlock" message state, just a silent redirect
- If eligible, shows the offer (original vs. discounted price, `DISCOUNT_PERCENT`), a "Register Now" link to `REGISTRATION_URL`, and the `ByteIcon`/`ByteAttribution` branding

**State:** `loading`, `isVerified`

**API Integration:**
```javascript
GET ${API_BASE_URL}/users/me
Headers: { Authorization: `Bearer ${token}` }
// eligibility = data.profile?.is_verified === true && isCyberSummitWindowOpen()
```

### CyberSummitBanner.jsx (36 lines)

**Purpose:** Persistent promo banner rendered inline in the Home feed (`Home.jsx` line ~237) whenever the viewing user is eligible.

**Key Features:** Purely presentational — renders `null` if `eligible` is falsy, otherwise shows the offer copy, `ByteIcon`/`ByteAttribution`, and a "Register Now" link to `REGISTRATION_URL`. Does **not** perform its own eligibility fetch; `Home.jsx` computes `cyberSummitEligible` once (same `is_verified` + `isCyberSummitWindowOpen()` check as `CyberSummitExclusive.jsx`) and passes it down as a prop.

**Props:** `eligible`

**API Integration:** None directly.

### CyberSummitPromoModal.jsx (69 lines)

**Purpose:** One-time popup modal, also mounted in `Home.jsx`, shown to eligible users who haven't dismissed it yet.

**Key Features:** Rendered via `createPortal` into `document.body`; `Home.jsx` gates first-time display with a `localStorage` flag (`CYBER_SUMMIT_PROMO_SEEN_KEY`, set on close) so it only appears once per browser. Same offer copy and `ByteIcon`/`ByteAttribution`/`REGISTRATION_URL` link as the other two surfaces; closing via the link also dismisses the modal (`onClick={onClose}`).

**Props:** `isOpen`, `onClose`

**API Integration:** None directly.

### ByteIcon.jsx (17 lines)

**Purpose:** Small BYTE logomark, theme-aware (swaps `byte_icon_black.png`/`byte_icon_white.png` via Tailwind's `dark:` variant rather than JS). Used in the header of all three promo surfaces.

**Props:** `className` (default `'w-3.5 h-3.5'`)

### ByteAttribution.jsx (20 lines)

**Purpose:** "Presented by [BYTE logo]" credit line, theme-aware in the same way as `ByteIcon.jsx` (`byte_black.png`/`byte_white.png`). Used at the bottom of `CyberSummitExclusive.jsx` and inside `CyberSummitBanner.jsx`.

**Props:** `className` (default `''`)

## How the pieces fit together

```
constants.js  ──┬──> CyberSummitExclusive.jsx  (route: /cyber-summit/tmu-exclusive)
                ├──> CyberSummitBanner.jsx       (mounted in Home.jsx, eligibility passed as a prop)
                └──> CyberSummitPromoModal.jsx    (mounted in Home.jsx, shown once via localStorage flag)

ByteIcon.jsx / ByteAttribution.jsx ──> used by all three UI surfaces above
```

`Home.jsx` and `CyberSummitExclusive.jsx` each independently re-implement the same `GET /users/me` + `is_verified` + `isCyberSummitWindowOpen()` eligibility check rather than sharing one hook/utility — worth consolidating if a third surface is added.

## Related Documentation

- [src/components/pages/README.md](../README.md) — sibling top-level pages
- [src/components/pages/home/README.md](../home/README.md) — `Home.jsx`, which mounts `CyberSummitBanner` and `CyberSummitPromoModal` and computes their shared eligibility state
- [src/AuthRoutes.jsx](/src/AuthRoutes.jsx) — registers `/cyber-summit/tmu-exclusive` behind `PrivateRoute`
- [src/assets/README.md](/src/assets/README.md) — the `byte_*.png` logo assets used by `ByteIcon`/`ByteAttribution`
