# PERF — Performance

## Purpose
Define performance budgets and optimization strategies for Timeframe. Speed is a feature.

---

## PERF.1 — Budgets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | < 1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| First Input Delay (FID) | < 100ms | Lighthouse |
| Time to Interactive (TTI) | < 3.5s | Lighthouse |
| Total Bundle Size | < 200KB | Next.js build |
| API Response (CDX) | < 2s | Network tab |
| API Response (Wayback) | < 1s | Network tab |

---

## PERF.2 — Loading Strategy

### 2.1 — Code Splitting
- Each route is a separate chunk (Next.js App Router)
- Framer Motion lazy-loaded only where animations exist
- No large dependencies imported globally

### 2.2 — Font Loading
- Geist + Geist Mono loaded via `next/font/google`
- `font-display: swap` prevents invisible text
- Fonts preloaded in `<head>`

### 2.3 — Image Optimization
- No images in MVP (iframes only)
- Future: use `next/image` with `priority` for above-fold

---

## PERF.3 — Caching

### 3.1 — In-Memory Cache
- TTL: 30 minutes
- Key: API endpoint + params
- Check before every API call

### 3.2 — localStorage Cache
- TTL: 30 minutes
- Persists across page reloads
- Falls back gracefully if unavailable

### 3.3 — Cache Invalidation
- No manual invalidation
- TTL-based expiration only
- User can clear via browser dev tools

---

## PERF.4 — API Optimization

### 4.1 — Fetch Timeout
- All external API calls: 15 second timeout
- Use `AbortController` for cancellation
- Show timeout error to user

### 4.2 — Rate Limiting
- Internet Archive: ~10 requests/minute
- Cache reduces repeat calls
- Show "try again" message on 429

### 4.3 — Data Minimization
- CDX API: request only needed fields
- Wayback API: single availability check
- No unnecessary data transfer

---

## PERF.5 — Rendering

### 5.1 — Server Components
- Use React Server Components where possible
- Only `"use client"` for interactive features
- Static pages pre-rendered at build time

### 5.2 — Client Components
- Minimize client-side JavaScript
- Use `Suspense` for lazy loading
- Avoid unnecessary re-renders

### 5.3 — Layout Stability
- Fixed dimensions for iframes
- Skeleton loaders for async content
- No layout shifts on load

---

## PERF.6 — Monitoring

### 6.1 — Core Web Vitals
- Monitor FCP, LCP, CLS, FID
- Set up alerts for regressions
- Track over time

### 6.2 — Bundle Analysis
- Run `next build` with analysis
- Identify large dependencies
- Remove unused code

---

## PERF.7 — Forbidden

- No large hero images on landing
- No auto-playing video
- No infinite scroll without virtualization
- No blocking scripts in `<head>`
- No render-blocking CSS

---

## PERF.8 — Verification

- [ ] All metrics within budget
- [ ] Lighthouse score > 90
- [ ] No layout shifts on any page
- [ ] Cache reduces API calls by 50%+
- [ ] Bundle size < 200KB