---
phase: 04-state-management
plan: 04
subsystem: state
tags: [redux-toolkit, createSlice, immer, react-redux, provider, memoized-selectors]
depends_on:
  requires: [04-01, 04-02]
  provides: [gameSlice, configureGameStore, ReduxGameProvider, memoized Redux selectors, redux barrel exports]
  affects: [04-05, 04-06]
tech_stack:
  added: ["@reduxjs/toolkit ^2.0.0", "react-redux ^9.0.0"]
  patterns: [createSlice, configureStore, createSelector, strategy-pattern-bridge, optional-peer-dependencies]
files:
  created: [src/redux/slice.ts, src/redux/store.ts, src/redux/selectors.ts, src/redux/ReduxGameProvider.tsx, src/redux/ReduxGameProvider.test.tsx, src/redux/index.ts]
  modified: [package.json, package-lock.json]
decisions:
  - id: rtk-optional-peer
    choice: "RTK and react-redux as optional peer dependencies in peerDependenciesMeta"
    why: "Non-Redux consumers never encounter RTK; install only when using Redux entry point"
  - id: immer-mutations-in-slice
    choice: "All slice reducers use Immer-powered direct mutations (splice, push, assignment)"
    why: "createSlice enables Immer by default; simpler than immutable spread patterns in shared reducer"
  - id: action-creator-map-bridge
    choice: "Static ACTION_CREATOR_MAP object maps string types to slice action creators"
    why: "Bridges the dispatch('TYPE', payload) API to RTK's typed action creators cleanly"
  - id: action-barrel-aliases
    choice: "Plain action creators re-exported with Action suffix to avoid collision with slice exports"
    why: "Both slice.actions and state/actions export moveCard etc; suffixed aliases avoid ambiguity"
metrics:
  duration: 5 min
  completed: 2026-02-04
---

# Phase 4 Plan 4: Redux Toolkit Entry Point Summary

Redux Toolkit integration with createSlice (9 Immer-powered reducers), configureGameStore factory, ReduxGameProvider bridging to StateBackend, and memoized selectors via createSelector.

## What Was Done

### Task 1: Install Redux deps, create slice and store
- Installed @reduxjs/toolkit and react-redux as devDependencies
- Added both as optional peerDependencies via peerDependenciesMeta
- Created gameSlice with createSlice wrapping all 9 action types using Immer mutations:
  - moveCard, flipCard, selectCard, setLocations, setGamePhase, setCurrentPlayer, dealCards, shuffleLocation, reset
- Built-in selectors: selectLocations, selectGamePhase, selectCurrentPlayer
- configureGameStore() factory with optional preloaded state merging
- Type exports: GameStore, GameRootState, GameDispatch
- Memoized selector factories: makeSelectLocation, makeSelectCard using createSelector
- Verified all RTK imports strictly confined to src/redux/

### Task 2: ReduxGameProvider and integration tests
- ReduxGameProvider wraps children in react-redux Provider AND StateBackendContext.Provider
- Bridges Redux store to StateBackend via ACTION_CREATOR_MAP dispatch adapter
- Supports both `store` prop (advanced) and `initialState` prop (quick setup)
- useMemo for store creation and backend adapter referential stability
- 8 integration tests:
  1. Hooks work with initial state
  2. Dispatch via useGameActions updates state (MOVE_CARD)
  3. SET_LOCATIONS with 52-card deck
  4. Custom store prop
  5. Custom initialState prop
  6. Redux useSelector reads from same store
  7. FLIP_CARD updates card state
  8. RESET restores initial state
- Barrel index (src/redux/index.ts) re-exports slice, store, provider, selectors, and shared types

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Optional peer deps | RTK/react-redux in peerDependenciesMeta as optional | Non-Redux users never install or encounter RTK |
| Immer mutations | Direct mutations in slice reducers | createSlice enables Immer; cleaner than spread patterns |
| Dispatch bridge | Static ACTION_CREATOR_MAP maps string types to slice actions | Clean bridge from dispatch('TYPE', payload) to typed RTK action creators |
| Re-export aliases | Plain action creators suffixed (moveCardAction etc) | Avoids collision between slice.actions exports and state/actions exports |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Feature branch based on wrong parent**
- **Found during:** Task 1
- **Issue:** git flow feature start created branch from develop, which lacks the 04-01/04-02 state management code (still on feature/state-management-foundation)
- **Fix:** Deleted initial branch, recreated from feature/state-management-foundation
- **Files modified:** None (branch management)

## Verification

- 8/8 Redux integration tests passing
- 343/343 total tests passing across 27 test files
- Zero type errors (npx tsc --noEmit)
- RTK imports verified confined to src/redux/ only (grep returns nothing)
- ReduxGameProvider populates StateBackendContext correctly
- Unified hooks (useGameState, useLocation, useCard, useGameActions) work identically with Redux backend
- configureGameStore returns working store with gameSlice
- useSelector from react-redux reads from same store

## Commits

| Hash | Message |
|------|---------|
| d8a6321 | feat(04-04): Redux slice, store factory, and memoized selectors |
| 4b8a472 | feat(04-04): ReduxGameProvider, integration tests, and barrel exports |

## Next Phase Readiness

Plan 04-05 (DnD-state integration) can proceed -- the Redux backend is fully functional and tested. Both GameProvider (context) and ReduxGameProvider (Redux) now populate the same StateBackend interface, enabling unified hooks to work transparently with either backend.
