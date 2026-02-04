# Phase 1: Foundation & Core Rendering - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Building the fundamental card rendering components - developers can render any of the 52 playing cards with flip animations. This delivers the atomic card component that serves as the building block for all future card game interactions.

</domain>

<decisions>
## Implementation Decisions

### Card Visual Design
- **Aspect ratio:** Support both poker size (2.5:3.5) and bridge size (2.25:3.5) as configurable options
- **Suit symbols:** Primary implementation uses emoji suits (♠♥♦♣), with SVG fallback/secondary option
- **Suit colors:** Support both traditional two-color (♥♦ red, ♠♣ black) and four-color variants (♥ red, ♦ blue, ♣ green, ♠ black)
- **Card notation:** Use emoji suit + rank format (e.g., "♠2", "♥A") with ranks as 23456789TJQKA
- **Card back:** Fully customizable - component accepts custom card back as prop (image, pattern, or component)
- **Overall aesthetic:** Flat/material design - bold colors, subtle shadows, modern web component feel

### Animation Behavior
- **Flip duration:** Configurable via prop with sensible default
- **Easing function:** Spring physics for bouncy, playful character
- **3D perspective:** Configurable from subtle to moderate to dramatic depth
- **Accessibility:** Full control to developer via props for prefers-reduced-motion handling

### Component API
- **State management:** Both controlled and uncontrolled modes - controlled when `isFaceUp` prop provided, uncontrolled otherwise
- **Card identity:** String notation with emoji suit + rank (e.g., "♠A", "♥7")
- **Events:**
  - `onClick` with card data (suit, rank, face state)
  - `onFlipStart` and `onFlipComplete` for animation lifecycle
  - `onHover` and `onFocus` for interaction states
- **Ref exposure:** Support imperative flip control via ref in uncontrolled mode

### Responsive Scaling
- **Resize behavior:** Fit within container while maintaining aspect ratio
- **Size constraints:** No minimum/maximum constraints - developer controls via container
- **Font scaling:** Relative units (em/rem) for rank and suit text to scale proportionally with card size
- **Mobile optimization:** Touch-optimized behavior with larger touch targets and appropriate touch event handling

### Claude's Discretion
- Exact spring physics parameters (stiffness, damping)
- Default animation duration value
- Specific shadow values for material design aesthetic
- Default card back design (when not customized)
- Exact touch target sizing for mobile
- Border radius and padding values
- Performance optimization techniques (CSS vs JS animation)

</decisions>

<specifics>
## Specific Ideas

- Card notation inspired by pokher library: emoji suits (♠♥♦♣) combined with ranks (23456789TJQKA)
- Support four-color deck variant: ♥ red, ♦ blue, ♣ green, ♠ black (in addition to traditional two-color)
- Material design aesthetic with flat styling - think Google Material or modern web component libraries
- Spring physics for animations - playful, bouncy feel rather than linear timing

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation---core-rendering*
*Context gathered: 2026-02-02*
