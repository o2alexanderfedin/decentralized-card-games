---
phase: 04-state-management
plan: 01
subsystem: state
tags: [typescript, reducer, tdd, state-management]
depends_on:
  requires: [01-foundation]
  provides: [GameState types, pure gameReducer, action creators, createInitialState]
  affects: [04-02, 04-03, 04-04, 04-05, 04-06]
tech_stack:
  added: []
  patterns: [pure-reducer, discriminated-union-actions, fisher-yates-shuffle, immutable-spread]
files:
  created: [src/state/types.ts, src/state/initialState.ts, src/state/reducer.ts, src/state/actions.ts, src/state/index.ts, src/state/reducer.test.ts, src/state/actions.test.ts]
  modified: []
decisions:
  - id: state-nested-by-location
    choice: "Record<string, CardState[]> for locations -- dynamic string keys"
    why: "Flexible for any game type (poker, solitaire, trick-taking)"
  - id: cardstate-extends-carddata
    choice: "CardState has suit+rank identity plus faceUp, selected, position UI fields"
    why: "Single source of truth for card identity and display state"
  - id: pure-reducer-no-rtk
    choice: "gameReducer is a plain switch-case function with zero RTK imports"
    why: "Enables dual use: useReducer for Context mode, createSlice wrapper for Redux mode"
  - id: set-locations-merges
    choice: "SET_LOCATIONS merges payload into existing locations (preserves unmentioned keys)"
    why: "Safer default -- avoids accidental data loss from partial updates"
  - id: deal-cards-graceful-insufficient
    choice: "DEAL_CARDS stops dealing when source is empty instead of throwing"
    why: "Robust handling of edge cases without crashing"
metrics:
  duration: 2 min
  completed: 2026-02-04
---

# Phase 4 Plan 1: Shared State Foundation Summary

Pure TypeScript state types, reducer, action creators, and initial state factory with full TDD coverage -- zero Redux Toolkit imports.

## What Was Done

### Task 1: State types and initial state factory
- Defined `CardState` interface: suit, rank, faceUp, selected, optional position
- Defined `GameState`: locations (Record<string, CardState[]>), currentPlayer, gamePhase, meta
- Defined all action payload interfaces (MoveCardPayload, FlipCardPayload, etc.)
- Defined `GameAction` discriminated union covering 9 action types
- Created `createInitialState()` factory with optional `Partial<GameState>` overrides

### Task 2: TDD pure reducer and action creators
- **RED:** Wrote 34 failing tests across reducer.test.ts and actions.test.ts
- **GREEN:** Implemented `gameReducer` (pure switch-case, immutable spreads) and all action creators
- Reducer handles: MOVE_CARD, FLIP_CARD, SELECT_CARD, SET_LOCATIONS, SET_GAME_PHASE, SET_CURRENT_PLAYER, DEAL_CARDS, SHUFFLE_LOCATION, RESET, unknown action
- Action creators: dealStandardDeck, shuffleLocation, moveCard, flipCard, selectCard, setGamePhase, setCurrentPlayer, reset
- Barrel `index.ts` re-exports all types, reducer, factory, and action creators

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Location structure | `Record<string, CardState[]>` | Dynamic keys support any game type |
| CardState shape | suit + rank + faceUp + selected + position | Single source of truth |
| Reducer purity | Plain function, no RTK/Immer | Dual-mode compatibility |
| SET_LOCATIONS semantics | Merge, not replace | Prevents accidental data loss |
| DEAL_CARDS edge case | Graceful stop when source empty | No crashes on insufficient cards |

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- 34/34 tests passing (`npx vitest run src/state/`)
- Zero type errors in src/state/
- Zero `@reduxjs/toolkit` imports in src/state/
- GameState uses nested-by-location structure per CONTEXT.md
- CardState includes suit, rank, faceUp, selected, position

## Commits

| Hash | Message |
|------|---------|
| a08466f | feat(04-01): state types and initial state factory |
| 83b4543 | test(04-01): add failing tests for reducer and action creators |
| d533c6b | feat(04-01): implement pure reducer, action creators, and barrel exports |

## Next Phase Readiness

Plan 04-02 (selectors) can proceed immediately -- it imports from `src/state/types.ts` and `src/state/reducer.ts` which are now complete.
