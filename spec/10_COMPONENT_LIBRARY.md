# COMP — Component Library

## Purpose
Define the component inventory for Timeframe. Every component in the UI should be documented here with its props, variants, and usage guidelines.

---

## COMP.1 — Primitives (shadcn/ui)

These are the base building blocks. Never modify their API — only style them.

| Component | File | Notes |
|-----------|------|-------|
| Button | `components/ui/button.tsx` | Variants: default, secondary, ghost, link |
| Input | `components/ui/input.tsx` | Used in search form |
| Card | `components/ui/card.tsx` | Used in collections |
| Badge | `components/ui/badge.tsx` | Era labels, status indicators |
| Dialog | `components/ui/dialog.tsx` | Modal overlays |
| Tooltip | `components/ui/tooltip.tsx` | Scrubber timestamps |
| Skeleton | `components/ui/skeleton.tsx` | Loading states |
| Separator | `components/ui/separator.tsx` | Visual dividers |

---

## COMP.2 — Feature Components

### 2.1 — SearchForm
**File:** `src/app/page.tsx` (inline)
**Props:** None (manages own state)
**Behavior:**
- Input accepts URL or domain
- `normalizeUrl()` on submit
- Loading spinner during CDX fetch
- Error message on failure

### 2.2 — Timeline
**File:** `src/app/timeline/[site]/page.tsx`
**Props:** `site: string`
**Behavior:**
- Year density chart (bar per year)
- Scrubber with sampled dots (max 100)
- Gap indicators (red markers for >90 day gaps)
- Keyboard navigation (arrow keys)
- Click dot → navigate to viewer

### 2.3 — Scrubber
**File:** Part of Timeline
**Props:** `captures: Capture[], onSelect: (ts: string) => void`
**Behavior:**
- Horizontal bar with dots
- Hover shows timestamp tooltip
- Click selects snapshot
- Amber accent on active dot

### 2.4 — EraLabel
**File:** `src/utils/index.ts` (getEra)
**Props:** `year: number`
**Returns:** `{ label, color, bg }` object
**Behavior:**
- Maps year to era (e.g., "Web 1.0")
- Returns color tokens for styling

### 2.5 — ArchiveViewer
**File:** `src/app/viewer/[site]/page.tsx`
**Props:** `site: string, timestamp: string`
**Behavior:**
- Loads Wayback iframe
- Fullscreen toggle
- Prev/next navigation
- Era label display

### 2.6 — CompareView
**File:** `src/app/compare/[site]/page.tsx`
**Props:** `site: string`
**Behavior:**
- Two side-by-side iframes
- Responsive stacking on mobile
- Synced navigation (future)

### 2.7 — CollectionCard
**File:** `src/app/collections/page.tsx` (inline)
**Props:** `collection: Collection`
**Behavior:**
- Title, description, website count
- Click → navigate to detail

---

## COMP.3 — Shared Components

### 3.1 — SkipNav
**File:** `src/components/accessibility.tsx`
**Props:** None
**Behavior:**
- Hidden until focused
- Links to main content

### 3.2 — Loading
**File:** `src/components/loading.tsx`
**Props:** `message?: string`
**Behavior:**
- Spinner animation
- Optional message below

### 3.3 — Header
**File:** `src/app/layout.tsx` (inline)
**Props:** None
**Behavior:**
- Logo/wordmark
- Navigation links
- Responsive (hamburger on mobile)

---

## COMP.4 — Icon Usage

| Context | Icon | Source |
|---------|------|--------|
| Search | `Search` | Lucide |
| Timeline | `Clock`, `Calendar` | Lucide |
| Viewer | `Maximize`, `Minimize`, `ChevronLeft`, `ChevronRight` | Lucide |
| Compare | `Columns` | Lucide |
| Collections | `Bookmark` | Lucide |
| Loading | `Loader2` (spinning) | Lucide |

---

## COMP.5 — Forbidden

- No custom icon library (use Lucide only)
- No icon-only buttons without `aria-label`
- No components without TypeScript props interface
- No components that bypass the `cn()` utility for class merging

---

## COMP.6 — Verification

- [ ] Every component has defined props
- [ ] All interactive components have keyboard support
- [ ] Icons always paired with text or aria-label
- [ ] No component violates DSYS tokens