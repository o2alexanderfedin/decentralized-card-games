# Phase 3: Drag & Drop - Research

**Researched:** 2026-02-03
**Domain:** React drag-and-drop with @dnd-kit, touch support, performance optimization
**Confidence:** HIGH

## Summary

This phase adds drag-and-drop interactivity to the card component library using @dnd-kit/core (v6.3.1), the established React drag-and-drop toolkit. The project already uses `motion` (v12.27+, formerly framer-motion) for animations, `Card`/`Hand`/`Deck`/`CardStack`/`DropZone` components from Phases 1-2, and CSS modules for styling. The existing `DropZone` component was explicitly designed as a visual-only container in Phase 2 with comments noting Phase 3 DnD integration.

The @dnd-kit library provides a hook-based API (`useDraggable`, `useDroppable`) with a `DndContext` provider, `DragOverlay` for drag previews, configurable sensors (pointer, touch, mouse, keyboard), collision detection algorithms, and modifiers. It is intentionally NOT built on HTML5 Drag and Drop API, which is a benefit for this project since it provides consistent cross-platform behavior including touch. The library is ~10kb minified with zero external dependencies.

Key integration challenge: dnd-kit and motion/react (framer-motion) can conflict when both manage element transforms. The recommended pattern is to use dnd-kit for drag positioning and motion for non-drag animations (enter/exit, layout transitions), keeping `DragOverlay` separate from motion's `AnimatePresence`. Multi-card drag is not natively supported by dnd-kit and requires custom implementation using the `data` prop and `onDragMove` event coordination.

**Primary recommendation:** Use @dnd-kit/core v6.3.1 with separate MouseSensor + TouchSensor (not PointerSensor) for reliable cross-platform behavior, DragOverlay for drag previews, and integrate with existing motion library for snap-back and transition animations.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @dnd-kit/core | 6.3.1 | DnD context, hooks, sensors, collision detection | 5.3M weekly downloads, 16.5k stars, 10kb minified, zero deps, React-native hooks API |
| @dnd-kit/utilities | 3.2.2 | CSS.Translate.toString helper for transforms | Companion to core, avoids manual transform string building |
| @dnd-kit/modifiers | 7.0.0 | Movement constraints (axis lock, bounds, snap) | Official modifier system for restricting drag movement |
| motion | 12.27+ | Snap-back animation, enter/exit transitions, spring physics | Already in project dependencies, provides spring animations dnd-kit lacks |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @dnd-kit/sortable | 8.0.0 | Sortable list/grid presets | Only if hand card reordering via drag is needed (likely not Phase 3) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @dnd-kit/core 6.3.1 | @dnd-kit/react 0.2.1 | Next-gen rewrite, but v0.2 is pre-release with only 24 npm dependents -- NOT production-ready |
| @dnd-kit/core | react-dnd | HTML5 DnD API based -- no native touch support, requires separate touch backend, larger bundle |
| @dnd-kit/core | motion/react Reorder | Built-in to existing dep, but only supports single-list reorder, no multi-container or custom zones |

**Installation:**
```bash
npm install @dnd-kit/core @dnd-kit/utilities @dnd-kit/modifiers
```

**Note:** @dnd-kit/core requires `react` and `react-dom` as peer dependencies, which are already in the project as peer deps.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── DndProvider/           # DndContext wrapper with sensor config
│   │   ├── DndProvider.tsx
│   │   ├── DndProvider.types.ts
│   │   ├── DndProvider.test.tsx
│   │   └── index.ts
│   ├── DraggableCard/         # Card wrapped with useDraggable
│   │   ├── DraggableCard.tsx
│   │   ├── DraggableCard.types.ts
│   │   ├── DraggableCard.module.css
│   │   ├── DraggableCard.test.tsx
│   │   └── index.ts
│   ├── DragOverlay/           # Custom drag preview overlay
│   │   ├── CardDragOverlay.tsx
│   │   ├── CardDragOverlay.types.ts
│   │   ├── CardDragOverlay.module.css
│   │   ├── CardDragOverlay.test.tsx
│   │   └── index.ts
│   └── DropZone/              # EXISTING -- augmented with useDroppable
│       ├── DropZone.tsx       # Updated to integrate useDroppable
│       └── ...
├── hooks/
│   ├── useDragSensors.ts      # Sensor configuration hook
│   ├── useDragSensors.test.ts
│   ├── useHapticFeedback.ts   # Optional vibration feedback
│   └── useHapticFeedback.test.ts
└── types/
    └── dnd.ts                 # DnD-specific type definitions
```

### Pattern 1: DndContext Provider Wrapper
**What:** A thin wrapper around dnd-kit's DndContext that configures sensors, collision detection, and provides lifecycle callbacks.
**When to use:** Wrap any area where cards can be dragged between zones.
**Example:**
```typescript
// Source: https://docs.dndkit.com/api-documentation/context-provider
import { DndContext, DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { useDragSensors } from '../../hooks';

interface CardDndProviderProps {
  children: React.ReactNode;
  onDragStart?: (event: DragStartEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  onDragCancel?: () => void;
  collisionDetection?: CollisionDetection;
  autoScroll?: boolean;
}

export function CardDndProvider({ children, ...props }: CardDndProviderProps) {
  const sensors = useDragSensors();
  return (
    <DndContext sensors={sensors} {...props}>
      {children}
      <CardDragOverlay />
    </DndContext>
  );
}
```

### Pattern 2: Composable Draggable Card
**What:** Wraps existing Card component with useDraggable hook, passing card identity via `data` prop.
**When to use:** Any card that should be draggable.
**Example:**
```typescript
// Source: https://docs.dndkit.com/api-documentation/draggable/usedraggable
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../Card';

function DraggableCard({ card, id, disabled, ...cardProps }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { card, type: 'card' },
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    touchAction: 'none', // Critical for iOS Safari
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card card={card} {...cardProps} />
    </div>
  );
}
```

### Pattern 3: DragOverlay with Presentational Card
**What:** DragOverlay renders a floating clone of the dragged card, always mounted, children conditionally rendered.
**When to use:** Always -- provides smooth drag preview without affecting source layout.
**Example:**
```typescript
// Source: https://docs.dndkit.com/api-documentation/draggable/drag-overlay
import { DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';

const dropAnimation = {
  duration: 200,
  easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)', // spring-like bounce
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.5' } },
  }),
};

// ALWAYS mounted -- only children conditionally rendered
<DragOverlay dropAnimation={dropAnimation} zIndex={999}>
  {activeCard ? <Card card={activeCard} isFaceUp /> : null}
</DragOverlay>
```

### Pattern 4: Augmented DropZone with useDroppable
**What:** Extend existing DropZone to integrate useDroppable, driving visual state from isOver.
**When to use:** Every drop target zone.
**Example:**
```typescript
// Augment existing DropZone component
import { useDroppable } from '@dnd-kit/core';

function DroppableZone({ id, accepts, children, onDrop, ...props }) {
  const { setNodeRef, isOver, active } = useDroppable({
    id,
    data: { accepts },
  });

  // Derive visual state from DnD context
  const state = isOver ? 'hover' : (active ? 'active' : 'idle');

  return (
    <DropZone ref={setNodeRef} state={state} {...props}>
      {children}
    </DropZone>
  );
}
```

### Pattern 5: Dual Sensor Configuration (Mouse + Touch)
**What:** Use separate MouseSensor + TouchSensor instead of unified PointerSensor.
**When to use:** When supporting both desktop and mobile with configurable activation.
**Why:** PointerSensor cannot prevent default scrolling on touch devices via event listeners -- only `touch-action: none` CSS works. TouchSensor can use `e.preventDefault()` in touchmove. Using separate sensors gives independent configuration for each input method.
**Example:**
```typescript
// Source: https://docs.dndkit.com/api-documentation/sensors
import { useSensor, useSensors, MouseSensor, TouchSensor, KeyboardSensor } from '@dnd-kit/core';

function useDragSensors(config?: SensorConfig) {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: config?.mouseDistance ?? 5, // 5px threshold
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: config?.touchDelay ?? 200, // 200ms long-press
      tolerance: config?.touchTolerance ?? 8, // 8px finger wiggle room
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor);

  return useSensors(mouseSensor, touchSensor, keyboardSensor);
}
```

### Anti-Patterns to Avoid
- **Using PointerSensor alone for touch:** Cannot prevent scroll on iOS Safari via JS. Use MouseSensor + TouchSensor separately.
- **Conditionally rendering DragOverlay:** Drop animations will not work. Always mount DragOverlay, conditionally render its children.
- **Using motion.div drag + dnd-kit simultaneously:** Both fight for transform control. Use dnd-kit for drag positioning, motion only for non-drag animations.
- **Attaching transform via motion animate during drag:** The motion `animate` prop will conflict with dnd-kit's transform. Use inline `style.transform` from dnd-kit during drag, motion `animate` only when not dragging.
- **Measuring droppable rects during motion layout animations:** dnd-kit caches positions at drag start. If motion animates layout simultaneously, positions desync. Disable motion `layout` on droppable containers during active drag.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Transform string generation | Manual `translate3d(${x}px, ${y}px, 0)` | `CSS.Translate.toString()` from @dnd-kit/utilities | Handles null transforms, scale, consistent formatting |
| Collision detection | Custom hit-testing math | `closestCorners` / `pointerWithin` from @dnd-kit/core | Handles overlapping zones, edge cases, tested algorithms |
| Drag activation thresholds | Custom mousedown/touchstart timing | Sensor `activationConstraint` config | Handles tolerance, delay, distance with proper event cleanup |
| Scroll prevention on touch | Manual touchmove preventDefault | `touch-action: none` CSS + TouchSensor | Only reliable approach on iOS Safari; PointerSensor cannot prevent scroll via JS |
| Movement constraints | Manual bounds checking | @dnd-kit/modifiers (restrictToWindowEdges, restrictToParentElement) | Handles edge cases, scroll offsets, nested contexts |
| Accessible drag announcements | Custom aria-live regions | dnd-kit built-in `announcements` and `screenReaderInstructions` | Follows WAI-ARIA best practices for DnD accessibility |
| Auto-scrolling during drag | Custom scroll-on-edge logic | `autoScroll` prop on DndContext | Built-in direction-aware scrolling with configurable acceleration |

**Key insight:** dnd-kit was specifically designed as a modular toolkit where each piece (sensors, collision detection, modifiers, accessibility) is a composable building block. Custom solutions duplicate tested functionality and miss edge cases around coordinate systems, scroll offsets, and browser inconsistencies.

## Common Pitfalls

### Pitfall 1: iOS Safari Scroll Prevention
**What goes wrong:** Cards cannot be dragged on iOS Safari -- the page scrolls instead.
**Why it happens:** PointerSensor's event listeners cannot call preventDefault() on touch-initiated pointer events in iOS Safari. The browser ignores it.
**How to avoid:**
1. Use separate MouseSensor + TouchSensor (not PointerSensor).
2. Set `touch-action: none` on all draggable card elements via CSS.
3. If cards are in a scrollable container, apply `touch-action: none` only to drag handles.
4. Add `-webkit-touch-callout: none` to prevent iOS long-press context menu interference.
**Warning signs:** Drag works on desktop/Android but fails on iOS; intermittent drag success on iOS.

### Pitfall 2: motion + dnd-kit Transform Conflict
**What goes wrong:** Cards jump, flicker, or animate to wrong positions during drag.
**Why it happens:** Both motion's `animate` prop and dnd-kit's `transform` try to control the element's CSS transform simultaneously. motion may also animate `layout` changes that shift positions dnd-kit cached at drag start.
**How to avoid:**
1. During drag (`isDragging === true`), apply dnd-kit transform via inline `style`, not motion `animate`.
2. When not dragging, use motion `animate` for layout transitions.
3. Disable motion `layout` prop on elements participating in active drag.
4. Keep DragOverlay separate from motion AnimatePresence.
**Warning signs:** Cards snap to origin briefly during drag; layout animations cause items to shift unexpectedly.

### Pitfall 3: Re-render Cascade with Many Droppables
**What goes wrong:** Dragging 50+ cards causes visible jank (dropped frames, stuttering).
**Why it happens:** When a dragged element crosses a droppable boundary, dnd-kit triggers re-renders in all components using useDraggable/useDroppable within the DndContext. With 50+ cards that are all droppable targets, this causes a cascade.
**How to avoid:**
1. Wrap draggable card components in `React.memo` with appropriate comparison.
2. Use `DragOverlay` for the drag preview (avoids re-rendering the source list during drag).
3. Minimize the number of droppable containers -- zones are droppable, individual cards in a hand are NOT.
4. Use `useMemo` for sensor and modifier arrays to prevent DndContext from re-initializing.
5. Throttle `onDragMove` callbacks to ~60fps (16ms interval) if doing custom position calculations.
**Warning signs:** React DevTools shows many re-renders during drag; performance tab shows long tasks > 16ms.

### Pitfall 4: DragOverlay Conditional Rendering Breaks Drop Animation
**What goes wrong:** No smooth animation when card is dropped -- it teleports to destination.
**Why it happens:** Developers conditionally render `<DragOverlay>` itself instead of its children. When unmounted, it cannot perform its drop transition.
**How to avoid:** Always mount `<DragOverlay>`. Conditionally render only the children:
```tsx
<DragOverlay>{activeCard ? <Card card={activeCard} /> : null}</DragOverlay>
```
**Warning signs:** Drop works but looks jarring; no transition when releasing card.

### Pitfall 5: Testing DnD in jsdom (Vitest)
**What goes wrong:** Drag tests fail or are impossible to write with fireEvent.
**Why it happens:** dnd-kit uses pointer/mouse/touch sensors that rely on `getBoundingClientRect()`, which returns zeros in jsdom. Standard drag HTML5 events don't work because dnd-kit doesn't use HTML5 DnD API.
**How to avoid:**
1. Test drag interactions using **KeyboardSensor** (Space to pick up, arrows to move, Space to drop).
2. For non-keyboard tests, mock `getBoundingClientRect` on relevant elements.
3. Test DnD lifecycle callbacks (onDragStart, onDragEnd) by rendering DndContext with mock handlers.
4. Reserve full drag interaction tests for E2E (Playwright).
**Warning signs:** Tests pass locally but fail in CI; fireEvent.dragStart has no effect.

### Pitfall 6: Haptic Feedback on iOS
**What goes wrong:** `navigator.vibrate()` silently fails on iOS Safari.
**Why it happens:** iOS Safari does not support the Web Vibration API (as of early 2026). No iOS browser does, since all use WebKit.
**How to avoid:**
1. Always feature-detect: `if ('vibrate' in navigator) { navigator.vibrate(50); }`
2. Document that haptic feedback only works on Android browsers.
3. Do not make haptic feedback a required user experience element.
**Warning signs:** No vibration on any iOS device, regardless of browser.

## Code Examples

Verified patterns from official sources:

### Complete DndContext Setup with Sensors
```typescript
// Source: https://docs.dndkit.com/api-documentation/context-provider
// Source: https://docs.dndkit.com/api-documentation/sensors
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';

const dropAnimationConfig = {
  duration: 200,
  easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.5' } },
  }),
};

function GameBoard({ children }: { children: React.ReactNode }) {
  const [activeCard, setActiveCard] = useState<CardData | null>(null);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 5 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 8 },
  });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const handleDragStart = (event: DragStartEvent) => {
    const card = event.active.data.current?.card;
    if (card) setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return; // Dropped outside any zone

    // Developer handles the actual state change
    const card = active.data.current?.card;
    const targetZone = over.id;
    // ... game logic callback
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeCard ? <Card card={activeCard} isFaceUp /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

### useDraggable Card with Touch Support
```typescript
// Source: https://docs.dndkit.com/api-documentation/draggable/usedraggable
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableCardProps {
  id: string;
  card: CardData;
  disabled?: boolean;
}

function DraggableCard({ id, card, disabled }: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
    data: { card, type: 'card' },
    disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1, // Hidden when DragOverlay shows clone
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none', // CRITICAL for iOS Safari
    WebkitTouchCallout: 'none', // Prevent iOS context menu
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Card card={card} isFaceUp />
    </div>
  );
}
```

### useDroppable Zone with Validation
```typescript
// Source: https://docs.dndkit.com/api-documentation/droppable/usedroppable
import { useDroppable } from '@dnd-kit/core';

interface DroppableZoneProps {
  id: string;
  accepts?: string[]; // Card types this zone accepts
  onValidate?: (card: CardData) => boolean;
  children?: React.ReactNode;
}

function DroppableZone({ id, accepts, onValidate, children }: DroppableZoneProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id,
    data: { accepts, onValidate },
  });

  // Determine visual state from DnD context
  let visualState: DropZoneVisualState = 'idle';
  if (active) {
    // Something is being dragged somewhere
    const draggedCard = active.data.current?.card;
    const isAccepted = accepts
      ? accepts.includes(active.data.current?.type)
      : true;
    const isValid = onValidate && draggedCard
      ? onValidate(draggedCard)
      : isAccepted;

    visualState = isOver
      ? (isValid ? 'hover' : 'idle') // Show hover only if valid
      : 'active'; // Something dragging, but not over this zone
  }

  return (
    <DropZone ref={setNodeRef} state={visualState} label={id}>
      {children}
    </DropZone>
  );
}
```

### Multi-Card Drag Pattern
```typescript
// Source: Community pattern from GitHub Issue #120 and Discussion #1313
// Confidence: MEDIUM - community solution, not officially documented

interface MultiDragState {
  selectedIds: Set<string>;
  activeId: string | null;
}

function handleDragStart(event: DragStartEvent, state: MultiDragState) {
  const draggedId = String(event.active.id);
  state.activeId = draggedId;

  // If dragged card isn't selected, clear selection and select only it
  if (!state.selectedIds.has(draggedId)) {
    state.selectedIds = new Set([draggedId]);
  }
  // Otherwise, drag all selected cards together
}

function handleDragEnd(event: DragEndEvent, state: MultiDragState) {
  const { over } = event;
  if (over && state.selectedIds.size > 0) {
    // Move all selected cards to target zone
    const cardsToMove = Array.from(state.selectedIds);
    // ... batch move logic
  }
  state.activeId = null;
}

// DragOverlay shows stack preview for multi-drag
function MultiCardOverlay({ selectedCards }: { selectedCards: CardData[] }) {
  if (selectedCards.length === 0) return null;
  if (selectedCards.length === 1) {
    return <Card card={selectedCards[0]} isFaceUp />;
  }
  return (
    <div style={{ position: 'relative' }}>
      {selectedCards.slice(0, 3).map((card, i) => (
        <div key={i} style={{
          position: i === 0 ? 'relative' : 'absolute',
          top: i * 4,
          left: i * 2,
          zIndex: selectedCards.length - i,
        }}>
          <Card card={card} isFaceUp />
        </div>
      ))}
      {selectedCards.length > 3 && (
        <span className="badge">+{selectedCards.length - 3}</span>
      )}
    </div>
  );
}
```

### Keyboard Testing Pattern for Vitest
```typescript
// Source: https://docs.dndkit.com/api-documentation/sensors/keyboard
// Source: https://github.com/clauderic/dnd-kit/issues/261
import { render, fireEvent, screen } from '@testing-library/react';

test('card can be dragged to drop zone via keyboard', () => {
  const onDrop = vi.fn();
  render(
    <CardDndProvider onDragEnd={onDrop}>
      <DraggableCard id="card-1" card={{ suit: 'spades', rank: 'A' }} />
      <DroppableZone id="discard" />
    </CardDndProvider>
  );

  const card = screen.getByRole('button'); // useDraggable sets role="button"

  // Pick up card
  card.focus();
  fireEvent.keyDown(card, { code: 'Space' });

  // Move to target (keyboard sensor uses arrow keys)
  fireEvent.keyDown(card, { code: 'ArrowRight' });

  // Drop card
  fireEvent.keyDown(card, { code: 'Space' });

  expect(onDrop).toHaveBeenCalled();
});
```

### Haptic Feedback with Feature Detection
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate
// Note: Does NOT work on iOS Safari (any version)

function useHapticFeedback(enabled: boolean = true) {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  return {
    isSupported,
    onPickup: () => {
      if (enabled && isSupported) navigator.vibrate(50);
    },
    onHover: () => {
      if (enabled && isSupported) navigator.vibrate(20);
    },
    onDrop: () => {
      if (enabled && isSupported) navigator.vibrate([30, 20, 30]);
    },
    onReject: () => {
      if (enabled && isSupported) navigator.vibrate([50, 30, 50]);
    },
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| HTML5 DnD API (react-dnd, react-beautiful-dnd) | dnd-kit with custom sensors | 2021+ | Consistent touch support, no need for separate backends |
| react-beautiful-dnd | dnd-kit or pragmatic-drag-and-drop | 2022 (deprecated) | react-beautiful-dnd is unmaintained; dnd-kit is the standard replacement |
| framer-motion package name | motion package name | 2024 (v11+) | Import from 'motion/react' not 'framer-motion' -- project already uses new import |
| PointerSensor for all inputs | MouseSensor + TouchSensor split | Ongoing best practice | Better scroll handling on iOS Safari, independent activation configs |
| @dnd-kit/core 6.x | @dnd-kit/react 0.2.x (future) | In progress | Next-gen API but NOT ready for production (sub-1.0, 24 npm dependents) |

**Deprecated/outdated:**
- **react-beautiful-dnd:** Unmaintained since 2022. Do not use.
- **PointerSensor as sole sensor for touch:** Causes scroll issues on iOS Safari. Split into Mouse + Touch.
- **dragSourceOpacity on DragOverlay:** Deprecated in @dnd-kit/core 6.0. Use `defaultDropAnimationSideEffects` instead.
- **framer-motion import path:** Use `import { motion } from 'motion/react'` (already in project).

## Open Questions

Things that couldn't be fully resolved:

1. **Multi-card drag: selection method for touch devices**
   - What we know: Click/Ctrl+Click works for desktop multi-select. dnd-kit has no built-in multi-drag.
   - What's unclear: Best touch gesture for multi-select (long-press to enter selection mode? Checkbox UI?). Community solutions use data prop + onDragMove but no standard pattern exists.
   - Recommendation: Implement single-card drag first. Multi-card drag should use a selection mode toggle (tap to select/deselect, then drag any selected card to move all). This avoids gesture conflicts with the drag itself.

2. **@dnd-kit/react migration timeline**
   - What we know: @dnd-kit/react v0.2.x is the next-gen API. It's being actively developed.
   - What's unclear: When will it reach 1.0? Will @dnd-kit/core 6.x be maintained?
   - Recommendation: Build on @dnd-kit/core 6.3.1 now. Abstract DnD integration behind our own provider/hook interfaces so migration to @dnd-kit/react is a localized change.

3. **Auto-scroll reliability with DragOverlay**
   - What we know: Auto-scroll has known issues with React 18, sticky parents, and small containers.
   - What's unclear: Whether our card game layout (likely a single viewport, no scroll) needs auto-scroll at all.
   - Recommendation: Default `autoScroll` to `false` for card games (most game boards fit in viewport). Expose as configurable option for developers who need it.

4. **Performance at exactly 50+ cards threshold**
   - What we know: React.memo + DragOverlay is the standard optimization. dnd-kit has a known re-render issue (#389) when many droppables exist.
   - What's unclear: Whether 50+ draggable cards (without being 50+ droppable zones) hits the performance wall.
   - Recommendation: Make individual cards draggable but NOT droppable. Only zones (Hand, Deck, DropZone) are droppable. This keeps droppable count low (typically 4-8 zones) even with many cards. Add React.memo to DraggableCard.

## Sources

### Primary (HIGH confidence)
- [@dnd-kit/core docs](https://docs.dndkit.com) - DndContext API, useDraggable, useDroppable, DragOverlay, sensors, collision detection
- [@dnd-kit/core npm](https://www.npmjs.com/package/@dnd-kit/core) - Version 6.3.1, peer deps, download stats
- [dnd-kit GitHub](https://github.com/clauderic/dnd-kit) - 16.5k stars, latest release @dnd-kit/react@0.2.3 (Jan 2026)
- [dnd-kit sensor docs - Pointer](https://docs.dndkit.com/api-documentation/sensors/pointer) - Touch-action requirements
- [dnd-kit sensor docs - Touch](https://docs.dndkit.com/api-documentation/sensors/touch) - Delay/tolerance configuration
- [dnd-kit DragOverlay docs](https://docs.dndkit.com/api-documentation/draggable/drag-overlay) - Always-mounted pattern, dropAnimation config
- [dnd-kit collision detection docs](https://docs.dndkit.com/api-documentation/context-provider/collision-detection-algorithms) - closestCorners for overlapping zones
- [dnd-kit modifiers docs](https://docs.dndkit.com/api-documentation/modifiers) - Built-in modifiers, restrictToWindowEdges
- [MDN Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate) - navigator.vibrate() API
- [Can I Use - Vibration API](https://caniuse.com/vibration) - No iOS Safari support

### Secondary (MEDIUM confidence)
- [dnd-kit + framer-motion integration](https://github.com/clauderic/dnd-kit/issues/605) - Layout animation approach
- [dnd-kit Issue #969](https://github.com/clauderic/dnd-kit/issues/969) - framer-motion integration challenges
- [dnd-kit Issue #791](https://github.com/clauderic/dnd-kit/issues/791) - Haptic touch on iOS Chrome fix (-webkit-touch-callout: none)
- [dnd-kit Issue #389](https://github.com/clauderic/dnd-kit/issues/389) - Performance with many droppables
- [dnd-kit Issue #261](https://github.com/clauderic/dnd-kit/issues/261) - Testing with React Testing Library
- [motion.dev React docs](https://motion.dev/docs/react) - motion package v12+ API

### Tertiary (LOW confidence)
- [dnd-kit Issue #120](https://github.com/clauderic/dnd-kit/issues/120) - Multi-select drag feature request and community workarounds
- [dnd-kit Discussion #1313](https://github.com/clauderic/dnd-kit/discussions/1313) - Multiple draggable elements patterns
- [StudyRaid - render optimization](https://app.studyraid.com/en/read/12149/389977/render-optimization-techniques) - Throttling/memoization patterns for dnd-kit (third-party guide)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - @dnd-kit/core is the de facto React DnD library with 5M+ weekly downloads, verified via npm and official docs
- Architecture: HIGH - Patterns derived from official documentation (DndContext, useDraggable, useDroppable, DragOverlay)
- Pitfalls: HIGH - iOS Safari touch issues, DragOverlay mount requirement, and motion conflict documented in official docs and verified GitHub issues
- Multi-card drag: MEDIUM - Community patterns only, no official API support
- Performance: MEDIUM - Known issue documented, optimization patterns from community and official guidance
- Haptic feedback: HIGH - iOS Safari Vibration API absence confirmed via Can I Use and MDN

**Research date:** 2026-02-03
**Valid until:** 2026-03-05 (30 days -- @dnd-kit/core 6.x is stable; watch for @dnd-kit/react 1.0 announcement)
