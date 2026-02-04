# Decentralized Card Games - Component Library

## What This Is

A lean React component library for visualizing and interacting with standard playing cards. Provides reusable, interactive card components with drag-and-drop, flip animations, optional Redux state management, and emoji-based icons instead of image assets. Fully accessible (WCAG compliant) and production-ready with TypeScript support.

## Core Value

Developers can drop in fully interactive card components without building card UI from scratch. The library handles all visualization and interaction patterns for standard playing cards.

## Requirements

### Validated

- ✓ **Render standard 52-card deck** — v1.0: All 52 cards with suit emoji and rank display
- ✓ **Card face and back visualization using emoji icons** — v1.0: SUIT_EMOJI constants, pip layouts for number cards
- ✓ **Card flip animations** — v1.0: 3D CSS transform with Motion library spring physics
- ✓ **Drag and drop card interactions** — v1.0: dnd-kit integration with touch support and multi-card selection
- ✓ **Redux state management for card state** — v1.0: Optional Redux integration via separate entry point
- ✓ **Data structures that support future card customization** — v1.0: CardData type, parseCard/formatCard utilities
- ✓ **Component API for integrating cards into any React app** — v1.0: Tree-shakeable ESM build with TypeScript definitions
- ✓ **Accessibility** — v1.0: Keyboard navigation, screen readers, reduced motion, 44px touch targets (WCAG compliant)
- ✓ **Developer documentation** — v1.0: 35 interactive Storybook stories, headless hooks, CSS theming

### Active

(No active requirements — v1.0 complete. Define requirements for next milestone with `/gsd:new-milestone`)

### Out of Scope

- **Game logic** — This library only handles card visualization, not game rules (Poker, Durak, etc.). Validated in v1.0: library is pure UI with no game-specific logic.
- **Multiplayer/networking** — No server communication or real-time features. Still deferred.
- **Decentralization/blockchain** — Deferred to future platform work.
- **Card builder UI** — Data model supports it, but builder interface deferred to v2+.
- **Image assets** — Using emojis only for icons and card suits. Validated in v1.0: 57KB bundle proves emoji approach works.

## Context

### Current State

**Shipped version:** v1.0.0 (2026-02-04)

**What's built:**
- Complete React component library with 6 major phases:
  1. Foundation (Card component, flip animations, types)
  2. Containers (Hand, Deck, CardStack with layouts)
  3. Drag & Drop (dnd-kit integration, touch support)
  4. State Management (Context + optional Redux)
  5. Accessibility (WCAG compliance)
  6. Developer Experience (Storybook, build pipeline)

**Tech stack:**
- React 18/19 (peer dependency)
- Motion library for animations
- dnd-kit for drag-and-drop
- Redux Toolkit (optional peer dependency)
- TypeScript with strict mode
- Vite for build (ESM + UMD output)
- Vitest for testing (435 tests, 91.78% coverage)
- Storybook for documentation

**Build artifacts:**
- ESM bundle: 44.66 kB
- UMD bundle: 31.15 kB
- Redux entry: 4.39 kB (separate)
- CSS: 7.90 kB
- TypeScript declarations: Complete .d.ts files

**Distribution ready:**
- Package name: `@decentralized-games/card-components`
- npm publish ready (not yet published)
- Git tag: v1.0.0
- Storybook deployed: storybook-static/

### Original Vision

This library is the foundation for a future decentralized card games platform. The v1.0 focus was purely on the visualization and interaction layer — building robust, reusable components that work well before tackling game logic or decentralization.

We started with standard playing cards (poker deck) as the baseline, with data structures designed to accommodate custom card types in the future.

## Constraints

- **Tech stack**: React + Motion + dnd-kit — chosen for modern, performant animations and accessibility
- **No image assets**: Emoji-based icons only — validated: keeps library at 57KB vs 200KB+ with images
- **Standard deck first**: Focus on 52-card poker deck, but design data model to support extensions — validated
- **Interactive by default**: Cards must support drag, flip, and animations out of the box — validated
- **WCAG accessibility**: Must be fully keyboard-navigable and screen-reader accessible — validated

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + Redux (optional) | Familiar stack, Redux handles complex card state well | ✓ Good - Dual-mode works well |
| Emoji icons over images | Avoid asset management, keep library lightweight | ✓ Good - 57KB bundle validates approach |
| Library-first approach | Build reusable foundation before implementing specific games | ✓ Good - Clean API, no game coupling |
| Standard 52-card deck | Well-understood domain, validates component patterns before customization | ✓ Good - Strong foundation for extensions |
| Motion library (not Framer Motion) | Smaller bundle, still has spring physics | ✓ Good - Smooth animations, smaller footprint |
| dnd-kit (not react-dnd) | Modern, accessible, supports touch gestures | ✓ Good - Touch works on iOS/Android |
| Context + optional Redux | Works standalone, deep integration available | ✓ Good - Flexibility without forcing Redux |
| Multi-entry Vite build | Tree-shakeable imports, separate Redux bundle | ✓ Good - Redux users import only what they need |
| Storybook for docs | Interactive examples better than static docs | ✓ Good - 35 stories provide complete coverage |
| Vitest (not Jest) | Native ESM support, faster | ✓ Good - 435 tests run in <15 seconds |

---
*Last updated: 2026-02-04 after v1.0 milestone completion*
