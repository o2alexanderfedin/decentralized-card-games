# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-02)

**Core value:** Developers can drop in fully interactive card components without building card UI from scratch
**Current focus:** Phase 2 - Container Components & Layouts (In progress)

## Current Position

Phase: 2 of 6 (Container Components & Layouts)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-02-03 - Completed 02-01-PLAN.md

Progress: [#####.....] 5/10 plans (50%)

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 10 min
- Total execution time: 53 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Foundation | 4/4 | 48 min | 12 min |
| 2 - Containers | 1/3 | 5 min | 5 min |

**Recent Trend:**
- Last 5 plans: 01-01 (4 min), 01-03 (8 min), 01-02 (11 min), 01-04 (25 min), 02-01 (5 min)
- Trend: fast for pure utility plans, slower for component integration

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Const assertion pattern for Suit/Rank types (typeof arr[number])
- parseCard supports both emoji and text notation
- React as peer dependency (not bundled)
- Vitest 3.x (4.x not yet available)
- vite-plugin-dts for library .d.ts generation
- Reuse ColorScheme from constants rather than redefining in component types
- Display rank T as "10" in rendered output
- Inline style for suit colors using getSuitColor utility
- CSS module type declarations at src/css-modules.d.ts
- useSpring (not useMotionValue) for automatic spring-animated transitions
- 4-point opacity transform [0,89,90,180] for sharp crossover at 90 degrees
- useMotionValueEvent for animation lifecycle tracking
- Custom usePrefersReducedMotion independent of Motion library
- CSS grid (3-col x 5-row) for pip layouts matching traditional card arrangements
- Number cards (2-10) show pip grids; face cards and Ace show single large symbol
- Bottom-half pips rotated 180deg for visual symmetry
- forwardRef + useImperativeHandle for uncontrolled component ref API
- Fan angle scaling: count<=3 uses count/5, count>3 uses sqrt(count/7)
- Spread spacing clamps to minOverlap when container is too narrow
- useContainerSize rounds via Math.round with functional updater for identity preservation
- Hook tests use component render approach rather than useRef spy

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-03T10:45:06Z
Stopped at: Completed 02-01-PLAN.md (layout utilities, container types, useContainerSize hook)
Resume file: None
