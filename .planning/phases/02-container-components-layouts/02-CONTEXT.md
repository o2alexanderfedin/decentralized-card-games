# Phase 2: Container Components & Layouts - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Display cards in hands, decks, and stacks with layout presets. Developers can arrange multiple cards visually using container components (Hand, Deck, CardStack) with built-in layout utilities for positioning, rotation, and overlap calculations.

</domain>

<decisions>
## Implementation Decisions

### Layout presets & arrangements
- **Hand component fan layouts**: Both arc (curved) and linear fan styles, configurable by developer
- **Spread layout**: Adaptive spacing that adjusts based on card count and container width to prevent overflow
- **CardStack overlap**: Cascade style with diagonal offset + slight rotation for visual interest
- Layout utilities calculate rotation angles and positions for different card counts

### Component API design
- **Card data format**: Support both card objects `{suit, rank}` and string notation `'AH'` for flexibility
- **Selection pattern**: Support both controlled selection (with `selectedCards` state) and uncontrolled (click event handlers only)
- **Ref API**: Expose imperative methods via ref for programmatic control (e.g., `handRef.current.selectCard(index)`, `deckRef.current.drawCard()`)
- Event delegation for card interactions within containers

### Visual presentation
- **Fan rotation angles**: Configurable presets - subtle (±15-20°), standard (±25-35°), dramatic (±40-50°)
- **3D effects**: Apply CSS perspective transforms to create depth effect
- **Responsive sizing**: Hybrid approach - scale cards AND adjust spacing/overlap based on available space
- Z-index management for proper card layering in overlapping layouts

### Container interactions
- **Deck draw behavior**: Fire event only (`onDraw`) - developer handles state updates for card movement
- **Hover effects**: Configurable - either lift (elevate card) or highlight (border/glow), controllable via prop
- **Empty state**: Configurable options - nothing (invisible), placeholder outline, or custom slot via prop
- Click/tap interactions bubble up to container level with card identity

### Claude's Discretion
- Exact spacing calculations and overlap percentages
- Animation timing for hover/interaction effects
- Default z-index values and layering strategy
- Performance optimizations for large card counts
- Specific responsive breakpoints

</decisions>

<specifics>
## Specific Ideas

- Layout utilities should handle edge cases (1 card, 2 cards, 10+ cards) gracefully
- Perspective transforms should enhance realism without making cards hard to read
- API should feel natural for developers building any card game type (poker, solitaire, collectible card games)
- Empty state flexibility allows games to show custom artwork or messages

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope

</deferred>

---

*Phase: 02-container-components-layouts*
*Context gathered: 2026-02-03*
