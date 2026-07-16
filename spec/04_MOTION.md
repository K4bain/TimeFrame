# MOT — Motion Language

## Purpose
Define the animation system for Timeframe. Motion is not decoration — it communicates state changes, guides attention, and makes the interface feel responsive.

---

## MOT.1 — Principles

### 1.1 — Purposeful
Every animation serves a function: reveal, connect, or confirm. No purely decorative motion.

### 1.2 — Fast
Users explore. Animations should never feel slow. Target: 150–300ms for most transitions.

### 1.3 — Responsive
Motion must feel immediate. If it can't be instant, it should feel like it.

### 1.4 — Respectful
Honor `prefers-reduced-motion`. Replace motion with opacity or instant state changes.

---

## MOT.2 — Timing

### 2.1 — Duration Scale

| Token | Duration | Use Case |
|-------|----------|----------|
| `instant` | 0ms | Toggle states, hover feedback |
| `fast` | 150ms | Button press, icon rotation |
| `normal` | 250ms | Page transitions, modals |
| `slow` | 350ms | Complex transitions, compare mode |
| `glacial` | 500ms | Hero animations, first-load reveal |

### 2.2 — Easing

| Token | Curve | Use Case |
|-------|-------|----------|
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Elements entering |
| `ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Elements exiting |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Position changes |
| `spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful micro-interactions |

---

## MOT.3 — Patterns

### 3.1 — Fade In
```css
opacity: 0 → 1
duration: normal
easing: ease-out
```
Use: Page content, lazy-loaded images.

### 3.2 — Slide Up
```css
transform: translateY(8px) → 0
opacity: 0 → 1
duration: normal
easing: ease-out
```
Use: Cards, search results, timeline markers.

### 3.3 — Scale Pop
```css
transform: scale(0.95) → 1
opacity: 0 → 1
duration: fast
easing: spring
```
Use: Button press, scrubber dot hover.

### 3.4 — Crossfade
```css
opacity: 0 → 1 (new element)
opacity: 1 → 0 (old element)
duration: slow
easing: ease-in-out
```
Use: Viewer snapshot transitions, compare mode swap.

### 3.5 — Timeline Scrub
```css
transform: translateX(from) → translateX(to)
duration: instant
```
Use: Scrubber position updates. No animation — direct response to input.

---

## MOT.4 — Implementation

### 4.1 — Framer Motion
Use Framer Motion for React component animations:
```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
>
```

### 4.2 — CSS Transitions
Use CSS transitions for simple hover/focus states:
```css
transition: opacity 150ms ease-out, transform 150ms ease-out;
```

### 4.3 — Reduced Motion
Always wrap animations in the `useReducedMotion` hook:
```tsx
const reduced = useReducedMotion();
// If reduced, skip animation or use opacity-only
```

---

## MOT.5 — Forbidden

- No animation longer than 500ms
- No infinite animations (except loading spinner)
- No entrance animations on page load for above-the-fold content
- No parallax effects
- No animation on the Viewer iframe itself (only controls around it)

---

## MOT.6 — Verification

- [ ] All transitions < 500ms
- [ ] `prefers-reduced-motion` disables all non-essential motion
- [ ] No jank during timeline scrub
- [ ] Compare mode swap feels instant
- [ ] Loading states use spinner, not skeleton shimmer