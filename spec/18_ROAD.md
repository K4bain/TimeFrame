# ROAD — Roadmap

## Purpose
Define the development phases and priorities for Timeframe. Ship fast, iterate based on real usage.

---

## ROAD.1 — Philosophy

- **Ship the core, then iterate**
- Each phase must be deployable
- Features are toggled by deployment, not branches
- Real usage > speculation

---

## ROAD.2 — Phases

### Phase 1: Foundation ✓
**Status:** Complete
**Goal:** Core experience works

| Feature | Status |
|---------|--------|
| Landing page | ✓ |
| Search with CDX integration | ✓ |
| URL normalization | ✓ |
| Error handling | ✓ |
| Loading states | ✓ |

### Phase 2: Timeline ✓
**Status:** Complete
**Goal:** Time travel works

| Feature | Status |
|---------|--------|
| Year density chart | ✓ |
| Scrubber with sampled dots | ✓ |
| Gap detection (>90 days) | ✓ |
| Keyboard navigation | ✓ |
| Era labels | ✓ |

### Phase 3: Viewer ✓
**Status:** Complete
**Goal:** Archive viewing works

| Feature | Status |
|---------|--------|
| Wayback iframe | ✓ |
| Fullscreen mode | ✓ |
| Prev/next navigation | ✓ |
| Timestamp display | ✓ |

### Phase 4: Compare ✓
**Status:** Complete
**Goal:** Side-by-side works

| Feature | Status |
|---------|--------|
| Two-panel view | ✓ |
| Responsive stacking | ✓ |
| Individual navigation | ✓ |

### Phase 5: Collections ✓
**Status:** Complete
**Goal:** Curated content works

| Feature | Status |
|---------|--------|
| 6 curated exhibits | ✓ |
| Collection index | ✓ |
| Collection detail | ✓ |
| Site list with stats | ✓ |

### Phase 6: Polish ✓
**Status:** Complete
**Goal:** Production-ready

| Feature | Status |
|---------|--------|
| In-memory + localStorage cache | ✓ |
| Fetch timeout (15s) | ✓ |
| Skip navigation | ✓ |
| Reduced motion support | ✓ |
| SEO metadata | ✓ |
| Sitemap + robots.txt | ✓ |
| Design System applied | ✓ |
| Spec documentation | ✓ |

---

## ROAD.3 — Future Phases

### Phase 7: Enhancements
**Goal:** Improve core experience

| Feature | Priority | Effort |
|---------|----------|--------|
| Bookmark/favorite snapshots | High | Medium |
| Share snapshot link | High | Low |
| Snapshot comparison overlay | Medium | High |
| Custom date range filter | Medium | Medium |
| Bulk snapshot download | Low | High |

### Phase 8: Intelligence
**Goal:** Smarter exploration

| Feature | Priority | Effort |
|---------|----------|--------|
| Change detection (visual diff) | High | High |
| Auto-detect major changes | Medium | High |
| Suggested snapshots | Medium | Medium |
| "Similar sites" recommendations | Low | Medium |

### Phase 9: Social
**Goal:** Community features

| Feature | Priority | Effort |
|---------|----------|--------|
| Public collections | Medium | Medium |
| Share collections | Medium | Low |
| Comments on snapshots | Low | Medium |
| User profiles | Low | High |

### Phase 10: Pro
**Goal:** Power features

| Feature | Priority | Effort |
|---------|----------|--------|
| API access | High | Medium |
| Batch processing | Medium | High |
| Custom archiving | Medium | High |
| Export tools | Low | Medium |

---

## ROAD.4 — Deployment

### 4.1 — Platform
- Vercel (free tier)
- Auto-deploy from `main` branch
- Preview deployments for PRs

### 4.2 — Domain
- `timeframe.vercel.app` (default)
- Custom domain (future)

### 4.3 — Monitoring
- Vercel Analytics (Core Web Vitals)
- Error tracking (Sentry, future)

---

## ROAD.5 — Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Core Loop Completion | > 60% | Search → Timeline → Viewer |
| Time to First Snapshot | < 3s | User testing |
| Timeline Engagement | > 50% | Users interact with scrubber |
| Return Rate | > 30% | Monthly active users |

---

## ROAD.6 — Verification

- [ ] All Phase 1–6 features complete
- [ ] Deployed to Vercel
- [ ] Core Web Vitals passing
- [ ] No critical bugs
- [ ] Documentation complete