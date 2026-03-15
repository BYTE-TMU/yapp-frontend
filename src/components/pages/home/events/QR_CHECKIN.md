# QR Check-In System — Frontend

Three components power the QR check-in flow: the attendee's ticket display, the host's camera scanner, and the host's attendee management panel.

## Component Map

```
EventModal.jsx
├── TicketQRModal.jsx          – Attendee sees this (QR code on screen)
├── ScannerModal.jsx           – Host sees this (camera viewfinder)
└── AttendeeManagementPanel.jsx – Host sees this (attendee list + manual check-in)
```

All three live in `src/components/pages/home/events/`.

## User Flows

### Attendee: Show My Ticket

1. Attendee (or host) taps **"My Ticket"** button in `EventModal`.
2. `TicketQRModal` opens → calls `GET /events/<id>/my-ticket`.
3. Backend returns a JWT token (20-min expiry).
4. Token is rendered as a QR code via `qrcode.react` (`QRCodeSVG`).
5. A countdown timer shows time remaining. Auto-refreshes at < 60 s.
6. Attendee holds phone up for the host to scan.

### Host: Scan QR Code

1. Host taps **"Check-Ins"** button in `EventModal`.
2. `ScannerModal` opens → activates rear camera via `html5-qrcode`.
3. Camera decodes QR → extracted text (the JWT) is sent to `POST /events/<id>/checkin`.
4. Overlay appears with result:
   - **Green ✓** — New check-in, shows username + profile picture.
   - **Amber ⚠** — "Ticket already scanned", shows username.
   - **Red ✕** — Error (expired, wrong event, etc).
5. Host can tap the list icon to switch to `AttendeeManagementPanel`.

### Host: Manual Check-In

1. Host opens `AttendeeManagementPanel` (via list icon in scanner, or directly).
2. Panel shows tabs: Approved / Pending / Waitlisted.
3. On the Approved tab, each unchecked attendee has a **"Check In"** button.
4. Tapping it sends `POST /events/<id>/checkin { "user_id": "..." }`.

## Components

### TicketQRModal.jsx

| Prop | Type | Description |
|---|---|---|
| `isOpen` | boolean | Controls visibility |
| `onClose` | function | Close handler |
| `eventId` | string | Event ID for API call |
| `eventTitle` | string | Displayed above QR code |

**Key details:**
- QR size: 280×280 px, error correction level `"H"` (30% damage tolerance — best for screen-to-camera scanning).
- White padding (`p-5`) provides a wide quiet zone for angle tolerance.
- Includes brightness hint text for the user.

### ScannerModal.jsx

| Prop | Type | Description |
|---|---|---|
| `isOpen` | boolean | Controls visibility |
| `onClose` | function | Close handler |
| `eventId` | string | Event ID for check-in API |
| `onSwitchToList` | function | Switch to AttendeeManagementPanel |

**Camera configuration:**
- `facingMode: 'environment'` (relaxed — no `exact`, falls back gracefully).
- Resolution: 1280×720 ideal.
- FPS: 24 (faster motion capture).
- Format restricted to `QR_CODE` only (skips barcode processing overhead).

**Scan modes (toggle button in header):**
- **Guided** (default) — Centered qrbox (260–380 px, responsive). Corner bracket reticle with scan line.
- **Free-scan** — No qrbox, entire camera frame is decoded. Dashed border reticle, "Full Frame" label. Better for off-angle or distant QR codes.

**Result overlay states:**

| Type | Icon | Color | Message |
|---|---|---|---|
| `success` | ✓ | Green | "Checked in!" |
| `warning` | ⚠ | Amber | "Ticket already scanned" |
| `error` | ✕ | Red | Error text from API |

**Camera fallback chain:** Rear camera → Front camera → Error with "switch to list" prompt.

### AttendeeManagementPanel.jsx

| Prop | Type | Description |
|---|---|---|
| `isOpen` | boolean | Controls visibility |
| `onClose` | function | Close handler |
| `eventId` | string | Event ID |
| `onSwitchToScanner` | function \| null | Switch back to camera (null hides button) |

**Features:**
- Three tabs: Approved, Pending, Waitlisted (with counts from `/checkin-stats`).
- Each attendee row shows profile picture, name, checked-in status.
- Approved tab: "Check In" button per unchecked attendee.
- Pending tab: "Approve" and "Waitlist" buttons.
- Waitlisted tab: "Approve" button.
- Pull-to-refresh via refresh button.

## EventModal.jsx Integration

The QR feature adds three things to `EventModal`:

1. **"My Ticket" button** — Visible when `isAttending || isHost`. Opens `TicketQRModal`.
2. **"Check-Ins" button** — Visible when the current user is the event host. Opens `ScannerModal` (with camera check first).
3. **`isHost` computed early** — Moved before `mainContent` so it's accessible in the JSX.

```jsx
// Button visibility logic (simplified)
{(isAttending || isHost) && <button>My Ticket</button>}
{isHost && <button>Check-Ins</button>}
```

## Toast Notifications

Added to `src/utils/toastNotifications.js`:

| Function | Style | Message |
|---|---|---|
| `showCheckInSuccess(username)` | `success` | `"${username} checked in! ✅"` |
| `showAlreadyCheckedIn(username)` | `warning` | `"${username}'s ticket has already been scanned"` |
| `showCheckInError(message)` | `error` | `"Check-in failed"` with description |
| `showCameraDenied()` | `warning` | `"Camera access denied"` |
| `showTicketError()` | `error` | `"Failed to generate ticket"` |
| `showAttendeeStatusError()` | `error` | `"Failed to update attendee status"` |

## Dependencies

| Package | Version | Purpose |
|---|---|---|
| `html5-qrcode` | ^2.3.8 | Camera-based QR scanning (uses native BarcodeDetector when available) |
| `qrcode.react` | ^4.2.0 | SVG QR code rendering |

Both were added to `package.json` by this feature.

## Scan Optimization Notes

These choices were made specifically for **phone-to-phone scanning** (QR on one screen, camera on another):

- **Relaxed `facingMode`** — `exact: 'environment'` breaks on single-camera devices. Relaxed mode falls back.
- **1280×720 resolution** — More pixels = better decode at distance and angle.
- **24 FPS** — Faster sampling catches codes during hand shake / screen blink.
- **QR_CODE only** — Skipping barcode formats reduces decode time per frame.
- **Free-scan mode** — Full-frame decode works when QR is off-center or at steep angles.
- **Error correction "H"** — 30% of QR can be damaged/obscured and still decode.
- **280 px QR + wide quiet zone** — Larger code + white border = easier to lock onto.
- **Brightness hint** — Reminds user to turn up screen brightness (reflective screens wash out QR).
