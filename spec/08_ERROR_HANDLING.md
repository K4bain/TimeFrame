# 08 — Error Handling

Version: 1.0
Status: Approved
Classification: Internal
Last Revised: 2026-07-15

---

## Preamble

This document defines how Timeframe handles errors.

Every error condition that can occur in the product is catalogued here. Every error has a code, a layer where it originates, a layer where it is handled, a user-facing representation, and a recovery path.

---

## Error Philosophy

- Every error is anticipated.
- Every error has a recovery path.
- Errors are typed, not strung.
- The user sees the consequence, not the cause.

---

## 8.1 — Error Type System

### AppError Type

```typescript
type AppError =
  // Input errors
  | { code: 'INVALID_INPUT';            message: string }
  | { code: 'INVALID_DOMAIN';           message: string }
  | { code: 'INVALID_TIMESTAMP';        message: string }

  // Coverage errors
  | { code: 'NO_COVERAGE';              domain: string }
  | { code: 'NO_SNAPSHOTS_IN_DIRECTION'; domain: string; direction: string }
  | { code: 'SNAPSHOT_NOT_IN_TIMELINE'; domain: string; timestamp: string }

  // Archive errors
  | { code: 'ARCHIVE_UNAVAILABLE';      retryable: boolean }
  | { code: 'SNAPSHOT_UNAVAILABLE';     domain: string; timestamp: string }
  | { code: 'RATE_LIMITED';             retryAfter: number }

  // Data errors
  | { code: 'SITE_NOT_FOUND';           domain: string }
  | { code: 'CONTEXT_UNAVAILABLE';      domain: string }

  // Network errors
  | { code: 'NETWORK_OFFLINE' }
  | { code: 'REQUEST_TIMEOUT';          timeoutMs: number }

  // Unknown
  | { code: 'UNKNOWN';                  originalError?: string }
```

### Result Type

```typescript
type Result<T> =
  | { success: true;  data: T }
  | { success: false; error: AppError }
```

---

## 8.2 — Error Catalogue

| Code                         | Title                        | Description                                              | Action                  |
|------------------------------|------------------------------|----------------------------------------------------------|-------------------------|
| `INVALID_INPUT`              | No valid website detected.   | Enter a website address like google.com or youtube.com.  | Clear and retype        |
| `INVALID_DOMAIN`             | That doesn't look like a website. | Try entering a domain like google.com or en.wikipedia.org. | Clear and retype    |
| `NO_COVERAGE`                | No archive found for this site. | The Internet Archive has no recorded snapshots of [domain]. | Try a different site |
| `ARCHIVE_UNAVAILABLE`        | Archive temporarily unavailable. | The Internet Archive is unreachable right now.       | Try again               |
| `SNAPSHOT_UNAVAILABLE`       | This snapshot is unavailable. | The archive captured this URL but the snapshot cannot be retrieved. | Previous/Next snapshot |
| `RATE_LIMITED`               | Loading...                   | The archive is busy. Retrying in [n] seconds.            | None (auto-retry)       |
| `NETWORK_OFFLINE`            | No internet connection.      | Timeframe requires a network connection to load archive data. | None                 |
| `REQUEST_TIMEOUT`            | The archive is taking too long. | The request timed out after 8 seconds.                | Try again               |
| `CONTEXT_UNAVAILABLE`        | Context unavailable.         | Context unavailable for this site.                       | None                    |
| `UNKNOWN`                    | Something went wrong.        | An unexpected error occurred.                            | Reload page             |

---

## 8.3 — Error Boundary Placement

| Boundary             | Wraps                    | Fallback Renders                       |
|----------------------|--------------------------|----------------------------------------|
| Root boundary        | Entire application       | Full-page error with reload action.    |
| Timeline boundary    | ZONE.TIME                | Error state in timeline zone.          |
| Viewer boundary      | ZONE.STGE                | Error state in viewer zone.            |
| Context boundary     | ZONE.CNTX                | Error state in context panel.          |
| Search boundary      | ZONE.SRCH                | Error state in search zone.            |

---

## Revision History

| Version | Date       | Author | Summary                   |
|---------|------------|--------|---------------------------|
| 1.0     | 2026-07-15 | —      | Initial approved version. |

---

*End of 08 — Error Handling*