---
phase: 04-state-management
plan: 02
subsystem: state
tags: [typescript, selectors, hooks, useSyncExternalStore, strategy-pattern]
depends_on:
  requires: [04-01]
  provides: [Pure selectors, StateBackend interface, useGameState, useLocation, useCard, useGameActions]
  affects: [04-03, 04-04, 04-05, 04-06]
tech_stack:
  added: []
  patterns: [strategy-pattern, useSyncExternalStore, context-based-DI, stable-reference-caching]
files:
  created: [src/state/selectors.ts, src/state/selectors.test.ts, src/hooks/useStateBackend.ts, src/hooks/useGameState.ts, src/hooks/useLocation.ts, src/hooks/useCard.ts, src/hooks/useGameActions.ts, src/hooks/useStateHooks.test.tsx]
  modified: [src/state/index.ts, src/hooks/index.ts]
decisions:
  - id: selector-barrel-alias
    choice: "selectCard selector exported as selectCardState from barrel to avoid collision with selectCard action creator"
    why: "Both names are natural; alias in barrel preserves clean names in source files"
  - id: useLocation-stable-empty
    choice: "Module-level EMPTY constant + length check for missing location stability"
    why: "useSyncExternalStore requires getSnapshot to return same reference when unchanged; fallback [] creates new array each call"
  - id: useLocation-direct-read
    choice: "Read state.locations[locationId] directly instead of using selectLocation selector"
    why: "selectLocation returns `?? []` which creates a new array, causing infinite re-render with useSyncExternalStore"
  - id: dispatch-type-payload-api
    choice: "GameDispatchFn = (type: string, payload?: Record<string, unknown>) => void"
    why: "Matches user decision for Redux-style dispatch('MOVE_CARD', { ... }) API"
metrics:
  duration: 3 min
  completed: 2026-02-04
---

# Phase 4 Plan 2: Selectors & Hooks Summary

Pure selectors on GameState, StateBackend strategy interface, and four unified hooks using useSyncExternalStore for tear-safe reads.

## What Was Done

### Task 1: Pure selectors on GameState
- Created 6 pure selector functions: selectAllLocations, selectLocation, selectCard, selectGamePhase, selectCurrentPlayer, selectLocationCount
- 16 tests covering valid lookups, missing locations, out-of-bounds indices, empty state
- Updated src/state/index.ts barrel with alias (selectCardState) to avoid action creator name collision
- Zero RTK imports

### Task 2: StateBackend interface and unified hooks
- Defined StateBackend interface: getState/dispatch/subscribe -- the strategy pattern pivot
- Defined GameDispatchFn type for Redux-style dispatch('ACTION_TYPE', payload) API
- Created StateBackendContext with null default
- useStateBackend hook throws descriptive error outside provider
- useGameState uses useSyncExternalStore(backend.subscribe, backend.getState)
- useLocation reads directly from state.locations with stable empty-array caching via module-level EMPTY constant
- useCard uses useSyncExternalStore + selectCard selector
- useGameActions returns the stable dispatch reference from StateBackend
- 16 hook tests using MockStateBackendProvider test helper
- Updated src/hooks/index.ts barrel with all new exports

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Selector barrel alias | selectCard exported as selectCardState | Avoids collision with selectCard action creator |
| useLocation stability | Module-level EMPTY + direct location read | useSyncExternalStore requires referentially stable snapshots |
| Dispatch API shape | (type: string, payload?: Record) | Matches user's Redux-style dispatch decision |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed useLocation infinite re-render for missing locations**
- **Found during:** Task 2
- **Issue:** selectLocation returns `state.locations[id] ?? []` which creates a new empty array each call; useSyncExternalStore detects snapshot change and re-renders infinitely
- **Fix:** Read state.locations[locationId] directly, use module-level EMPTY constant and length-based check for stable empty array reference
- **Files modified:** src/hooks/useLocation.ts
- **Commit:** e891ac5

## Verification

- 32/32 tests passing (16 selectors + 16 hooks)
- Zero type errors (npx tsc --noEmit)
- Zero @reduxjs/toolkit imports in src/state/ and src/hooks/
- All data hooks use useSyncExternalStore for tear-safe reads
- StateBackend is the single abstraction both providers will implement
- All hooks throw descriptive error outside provider

## Commits

| Hash | Message |
|------|---------|
| 33c6708 | feat(04-02): pure selectors on GameState |
| e891ac5 | feat(04-02): StateBackend interface and unified hooks |

## Next Phase Readiness

Plan 04-03 (Context provider) can proceed immediately -- it will create a GameStateProvider that populates StateBackendContext with a useReducer-backed StateBackend implementation.
