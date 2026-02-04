---
phase: 03-drag-drop
plan: 02
subsystem: ui
tags: [react, dnd-kit, useDraggable, touch-action, drag-and-drop, memo]

# Dependency graph
requires:
  - phase: 03-01
    provides: DnD types (DragItemData, SensorConfig), hooks (useDragSensors, useHapticFeedback)
  - phase: 01
    provides: Card component, CardProps, parseCard, CardData types
provides:
  - DraggableCard component wrapping Card with useDraggable hook
  - DraggableCardProps type
  - Touch-action CSS for iOS Safari drag support
  - Opacity-based drag source hiding (for DragOverlay pattern)
affects: [03-03, 03-04, 03-05, 04, 05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useDraggable wrapper component pattern (DraggableCard wraps Card)"
    - "CSS.Translate.toString for inline transform from dnd-kit"
    - "React.memo on draggable components for performance"
    - "opacity:0 source hiding while DragOverlay shows clone"

key-files:
  created:
    - src/components/DraggableCard/DraggableCard.tsx
    - src/components/DraggableCard/DraggableCard.types.ts
    - src/components/DraggableCard/DraggableCard.module.css
    - src/components/DraggableCard/DraggableCard.test.tsx
    - src/components/DraggableCard/index.ts
  modified:
    - src/components/index.ts
    - src/index.ts

key-decisions:
  - "Omit<CardProps, 'card'> pattern for clean extension without conflict"
  - "Mock useDraggable in tests since jsdom has no getBoundingClientRect"
  - "data-testid format: draggable-card-{id} for targeted test queries"

patterns-established:
  - "Draggable wrapper: outer div with ref/attributes/listeners, inner component for rendering"
  - "CSS module class concatenation with filter(Boolean).join(' ') for conditional classes"

# Metrics
duration: 5min
completed: 2026-02-03
---

# Phase 3 Plan 2: DraggableCard Component Summary

**DraggableCard wraps Card with dnd-kit useDraggable, touch-action CSS, opacity-based drag hiding, and React.memo for performance**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-03T23:08:32Z
- **Completed:** 2026-02-03T23:14:06Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- DraggableCard component with useDraggable hook, CSS.Translate transform, touch-action: none for iOS Safari
- Source card hidden via opacity:0 during drag (DragOverlay shows the visible clone)
- disabled prop and sourceZoneId in drag data payload for drop validation
- 9 tests covering rendering, CSS classes, drag states, transform, prop passthrough, and React.memo
- All 250 tests pass with zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Create DraggableCard component with useDraggable integration** - `325b819` (feat)
2. **Task 2: Create DraggableCard tests** - `103f1b7` (test)

## Files Created/Modified
- `src/components/DraggableCard/DraggableCard.tsx` - Main component with useDraggable hook integration
- `src/components/DraggableCard/DraggableCard.types.ts` - DraggableCardProps extending CardProps with dnd identity
- `src/components/DraggableCard/DraggableCard.module.css` - touch-action, cursor, and opacity styles
- `src/components/DraggableCard/DraggableCard.test.tsx` - 9 unit tests with mocked useDraggable
- `src/components/DraggableCard/index.ts` - Barrel exports
- `src/components/index.ts` - Added Phase 3 DraggableCard export
- `src/index.ts` - Added DraggableCard and DraggableCardProps to public API

## Decisions Made
- Used `Omit<CardProps, 'card'>` pattern to cleanly extend CardProps without type conflict on `card` field
- Mocked `useDraggable` in tests rather than simulating full drag (jsdom limitation with getBoundingClientRect)
- Used `data-testid="draggable-card-{id}"` format to avoid conflicts with inner Card's role/aria attributes

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed duplicate role="button" causing test failure**
- **Found during:** Task 2 (test creation)
- **Issue:** Both the wrapper div (from dnd-kit attributes) and inner Card have `role="button"`, causing `getByRole` to fail with multiple matches
- **Fix:** Changed test to use `getAllByRole` with `toBeGreaterThanOrEqual(1)` assertion
- **Files modified:** src/components/DraggableCard/DraggableCard.test.tsx
- **Verification:** All 9 tests pass
- **Committed in:** 103f1b7 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Test query adaptation for dnd-kit attribute spreading. No scope creep.

## Issues Encountered
- `window.matchMedia` not available in jsdom - resolved by adding matchMedia mock (standard pattern used across all component tests in this project)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- DraggableCard ready for use in CardDndProvider context
- DroppableZone (03-03) and CardDndProvider (03-04) can now integrate with DraggableCard
- DragOverlay component will pair with DraggableCard's opacity:0 pattern

---
*Phase: 03-drag-drop*
*Completed: 2026-02-03*
