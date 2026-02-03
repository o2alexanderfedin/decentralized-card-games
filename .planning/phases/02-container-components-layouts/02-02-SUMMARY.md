---
phase: 02-container-components-layouts
plan: 02
subsystem: ui
tags: [react, hand, container, fan-layout, spread-layout, stack-layout, selection, AnimatePresence, forwardRef, motion]

# Dependency graph
requires:
  - phase: 01-foundation-core-rendering
    provides: "Card component, CardData type, parseCard/formatCard, hooks pattern"
  - phase: 02-container-components-layouts
    plan: 01
    provides: "calculateFanLayout, calculateSpreadLayout, calculateStackLayout, useContainerSize, CardInput, normalizeCard"
provides:
  - "Hand container component with fan/spread/stack layouts"
  - "HandProps and HandRef type interfaces"
  - "Controlled and uncontrolled card selection pattern"
  - "AnimatePresence enter/exit card animations"
affects:
  - 02-container-components-layouts (plans 03, 04 may reference Hand pattern)
  - 03-interaction-system (drag/drop on Hand)
  - 04-game-state-logic (Hand state management)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Container component: forwardRef + useImperativeHandle + useContainerSize"
    - "Controlled/uncontrolled selection via optional selectedCards prop detection"
    - "AnimatePresence with formatCard(card) keys for stable identity"
    - "Partial motion/react mock with importOriginal for tests involving nested Card components"

key-files:
  created:
    - src/components/Hand/Hand.tsx
    - src/components/Hand/Hand.types.ts
    - src/components/Hand/Hand.module.css
    - src/components/Hand/Hand.test.tsx
    - src/components/Hand/index.ts
  modified: []

key-decisions:
  - "Card dimensions derived from container width: cardWidth = clamp(60, containerWidth/(count+4), 120), cardHeight = cardWidth * 1.4"
  - "AnimatePresence key uses formatCard(card) for stable identity across reorders"
  - "Selected card y-offset of -15px applied via motion animate prop"
  - "Motion mock uses importOriginal to preserve useSpring/useTransform for nested Card component"
  - "Placeholder Hand.tsx stub for barrel export resolution before full implementation"

patterns-established:
  - "Container component pattern: forwardRef + useContainerSize + layout calculation + AnimatePresence"
  - "Test mock for motion/react: importOriginal + override motion.div and AnimatePresence"
  - "Selection pattern: isControlled detection via undefined check on selectedCards prop"

# Metrics
duration: 4min
completed: 2026-02-03
---

# Phase 2 Plan 2: Hand Component Summary

**Hand container with fan/spread/stack layouts, controlled/uncontrolled selection, AnimatePresence card animations, and imperative ref API**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-03T10:47:21Z
- **Completed:** 2026-02-03T10:51:46Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Hand component renders cards in fan (default), spread, or stack arrangements using layout utilities from 02-01
- Controlled and uncontrolled card selection with toggle via click and ref API
- AnimatePresence for smooth card enter/exit animations (fade + scale + spring)
- Hover effects (lift/highlight/none) gated behind @media(hover:hover)
- 22 new tests covering rendering, selection, ref API, hover effects, and edge cases -- 191 total tests passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Hand component types and styles** - `96fdaa4` (feat)
2. **Task 2: Implement Hand component with layout integration and AnimatePresence** - `9786be9` (feat)

**Plan metadata:** (below)

## Files Created/Modified
- `src/components/Hand/Hand.tsx` - Hand container component with layout integration, selection, animations
- `src/components/Hand/Hand.types.ts` - HandProps, HandRef, HandLayout, HoverEffect type definitions
- `src/components/Hand/Hand.module.css` - CSS module with isolation, hover effects, empty state
- `src/components/Hand/Hand.test.tsx` - 22 tests for rendering, selection, ref API, edge cases
- `src/components/Hand/index.ts` - Barrel export for Hand module

## Decisions Made
- Card dimensions derived from container width using formula `clamp(60, containerWidth/(count+4), 120)` for cardWidth with 1.4x aspect ratio for height -- balances readability and fit
- AnimatePresence key uses `formatCard(card)` (emoji notation like "sA") instead of array index per RESEARCH.md pitfall 4 guidance for stable identity across reorders
- Selected cards shift upward by 15px via motion `animate.y` offset rather than CSS transform to avoid conflicting with position transforms
- Test mock for `motion/react` uses `importOriginal` to preserve `useSpring`, `useTransform`, and `useMotionValueEvent` needed by nested Card component's `useCardFlip` hook, while replacing `motion.div` and `AnimatePresence` with simple DOM elements

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created placeholder Hand.tsx for barrel export resolution**
- **Found during:** Task 1 (types and styles)
- **Issue:** Barrel `index.ts` exports from `./Hand` which doesn't exist yet, causing tsc to fail
- **Fix:** Created minimal placeholder Hand.tsx with forwardRef skeleton; replaced with full implementation in Task 2
- **Files modified:** src/components/Hand/Hand.tsx
- **Verification:** `npx tsc --noEmit` passes after placeholder
- **Committed in:** 96fdaa4 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minimal -- placeholder was necessary for tsc pass and was immediately replaced in Task 2.

## Issues Encountered
- Initial `vi.mock('motion/react')` mock didn't include `useSpring` export, causing "No useSpring export" error from nested Card component's `useCardFlip` hook -- resolved by using `importOriginal` pattern to preserve real motion hooks while mocking visual components

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Hand component ready for use by Deck, CardStack, and DropZone components in plans 02-03 and 02-04
- Pattern established for container components: forwardRef + useContainerSize + layout calc + AnimatePresence
- Test mock pattern established for motion/react with nested animated components
- Full test suite green (191 tests) with no regressions

---
*Phase: 02-container-components-layouts*
*Completed: 2026-02-03*
