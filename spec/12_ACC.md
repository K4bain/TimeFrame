# ACC — Accessibility

## Purpose
Define accessibility requirements for Timeframe. The application must be usable by everyone, regardless of ability.

---

## ACC.1 — Standards

**Target:** WCAG 2.1 AA compliance

---

## ACC.2 — Keyboard Navigation

### 2.1 — Focus Order
- All interactive elements must be reachable via Tab
- Focus order must follow visual order
- Skip navigation link must be first focusable element

### 2.2 — Focus Indicators
- Use browser default or DSYS focus ring
- Never remove focus outlines without replacement
- Focus ring must be visible on dark backgrounds

### 2.3 — Keyboard Shortcuts
| Key | Action |
|-----|--------|
| Tab | Move to next element |
| Shift+Tab | Move to previous element |
| Enter/Space | Activate button/link |
| Arrow Left/Right | Timeline scrubber navigation |
| Escape | Close modal/dialog |

---

## ACC.3 — Screen Readers

### 3.1 — Semantic HTML
- Use `<main>`, `<nav>`, `<header>`, `<footer>` landmarks
- Use `<h1>` through `<h6>` in order
- Use `<button>` for actions, `<a>` for navigation

### 3.2 — ARIA Labels
| Element | aria-label |
|---------|------------|
| Search input | "Search for a website" |
| Timeline scrubber | "Timeline scrubber" |
| Fullscreen toggle | "Toggle fullscreen" |
| Prev/next snapshot | "Previous snapshot" / "Next snapshot" |
| Skip nav | "Skip to main content" |

### 3.3 — Live Regions
- Loading states: `aria-live="polite"`
- Error messages: `aria-live="assertive"`
- Snapshot count: `aria-live="polite"`

---

## ACC.4 — Visual

### 4.1 — Color Contrast
- Text on dark background: minimum 4.5:1 ratio
- Amber accent on dark: verify contrast ratio
- Never use color alone to convey information

### 4.2 — Text Scaling
- All text must resize up to 200% without loss
- Use relative units (rem, em) not px for text
- Timeline must reflow on zoom

### 4.3 — Motion
- Respect `prefers-reduced-motion: reduce`
- Replace animations with opacity changes
- No flashing content

---

## ACC.5 — Forms

### 5.1 — Labels
- Every input must have a visible label or `aria-label`
- Error messages must be associated with inputs

### 5.2 — Validation
- Inline validation on blur
- Error summary on submit
- Focus first error on submit

---

## ACC.6 — Media

### 6.1 — Iframes
- Archive viewer iframe must have `title` attribute
- Iframe content is external — limited control
- Provide text alternative for iframe context

### 6.2 — Images
- All images must have `alt` text
- Decorative images use `alt=""`

---

## ACC.7 — Testing

### 7.1 — Automated
- Run axe-core on all pages
- Fix all Critical and Serious issues

### 7.2 — Manual
- Test with keyboard only
- Test with screen reader (NVDA/VoiceOver)
- Test with 200% zoom

---

## ACC.8 — Forbidden

- No `tabindex` > 0
- No `role` attributes that duplicate native HTML
- No focus traps (except modals)
- No auto-playing audio/video

---

## ACC.9 — Verification

- [ ] All pages pass axe-core scan
- [ ] Keyboard-only navigation works
- [ ] Screen reader announces all interactive elements
- [ ] Color contrast meets WCAG AA
- [ ] Reduced motion preference honored