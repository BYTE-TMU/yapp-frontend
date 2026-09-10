# Sidebar Component

## Overview

This folder contains the desktop-only navigation sidebar, the counterpart to `src/components/header/Header.jsx`'s mobile bottom nav. It renders a fixed left-hand rail with the Yapp logo, primary navigation links, and a "Create" call-to-action.

### Sidebar.jsx (149 lines)

**Purpose:** Renders the persistent desktop navigation sidebar.

**Key Features:**
- `hidden md:flex` — only rendered at the `md` breakpoint and above; on mobile, `Header.jsx`'s bottom nav takes over
- Fixed full-height rail (`fixed left-0 top-0 h-screen w-64`)
- Theme-aware Yapp logo using two `<img>` elements toggled with `dark:hidden` / `hidden dark:block` (same pattern as `Header.jsx`, not via `useTheme()`)
- Seven nav links: Home, Users, Messages, Waypoint, Profile, Settings, Feedback, plus a separate "Create" button pinned to the bottom
- Active route highlighting via `isActive(path)`, comparing `location.pathname` from `useLocation()`
- Responsive padding/spacing/icon sizes scale up across `sm`/`md` breakpoints

**Props:** None — reads route state internally via `useLocation()`.

**State Management:** None (no `useState`); purely derives active/inactive styling from the current route.

## Related Documentation

- [src/components/header/README.md](../header/README.md) — the mobile-equivalent navigation component
- [src/assets/](../../assets/) — source of the logo images (`Yapp White logo.png`, `light_mode_logo2.png`)
