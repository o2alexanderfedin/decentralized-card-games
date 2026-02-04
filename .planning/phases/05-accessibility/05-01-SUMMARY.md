---
phase: 05-accessibility
plan: 01
subsystem: ui
tags: [a11y, aria, keyboard-navigation, screen-reader, roving-tabindex, react-hooks]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: CardData, Rank, Suit types from src/types/card.ts
provides:
  - RANK_NAMES and SUIT_NAMES maps for human-readable card names
  - formatCardForSpeech for natural language card identity
  - formatCardLabel for full positional context labels
  - formatFaceDownLabel for game-secret-preserving labels
  - useRovingTabIndex hook for composite widget navigation
  - useKeyboardShortcuts hook for game-level shortcut registry
affects: [05-03, 05-04, 05-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "WAI-ARIA roving tabindex for composite widget keyboard navigation"
    - "Document-level keyboard shortcut registry with guard conditions"
    - "Face-down card label pattern preserving game secrecy"

key-files:
  created:
    - src/utils/a11y.ts
    - src/utils/a11y.test.ts
    - src/hooks/useRovingTabIndex.ts
    - src/hooks/useRovingTabIndex.test.ts
    - src/hooks/useKeyboardShortcuts.ts
    - src/hooks/useKeyboardShortcuts.test.ts
  modified:
    - src/utils/index.ts
    - src/hooks/index.ts

key-decisions:
  - "contentEditable check uses target.contentEditable === 'true' for jsdom compatibility"
  - "useRovingTabIndex does not manage DOM focus directly -- consuming component calls .focus()"
  - "formatFaceDownLabel has no CardData parameter to prevent accidental identity leaks"

patterns-established:
  - "Roving tabindex: one Tab stop per container, arrow keys navigate within"
  - "Keyboard shortcut guard: suppress in INPUT/TEXTAREA/contentEditable and with modifier keys"
  - "Card speech: RANK_NAMES[rank] + ' of ' + SUIT_NAMES[suit] for natural language"

# Metrics
duration: 5min
completed: 2026-02-04
---

# Phase 5 Plan 1: Accessibility Foundation Summary

**Card speech formatters (RANK_NAMES/SUIT_NAMES maps, formatCardForSpeech/Label/FaceDown), useRovingTabIndex for Arrow/Home/End navigation, useKeyboardShortcuts with modifier and input-field guards**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-04T07:10:13Z
- **Completed:** 2026-02-04T07:15:53Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Card announcement text builders covering all 13 ranks and 4 suits with natural language output
- Face-down card labels that never reveal card identity (no CardData parameter)
- Roving tabindex hook with wrapping arrow navigation, Home/End jumps, and itemCount boundary reset
- Keyboard shortcuts hook with case-insensitive matching, modifier suppression, input field suppression, and per-shortcut enabled flag
- 53 tests total with full coverage across all modules

## Task Commits

Each task was committed atomically:

1. **Task 1: A11Y utility functions** - `5b1f7c0` (feat)
2. **Task 2: Roving tabindex and keyboard shortcuts hooks** - `94b05a4` (feat)

## Files Created/Modified
- `src/utils/a11y.ts` - Card announcement text builders, RANK_NAMES and SUIT_NAMES maps
- `src/utils/a11y.test.ts` - 25 tests for all a11y utility functions
- `src/utils/index.ts` - Re-exports a11y module
- `src/hooks/useRovingTabIndex.ts` - Roving tabindex hook for composite widget navigation
- `src/hooks/useRovingTabIndex.test.ts` - 14 tests for roving tabindex hook
- `src/hooks/useKeyboardShortcuts.ts` - Game-level keyboard shortcut registry
- `src/hooks/useKeyboardShortcuts.test.ts` - 14 tests for keyboard shortcuts hook
- `src/hooks/index.ts` - Re-exports both new hooks and their types

## Decisions Made
- `contentEditable` detection uses `target.contentEditable === 'true'` property check instead of `target.isContentEditable` or `getAttribute('contenteditable')` for jsdom compatibility (jsdom does not implement `isContentEditable` getter or reflect `contentEditable` as an attribute)
- `useRovingTabIndex` does not manage DOM focus directly; the consuming component is responsible for calling `.focus()` on the element at the new activeIndex, keeping the hook reusable across different component structures
- `formatFaceDownLabel` intentionally has no `CardData` parameter, making it impossible to accidentally leak card identity through screen reader labels

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] jsdom contentEditable compatibility**
- **Found during:** Task 2 (useKeyboardShortcuts)
- **Issue:** jsdom does not implement `HTMLElement.isContentEditable` getter (returns `undefined`), and `getAttribute('contenteditable')` returns `null` when set via property. Additionally, `document` as event target does not have `getAttribute`, causing TypeError.
- **Fix:** Use `target.contentEditable === 'true'` property check which works in both jsdom and real browsers
- **Files modified:** src/hooks/useKeyboardShortcuts.ts
- **Verification:** All 14 keyboard shortcuts tests pass including contentEditable suppression
- **Committed in:** 94b05a4 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary for correct contentEditable detection across environments. No scope creep.

## Issues Encountered
None beyond the jsdom compatibility issue documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three foundation modules ready for Plans 03-05 to consume
- `formatCardForSpeech` and `formatCardLabel` ready for DnD announcements (Plan 04) and component ARIA labels (Plan 03)
- `useRovingTabIndex` ready for Hand and CardStack keyboard navigation (Plan 03)
- `useKeyboardShortcuts` ready for game-level shortcut registration (Plan 05)
- No blockers or concerns

---
*Phase: 05-accessibility*
*Completed: 2026-02-04*
