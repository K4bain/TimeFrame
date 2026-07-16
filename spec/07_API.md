# 07 — API Design

Version: 1.0
Status: Approved
Classification: Internal
Last Revised: 2026-07-15

---

## Preamble

This document defines the API layer of Timeframe.

It covers the internal tRPC API that the frontend consumes, the external Wayback Machine API that the backend consumes, and the contracts that govern both.

---

## 7.1 — tRPC Router Structure

```
/server/routers
  ├── search.ts       → Search and domain validation procedures
  ├── archive.ts      → Timeline and snapshot procedures
  └── context.ts      → Contextual metadata procedures

/server/root.ts       → Root router — merges all subrouters
```

---

## 7.2 — Search Router

### `search.normalize`

Normalizes a raw URL or domain string to a canonical domain.

**Type:** Query (client-side)

**Input:**
```typescript
z.object({ input: z.string().min(1).max(2048) })
```

**Output:**
```typescript
| { success: true; domain: string }
| { success: false; error: 'INVALID_INPUT' }
```

---

### `search.checkCoverage`

Checks whether a normalized domain has any archive coverage.

**Type:** Query

**Input:**
```typescript
z.object({ domain: z.string().min(1).max(253) })
```

**Output:**
```typescript
| { success: true; domain: string; firstSnapshot: string; snapshotCount: number }
| { success: false; error: 'NO_COVERAGE' | 'ARCHIVE_UNAVAILABLE' | 'RATE_LIMITED' }
```

**Cache:** Redis. TTL: 7 days.

---

## 7.3 — Archive Router

### `archive.getTimeline`

Returns the full snapshot timeline for a domain.

**Type:** Query

**Input:**
```typescript
z.object({
  domain: z.string().min(1).max(253),
  fromYear: z.number().int().min(1991).max(2100).optional(),
  toYear: z.number().int().min(1991).max(2100).optional(),
})
```

**Output:**
```typescript
{
  success: true;
  domain: string;
  snapshots: Array<{
    timestamp: string;
    date: string;
    url: string;
    statusCode: number;
    size: number;
  }>;
  totalCount: number;
  firstSnapshot: string;
  lastSnapshot: string;
  coverageGaps: Array<{
    from: string;
    to: string;
    durationDays: number;
  }>;
}
| { success: false; error: 'NO_COVERAGE' | 'ARCHIVE_UNAVAILABLE' | 'RATE_LIMITED' }
```

**Cache:** Redis. TTL: 24h. SWR: 1h.

---

### `archive.getSnapshot`

Returns the Wayback Machine URL for a specific snapshot.

**Type:** Query

**Input:**
```typescript
z.object({
  domain: z.string().min(1).max(253),
  timestamp: z.string().regex(/^\d{14}$/),
})
```

**Output:**
```typescript
| { success: true; url: string; timestamp: string; date: string; isAvailable: boolean }
| { success: false; error: 'SNAPSHOT_UNAVAILABLE' | 'ARCHIVE_UNAVAILABLE' }
```

**Cache:** Redis. TTL: indefinite.

---

### `archive.getNearestSnapshot`

Returns the nearest available snapshot to a given date.

**Type:** Query

**Input:**
```typescript
z.object({
  domain: z.string().min(1).max(253),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  direction: z.enum(['before', 'after', 'nearest']).default('nearest'),
})
```

**Output:**
```typescript
| { success: true; snapshot: { timestamp: string; date: string; url: string; distanceDays: number } }
| { success: false; error: 'NO_SNAPSHOTS_IN_DIRECTION' | 'NO_COVERAGE' }
```

---

## 7.4 — Context Router

### `context.getSiteContext`

Returns contextual metadata for a site.

**Type:** Query

**Input:**
```typescript
z.object({ domain: z.string().min(1).max(253) })
```

**Output:**
```typescript
| {
    success: true;
    domain: string;
    firstArchived: string;
    totalSnapshots: number;
    coverageQuality: 'good' | 'moderate' | 'sparse';
    changeRecords: Array<{
      timestamp: string;
      date: string;
      changeScore: number;
      changeType: string;
    }>;
  }
| { success: false; error: 'SITE_NOT_FOUND' }
```

**Cache:** Redis. TTL: 24h.

---

### `context.getSnapshotContext`

Returns contextual information specific to a snapshot moment.

**Type:** Query

**Input:**
```typescript
z.object({
  domain: z.string().min(1).max(253),
  timestamp: z.string().regex(/^\d{14}$/),
})
```

**Output:**
```typescript
| {
    success: true;
    era: { name: string; slug: string; description: string };
    snapshotOrdinal: number;
    totalSnapshots: number;
    isChangeMarker: boolean;
    changeContext: {
      score: number;
      type: string;
      prevTimestamp: string | null;
      nextTimestamp: string | null;
    } | null;
  }
| { success: false; error: 'SITE_NOT_FOUND' | 'SNAPSHOT_NOT_IN_TIMELINE' }
```

**Cache:** Redis. TTL: 24h.

---

### `context.getEras`

Returns all defined eras.

**Type:** Query

**Input:** None.

**Output:**
```typescript
{
  success: true;
  eras: Array<{
    id: string;
    name: string;
    slug: string;
    startYear: number;
    endYear: number | null;
    description: string;
  }>;
}
```

**Cache:** Redis. TTL: 7 days.

---

## 7.5 — External API: Wayback Machine CDX

### Base URL

```
http://web.archive.org/cdx/search/cdx
```

Note: HTTP, not HTTPS.

### Common Parameters

| Parameter   | Type    | Description                                              |
|-------------|---------|----------------------------------------------------------|
| `url`       | string  | The domain or URL to query.                              |
| `output`    | string  | Always `json`.                                           |
| `fl`        | string  | Comma-separated field list.                              |
| `collapse`  | string  | Deduplication key. `timestamp:8` = one per day.          |
| `filter`    | string  | Field filter. `statuscode:200` = successful captures only.|
| `limit`     | integer | Max results per request. Max 10,000.                     |
| `from`      | string  | Start timestamp.                                         |
| `to`        | string  | End timestamp.                                           |
| `offset`    | integer | Pagination offset.                                       |

### Response Format

```json
[
  ["timestamp", "original", "statuscode", "length"],
  ["19980901120000", "http://www.google.com/", "200", "2516"]
]
```

---

## 7.6 — API Performance Budgets

| Procedure                    | Cache Hit  | Cache Miss  |
|------------------------------|------------|-------------|
| `search.normalize`           | < 1ms      | N/A (local) |
| `search.checkCoverage`       | < 50ms     | < 1000ms    |
| `archive.getTimeline`        | < 100ms    | < 2000ms    |
| `archive.getSnapshot`        | < 50ms     | < 500ms     |
| `archive.getNearestSnapshot` | < 10ms     | N/A         |
| `context.getSiteContext`     | < 50ms     | < 500ms     |
| `context.getSnapshotContext` | < 50ms     | < 200ms     |
| `context.getEras`            | < 20ms     | < 100ms     |

---

## Revision History

| Version | Date       | Author | Summary                   |
|---------|------------|--------|---------------------------|
| 1.0     | 2026-07-15 | —      | Initial approved version. |

---

*End of 07 — API Design*