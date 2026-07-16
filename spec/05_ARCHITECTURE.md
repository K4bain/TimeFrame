# 05 — Architecture

Version: 1.0
Status: Approved
Classification: Internal
Last Revised: 2026-07-15

---

## Preamble

This document defines the technical architecture of Timeframe.

It covers the frontend, backend, data layer, and the systems that connect them. It does not cover component-level implementation — that is `COMP`. It does not cover API contracts in detail — that is `07_API.md`. It covers the structure: what systems exist, how they relate, and why they are built the way they are.

Every architectural decision recorded here has a rationale. When a decision is reversed, an ADR is written. The architecture is not arbitrary — it is a set of considered constraints that the implementation must respect.

---

## Architecture Philosophy

### Complexity lives in the system, not the interface.

The user experience of Timeframe is simple. Enter a site, move through time, understand what changed. The simplicity of that experience is not accidental — it is the product of a system that absorbs complexity backstage.

Querying the Wayback Machine CDX API, normalizing URLs, computing change detection, assembling contextual metadata, caching aggressively — all of this happens out of sight. The interface presents a clean timeline. The architecture earns that cleanliness.

### The Wayback Machine is infrastructure, not a feature.

Timeframe does not own its archive. It builds on what the Internet Archive preserves. This is a deliberate architectural constraint, not a limitation. Maintaining a proprietary web archive would require resources that dwarf the product's actual value. The Wayback Machine is the infrastructure layer. Timeframe is the experience layer.

This means the architecture must be resilient to the Wayback Machine's behavior — its rate limits, its occasional unavailability, its inconsistent coverage. Every system that touches the external archive is designed to degrade gracefully.

### Cache everything cacheable.

Archive data is historical. A snapshot from 1998 will not change. The CDX index for a site grows over time but its existing entries are immutable. The architecture exploits this aggressively — requests to the archive are cached at every layer, and cache invalidation is almost never needed.

Cold requests hit the Wayback Machine. Warm requests hit the cache. A well-used Timeframe installation should reach the Wayback Machine only for genuinely new queries.

### The frontend is sovereign over its own state.

The backend provides data. The frontend owns the experience. Timeline state, navigation state, viewer state, compare mode state — all of this lives in the frontend. The backend has no opinion about what the user is doing. It answers queries.

This separation allows the frontend to evolve independently. A redesigned timeline that queries data differently does not require backend changes if the API contract is unchanged.

---

## 5.1 — System Overview

```
ID            ARCH.1
Status        Approved
Version       1.0
Last Updated  2026-07-15
```

### 5.1.1 — System Map

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│                                                         │
│   Next.js Application                                   │
│   ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│   │  Timeline   │  │   Viewer     │  │   Context    │  │
│   │  Engine     │  │   Engine     │  │   Engine     │  │
│   └──────┬──────┘  └──────┬───────┘  └──────┬───────┘  │
│          └────────────────┴──────────────────┘          │
│                           │                             │
│                    API Layer (tRPC)                      │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                        SERVER                           │
│                                                         │
│   Next.js API Routes                                    │
│   ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│   │  Archive    │  │   Context    │  │    Cache     │  │
│   │  Service   │  │   Service    │  │   Service    │  │
│   └──────┬──────┘  └──────┬───────┘  └──────┬───────┘  │
│          └────────────────┴──────────────────┘          │
│                           │                             │
└───────────────────────────┬─────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────┴───────┐  ┌────────┴──────┐  ┌────────┴──────┐
│  Wayback      │  │  PostgreSQL   │  │    Redis      │
│  Machine API  │  │  (Supabase)   │  │  (Upstash)    │
└───────────────┘  └───────────────┘  └───────────────┘
```

### 5.1.2 — System Responsibilities

| System             | Responsibility                                                         |
|--------------------|------------------------------------------------------------------------|
| Next.js Client     | Renders the UI. Owns all user interaction and navigation state.        |
| Timeline Engine    | Manages timeline data, scrubber position, snapshot sequencing.         |
| Viewer Engine      | Manages snapshot rendering, iframe lifecycle, loading states.          |
| Context Engine     | Assembles and displays contextual metadata for each snapshot.          |
| API Layer (tRPC)   | Type-safe communication between client and server.                     |
| Archive Service    | Queries the Wayback Machine CDX API. Normalizes and caches results.    |
| Context Service    | Assembles contextual data from internal database and computed signals. |
| Cache Service      | Manages Redis cache. Enforces TTLs. Handles cache misses.              |
| PostgreSQL         | Persistent storage for site metadata, context data, change records.    |
| Redis              | Short and long-lived cache for CDX results, snapshots, context.        |
| Wayback Machine    | External archive. Source of snapshot URLs and CDX index data.          |

---

## 5.2 — Frontend Architecture

```
ID            ARCH.2
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  DSYS, MOT, COMP
```

### 5.2.1 — Framework

**Next.js 15 (App Router)**

Why Next.js: The product requires server-side rendering for initial page load performance, static generation for the landing page, and API routes for the backend layer. Next.js provides all three in one framework. The App Router model aligns well with the product's view structure — each view is a route, each route owns its data fetching.

The Pages Router is not used. All routing uses App Router conventions.

### 5.2.2 — Language

**TypeScript — strict mode**

All source files are TypeScript. Strict mode is enabled. `any` is not used. Type assertions (`as`) are used only with documented justification.

Type safety is not optional. The cost of a runtime type error in the timeline engine — a misparsed date, an incorrectly shaped CDX response — is a broken user experience. Types catch these at compile time.

### 5.2.3 — Styling

**Tailwind CSS v4**

Utility-first CSS. Design system tokens from `DSYS` are registered as Tailwind CSS custom properties and referenced in utility classes. Component styles use Tailwind utilities exclusively — no inline styles, no CSS Modules, no styled-components.

The Tailwind configuration is the authoritative mapping between `DSYS` tokens and CSS classes. If a token exists in `DSYS`, it is configured in Tailwind. If a value is needed that does not exist in `DSYS`, `DSYS` is updated first.

### 5.2.4 — State Management

State is managed at three levels:

**URL State**
The current site and snapshot date are encoded in the URL. A URL is a complete description of the current view state. Deep links work because URL state is the primary state.

```
/explore/[domain]/[timestamp]
/explore/google.com/19980915120000
/compare/[domain]/[timestamp-a]/[timestamp-b]
/compare/google.com/19980915120000/20040310093000
```

**Server State**
Data fetched from the API is managed by **TanStack Query** (React Query). It handles caching, background refetching, loading and error states, and deduplication of requests. Server state is never stored in component state or global stores.

**UI State**
Ephemeral interface state (panel open/closed, tooltip visible, scrubber position during drag) is managed with React's built-in `useState` and `useReducer`. It is not elevated to a global store unless multiple distant components need to share it.

**Global UI State**
The small set of state that needs to be globally accessible — active site, active snapshot, compare mode status — is managed with **Zustand**. One store, minimal surface area. The store is the last resort, not the first.

### 5.2.5 — Directory Structure

```
/src
  /app
    /explore
      /[domain]
        /[timestamp]
          page.tsx         ← Timeline + Viewer view
    /compare
      /[domain]
        /[timestamp-a]
          /[timestamp-b]
            page.tsx       ← Compare view
    page.tsx               ← Landing page
    layout.tsx             ← Root layout
    error.tsx              ← Error boundary
    not-found.tsx          ← 404

  /components
    /timeline              ← Timeline Engine components
    /viewer                ← Viewer Engine components
    /context               ← Context Engine components
    /search                ← Search components
    /ui                    ← Design system primitives (Button, Input, etc.)
    /layout                ← Layout components (Chrome, zones)

  /lib
    /api                   ← tRPC router definitions
    /archive               ← Archive Service
    /context               ← Context Service
    /cache                 ← Cache Service
    /db                    ← Database client and queries
    /utils                 ← Shared utilities
    /hooks                 ← Shared React hooks
    /types                 ← Shared TypeScript types

  /server
    /routers               ← tRPC routers
    /services              ← Server-side service layer

  /styles
    globals.css            ← Global styles, CSS custom properties
```

### 5.2.6 — Rendering Strategy by Route

| Route               | Strategy               | Reason                                                   |
|---------------------|------------------------|----------------------------------------------------------|
| `/`                 | Static (ISR, 1hr)      | Landing page content changes rarely.                     |
| `/explore/[domain]` | SSR                    | Initial snapshot data must be server-rendered for performance. |
| `/compare/[domain]` | SSR                    | Same as above.                                           |
| `/api/*`            | Server (API routes)    | All data fetching goes through API layer.                |

---

## 5.3 — Backend Architecture

```
ID            ARCH.3
Status        Approved
Version       1.0
Last Updated  2026-07-15
```

### 5.3.1 — API Layer

**tRPC**

The client and server communicate through tRPC. All API procedures are fully typed end-to-end — the client cannot construct an invalid request, and the server cannot return an unexpected shape.

REST is not used for internal client-server communication. REST is used only for the external Wayback Machine API, which Timeframe does not control.

tRPC procedures are organized into routers by domain:

```
/server/routers
  archive.ts      ← Snapshot queries, CDX index, timeline data
  context.ts      ← Contextual metadata, era data, change records
  search.ts       ← Domain normalization, coverage check
```

### 5.3.2 — Service Layer

Business logic lives in services, not in routers. Routers are thin — they validate input, call a service, and return the result. Services contain the logic.

```
Archive Service   → Queries Wayback CDX API. Normalizes response. Populates cache.
Context Service   → Queries internal database for context data. Computes change signals.
Cache Service     → Reads from Redis. Writes to Redis. Manages TTLs.
Search Service    → Normalizes URL input. Checks archive coverage. Returns site record.
```

Services do not call each other in circular patterns. Dependencies are one-directional:

```
Router
  └── Archive Service
        └── Cache Service
              └── Redis

Router
  └── Context Service
        └── Database (PostgreSQL)
        └── Cache Service
```

### 5.3.3 — Error Handling

All service functions return a result type, not a thrown error:

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

Errors are typed. The client handles each error code explicitly. There is no generic "something went wrong" behavior — each error condition maps to a specific UI state in `COMP`.

---

## 5.4 — Archive Service

```
ID            ARCH.4
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  DATA
```

The Archive Service is the most critical service in the system. It is the bridge between Timeframe and the Wayback Machine.

### 5.4.1 — Wayback Machine CDX API

The Wayback Machine exposes a CDX (Capture Index) API that returns metadata about archived snapshots.

Base URL:
```
http://web.archive.org/cdx/search/cdx
```

Timeframe uses the CDX API for two query types:

**Coverage Query** — Does this site have archive coverage?
```
params:
  url:       [domain]
  output:    json
  limit:     1
  fl:        timestamp,statuscode
```

**Timeline Query** — What snapshots exist for this site?
```
params:
  url:       [domain]/*
  output:    json
  fl:        timestamp,original,statuscode,length
  collapse:  timestamp:8         ← One result per day maximum
  from:      [start_year]
  to:        [end_year]
  filter:    statuscode:200      ← Successful captures only
  limit:     1000                ← Maximum per request
```

Results are paginated if the site has more than 1000 qualifying snapshots. The service handles pagination transparently.

### 5.4.2 — URL Normalization

All domain input is normalized before querying the archive:

```
Input                         Normalized
─────────────────────────────────────────
https://www.google.com        google.com
http://google.com/search      google.com
www.google.com                google.com
GOOGLE.COM                    google.com
google.com/                   google.com
```

Normalization rules:
1. Strip protocol (`https://`, `http://`)
2. Strip `www.` prefix
3. Strip path, query string, fragment
4. Lowercase
5. Strip trailing slash

The normalized domain is the canonical identifier for a site throughout the system.

### 5.4.3 — Snapshot URL Construction

Wayback Machine snapshot URLs follow this pattern:

```
https://web.archive.org/web/[timestamp]/[original_url]
```

Example:
```
https://web.archive.org/web/19980901120000/http://www.google.com/
```

The viewer renders this URL in an iframe. The Archive Service constructs the URL from CDX data — it does not construct it from assumptions.

### 5.4.4 — Rate Limiting

The Wayback Machine rate limits CDX API requests. Timeframe respects these limits.

Rate limit handling:
- All CDX requests go through a request queue with configurable concurrency (default: 2 concurrent requests).
- On a 429 response, the service backs off exponentially starting at 1 second.
- Maximum backoff: 30 seconds.
- After 3 failed retries, the service returns `{ code: 'ARCHIVE_UNAVAILABLE' }`.

The cache layer (`ARCH.6`) is the primary defense against rate limiting. A well-cached Timeframe instance rarely hits the rate limit because most requests are served from cache.

### 5.4.5 — Availability Handling

The Wayback Machine is occasionally unavailable. The Archive Service handles this gracefully:

- Requests time out after 8 seconds.
- On timeout or 5xx response, the service returns `{ code: 'ARCHIVE_UNAVAILABLE' }`.
- The client renders an `ARCHIVE_UNAVAILABLE` state (see `COMP`) with a retry option.
- The retry option attempts the request again with a fresh cache bypass.

The product does not pretend the archive is always available. It communicates its dependency honestly.

---

## 5.5 — Context Service

```
ID            ARCH.5
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  DATA
```

The Context Service assembles the contextual information that accompanies each snapshot.

### 5.5.1 — Context Data Sources

| Data                 | Source                                | Update Frequency  |
|----------------------|---------------------------------------|-------------------|
| Era labels           | Internal database (static)            | Infrequent        |
| Site first archived  | CDX API (cached)                      | Once per site     |
| Snapshot count       | CDX API (cached, TTL 24h)             | Daily             |
| Coverage gaps        | Computed from CDX timeline data       | On timeline load  |
| Change records       | Computed and stored in database       | On first analysis |

### 5.5.2 — Era Definitions

Eras are named periods of internet history maintained in the internal database. They are editorial, not algorithmic.

| Era Name             | Approximate Range  | Character                                              |
|----------------------|--------------------|--------------------------------------------------------|
| The Early Web        | 1991 – 1996        | Text-dominant. No CSS. Academic and hobbyist origins.  |
| The Browser Wars     | 1996 – 2001        | Table layouts. Animated GIFs. Competing standards.     |
| The Dot-Com Era      | 1999 – 2002        | Aggressive investment. Flash. Rich media experimentation.|
| Post-Crash Web       | 2002 – 2004        | Consolidation. Simpler. More functional.               |
| Web 2.0              | 2004 – 2009        | Ajax. User-generated content. Social networks emerge.  |
| The Mobile Transition| 2007 – 2013        | Responsive design. App ecosystem. Touch interfaces.    |
| The Flat Design Era  | 2013 – 2017        | iOS 7 influence. Minimalism. Card layouts.             |
| The Platform Web     | 2017 – 2022        | Consolidation around a few platforms. Dark mode.       |
| The AI Transition    | 2022 – present     | AI-generated content. Interface experimentation.       |

Era boundaries overlap intentionally. A snapshot does not belong to one era — it exists in a period of transition. The era label is context, not classification.

### 5.5.3 — Change Detection

Change detection compares adjacent snapshots to identify moments of significant visual or structural change. It is a computed signal, not a human-curated one.

**v1 Change Detection (MVP)**

In the MVP, change detection is simple: compare the byte length of adjacent CDX records. A significant change in page size (>20% difference) is flagged as a change marker.

This is imprecise. It catches major redesigns and large content additions but misses subtle layout changes. It is the MVP implementation because it requires no rendering — it operates on CDX metadata alone.

**v2 Change Detection (Post-MVP)**

Visual diff using rendered screenshots. Snapshots are rendered server-side (Puppeteer), screenshots are compared using perceptual hashing, and similarity scores below a threshold are flagged as changes.

This is more accurate but significantly more expensive in compute and storage. It is deferred to post-MVP.

The v1 implementation is not presented as comprehensive. The UI communicates that change markers indicate detected changes — not all changes.

---

## 5.6 — Cache Architecture

```
ID            ARCH.6
Status        Approved
Version       1.0
Last Updated  2026-07-15
```

### 5.6.1 — Cache Layers

Timeframe uses three cache layers:

**Layer 1 — Browser Cache**
Static assets, fonts, and immutable API responses are cached in the browser via standard HTTP cache headers. Cache-Control headers are set aggressively for archive data.

**Layer 2 — CDN Cache (Vercel Edge)**
API responses that are safe to cache at the edge are cached at Vercel's edge network. CDX timeline data and context data are served from edge cache on warm requests.

**Layer 3 — Redis (Upstash)**
The primary application cache. All archive data passes through Redis before going to the Wayback Machine.

### 5.6.2 — Cache Keys

Cache keys are deterministic and collision-resistant:

```
CDX Coverage:    cdx:coverage:{normalized_domain}
CDX Timeline:    cdx:timeline:{normalized_domain}:{from_year}:{to_year}
Context:         ctx:{normalized_domain}
Era:             era:{year}
Change Records:  changes:{normalized_domain}
```

### 5.6.3 — TTL Policy

| Cache Entry        | TTL          | Rationale                                              |
|--------------------|--------------|--------------------------------------------------------|
| CDX Coverage       | 7 days       | Coverage only grows. New snapshots rare for old sites. |
| CDX Timeline       | 24 hours     | New snapshots can be added by the Wayback Machine.     |
| Context data       | 24 hours     | Infrequently changing editorial data.                  |
| Era data           | 7 days       | Static. Changes only when editors update.              |
| Change records     | 7 days       | Computed once, stable.                                 |
| Snapshot URL       | Indefinite   | Snapshot URLs are immutable. Forever valid.            |

Snapshot URLs are cached indefinitely because the Wayback Machine guarantees immutability — a snapshot at a given timestamp does not change.

### 5.6.4 — Cache Miss Handling

On a cache miss:
1. The service fetches from the origin (Wayback Machine or database).
2. The result is written to cache before being returned to the caller.
3. If the origin is unavailable, the service returns the error. It does not serve stale data beyond its TTL without explicit stale-while-revalidate configuration.

Stale-while-revalidate is enabled for CDX Timeline data. On a stale cache hit, the stale data is returned immediately while a background refresh is queued. The user sees data immediately; the cache is updated in the background.

---

## 5.7 — Database Schema

```
ID            ARCH.7
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  DATA
```

The database is PostgreSQL hosted on Supabase. It stores data that Timeframe owns — not archive data, which belongs to the Wayback Machine.

### 5.7.1 — Core Tables

**sites**
```sql
CREATE TABLE sites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain        TEXT NOT NULL UNIQUE,
  first_archived TIMESTAMPTZ,
  snapshot_count INTEGER,
  last_indexed  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sites_domain ON sites(domain);
```

**eras**
```sql
CREATE TABLE eras (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  start_year    INTEGER NOT NULL,
  end_year      INTEGER,
  description   TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

**change_records**
```sql
CREATE TABLE change_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id       UUID NOT NULL REFERENCES sites(id),
  timestamp     TIMESTAMPTZ NOT NULL,
  prev_timestamp TIMESTAMPTZ,
  change_score  FLOAT NOT NULL,
  change_type   TEXT NOT NULL,  -- 'size', 'visual', 'structural'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_change_records_site ON change_records(site_id);
CREATE INDEX idx_change_records_timestamp ON change_records(site_id, timestamp);
```

**search_log**
```sql
CREATE TABLE search_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain        TEXT NOT NULL,
  normalized    TEXT NOT NULL,
  result        TEXT NOT NULL,  -- 'success', 'no_coverage', 'invalid'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_log_created ON search_log(created_at);
```

The search log is analytics, not user data. No user identifier is stored. Domains are stored to understand search patterns, not to track individuals.

---

## 5.8 — Deployment Architecture

```
ID            ARCH.8
Status        Approved
Version       1.0
Last Updated  2026-07-15
```

### 5.8.1 — Infrastructure

| Component      | Provider       | Rationale                                              |
|----------------|----------------|--------------------------------------------------------|
| Application    | Vercel         | Next.js native. Edge functions. Global CDN.            |
| Database       | Supabase       | Managed PostgreSQL. Row-level security. Easy setup.    |
| Cache          | Upstash        | Serverless Redis. Per-request pricing. No cold starts. |
| Monitoring     | Vercel Analytics | Built-in. No additional instrumentation needed at MVP.|

### 5.8.2 — Environments

| Environment | Purpose                                 | Database        |
|-------------|-----------------------------------------|-----------------|
| Production  | Live product                            | Production DB   |
| Preview     | Per-PR deployment on Vercel             | Staging DB      |
| Development | Local development                       | Local or Staging|

Environment variables are never committed to the repository. They are managed in Vercel's environment variable system for deployed environments and in a `.env.local` file for local development. `.env.local` is gitignored.

### 5.8.3 — Environment Variables

```
# Archive
WAYBACK_CDX_BASE_URL=http://web.archive.org/cdx/search/cdx
WAYBACK_RATE_LIMIT_CONCURRENCY=2

# Database
DATABASE_URL=postgresql://...

# Cache
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Application
NEXT_PUBLIC_APP_URL=https://timeframe.app
NODE_ENV=production
```

---

## 5.9 — Security Considerations

```
ID            ARCH.9
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  SEC
```

### 5.9.1 — iframe Security

Archived snapshots are rendered in iframes. This creates security considerations:

- The iframe renders content from `web.archive.org`. It is a third-party domain.
- The iframe is sandboxed: `sandbox="allow-scripts allow-same-origin"`.
- `allow-forms` and `allow-top-navigation` are not granted — archived forms cannot be submitted, and archived links cannot navigate the parent frame.
- A Content Security Policy is set on the parent page that restricts frame-src to `web.archive.org` only.

The Wayback Machine injects a toolbar into rendered pages. This toolbar is visually suppressed in the viewer via CSS injection into the iframe. The toolbar HTML remains in the DOM — it is not removed — but it is hidden. This is a UI decision, not a security decision.

### 5.9.2 — Input Validation

All user input is validated before use:

- Domain input is normalized and validated against a regex before any network request.
- Timestamp parameters in URL routes are validated as valid date strings before query dispatch.
- tRPC procedures validate all input with Zod schemas before reaching service logic.

No user input is interpolated into SQL queries. The database client uses parameterized queries exclusively.

### 5.9.3 — No Authentication at MVP

The MVP has no user accounts and no authentication. There is no session management, no token handling, and no personal data stored.

The search log records normalized domains only — no IP addresses, no user agents, no identifying information.

When authentication is introduced (post-MVP), it is introduced with a full security review. Its architecture is documented separately at that time.

---

## 5.10 — Performance Architecture

```
ID            ARCH.10
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  PERF
```

### 5.10.1 — Critical Path

The critical path for the core loop is:

```
1. User submits search
2. Domain normalized (< 1ms, client-side)
3. Coverage check (cache hit: < 50ms, cache miss: < 500ms)
4. Route transition to /explore/[domain]
5. SSR: Timeline data fetched (cache hit: < 100ms, cache miss: < 1000ms)
6. Page hydrated, timeline rendered
7. Initial snapshot URL constructed
8. Snapshot loaded in iframe (network-dependent, target < 2000ms)
9. Core loop step 3 achieved
```

Total target: first snapshot visible within 3 seconds on a warm cache, reasonable connection.

### 5.10.2 — Optimization Strategies

**Prefetching**
When the timeline loads, the adjacent snapshots (previous and next from the initial position) are prefetched. When the user scrubs, they are already in cache.

**CDX Pagination Handling**
The CDX API is queried in background chunks if a site has more than 1000 snapshots. The first chunk is returned immediately; subsequent chunks load in the background and the timeline extends as they arrive.

**Iframe Preloading**
When a user pauses on a snapshot during scrubbing, the adjacent snapshots begin preloading in background iframes. This makes forward/backward navigation faster.

**Edge Caching**
CDX timeline data is cached at Vercel's edge via `Cache-Control: public, s-maxage=86400, stale-while-revalidate=3600`. The majority of traffic for popular sites hits the edge cache, not the Redis cache or the Wayback Machine.

Full performance requirements and budgets are defined in `PERF`.

---

## Architecture Decision Records

### ADR-001: Use the Wayback Machine rather than maintain a proprietary archive

**Status:** Accepted
**Date:** 2026-07-15

**Context**
Timeframe needs archived website snapshots to function. Two options exist: build and maintain a proprietary crawl and archive, or use an existing archive as the data source.

**Decision**
Use the Wayback Machine (Internet Archive) as the primary and sole archive source.

**Alternatives Considered**

| Alternative              | Reason Rejected                                                        |
|--------------------------|------------------------------------------------------------------------|
| Proprietary archive      | Infrastructure cost exceeds product value. Years of crawl data needed.|
| Common Crawl             | Not optimized for individual site history. Incomplete temporal coverage.|
| Multiple archive sources | Complexity of merging timelines from different sources. Deferred.      |

**Consequences**
- Timeframe is dependent on Internet Archive availability.
- Coverage quality varies by site and era — Timeframe cannot control this.
- Rate limiting must be respected and worked around via caching.
- No control over what is or is not archived.

---

### ADR-002: tRPC over REST for internal API

**Status:** Accepted
**Date:** 2026-07-15

**Context**
The frontend and backend need to communicate. The options are REST, GraphQL, or tRPC.

**Decision**
Use tRPC for all internal client-server communication.

**Alternatives Considered**

| Alternative | Reason Rejected                                                          |
|-------------|--------------------------------------------------------------------------|
| REST        | Requires manual type synchronization. Runtime type errors possible.      |
| GraphQL     | Overhead of schema definition and client codegen not justified at scale. |

**Consequences**
- End-to-end type safety between client and server.
- API changes that break the client are caught at compile time.
- tRPC is a Next.js ecosystem tool — aligns with the chosen framework.
- If the API is ever exposed publicly (post-MVP), a REST or GraphQL layer will need to be added. tRPC is not suitable for external consumers.

---

### ADR-003: Zustand over Redux or Context for global UI state

**Status:** Accepted
**Date:** 2026-07-15

**Context**
A small amount of global UI state needs to be shared across distant components — active site, active snapshot, compare mode status.

**Decision**
Use Zustand for global UI state.

**Alternatives Considered**

| Alternative     | Reason Rejected                                                         |
|-----------------|-------------------------------------------------------------------------|
| Redux Toolkit   | Significant boilerplate for a small state surface. Overkill.            |
| React Context   | Re-renders all consumers on any state change. Performance risk at scale.|
| Jotai           | Atom model is appropriate but Zustand's single store is simpler here.   |

**Consequences**
- Simple API. Low boilerplate.
- Zustand stores are easy to debug and test.
- The global store must remain small. If it grows significantly, the decision should be revisited.

---

## Revision History

| Version | Date       | Author | Summary                      |
|---------|------------|--------|------------------------------|
| 1.0     | 2026-07-15 | —      | Initial approved version.    |

---

*End of 05 — Architecture*