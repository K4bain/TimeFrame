# DEV — Development Standards

## Purpose
Define coding standards and development practices for Timeframe. Consistency enables speed.

---

## DEV.1 — Code Style

### 1.1 — TypeScript
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Explicit return types on functions
- Interfaces over types (unless union needed)

### 1.2 — Naming
| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `use-search.ts` |
| Components | PascalCase | `SearchForm` |
| Hooks | camelCase, `use` prefix | `useSearch` |
| Utils | camelCase | `normalizeUrl` |
| Types | PascalCase | `Website`, `Capture` |
| Constants | SCREAMING_SNAKE | `CACHE_TTL` |

### 1.3 — Imports
```typescript
// Order: external, internal, types, utils
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Website } from '@/types';
import { cn } from '@/lib/utils';
```

---

## DEV.2 — File Organization

### 2.1 — One Component Per File
```tsx
// search-form.tsx — single export
export function SearchForm() { ... }
```

### 2.2 — Co-location
- Feature hooks live in `features/[name]/`
- Shared hooks live in `hooks/`
- Types live in `types/`
- Utils live in `utils/`

### 2.3 — Barrel Exports
- No `index.ts` barrel files
- Import directly from file

---

## DEV.3 — React Patterns

### 3.1 — Server Components (Default)
```tsx
// No "use client" — this is a Server Component
export default async function Page() {
  return <div>...</div>;
}
```

### 3.2 — Client Components (When Needed)
```tsx
"use client";
import { useState } from 'react';
// Only for interactive features
```

### 3.3 — Hooks
```tsx
// Always return object, not array
export function useFeature() {
  return { state, loading, error, actions };
}
```

---

## DEV.4 — Styling

### 4.1 — Tailwind Only
- No inline styles
- No CSS modules
- No styled-components

### 4.2 — Class Merging
```tsx
import { cn } from '@/lib/utils';
className={cn("base-class", condition && "conditional", className)}
```

### 4.3 — DSYS Tokens
- Use semantic tokens (`bg-primary`, `text-foreground`)
- Never hardcode colors
- Follow DSYS radius scale

---

## DEV.5 — Git

### 5.1 — Commit Messages
```
type(scope): description

feat(search): add URL normalization
fix(timeline): correct gap detection
docs(spec): add motion language
```

### 5.2 — Branches
- `main` — production
- `feat/*` — features
- `fix/*` — bug fixes
- No long-lived develop branch

---

## DEV.6 — Code Review

### 6.1 — Self Review
- Check TypeScript errors
- Run linter
- Test locally before commit

### 6.2 — Checklist
- [ ] No `any` types
- [ ] No console.log in production
- [ ] No hardcoded values
- [ ] Accessibility considered
- [ ] Performance impact assessed

---

## DEV.7 — Forbidden

- No `any` types
- No `console.log` in production code
- No commented-out code
- No TODO without issue reference
- No magic numbers
- No global variables

---

## DEV.8 — Verification

- [ ] All code follows naming conventions
- [ ] No TypeScript errors
- [ ] No lint warnings
- [ ] Consistent import order
- [ ] All files follow one-component-per-file