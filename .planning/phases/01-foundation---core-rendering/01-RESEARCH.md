# Phase 1: Foundation & Core Rendering - Research

**Researched:** 2026-02-02
**Domain:** React Card Component with CSS 3D Animations
**Confidence:** HIGH

## Summary

This phase focuses on building the atomic `Card` component with 3D flip animations using Motion (formerly Framer Motion) and CSS 3D transforms. The research confirms that the decided stack (React 18/19, TypeScript 5.8, Motion ^12.27) is well-suited for this task.

The core technical challenges are: (1) implementing performant 3D flip animations using GPU-accelerated CSS transforms, (2) managing animation state with Motion Values to prevent React re-renders, and (3) providing both controlled and uncontrolled component APIs for maximum flexibility.

Key discoveries include verified spring physics defaults (stiffness: 100, damping: 10, mass: 1), the critical CSS properties for 3D transforms (perspective on container, transform-style: preserve-3d, backface-visibility: hidden), and Safari-specific fixes for flickering issues.

**Primary recommendation:** Use Motion's `useMotionValue` and `useTransform` hooks for animation state to prevent re-renders, CSS 3D transforms with perspective for the flip animation, and provide both controlled (`isFaceUp` prop) and uncontrolled (internal state with ref API) component modes.

## Standard Stack

The established libraries/tools for this phase:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^18.0 \|\| ^19.0 | UI Framework | Peer dependency; concurrent rendering support |
| TypeScript | ^5.8 | Type Safety | Discriminated unions for Suit/Rank, strict mode |
| Motion | ^12.27 | Animation Library | Spring physics, motion values, GPU-accelerated transforms |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | ^4.0 | Testing | Component unit tests with jsdom |
| @testing-library/react | ^16.2 | Component Testing | User-centric interaction testing |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Motion spring | CSS transitions | Less natural feel, no velocity-based physics |
| Motion spring | React Spring | More physics control but no built-in gestures |
| CSS Modules | Tailwind CSS | More utility classes but larger dev dependency |

**Installation:**
```bash
npm install motion
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

## Architecture Patterns

### Recommended Project Structure

```
src/
+-- components/
|   +-- Card/
|   |   +-- Card.tsx           # Main card component (controlled/uncontrolled)
|   |   +-- CardFace.tsx       # Front/back face rendering
|   |   +-- CardFlip.tsx       # Flip animation wrapper (Motion)
|   |   +-- Card.module.css    # Card styles with CSS custom properties
|   |   +-- Card.types.ts      # Card-specific types
|   |   +-- Card.test.tsx      # Component tests
|   |   +-- index.ts           # Barrel export
+-- hooks/
|   +-- useCardFlip.ts         # Flip animation state (motion values)
|   +-- usePrefersReducedMotion.ts  # Accessibility hook
|   +-- index.ts
+-- types/
|   +-- card.ts                # Suit, Rank, CardData types
|   +-- index.ts
+-- constants/
|   +-- suits.ts               # Emoji mappings, colors
|   +-- animations.ts          # Spring presets
|   +-- index.ts
```

### Pattern 1: Controlled/Uncontrolled Component

**What:** Component supports both controlled mode (parent manages state via `isFaceUp` prop) and uncontrolled mode (internal state with ref API for imperative control).

**When to use:** Always - this is the decided API pattern from CONTEXT.md.

**Example:**
```typescript
// Source: React patterns + CONTEXT.md decision
interface CardProps {
  card: string;  // e.g., "♠A", "♥7"

  // Controlled mode (optional)
  isFaceUp?: boolean;

  // Events
  onClick?: (data: CardClickData) => void;
  onFlipStart?: () => void;
  onFlipComplete?: () => void;
  onHover?: (isHovered: boolean) => void;
  onFocus?: (isFocused: boolean) => void;

  // Customization
  cardBack?: React.ReactNode;
  colorScheme?: 'two-color' | 'four-color';
  aspectRatio?: 'poker' | 'bridge';
  perspective?: 'subtle' | 'moderate' | 'dramatic';
  springConfig?: SpringConfig;
}

// Uncontrolled mode with imperative API
interface CardRef {
  flip: () => void;
  isFaceUp: () => boolean;
}

const Card = forwardRef<CardRef, CardProps>((props, ref) => {
  // Implementation determines mode based on prop presence
  const isControlled = props.isFaceUp !== undefined;
  // ...
});
```

### Pattern 2: Motion Values for Animation State

**What:** Use Motion's `useMotionValue` instead of React state for animation values to prevent re-renders.

**When to use:** Always for animation state (rotation, opacity, scale during flip).

**Example:**
```typescript
// Source: https://dev.to/siddharth0x/framer-motion-usemotionvalue-usetransform-1hml
import { useMotionValue, useTransform, motion } from 'motion/react';

function useCardFlip(isFaceUp: boolean) {
  const rotateY = useMotionValue(isFaceUp ? 0 : 180);

  // Derived values - no React re-renders during animation
  const frontOpacity = useTransform(rotateY, [0, 90, 180], [1, 0, 0]);
  const backOpacity = useTransform(rotateY, [0, 90, 180], [0, 0, 1]);

  return { rotateY, frontOpacity, backOpacity };
}
```

### Pattern 3: CSS 3D Transform Structure

**What:** Three-layer structure: container (perspective), card wrapper (preserve-3d), faces (backface-visibility).

**When to use:** Always for 3D flip animations.

**Example:**
```typescript
// Source: https://3dtransforms.desandro.com/card-flip
<div style={{ perspective: '1000px' }}>       {/* Container with perspective */}
  <motion.div
    style={{ transformStyle: 'preserve-3d' }}  {/* Card wrapper */}
    animate={{ rotateY: isFlipped ? 180 : 0 }}
  >
    <div style={{ backfaceVisibility: 'hidden' }}>  {/* Front face */}
      <CardFront />
    </div>
    <div style={{
      backfaceVisibility: 'hidden',
      transform: 'rotateY(180deg)'              {/* Back face pre-rotated */}
    }}>
      <CardBack />
    </div>
  </motion.div>
</div>
```

### Pattern 4: TypeScript Discriminated Unions for Card Types

**What:** Use literal types and discriminated unions for type-safe card representation.

**When to use:** Always for card data types.

**Example:**
```typescript
// Source: TypeScript patterns + CONTEXT.md decision
export const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
export type Suit = typeof SUITS[number];

export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'] as const;
export type Rank = typeof RANKS[number];

export const SUIT_EMOJI: Record<Suit, string> = {
  spades: '\u2660',   // ♠
  hearts: '\u2665',   // ♥
  diamonds: '\u2666', // ♦
  clubs: '\u2663',    // ♣
};

export interface CardData {
  suit: Suit;
  rank: Rank;
}

// Parse notation like "♠A" to CardData
export function parseCard(notation: string): CardData | null {
  const emoji = notation.charAt(0);
  const rank = notation.slice(1) as Rank;

  const suit = Object.entries(SUIT_EMOJI)
    .find(([_, e]) => e === emoji)?.[0] as Suit | undefined;

  if (!suit || !RANKS.includes(rank)) return null;
  return { suit, rank };
}
```

### Anti-Patterns to Avoid

- **Animation state in React state:** Using `useState` for rotateY values causes 60+ re-renders per second during animation. Use `useMotionValue` instead.
- **Missing perspective on container:** Without perspective on parent, 3D transforms appear flat.
- **Missing preserve-3d:** Without `transform-style: preserve-3d`, child elements lose 3D positioning.
- **Switching controlled/uncontrolled:** Components should not switch modes during lifecycle. Decide based on initial props.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Spring physics | Custom easing functions | Motion spring type | Velocity-based, natural feel, battle-tested |
| Animation state | React useState | useMotionValue | Prevents re-renders, better performance |
| Reduced motion detection | Manual matchMedia | usePrefersReducedMotion hook | Handles subscription/cleanup properly |
| 3D transform math | Custom matrix calculations | CSS rotateY/perspective | GPU-accelerated, browser-optimized |

**Key insight:** Animation libraries like Motion exist because animation is deceptively complex. Spring physics, velocity tracking, gesture coordination, and GPU optimization are solved problems.

## Common Pitfalls

### Pitfall 1: Animation State in React State

**What goes wrong:** Using `useState` for animation values (rotation, position) triggers React re-renders on every frame (60+ times per second), causing severe performance degradation.

**Why it happens:** Developers naturally reach for `useState` to track animation progress.

**How to avoid:** Use `useMotionValue` for any value that changes during animation. Only use React state for values that should trigger UI updates (like `isFaceUp` boolean toggle).

**Warning signs:** Laggy animations, high CPU during flip, React DevTools showing frequent re-renders.

### Pitfall 2: Safari Backface Flickering

**What goes wrong:** Card faces flicker or show through each other during flip animation on Safari.

**Why it happens:** Safari flattens 3D context more aggressively than Chrome/Firefox.

**How to avoid:**
- Add both standard and webkit prefixed properties: `backface-visibility: hidden; -webkit-backface-visibility: hidden;`
- Add `-webkit-transform: translate3d(0, 0, 0);` to flickering elements
- Set explicit z-index on front and back faces

**Warning signs:** Flickering only on Safari, faces visible through each other at 90 degrees.

### Pitfall 3: Missing Perspective Container

**What goes wrong:** Flip animation appears flat, like card is just scaling rather than rotating in 3D.

**Why it happens:** Perspective must be on a parent container, not the rotating element itself.

**How to avoid:** Always structure as: container (with perspective) > wrapper (with preserve-3d + rotation) > faces.

**Warning signs:** Animation looks flat, no depth perception during flip.

### Pitfall 4: Hover-Only Interaction on Touch

**What goes wrong:** Card flip works on desktop but not on mobile devices.

**Why it happens:** Hover states don't work on touch screens.

**How to avoid:** Use `onClick` or Motion's `onTap` for flip triggers. Never rely solely on `:hover` for essential functionality.

**Warning signs:** Works on desktop, fails on mobile testing.

### Pitfall 5: Not Handling Reduced Motion

**What goes wrong:** Users with vestibular disorders experience discomfort from flip animations.

**Why it happens:** Accessibility is deprioritized or forgotten.

**How to avoid:** Implement `prefers-reduced-motion` media query. Either skip animation entirely or use simple opacity fade instead of 3D rotation.

**Warning signs:** No `prefers-reduced-motion` check in code, accessibility audit failures.

## Code Examples

Verified patterns from official sources:

### Complete Flip Animation Component

```typescript
// Source: https://dev.to/graciesharma/how-to-create-a-flipping-card-animation-using-framer-motion-5djh
// Adapted for project decisions
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';

interface CardProps {
  card: string;
  isFaceUp?: boolean;
  onFlipComplete?: () => void;
  springConfig?: { stiffness?: number; damping?: number };
}

interface CardRef {
  flip: () => void;
  isFaceUp: () => boolean;
}

const Card = forwardRef<CardRef, CardProps>(({
  card,
  isFaceUp: controlledFaceUp,
  onFlipComplete,
  springConfig = {}
}, ref) => {
  // Determine if controlled
  const isControlled = controlledFaceUp !== undefined;

  // Internal state for uncontrolled mode
  const [internalFaceUp, setInternalFaceUp] = useState(true);
  const faceUp = isControlled ? controlledFaceUp : internalFaceUp;

  // Motion value for rotation (prevents re-renders during animation)
  const rotateY = useSpring(faceUp ? 0 : 180, {
    stiffness: springConfig.stiffness ?? 100,
    damping: springConfig.damping ?? 15,  // Slightly higher for playful bounce
  });

  // Update rotation when faceUp changes
  useEffect(() => {
    rotateY.set(faceUp ? 0 : 180);
  }, [faceUp, rotateY]);

  // Imperative API for uncontrolled mode
  useImperativeHandle(ref, () => ({
    flip: () => {
      if (!isControlled) {
        setInternalFaceUp(prev => !prev);
      }
    },
    isFaceUp: () => faceUp,
  }), [isControlled, faceUp]);

  return (
    <div style={{ perspective: '1000px' }}>
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          rotateY,
        }}
        onAnimationComplete={onFlipComplete}
      >
        {/* Front Face */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}>
          <CardFace card={card} />
        </div>

        {/* Back Face */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}>
          <CardBack />
        </div>
      </motion.div>
    </div>
  );
});
```

### useMotionValue Pattern for Performance

```typescript
// Source: https://dev.to/siddharth0x/framer-motion-usemotionvalue-usetransform-1hml
import { useMotionValue, useTransform } from 'motion/react';

function useCardFlipAnimation(targetRotation: number) {
  // Motion value - updates don't trigger React re-renders
  const rotateY = useMotionValue(targetRotation);

  // Derived values for face visibility
  const frontOpacity = useTransform(
    rotateY,
    [0, 89, 90, 180],    // Input range (degrees)
    [1, 1, 0, 0]         // Output range (opacity)
  );

  const backOpacity = useTransform(
    rotateY,
    [0, 89, 90, 180],
    [0, 0, 1, 1]
  );

  return { rotateY, frontOpacity, backOpacity };
}
```

### Prefers Reduced Motion Hook

```typescript
// Source: https://www.joshwcomeau.com/react/prefers-reduced-motion/
import { useState, useEffect } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
```

### CSS Aspect Ratio for Cards

```css
/* Source: https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio */
.card {
  /* Poker size: 2.5:3.5 = 5:7 */
  aspect-ratio: 5 / 7;
  width: 100%;
  max-width: 100%;

  /* Prevent layout shift */
  contain: layout;
}

.card--bridge {
  /* Bridge size: 2.25:3.5 = 9:14 */
  aspect-ratio: 9 / 14;
}
```

### Material Design Shadows

```css
/* Source: https://studioncreations.com/blog/material-design-3-box-shadow-css-values/ */
:root {
  --shadow-elevation-1: 0 1px 4px 0 rgba(0, 0, 0, 0.37);
  --shadow-elevation-2: 0 2px 2px 0 rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.3);
  --shadow-elevation-3: 0 11px 7px 0 rgba(0, 0, 0, 0.19), 0 13px 25px 0 rgba(0, 0, 0, 0.3);
}

.card {
  box-shadow: var(--shadow-elevation-1);
  transition: box-shadow 150ms ease;
}

.card:hover {
  box-shadow: var(--shadow-elevation-2);
}

.card--dragging {
  box-shadow: var(--shadow-elevation-3);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| framer-motion package | motion package | 2024 (v11) | Package renamed, same API |
| forwardRef wrapper | ref as prop (React 19) | 2025 | Simpler ref forwarding, forwardRef deprecated in future |
| Padding hack for aspect ratio | CSS aspect-ratio property | 2021 | Native browser support, cleaner code |
| CSS keyframe animations | Motion spring physics | N/A | More natural, velocity-aware animations |

**Deprecated/outdated:**
- `framer-motion` package name: Use `motion` package instead (same library, renamed)
- `forwardRef` in React 19: Pass ref directly as prop (though forwardRef still works)
- Padding percentage trick for aspect ratio: Use native `aspect-ratio` CSS property

## Open Questions

Things that couldn't be fully resolved:

1. **Exact spring parameters for "playful bounce"**
   - What we know: Defaults are stiffness: 100, damping: 10. Lower damping = more bounce.
   - What's unclear: Exact values for desired playful feel
   - Recommendation: Start with stiffness: 100, damping: 12-15, iterate based on feel. This is marked as "Claude's discretion" in CONTEXT.md.

2. **Default card back design**
   - What we know: Component accepts custom cardBack prop
   - What's unclear: What the default should look like when not customized
   - Recommendation: Simple pattern or solid color with subtle texture. Marked as "Claude's discretion".

3. **SSR hydration with motion values**
   - What we know: Motion values work in SSR
   - What's unclear: Potential hydration mismatch with initial rotation state
   - Recommendation: Test with Next.js SSR; may need `suppressHydrationWarning` or initial animation delay.

## Sources

### Primary (HIGH confidence)

- [Motion Official Docs](https://motion.dev/docs) - Animation API, spring configuration
- [MDN CSS 3D Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-style) - perspective, preserve-3d, backface-visibility
- [React Documentation](https://react.dev/reference/react/forwardRef) - forwardRef, useImperativeHandle
- [3D Transforms Guide](https://3dtransforms.desandro.com/card-flip) - Canonical CSS card flip tutorial

### Secondary (MEDIUM confidence)

- [DEV.to Framer Motion Flip Card](https://dev.to/graciesharma/how-to-create-a-flipping-card-animation-using-framer-motion-5djh) - Complete implementation example
- [DEV.to useMotionValue & useTransform](https://dev.to/siddharth0x/framer-motion-usemotionvalue-usetransform-1hml) - Motion value patterns
- [Josh W. Comeau prefers-reduced-motion](https://www.joshwcomeau.com/react/prefers-reduced-motion/) - Accessibility hook
- [Material Design 3 Shadows](https://studioncreations.com/blog/material-design-3-box-shadow-css-values/) - Elevation CSS values
- [WCAG Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) - 44px minimum touch targets
- [CSS-Tricks backface-visibility](https://css-tricks.com/almanac/properties/b/backface-visibility/) - Safari fixes

### Tertiary (LOW confidence)

- Spring parameter recommendations from community tutorials - need validation through testing
- React 19 ref-as-prop pattern - verify works with current Motion version

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified against project STACK.md and official docs
- Architecture: HIGH - Patterns verified from multiple authoritative sources
- Pitfalls: HIGH - Documented in project PITFALLS.md and verified with official docs
- Code examples: MEDIUM - Synthesized from tutorials, need testing

**Research date:** 2026-02-02
**Valid until:** 2026-03-02 (30 days - stable domain)

---

*Phase 1: Foundation & Core Rendering - Research*
*Researched: 2026-02-02*
