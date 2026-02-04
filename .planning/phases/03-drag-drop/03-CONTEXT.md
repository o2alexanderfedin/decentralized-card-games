# Phase 3: Drag & Drop - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable developers to build card games where cards can be dragged between zones using mouse or touch input. This phase delivers interactive card movement with visual feedback, drop zone validation, and cross-device support. State management and game logic are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Drag interaction design
- **Drag preview:** Configurable between original card, semi-transparent clone, or miniature version at cursor
- **Drop zone feedback:** Configurable visual states - border highlight with background tint, scale/pulse animation, or outline only
- **Drag start threshold:** Configurable - immediate on press, threshold distance (5-10px), or long-press for touch
- **Cursor feedback:** Configurable - grabbing hand cursor, custom cursor with card icon, or no cursor change
- Default to sensible options, but expose configuration for different game aesthetics

### Touch vs mouse behavior
- **Input handling:** Configurable to unified behavior or touch-optimized gestures (long-press, larger targets)
- **Scrolling during drag:** Configurable - block scrolling, edge-of-screen auto-scroll, or two-finger scroll
- **Haptic feedback:** Configurable - enabled, optional via prop, or disabled
- **Touch target size:** Configurable - match card visual size or expand hit area by 8-12px for WCAG compliance
- Support both desktop and mobile use cases with sensible defaults

### Drop validation & constraints
- **Validation method:** Both zone accepts prop AND optional callback for complex logic (flexible hybrid approach)
- **Invalid drop behavior:** Configurable - snap-back animation, visual rejection + snap-back, or card stays on cursor
- **Drop callbacks:** Multiple lifecycle callbacks - onDragStart, onDragOver, onDrop, onDropReject for granular control
- **Drop positioning:** Configurable per zone type - some zones append (Deck/Stack), others show insertion indicator (Hand/sequences)
- Developer has full control over game rules through callback functions

### Multi-card dragging
- **Multi-drag support:** Configurable to core feature, via composition (building blocks), or disabled (single card only)
- **Selection method:** Claude's discretion - choose based on cross-platform usability patterns
- **Multi-drag visual:** Claude's discretion - balance visual clarity with performance
- **Multi-drop validation:** Claude's discretion - choose between all-or-nothing, filtering, or callback-based

### Claude's Discretion
- Specific animation timing curves and durations
- Exact visual feedback styles (colors, shadows, borders)
- Performance optimizations for 50+ cards
- Error handling and edge cases
- Default configuration values for all optional behaviors
- Multi-card interaction patterns (if implemented)

</decisions>

<specifics>
## Specific Ideas

- Success criteria mentions 50+ cards without jank - performance is critical
- Touch gestures must work on iOS Safari and Android Chrome specifically
- The library should feel configurable but provide excellent defaults for common games
- "Make it feel like dragging physical cards" - smooth, responsive, tactile

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 03-drag-drop*
*Context gathered: 2026-02-03*
