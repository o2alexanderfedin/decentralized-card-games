---
phase: 02-container-components-layouts
plan: 03
subsystem: ui
tags: [deck, card-stack, drop-zone, container-components, react, forwardRef, CSS-modules]

# Dependency graph
requires:
  - phase: 01-foundation-core-rendering
    provides: "Card component, CardData type, parseCard/formatCard functions"
  - phase: 02-container-components-layouts
    plan: 01
    provides: "CardLayout interface, CardInput type, normalizeCard helper, calculateStackLayout, layout constants"
provides:
  - "Deck component with draw action, empty states, and count badge"
  - "CardStack component with cascade layout and face-up modes"
  - "DropZone visual container with idle/active/hover states"
affects:
  - 02-container-components-layouts (plan 04 barrel exports will re-export these)
  - 03-drag-and-drop (DropZone will integrate DnD context)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "forwardRef + useImperativeHandle for Deck ref API"
    - "calculateStackLayout integration in CardStack"
    - "Visual state CSS classes driven by prop (future DnD context)"
    - "Children.count for empty state detection in DropZone"

key-files:
  created:
    - src/components/Deck/Deck.tsx
    - src/components/Deck/Deck.types.ts
    - src/components/Deck/Deck.module.css
    - src/components/Deck/Deck.test.tsx
    - src/components/Deck/index.ts
    - src/components/CardStack/CardStack.tsx
    - src/components/CardStack/CardStack.types.ts
    - src/components/CardStack/CardStack.module.css
    - src/components/CardStack/CardStack.test.tsx
    - src/components/CardStack/index.ts
    - src/components/DropZone/DropZone.tsx
    - src/components/DropZone/DropZone.types.ts
    - src/components/DropZone/DropZone.module.css
    - src/components/DropZone/DropZone.test.tsx
    - src/components/DropZone/index.ts
  modified: []

key-decisions:
  - "Deck renders up to 5 visual layers for stack depth effect regardless of actual count"
  - "Deck uses simple onClick on container (not individual card layers) for draw action"
  - "CardStack uses 'top-only' as default faceUp mode (most common use case)"
  - "DropZone onDrop fires on click as simple placeholder for Phase 3 DnD integration"
  - "DropZone visual states controlled via prop (will be driven by DnD context in Phase 3)"

patterns-established:
  - "Container empty state pattern: 'none' | 'placeholder' | ReactNode"
  - "data-testid conventions: deck, deck-card-layer, deck-count-badge, card-stack, card-stack-slot, drop-zone, dropzone-placeholder"

# Metrics
duration: 5min
completed: 2026-02-03
---

# Phase 2 Plan 3: Deck, CardStack & DropZone Summary

**Deck with draw action and count badge, CardStack with cascade layout, DropZone with visual states for future DnD**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-03T10:47:21Z
- **Completed:** 2026-02-03T10:52:00Z
- **Tasks:** 2
- **Files created:** 15

## Accomplishments
- Deck component with face-down card stack rendering (up to 5 layers), onDraw event, 3 empty state modes, count badge, and drawCard() ref API
- CardStack component with diagonal cascade offset using calculateStackLayout, three face-up modes (true/false/top-only), and top card click handler
- DropZone visual container with idle/active/hover state styling and empty state options (placeholder with label, none, custom ReactNode)
- 33 new tests (14 Deck + 9 CardStack + 10 DropZone) -- all 201 total tests passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Deck component with draw action and empty states** - `8891bd4` (feat)
2. **Task 2: Create CardStack and DropZone components** - `c000725` (feat)

## Files Created/Modified
- `src/components/Deck/Deck.tsx` - Deck container with face-down card stack, draw action, empty states
- `src/components/Deck/Deck.types.ts` - DeckProps, DeckRef, DeckEmptyState types
- `src/components/Deck/Deck.module.css` - Deck styles with cardLayer, placeholder, countBadge
- `src/components/Deck/Deck.test.tsx` - 14 tests for layers, draw, empty states, badge, ref API
- `src/components/Deck/index.ts` - Barrel export
- `src/components/CardStack/CardStack.tsx` - CardStack with cascade layout using calculateStackLayout
- `src/components/CardStack/CardStack.types.ts` - CardStackProps, FaceUpMode types
- `src/components/CardStack/CardStack.module.css` - Stack and cardSlot styles
- `src/components/CardStack/CardStack.test.tsx` - 9 tests for rendering, face-up modes, click, className
- `src/components/CardStack/index.ts` - Barrel export
- `src/components/DropZone/DropZone.tsx` - DropZone visual container with state styling
- `src/components/DropZone/DropZone.types.ts` - DropZoneProps, DropZoneEmptyState, DropZoneVisualState types
- `src/components/DropZone/DropZone.module.css` - Drop zone styles with idle/active/hover states
- `src/components/DropZone/DropZone.test.tsx` - 10 tests for empty states, children, visual states, onDrop
- `src/components/DropZone/index.ts` - Barrel export

## Decisions Made
- Deck renders a maximum of 5 visual card layers for the stacking depth effect, regardless of actual count -- no need to render 52 Card components
- Deck uses a single onClick handler on the container div rather than on individual card layers for simplicity
- CardStack defaults to `'top-only'` face-up mode, which is the most common discard/played pile pattern
- DropZone's `onDrop` fires on simple click in Phase 2 as a placeholder; Phase 3 will replace with actual DnD context integration
- DropZone visual states (idle/active/hover) are controlled via prop; Phase 3 will drive them from DnD library state

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All three container components ready for barrel export in plan 02-04
- DropZone ready for Phase 3 DnD integration (visual states already support active/hover)
- Full test suite green (201 tests) with no regressions

---
*Phase: 02-container-components-layouts*
*Completed: 2026-02-03*
