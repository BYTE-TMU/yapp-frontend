# Settings — Account Settings & Password Change

## Overview

Two files implement the `/settings` page: account, appearance, and logout controls, plus a change-password flow. Notably, `Settings.jsx` does **not** import `ChangePassword.jsx` — it contains its own complete, separately-maintained copy of the same modal inline. See the note below.

### Settings.jsx (510 lines)

**Purpose:** Main settings page at `/settings`.

**Key Features:**
- **Account** section: opens the (inline) change-password modal
- **Appearance** section: dark-mode toggle wired to `ThemeContext`'s `setTheme`
- **Account Actions**: logout — disconnects `messageService`, clears `token`/`user` from `localStorage`, navigates to `/`
- Contains a full inline reimplementation of the change-password modal (fields, live validation checklist, show/hide toggles, success state) rather than rendering `ChangePassword.jsx`

**State:** `isLoggingOut`, `isChangePasswordOpen`, `passwordForm` (`currentPassword`, `newPassword`, `confirmPassword`), `showPasswords`, `passwordError`, `passwordLoading`, `passwordSuccess`

**API Integration:**
```javascript
POST ${API_BASE_URL}/auth/change-password
Body: { current_password, new_password, confirm_password, timestamp }
```

### ChangePassword.jsx (395 lines)

**Purpose:** Standalone portal-rendered password-change modal, built to take `isOpen`/`onClose` props.

**Key Features:** Current/new/confirm password fields with per-field show/hide toggles, a live requirements checklist (min 6 characters, differs from current password, confirmation matches), and a success state that auto-closes after 2 seconds.

**Props:** `isOpen`, `onClose`

**API Integration:**
```javascript
POST ${API_BASE_URL}/auth/change-password
Body: { current_password, new_password, confirm_password, timestamp }
```

> **Unused.** Nothing in the codebase imports this component — `Settings.jsx` duplicates its entire implementation inline instead (same fields, same validation, same endpoint). This file appears to be dead code left over from a refactor; it isn't reachable from any route.

## Related Documentation

- [src/components/pages/README.md](../README.md) — sibling top-level pages
- [src/contexts/README.md](/src/contexts/README.md) — `ThemeContext` used for the dark-mode toggle
- [src/services/messageService.js](/src/services/) — disconnected on logout
