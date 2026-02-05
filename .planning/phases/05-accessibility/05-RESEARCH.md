# Phase 5: Accessibility - Research

**Researched:** 2026-02-03
**Domain:** WCAG 2.2 compliance, keyboard navigation, screen reader support, reduced motion for React card game components
**Confidence:** HIGH

## Summary

This phase adds comprehensive accessibility to an existing React card game component library built with `motion` (v12.27+), `@dnd-kit/core` (v6.3+), and CSS Modules. The library has 10 components (Card, Hand, Deck, CardStack, DropZone, DraggableCard, DroppableZone, CardDragOverlay, CardDndProvider, StatefulCardDndProvider) that currently have minimal accessibility: Card has `role="button"`, `aria-label`, and `tabIndex={0}`; Deck has similar basics; but Hand, CardStack, DropZone, and drag-and-drop components lack ARIA roles, keyboard navigation within containers, and screen reader announcements.

The standard approach is: (1) add roving tabindex for arrow-key navigation within card containers (Hand, CardStack), (2) configure dnd-kit's built-in `announcements` and `screenReaderInstructions` props for accessible drag-and-drop, (3) use `MotionConfig` with `reducedMotion="user"` as a global toggle plus component-level overrides via the existing `usePrefersReducedMotion` hook, (4) apply `:focus-visible` CSS for keyboard-only focus indicators, and (5) use `vitest-axe` for automated accessibility testing.

Key recommendations: use `role="listbox"` with `role="option"` for card containers (Hand, CardStack), implement a custom `useRovingTabIndex` hook rather than adding a dependency, customize dnd-kit announcements with card-specific context ("Picked up Ace of Spades from your hand"), and use `MotionConfig` to globally respect reduced motion while maintaining the existing `usePrefersReducedMotion` hook for component-level control.

**Primary recommendation:** Layer accessibility onto existing components via ARIA attributes, roving tabindex hook, dnd-kit announcement customization, and CSS `:focus-visible` -- no new dependencies except `vitest-axe` for testing.

## Standard Stack

### Core (already installed -- no new runtime dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@dnd-kit/core` | ^6.3.1 | Built-in keyboard sensor, announcements, screenReaderInstructions | Already used; has first-class a11y support with live regions |
| `motion` | ^12.27.0 | `MotionConfig reducedMotion="user"`, `useReducedMotion` hook | Already used; provides global reduced-motion toggle |
| React | ^18/^19 | Native ARIA attribute support, `aria-*` props in JSX | Foundation |

### Supporting (new dev dependency only)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vitest-axe` | ^1.0.0 | axe-core assertions for Vitest (`toHaveNoViolations`) | Every component test should include an axe scan |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom `useRovingTabIndex` hook | `react-roving-tabindex` npm package | Package is 4 years unmaintained (v3.2.0); custom hook is ~60 lines, tailored to card containers, no dependency risk |
| Custom announcements | React Aria DnD | Would require replacing dnd-kit entirely; overkill since dnd-kit already has announcement support |
| `vitest-axe` | `jest-axe` | `vitest-axe` is the direct Vitest-compatible fork; `jest-axe` has type conflicts with Vitest |

**Installation:**
```bash
npm install --save-dev vitest-axe
```

## Architecture Patterns

### Recommended File Structure
```
src/
  hooks/
    useRovingTabIndex.ts          # NEW - roving tabindex for card containers
    useRovingTabIndex.test.ts     # NEW
    useKeyboardShortcuts.ts       # NEW - game-specific keyboard shortcuts (D, P, F)
    useKeyboardShortcuts.test.ts  # NEW
    useCardAnnouncer.ts           # NEW - aria-live announcement helper
    useCardAnnouncer.test.ts      # NEW
    usePrefersReducedMotion.ts    # EXISTS - already built
  components/
    Card/Card.tsx                 # MODIFY - enhance ARIA, face-down handling
    Hand/Hand.tsx                 # MODIFY - add listbox role, roving tabindex
    Deck/Deck.tsx                 # MODIFY - enhance ARIA, keyboard Enter for draw
    CardStack/CardStack.tsx       # MODIFY - add group role, ARIA labels
    DropZone/DropZone.tsx         # MODIFY - add ARIA labels for drop targets
    DraggableCard/DraggableCard.tsx  # MODIFY - enhance ARIA descriptions
    CardDndProvider/CardDndProvider.tsx  # MODIFY - add announcements + screenReaderInstructions
    *.module.css                  # MODIFY - add :focus-visible styles, touch targets
  utils/
    a11y.ts                       # NEW - announcement text builders, ARIA helpers
    a11y.test.ts                  # NEW
```

### Pattern 1: Roving Tabindex for Card Containers

**What:** Only one card in a container has `tabIndex={0}` at a time. Arrow keys move focus between cards. Tab moves to the next container entirely.
**When to use:** Hand component, CardStack, any container with multiple cards.
**Why:** Standard WAI-ARIA pattern for composite widgets. Prevents Tab-trap where users must Tab through 13+ cards to reach the next game zone.

```typescript
// Roving tabindex hook
export function useRovingTabIndex(itemCount: number) {
  const [activeIndex, setActiveIndex] = useState(0);

  const getTabIndex = (index: number) => index === activeIndex ? 0 : -1;

  const handleKeyDown = useCallback((event: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (index + 1) % itemCount;
        event.preventDefault();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (index - 1 + itemCount) % itemCount;
        event.preventDefault();
        break;
      case 'Home':
        nextIndex = 0;
        event.preventDefault();
        break;
      case 'End':
        nextIndex = itemCount - 1;
        event.preventDefault();
        break;
    }
    if (nextIndex !== index) {
      setActiveIndex(nextIndex);
      // Caller is responsible for focusing the element
    }
  }, [itemCount]);

  return { activeIndex, setActiveIndex, getTabIndex, handleKeyDown };
}
```

### Pattern 2: Custom DnD Announcements

**What:** Customize dnd-kit's `announcements` prop to speak card identity and zone context.
**When to use:** CardDndProvider and StatefulCardDndProvider.

```typescript
// Source: https://docs.dndkit.com/guides/accessibility
const cardAnnouncements = {
  onDragStart({ active }) {
    const data = active.data.current as DragItemData;
    const cardName = formatCardForSpeech(data.card); // "Ace of Spades"
    const zone = data.sourceZoneId ?? 'unknown zone';
    return `Picked up ${cardName} from ${zone}. Use arrow keys to move between zones. Press Space or Enter to drop, Escape to cancel.`;
  },
  onDragOver({ active, over }) {
    const cardName = formatCardForSpeech(active.data.current?.card);
    if (over) {
      return `${cardName} is over ${over.id}.`;
    }
    return `${cardName} is not over a drop zone.`;
  },
  onDragEnd({ active, over }) {
    const cardName = formatCardForSpeech(active.data.current?.card);
    if (over) {
      return `${cardName} was dropped on ${over.id}.`;
    }
    return `${cardName} was returned to its original position.`;
  },
  onDragCancel({ active }) {
    const cardName = formatCardForSpeech(active.data.current?.card);
    return `Dragging ${cardName} was cancelled. Card returned to original position.`;
  },
};

const cardScreenReaderInstructions = {
  draggable: 'To pick up this card, press Space or Enter. Use arrow keys to move between drop zones. Press Space or Enter to drop, or Escape to cancel.',
};
```

### Pattern 3: Reduced Motion via MotionConfig

**What:** Wrap application in `<MotionConfig reducedMotion="user">` to automatically disable transform/layout animations while preserving opacity and color transitions.
**When to use:** At the top level of the component tree (CardDndProvider or application root).

```typescript
// Source: motion.dev/docs/react-accessibility
import { MotionConfig } from 'motion/react';

// Global: automatically respects OS reduced-motion setting
<MotionConfig reducedMotion="user">
  <App />
</MotionConfig>

// Per-decision context, the existing usePrefersReducedMotion hook
// handles component-specific overrides (card flips, hand animations)
```

### Pattern 4: Card Identity Announcement Format

**What:** Format card announcements with full context for screen readers.
**When to use:** ARIA labels, live region announcements.

```typescript
// Natural language format for ARIA labels
function formatCardLabel(card: CardData, position: number, total: number, location: string): string {
  const rank = RANK_NAMES[card.rank]; // "Ace", "2", "3"... "King"
  const suit = SUIT_NAMES[card.suit]; // "Spades", "Hearts", "Diamonds", "Clubs"
  return `${rank} of ${suit}, card ${position} of ${total} in ${location}`;
}

// Face-down cards must not reveal identity
function formatFaceDownLabel(position: number, total: number, location: string): string {
  return `Face-down card, card ${position} of ${total} in ${location}`;
}
```

### Pattern 5: Keyboard Shortcuts Registry

**What:** Allow developers to register game-specific keyboard shortcuts (D for draw, P for play, F to flip) via a context provider.
**When to use:** Game-level keyboard interaction layer.

```typescript
interface KeyboardShortcut {
  key: string;       // 'D', 'P', 'F', etc.
  action: () => void;
  label: string;     // Human-readable description for help overlay
  enabled?: boolean;
}

function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only fire when no modifier keys held and not in an input field
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const shortcut = shortcuts.find(
        s => s.key.toUpperCase() === e.key.toUpperCase() && s.enabled !== false
      );
      if (shortcut) {
        e.preventDefault();
        shortcut.action();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
```

### Anti-Patterns to Avoid

- **Wrapping every card in `tabIndex={0}`:** Creates a Tab-trap where keyboard users must Tab through every card. Use roving tabindex instead so the container gets one Tab stop.
- **Using `aria-grabbed` / `aria-dropeffect`:** These are deprecated in WAI-ARIA 1.1 with no replacement. dnd-kit uses live regions instead.
- **Removing focus outlines without replacement:** `outline: none` without a visible `:focus-visible` alternative makes the UI unusable for keyboard users.
- **Announcing hidden card identity to screen readers:** Face-down cards must announce as "Face-down card" to preserve game secrecy. Never put the actual card identity in ARIA attributes for face-down cards.
- **Using `aria-live="assertive"` for drag movements:** Use `polite` for ongoing movement announcements, `assertive` only for critical errors. dnd-kit handles this correctly by default.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Keyboard DnD | Custom keyboard drag system | dnd-kit `KeyboardSensor` + `announcements` | Already configured in `useDragSensors.ts`; has live regions, coordinate getters |
| Live region management | Custom `aria-live` region insertion/timing | dnd-kit's built-in live region (via `DndContext`) | Handles 250ms timing quirk, unique IDs, off-screen positioning |
| Reduced motion detection | Custom `matchMedia` listener | Existing `usePrefersReducedMotion` hook + `MotionConfig reducedMotion="user"` | Already built in Phase 1; Motion library handles transform disabling |
| axe-core integration | Manual ARIA rule checking | `vitest-axe` `toHaveNoViolations()` | Runs 80+ WCAG rules automatically |
| Screen reader instructions for DnD | Manual instruction text injection | dnd-kit `screenReaderInstructions` prop | Renders off-screen, linked via `aria-describedby` automatically |

**Key insight:** dnd-kit already ships with keyboard sensor, live regions, ARIA attributes on draggable elements, and customizable announcements. The work is primarily _customizing_ existing dnd-kit accessibility features with card-game-specific context, not building DnD accessibility from scratch.

## Common Pitfalls

### Pitfall 1: Tab-Trap in Card Containers

**What goes wrong:** Each card has `tabIndex={0}`, forcing keyboard users to Tab through every card (potentially 13+ in a hand) to reach the next game zone.
**Why it happens:** Developers give every interactive element a tab stop without considering composite widget patterns.
**How to avoid:** Use roving tabindex: the Hand container gets one Tab stop; arrow keys navigate between cards within it.
**Warning signs:** User needs more than 2-3 Tab presses to move past a container.

### Pitfall 2: Screen Reader Reveals Hidden Cards

**What goes wrong:** Face-down cards have `aria-label="Ace of Spades"`, giving screen reader users an unfair advantage.
**Why it happens:** Developers apply the same ARIA label logic regardless of card face-up state.
**How to avoid:** Check `isFaceUp` before setting ARIA label. Face-down cards always get `aria-label="Face-down card"`.
**Warning signs:** Any code path that sets ARIA label without checking face-up state.

### Pitfall 3: Focus Indicator Invisible on Card Backgrounds

**What goes wrong:** Blue focus outline disappears against blue card backs, or light outline disappears against white card fronts.
**Why it happens:** Single-color focus indicator doesn't work across all card backgrounds.
**How to avoid:** Use browser default outline (per user's decision) which typically has sufficient contrast, or use the two-color outline technique (W3C C40). The user chose browser defaults, which are guaranteed visible.
**Warning signs:** Test focus visibility on both face-up (white background) and face-down (dark blue background) cards.

### Pitfall 4: Reduced Motion Breaks Flip Animation

**What goes wrong:** With `reducedMotion="user"`, MotionConfig disables transform animations. The card flip (which uses `rotateY` transform) stops working entirely, showing no visual change.
**Why it happens:** MotionConfig's "user" mode blanket-disables all transforms.
**How to avoid:** For card flips under reduced motion, use crossfade (opacity transition) instead of rotation. The existing `usePrefersReducedMotion` hook already switches to stiff springs; extend this to use opacity-only crossfade (200-300ms) per the user's decision.
**Warning signs:** Card appears to do nothing when clicked with reduced motion enabled.

### Pitfall 5: DnD Announcements Use Default Generic Text

**What goes wrong:** Screen reader says "Picked up draggable item 1" instead of "Picked up Ace of Spades from your hand."
**Why it happens:** dnd-kit's default announcements use element IDs, not semantic data.
**How to avoid:** Always customize `announcements` prop on DndContext with card-game-specific text using `active.data.current`.
**Warning signs:** Testing with screen reader and hearing generic position-based announcements.

### Pitfall 6: vitest-axe Fails with happy-dom

**What goes wrong:** axe-core throws `Node.prototype.isConnected` errors.
**Why it happens:** Known bug in Happy DOM's DOM implementation.
**How to avoid:** Project already uses `jsdom` environment (confirmed in vitest.config.ts). Keep it that way.
**Warning signs:** Switching test environment to happy-dom.

### Pitfall 7: Missing Single-Pointer Alternative for DnD (WCAG 2.5.7)

**What goes wrong:** WCAG 2.2 SC 2.5.7 "Dragging Movements" requires a non-dragging alternative. Keyboard support alone doesn't satisfy mobile users who can't access keyboards.
**Why it happens:** Developers think keyboard alternative = WCAG compliant.
**How to avoid:** Provide a click-to-select-then-click-to-place flow as an alternative to dragging. For card games, this means: click card to select, then click target zone to move.
**Warning signs:** Drag is the only way to move a card on touch devices.

## Code Examples

### Card with Enhanced ARIA (Face-Up vs Face-Down)

```typescript
// Card component enhanced aria-label
const ariaLabel = useMemo(() => {
  if (!faceUp) return 'Face-down card';
  if (!cardData) return 'Card';
  const rankName = RANK_NAMES[cardData.rank]; // Map: A -> Ace, K -> King, etc.
  const suitName = SUIT_NAMES[cardData.suit]; // Map: Spades, Hearts, etc.
  return `${rankName} of ${suitName}`;
}, [cardData, faceUp]);
```

### Hand with Listbox Role and Roving Tabindex

```typescript
// Hand component with accessibility
const { activeIndex, getTabIndex, handleKeyDown } = useRovingTabIndex(normalizedCards.length);

return (
  <div
    ref={containerRef}
    className={handClasses}
    role="listbox"
    aria-label="Your hand"
    aria-orientation="horizontal"
    data-testid="hand"
  >
    <AnimatePresence mode="popLayout">
      {normalizedCards.map((card, i) => {
        const isSelected = effectiveSelected.has(i);
        return (
          <motion.div
            key={key}
            role="option"
            aria-selected={isSelected}
            aria-label={`${rankName} of ${suitName}, card ${i + 1} of ${normalizedCards.length}`}
            tabIndex={getTabIndex(i)}
            onKeyDown={(e) => {
              handleKeyDown(e, i);
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleCardClick(card, i);
              }
            }}
            // ... existing motion props
          >
            <Card card={card} isFaceUp={faceUp} />
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
);
```

### Focus-Visible CSS for Cards

```css
/* Card focus indicator - browser default outline */
.card:focus-visible {
  outline: revert; /* Use browser default */
  outline-offset: 2px;
}

/* Hide focus ring on mouse click */
.card:focus:not(:focus-visible) {
  outline: none;
}

/* Selection indicator (different from focus) */
.cardSlot--selected {
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.6); /* Green for selection */
}
```

### Touch Target Expansion

```css
/* Expand touch target to 44x44px minimum using invisible padding */
.card::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 44px;
  min-height: 44px;
  transform: translate(-50%, -50%);
}
```

### DndContext with Custom Announcements

```typescript
// Source: https://docs.dndkit.com/guides/accessibility
<DndContext
  sensors={sensors}
  announcements={{
    onDragStart({ active }) {
      const data = active.data.current as DragItemData;
      if (!data?.card) return 'Picked up item.';
      return `Picked up ${formatCardForSpeech(data.card)} from ${data.sourceZoneId ?? 'the board'}.`;
    },
    onDragOver({ active, over }) {
      const name = formatCardForSpeech(active.data.current?.card);
      return over
        ? `${name} is over ${over.id}.`
        : `${name} is not over a drop zone.`;
    },
    onDragEnd({ active, over }) {
      const name = formatCardForSpeech(active.data.current?.card);
      return over
        ? `${name} was dropped on ${over.id}.`
        : `${name} was returned to its original position.`;
    },
    onDragCancel({ active }) {
      return `Dragging ${formatCardForSpeech(active.data.current?.card)} was cancelled.`;
    },
  }}
  screenReaderInstructions={{
    draggable: 'To pick up this card, press Space or Enter. Use arrow keys to move between drop zones. Press Space or Enter to drop, or Escape to cancel.',
  }}
>
```

### vitest-axe Setup and Usage

```typescript
// src/test-setup.ts - add vitest-axe matchers
import '@testing-library/jest-dom/vitest';
import * as matchers from 'vitest-axe/matchers';
expect.extend(matchers);

// In test file:
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';

it('has no accessibility violations', async () => {
  const { container } = render(<Card card="sA" isFaceUp={true} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Reduced Motion Crossfade for Card Flip

```typescript
// In useCardFlip.ts - when reduced motion is active
// Instead of rotateY spring animation, use instant opacity crossfade
if (prefersReducedMotion) {
  // Skip 3D rotation entirely
  // Front opacity: 1 when faceUp, 0 when faceDown (200ms transition)
  // Back opacity: 0 when faceUp, 1 when faceDown (200ms transition)
  return {
    rotateY: motionValue(0), // No rotation
    frontOpacity: useSpring(faceUp ? 1 : 0, { duration: 0.25 }),
    backOpacity: useSpring(faceUp ? 0 : 1, { duration: 0.25 }),
    isAnimating: false,
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `aria-grabbed` + `aria-dropeffect` | ARIA live regions + custom announcements | WAI-ARIA 1.1 (deprecated) | dnd-kit already uses live regions correctly |
| `:focus` for all focus styles | `:focus-visible` for keyboard-only focus | CSS4 / 2022+ | Widely supported in all modern browsers |
| Custom reduced-motion media query listener | `MotionConfig reducedMotion="user"` | Motion v10+ | Automatic transform disabling |
| WCAG 2.1 (no drag guidance) | WCAG 2.2 SC 2.5.7 Dragging Movements | Oct 2023 | Must provide single-pointer alternative to drag |
| `tabindex="0"` on every item | Roving tabindex for composite widgets | WAI-ARIA APG (longstanding) | One Tab stop per container, arrows within |

**Deprecated/outdated:**
- `aria-grabbed` / `aria-dropeffect`: Deprecated in WAI-ARIA 1.1, no replacement. Do not use.
- `role="application"`: Overused; not appropriate for card containers. Use `role="listbox"` or `role="group"`.
- `@dnd-kit/accessibility` (hypothetical): Not a separate package; accessibility is built into `@dnd-kit/core`.

## Open Questions

1. **Exact dnd-kit v6 announcements API shape**
   - What we know: dnd-kit supports `announcements` and `screenReaderInstructions` props on DndContext. The announcements object has `onDragStart`, `onDragOver`, `onDragEnd`, `onDragCancel` keys returning strings.
   - What's unclear: Whether the v6.3.1 API accepts these as a direct prop on DndContext or requires a separate `Accessibility` wrapper component. The docs show both patterns in different versions.
   - Recommendation: Verify by checking the actual DndContext TypeScript types in node_modules during implementation. HIGH confidence this works as documented.

2. **MotionConfig `reducedMotion="user"` interaction with useSpring**
   - What we know: MotionConfig disables transform and layout animations. The existing `useCardFlip` uses `useSpring` for `rotateY`.
   - What's unclear: Whether MotionConfig's "user" mode affects `useSpring` motion values or only `motion.div` `animate` prop. The card flip uses motion values directly, which may bypass MotionConfig.
   - Recommendation: Test empirically during implementation. If MotionConfig doesn't affect useSpring, the existing `usePrefersReducedMotion` hook-based approach (already in place) is the correct path. MEDIUM confidence.

3. **Click-to-select-then-click-to-drop as DnD alternative (WCAG 2.5.7)**
   - What we know: WCAG 2.5.7 requires a single-pointer non-dragging alternative. Keyboard support alone is insufficient for mobile.
   - What's unclear: Whether this is in scope for Phase 5 or deferred. The user's decisions mention keyboard drag-and-drop but not explicit click-to-move alternative.
   - Recommendation: Include as a stretch goal or document as a known gap. The existing onClick handlers on DroppableZone could serve as the foundation.

## Sources

### Primary (HIGH confidence)
- [dnd-kit Accessibility Guide](https://docs.dndkit.com/guides/accessibility) - Announcements, screenReaderInstructions, ARIA attributes, live regions
- [dnd-kit Keyboard Sensor Docs](https://docs.dndkit.com/api-documentation/sensors/keyboard) - KeyboardSensor config, activation keys, coordinate getters
- [dnd-kit DndContext API](https://docs.dndkit.com/api-documentation/context-provider) - announcements prop, screenReaderInstructions prop
- [Motion Accessibility Guide](https://motion.dev/docs/react-accessibility) - MotionConfig reducedMotion, useReducedMotion hook
- [W3C WCAG 2.2 SC 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) - Focus indicator requirements
- [W3C WCAG 2.2 SC 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) - Focus indicator size/contrast (AAA)
- Existing codebase: `usePrefersReducedMotion.ts`, `useDragSensors.ts`, `CardDndProvider.tsx`, `Card.tsx`, `Hand.tsx`

### Secondary (MEDIUM confidence)
- [WCAG 2.2 SC 2.5.7 Dragging Movements](https://accessicart.com/wcag-2-2-aa-sc-2-5-7-dragging-movements/) - Single-pointer alternative requirement
- [Sara Soueidan - Accessible Focus Indicators](https://www.sarasoueidan.com/blog/focus-indicators/) - Two-color technique, contrast guidelines
- [TPGi - Accessible Drag and Drop Part 2](https://www.tpgi.com/the-road-to-accessible-drag-and-drop-part-2/) - Live region timing, aria-describedby vs aria-live
- [vitest-axe GitHub](https://github.com/chaance/vitest-axe) - Setup, API, happy-dom incompatibility note
- [React Aria DnD Blog Post](https://react-spectrum.adobe.com/blog/drag-and-drop.html) - Best practices for accessible DnD (informational, not for adoption)

### Tertiary (LOW confidence)
- [react-roving-tabindex npm](https://www.npmjs.com/package/react-roving-tabindex) - Evaluated and rejected (unmaintained)
- [Darin Senneff - Screen Readers and DnD](https://www.darins.page/articles/screen-readers-drag-drop-2) - Cross-screen-reader grab state communication challenges

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use; dnd-kit accessibility is well-documented
- Architecture: HIGH - Patterns (roving tabindex, ARIA listbox, dnd-kit announcements) are WAI-ARIA standard practices
- Pitfalls: HIGH - Well-documented in WCAG guidelines and library docs
- Reduced motion: MEDIUM - MotionConfig interaction with useSpring motion values needs empirical verification
- WCAG 2.5.7 scope: MEDIUM - Single-pointer alternative may or may not be in phase scope

**Research date:** 2026-02-03
**Valid until:** 2026-03-05 (30 days - WCAG and library APIs are stable)
