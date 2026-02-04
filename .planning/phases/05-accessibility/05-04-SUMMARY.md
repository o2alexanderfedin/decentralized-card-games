---
phase: 05-accessibility
plan: 04
subsystem: dnd
tags: [a11y, screen-reader, announcements, aria, dnd-kit, drag-and-drop]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: CardData types from src/types/card.ts
  - phase: 03-drag-and-drop
    provides: CardDndProvider, DraggableCard, DragItemData
  - phase: 05-accessibility
    plan: 01
    provides: formatCardForSpeech, a11y utilities from src/utils/a11y.ts
provides:
  - Card-aware DnD screen reader announcements
  - Enhanced ARIA attributes on DraggableCard
  - Screen reader instructions for keyboard DnD
affects:
  - phase: 05-accessibility
    plan: 05
    impact: DnD a11y complete; final plan can verify full accessibility

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "dnd-kit accessibility prop for custom announcements"
    - "aria-roledescription for semantic drag context"
    - "aria-hidden on source element during drag overlay"

# File tracking
key-files:
  modified:
    - src/components/CardDndProvider/CardDndProvider.tsx
    - src/components/DraggableCard/DraggableCard.tsx
    - src/components/DraggableCard/DraggableCard.test.tsx
  created: []

# Decisions
decisions:
  - id: "05-04-01"
    decision: "Static announcement constants outside component (not memoized inside)"
    reason: "Announcements reference no component state; static constants avoid per-render allocation"
  - id: "05-04-02"
    decision: "aria-roledescription and aria-label placed after {...attributes} spread"
    reason: "Ensures card-specific labels override any generic dnd-kit attributes"
  - id: "05-04-03"
    decision: "aria-hidden={isDragging || undefined} on source card"
    reason: "Source card is opacity:0 during drag; aria-hidden prevents SR announcing invisible element"

# Metrics
metrics:
  duration: "5 min"
  completed: "2026-02-04"
  tasks_completed: 2
  tasks_total: 2
  tests_added: 5
  tests_total: 412
---

# Phase 5 Plan 4: DnD Screen Reader Announcements Summary

Custom card-aware drag-and-drop announcements via dnd-kit accessibility prop with DraggableCard ARIA enhancements

## What Was Done

### Task 1: Custom DnD announcements and screen reader instructions
**Commit:** `515ad83`

Added card-specific `Announcements` and `ScreenReaderInstructions` to CardDndProvider's DndContext:

- `onDragStart` announces "Picked up Ace of Spades from hand" with keyboard instructions
- `onDragOver` announces "Ace of Spades is over discard"
- `onDragEnd` announces drop destination or return to original position
- `onDragCancel` announces cancellation with card name
- Screen reader instructions explain Space/Enter to pick up, arrows to move, Escape to cancel
- `restoreFocus: true` returns focus to dragged element after drop (keyboard accessibility)

StatefulCardDndProvider inherits all announcements automatically via its CardDndProvider wrapper.

### Task 2: DraggableCard ARIA enhancements
**Commit:** `5ff2975`

Enhanced DraggableCard with semantic ARIA attributes:

- `aria-roledescription="draggable card"` -- screen readers say "draggable card" not "draggable item"
- `aria-label` uses `formatCardForSpeech` for full card name (e.g., "Ace of Spades")
- Disabled cards label includes "dragging disabled" suffix
- `aria-hidden={isDragging || undefined}` hides source card during drag (DragOverlay shows the clone)
- Attributes placed after `{...attributes}` spread to override dnd-kit defaults
- Added 5 tests covering all new ARIA attributes
- Updated existing test to match new accessible name format

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

- All 412 tests pass across 31 test files
- TypeScript compilation clean (pre-existing CardStack warning only)
- `accessibility` prop confirmed in CardDndProvider.tsx
- `aria-roledescription` confirmed in DraggableCard.tsx

## Key Code Patterns

### Announcement constant (CardDndProvider.tsx)
```typescript
const cardAnnouncements: Announcements = {
  onDragStart({ active }) {
    const data = active.data.current as DragItemData | undefined;
    if (!data?.card) return 'Picked up item.';
    const cardName = formatCardForSpeech(data.card);
    const zone = data.sourceZoneId ?? 'the board';
    return `Picked up ${cardName} from ${zone}. ...`;
  },
  // ... onDragOver, onDragEnd, onDragCancel
};
```

### DraggableCard ARIA wrapper
```tsx
<div
  ref={setNodeRef}
  {...attributes}
  {...listeners}
  aria-roledescription="draggable card"
  aria-label={dragAriaLabel}
  aria-hidden={isDragging || undefined}
>
```

## Next Phase Readiness

DnD accessibility is complete. All card drag operations now provide meaningful screen reader feedback. Ready for 05-05 (final accessibility verification/integration).
