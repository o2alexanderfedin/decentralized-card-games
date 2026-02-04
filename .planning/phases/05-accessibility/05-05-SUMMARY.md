---
phase: 05-accessibility
plan: 05
subsystem: testing
tags: [vitest-axe, axe-core, a11y, keyboard-navigation, aria, barrel-exports]

# Dependency graph
requires:
  - phase: 05-accessibility/05-01
    provides: useRovingTabIndex, useKeyboardShortcuts hooks
  - phase: 05-accessibility/05-02
    provides: Card ARIA labels, keyboard activation, formatCardForSpeech
  - phase: 05-accessibility/05-03
    provides: Hand listbox role, roving tabindex integration
  - phase: 05-accessibility/05-04
    provides: DnD ARIA announcements, DraggableCard aria-roledescription
provides:
  - axe-core accessibility scans for all components
  - Keyboard interaction tests for Card, Hand, Deck
  - Public barrel exports for all Phase 5 hooks and utilities
  - Fix for nested-interactive violations via Card interactive prop
affects: [06-polish, consumers]

# Tech tracking
tech-stack:
  added: [@testing-library/user-event]
  patterns: [vitest-axe scan per component, Card interactive prop for nesting]

key-files:
  created: []
  modified:
    - src/components/Card/Card.test.tsx
    - src/components/Hand/Hand.test.tsx
    - src/components/Deck/Deck.test.tsx
    - src/components/CardStack/CardStack.test.tsx
    - src/components/DropZone/DropZone.test.tsx
    - src/components/DraggableCard/DraggableCard.test.tsx
    - src/components/Card/Card.tsx
    - src/components/Card/Card.types.ts
    - src/components/Hand/Hand.tsx
    - src/components/Deck/Deck.tsx
    - src/components/DraggableCard/DraggableCard.tsx
    - src/index.ts

key-decisions:
  - "Card interactive prop suppresses role/tabIndex when nested inside interactive containers"
  - "@testing-library/user-event for realistic keyboard simulation in Hand/Deck tests"

patterns-established:
  - "axe scan pattern: render component, run axe(container), expect toHaveNoViolations"
  - "Card interactive={false} in DraggableCard, Hand, Deck to prevent nested-interactive violations"

# Metrics
duration: 17min
completed: 2026-02-04
---

# Phase 5 Plan 5: Accessibility Tests & Barrel Exports Summary

**vitest-axe scans for all 6 components with zero violations, keyboard interaction tests, and Phase 5 barrel exports**

## Performance

- **Duration:** 17 min
- **Started:** 2026-02-04T07:31:06Z
- **Completed:** 2026-02-04T07:47:59Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- All 6 component test files have axe-core scans passing with zero violations
- Keyboard navigation verified: roving tabindex in Hand, Enter/Space in Card and Deck
- ARIA roles verified: listbox/option in Hand, group in CardStack, region in DropZone
- Fixed nested-interactive violations via new Card `interactive` prop
- All Phase 5 hooks and utilities exported from barrel (useRovingTabIndex, useKeyboardShortcuts, formatCardForSpeech, formatCardLabel, formatFaceDownLabel, RANK_NAMES, SUIT_NAMES)
- Full test suite: 435 tests across 31 files, all green

## Task Commits

Each task was committed atomically:

1. **Task 1: Accessibility tests for all components** - `591d8ef` (test)
2. **Task 2: Barrel exports for Phase 5 additions** - `9ce203d` (feat)

## Files Created/Modified
- `src/components/Card/Card.test.tsx` - Added axe scans for face-up and face-down states
- `src/components/Hand/Hand.test.tsx` - Added axe scan, listbox role, roving tabindex, keyboard selection tests
- `src/components/Deck/Deck.test.tsx` - Added axe scans, Enter/Space keyboard draw tests
- `src/components/CardStack/CardStack.test.tsx` - Added axe scan, group role verification
- `src/components/DropZone/DropZone.test.tsx` - Added axe scan, region role, aria-label verification
- `src/components/DraggableCard/DraggableCard.test.tsx` - Added axe scan
- `src/components/Card/Card.tsx` - Added interactive prop to control role/tabIndex
- `src/components/Card/Card.types.ts` - Added interactive prop definition
- `src/components/Hand/Hand.tsx` - Pass interactive={false} to inner Card
- `src/components/Deck/Deck.tsx` - Pass interactive={false} to inner Card
- `src/components/DraggableCard/DraggableCard.tsx` - Pass interactive={false} to inner Card
- `src/index.ts` - Added Phase 5 barrel exports

## Decisions Made
- **Card interactive prop:** Added `interactive` boolean prop (default true) that suppresses `role="button"`, `tabIndex={0}`, and `aria-label` when false. This cleanly solves the nested-interactive axe violation when Card is rendered inside DraggableCard (role="button"), Hand (role="option"), or Deck (role="button"). Inner Card gets `tabIndex={-1}`, `aria-hidden={true}`, and no role.
- **@testing-library/user-event:** Installed for realistic keyboard event simulation (userEvent.keyboard) in Hand roving tabindex and Deck draw tests.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed nested-interactive accessibility violation**
- **Found during:** Task 1 (Accessibility tests)
- **Issue:** axe-core flagged nested-interactive violations in DraggableCard, Hand, and Deck. The wrapper elements (role="button" or role="option") contained Card elements that also had role="button" and tabIndex=0, creating focusable descendants inside interactive controls.
- **Fix:** Added `interactive` prop to Card component. When false, suppresses role, tabIndex, and aria-label. Updated DraggableCard, Hand, and Deck to pass `interactive={false}` to their inner Card components.
- **Files modified:** Card.tsx, Card.types.ts, DraggableCard.tsx, Hand.tsx, Deck.tsx
- **Verification:** All 6 component axe scans pass with zero violations
- **Committed in:** 591d8ef (Task 1 commit)

**2. [Rule 3 - Blocking] Installed @testing-library/user-event**
- **Found during:** Task 1 (Accessibility tests)
- **Issue:** Hand and Deck keyboard tests required `userEvent` from `@testing-library/user-event`, which was not installed.
- **Fix:** Installed `@testing-library/user-event` as dev dependency.
- **Files modified:** package.json, package-lock.json
- **Verification:** Import resolves, keyboard tests pass
- **Committed in:** 591d8ef (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both auto-fixes essential for accessibility correctness and test execution. No scope creep.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 5 (Accessibility) is now complete across all 5 plans
- All components have ARIA attributes, keyboard navigation, and axe-validated accessibility
- Full public API exported for consumers
- Ready for Phase 6 (Polish/E2E) or production use

---
*Phase: 05-accessibility*
*Completed: 2026-02-04*
