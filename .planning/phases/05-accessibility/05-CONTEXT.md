# Phase 5: Accessibility - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Make card game components fully usable by people with disabilities through keyboard navigation, screen reader support, and WCAG 2.2 compliance. Users with disabilities can interact with cards, navigate between zones, and understand game state without mouse or visual display.

</domain>

<decisions>
## Implementation Decisions

### Keyboard navigation patterns
- Arrow keys (Left/Right or Up/Down) for navigating between cards within a container
- Space bar to select/deselect focused cards
- Claude's discretion on keyboard drag and drop implementation (following dnd-kit best practices)
- Game-specific keyboard shortcuts supported (e.g., D for draw, P for play, F to flip)
- Developer can register custom shortcuts for their game mechanics

### Screen reader experience
- Claude's discretion on card identity announcement format (natural language vs compact)
- Full context announcements: "Ace of Spades, card 3 of 7 in your hand" (includes position, total, and location)
- Announce grab/move/drop actions during drag and drop with real-time feedback
- Face-down cards announce as "Face-down card" without revealing identity (preserves game secrecy)
- Screen readers should not give unfair advantage by revealing hidden information

### Reduced motion handling
- Card flips use quick crossfade (200-300ms) when prefers-reduced-motion is set (no rotation)
- Drag and drop shows drag preview with linear movement (no spring physics or momentum)
- Layout animations (AnimatePresence) use fade only (no slide/scale) for enter/exit
- Provide respectReducedMotion prop (default true) allowing developers to override if needed
- Balance between accessibility compliance and maintaining game feel

### Touch target sizing & focus states
- Expand hit area with invisible padding to meet 44x44px minimum (visuals stay as designed)
- Browser default outline for keyboard focus indicators (guaranteed visibility and familiarity)
- Use :focus-visible to hide outline on mouse click, show on Tab navigation
- Different colors distinguish focus vs selection: blue outline for focus, green highlight for selected
- Cards can show both indicators simultaneously when focused and selected

### Claude's Discretion
- Specific implementation of keyboard drag-and-drop mechanism (likely Space to grab, arrows to move, Space to drop)
- Exact announcement format for card identity (balance between natural language and brevity)
- ARIA roles and labels structure
- Focus management during complex interactions
- Testing strategy for screen reader compatibility across platforms

</decisions>

<specifics>
## Specific Ideas

- Keyboard shortcuts should be discoverable (maybe a help overlay or documentation)
- Touch target expansion should be invisible to maintain design integrity
- Screen reader verbosity should not slow down experienced users (consider verbosity settings)
- Respect that some users need reduced motion for medical reasons (vestibular disorders)
- Focus indicators must be visible against all card backgrounds (light and dark)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-accessibility*
*Context gathered: 2026-02-03*
