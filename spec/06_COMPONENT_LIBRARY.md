# 06 — Component Library

Version: 1.0
Status: Approved
Classification: Internal
Last Revised: 2026-07-15

---

## Preamble

This document specifies every component in Timeframe.

A component is a discrete, reusable unit of the interface. Every visual element the user interacts with — every input, every button, every panel, every state — is defined here before it is built.

This document does not describe visual design. Visual design is defined in `DSYS`.
This document does not describe motion. Motion is defined in `MOT`.
This document does not describe layout. Layout is defined in `ARCH.2`.

This document describes **behavior**. What a component does, what states it has, how it responds to interaction, what it looks like in every condition, and what it requires from the systems around it.

A component that is not specified here is not built. If implementation requires a component that does not exist in this document, this document is updated first.

---

## Component Index

| ID      | Component             | Zone        | Status   |
|---------|-----------------------|-------------|----------|
| COMP.1  | Search Field          | ZONE.SRCH   | Approved |
| COMP.2  | Chrome                | ZONE.CHRO   | Approved |
| COMP.3  | Timeline              | ZONE.TIME   | Approved |
| COMP.4  | Viewer                | ZONE.STGE   | Approved |
| COMP.5  | Context Panel         | ZONE.CNTX   | Approved |
| COMP.6  | Compare Mode          | ZONE.STGE   | Approved |
| COMP.7  | Change Marker         | ZONE.TIME   | Approved |
| COMP.8  | Era Band              | ZONE.TIME   | Approved |
| COMP.9  | Snapshot Metadata Bar | ZONE.STGE   | Approved |
| COMP.10 | Error States          | All zones   | Approved |
| COMP.11 | Loading States        | All zones   | Approved |
| COMP.12 | Empty States          | All zones   | Approved |
| COMP.13 | Button                | All zones   | Approved |
| COMP.14 | Input                 | All zones   | Approved |
| COMP.15 | Tooltip               | All zones   | Approved |
| COMP.16 | Badge                 | All zones   | Approved |

---

## COMP.1 — Search Field

```
ID            COMP.1
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  DSYS.1, DSYS.2, DSYS.3, MOT.4, MOT.7, ACC.2
Referenced By COMP.2
```

### Purpose

The Search Field is the product's entry point. It accepts a domain or URL, normalizes it, and initiates exploration. It exists in two contexts: centered on the landing page as the primary call to action, and embedded in the Chrome as a persistent navigation tool during exploration.

It is one component with two visual configurations. It is never duplicated — the same instance transforms between configurations.

### Requirements

| ID          | Requirement                                                       | Priority |
|-------------|-------------------------------------------------------------------|----------|
| COMP.1.R1   | Must accept any valid domain or URL format as input.              | Required |
| COMP.1.R2   | Must normalize input to a canonical domain before query dispatch. | Required |
| COMP.1.R3   | Must display an inline error for invalid input.                   | Required |
| COMP.1.R4   | Must display a loading state during archive coverage check.       | Required |
| COMP.1.R5   | Must not submit on empty input.                                   | Required |
| COMP.1.R6   | Must show recent searches when focused with empty input.          | Preferred|
| COMP.1.R7   | Must be the only search field in the interface at any time.       | Required |
| COMP.1.R8   | Must be keyboard accessible with no pointer required.             | Required |

### Configurations

**Landing Configuration**
- Width: 480px on desktop, full-width with 16px margin on mobile.
- Height: 56px.
- Position: Centered in ZONE.SRCH.
- Font size: `--text-md` (17px).

**Chrome Configuration**
- Width: 320px on desktop. Collapses to icon on tablet.
- Height: 36px.
- Position: Left-aligned within Chrome, after the logo.
- Font size: `--text-sm` (13px).

### States

| State     | Trigger                                | Visual Description                                               |
|-----------|----------------------------------------|------------------------------------------------------------------|
| Idle      | Default on page load                   | Border: `--color-border-default`. Placeholder visible.           |
| Hover     | Pointer over field                     | Border: `--color-border-strong`. 80ms transition.                |
| Focus     | Keyboard focus or click                | Border: `--color-temporal-border`. Focus ring. Placeholder fades.|
| Typing    | User input present                     | Border: `--color-temporal-border`. Clear button appears.         |
| Loading   | Query dispatched, awaiting response    | Border: `--color-temporal-border`. Spinner replaces search icon. |
| Success   | Coverage confirmed                     | Route transition initiates. Field persists in Chrome config.     |
| Error     | Invalid input or no coverage           | Border: `--color-error-border`. Error message below field.       |
| Disabled  | Offline or service unavailable         | Opacity: `--opacity-disabled`. Not interactive.                  |

### Keyboard Interactions

| Key          | Action                                        |
|--------------|-----------------------------------------------|
| `Enter`      | Submit search                                 |
| `Escape`     | Clear input. If empty, dismiss recent searches.|
| `↑` / `↓`   | Navigate recent search suggestions            |
| `Tab`        | Move focus to next element                    |
| `Shift+Tab`  | Move focus to previous element                |

### Copy

| Context              | Copy                                          |
|----------------------|-----------------------------------------------|
| Placeholder (landing)| `Explore a website…`                          |
| Placeholder (chrome) | `Search a site…`                              |
| Error: invalid input | `No valid website detected.`                  |
| Error: no coverage   | `No archive found for this site.`             |
| Error: unavailable   | `Archive unavailable. Try again.`             |

---

## COMP.2 — Chrome

```
ID            COMP.2
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  DSYS.1, DSYS.3, COMP.1, MOT.4
Referenced By All components
```

### Purpose

The Chrome is the persistent application shell. It is always visible. It contains the logo, the Search Field in its compact configuration, and global controls.

### Requirements

| ID          | Requirement                                                      | Priority |
|-------------|------------------------------------------------------------------|----------|
| COMP.2.R1   | Must be fixed to the top of the viewport at all times.          | Required |
| COMP.2.R2   | Must contain the Timeframe logo.                                 | Required |
| COMP.2.R3   | Must contain the Search Field (Chrome configuration).           | Required |
| COMP.2.R4   | Must not render on the landing page.                            | Required |
| COMP.2.R5   | Must not contain navigation links to other sections or pages.   | Required |
| COMP.2.R6   | Height must not exceed 52px on desktop.                         | Required |

### Layout

```
┌─────────────────────────────────────────────────────┐
│  [Logo]    [Search Field — compact]      [Controls] │
│  16px gap  flex-grow                    gap-2       │
└─────────────────────────────────────────────────────┘
Height: 52px
Padding: 0 --space-6
Background: --color-bg-surface
Border-bottom: 1px solid (appears on scroll)
```

---

## COMP.3 — Timeline

```
ID            COMP.3
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  DSYS.1, DSYS.2, MOT.5, ARCH.4, TIME
Referenced By COMP.7, COMP.8
```

### Purpose

The Timeline is the primary navigation surface of Timeframe. It represents the full archival history of a site as a navigable horizontal axis of time.

### Requirements

| ID          | Requirement                                                          | Priority |
|-------------|----------------------------------------------------------------------|----------|
| COMP.3.R1   | Must display the full temporal span of available snapshots.          | Required |
| COMP.3.R2   | Must display the scrubber at the position of the active snapshot.    | Required |
| COMP.3.R3   | Must allow scrubbing via pointer drag.                               | Required |
| COMP.3.R4   | Must allow precise date navigation via keyboard.                     | Required |
| COMP.3.R5   | Must display year markers at legible intervals.                      | Required |
| COMP.3.R6   | Must communicate coverage density visually.                          | Required |
| COMP.3.R7   | Must display gap indicators where coverage is absent.                | Required |
| COMP.3.R8   | Must display Change Markers (COMP.7) where detected.                 | Required |
| COMP.3.R9   | Must display Era Bands (COMP.8) as background context.               | Preferred|

### Keyboard Interactions

| Key               | Action                                                   |
|-------------------|----------------------------------------------------------|
| `←`               | Move to previous available snapshot                      |
| `→`               | Move to next available snapshot                          |
| `Shift+←`         | Move backward one month                                  |
| `Shift+→`         | Move forward one month                                   |
| `Ctrl+←`          | Move backward one year                                   |
| `Ctrl+→`          | Move forward one year                                    |
| `Home`            | Jump to earliest snapshot                                |
| `End`             | Jump to latest snapshot                                  |

---

## COMP.4 — Viewer

```
ID            COMP.4
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  DSYS.6, MOT.4, ARCH.4, ARCH.9
Referenced By COMP.9
```

### Purpose

The Viewer renders an archived snapshot of a website. It is the window through which the user sees the past.

### Requirements

| ID          | Requirement                                                           | Priority |
|-------------|-----------------------------------------------------------------------|----------|
| COMP.4.R1   | Must render archived snapshots in a sandboxed iframe.                 | Required |
| COMP.4.R2   | Must never allow archived content to navigate the parent frame.       | Required |
| COMP.4.R3   | Must suppress the Wayback Machine toolbar visually.                   | Required |
| COMP.4.R4   | Must display the previous snapshot while the next one loads.          | Required |
| COMP.4.R5   | Must communicate rendering failures without hiding them.              | Required |
| COMP.4.R6   | Must have zero border radius.                                         | Required |
| COMP.4.R7   | Must fill the Stage zone completely.                                  | Required |

---

## COMP.5 — Context Panel

```
ID            COMP.5
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  DSYS.1, DSYS.2, ARCH.5, MOT.4
Referenced By COMP.8
```

### Purpose

The Context Panel provides the information that makes a snapshot meaningful: what era this belongs to, what changed since the previous snapshot, how much of this site's history exists in the archive.

### Requirements

| ID          | Requirement                                                         | Priority |
|-------------|---------------------------------------------------------------------|----------|
| COMP.5.R1   | Must display the active snapshot's era label.                       | Required |
| COMP.5.R2   | Must display the site's total snapshot count.                       | Required |
| COMP.5.R3   | Must display the site's first archived date.                        | Required |
| COMP.5.R4   | Must display coverage quality for the active period.                | Required |
| COMP.5.R5   | Must display change summary when a change marker is active.         | Required |
| COMP.5.R6   | Must be collapsible on tablet viewports.                            | Preferred|
| COMP.5.R7   | Must update when the active snapshot changes.                       | Required |

### Sections

**Site Overview** *(persistent)*
```
[Domain]
First archived: [date in Geist Mono]
Total snapshots: [count in Geist Mono]
Coverage: [quality indicator — Good / Moderate / Sparse]
```

**Active Snapshot** *(updates on navigation)*
```
[Era name]
[Era description — 1 sentence]
[Snapshot date — Geist Mono, large]
[Snapshot ordinal: e.g. "Snapshot 147 of 803"]
```

**Change Summary** *(appears when active snapshot is a change marker)*
```
Change detected
[Brief description of what changed]
Previous snapshot: [date]
```

**Archive Notice** *(persistent, bottom of panel)*
```
Snapshots are sourced from the Internet Archive.
Coverage and rendering quality may vary.
```

---

## COMP.6 — Compare Mode

```
ID            COMP.6
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  COMP.3, COMP.4, MOT.9, PROD.5.5
```

### Purpose

Compare Mode renders two snapshots of the same site side-by-side.

### Requirements

| ID          | Requirement                                                          | Priority |
|-------------|----------------------------------------------------------------------|----------|
| COMP.6.R1   | Must render two snapshots of the same site simultaneously.           | Required |
| COMP.6.R2   | Must allow each snapshot's date to be set independently.             | Required |
| COMP.6.R3   | Must label each panel with its date clearly.                         | Required |
| COMP.6.R4   | Must be enterable from the Timeline via a clear trigger.             | Required |
| COMP.6.R5   | Must be exitable with a single action.                               | Required |
| COMP.6.R6   | Must not support comparing two different sites.                      | Required |

### URL State

```
/compare/[domain]/[timestamp-a]/[timestamp-b]
```

---

## COMP.7 — Change Marker

```
ID            COMP.7
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  DSYS.1, COMP.3, ARCH.5, MOT.5.4
```

### Purpose

Change Markers are visual indicators on the Timeline that identify moments of detected significant change between adjacent snapshots.

### Requirements

| ID          | Requirement                                                          | Priority |
|-------------|----------------------------------------------------------------------|----------|
| COMP.7.R1   | Must appear on the Timeline at the position of a detected change.    | Required |
| COMP.7.R2   | Must be visually distinct from year markers and era bands.           | Required |
| COMP.7.R3   | Must be clickable — clicking jumps the scrubber to that position.    | Required |
| COMP.7.R4   | Must show a tooltip with change description on hover.                | Preferred|
| COMP.7.R5   | Must use the temporal color palette exclusively.                     | Required |

### Visual Specification

```
Size by change_score:
  score 0.2 – 0.4:   height 8px,  diamond 4px,  opacity 0.6
  score 0.4 – 0.7:   height 12px, diamond 6px,  opacity 0.8
  score 0.7 – 1.0:   height 16px, diamond 8px,  opacity 1.0
```

Color: `--color-temporal-primary` (inactive) / `--color-temporal-hover` (hover/active).

---

## COMP.8 — Era Band

```
ID            COMP.8
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  DSYS.1, COMP.3, ARCH.5
```

### Purpose

Era Bands are background tints on the Timeline that visually group snapshots into named periods of internet history.

### Requirements

| ID          | Requirement                                                      | Priority |
|-------------|------------------------------------------------------------------|----------|
| COMP.8.R1   | Must render as background tints behind the Timeline track.       | Required |
| COMP.8.R2   | Must not obscure Timeline markers, scrubber, or density bars.    | Required |
| COMP.8.R3   | Must label each era with its name.                               | Required |
| COMP.8.R4   | Must use the temporal palette at very low opacity.               | Required |
| COMP.8.R5   | Must not be interactive — they are background context only.      | Required |

### Visual Specification

```
Background: --color-temporal-bg at --opacity-ghost (0.06)
Label: era name, --text-2xs, --tracking-wider, uppercase
Label color: --color-temporal-text at 0.5 opacity
Label position: top-left of era band, padding --space-2
```

---

## COMP.9 — Snapshot Metadata Bar

```
ID            COMP.9
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  DSYS.1, DSYS.2, COMP.4
Referenced By COMP.6
```

### Purpose

The Snapshot Metadata Bar sits at the top of the Stage zone and provides at-a-glance information about the currently displayed snapshot.

### Content

```
[Domain]  /  [Snapshot date — Geist Mono]  /  [Snapshot ordinal]
                                             [Compare button]  [External link icon]
```

### Requirements

| ID          | Requirement                                                   | Priority |
|-------------|---------------------------------------------------------------|----------|
| COMP.9.R1   | Must display the active domain.                              | Required |
| COMP.9.R2   | Must display the active snapshot date in Geist Mono.         | Required |
| COMP.9.R3   | Must contain the Compare mode entry trigger.                 | Required |
| COMP.9.R4   | Must contain a link to the raw Wayback Machine snapshot.     | Required |

---

## COMP.10 — Error States

```
ID            COMP.10
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  DSYS.1, COPY
Referenced By All components
```

### Error Catalogue

| Error Code               | Title                        | Description                                              | Action                  |
|--------------------------|------------------------------|----------------------------------------------------------|-------------------------|
| `INVALID_DOMAIN`         | No valid website detected.   | The input couldn't be recognized as a website address.  | Try a different address |
| `NO_COVERAGE`            | No archive found.            | This website has no snapshots in the archive.           | Try a different site    |
| `ARCHIVE_UNAVAILABLE`    | Archive temporarily offline. | The Internet Archive is currently unreachable.          | Try again               |
| `SNAPSHOT_UNAVAILABLE`   | Snapshot unavailable.        | This specific snapshot couldn't be retrieved.           | Try adjacent snapshot   |
| `TIMELINE_EMPTY`         | No snapshots found.          | The archive returned no results for this site.          | Try a different site    |
| `NETWORK_OFFLINE`        | No internet connection.      | Timeframe requires a network connection.                | Check connection        |
| `RATE_LIMITED`           | Too many requests.           | The archive is rate limiting requests.                  | Auto-retry in [n]s      |

---

## COMP.11 — Loading States

```
ID            COMP.11
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  DSYS.1, MOT.6
Referenced By All components
```

### Loading Patterns by Surface

| Surface             | Loading Pattern                                            |
|---------------------|------------------------------------------------------------|
| Timeline            | Skeleton track. Progress indicator at zone top.            |
| Viewer              | Previous snapshot holds. Progress bar at stage top.        |
| Context Panel       | Skeleton sections.                                         |
| Search Field        | Spinner replaces search icon.                              |
| Compare Panel       | Skeleton viewer in new panel.                              |

---

## COMP.12 — Empty States

```
ID            COMP.12
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  DSYS.1, COPY
Referenced By All components
```

### Empty State Catalogue

| Context                    | Message                                          | Action               |
|----------------------------|--------------------------------------------------|----------------------|
| Landing page, no recents   | No copy. Featured content renders instead.       | —                    |
| Timeline, first visit      | `Enter a website above to begin exploring.`      | —                    |

---

## COMP.13 — Button

```
ID            COMP.13
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  DSYS.1, DSYS.2, DSYS.5, MOT.8
```

### Variants

| Variant     | Use                                             | Visual                                      |
|-------------|-------------------------------------------------|---------------------------------------------|
| Primary     | Main call to action. One per view maximum.      | `--color-temporal-primary` background.      |
| Secondary   | Supporting actions. Error recovery.             | `--color-bg-elevated` bg, default border.   |
| Ghost       | Low-emphasis actions. Tertiary controls.        | Transparent bg. No border. Text only.       |
| Icon        | Actions with universally understood icons only. | No label. Icon only. Tooltip required.      |

### Sizes

| Size   | Height | Padding H  | Font           |
|--------|--------|------------|----------------|
| Small  | 28px   | --space-3  | --text-xs      |
| Medium | 36px   | --space-4  | --text-sm      |
| Large  | 44px   | --space-5  | --text-base    |

---

## COMP.14 — Input

```
ID            COMP.14
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  DSYS.1, DSYS.2, DSYS.5, MOT.8
```

### States

| State     | Border                          | Background              |
|-----------|---------------------------------|-------------------------|
| Default   | `--color-border-default`        | `--color-bg-input`      |
| Hover     | `--color-border-strong`         | `--color-bg-input`      |
| Focus     | `--color-border-focus-neutral`  | `--color-bg-input`      |
| Error     | `--color-error-border`          | `--color-bg-input`      |
| Disabled  | `--color-border-subtle`         | `--color-bg-disabled`   |

---

## COMP.15 — Tooltip

```
ID            COMP.15
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  DSYS.1, DSYS.2, MOT.8.4
```

### Requirements

| ID          | Requirement                                              | Priority |
|-------------|----------------------------------------------------------|----------|
| COMP.15.R1  | Must appear after 500ms hover delay.                    | Required |
| COMP.15.R2  | Must not contain interactive elements.                  | Required |
| COMP.15.R3  | Must be dismissible by moving the pointer away.         | Required |
| COMP.15.R4  | Must appear on keyboard focus for icon-only buttons.    | Required |

### Visual Specification

```
Background: --color-bg-elevated
Border: 1px solid --color-border-subtle
Border radius: --radius-sm
Padding: --space-2 --space-3
Font: --text-xs, --color-text-secondary
Max width: 240px
```

---

## COMP.16 — Badge

```
ID            COMP.16
Status        Approved
Version       1.0
Last Updated  2026-07-15
Dependencies  DSYS.1, DSYS.2, DSYS.5
```

### Variants

| Variant     | Use                                  | Colors                                          |
|-------------|--------------------------------------|-------------------------------------------------|
| Default     | Neutral labels                       | `--color-bg-elevated` bg, `--color-text-tertiary` |
| Temporal    | Era labels, date ranges              | `--color-temporal-bg` bg, `--color-temporal-text` |
| Error       | Error indicators                     | `--color-error-bg` bg, `--color-error`            |
| Success     | Positive status                      | `--color-success-bg` bg, `--color-success`        |

```
Height: 20px
Padding: 0 --space-2
Border radius: --radius-xs
Font: --text-2xs, weight 500, --tracking-wide
```

---

## Revision History

| Version | Date       | Author | Summary                      |
|---------|------------|--------|------------------------------|
| 1.0     | 2026-07-15 | —      | Initial approved version.    |

---

*End of 06 — Component Library*