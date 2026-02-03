# Architecture Research

**Domain:** React Card Component Library
**Researched:** 2026-02-02
**Confidence:** HIGH

## System Overview

```
+-----------------------------------------------------------------------+
|                        CONSUMER APPLICATION                           |
+-----------------------------------------------------------------------+
|                                                                       |
|  +-------------------------+    +----------------------------------+  |
|  |    CardLibraryProvider  |    |        Redux Store               |  |
|  |    (Context + Config)   |    |   (Optional Integration)         |  |
|  +------------+------------+    +----------------+-----------------+  |
|               |                                  |                    |
+---------------+----------------------------------+--------------------+
                |                                  |
+---------------v----------------------------------v--------------------+
|                        LIBRARY CORE                                   |
+-----------------------------------------------------------------------+
|                                                                       |
|  +------------------+  +------------------+  +-------------------+    |
|  |   DndContext     |  |   AnimationCtx   |  |   ThemeContext    |    |
|  |   (dnd-kit)      |  |   (Motion)       |  |   (Styling)       |    |
|  +--------+---------+  +--------+---------+  +---------+---------+    |
|           |                     |                      |              |
+-----------------------------------------------------------------------+
|                                                                       |
|  +-----------+  +-----------+  +-----------+  +----------------+      |
|  |   Card    |  |   Deck    |  |   Hand    |  |   DragOverlay  |      |
|  +-----------+  +-----------+  +-----------+  +----------------+      |
|  +-----------+  +-----------+  +-----------+  +----------------+      |
|  | CardFace  |  | CardStack |  | CardFan   |  | DropZone       |      |
|  +-----------+  +-----------+  +-----------+  +----------------+      |
|                                                                       |
+-----------------------------------------------------------------------+
|                        HOOKS LAYER                                    |
|  +-------------+  +-------------+  +-------------+  +-------------+   |
|  | useDraggable|  | useDroppable|  | useCardFlip |  | useCardAnim |   |
|  +-------------+  +-------------+  +-------------+  +-------------+   |
+-----------------------------------------------------------------------+
```

## Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| `CardLibraryProvider` | Root provider wrapping all contexts (DnD, Animation, Theme) | Consumer app root |
| `Card` | Single card unit with flip, drag, visual state | Hand, Deck, DragOverlay |
| `CardFace` | Front/back face rendering with emoji suits | Card |
| `Deck` | Stack of cards with draw/shuffle actions | Card, DropZone |
| `Hand` | Fan layout of cards owned by player | Card, DropZone |
| `CardStack` | Visual stacked cards (discard pile, etc.) | Card |
| `DragOverlay` | Dragged card visual during drag operations | DndContext |
| `DropZone` | Generic droppable area for cards | Card, DndContext |

## Recommended Project Structure

```
src/
+-- index.ts                    # Public API exports
+-- components/                 # React components
|   +-- Card/
|   |   +-- Card.tsx            # Main card component
|   |   +-- CardFace.tsx        # Face rendering (front/back)
|   |   +-- CardFlip.tsx        # Flip animation wrapper
|   |   +-- Card.types.ts       # Card-specific types
|   |   +-- Card.test.tsx       # Component tests
|   |   +-- index.ts            # Component barrel export
|   +-- Deck/
|   |   +-- Deck.tsx
|   |   +-- Deck.types.ts
|   |   +-- index.ts
|   +-- Hand/
|   |   +-- Hand.tsx
|   |   +-- HandLayout.tsx      # Fan/spread layout logic
|   |   +-- Hand.types.ts
|   |   +-- index.ts
|   +-- DragLayer/
|   |   +-- DragOverlay.tsx     # Custom drag preview
|   |   +-- index.ts
|   +-- DropZone/
|   |   +-- DropZone.tsx
|   |   +-- index.ts
|   +-- Provider/
|       +-- CardLibraryProvider.tsx
|       +-- index.ts
+-- hooks/                      # Custom hooks
|   +-- useDraggableCard.ts     # Card-specific drag behavior
|   +-- useDroppableZone.ts     # Zone-specific drop behavior
|   +-- useCardFlip.ts          # Flip animation state
|   +-- useCardAnimation.ts     # General animation utilities
|   +-- useDeck.ts              # Deck operations (draw, shuffle)
|   +-- useHand.ts              # Hand management
|   +-- index.ts
+-- redux/                      # Redux integration (optional)
|   +-- slices/
|   |   +-- cardsSlice.ts       # Card entity state
|   |   +-- gameSlice.ts        # Game flow state
|   +-- selectors/
|   |   +-- cardSelectors.ts    # Memoized card selectors
|   +-- middleware/
|   |   +-- cardMiddleware.ts   # Side effects (animations, sounds)
|   +-- index.ts
+-- types/                      # Shared TypeScript types
|   +-- card.ts                 # Card, Suit, Rank types
|   +-- events.ts               # Drag/drop event types
|   +-- index.ts
+-- utils/                      # Utility functions
|   +-- deck.ts                 # Shuffle, deal algorithms
|   +-- layout.ts               # Fan/spread calculations
|   +-- index.ts
+-- constants/                  # Library constants
|   +-- suits.ts                # Emoji mappings
|   +-- animations.ts           # Animation presets
|   +-- index.ts
```

### Structure Rationale

- **components/:** Feature-based organization with co-located types and tests. Each component folder is self-contained.
- **hooks/:** Separated from components to enable use without UI (headless pattern). Consumers can build custom UIs using just hooks.
- **redux/:** Optional integration layer. Library works without Redux but provides slices/selectors for consumers who want it.
- **types/:** Shared types exported publicly for consumer TypeScript integration.
- **utils/:** Pure functions for deck operations, layout math. No React dependencies.

## Architectural Patterns

### Pattern 1: Compound Components

**What:** Break complex Card into composable sub-components that share implicit state.
**When to use:** When Card needs to be customizable (custom faces, animations, overlays).
**Trade-offs:** More flexible API, but requires careful context management.

**Example:**
```typescript
// Compound component API
<Card id="ace-spades" data={aceOfSpades}>
  <Card.Face side="front">
    <Card.Rank />
    <Card.Suit />
  </Card.Face>
  <Card.Face side="back">
    <CustomBackDesign />
  </Card.Face>
</Card>

// Simple API (for common cases)
<Card id="ace-spades" data={aceOfSpades} />
```

### Pattern 2: Headless Hooks + Render Props

**What:** Provide hooks that return props to spread onto elements, separating logic from markup.
**When to use:** When consumers need maximum styling control.
**Trade-offs:** More verbose for consumers, but complete flexibility.

**Example:**
```typescript
// Headless hook pattern (inspired by dnd-kit)
function MyCard({ card }) {
  const { attributes, listeners, isDragging, transform } = useDraggableCard({
    id: card.id,
    data: card,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform) }}
      {...attributes}
      {...listeners}
    >
      {/* Custom rendering */}
    </div>
  );
}
```

### Pattern 3: Provider + Context Composition

**What:** Single root provider that composes multiple contexts internally.
**When to use:** Always - simplifies consumer setup.
**Trade-offs:** Less granular control, but dramatically simpler integration.

**Example:**
```typescript
// Internal composition
export function CardLibraryProvider({ children, config }) {
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter}>
      <AnimationProvider spring={config.spring}>
        <ThemeProvider theme={config.theme}>
          {children}
        </ThemeProvider>
      </AnimationProvider>
    </DndContext>
  );
}

// Consumer usage - one provider
function App() {
  return (
    <CardLibraryProvider config={cardLibConfig}>
      <GameBoard />
    </CardLibraryProvider>
  );
}
```

### Pattern 4: Redux Slice Pattern (Optional Integration)

**What:** Provide pre-built Redux slices consumers can add to their store.
**When to use:** When consumers use Redux and want managed card state.
**Trade-offs:** Coupling to Redux, but powerful state management.

**Example:**
```typescript
// Library exports slice
export const cardsSlice = createSlice({
  name: 'cards',
  initialState: {
    byId: {},
    allIds: [],
    locations: {}, // cardId -> location ('deck' | 'hand-0' | 'table')
  },
  reducers: {
    addCard: (state, action) => { /* ... */ },
    moveCard: (state, action) => { /* ... */ },
    flipCard: (state, action) => { /* ... */ },
  },
});

// Consumer integrates
const store = configureStore({
  reducer: {
    cards: cardsSlice.reducer,
    game: gameSlice.reducer, // their own slice
  },
});
```

## Data Flow

### Drag and Drop Flow

```
[User Drags Card]
    |
    v
[useDraggableCard hook] --> [DndContext captures drag start]
    |                              |
    v                              v
[Card.isDragging = true]    [DragOverlay renders clone]
    |
    v
[User moves pointer]
    |
    v
[DndContext tracks position] --> [Collision detection runs]
    |                                    |
    v                                    v
[DragOverlay follows cursor]    [DropZone.isOver updates]
    |
    v
[User releases]
    |
    v
[onDragEnd fires] --> [Consumer handles state change]
    |                         |
    v                         v
[Reset drag state]     [Update card location in Redux/state]
```

### State Management Options

```
Option A: Internal Context (Default)
----------------------------------
CardLibraryProvider
    |
    +--> CardContext (positions, visibility)
    |
    +--> DndContext (drag state)
    |
    +--> Components read from context

Option B: Redux Integration
---------------------------
Consumer Redux Store
    |
    +--> cards slice (provided by library)
    |        |
    |        +--> byId: { [cardId]: CardData }
    |        +--> allIds: string[]
    |        +--> locations: { [cardId]: LocationId }
    |
    +--> Components use useSelector + library hooks
```

### Key Data Flows

1. **Card Movement:** User drags -> onDragEnd callback -> consumer dispatches action -> Redux updates location -> components re-render
2. **Card Flip:** User clicks/triggers flip -> useCardFlip toggles state -> Motion animates transform -> face visibility changes
3. **Deck Shuffle:** Consumer calls shuffle action -> reducer randomizes allIds order -> deck component re-renders with animation

## API Design Recommendation

### Primary API: Hooks + Components

**For maximum flexibility, expose both hooks and components:**

```typescript
// Hooks for custom implementations
import {
  useDraggableCard,
  useDroppableZone,
  useCardFlip,
  useDeck,
  useHand
} from 'card-library';

// Components for quick integration
import {
  Card,
  Deck,
  Hand,
  DropZone,
  CardLibraryProvider
} from 'card-library';

// Redux integration (optional)
import {
  cardsSlice,
  cardSelectors,
  createCardMiddleware
} from 'card-library/redux';

// Types for TypeScript users
import type {
  CardData,
  Suit,
  Rank,
  DragEvent
} from 'card-library';
```

### Layered API Strategy

| Layer | Export | Use Case |
|-------|--------|----------|
| **Components** | `<Card>`, `<Deck>`, `<Hand>` | Quick integration, standard look |
| **Hooks** | `useDraggableCard`, `useCardFlip` | Custom UI, full control |
| **Redux** | `cardsSlice`, `cardSelectors` | Redux users, complex state |
| **Utils** | `shuffle`, `createDeck` | Headless/logic only |
| **Types** | `CardData`, `Suit` | TypeScript integration |

## Build Order (Dependencies)

```
Phase 1: Foundation
-------------------
1. types/           # No dependencies - define all types first
2. constants/       # Emoji suits, animation presets
3. utils/           # Pure functions (shuffle, layout math)

Phase 2: Core Infrastructure
----------------------------
4. hooks/useCardFlip.ts        # Animation state (uses Motion)
5. hooks/useCardAnimation.ts   # General animation utilities
6. components/Provider/        # CardLibraryProvider (wraps DndContext)

Phase 3: Base Components
------------------------
7. components/Card/CardFace.tsx   # Stateless face rendering
8. components/Card/Card.tsx       # Main card (uses hooks)
9. components/DragLayer/          # DragOverlay wrapper

Phase 4: Container Components
-----------------------------
10. components/DropZone/    # Generic drop target
11. hooks/useDraggableCard  # Card-specific drag (wraps dnd-kit)
12. hooks/useDroppableZone  # Zone-specific drop

Phase 5: Complex Components
---------------------------
13. components/Deck/        # Uses Card, DropZone
14. components/Hand/        # Uses Card, layout utils
15. hooks/useDeck           # Deck operations
16. hooks/useHand           # Hand management

Phase 6: Redux Integration (Optional)
-------------------------------------
17. redux/slices/cardsSlice   # Card entity management
18. redux/selectors/          # Memoized selectors
19. redux/middleware/         # Animation side effects

Phase 7: Package & Export
-------------------------
20. index.ts                  # Public API surface
```

### Build Order Rationale

- **Types first:** Everything depends on type definitions
- **Utils before hooks:** Hooks use utility functions
- **Provider before components:** Components need context
- **Simple before complex:** Card before Deck, CardFace before Card
- **Redux last:** Optional layer, doesn't block core functionality

## Package Structure Recommendation

### Single Package (Recommended for This Project)

```
card-library/
+-- package.json
+-- src/
|   +-- index.ts          # Main exports
|   +-- redux/index.ts    # Optional Redux exports
+-- dist/
    +-- index.js          # ESM bundle
    +-- index.cjs         # CJS bundle
    +-- index.d.ts        # TypeScript declarations
```

**Why single package:**
- Library is focused (card components only)
- Simpler versioning and publishing
- Consumers import what they need via tree-shaking
- Less setup complexity for a greenfield project

### Export Strategy

```typescript
// src/index.ts - Main public API
// Components
export { Card } from './components/Card';
export { Deck } from './components/Deck';
export { Hand } from './components/Hand';
export { DropZone } from './components/DropZone';
export { CardLibraryProvider } from './components/Provider';

// Hooks
export { useDraggableCard } from './hooks/useDraggableCard';
export { useDroppableZone } from './hooks/useDroppableZone';
export { useCardFlip } from './hooks/useCardFlip';
export { useDeck } from './hooks/useDeck';
export { useHand } from './hooks/useHand';

// Utils
export { createDeck, shuffle } from './utils/deck';

// Types
export type { CardData, Suit, Rank, CardLocation } from './types';
```

```typescript
// src/redux/index.ts - Optional Redux integration
export { cardsSlice, cardsReducer } from './slices/cardsSlice';
export { cardSelectors } from './selectors/cardSelectors';
export { createCardMiddleware } from './middleware/cardMiddleware';
export type { CardsState } from './slices/cardsSlice';
```

**package.json exports field:**
```json
{
  "name": "card-library",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./redux": {
      "import": "./dist/redux/index.js",
      "require": "./dist/redux/index.cjs",
      "types": "./dist/redux/index.d.ts"
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

## Anti-Patterns

### Anti-Pattern 1: Storing Card Images as Assets

**What people do:** Bundle card images (PNG/SVG) in the library
**Why it's wrong:** Bloats bundle size, limits customization, complicates theming
**Do this instead:** Use emoji-based suits, allow consumers to provide custom renderers

### Anti-Pattern 2: Tight Redux Coupling

**What people do:** Require Redux as a dependency, components internally dispatch
**Why it's wrong:** Forces Redux on all consumers, breaks encapsulation
**Do this instead:** Use internal context by default, provide Redux integration as optional layer

### Anti-Pattern 3: Monolithic Card Component

**What people do:** Single `<Card>` with 20+ props for every feature
**Why it's wrong:** Prop explosion, hard to extend, poor tree-shaking
**Do this instead:** Compound components + hooks for composition

### Anti-Pattern 4: HTML5 Drag and Drop API

**What people do:** Use native drag and drop for "simplicity"
**Why it's wrong:** No touch support, inconsistent cross-browser, can't customize drag preview
**Do this instead:** Use dnd-kit which abstracts these problems

### Anti-Pattern 5: Animating with State Changes

**What people do:** Trigger animations by changing React state, causing re-renders
**Why it's wrong:** Poor performance, janky animations, complex state management
**Do this instead:** Use Motion/Framer Motion with transform-based animations

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1-52 cards | Default architecture handles this trivially |
| 52-500 cards | Consider virtualization for Hand component |
| 500+ cards | Virtualized lists, normalized Redux state essential |

### Scaling Priorities

1. **First bottleneck:** Re-renders during drag. Fix with React.memo and stable callbacks.
2. **Second bottleneck:** Large hands causing layout thrashing. Fix with virtualization.

## Sources

### High Confidence (Official Documentation)
- [dnd-kit Documentation](https://docs.dndkit.com) - Core DnD architecture patterns
- [Redux FAQ: Organizing State](https://redux.js.org/faq/organizing-state) - Normalization patterns

### Medium Confidence (Verified Tutorials)
- [React Component Libraries 2026 - Builder.io](https://www.builder.io/blog/react-component-libraries-2026)
- [State Management in 2026 - Nucamp](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns)
- [Motion (Framer Motion) Documentation](https://motion.dev/docs/react)
- [React DnD with Redux Example](https://github.com/jcolemorrison/react-dnd-redux-example)
- [Monorepo React Component Library](https://github.com/gstvribs/monorepo-react-component-library)

### Medium Confidence (Community Patterns)
- [Kent C. Dodds: How to Use React Context Effectively](https://kentcdodds.com/blog/how-to-use-react-context-effectively)
- [Top Drag-and-Drop Libraries for React - Puck](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)

---
*Architecture research for: React Card Component Library*
*Researched: 2026-02-02*
