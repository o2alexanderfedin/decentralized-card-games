---
phase: 05-accessibility
plan: 03
subsystem: ui
tags: [a11y, aria, roles, keyboard-navigation, listbox, screen-reader, wcag]

# Dependency graph
requires:
  - phase: 05-accessibility
    plan: 01
    provides: formatCardForSpeech, formatCardLabel, formatFaceDownLabel, useRovingTabIndex
  - phase: 01-foundation
    provides: CardData, Rank, Suit types
  - phase: 02-containers
    provides: Hand, Deck, CardStack, DropZone components
  - phase: 03-dnd
    provides: DroppableZone component

provides:
  - ARIA roles on all 6 card components (button, listbox, option, group, region)
  - Keyboard activation (Enter/Space) on Card, Deck, Hand cards
  - Roving tabindex navigation in Hand component
  - Natural language ARIA labels via formatCardForSpeech
  - Face-down identity protection in ARIA announcements

affects:
  - phase: 05-accessibility
    plan: 04
    detail: DnD announcements build on these ARIA foundations
  - phase: 05-accessibility
    plan: 05
    detail: Integration tests can verify full ARIA attribute presence

# Tech tracking
tech-stack:
  added: []
  patterns:
    - WAI-ARIA listbox/option pattern for Hand component
    - Roving tabindex for composite widget keyboard navigation
    - Face-down card identity protection in screen reader output

# File tracking
key-files:
  created: []
  modified:
    - src/components/Card/Card.tsx
    - src/components/Card/Card.test.tsx
    - src/components/Deck/Deck.tsx
    - src/components/CardStack/CardStack.tsx
    - src/components/CardStack/CardStack.types.ts
    - src/components/DropZone/DropZone.tsx
    - src/components/DroppableZone/DroppableZone.tsx
    - src/components/Hand/Hand.tsx
    - src/components/Hand/Hand.types.ts

# Decisions
decisions:
  - id: aria-natural-language
    description: Card ARIA labels use natural language ("Ace of Spades") via formatCardForSpeech instead of raw codes ("A of spades")
    rationale: Screen readers should announce human-friendly text for better user experience
  - id: facedown-identity-protection
    description: Face-down cards announce as "Face-down card" without any identity information
    rationale: CRITICAL for game fairness -- screen reader users must not gain an unfair advantage
  - id: hand-listbox-pattern
    description: Hand uses role="listbox" with role="option" children and roving tabindex
    rationale: WAI-ARIA APG composite widget pattern -- single Tab stop, Arrow keys within

# Metrics
metrics:
  duration: 7 min
  completed: 2026-02-04
---

# Phase 5 Plan 3: ARIA Roles and Keyboard Navigation Summary

Added ARIA roles, labels, and keyboard navigation to all 6 card components, making them WCAG-compliant for screen readers and keyboard-only users.

## What Was Done

### Task 1: Card, Deck, CardStack, DropZone, DroppableZone ARIA Enhancements

**Card.tsx:**
- Imported `formatCardForSpeech` from a11y utilities
- ARIA label now uses natural language: "Ace of Spades" instead of "A of spades"
- Face-down cards announce as "Face-down card" (identity never leaked)
- Added `onKeyDown` handler for Enter/Space keyboard activation

**Deck.tsx:**
- Added `onKeyDown` handler for Enter/Space to trigger draw action
- All empty state divs now include `aria-label="Empty deck"`

**CardStack.tsx:**
- Added `role="group"` to container div
- Added `ariaLabel` prop to CardStackProps (defaults to "Card stack, N card(s)")
- Dynamic aria-label includes card count

**DropZone.tsx:**
- Added `role="region"` to container div
- Added `aria-label` using the `label` prop (defaults to "Drop zone")

**DroppableZone.tsx:**
- Added `role="region"` and `aria-label` to the wrapper div

**Commit:** `3d8fb29`

### Task 2: Hand Component with Listbox Role and Roving Tabindex

**Hand.types.ts:**
- Added optional `ariaLabel` prop (default: "Your hand")

**Hand.tsx:**
- Integrated `useRovingTabIndex` hook for keyboard navigation
- Container div has `role="listbox"`, `aria-label`, `aria-orientation="horizontal"`
- Each card slot has `role="option"`, `aria-selected`, positional `aria-label`
- Card slots use roving tabindex: only active card has `tabIndex={0}`
- `onKeyDown` handles both arrow navigation and Space/Enter selection
- `cardRefs` array + `useEffect` manages focus when activeIndex changes
- Face-up cards: "Ace of Spades, card 3 of 7 in Your hand"
- Face-down cards: "Face-down card, card 3 of 7 in Your hand"

**Commit:** `5f8ecd0`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated Card tests for natural language ARIA labels**
- **Found during:** Task 1
- **Issue:** Existing tests expected raw format ("A of spades") but new ARIA labels use natural language ("Ace of Spades")
- **Fix:** Updated 4 test assertions to match new format; added 3 new tests (face-down identity protection, Enter key activation, Space key activation)
- **Files modified:** src/components/Card/Card.test.tsx
- **Commit:** `3d8fb29`

**2. [Rule 3 - Blocking] Removed unused formatCardForSpeech import in Hand**
- **Found during:** Task 2
- **Issue:** TypeScript strict mode flagged unused import causing compilation error
- **Fix:** Removed `formatCardForSpeech` from Hand.tsx imports (only `formatCardLabel` and `formatFaceDownLabel` are used there)
- **Files modified:** src/components/Hand/Hand.tsx
- **Commit:** `5f8ecd0`

## Verification

- All 412 tests pass across 31 test files
- TypeScript compilation clean (no errors)
- ARIA roles confirmed via grep: button (Card, Deck), listbox (Hand), option (Hand cards), group (CardStack), region (DropZone, DroppableZone)
- `formatCardForSpeech` wired in Card.tsx for natural language labels

## Success Criteria Met

| Criteria | Status |
|----------|--------|
| Card ARIA label says "Ace of Spades" | PASS |
| Face-down cards announce as "Face-down card" | PASS |
| Hand is a single Tab stop with Arrow key navigation | PASS |
| Space/Enter toggles selection in Hand | PASS |
| Deck responds to Enter/Space for draw | PASS |
| CardStack has role="group" with card count | PASS |
| DropZone and DroppableZone have role="region" | PASS |
| All existing tests pass | PASS (412/412) |

## Next Phase Readiness

Plan 05-04 (DnD screen reader announcements) can proceed. The ARIA foundations established here provide the semantic structure that DnD announcements will build upon.
