# TEST — Testing Strategy

## Purpose
Define the testing approach for Timeframe. Test what matters, skip what doesn't.

---

## TEST.1 — Philosophy

**Ship with confidence, not coverage.**

- Test critical paths, not every line
- Manual testing > 100% unit test coverage
- Focus on user-facing behavior

---

## TEST.2 — Testing Levels

### 2.1 — Unit Tests
**Framework:** Vitest (recommended) or Jest
**Scope:** Pure utility functions only
**Coverage:** N/A — test correctness, not coverage

| Function | Test Cases |
|----------|-----------|
| `normalizeUrl` | Adds protocol, strips paths, handles subdomains |
| `formatDate` | Various date formats, edge cases |
| `getEra` | Correct era for each year range |
| `cn` | Class merging, conditional classes |

### 2.2 — Integration Tests
**Framework:** Vitest + React Testing Library
**Scope:** Feature hooks with mocked APIs
**Coverage:** Critical paths only

| Hook | Test Cases |
|------|-----------|
| `useSearch` | Successful search, API error, timeout |
| `useTimeline` | Year grouping, gap detection, dot sampling |
| `useViewer` | Successful load, unavailable snapshot |
| `useCompare` | Both panels load, one panel fails |

### 2.3 — E2E Tests
**Framework:** Playwright (recommended)
**Scope:** Critical user journeys
**Coverage:** Core flow only

| Journey | Steps |
|---------|-------|
| Search → Timeline | Enter URL, see results, navigate to timeline |
| Timeline → Viewer | Click dot, see archived page |
| Viewer navigation | Prev/next, fullscreen toggle |
| Compare mode | Enter compare, see two panels |

---

## TEST.3 — Manual Testing

### 3.1 — Pre-Flight Checklist
Before every deployment:
- [ ] Search works with valid URL
- [ ] Search shows error for invalid URL
- [ ] Timeline loads with year dots
- [ ] Scrubber navigation works
- [ ] Gap indicators appear correctly
- [ ] Viewer loads archived page
- [ ] Fullscreen toggle works
- [ ] Compare mode shows two panels
- [ ] Collections page loads
- [ ] Collection detail shows sites
- [ ] Mobile responsive at 375px, 768px, 1024px
- [ ] Keyboard navigation works
- [ ] Screen reader announces elements

### 3.2 — Browser Testing
| Browser | Priority |
|---------|----------|
| Chrome | P0 |
| Firefox | P1 |
| Safari | P1 |
| Edge | P2 |

---

## TEST.4 — API Testing

### 4.1 — CDX API
- Test with real URLs (archive.org, google.com)
- Test with non-existent URLs
- Test with rate limiting (429)
- Test with timeout

### 4.2 — Wayback API
- Test with available snapshots
- Test with unavailable snapshots
- Test with multiple snapshots

---

## TEST.5 — Accessibility Testing

### 5.1 — Automated
- Run axe-core on all pages
- Fix Critical/Serious issues

### 5.2 — Manual
- Keyboard-only navigation
- Screen reader testing (NVDA/VoiceOver)
- 200% zoom testing

---

## TEST.6 — Performance Testing

### 6.1 — Lighthouse
- Run on all routes
- Score > 90
- Fix regressions

### 6.2 — Bundle Analysis
- Check bundle size < 200KB
- Remove unused dependencies

---

## TEST.7 — Forbidden

- No 100% unit test coverage requirement
- No testing of third-party libraries
- No snapshot tests
- No test-specific build configurations

---

## TEST.8 — Verification

- [ ] All critical paths tested
- [ ] Manual checklist completed
- [ ] Lighthouse score > 90
- [ ] No accessibility violations
- [ ] Cross-browser testing done