---
phase: 05-accessibility
plan: 02
subsystem: ui
tags: [vitest-axe, focus-visible, touch-targets, reduced-motion, wcag, a11y, css]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Card component with 3D flip animation and CSS modules
  - phase: 02-containers
    provides: Hand, Deck, CardStack, DropZone container components
  - phase: 03-drag-drop
    provides: DraggableCard component
provides:
  - vitest-axe matchers registered in test-setup.ts for accessibility testing
  - focus-visible keyboard navigation styles on all 6 interactive CSS modules
  - 44x44px touch target expansion on Card component
  - green box-shadow selected card distinction from blue focus outline
  - opacity crossfade reduced motion alternative for card flip animation
affects: [05-accessibility remaining plans, future component development]

# Tech tracking
tech-stack:
  added: [vitest-axe]
  patterns: [focus-visible/focus:not(:focus-visible) CSS pattern, touch target ::before expansion, reduced motion crossfade]

key-files:
  created: []
  modified:
    - src/test-setup.ts
    - src/components/Card/Card.module.css
    - src/components/Hand/Hand.module.css
    - src/components/DraggableCard/DraggableCard.module.css
    - src/components/Deck/Deck.module.css
    - src/components/CardStack/CardStack.module.css
    - src/components/DropZone/DropZone.module.css
    - src/hooks/useCardFlip.ts
    - src/components/Card/Card.tsx

key-decisions:
  - "Browser default outline via :focus-visible for guaranteed keyboard visibility"
  - "Green box-shadow for selected cards, visually distinct from blue focus outline"
  - "Touch target 44x44px via ::before pseudo-element (invisible expansion)"
  - "Static motionValue(0) for rotateY in reduced motion mode (no 3D rotation)"
  - "250ms crossfade duration for reduced motion card flip"

patterns-established:
  - "Focus pattern: :focus-visible { outline: revert } + :focus:not(:focus-visible) { outline: none }"
  - "Touch target pattern: ::before with min-width/min-height 44px centered via translate"
  - "Reduced motion pattern: conditional return of crossfade vs rotation MotionValues"

# Metrics
duration: 8min
completed: 2026-02-04
---

# Phase 5 Plan 2: Focus, Touch, and Reduced Motion Summary

**vitest-axe testing infrastructure, :focus-visible keyboard styles on all 6 CSS modules, 44px touch targets, and opacity crossfade for vestibular-safe card flipping**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-04T07:10:23Z
- **Completed:** 2026-02-04T07:18:17Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Installed vitest-axe and registered `toHaveNoViolations` matcher in test-setup.ts for all future accessibility tests
- Added :focus-visible / :focus:not(:focus-visible) CSS rules to Card, Hand, DraggableCard, Deck, CardStack, and DropZone modules
- Added 44x44px touch target expansion via ::before pseudo-element on Card component
- Replaced filter:brightness selected indicator with green box-shadow for clear focus/selection distinction
- Enhanced useCardFlip with `reducedMotion` option: opacity crossfade (250ms) instead of 3D rotation

## Task Commits

Each task was committed atomically:

1. **Task 1: Install vitest-axe and add CSS focus/touch styles** - `2821b1f` (feat)
2. **Task 2: Enhanced reduced motion for card flip** - `72d25bb` (feat)

## Files Created/Modified
- `src/test-setup.ts` - Added vitest-axe matchers registration
- `src/components/Card/Card.module.css` - Focus-visible styles and 44px touch target expansion
- `src/components/Hand/Hand.module.css` - Focus-visible styles and green box-shadow for selected
- `src/components/DraggableCard/DraggableCard.module.css` - Focus-visible styles
- `src/components/Deck/Deck.module.css` - Focus-visible styles
- `src/components/CardStack/CardStack.module.css` - Focus-visible styles
- `src/components/DropZone/DropZone.module.css` - Focus-visible styles
- `src/hooks/useCardFlip.ts` - Added reducedMotion option with crossfade path
- `src/components/Card/Card.tsx` - Pass reducedMotion prop instead of stiff spring hack

## Decisions Made
- Browser default outline (`outline: revert`) for focus-visible -- guarantees visibility on any background without picking a custom color
- Green box-shadow (rgba(34, 197, 94, 0.6)) for selected cards -- distinct from browser's blue focus ring
- Touch target uses ::before pseudo-element with min-width/min-height 44px -- invisible expansion per WCAG 2.5.8
- Reduced motion uses static motionValue(0) for rotateY rather than useSpring at 0 -- avoids any rotation animation
- 250ms crossfade duration chosen as near-instant but visible enough to communicate the state change
- Removed the stiff spring hack ({ stiffness: 1000, damping: 50 }) from Card.tsx in favor of proper reducedMotion parameter

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- vitest-axe matchers available globally for Plan 01's ARIA attribute tests and future axe audits
- Focus-visible and touch target patterns established for any new interactive components
- Reduced motion crossfade ready for use; all animation hooks respect prefers-reduced-motion

---
*Phase: 05-accessibility*
*Completed: 2026-02-04*
