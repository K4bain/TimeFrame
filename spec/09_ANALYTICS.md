# 09 — Analytics

Version: 1.0
Status: Approved
Classification: Internal
Last Revised: 2026-07-15

---

## Preamble

This document defines what Timeframe measures and why.

Analytics exist to answer questions about whether the product is working. Not to collect data. Not to build profiles. Not to optimize engagement.

---

## Analytics Philosophy

- Measure outcomes, not activity.
- Collect the minimum necessary.
- Users are not surprised by what is collected.
- Analytics inform, not dictate.

---

## 9.1 — Analytics Provider

**Vercel Analytics** for core web vitals and page-level traffic.
**Plausible Analytics** for event tracking.

---

## 9.2 — Event Taxonomy

Events follow `[noun].[verb]` naming. Nouns are product surfaces. Verbs are past-tense user actions.

### Search Events

| Event | Properties | Why |
|-------|-----------|-----|
| `search.submitted` | `inputLength`, `normalized` | Top-of-funnel volume |
| `search.succeeded` | `domain`, `cacheHit`, `responseMs` | Success rate and performance |
| `search.failed` | `errorCode`, `domain` | Failure modes |

### Timeline Events

| Event | Properties | Why |
|-------|-----------|-----|
| `timeline.loaded` | `domain`, `snapshotCount`, `spanYears`, `cacheHit`, `renderMs` | Load performance |
| `timeline.scrubbed` | `domain`, `distanceYears`, `direction` | Core engagement signal |
| `timeline.jumped` | `domain`, `trigger`, `distanceYears` | Navigation patterns |

### Viewer Events

| Event | Properties | Why |
|-------|-----------|-----|
| `viewer.snapshotLoaded` | `domain`, `year`, `loadMs`, `isPartial` | Viewer performance |
| `viewer.snapshotError` | `domain`, `errorCode`, `year` | Snapshot reliability |

### Compare Events

| Event | Properties | Why |
|-------|-----------|-----|
| `compare.entered` | `domain`, `trigger` | Adoption rate |
| `compare.exited` | `domain`, `durationMs` | Engagement depth |

### Session Events

| Event | Properties | Why |
|-------|-----------|-----|
| `session.coreLoopCompleted` | `domain`, `snapshotsViewed`, `compareUsed`, `sessionMs` | Primary success metric |
| `session.bounced` | `landingMs` | Landing page effectiveness |

---

## 9.3 — Primary Metrics

| Metric                      | Source Event                       | Target   |
|-----------------------------|-------------------------------------|----------|
| Core Loop Completion Rate   | `session.coreLoopCompleted` / sessions | > 60%  |
| Time to First Snapshot      | `viewer.snapshotLoaded.loadMs`      | < 3000ms |
| Timeline Engagement Rate    | `timeline.scrubbed` / sessions with timeline | > 50% |
| Compare Mode Adoption       | `compare.entered` / sessions with timeline | > 15% |
| Search Success Rate         | `search.succeeded` / `search.submitted` | > 80% |
| Bounce from Landing         | `session.bounced` / total sessions  | < 40%  |

---

## 9.4 — Privacy

- No personal data
- No cross-site tracking
- No behavioral profiles
- No session IDs or user IDs
- DNT respected

---

## Revision History

| Version | Date       | Author | Summary                   |
|---------|------------|--------|---------------------------|
| 1.0     | 2026-07-15 | —      | Initial approved version. |

---

*End of 09 — Analytics*