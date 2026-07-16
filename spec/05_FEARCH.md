# FEARCH — Frontend Architecture

## Purpose
Define the technical architecture for Timeframe's frontend. This is the single source of truth for how code is organized, how data flows, and how the application is structured.

Aligned with `05 — Architecture` (ARCH). In case of conflict, ARCH prevails.

---

## FEARCH.1 — Stack

| Layer | Technology | Version | Source |
|-------|-----------|---------|--------|
| Framework | Next.js | 15.x | ARCH.2.1 |
| Language | TypeScript | 5.x (strict) | ARCH.2.2 |
| Styling | Tailwind CSS | 4.x | ARCH.2.3 |
| Components | shadcn/ui | latest | COMP |
| Animation | Framer Motion | 11.x | MOT |
| Icons | Lucide React | latest | COMP |
| Fonts | Geist + Geist Mono | via next/font | DSYS |
| API Layer | tRPC | latest | ARCH.3.1 |
| Server State | TanStack Query | latest | ARCH.2.4 |
| Global UI State | Zustand | latest | ARCH.2.4 |
| Cache | In-memory + localStorage (MVP) | — | ARCH.6 |
| Cache (Post-MVP) | Redis (Upstash) | — | ARCH.6 |

---

## FEARCH.2 — Project Structure

```
/src
  /app
    /explore
      /[domain]
        /[timestamp]
          page.tsx              ← Timeline + Viewer view
    /compare
      /[domain]
        /[timestamp-a]
          /[timestamp-b]
            page.tsx            ← Compare view
    /collections
      page.tsx                  ← Collections index
      /[id]
        page.tsx                ← Collection detail
    page.tsx                    ← Landing page
    layout.tsx                  ← Root layout
    error.tsx                   ← Error boundary
    not-found.tsx               ← 404
    sitemap.ts                  ← Dynamic sitemap
    robots.ts                   ← Robots.txt

  /components
    /timeline                   ← Timeline Engine components
    /viewer                     ← Viewer Engine components
    /context                    ← Context Engine components
    /search                     ← Search components
    /ui                         ← Design system primitives (Button, Input, etc.)
    /layout                     ← Layout components (Chrome, zones)
    accessibility.tsx           ← SkipNav

  /lib
    /api                        ← tRPC client setup
    /archive                    ← Archive Service (client-side helpers)
    /context                    ← Context Service helpers
    /cache                      ← Cache Service (in-memory, localStorage)
    /db                         ← Database client and queries (server only)
    /utils                      ← Shared utilities (cn, formatDate, etc.)
    /hooks                      ← Shared React hooks
    /types                      ← Shared TypeScript types

  /server
    /routers                    ← tRPC routers
      archive.ts                ← Snapshot queries, CDX index, timeline data
      context.ts                ← Contextual metadata, era data, change records
      search.ts                 ← Domain normalization, coverage check
    /services                   ← Server-side service layer
      archive-service.ts        ← Wayback CDX API queries
      context-service.ts        ← Context data assembly
      cache-service.ts          ← Redis cache operations

  /features
    /search
      use-search.ts
    /timeline
      use-timeline.ts
    /viewer
      use-viewer.ts
    /compare
      use-compare.ts
    /collections
      data.ts

  /stores
    app-store.ts                ← Zustand global UI state

  /styles
    globals.css                 ← Global styles, CSS custom properties
```

---

## FEARCH.3 — Data Flow

### 3.1 — Search Flow
```
User Input → normalizeUrl() → tRPC search.check → Cache (Redis) → Wayback CDX → Results
```

### 3.2 — Timeline Flow
```
Domain → tRPC archive.timeline → Cache (Redis) → Wayback CDX → Year grouping → Render
```

### 3.3 — Viewer Flow
```
Timestamp → tRPC archive.snapshot → Cache (Redis) → Wayback Availability → iframe src
```

### 3.4 — Compare Flow
```
Two Timestamps → Two tRPC archive.snapshot calls → Two iframes
```

---

## FEARCH.4 — State Management

### 4.1 — URL State (Primary)
The current site and snapshot date are encoded in the URL. A URL is a complete description of the current view state.

```
/explore/[domain]/[timestamp]
/compare/[domain]/[timestamp-a]/[timestamp-b]
```

### 4.2 — Server State (TanStack Query)
Data fetched from the API is managed by TanStack Query. It handles caching, background refetching, loading and error states, and deduplication. Server state is never stored in component state.

### 4.3 — UI State (React)
Ephemeral interface state (panel open/closed, tooltip visible, scrubber position during drag) is managed with `useState` and `useReducer`.

### 4.4 — Global UI State (Zustand)
The small set of state that needs to be globally accessible — active site, active snapshot, compare mode status — is managed with Zustand. One store, minimal surface area.

```typescript
// stores/app-store.ts
interface AppState {
  activeSite: string | null;
  activeSnapshot: string | null;
  compareMode: boolean;
  setActiveSite: (site: string) => void;
  setActiveSnapshot: (timestamp: string) => void;
  toggleCompareMode: () => void;
}
```

### 4.5 — Cache Layer
- **MVP:** In-memory cache + localStorage (30-minute TTL)
- **Post-MVP:** Redis (Upstash) with TTLs per ARCH.6

---

## FEARCH.5 — Routing

| Route | Purpose | Rendering |
|-------|---------|-----------|
| `/` | Landing page + search entry | Static (ISR) |
| `/explore/[domain]/[timestamp]` | Timeline + Viewer | SSR |
| `/compare/[domain]/[timestamp-a]/[timestamp-b]` | Side-by-side comparison | SSR |
| `/collections` | Curated exhibits index | Static |
| `/collections/[id]` | Collection detail | SSR |

---

## FEARCH.6 — Error Handling

All service functions return a result type per ARCH.3.3:

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: AppError }

type AppError =
  | { code: 'ARCHIVE_UNAVAILABLE'; message: string }
  | { code: 'SITE_NOT_FOUND'; message: string }
  | { code: 'RATE_LIMITED'; retryAfter: number }
  | { code: 'CACHE_MISS'; message: string }
  | { code: 'INVALID_DOMAIN'; message: string }
  | { code: 'NO_COVERAGE'; domain: string }
```

Client maps each error code to a specific UI state per COMP.

---

## FEARCH.7 — Performance

### 7.1 — Critical Path Target
First snapshot visible within 3 seconds on warm cache (ARCH.10.1).

### 7.2 — Optimization Strategies
- Prefetch adjacent snapshots on timeline load
- CDX pagination in background chunks
- Iframe preloading on scrubber pause
- Edge caching for CDX data

### 7.3 — Code Splitting
- Each route is a separate chunk (Next.js App Router)
- Framer Motion loaded only where needed

---

## FEARCH.8 — Forbidden

- No Redux
- No GraphQL
- No inline styles (use Tailwind classes)
- No `useEffect` without dependency array
- No `any` types
- No server components for interactive features

---

## FEARCH.9 — Verification

- [ ] All routes load without errors
- [ ] tRPC procedures type-safe end-to-end
- [ ] TanStack Query manages all server state
- [ ] Zustand store remains minimal
- [ ] Cache reduces API calls on repeat visits
- [ ] No TypeScript errors
- [ ] Error result types handled explicitly in UI