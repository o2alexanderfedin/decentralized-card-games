---
phase: 02-container-components-layouts
plan: 01
subsystem: ui
tags: [layout, react, hooks, ResizeObserver, pure-functions, fan, spread, stack]

# Dependency graph
requires:
  - phase: 01-foundation-core-rendering
    provides: "CardData type, parseCard function, hooks pattern, barrel exports"
provides:
  - "CardLayout interface for card positioning"
  - "CardInput type and normalizeCard helper"
  - "calculateFanLayout, calculateSpreadLayout, calculateStackLayout pure functions"
  - "FAN_PRESETS and LAYOUT_DEFAULTS constants"
  - "useContainerSize hook for responsive container measurement"
affects:
  - 02-container-components-layouts (plans 02, 03, 04 consume these utilities)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pure layout calculation functions (no React, no side effects)"
    - "ResizeObserver-based hook with rounded dimensions to prevent jitter"
    - "Functional state updater for identity preservation"

key-files:
  created:
    - src/types/containers.ts
    - src/constants/layouts.ts
    - src/utils/layout.ts
    - src/utils/layout.test.ts
    - src/utils/index.ts
    - src/hooks/useContainerSize.ts
    - src/hooks/useContainerSize.test.tsx
  modified:
    - src/types/index.ts
    - src/constants/index.ts
    - src/hooks/index.ts

key-decisions:
  - "Fan angle scaling: count<=3 uses count/5, count>3 uses sqrt(count/7) for gentle growth"
  - "Spread spacing clamps to minOverlap when container is too narrow"
  - "useContainerSize rounds via Math.round and uses functional updater to preserve state identity"
  - "Hook test uses component render + screen queries instead of useRef spy (more reliable)"

patterns-established:
  - "Pure layout functions: stateless, side-effect free, return CardLayout[]"
  - "Layout options with sensible defaults from LAYOUT_DEFAULTS constant"
  - "Test file named .test.tsx when JSX is required (component-based hook tests)"

# Metrics
duration: 5min
completed: 2026-02-03
---

# Phase 2 Plan 1: Layout Utilities Summary

**Pure fan/spread/stack layout calculations, container types, layout constants, and ResizeObserver-based useContainerSize hook**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-03T10:40:06Z
- **Completed:** 2026-02-03T10:45:06Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments
- Three pure layout calculation functions (fan, spread, stack) with configurable presets
- CardLayout interface, CardInput type, and normalizeCard helper for container components
- FAN_PRESETS and LAYOUT_DEFAULTS constants with subtle/standard/dramatic fan presets
- useContainerSize hook using ResizeObserver with rounding to prevent sub-pixel jitter
- 38 new tests (32 layout + 6 hook) -- all 146 total tests passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Create container types, layout constants, and layout utility functions** - `35c182a` (feat)
2. **Task 2: Create useContainerSize hook** - `7c6ad81` (feat)
3. **Task 3: Write comprehensive layout utility tests** - `a24f97b` (test)

**Plan metadata:** (below)

## Files Created/Modified
- `src/types/containers.ts` - CardInput type, CardLayout interface, normalizeCard helper
- `src/constants/layouts.ts` - FanPreset type, FAN_PRESETS, LAYOUT_DEFAULTS
- `src/utils/layout.ts` - calculateFanLayout, calculateSpreadLayout, calculateStackLayout
- `src/utils/layout.test.ts` - 32 comprehensive tests for all layout functions
- `src/utils/index.ts` - New barrel for utils module
- `src/hooks/useContainerSize.ts` - ResizeObserver-based container measurement hook
- `src/hooks/useContainerSize.test.tsx` - 6 tests for hook behavior
- `src/types/index.ts` - Added container type exports
- `src/constants/index.ts` - Added layout constant exports
- `src/hooks/index.ts` - Added useContainerSize export

## Decisions Made
- Fan angle scaling uses `count/5` for 2-3 cards and `sqrt(count/7)` for 4+ cards to avoid extreme spread with few cards while providing gentle growth for many
- Spread layout clamps spacing to `minOverlap` when container is too narrow, preventing cards from being hidden
- useContainerSize rounds dimensions via `Math.round()` and uses a functional state updater that returns the previous reference when values are unchanged, preventing infinite render loops
- Hook tests use a component-based rendering approach with `screen.getByTestId` rather than `useRef` spy, which is more reliable with React internals

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Hook test file initially used `.ts` extension, which doesn't support JSX -- renamed to `.tsx`
- Initial `renderHook` + `useRef` spy approach for hook testing didn't work reliably with React's internal hook ordering -- switched to component-based render approach with `screen` queries

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All layout utilities ready for Hand, Deck, and CardStack components in plans 02-02 through 02-04
- useContainerSize hook ready for responsive container components
- Full test suite green (146 tests) with no regressions

---
*Phase: 02-container-components-layouts*
*Completed: 2026-02-03*
