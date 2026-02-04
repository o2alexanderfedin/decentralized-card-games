# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-02)

**Core value:** Developers can drop in fully interactive card components without building card UI from scratch
**Current focus:** Phase 3 - Drag & Drop (Complete)

## Current Position

Phase: 3 of 6 (Drag & Drop)
Plan: 5 of 5 in current phase
Status: Phase complete
Last activity: 2026-02-03 - Completed 03-05-PLAN.md

Progress: [#############] 13/13 plans (100%)

## Performance Metrics

**Velocity:**
- Total plans completed: 13
- Average duration: 7 min
- Total execution time: 95 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Foundation | 4/4 | 48 min | 12 min |
| 2 - Containers | 4/4 | 24 min | 6 min |
| 3 - Drag & Drop | 5/5 | 23 min | 5 min |

**Recent Trend:**
- Last 5 plans: 03-01 (4 min), 03-02 (4 min), 03-03 (5 min), 03-04 (5 min), 03-05 (5 min)
- Trend: Consistent fast execution; Phase 3 completed at 5 min/plan average

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
- Card dimensions in Hand: clamp(60, containerWidth/(count+4), 120) with 1.4x aspect ratio
- AnimatePresence key uses formatCard(card) for stable identity across reorders
- Selected card y-offset of -15px via motion animate prop
- Motion/react test mock: importOriginal + override motion.div and AnimatePresence
- Deck renders max 5 visual layers for stack depth effect
- CardStack defaults to 'top-only' face-up mode
- DropZone visual states controlled via prop (future DnD context integration)
- Container empty state pattern: 'none' | 'placeholder' | ReactNode
- Named exports in src/index.ts for explicit public API surface
- Wildcard re-exports in src/components/index.ts for internal convenience
- Separate MouseSensor + TouchSensor instead of PointerSensor for iOS Safari scroll prevention
- @dnd-kit/modifiers installed at 9.0.0 (latest available)
- useHapticFeedback uses useMemo keyed on enabled+isSupported for referential stability
- CardDndProviderProps extends DragLifecycleCallbacks via interface extension
- DragOverlay always mounted, children conditionally rendered (dnd-kit pitfall 4)
- Wrapper div for useDroppable ref to avoid modifying Phase 2 DropZone
- Multi-card stack shows max 3 visual cards with +N badge
- DroppableZone supports both accepts array and onValidate callback
- Component-level CardDndProviderProps uses simplified card callbacks (card, zoneId) not raw dnd-kit events
- Drop validation checks zone data.onValidate first, falls back to data.accepts array
- activeCard state managed internally; consumer never touches DndContext directly
- Barrel exports expanded to include all Phase 3 DnD components, hooks, and types
- ReactNode over JSX.Element for return type annotations in TSX layout files

### Pending Todos

None.

### Blockers/Concerns

None. (Pre-existing JSX namespace TypeScript errors resolved in 03-05.)

## Session Continuity

Last session: 2026-02-03T23:28:00Z
Stopped at: Completed 03-05-PLAN.md (Phase 3 complete)
Resume file: None
