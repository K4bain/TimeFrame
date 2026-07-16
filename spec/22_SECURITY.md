# 22 — Security

Version: 1.0
Status: Approved
Classification: Internal
Last Revised: 2026-07-15

---

## Preamble

This document defines the security posture of Timeframe.

Security requirements are constraints on the implementation. A feature that cannot be implemented securely is redesigned.

---

## Security Philosophy

- Reduce attack surface before defending it.
- Archived content is untrusted content.
- Dependencies are attack surface.
- Secrets never touch source control.

---

## 22.1 — Content Security Policy

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{NONCE}';
  style-src 'self' 'nonce-{NONCE}';
  img-src 'self' data: https:;
  font-src 'self';
  frame-src https://web.archive.org;
  connect-src 'self' https://plausible.io;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
```

---

## 22.2 — iframe Sandbox

```html
<iframe
  sandbox="allow-scripts allow-same-origin"
  src={snapshotUrl}
  referrerpolicy="no-referrer"
  title={iframeTitle}
/>
```

**Permitted:** `allow-scripts`, `allow-same-origin`
**Blocked:** `allow-forms`, `allow-top-navigation`, `allow-popups`, `allow-downloads`, `allow-modals`, `allow-pointer-lock`

---

## 22.3 — HTTP Security Headers

| Header                       | Value                                    |
|------------------------------|------------------------------------------|
| `X-Frame-Options`            | `DENY`                                   |
| `X-Content-Type-Options`     | `nosniff`                                |
| `Referrer-Policy`            | `strict-origin-when-cross-origin`        |
| `Permissions-Policy`         | `camera=(), microphone=(), geolocation=()`|
| `Strict-Transport-Security`  | `max-age=63072000; includeSubDomains`    |
| `X-DNS-Prefetch-Control`     | `off`                                    |

---

## 22.4 — Input Validation

**Domain:**
```typescript
z.string().min(1).max(253).regex(/^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/)
```

**Timestamp:**
```typescript
z.string().regex(/^\d{14}$/)
```

**Year:**
```typescript
z.number().int().min(1991).max(2100)
```

---

## 22.5 — Dependency Security

- `npm audit` in CI. Critical/high vulnerabilities fail build.
- Critical: 24h fix window. High: 7 days. Moderate: 30 days.

---

## 22.6 — Environment Security

- Secrets in Vercel encrypted env vars only
- `.env.local` gitignored
- `.env.example` committed with placeholders
- Branch protection on `main`

---

## Revision History

| Version | Date       | Author | Summary                   |
|---------|------------|--------|---------------------------|
| 1.0     | 2026-07-15 | —      | Initial approved version. |

---

*End of 22 — Security*