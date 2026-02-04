# Architecture

**Analysis Date:** 2026-02-04

## Pattern Overview

**Overall:** Component Library with Headless Architecture

**Key Characteristics:**
- React component library for card game visualization and interaction
- Dual-mode state management (Context or Redux Toolkit)
- Strategy pattern for state backends enabling framework flexibility
- Declarative drag-and-drop built on dnd-kit
- Accessibility-first with ARIA and keyboard navigation

## Layers

**Component Layer:**
- Purpose: Presentation and user interaction for card game elements
- Location: `src/components/`
- Contains: React components (Card, Hand, Deck, DraggableCard, DropZone, etc.)
- Depends on: Hooks, Types, Constants, Utils, State
- Used by: Consumer applications importing this library

**Hooks Layer:**
- Purpose: Reusable stateful logic and side effects
- Location: `src/hooks/`
- Contains: Custom React hooks (useCardFlip, useContainerSize, useDragSensors, useStateBackend, etc.)
- Depends on: Types, Constants, State
- Used by: Component layer

**State Management Layer:**
- Purpose: Pure reducers and action creators for game state
- Location: `src/state/` (framework-agnostic), `src/redux/` (Redux Toolkit wrapper), `src/context/` (React Context provider)
- Contains: GameState types, reducer, actions, selectors, initial state factory
- Depends on: Types only
- Used by: Hooks, Context providers, Redux providers

**Type System Layer:**
- Purpose: TypeScript interfaces and type utilities
- Location: `src/types/`
- Contains: Card data types, DnD types, container types, type guards
- Depends on: Nothing (foundational)
- Used by: All layers

**Constants Layer:**
- Purpose: Immutable configuration values
- Location: `src/constants/`
- Contains: Suit definitions, animation presets, layout defaults, perspective values
- Depends on: Types
- Used by: Components, Hooks, Utils

**Utilities Layer:**
- Purpose: Pure helper functions
- Location: `src/utils/`
- Contains: Layout calculations, accessibility formatters
- Depends on: Types, Constants
- Used by: Components, Hooks

## Data Flow

**Controlled Component Pattern:**

1. Parent provides state via props (e.g., `isFaceUp`, `selectedCards`)
2. Component renders based on props
3. User interaction triggers callback (e.g., `onClick`, `onFlipStart`)
4. Parent updates state
5. Component re-renders with new props

**Uncontrolled Component Pattern:**

1. Component manages internal state via useState
2. User interaction updates internal state
3. Component exposes imperative API via ref (e.g., `ref.current.flip()`)
4. Optional callbacks notify parent of changes

**State Management (Dual Mode):**

**Context Mode:**
1. `GameProvider` wraps app
2. Uses React `useReducer` with pure `gameReducer`
3. Populates `StateBackendContext` with getState/dispatch/subscribe
4. Unified hooks (`useGameState`, `useLocation`, `useCard`) consume context
5. State persists to localStorage automatically

**Redux Mode:**
1. `ReduxGameProvider` wraps app
2. Uses Redux Toolkit slice with Immer mutations
3. Populates `StateBackendContext` with Redux store bindings
4. Same unified hooks work identically
5. State managed by Redux DevTools

**Drag-and-Drop Flow:**

1. `CardDndProvider` sets up dnd-kit context
2. `DraggableCard` registers draggable with card data payload
3. User initiates drag → `onDragStart` → haptic feedback, set active card
4. `CardDragOverlay` shows animated preview
5. Drag over `DroppableZone` → collision detection → validation
6. Drop → `onDragEnd` → optional reject via `onValidate` callback → haptic feedback

**State Management:**
- State is immutable (spread patterns in pure reducer, Immer in Redux slice)
- Actions are pure data objects with type/payload structure
- Selectors extract derived state

## Key Abstractions

**StateBackend Interface:**
- Purpose: Decouple state management from component logic
- Examples: `src/hooks/useStateBackend.ts`, `src/context/GameProvider.tsx`, `src/redux/ReduxGameProvider.tsx`
- Pattern: Strategy pattern - `getState()`, `dispatch(type, payload)`, `subscribe(listener)` interface implemented by both Context and Redux providers

**CardData:**
- Purpose: Canonical representation of a playing card
- Examples: `src/types/card.ts`
- Pattern: Immutable data object with `suit`, `rank` properties

**CardLayout:**
- Purpose: Positioning data for card transformations
- Examples: `src/utils/layout.ts`
- Pattern: Transform object with `x`, `y`, `rotation`, `scale`, `zIndex`

**DragItemData:**
- Purpose: Payload attached to draggable cards
- Examples: `src/types/dnd.ts`
- Pattern: Data transfer object with `card`, `type`, `sourceZoneId`

**GameState:**
- Purpose: Complete game state snapshot
- Examples: `src/state/types.ts`
- Pattern: Normalized structure with `locations` (string → CardState[]), `gamePhase`, `currentPlayer`

## Entry Points

**Main Library Export:**
- Location: `src/index.ts`
- Triggers: Import by consumer applications
- Responsibilities: Exports all public components, hooks, types, constants, utilities

**Redux Submodule Export:**
- Location: `src/redux/index.ts`
- Triggers: Import by Redux consumers via `@decentralized-games/card-components/redux`
- Responsibilities: Exports Redux-specific slice, actions, selectors, provider

**Vite Development Server:**
- Location: `index.html`
- Triggers: `npm run dev`
- Responsibilities: Demo/development environment for component testing

**Storybook:**
- Location: `.storybook/main.ts`
- Triggers: `npm run storybook`
- Responsibilities: Interactive component documentation and visual testing

## Error Handling

**Strategy:** Defensive validation with graceful degradation

**Patterns:**
- Type guards (`isSuit`, `isRank`) validate card data before parsing
- `parseCard` returns `null` for invalid strings, components handle null gracefully
- State reducer returns unchanged state for invalid actions (out-of-bounds indices)
- DnD validation via optional `onValidate` callback - rejected drops trigger `onDropReject`
- Components use optional chaining (`onFlipStart?.()`) to avoid errors when callbacks not provided

## Cross-Cutting Concerns

**Logging:** Not detected (library code - logging is consumer responsibility)

**Validation:** Type guards in `src/types/card.ts`, DnD validation via `DropValidationFn` callback, state reducer bounds checking

**Authentication:** Not applicable (component library, no auth layer)

**Animation:** Motion library (Framer Motion fork) for all animations - centralized via `useCardFlip` hook, `usePrefersReducedMotion` respects user accessibility preferences

**Accessibility:**
- ARIA labels via `formatCardForSpeech`, `formatCardLabel`, `formatFaceDownLabel` utilities
- Keyboard navigation via `useRovingTabIndex` hook
- `useKeyboardShortcuts` hook for custom shortcuts
- Screen reader announcements in `CardDndProvider`
- Focus management and `role`/`aria-*` attributes throughout

**Performance:**
- `React.memo` on `DraggableCard` (performance with 50+ cards)
- `useMemo` for expensive calculations (layout, card normalization)
- `useCallback` for stable function references
- Motion GPU-accelerated transforms (no React re-renders during animation)

**Testing:** Vitest for unit/integration tests, co-located `.test.tsx` files, Storybook for visual regression

---

*Architecture analysis: 2026-02-04*
