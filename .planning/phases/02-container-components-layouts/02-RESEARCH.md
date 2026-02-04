# Phase 2: Container Components & Layouts - Research

**Researched:** 2026-02-03
**Domain:** React Container Components, CSS Layout Algorithms, Card Hand/Deck/Stack Patterns
**Confidence:** HIGH

## Summary

This phase builds container components (Hand, Deck, CardStack, DropZone) that wrap the Phase 1 `Card` component and arrange multiple cards visually. The core technical challenges are: (1) implementing fan arc and spread layout algorithms using CSS transforms and trigonometric calculations, (2) building responsive containers that adapt card sizing and spacing based on available width using ResizeObserver, (3) managing z-index stacking contexts for proper card layering, and (4) providing consistent controlled/uncontrolled APIs with imperative ref handles matching the Phase 1 pattern.

The existing codebase already uses Motion (v12.27+) with `motion/react` imports, CSS Modules for styling, and the `forwardRef` + `useImperativeHandle` pattern. Phase 2 should continue these patterns. For card enter/exit animations (drawing, adding), Motion's `AnimatePresence` with `mode="popLayout"` and `layout` prop is the standard approach. Staggered fan/spread animations use Motion's variant system with `staggerChildren`.

No new dependencies are required. The existing stack (React 18/19, TypeScript 5.8, Motion ^12.27, CSS Modules, Vitest 3.x) covers all needs. Layout calculations are pure math utilities that require no external libraries.

**Primary recommendation:** Build layout utilities as pure functions (no DOM dependency), container components as thin wrappers around `<Card>` with CSS transforms driven by layout calculations, and use ResizeObserver for responsive adaptation. Keep Motion's `AnimatePresence` + `layout` prop for smooth card add/remove transitions.

## Standard Stack

The established libraries/tools for this phase:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^18.0 \|\| ^19.0 | UI Framework | Already a peer dependency from Phase 1 |
| TypeScript | ^5.8 | Type Safety | Strict mode, generics for container props |
| Motion | ^12.27 | Animation Library | AnimatePresence, layout animations, stagger variants |
| CSS Modules | (built-in) | Component Styles | Already used by Card component, scoped by default |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | ^3.0 | Testing | Container component tests, layout utility tests |
| @testing-library/react | ^16.2 | Component Testing | User-centric interaction testing for containers |

### No New Dependencies Needed

| Problem | Considered | Use Instead | Why |
|---------|------------|-------------|-----|
| Resize observation | `use-resize-observer` npm pkg (648B) | Custom `useContainerSize` hook (~20 lines) | Avoid dependency for trivial ResizeObserver wrapper; project is a library |
| Layout calculations | External layout lib | Pure utility functions | Simple trigonometry, no library needed |
| Container queries | CSS `@container` | ResizeObserver + inline styles | CSS container queries cannot set CSS custom properties dynamically per card; we need programmatic per-card transforms |

**Installation:**
```bash
# No new packages needed - all deps from Phase 1 are sufficient
```

## Architecture Patterns

### Recommended Project Structure

```
src/
+-- components/
|   +-- Card/                  # Phase 1 (existing)
|   +-- Hand/                  # CNTR-01: Player hand container
|   |   +-- Hand.tsx           # Main hand component
|   |   +-- Hand.module.css    # Hand styles
|   |   +-- Hand.types.ts      # Hand-specific types
|   |   +-- Hand.test.tsx      # Component tests
|   |   +-- index.ts           # Barrel export
|   +-- Deck/                  # CNTR-02: Card deck/stack
|   |   +-- Deck.tsx
|   |   +-- Deck.module.css
|   |   +-- Deck.types.ts
|   |   +-- Deck.test.tsx
|   |   +-- index.ts
|   +-- CardStack/             # CNTR-03: Visual card stack
|   |   +-- CardStack.tsx
|   |   +-- CardStack.module.css
|   |   +-- CardStack.types.ts
|   |   +-- CardStack.test.tsx
|   |   +-- index.ts
|   +-- DropZone/              # CNTR-04: Droppable area
|   |   +-- DropZone.tsx
|   |   +-- DropZone.module.css
|   |   +-- DropZone.types.ts
|   |   +-- DropZone.test.tsx
|   |   +-- index.ts
|   +-- index.ts               # Updated barrel export for all components
+-- hooks/
|   +-- useCardFlip.ts         # Phase 1 (existing)
|   +-- usePrefersReducedMotion.ts  # Phase 1 (existing)
|   +-- useContainerSize.ts    # NEW: ResizeObserver-based container measurement
|   +-- index.ts               # Updated barrel export
+-- utils/                     # NEW: Layout calculation utilities
|   +-- layout.ts              # LYOT-01/02/03/04: Fan, spread, stack calculations
|   +-- layout.test.ts         # Pure function tests (no DOM needed)
|   +-- index.ts               # Barrel export
+-- types/
|   +-- card.ts                # Phase 1 (existing)
|   +-- containers.ts          # NEW: Shared container types (CardInput, etc.)
|   +-- index.ts               # Updated barrel export
+-- constants/
|   +-- layouts.ts             # NEW: Layout preset constants
|   +-- index.ts               # Updated barrel export
```

### Pattern 1: Card Input Normalization

**What:** Containers accept cards as `(string | CardData)[]` and normalize internally.
**When to use:** All container components (Hand, Deck, CardStack).

```typescript
// Source: Phase 1 pattern - Card component already supports both string and CardData
import { CardData, parseCard } from '../types';

/** Input format: card objects, string notation, or mixed */
type CardInput = string | CardData;

/** Normalize any card input to CardData */
function normalizeCard(input: CardInput): CardData | null {
  if (typeof input === 'string') {
    return parseCard(input);
  }
  return input;
}

// Container usage
interface HandProps {
  cards: CardInput[];
  // ...
}
```

### Pattern 2: Layout Utility Pure Functions

**What:** All layout math is in pure functions that take card count, container dimensions, and configuration, returning position/rotation arrays.
**When to use:** Always -- separation of layout logic from rendering.

```typescript
// Source: Fan layout math from CSS transform research + trigonometry
export interface CardLayout {
  /** X offset from container center in px */
  x: number;
  /** Y offset from container top in px */
  y: number;
  /** Rotation angle in degrees */
  rotation: number;
  /** Z-index for stacking order */
  zIndex: number;
  /** Scale factor (1.0 = normal) */
  scale: number;
}

export interface FanLayoutOptions {
  /** Total arc angle in degrees (default: 50) */
  maxAngle: number;
  /** Radius of the arc in px -- larger = gentler curve */
  radius: number;
  /** Card width for spacing calculations */
  cardWidth: number;
  /** Card height for offset calculations */
  cardHeight: number;
}

/**
 * Calculate fan (arc) layout for N cards.
 * Each card is positioned on an arc with uniform angular spacing.
 *
 * For n=1: card is centered at 0 degrees
 * For n=2: cards at -maxAngle/2 and +maxAngle/2 (scaled down)
 * For n>2: evenly distributed from -maxAngle/2 to +maxAngle/2
 */
export function calculateFanLayout(
  cardCount: number,
  options: FanLayoutOptions
): CardLayout[] {
  if (cardCount === 0) return [];
  if (cardCount === 1) {
    return [{ x: 0, y: 0, rotation: 0, zIndex: 1, scale: 1 }];
  }

  const { maxAngle, radius } = options;
  const layouts: CardLayout[] = [];

  for (let i = 0; i < cardCount; i++) {
    // Distribute angles evenly from -maxAngle/2 to +maxAngle/2
    const t = cardCount === 1 ? 0.5 : i / (cardCount - 1);
    const angle = -maxAngle / 2 + maxAngle * t;
    const angleRad = (angle * Math.PI) / 180;

    // Position on arc: x = r * sin(angle), y = r * (1 - cos(angle))
    const x = radius * Math.sin(angleRad);
    const y = radius * (1 - Math.cos(angleRad));

    layouts.push({
      x,
      y,
      rotation: angle,
      zIndex: i + 1,
      scale: 1,
    });
  }

  return layouts;
}
```

### Pattern 3: Container with forwardRef + useImperativeHandle

**What:** Consistent with Phase 1 Card component -- containers expose imperative methods via ref.
**When to use:** Hand, Deck, and CardStack components per CONTEXT.md decision.

```typescript
// Source: Phase 1 Card pattern + CONTEXT.md decision on ref API
export interface HandRef {
  /** Programmatically select a card by index */
  selectCard: (index: number) => void;
  /** Get indices of currently selected cards */
  getSelectedCards: () => number[];
}

export const Hand = forwardRef<HandRef, HandProps>((props, ref) => {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  useImperativeHandle(ref, () => ({
    selectCard: (index: number) => {
      setSelectedIndices(prev => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        return next;
      });
    },
    getSelectedCards: () => Array.from(selectedIndices),
  }), [selectedIndices]);

  // ...
});
```

### Pattern 4: Motion Variants for Staggered Card Entry

**What:** Use Motion's variant system with `staggerChildren` for cards entering a container.
**When to use:** Hand and CardStack components when cards are added.

```typescript
// Source: Motion docs - stagger variants pattern
import { motion, AnimatePresence } from 'motion/react';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,  // 50ms between each card
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.9 },
};

// Inside container render:
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  <AnimatePresence mode="popLayout">
    {cards.map((card, i) => (
      <motion.div
        key={cardKey(card)}
        variants={cardVariants}
        exit="exit"
        layout
        custom={i}
        style={{
          transform: `rotate(${layouts[i].rotation}deg)`,
          zIndex: layouts[i].zIndex,
        }}
      >
        <Card card={card} isFaceUp={true} />
      </motion.div>
    ))}
  </AnimatePresence>
</motion.div>
```

### Pattern 5: useContainerSize Hook with ResizeObserver

**What:** Custom hook for measuring container width to drive responsive layout calculations.
**When to use:** Hand component (adaptive spacing), any container needing responsive behavior.

```typescript
// Source: ResizeObserver API + React hook patterns
import { useRef, useState, useEffect, useCallback, type RefObject } from 'react';

interface ContainerSize {
  width: number;
  height: number;
}

export function useContainerSize<T extends HTMLElement = HTMLDivElement>(): {
  ref: RefObject<T | null>;
  size: ContainerSize;
} {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setSize(prev =>
          prev.width === Math.round(width) && prev.height === Math.round(height)
            ? prev  // avoid unnecessary re-renders
            : { width: Math.round(width), height: Math.round(height) }
        );
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}
```

### Pattern 6: Controlled/Uncontrolled Selection

**What:** Hand component supports both controlled (external `selectedCards` state) and uncontrolled (click handlers only) selection.
**When to use:** Hand component per CONTEXT.md decision.

```typescript
// Source: CONTEXT.md decision + React controlled/uncontrolled pattern
interface HandProps {
  cards: CardInput[];

  // Controlled selection (optional)
  selectedCards?: number[];       // indices of selected cards
  onSelectionChange?: (indices: number[]) => void;

  // Uncontrolled selection (click event only)
  onCardClick?: (card: CardData, index: number) => void;

  // Layout
  layout?: 'fan' | 'spread' | 'stack';
  // ...
}
```

### Pattern 7: CSS Transform for Card Positioning in Container

**What:** Apply layout calculations as inline CSS transforms on card wrappers within the container.
**When to use:** All container components.

```typescript
// Source: CSS transform research + Phase 1 motion patterns
// Each card gets a wrapper div with calculated transforms
{layouts.map((layout, i) => (
  <div
    key={i}
    className={styles.cardSlot}
    style={{
      '--card-x': `${layout.x}px`,
      '--card-y': `${layout.y}px`,
      '--card-rotation': `${layout.rotation}deg`,
      '--card-z-index': layout.zIndex,
      zIndex: layout.zIndex,
    } as React.CSSProperties}
  >
    <Card card={cards[i]} isFaceUp={true} />
  </div>
))}

// In CSS Module:
// .cardSlot {
//   position: absolute;
//   transform-origin: bottom center;
//   transform: translateX(var(--card-x))
//              translateY(var(--card-y))
//              rotate(var(--card-rotation));
//   z-index: var(--card-z-index);
//   transition: transform 0.3s ease, z-index 0s;
// }
```

### Anti-Patterns to Avoid

- **Layout calculations in render:** Computing fan/spread positions during render causes recalculation every render. Use `useMemo` with card count and container size as dependencies.
- **Z-index wars:** Do NOT use arbitrary z-index values. Use `isolation: isolate` on the container to create a scoped stacking context, then use sequential z-index (1, 2, 3...) based on card order.
- **Animating layout-affecting properties:** Do not animate `width`, `height`, `left`, `top` directly. Use CSS `transform` (translateX, translateY, rotate, scale) which are GPU-composited and do not trigger layout recalculation.
- **Missing keys on AnimatePresence children:** Every child of AnimatePresence MUST have a unique, stable `key`. Using array index as key will break exit animations when cards are removed from the middle.
- **Wrapping entire Card in motion.div when it already uses motion:** The Card component already renders a `motion.div` internally. The container should wrap each Card in a plain `div` with CSS transforms for positioning, not a nested `motion.div` (unless needed for enter/exit animations).

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Card enter/exit animations | Custom opacity/position tracking | Motion `AnimatePresence` + `exit` prop | Handles DOM removal timing, unmount cleanup |
| Layout reflow animation | Manual position diffing | Motion `layout` prop | Automatic FLIP animation on layout changes |
| Staggered card dealing | setTimeout chains | Motion `staggerChildren` in variants | Declarative, cancellable, respects reduced motion |
| Container measurement | Manual getBoundingClientRect polling | ResizeObserver via custom hook | Efficient, event-driven, no polling |
| Z-index isolation | Global z-index scale | CSS `isolation: isolate` on container | Prevents z-index leaking between components |

**Key insight:** Card container layout is fundamentally a geometry problem (pure math) combined with CSS transforms. The math should be in testable pure functions, and the rendering should lean on CSS transforms and Motion's layout animation system. Do not mix layout calculation with rendering logic.

## Common Pitfalls

### Pitfall 1: Stacking Context Leaking

**What goes wrong:** Card z-index in one Hand component interferes with card z-index in another Hand or with other page elements (e.g., a hovered card in Hand A appears above an overlay from component B).

**Why it happens:** Without an isolated stacking context, z-index values are compared globally across the entire page.

**How to avoid:** Apply `isolation: isolate` on every container component's root element. This creates a local stacking context so z-index values inside are scoped to that container.

**Warning signs:** Cards from one container appearing above unrelated UI elements; z-index values escalating to 9999+.

### Pitfall 2: Fan Layout Breaks at Edge Cases

**What goes wrong:** Fan layout produces overlapping cards at n=1 (division by zero in angle calculation), weird gaps at n=2, or cards extending beyond container at n=15+.

**Why it happens:** The fan angle formula `angle = -maxAngle/2 + maxAngle * (i / (n-1))` divides by zero when n=1.

**How to avoid:** Handle edge cases explicitly:
- n=0: return empty array
- n=1: return single centered card at rotation=0
- n=2: use reduced maxAngle (e.g., maxAngle * 0.4) to avoid extreme spread
- n>10: dynamically reduce maxAngle per card or reduce card scale to prevent overflow

**Warning signs:** NaN or Infinity in layout calculations, cards going off-screen.

### Pitfall 3: ResizeObserver Infinite Loop

**What goes wrong:** Changing card layout in response to container size change causes the container size to change again, creating an infinite resize loop.

**Why it happens:** Layout recalculation (e.g., changing card count per row) changes container height, which triggers ResizeObserver again.

**How to avoid:** Round dimensions with `Math.round()` before comparing to previous values. Only update state when the rounded value actually changes. Use container `width` only (not height) for card layout decisions, since card arrangement primarily depends on horizontal space.

**Warning signs:** Constant re-renders, layout flickering, browser freezing.

### Pitfall 4: Lost Exit Animations with Array Index Keys

**What goes wrong:** When a card is removed from the middle of a hand, the exit animation plays on the wrong card (or not at all).

**Why it happens:** Using array index as `key` in `AnimatePresence` children. When card at index 2 is removed, cards at indices 3, 4, 5 shift to 2, 3, 4, so React thinks the last card was removed.

**How to avoid:** Generate stable unique keys per card. For playing cards, use `formatCard(card)` (e.g., "sA", "h7") as the key since each card in a standard deck is unique.

**Warning signs:** Wrong card animating out, remaining cards flickering during removal.

### Pitfall 5: CSS Transform and transform-origin Interaction

**What goes wrong:** Fan layout cards rotate but don't form an arc -- they rotate in place instead of fanning out from a common pivot point.

**Why it happens:** Missing or incorrect `transform-origin`. By default, transforms apply from the element's center.

**How to avoid:** Set `transform-origin: bottom center` on card slots for fan layouts. For a wider/gentler arc, set origin further below: `transform-origin: center 150%`. The transform-origin acts as the "hand holding the cards" pivot point.

**Warning signs:** Cards rotating in place instead of fanning, arc looking wrong.

### Pitfall 6: Hover Lift Interfering with Card Click

**What goes wrong:** Card hover lift animation (translateY on hover) fights with the container's positioning transforms, or hover state persists on touch devices.

**Why it happens:** Container applies `transform` for layout positioning, and hover adds another transform on the same element, potentially conflicting. Touch devices fire mouseenter but not mouseleave in some cases.

**How to avoid:** Apply hover transforms on a nested element (not the same element that has positioning transforms). Use `@media (hover: hover)` to limit hover effects to devices that truly support hover.

**Warning signs:** Cards jumping or jittering on hover, hover state stuck on mobile.

## Code Examples

Verified patterns adapted from official sources and codebase analysis:

### Fan Layout Calculation (Arc Style)

```typescript
// Source: CSS fan transform research + trigonometric arc calculation
// Pure function -- no DOM dependency, fully testable

export type FanPreset = 'subtle' | 'standard' | 'dramatic';

const FAN_PRESETS: Record<FanPreset, number> = {
  subtle: 35,     // +/-17.5 degrees total spread
  standard: 60,   // +/-30 degrees total spread
  dramatic: 90,   // +/-45 degrees total spread
};

export interface FanLayoutConfig {
  preset?: FanPreset;
  maxAngle?: number;     // overrides preset
  radius?: number;       // arc radius in card-heights (default: 3)
  cardWidth: number;
  cardHeight: number;
}

export function calculateFanLayout(
  count: number,
  config: FanLayoutConfig,
): CardLayout[] {
  if (count === 0) return [];

  const maxAngle = config.maxAngle ?? FAN_PRESETS[config.preset ?? 'standard'];
  const radius = (config.radius ?? 3) * config.cardHeight;

  if (count === 1) {
    return [{ x: 0, y: 0, rotation: 0, zIndex: 1, scale: 1 }];
  }

  // Scale down angle for very few cards to avoid extreme spread
  const effectiveAngle = count <= 3
    ? maxAngle * (count / 5)
    : Math.min(maxAngle, maxAngle * Math.sqrt(count / 7));

  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);            // 0 to 1
    const angle = -effectiveAngle / 2 + effectiveAngle * t;
    const angleRad = (angle * Math.PI) / 180;

    return {
      x: radius * Math.sin(angleRad),
      y: radius * (1 - Math.cos(angleRad)),
      rotation: angle,
      zIndex: i + 1,
      scale: 1,
    };
  });
}
```

### Spread Layout Calculation (Linear)

```typescript
// Source: CONTEXT.md -- adaptive spacing based on container width

export interface SpreadLayoutConfig {
  containerWidth: number;
  cardWidth: number;
  minOverlap: number;    // minimum visible portion of each card (px)
  maxGap: number;        // maximum gap between cards (px)
}

export function calculateSpreadLayout(
  count: number,
  config: SpreadLayoutConfig,
): CardLayout[] {
  if (count === 0) return [];
  if (count === 1) {
    return [{ x: 0, y: 0, rotation: 0, zIndex: 1, scale: 1 }];
  }

  const { containerWidth, cardWidth, minOverlap, maxGap } = config;

  // Calculate ideal spacing
  const totalWidthNeeded = cardWidth + (count - 1) * (cardWidth + maxGap);
  let spacing: number;

  if (totalWidthNeeded <= containerWidth) {
    // Enough room -- use maxGap
    spacing = cardWidth + maxGap;
  } else {
    // Compress -- overlap cards to fit
    const availableForSpacing = containerWidth - cardWidth;
    spacing = availableForSpacing / (count - 1);
    // Ensure minimum visible portion
    spacing = Math.max(spacing, minOverlap);
  }

  // Center the spread
  const totalWidth = cardWidth + (count - 1) * spacing;
  const startX = -(totalWidth - cardWidth) / 2;

  return Array.from({ length: count }, (_, i) => ({
    x: startX + i * spacing,
    y: 0,
    rotation: 0,
    zIndex: i + 1,
    scale: 1,
  }));
}
```

### Stack Layout Calculation (Cascade)

```typescript
// Source: CONTEXT.md -- cascade style with diagonal offset + slight rotation

export interface StackLayoutConfig {
  offsetX: number;   // horizontal offset per card (px), default: 2
  offsetY: number;   // vertical offset per card (px), default: 2
  maxRotation: number; // max rotation spread (degrees), default: 3
}

export function calculateStackLayout(
  count: number,
  config: StackLayoutConfig = { offsetX: 2, offsetY: 2, maxRotation: 3 },
): CardLayout[] {
  return Array.from({ length: count }, (_, i) => ({
    x: i * config.offsetX,
    y: i * config.offsetY,
    rotation: count > 1
      ? -config.maxRotation / 2 + (config.maxRotation / (count - 1)) * i
      : 0,
    zIndex: i + 1,
    scale: 1,
  }));
}
```

### Hand Component Structure

```typescript
// Source: CONTEXT.md decisions + Phase 1 component patterns

import { forwardRef, useImperativeHandle, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../Card';
import { useContainerSize, usePrefersReducedMotion } from '../../hooks';
import { calculateFanLayout, calculateSpreadLayout } from '../../utils/layout';
import type { CardData } from '../../types';
import type { HandProps, HandRef } from './Hand.types';
import styles from './Hand.module.css';

export const Hand = forwardRef<HandRef, HandProps>((props, ref) => {
  const {
    cards,
    layout = 'fan',
    selectedCards: controlledSelected,
    onSelectionChange,
    onCardClick,
    hoverEffect = 'lift',
    fanPreset = 'standard',
    // ...
  } = props;

  // Container measurement for responsive layouts
  const { ref: containerRef, size } = useContainerSize();

  // Layout calculations (memoized)
  const layouts = useMemo(() => {
    if (layout === 'fan') {
      return calculateFanLayout(cards.length, {
        preset: fanPreset,
        cardWidth: size.width > 0 ? size.width / (cards.length + 2) : 80,
        cardHeight: size.width > 0 ? (size.width / (cards.length + 2)) * (7/5) : 112,
      });
    }
    return calculateSpreadLayout(cards.length, {
      containerWidth: size.width,
      cardWidth: 80,
      minOverlap: 30,
      maxGap: 8,
    });
  }, [cards.length, layout, fanPreset, size.width]);

  // ...render with AnimatePresence + layout
  return (
    <div ref={containerRef} className={styles.hand} style={{ isolation: 'isolate' }}>
      <AnimatePresence mode="popLayout">
        {cards.map((card, i) => (
          <motion.div
            key={formatCard(normalizeCard(card))}
            className={styles.cardSlot}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: layouts[i]?.x ?? 0,
              y: layouts[i]?.y ?? 0,
              rotate: layouts[i]?.rotation ?? 0,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{ zIndex: layouts[i]?.zIndex ?? 0 }}
          >
            <Card card={card} isFaceUp={true} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
```

### Deck Component Structure

```typescript
// Source: CONTEXT.md -- fire event only (onDraw), developer handles state

export interface DeckRef {
  drawCard: () => void;
}

export interface DeckProps {
  /** Number of cards remaining (visual only -- controls stack height) */
  count: number;
  /** Fired when deck is clicked/tapped */
  onDraw?: () => void;
  /** What to show when count is 0 */
  emptyState?: 'none' | 'placeholder' | React.ReactNode;
  // ...
}

// The Deck renders a visual stack of facedown cards
// It does NOT manage card state -- it fires onDraw and the
// developer is responsible for removing the card from the deck
```

### CSS Module for Container with isolation

```css
/* Hand.module.css */
.hand {
  position: relative;
  isolation: isolate;  /* Scoped stacking context */
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  min-height: 200px;
}

.cardSlot {
  position: absolute;
  transform-origin: bottom center;
  /* Hover lift only on hover-capable devices */
}

@media (hover: hover) {
  .cardSlot:hover {
    z-index: 100;  /* Safe within isolated context */
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JS-based getBoundingClientRect polling | ResizeObserver API | 2020+ (universal support) | Event-driven, no polling, better performance |
| Media queries for component sizing | CSS Container Queries or ResizeObserver | 2023+ | Container-aware rather than viewport-aware |
| Manual FLIP animation | Motion `layout` prop | Motion v12+ | Automatic layout animation with zero boilerplate |
| setTimeout for stagger | Motion `staggerChildren` | framer-motion v2+ | Declarative, cancellable, composable |
| framer-motion package | motion package | 2024 (v11) | Same API, renamed package |
| Global z-index management | `isolation: isolate` per component | CSS3 (universal) | Scoped stacking, no z-index wars |

**Deprecated/outdated:**
- `framer-motion` import path: Use `motion/react` (already done in Phase 1)
- Viewport-based responsive cards: Use container-aware sizing with ResizeObserver
- Manual element position tracking: Use Motion's `layout` prop for automatic FLIP

## Open Questions

Things that could not be fully resolved:

1. **Exact card scale factor for responsive sizing**
   - What we know: CONTEXT.md says "scale cards AND adjust spacing/overlap". We need both scaling and spacing adaptation.
   - What is unclear: The exact breakpoints/thresholds where scaling kicks in vs. pure spacing adjustment. When does a card become too small to read?
   - Recommendation: Start with minimum readable card width of 60px. Above 10 cards, begin scaling down. Test with actual card rendering to find the sweet spot. This is marked as Claude's discretion.

2. **AnimatePresence mode interaction with layout prop**
   - What we know: `mode="popLayout"` pairs well with `layout` prop per Motion docs. Children must forward refs.
   - What is unclear: Whether wrapping the existing `Card` component (which uses `forwardRef` already) inside another `motion.div` wrapper causes double-transform issues.
   - Recommendation: Test early with a simple prototype. The card wrapper `motion.div` handles positioning; the inner `Card` handles its own 3D flip. These should not conflict since they operate on different axes (container: translateX/Y/rotateZ, card: rotateY).

3. **Hover effect performance with many cards**
   - What we know: CONTEXT.md allows configurable hover effects (lift or highlight). CSS hover with transforms is GPU-accelerated.
   - What is unclear: Whether hover state changes on 10+ overlapping card wrappers cause jank.
   - Recommendation: Use CSS-only hover (no React state for hover) via `:hover` pseudo-class. Only use React state for hover if needed for callbacks. This is marked as Claude's discretion.

4. **DropZone implementation details**
   - What we know: CNTR-04 requires a DropZone component. This phase context focuses on visual layout, not drag-and-drop.
   - What is unclear: Whether DropZone should implement HTML5 drag-and-drop API in this phase or just provide the visual container.
   - Recommendation: Implement DropZone as a visual container with empty state support and an `onDrop` event prop. Full drag-and-drop integration is likely a Phase 3 concern (drag-and-drop interactions).

## Sources

### Primary (HIGH confidence)

- [Motion Official Docs - AnimatePresence](https://motion.dev/docs/react-animate-presence) - Exit animations, modes, key requirements
- [Motion Official Docs - Layout Animations](https://motion.dev/docs/react-layout-animations) - layout prop, FLIP, LayoutGroup
- [Motion Official Docs - Stagger](https://motion.dev/docs/stagger) - staggerChildren, variant orchestration
- [Motion Official Docs - useSpring](https://motion.dev/docs/react-use-spring) - Spring animation API (used in Phase 1)
- [Motion Official Docs - LayoutGroup](https://motion.dev/docs/react-layout-group) - Cross-component layout coordination
- [MDN - Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context) - Z-index scoping rules
- [React Docs - useImperativeHandle](https://react.dev/reference/react/useImperativeHandle) - Ref API pattern
- Phase 1 codebase - Card.tsx, useCardFlip.ts, Card.module.css (existing patterns)

### Secondary (MEDIUM confidence)

- [WeAreDevelopers - Creating a 3D Card Fan with CSS Transforms](https://www.wearedevelopers.com/en/magazine/656/creating-a-3d-card-fan-with-css-transforms-656) (Nov 2025) - CSS fan layout technique, transform-origin, custom properties
- [Medium - Building an interactive card fan with CSS](https://medium.com/@leferreyra/first-blog-building-an-interactive-card-fan-with-css-c79c9cd87a14) - SCSS fan layout formula
- [Theodorus Clarence - List Animation](https://theodorusclarence.com/blog/list-animation) - AnimatePresence list patterns
- [LogRocket - Using ResizeObserver in React](https://blog.logrocket.com/using-resizeobserver-react-responsive-designs/) - Custom hook implementation
- [LogRocket - Container Queries in 2026](https://blog.logrocket.com/container-queries-2026/) - Container query status and limitations
- [Smashing Magazine - Managing Z-Index in Component-Based Apps](https://www.smashingmagazine.com/2019/04/z-index-component-based-web-application/) - Isolation pattern

### Tertiary (LOW confidence)

- [GitHub - wmaillard/react-playing-cards](https://github.com/wmaillard/react-playing-cards) - Reference implementation (not inspected in detail)
- Unity forum discussions on card fan alignment - Algorithm concepts adapted to CSS context
- General community patterns for responsive card layouts - Need validation through implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies needed; all tools verified in Phase 1
- Architecture: HIGH - Component structure follows established Phase 1 patterns; layout math is well-understood trigonometry
- Layout algorithms: HIGH - Fan/spread/stack math is straightforward geometry, verified against multiple sources
- Motion integration (AnimatePresence, layout): MEDIUM - APIs verified in docs but specific interaction with existing Card component needs testing
- Pitfalls: HIGH - Z-index stacking, edge cases, and ResizeObserver patterns are well-documented
- Responsive sizing: MEDIUM - General approach is clear but exact thresholds need implementation testing

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - stable domain, no rapidly changing APIs)

---

*Phase 2: Container Components & Layouts - Research*
*Researched: 2026-02-03*
