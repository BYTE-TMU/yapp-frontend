# UI Primitives

## Overview

This folder contains low-level, unstyled-by-default UI primitives in the shadcn/Radix style — `Avatar`, `Badge`, `Button`, `Card`, and `Carousel`. Each file exports a set of small composable components (e.g. `Card` + `CardHeader` + `CardContent` + `CardFooter`) built on Radix UI primitives (via the `radix-ui` package) and styled with Tailwind classes generated through `class-variance-authority` (`cva`). These are the base building blocks that feature components (like those in `badges/`) compose into higher-level UI.

### avatar.jsx (105 lines)

**Purpose:** Avatar primitive with image/fallback handling, an optional status badge, and grouped-avatar variants.

**Key Features:**
- Built on `Avatar as AvatarPrimitive` from the `radix-ui` package
- Exports: `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarBadge` (e.g. online-status dot), `AvatarGroup`, `AvatarGroupCount` (overflow count for a stacked group)
- Size handled via a `data-size` attribute (`sm`/`default`/`lg`) rather than `cva` variants directly, with sibling components reading it through `group-data-[size=...]` Tailwind selectors

**Props:** Each component accepts standard Radix props plus `className` (merged via `cn` from `@/utils/cnUtils`); `Avatar` additionally accepts `size`.

---

### badge.jsx (46 lines)

**Purpose:** The base `Badge` component wrapped by nearly every badge in `src/components/badges/`.

**Key Features:**
- `cva`-driven variants: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`
- `asChild` prop (via Radix `Slot`) allows rendering as a different element (e.g. an `<a>`) while keeping badge styling

**Props:** `className`, `variant`, `asChild`, plus any native span/element props.

---

### button.jsx (60 lines)

**Purpose:** The base `Button` component.

**Key Features:**
- `cva`-driven `variant` (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`) and `size` (`default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`) axes
- `asChild` prop (via Radix `Slot`) for polymorphic rendering
- Auto-sizes any child SVG icon via `[&_svg:not([class*='size-'])]:size-4`

**Props:** `className`, `variant`, `size`, `asChild`, plus any native button props.

---

### card.jsx (101 lines)

**Purpose:** Composable card layout primitives.

**Key Features:**
- Exports: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction` (top-right slot, e.g. a menu button), `CardContent`, `CardFooter`
- `CardHeader` uses a container query (`@container/card-header`) grid layout that shifts to a two-column layout when a `CardAction` is present

**Props:** Each accepts `className` plus native `div` props.

---

### carousel.jsx (194 lines)

**Purpose:** Carousel primitives wrapping `embla-carousel-react`.

**Key Features:**
- Exports: `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`
- Shares carousel state (API, scroll direction, prev/next availability) via a `CarouselContext` consumed through the `useCarousel()` hook — throws if used outside a `<Carousel>`
- Keyboard navigation: `ArrowLeft`/`ArrowRight` call `scrollPrev`/`scrollNext`
- Supports horizontal or vertical orientation, and an optional `setApi` prop to expose the Embla API instance to the parent
- `CarouselPrevious`/`CarouselNext` are built on the `Button` primitive (`variant="outline" size="icon"`)

**Props:**
- `Carousel` — `orientation` (`'horizontal' | 'vertical'`), `opts` (Embla options), `setApi`, `plugins`, `className`, `children`
- Other exports accept `className` plus native `div`/`button` props

## Usage Patterns

- All variant styling goes through `cva`; when adding a new variant, extend the existing `cva` config rather than adding conditional className logic inline.
- Every component merges incoming `className` via `cn` from `@/utils/cnUtils` — always pass `className` through `cn(...)` rather than concatenating strings directly.
- Higher-level feature components (`src/components/badges/`, page components) should compose these primitives rather than re-implementing badge/button/card styling from scratch.

## Related Documentation

- [src/components/badges/README.md](../badges/README.md) — feature components built on `Badge`/`Avatar`
- [src/utils/](../../utils/) — `cnUtils.js` (the `cn` helper used throughout this folder)
