# 16 — Monitoring

Version: 1.0
Status: Approved
Classification: Internal
Last Revised: 2026-07-15

---

## Preamble

This document defines how Timeframe is monitored in production.

Monitoring answers one question: is the product working right now?

---

## Monitoring Philosophy

- Monitor outcomes, not infrastructure.
- Alert on signal, not noise.
- Every alert has an owner and a runbook.

---

## 16.1 — Monitoring Stack

| Concern              | Tool                    |
|----------------------|-------------------------|
| Uptime               | Better Stack Uptime     |
| Error tracking       | Vercel (built-in)       |
| Performance          | Vercel Analytics        |
| Log-based alerts     | Logtail (Better Stack)  |
| Archive availability | Custom health check     |

---

## 16.2 — Health Checks

### Application Health

**Endpoint:** `GET /api/health`

```json
{
  "status": "ok" | "degraded" | "down",
  "timestamp": "2026-07-15T10:23:45.123Z",
  "checks": {
    "database": "ok" | "error",
    "cache":    "ok" | "degraded" | "error",
    "archive":  "ok" | "degraded" | "error"
  }
}
```

**HTTP status codes:**
- All checks `ok`: 200
- Any check `degraded`: 200
- Any check `error`: 503

---

## 16.3 — Alerts

| Alert                 | Trigger                                    | Severity | Response Time |
|-----------------------|--------------------------------------------|----------|---------------|
| Application Down      | 503 for 2 consecutive checks              | Critical | Immediate     |
| Archive Unavailable   | >10 `archive.unavailable` in 5min         | High     | < 30 min      |
| Cache Down            | Any `cache.unavailable` log entry         | High     | < 30 min      |
| Error Rate Spike      | >20 `api.error` in 5min                   | Medium   | < 4 hours     |
| High Snapshot Load    | Median loadMs > 5000ms over 15min         | Low      | Next day      |

---

## 16.4 — Performance Targets

| Metric                          | Target     | Alert Threshold |
|---------------------------------|------------|-----------------|
| Largest Contentful Paint (LCP)  | < 2.5s     | > 4.0s          |
| First Input Delay (FID)         | < 100ms    | > 300ms         |
| Cumulative Layout Shift (CLS)   | < 0.1      | > 0.25          |
| Time to First Byte (TTFB)       | < 800ms    | > 1800ms        |

---

## Revision History

| Version | Date       | Author | Summary                   |
|---------|------------|--------|---------------------------|
| 1.0     | 2026-07-15 | —      | Initial approved version. |

---

*End of 16 — Monitoring*