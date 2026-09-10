# Header Component

## Overview

This folder contains the mobile-only header/navigation chrome for the app: a top bar with the Yapp logo plus a contextual action button, and an Instagram-style bottom tab bar. It's the mobile counterpart to `src/components/sidebar/Sidebar.jsx`, which handles desktop navigation instead.

### Header.jsx (110 lines)

**Purpose:** Renders the mobile top bar and bottom navigation bar. Hidden on desktop (`md:hidden`) — `Sidebar.jsx` takes over navigation at the `md` breakpoint.

**Key Features:**
- Top bar: Yapp logo (theme-aware via `dark:hidden`/`hidden dark:block` on two separate `<img>` elements rather than a `useTheme()` hook) linking to `/home`, plus a contextual icon on the right — hidden entirely on `/messages`, a `Settings` link when on `/profile`, otherwise a `Send` (messages) link
- Bottom bar: five nav items (Home, Users, Create, Waypoint, Profile) rendered from a `bottomNavItems` array; the "Create" item is visually distinct (a filled circular primary-color button rather than an icon+label)
- Active route highlighting via `isActive(path)`, comparing `location.pathname` from `useLocation()`
- Respects safe-area insets on the bottom bar (`env(safe-area-inset-bottom)`) for notched devices

**Props:** None — reads route state internally via `useLocation()`.

**State Management:** None (no `useState`); purely derives active/inactive styling from the current route.

## Related Documentation

- [src/components/sidebar/README.md](../sidebar/README.md) — the desktop-equivalent navigation component
- [src/assets/](../../assets/) — source of the logo images (`Yapp White logo.png`, `light_mode_logo2.png`)
