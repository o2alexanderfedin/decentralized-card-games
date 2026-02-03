# Feature Research: React Card Component Library

**Domain:** React component library for playing card visualization and interaction
**Researched:** 2026-02-02
**Confidence:** MEDIUM (verified against existing libraries and current React ecosystem practices)

## Feature Landscape

### Table Stakes (Users Expect These)

Features developers assume exist. Missing these = library feels incomplete or unusable.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Render all 52 cards** | Basic deck coverage | LOW | 4 suits x 13 ranks; must include face cards (J, Q, K) and Aces |
| **Card back rendering** | Cards need hidden state | LOW | Single back design or configurable; essential for any game |
| **Suit/rank display** | Core card identity | LOW | Visual distinction between suits; standard rank notation |
| **Face up/down state** | Fundamental game mechanic | LOW | Boolean prop; all card games need this |
| **Card flip animation** | Expected UX polish | MEDIUM | CSS transform or animation library; 3D flip is standard |
| **Click/tap handlers** | Basic interactivity | LOW | onClick prop; foundation for all interactions |
| **Responsive sizing** | Modern web requirement | LOW | CSS-based scaling; SVG preferred for crisp rendering |
| **TypeScript types** | 2026 standard expectation | LOW | Full type coverage for props, events, card data |
| **Basic card container** | Group cards logically | LOW | Simple wrapper component for hands, piles, etc. |

### Differentiators (Competitive Advantage)

Features that set the library apart. Not required, but valuable for adoption.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Drag and drop** | Interactive card movement without custom implementation | HIGH | Consider dnd-kit or hello-pangea/dnd integration; gesture support |
| **Layout presets (fan, spread, stack)** | Ready-to-use hand arrangements | MEDIUM | CSS transforms for rotation/overlap; configurable spacing |
| **Deal/shuffle animations** | Professional card game feel | HIGH | Framer Motion or GSAP; staggered animations |
| **Redux integration hooks** | Seamless state management | MEDIUM | useCard, useDeck hooks; actions for draw, discard, shuffle |
| **WCAG accessibility** | Inclusive design; legal requirement in some regions | MEDIUM | aria-labels, keyboard navigation, screen reader announcements |
| **Emoji-based icons** | Lightweight, no external assets | LOW | Unicode suits; customizable via props |
| **CSS variable theming** | Easy customization without CSS-in-JS overhead | LOW | --card-width, --card-bg, --suit-red, etc. |
| **Tree-shakeable exports** | Small bundle for consumers | MEDIUM | ESM format, named exports, sideEffects: false |
| **Zone management** | Logical groupings (deck, hand, discard, play area) | MEDIUM | Container components with transfer animations |
| **Selection state** | Multi-select for discard/play actions | LOW | Visual feedback, managed state |
| **Stacking with peek** | See partial cards in piles | LOW | CSS positioning with configurable offset |
| **Hover/focus effects** | Visual feedback for interactive cards | LOW | CSS transitions; lift effect common |
| **Card back customization** | Branding, game themes | LOW | Prop for custom back design/color |

### Anti-Features (Deliberately NOT Built)

Features that seem valuable but create problems for a component library.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| **Game logic/rules** | "Just add Poker rules" | Couples library to specific games; limits reusability | Provide hooks/events; let consumers implement rules |
| **Server communication** | Multiplayer support | Networking is app-specific; adds massive scope | Export card state shapes; let consumers sync however they want |
| **Full deck management** | Convenience | State belongs to app, not component library | Provide utility functions (createDeck, shuffle) as separate export |
| **Player management** | Multi-player games | UI library shouldn't manage player state | Provide layout components that accept player data |
| **Scoring system** | Track points | Game-specific logic | Consumer responsibility |
| **Timer/turn management** | Game flow | App-level concern | Consumer responsibility |
| **Sound effects** | Polish | Bloats bundle; preference varies | Document how to add with events |
| **Database persistence** | Save games | Infrastructure concern | Export serializable state shapes |
| **AI opponents** | Single-player games | Massive scope; game-specific | Completely out of scope |
| **Chat/social features** | Multiplayer | App infrastructure | Completely out of scope |

## Feature Dependencies

```
[Card Component]
    |
    +-- requires --> [Suit/Rank Types]
    |
    +-- requires --> [Card Styling (CSS)]
    |
    +-- enhances --> [Flip Animation]
    |
    +-- enhances --> [Drag and Drop]

[Container Components]
    |
    +-- requires --> [Card Component]
    |
    +-- Layout Presets --> [Fan Layout]
    |                  --> [Spread Layout]
    |                  --> [Stack Layout]
    |
    +-- enhances --> [Zone Management]

[Redux Integration]
    |
    +-- requires --> [Card Types]
    |
    +-- provides --> [useCard Hook]
    |           --> [useDeck Hook]
    |           --> [Actions (draw, discard, shuffle)]
    |
    +-- optional --> [Zone State Management]

[Animations]
    |
    +-- requires --> [Card Component]
    |
    +-- [Flip] (can be CSS-only)
    |
    +-- [Deal/Shuffle] --> requires --> [Animation Library (Framer Motion/GSAP)]

[Accessibility]
    |
    +-- enhances --> [All Components]
    |
    +-- requires --> [Keyboard Navigation]
    |           --> [ARIA Labels]
    |           --> [Focus Management]

[Theming]
    |
    +-- CSS Variables (standalone)
    |
    +-- enhances --> [All Visual Components]
```

### Dependency Notes

- **Card Component requires Suit/Rank Types:** TypeScript types must be defined before components
- **Container Components require Card Component:** Containers render cards; card must exist first
- **Redux Integration requires Card Types:** Hooks and actions operate on typed card data
- **Deal/Shuffle Animations require Animation Library:** CSS alone insufficient for complex choreography
- **Accessibility enhances All Components:** Can be added incrementally but should be designed in from start
- **Drag and Drop conflicts with simple click handlers:** Need clear interaction mode (drag vs select)

## MVP Definition

### Launch With (v1.0)

Minimum viable product - what's needed to validate the library is useful.

- [x] **Card component** - Render any card face-up or face-down
- [x] **All 52 cards + backs** - Complete standard deck coverage
- [x] **Emoji suit icons** - Lightweight, zero external dependencies
- [x] **Flip animation** - CSS-based 3D flip on state change
- [x] **Click handlers** - onCardClick prop for basic interaction
- [x] **TypeScript types** - Full type safety for all public APIs
- [x] **Basic styling** - Clean default look with CSS variables
- [x] **Hand container** - Simple wrapper to group cards horizontally

### Add After Validation (v1.x)

Features to add once core is working and adopted.

- [ ] **Drag and drop** - Trigger: Users request card movement
- [ ] **Layout presets (fan, spread, stack)** - Trigger: Users building traditional card games
- [ ] **Redux hooks** - Trigger: Users asking for state management patterns
- [ ] **Zone components (Deck, Pile, PlayArea)** - Trigger: Users building multi-zone games
- [ ] **WCAG accessibility** - Trigger: Should be v1.1 priority; legal/ethical requirement
- [ ] **Selection state** - Trigger: Users need multi-card actions

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Deal/shuffle animations** - Complex choreography; nice-to-have polish
- [ ] **Custom card faces** - Extending beyond standard deck (Uno, custom games)
- [ ] **Touch gestures (swipe, long-press)** - Mobile-specific interactions
- [ ] **Animation presets** - Pre-built animation configs for common patterns
- [ ] **Storybook documentation site** - Comprehensive interactive docs

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Render 52 cards | HIGH | LOW | **P1** |
| Card back | HIGH | LOW | **P1** |
| Flip animation | HIGH | MEDIUM | **P1** |
| Click handlers | HIGH | LOW | **P1** |
| TypeScript types | HIGH | LOW | **P1** |
| Emoji icons | MEDIUM | LOW | **P1** |
| CSS variable theming | MEDIUM | LOW | **P1** |
| Hand container | MEDIUM | LOW | **P1** |
| Layout presets | HIGH | MEDIUM | **P2** |
| Drag and drop | HIGH | HIGH | **P2** |
| Redux hooks | MEDIUM | MEDIUM | **P2** |
| WCAG accessibility | HIGH | MEDIUM | **P2** |
| Zone components | MEDIUM | MEDIUM | **P2** |
| Selection state | MEDIUM | LOW | **P2** |
| Deal/shuffle animations | MEDIUM | HIGH | **P3** |
| Custom card faces | LOW | MEDIUM | **P3** |
| Touch gestures | MEDIUM | HIGH | **P3** |

**Priority Key:**
- **P1:** Must have for v1.0 launch - library is broken without these
- **P2:** Should have for v1.x - adds significant value, drives adoption
- **P3:** Nice to have for v2+ - polish and advanced use cases

## Competitor Feature Analysis

| Feature | @heruka_urgyen/react-playing-cards | react-playing-cards (wmaillard) | ink-playing-cards | Our Approach |
|---------|-----------------------------------|--------------------------------|-------------------|--------------|
| Card rendering | SVG-based, clean | Vector graphics | ASCII/Unicode variants | **SVG + Emoji hybrid** |
| Layouts | None | Fan, spread, stack | Grid, CardStack | **Fan, spread, stack (v1.x)** |
| Animations | None | None | None | **Flip (v1), Deal (v2)** |
| State management | None | None | Full zone/event system | **Redux hooks (v1.x)** |
| Customization | Limited | Card back color | Multiple variants | **CSS variables + props** |
| TypeScript | Yes | Unknown | Yes | **Full coverage** |
| Drag/drop | No | No | No | **v1.x differentiator** |
| Accessibility | Unknown | Unknown | Unknown | **v1.1 priority** |

### Competitive Gaps We Can Fill

1. **Animation support** - No existing library has built-in animations
2. **Drag and drop** - Common need, no library provides it
3. **State management integration** - ink-playing-cards has it for terminal, nothing for web React
4. **Modern React patterns** - Hooks, TypeScript, CSS variables
5. **Accessibility** - Appears neglected across all libraries

## Implementation Complexity Notes

### LOW Complexity Features
- Card rendering, types, basic props, CSS variables
- Can be completed in single sprint
- Standard React patterns

### MEDIUM Complexity Features
- Flip animation (CSS 3D transforms, state management)
- Layout presets (CSS math for rotation/positioning)
- Redux hooks (Redux Toolkit patterns)
- Accessibility (ARIA, keyboard nav, testing)

### HIGH Complexity Features
- Drag and drop (dnd-kit integration, gesture handling, drop zones)
- Deal/shuffle animations (Framer Motion choreography, staggering)
- Full zone management with transfer animations

## Sources

### Existing Libraries Analyzed
- [@heruka_urgyen/react-playing-cards](https://www.npmjs.com/package/@heruka_urgyen/react-playing-cards) - SVG playing cards
- [react-playing-cards (wmaillard)](https://github.com/wmaillard/react-playing-cards) - Vector graphics with layouts
- [ink-playing-cards](https://github.com/gfargo/ink-playing-cards) - Terminal card framework
- [react-playing-cards (listingslab)](https://github.com/javascript-pro/react-playing-cards) - Customizable SVG with GSAP

### Animation Libraries
- [Framer Motion](https://motion.dev/) - Production-grade React animation
- [react-card-flip](https://www.npmjs.com/package/react-card-flip) - Flip animation component
- [dnd-kit](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) - Customizable drag and drop

### Best Practices
- [React Aria (Adobe)](https://react-spectrum.adobe.com/react-aria/accessibility.html) - Accessibility patterns
- [styled-components theming](https://styled-components.com/docs/advanced) - Theming approaches
- [Tree shaking guide](https://carlrippon.com/how-to-make-your-react-component-library-tree-shakeable/) - Bundle optimization
- [TypeScript generics in React](https://www.totaltypescript.com/tips/use-generics-in-react-to-make-dynamic-and-flexible-components) - Type patterns

### Card UI Patterns
- [Card UI Design Best Practices](https://www.simplethread.com/card-components-best-practices/) - General card component patterns
- [Accessible cards](https://kittygiraudel.com/2022/04/02/accessible-cards/) - Accessibility implementation

---
*Feature research for: React Card Component Library*
*Researched: 2026-02-02*
