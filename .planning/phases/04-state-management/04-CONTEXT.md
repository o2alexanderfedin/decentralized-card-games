# Phase 4: State Management - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Provide optional Redux Toolkit integration for managing card state in applications that use Redux, while ensuring the library works standalone without Redux. This phase adds state management capabilities but does not change the visual components from Phases 1-3.

</domain>

<decisions>
## Implementation Decisions

### Redux Integration Approach
- **Separate entry point**: Redux users import from separate entry point (e.g., `@yourlib/redux`)
- **Redux Toolkit only**: Support Redux Toolkit (createSlice, Immer), not plain Redux
- **Complete package**: Entry point exports slice + selectors + hooks - everything Redux users need
- **DnD integration**: Drag/drop lifecycle triggers Redux actions to update state - unified state management with Phase 3 components

### State Shape & Normalization
- **Nested by location structure**: Cards grouped by location - `{ deck: [...], hand: [...], discard: [...] }` rather than normalized flat structure
- **Include UI state**: Store card identity AND UI state - `{ suit, rank, faceUp, selected, position }` - single source of truth
- **Dynamic location strings**: Locations are any string - 'player1Hand', 'communityCards', etc. - flexible for different game types
- **Game scaffolding included**: Provide slots for currentPlayer, gamePhase, etc. beyond just cards - opinionated but helpful for game developers

### Hook API Design
- **Four core hooks**: useGameState (entire state), useLocation (cards in location), useCard (individual card), useGameActions (action dispatchers)
- **Same hooks for both modes**: Hooks work transparently whether using Redux or context - no separate APIs
- **useLocation returns array**: Returns Card[] only - simple, users can map/filter as needed
- **Dispatch-style actions**: useGameActions returns dispatch function - `dispatch('MOVE_CARD', {...})` Redux-style API

### Standalone vs Redux Modes
- **Strategy pattern for mode selection**: Claude chooses cleanest strategy pattern implementation for switching between Redux and context
- **localStorage persistence in context mode**: Standalone mode persists state to localStorage - survives page refresh
- **Both manual and helper setup**: Provide configureGameStore() helper for quick setup, manual slice addition for advanced users
- **Init actions provided**: User calls dispatch(dealStandardDeck()) or similar - explicit initialization, no auto-init

### Claude's Discretion
- Exact strategy pattern implementation (provider prop, factory function, or hook-based)
- Error handling for invalid state transitions
- TypeScript type definitions for action payloads
- Performance optimizations (memoization, selector caching)

</decisions>

<specifics>
## Specific Ideas

- State structure should support multiple players and different game types (poker, solitaire, trick-taking games)
- DnD integration from Phase 3 should feel seamless - dragging a card automatically updates Redux state
- Developer experience priority: Redux users shouldn't need to write boilerplate, context users shouldn't need config

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-state-management*
*Context gathered: 2026-02-03*
