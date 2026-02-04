# Phase 4: State Management - Research

**Researched:** 2026-02-03
**Domain:** Redux Toolkit integration, React Context dual-mode state management, Vite multi-entry library builds
**Confidence:** HIGH

## Summary

This phase adds an optional state management layer to the card component library. The library currently exports visual components (Card, Hand, Deck, CardStack, DropZone) and drag-and-drop components (DraggableCard, DroppableZone, CardDragOverlay, CardDndProvider) from a single entry point. Phase 4 introduces a **separate entry point** for Redux Toolkit integration, plus a **standalone Context-based mode** for users without Redux, unified behind a common hook API.

The locked decisions specify: Redux Toolkit only (not plain Redux), separate entry point (`@yourlib/redux`), nested-by-location state shape (not normalized), four core hooks (useGameState, useLocation, useCard, useGameActions), dynamic location strings, UI state included alongside card identity, localStorage persistence in context mode, and a strategy pattern for transparently switching between Redux and Context backends.

The standard approach is to use Redux Toolkit's `createSlice` (v2.11.x) with built-in selectors for the Redux path, React's `useReducer` + `useContext` for the standalone path, and Vite's multi-entry library mode (`build.lib.entry` as object) with `package.json` exports field to expose the separate entry point. The strategy pattern is implemented as a **Provider prop** that determines which backend to use, with hooks reading from a shared context interface.

**Primary recommendation:** Build the shared reducer logic once (pure functions), wrap it in `createSlice` for the Redux entry point and `useReducer` for the Context entry point, and expose identical hooks that read from either backend via a strategy context.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @reduxjs/toolkit | ^2.11.2 | createSlice, Immer reducers, selectors, configureStore | Official Redux toolset, 4.8k+ npm dependents, built-in TypeScript, Immer included |
| react-redux | ^9.2.0 | useSelector, useDispatch, Provider binding React to Redux | Official React-Redux bindings, 9.2.0 requires React 18+ (project supports 18/19) |
| react (built-in) | ^18.0.0 / ^19.0.0 | useReducer, useContext, createContext | Already a peer dep, powers standalone mode with zero added deps |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| reselect (via RTK) | ^5.0.0 | createSelector for memoized derived data | When selectors return derived arrays/objects (e.g., filtered cards). Bundled with RTK. |
| vite-plugin-dts | ^4.5.0 | TypeScript declaration generation for multi-entry | Already in devDeps, handles .d.ts for both entry points |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @reduxjs/toolkit | zustand | Simpler API but decision locks us to RTK |
| react-redux useSelector | useSyncExternalStore directly | Lower-level, no Provider pattern, more boilerplate |
| Nested-by-location state | createEntityAdapter (normalized) | Decision locks us to nested-by-location, not byId/allIds |
| localStorage for persistence | redux-persist | Only applies to Redux mode; context mode needs custom solution anyway |

**Installation (for Redux users):**
```bash
npm install @reduxjs/toolkit react-redux
```

**No installation needed for standalone (context) mode** -- uses only React built-ins.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── state/                        # Shared state logic (both modes use this)
│   ├── types.ts                  # GameState, CardState, Action types
│   ├── reducer.ts                # Pure reducer function (no RTK dependency)
│   ├── actions.ts                # Action type constants and action creators
│   ├── selectors.ts              # Selector functions (operate on GameState)
│   ├── initialState.ts           # Default initial state factory
│   └── index.ts                  # Barrel export
├── context/                      # Standalone context mode
│   ├── GameProvider.tsx           # Context provider with useReducer + localStorage
│   ├── GameContext.ts             # createContext declarations (state + dispatch)
│   ├── persistence.ts            # localStorage read/write helpers
│   └── index.ts
├── hooks/                        # Shared hooks (work with both backends)
│   ├── useGameState.ts           # Full game state
│   ├── useLocation.ts            # Cards at a specific location
│   ├── useCard.ts                # Individual card by id
│   ├── useGameActions.ts         # Dispatch function
│   ├── useStateMode.ts           # Internal: detects Redux vs Context
│   └── index.ts
├── redux/                        # Redux-specific entry point code
│   ├── slice.ts                  # createSlice wrapping shared reducer
│   ├── store.ts                  # configureGameStore() helper
│   ├── ReduxGameProvider.tsx      # Redux Provider wrapper
│   ├── selectors.ts              # Redux-specific selectors (wrapped for RootState)
│   └── index.ts                  # SEPARATE ENTRY POINT export
└── index.ts                      # Main entry -- exports context mode + hooks
```

### Pattern 1: Shared Reducer with Dual Wrapping
**What:** Write the core reducer as a pure function. Wrap it in `createSlice` for Redux and `useReducer` for Context.
**When to use:** Always -- this is the foundation of the dual-mode architecture.
**Why:** Single source of truth for state transitions. Both modes share identical business logic.
**Example:**
```typescript
// src/state/reducer.ts -- pure function, no RTK import
import type { GameState, GameAction } from './types';

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MOVE_CARD': {
      const { cardIndex, from, to } = action.payload;
      const card = state.locations[from]?.[cardIndex];
      if (!card) return state;
      return {
        ...state,
        locations: {
          ...state.locations,
          [from]: state.locations[from].filter((_, i) => i !== cardIndex),
          [to]: [...(state.locations[to] ?? []), card],
        },
      };
    }
    // ... other cases
    default:
      return state;
  }
}

// src/redux/slice.ts -- wraps shared reducer in createSlice
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { GameState, MoveCardPayload } from '../state/types';
import { createInitialState } from '../state/initialState';

const gameSlice = createSlice({
  name: 'cardGame',
  initialState: createInitialState(),
  reducers: {
    moveCard(state, action: PayloadAction<MoveCardPayload>) {
      // Immer-powered mutation syntax
      const { cardIndex, from, to } = action.payload;
      const card = state.locations[from]?.[cardIndex];
      if (!card) return;
      state.locations[from].splice(cardIndex, 1);
      if (!state.locations[to]) state.locations[to] = [];
      state.locations[to].push(card);
    },
    // ... other reducers with Immer mutations
  },
  selectors: {
    selectLocations: (state) => state.locations,
    selectLocation: (state, locationId: string) => state.locations[locationId] ?? [],
    selectGamePhase: (state) => state.gamePhase,
    selectCurrentPlayer: (state) => state.currentPlayer,
  },
});
```

### Pattern 2: Strategy Pattern via Provider Prop
**What:** A `GameStateProvider` component that accepts a `mode` prop (or auto-detects Redux store) and renders the appropriate backend.
**When to use:** Application setup / root level.
**Why:** Hooks work identically regardless of which provider is above them. Consumers never import mode-specific code.
**Example:**
```typescript
// src/hooks/useStateMode.ts
import { createContext, useContext } from 'react';

export interface StateBackend {
  getState: () => GameState;
  dispatch: (action: GameAction) => void;
  subscribe: (listener: () => void) => () => void;
}

export const StateBackendContext = createContext<StateBackend | null>(null);

export function useStateBackend(): StateBackend {
  const backend = useContext(StateBackendContext);
  if (!backend) {
    throw new Error(
      'useStateBackend must be used within a GameStateProvider or ReduxGameProvider'
    );
  }
  return backend;
}
```

### Pattern 3: Separate Contexts for State and Dispatch (Context Mode)
**What:** React's recommended pattern of splitting state and dispatch into separate contexts to avoid unnecessary re-renders.
**When to use:** Context (standalone) mode provider.
**Why:** Without this, every component re-renders on every state change, even if it only dispatches actions.
**Example:**
```typescript
// Source: https://react.dev/learn/scaling-up-with-reducer-and-context
import { createContext, useReducer, useCallback, useEffect } from 'react';

const GameStateContext = createContext<GameState | null>(null);
const GameDispatchContext = createContext<React.Dispatch<GameAction> | null>(null);

export function GameProvider({ children, initialState }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState ?? createInitialState());

  // localStorage persistence
  useEffect(() => {
    try {
      localStorage.setItem('cardGameState', JSON.stringify(state));
    } catch { /* quota exceeded, silently fail */ }
  }, [state]);

  return (
    <GameStateContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
}
```

### Pattern 4: DnD Integration Bridge
**What:** Connect CardDndProvider's lifecycle callbacks to dispatch game state actions.
**When to use:** When DnD and state management are both active.
**Why:** Dragging a card should automatically update game state (move card from source to target location).
**Example:**
```typescript
// Usage by consumer:
function GameBoard() {
  const dispatch = useGameActions();

  return (
    <CardDndProvider
      onDragEnd={(card, targetZoneId, sourceZoneId) => {
        if (targetZoneId && sourceZoneId) {
          dispatch({ type: 'MOVE_CARD', payload: { card, from: sourceZoneId, to: targetZoneId } });
        }
      }}
    >
      {/* game zones */}
    </CardDndProvider>
  );
}
```

### Pattern 5: Vite Multi-Entry Build
**What:** Configure Vite to produce two separate bundles from two entry points.
**When to use:** Build configuration.
**Why:** Redux code is tree-shaken away for users who only import the main entry.
**Example:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        'card-components': resolve(__dirname, 'src/index.ts'),
        'card-components-redux': resolve(__dirname, 'src/redux/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react', 'react-dom', 'react/jsx-runtime',
        'motion', 'motion/react',
        '@dnd-kit/core', '@dnd-kit/utilities', '@dnd-kit/modifiers',
        '@reduxjs/toolkit', 'react-redux',  // externalize Redux
      ],
    },
  },
});

// package.json exports
{
  "exports": {
    ".": {
      "types": "./dist/card-components.d.ts",
      "import": "./dist/card-components.js",
      "require": "./dist/card-components.cjs"
    },
    "./redux": {
      "types": "./dist/card-components-redux.d.ts",
      "import": "./dist/card-components-redux.js",
      "require": "./dist/card-components-redux.cjs"
    }
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "peerDependenciesMeta": {
    "@reduxjs/toolkit": { "optional": true },
    "react-redux": { "optional": true }
  }
}
```

### Anti-Patterns to Avoid
- **Importing RTK in the main entry point:** Any `import from '@reduxjs/toolkit'` in the main bundle forces all users to install Redux. Keep all RTK imports strictly in `src/redux/`.
- **Single context for state + dispatch:** Causes every consuming component to re-render on every state change. Use two contexts (state + dispatch).
- **Normalizing card state (byId/allIds):** Decision locks us to nested-by-location. Do NOT use createEntityAdapter or byId patterns.
- **Auto-initializing state in provider:** Decision says explicit init actions. Provider should accept initial state, not auto-generate a deck.
- **Storing derived data in state:** Selectors compute derived data. Store only source-of-truth fields.
- **Using localStorage synchronously in reducer:** Reducers must be pure. Persist in useEffect after state changes.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Immutable state updates | Spread operator chains for nested updates | Immer (via RTK createSlice) | Nested spreads are error-prone and verbose; Immer handles it |
| Memoized selectors | Custom equality checks + caching | createSelector from RTK/Reselect | Handles input comparison, cache invalidation, composability |
| Redux store setup | Manual createStore + combineReducers | configureStore from RTK | Adds devtools, thunk middleware, serialization checks by default |
| Action type constants | Manual string constants file | createSlice auto-generated action types | Eliminates typo bugs, auto-generates `slice.actions` |
| State persistence | Custom save/load logic | Wrapped useReducer with useEffect sync | Synchronous localStorage + useEffect is the proven pattern |
| Type-safe dispatch | Manual action type unions | PayloadAction<T> from RTK | Inferred types from createSlice, no manual unions needed |

**Key insight:** Redux Toolkit exists specifically to eliminate Redux boilerplate. Using createSlice means you don't write action type constants, action creators, or switch statements manually. For the context mode, React's built-in useReducer is the standard -- don't build a custom state container.

## Common Pitfalls

### Pitfall 1: Redux Import Leaking into Main Bundle
**What goes wrong:** Non-Redux users get a build error because `@reduxjs/toolkit` is imported transitionally.
**Why it happens:** A shared utility or type file imports from RTK, and the main entry point imports that shared file.
**How to avoid:**
1. Keep ALL RTK imports strictly in `src/redux/` directory.
2. Shared types (`GameState`, `CardState`, `GameAction`) must NOT import from RTK.
3. The shared reducer is a plain function -- no `createSlice` in the shared code.
4. Add a lint rule or build-time check: main entry output must not contain `@reduxjs/toolkit`.
**Warning signs:** Build succeeds but users without Redux installed get "Cannot find module @reduxjs/toolkit" at runtime.

### Pitfall 2: Context Re-render Cascade
**What goes wrong:** Moving a single card causes every card component in every location to re-render.
**Why it happens:** All components consume the same context, and context re-renders all consumers when value changes (even if the consumer only needs a small slice of state).
**How to avoid:**
1. Split into two contexts: state and dispatch (dispatch reference is stable).
2. Use `React.memo` on card components.
3. In `useLocation(locationId)`, memoize the return value using `useMemo` and compare only the relevant location array.
4. Consider `useSyncExternalStore` for context mode if re-render performance is critical (allows fine-grained subscriptions).
**Warning signs:** React DevTools shows 50+ re-renders on a single card move. Visible lag when dragging cards.

### Pitfall 3: Immer Mutation on Undefined Nested Location
**What goes wrong:** `state.locations[locationId].push(card)` throws because `locations[locationId]` is undefined.
**Why it happens:** Dynamic location strings mean a location may not exist yet when a card is moved there for the first time.
**How to avoid:**
1. Always initialize the location array before mutating:
   ```typescript
   if (!state.locations[to]) state.locations[to] = [];
   state.locations[to].push(card);
   ```
2. Provide a `SET_LOCATIONS` init action that sets up all expected locations.
3. In selectors, always return `[]` as fallback: `state.locations[id] ?? []`.
**Warning signs:** Runtime error "Cannot read property 'push' of undefined" in reducer.

### Pitfall 4: localStorage Quota and JSON Serialization
**What goes wrong:** State stops persisting silently, or complex objects (functions, symbols) cause serialization errors.
**Why it happens:** localStorage has a ~5MB limit. State objects with non-serializable fields (functions, class instances) fail `JSON.stringify`.
**How to avoid:**
1. Wrap localStorage writes in try/catch.
2. Only store serializable state (no functions, no DOM refs).
3. Validate data on load: wrap `JSON.parse` in try/catch with fallback to initial state.
4. Consider storing only essential state (not UI transients like hover state).
**Warning signs:** State resets on page refresh; console errors about circular JSON.

### Pitfall 5: Hook Return Referential Instability
**What goes wrong:** Components using `useLocation('hand')` re-render every render cycle even if the hand didn't change.
**Why it happens:** Selecting a sub-array from state creates a new array reference each time. `useSelector` uses `===` by default.
**How to avoid:**
1. In Redux mode, use `createSelector` to memoize array slicing: `createSelector(selectLocations, (locs) => locs[locationId] ?? [])`.
2. In Context mode, use `useMemo` in the hook comparing the specific location array reference.
3. For `useGameActions`, return a stable dispatch reference (useCallback or direct context dispatch).
**Warning signs:** useSelector/useContext consumers re-render without apparent state changes.

### Pitfall 6: vite-plugin-dts Duplicate Types with Multiple Entry Points
**What goes wrong:** TypeScript types are duplicated across both `.d.ts` files, causing type mismatch errors for consumers.
**Why it happens:** vite-plugin-dts inlines shared types into both entry point declaration files instead of creating a shared module.
**How to avoid:**
1. Use `rollupTypes: false` (keep individual .d.ts files rather than bundling).
2. Configure `include` to cover both entry point source trees.
3. Alternatively, use the `beforeWriteFile` hook to control output.
4. Test the built output: `tsc --noEmit` against the dist types.
**Warning signs:** Consumers get "Type X is not assignable to Type X" even though types look identical.

## Code Examples

Verified patterns from official sources:

### State Types Definition
```typescript
// src/state/types.ts -- NO Redux imports
import type { Suit, Rank } from '../types/card';

/** Card identity + UI state, as decided in CONTEXT.md */
export interface CardState {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
  selected: boolean;
  position?: { x: number; y: number };
}

/** Dynamic locations: any string key */
export interface GameState {
  /** Cards grouped by location. Key is any string (e.g., 'player1Hand', 'deck', 'communityCards') */
  locations: Record<string, CardState[]>;
  /** Current player identifier */
  currentPlayer: string | null;
  /** Current game phase (e.g., 'dealing', 'playing', 'scoring') */
  gamePhase: string | null;
  /** Arbitrary game-specific metadata */
  meta: Record<string, unknown>;
}

/** Union of all action types */
export type GameAction =
  | { type: 'MOVE_CARD'; payload: MoveCardPayload }
  | { type: 'FLIP_CARD'; payload: FlipCardPayload }
  | { type: 'SELECT_CARD'; payload: SelectCardPayload }
  | { type: 'SET_LOCATIONS'; payload: SetLocationsPayload }
  | { type: 'SET_GAME_PHASE'; payload: string }
  | { type: 'SET_CURRENT_PLAYER'; payload: string }
  | { type: 'DEAL_CARDS'; payload: DealCardsPayload }
  | { type: 'SHUFFLE_LOCATION'; payload: string }
  | { type: 'RESET'; payload?: Partial<GameState> };

export interface MoveCardPayload {
  cardIndex: number;
  from: string;
  to: string;
}

export interface FlipCardPayload {
  location: string;
  cardIndex: number;
  faceUp: boolean;
}

export interface SelectCardPayload {
  location: string;
  cardIndex: number;
  selected: boolean;
}

export interface SetLocationsPayload {
  locations: Record<string, CardState[]>;
}

export interface DealCardsPayload {
  from: string;
  to: Record<string, number>; // locationId -> count
  faceUp?: boolean;
}
```

### Redux Slice with Built-in Selectors
```typescript
// Source: https://redux-toolkit.js.org/api/createslice/
// src/redux/slice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';
import type { GameState, MoveCardPayload, FlipCardPayload, DealCardsPayload } from '../state/types';
import { createInitialState } from '../state/initialState';

export const gameSlice = createSlice({
  name: 'cardGame',
  initialState: createInitialState(),
  reducers: {
    moveCard(state, action: PayloadAction<MoveCardPayload>) {
      const { cardIndex, from, to } = action.payload;
      const card = state.locations[from]?.[cardIndex];
      if (!card) return;
      state.locations[from].splice(cardIndex, 1);
      if (!state.locations[to]) state.locations[to] = [];
      state.locations[to].push(card);
    },
    flipCard(state, action: PayloadAction<FlipCardPayload>) {
      const { location, cardIndex, faceUp } = action.payload;
      const card = state.locations[location]?.[cardIndex];
      if (card) card.faceUp = faceUp;
    },
    setGamePhase(state, action: PayloadAction<string>) {
      state.gamePhase = action.payload;
    },
    setCurrentPlayer(state, action: PayloadAction<string>) {
      state.currentPlayer = action.payload;
    },
    dealCards(state, action: PayloadAction<DealCardsPayload>) {
      const { from, to, faceUp = false } = action.payload;
      for (const [locationId, count] of Object.entries(to)) {
        if (!state.locations[locationId]) state.locations[locationId] = [];
        for (let i = 0; i < count; i++) {
          const card = state.locations[from]?.shift();
          if (card) {
            card.faceUp = faceUp;
            state.locations[locationId].push(card);
          }
        }
      }
    },
    reset(state, action: PayloadAction<Partial<GameState> | undefined>) {
      return { ...createInitialState(), ...action.payload };
    },
  },
  selectors: {
    selectLocations: (state) => state.locations,
    selectGamePhase: (state) => state.gamePhase,
    selectCurrentPlayer: (state) => state.currentPlayer,
  },
});

// Memoized selector for specific location (returns stable reference)
export const selectLocation = createSelector(
  [(state: GameState) => state.locations, (_state: GameState, locationId: string) => locationId],
  (locations, locationId) => locations[locationId] ?? []
);

export const { moveCard, flipCard, setGamePhase, setCurrentPlayer, dealCards, reset } = gameSlice.actions;
export default gameSlice.reducer;
```

### configureGameStore Helper
```typescript
// Source: https://redux-toolkit.js.org/usage/usage-with-typescript
// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { gameSlice } from './slice';

export function configureGameStore(preloadedState?: Partial<GameState>) {
  return configureStore({
    reducer: {
      [gameSlice.reducerPath]: gameSlice.reducer,
    },
    preloadedState: preloadedState ? { [gameSlice.reducerPath]: { ...createInitialState(), ...preloadedState } } : undefined,
  });
}

export type GameStore = ReturnType<typeof configureGameStore>;
export type GameRootState = ReturnType<GameStore['getState']>;
export type GameDispatch = GameStore['dispatch'];
```

### Unified Hook Implementation
```typescript
// src/hooks/useLocation.ts
import { useContext, useMemo } from 'react';
import { GameStateContext, GameModeContext } from '../context/GameContext';
import type { CardState } from '../state/types';

export function useLocation(locationId: string): CardState[] {
  const mode = useContext(GameModeContext);

  if (mode === 'redux') {
    // Dynamic import would break rules of hooks.
    // Instead, the ReduxGameProvider populates the same context interface.
    const state = useContext(GameStateContext);
    return useMemo(
      () => state?.locations[locationId] ?? [],
      [state?.locations[locationId], locationId]
    );
  }

  // Context mode
  const state = useContext(GameStateContext);
  return useMemo(
    () => state?.locations[locationId] ?? [],
    [state?.locations[locationId], locationId]
  );
}
```

### localStorage Persistence Pattern
```typescript
// Source: https://www.benmvp.com/blog/sync-localstorage-react-usereducer-hook/
// src/context/persistence.ts
import type { GameState } from '../state/types';

const STORAGE_KEY = 'cardGameState';

export function loadState(): GameState | undefined {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return undefined;
    return JSON.parse(serialized) as GameState;
  } catch {
    return undefined;
  }
}

export function saveState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or private browsing -- silently fail
  }
}
```

### Init Action Helpers (Per Decision)
```typescript
// src/state/actions.ts
import type { CardState, GameAction, SetLocationsPayload } from './types';
import { allCards } from '../types/card';

/** Create a standard 52-card deck as CardState[] at a given location */
export function dealStandardDeck(locationId: string = 'deck'): GameAction {
  const cards: CardState[] = allCards().map((card) => ({
    ...card,
    faceUp: false,
    selected: false,
  }));
  return {
    type: 'SET_LOCATIONS',
    payload: { locations: { [locationId]: cards } },
  };
}

/** Shuffle cards at a location using Fisher-Yates */
export function shuffleLocation(locationId: string): GameAction {
  return { type: 'SHUFFLE_LOCATION', payload: locationId };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux + manual action types + switch reducers | Redux Toolkit createSlice with Immer | 2019+ (RTK 1.0) | 90% less boilerplate, built-in TypeScript |
| redux-persist for persistence | useEffect + localStorage (context) or RTK middleware | 2020+ | Simpler, no extra dependency for basic persistence |
| mapStateToProps / connect HOC | useSelector + useDispatch hooks | 2019 (react-redux 7.1) | Cleaner component code, better TypeScript inference |
| Normalized state (byId/allIds) for everything | Nested state for simple domain models | Ongoing | Normalization valuable for relational data; nested is simpler for grouped collections |
| Separate action constants files | createSlice auto-generated actions | 2019+ (RTK) | Action types derived from slice name + reducer key |
| Plain Redux createStore | configureStore from RTK | RTK 2.0 (2024) | createStore officially deprecated in Redux 5.0 |
| createSlice without selectors | createSlice with `selectors` field | RTK 2.0 (2024) | Co-located selectors, auto-wrapped for root state |
| react-redux v8 | react-redux v9.2 (useSyncExternalStore) | 2024 | Requires React 18+, simpler internals, .withTypes() for typed hooks |

**Deprecated/outdated:**
- **createStore from Redux:** Deprecated in Redux 5.0. Use configureStore.
- **connect HOC:** Still works but hooks are the standard approach.
- **redux-persist:** Not needed for simple localStorage persistence. Overkill for this use case.
- **Separate action type constant files:** createSlice auto-generates these.

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal Strategy Pattern Implementation**
   - What we know: Three viable approaches: (a) Provider component with `mode` prop, (b) factory function returning hooks, (c) context-based adapter. The decision says "Claude chooses cleanest strategy pattern."
   - What's unclear: Whether to use a single `StateBackendContext` that both providers populate, or to have the hooks internally check which context is available.
   - Recommendation: Use a **single `StateBackendContext`** that both the Context provider and Redux provider populate with a common `{ getState, dispatch, subscribe }` interface. Hooks read from this one context. This is the cleanest because hooks have zero conditional logic -- they just read from the backend context. The "strategy" is in which Provider you wrap your app with.

2. **Performance of Context Mode with 50+ Cards**
   - What we know: React Context re-renders all consumers on any state change. React.memo and useMemo mitigate this but don't eliminate the fundamental issue.
   - What's unclear: Whether the context mode will have acceptable performance for games with many cards moving frequently. Redux with useSelector avoids this via fine-grained subscriptions.
   - Recommendation: Document that context mode is suitable for prototyping and simple games. For production games with 50+ cards and frequent state updates, recommend Redux mode. Optionally, consider `useSyncExternalStore` for context mode as a future optimization.

3. **vite-plugin-dts Type Generation for Multiple Entries**
   - What we know: vite-plugin-dts has a known issue (#321) where shared types are duplicated across entry point declarations. The project already uses vite-plugin-dts v4.5.0.
   - What's unclear: Whether the current version handles multi-entry cleanly or needs workarounds.
   - Recommendation: Test the build output early. If types are duplicated, use `rollupTypes: false` and ensure shared types are in a common directory both entries import from. Verify with `tsc --noEmit` against dist output.

4. **React 19 Compatibility for useContext/useSyncExternalStore**
   - What we know: The project supports React 18 and 19 as peer deps. React 19 changed some context behavior.
   - What's unclear: Whether any React 19-specific context APIs (like `use()` for context) should be leveraged.
   - Recommendation: Stick with `useContext` which works in both 18 and 19. Avoid React 19-only APIs to maintain backward compatibility.

## Sources

### Primary (HIGH confidence)
- [Redux Toolkit createSlice API](https://redux-toolkit.js.org/api/createslice/) - Slice configuration, selectors field, return value
- [Redux Toolkit TypeScript Usage](https://redux-toolkit.js.org/usage/usage-with-typescript) - RootState, AppDispatch, typed hooks, PayloadAction
- [Redux Toolkit Immer Reducers](https://redux-toolkit.js.org/usage/immer-reducers) - Mutation patterns, dynamic keys, nested state
- [React Scaling with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context) - Official React pattern for useReducer + Context, separate contexts, custom hooks
- [Vite Build Documentation](https://vite.dev/guide/build) - Library mode multi-entry configuration, exports field
- [react-redux npm](https://www.npmjs.com/package/react-redux) - v9.2.0, React 18+ requirement
- [@reduxjs/toolkit npm](https://www.npmjs.com/package/@reduxjs/toolkit) - v2.11.2, latest

### Secondary (MEDIUM confidence)
- [Redux Deriving Data with Selectors](https://redux.js.org/usage/deriving-data-selectors) - createSelector best practices, memoization patterns
- [Vite GitHub Discussion #1736](https://github.com/vitejs/vite/discussions/1736) - Multiple entry points community discussion
- [Context vs Redux (Mark Erikson)](https://blog.isquaredsoftware.com/2021/01/context-redux-differences/) - Why Context is DI not state management, performance implications
- [localStorage persistence with useReducer](https://www.benmvp.com/blog/sync-localstorage-react-usereducer-hook/) - Wrapped reducer pattern, synchronous persistence

### Tertiary (LOW confidence)
- [vite-plugin-dts duplicate types issue #321](https://github.com/qmhc/unplugin-dts/issues/321) - Multi-entry type duplication problem (needs validation against current version)
- [RTK createSlice selectors discussion #4553](https://github.com/reduxjs/redux-toolkit/discussions/4553) - Memoization with built-in selectors (community discussion)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - RTK 2.11.x and react-redux 9.2.x are well-documented with official TypeScript patterns
- Architecture: HIGH - Dual-mode pattern is well-established (Context for simple, Redux for complex); Vite multi-entry is documented
- State shape: HIGH - Nested-by-location with Immer mutations is a standard RTK pattern
- Pitfalls: HIGH - Redux import leaking, context re-renders, Immer undefined keys are well-documented issues
- Build configuration: MEDIUM - vite-plugin-dts multi-entry has known issues that need testing
- Performance (context mode): MEDIUM - Theoretical concerns about context re-renders with many consumers

**Research date:** 2026-02-03
**Valid until:** 2026-03-05 (30 days -- RTK 2.x and react-redux 9.x are stable)
