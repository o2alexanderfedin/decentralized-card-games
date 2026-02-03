# Project Research Summary

**Project:** React Card Component Library
**Domain:** Interactive UI Component Library (Gaming/Card Visualization)
**Researched:** 2026-02-02
**Confidence:** HIGH

## Executive Summary

This project is a React component library for rendering and interacting with playing cards. Expert developers in this domain prioritize lightweight, tree-shakeable bundles with GPU-accelerated animations and flexible state management. The 2025-2026 ecosystem has converged on Vite for library builds, Vitest for testing, dnd-kit for drag-and-drop, and Motion (formerly Framer Motion) for animations. Redux Toolkit integration is a project requirement, but the library must work standalone to avoid forcing Redux on all consumers.

The recommended approach is a layered architecture: expose both pre-built components for quick integration AND headless hooks for custom implementations. Build with ESM format and strict tree-shaking to ensure consumers can import individual components without bundle bloat. Use compound components and context composition to provide flexibility while maintaining simple default use cases. The critical path is Foundation (types, base components, animation patterns) → Interactive Features (drag-and-drop, layouts) → Redux Integration (optional layer).

The highest risks are performance degradation from animation state management, bundle bloat from poor tree-shaking, and accessibility retrofitting. Mitigate by enforcing Motion Values (not React state) for animation, building with ESM and testing bundle size from day one, and integrating eslint-plugin-jsx-a11y into CI immediately. Animation performance patterns and accessibility foundations must be established in Phase 1; retrofitting these later requires API-breaking changes and is 10x more expensive.

## Key Findings

### Recommended Stack

The modern React library ecosystem has standardized around Vite for build tooling (native library mode with sub-second HMR), Vitest for testing (10x faster than Jest with Vite integration), and TypeScript as mandatory for component libraries. For this interactive card library, dnd-kit provides modular drag-and-drop (10KB core vs 50KB+ for react-dnd) with accessibility built-in, and Motion delivers declarative animations with hardware acceleration.

**Core technologies:**
- **Vite 7.3+**: Build tool with native library mode — produces tree-shakeable ESM/CJS bundles with TypeScript declarations
- **TypeScript 5.8+**: Type safety and .d.ts generation — required for component library DX
- **Redux Toolkit 2.11+**: State management per project requirement — excellent TypeScript support, reduced boilerplate
- **Motion 12.27+**: Declarative animations — built-in gestures, GPU-accelerated transforms, ~32KB gzipped
- **dnd-kit**: Drag-and-drop — modular 10KB core, accessible by default, touch/keyboard support
- **Vitest 4.0+**: Testing — Jest-compatible API but 10x faster with native Vite integration
- **Storybook 10.2+**: Component development — isolated environment with Vite integration

**Critical version notes:**
- React peer dependency: `^18.0 || ^19.0` (support both major versions)
- Avoid Create React App (deprecated), Webpack (complex), Jest (slow), react-beautiful-dnd (unmaintained)
- Use CSS Modules over runtime CSS-in-JS to avoid bundle weight and RSC compatibility issues

### Expected Features

Component libraries in this domain require complete card rendering (all 52 cards plus backs), basic interactivity (flip animations, click handlers), and responsive sizing. Users expect TypeScript types as table stakes. Differentiators come from drag-and-drop, layout presets (fan/spread/stack), and state management integration.

**Must have (table stakes):**
- Render all 52 cards with suit/rank display — basic deck coverage expected
- Card back rendering with face up/down state — fundamental game mechanic
- Card flip animation — expected UX polish (CSS 3D transform)
- Click/tap handlers and TypeScript types — modern web requirement
- Responsive sizing and basic container — foundation for all use cases

**Should have (competitive):**
- Drag-and-drop with gesture support — major differentiator, no competitor offers it
- Layout presets (fan, spread, stack) — ready-to-use hand arrangements
- Redux integration hooks — seamless state management for consumers using Redux
- WCAG accessibility (keyboard nav, ARIA, screen reader) — legal/ethical requirement, should be v1.1
- Zone management components (Deck, Pile, PlayArea) — logical groupings for multi-zone games
- CSS variable theming — easy customization without CSS-in-JS overhead

**Defer (v2+):**
- Deal/shuffle animations — complex choreography, nice polish but not essential
- Custom card faces — extending beyond standard deck (Uno, custom games)
- Touch gestures (swipe, long-press) — mobile-specific enhancements
- Game logic/rules, server communication, player management — explicitly anti-features (too coupled, limits reusability)

### Architecture Approach

Use a layered architecture with Provider + Context composition wrapping dnd-kit's DndContext, Motion's animation context, and theme context. Components should be both standalone (pre-built UI) and headless (hooks-only). Export slices/selectors for Redux users but use internal context by default to avoid forcing Redux on all consumers.

**Major components:**
1. **CardLibraryProvider** — Root provider composing DnD, Animation, Theme contexts; simplifies consumer setup
2. **Card / CardFace** — Base card component with flip animation, drag support, compound component pattern for customization
3. **Deck / Hand / CardStack** — Container components using layout utilities (fan, spread, stack calculations)
4. **Hooks (useDraggableCard, useDroppableZone, useCardFlip)** — Headless patterns for custom implementations
5. **Redux layer (cardsSlice, selectors)** — Optional integration as separate export (`import from 'lib/redux'`)

**Build order:** Types/Utils → Provider/Hooks → Card → Containers → Redux (last, optional layer). This dependency order prevents circular dependencies and ensures core works without Redux. Use feature-based folder structure with co-located types and tests.

**Package structure:** Single package with tree-shakeable exports. Set `sideEffects: false`, build with ESM format, use package.json `exports` field for main entry and `./redux` subpath. Make Redux Toolkit/react-redux optional peer dependencies via `peerDependenciesMeta`.

### Critical Pitfalls

1. **Animation state causing unnecessary re-renders** — Storing animation state in React state triggers 60+ re-renders per second. Use Motion Values or refs instead. Warning signs: laggy drag, high CPU during animations. Address in Foundation phase by establishing animation patterns.

2. **Redux store coupling** — Shipping Redux-connected components forces consumers to adopt library's store structure. Provide non-connected components with optional Redux bindings as separate package. Address in Architecture phase by defining state boundaries.

3. **Non-tree-shakeable bundle** — Building with CommonJS or missing `sideEffects: false` causes consumers to import entire 140KB+ library. Build with ESM, test with bundle analyzer. Address in Build/Distribution phase but architecture must support it (avoid circular deps).

4. **CSS animations without GPU acceleration** — Animating `width`, `height`, `top`, `left` causes jank. Only animate `transform` and `opacity`. Address in Foundation phase by creating animation utilities that enforce GPU-accelerated properties.

5. **Accessibility as afterthought** — Missing keyboard nav, ARIA labels, focus management requires API-breaking refactoring later. Use semantic HTML, integrate eslint-plugin-jsx-a11y into CI, test with screen readers from start. Address in Foundation phase.

6. **Drag-and-drop performance with many elements** — All draggable components re-render on drag state change. Use React.memo, stable references, consider virtualization for 50+ cards. Address in Interactive Features phase with memoization hooks.

7. **Cross-platform emoji inconsistency** — Native emoji look completely different on Windows/Mac/iOS. Consider Twemoji or SVG symbols. Address in Visual/Rendering phase.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation & Core Components
**Rationale:** Types, animation patterns, and base components are prerequisites for everything else. Critical pitfalls (animation performance, accessibility) MUST be addressed here; retrofitting requires breaking changes.

**Delivers:**
- TypeScript types (Card, Suit, Rank) and constants (emoji suits)
- Utility functions (createDeck, shuffle, layout calculations)
- CardLibraryProvider with context composition
- Base Card and CardFace components with flip animation
- Animation utilities enforcing GPU-accelerated transforms (Motion Values, not state)
- Accessibility foundation (semantic HTML, eslint-plugin-jsx-a11y in CI)

**Addresses:**
- All "must have" features from FEATURES.md (render 52 cards, flip animation, click handlers, TypeScript types)
- CSS variable theming for customization

**Avoids:**
- Pitfall #1 (animation re-renders) by using Motion Values
- Pitfall #4 (non-GPU animations) by establishing transform-only patterns
- Pitfall #5 (accessibility afterthought) by integrating a11y from start

**Stack elements:** Vite library mode, TypeScript, Motion, React 18/19 peer dependency

**Research flag:** Standard patterns, well-documented. No deeper research needed.

### Phase 2: Container Components & Layouts
**Rationale:** Once base Card exists, build container components (Deck, Hand) that apply layout logic. This phase implements the architectural components identified in ARCHITECTURE.md.

**Delivers:**
- Hand component with fan/spread/stack layout presets
- Deck component (stack of cards with draw actions)
- CardStack component (visual stacking with peek)
- Layout utilities (fan rotation math, overlap calculations)
- Selection state management

**Addresses:**
- Layout presets (fan, spread, stack) from differentiators
- Zone management components (Deck, Pile)
- Basic card container

**Uses:**
- Card component from Phase 1
- Layout calculation utilities
- CSS Modules for component-scoped styles

**Implements:** Container components from ARCHITECTURE.md (Deck, Hand, CardStack)

**Research flag:** Standard patterns for layout math and container components. No deeper research needed.

### Phase 3: Drag-and-Drop Integration
**Rationale:** Drag-and-drop builds on existing Card and Container components. This is a major differentiator (no competitor offers it) but has performance pitfalls that must be addressed.

**Delivers:**
- dnd-kit integration with CardLibraryProvider
- useDraggableCard and useDroppableZone hooks
- DragOverlay component for drag previews
- DropZone component for droppable areas
- Performance optimizations (React.memo, stable references)

**Addresses:**
- Drag-and-drop from differentiators (competitive advantage)
- Zone components (droppable areas)

**Avoids:**
- Pitfall #6 (DnD performance) by implementing memoization and testing with 100+ cards
- HTML5 DnD limitations by using dnd-kit

**Uses:**
- dnd-kit core and sortable packages
- Card and Container components from previous phases

**Implements:** DragLayer, DropZone from ARCHITECTURE.md

**Research flag:** Needs testing/validation for performance at scale. Consider `/gsd:research-phase` for optimization strategies if performance issues surface.

### Phase 4: Redux Integration (Optional Layer)
**Rationale:** Redux integration is a project requirement, but making it optional avoids forcing Redux on all consumers. This addresses Pitfall #2 (Redux coupling).

**Delivers:**
- cardsSlice with normalized state (byId, allIds, locations)
- cardSelectors (memoized selectors using Reselect)
- useDeck and useHand hooks (Redux-aware versions)
- Card middleware for animation side effects
- Separate package.json export (`import from 'lib/redux'`)

**Addresses:**
- Redux integration hooks from differentiators
- State management for complex games

**Avoids:**
- Pitfall #2 (Redux coupling) by making Redux layer separate/optional
- Pitfall #6 (storing animation state in Redux) by documenting not to dispatch animation frame data

**Uses:**
- Redux Toolkit 2.11+ with TypeScript
- Components from previous phases (non-connected)

**Implements:** Redux slice pattern from ARCHITECTURE.md

**Research flag:** Standard RTK patterns. No deeper research needed.

### Phase 5: Build & Distribution
**Rationale:** Final phase ensures library is properly packaged, tree-shakeable, and consumable by various bundlers. Addresses Pitfall #3.

**Delivers:**
- Vite library mode configuration (ESM + CJS outputs)
- vite-plugin-dts for TypeScript declarations
- package.json with proper `exports` field and `sideEffects: false`
- Changesets for versioning
- Bundle size testing with publint/webpack-bundle-analyzer
- Storybook build for documentation

**Addresses:**
- Tree-shakeable exports from differentiators
- Dual ESM/CJS distribution

**Avoids:**
- Pitfall #3 (non-tree-shakeable bundle) by testing partial imports
- Integration gotchas by testing with multiple bundlers (Vite, webpack, Rollup)

**Uses:**
- Vite build, changesets, publint
- Storybook for visual documentation

**Research flag:** Standard library build patterns. Configuration templates in STACK.md. No deeper research needed.

### Phase 6: Enhanced Accessibility & Polish (v1.1)
**Rationale:** Accessibility foundation was established in Phase 1, but full WCAG compliance requires comprehensive testing and refinements. This should be prioritized for v1.1.

**Delivers:**
- Keyboard navigation (Tab, Enter, Space, Arrow keys for card movement)
- Complete ARIA labels with context
- Screen reader announcements for card actions
- Focus management (trap in modals, return focus on close)
- `prefers-reduced-motion` support
- Touch target size verification (minimum 44x44px)

**Addresses:**
- WCAG accessibility from differentiators (should-have for v1.1)

**Uses:**
- eslint-plugin-jsx-a11y rules
- Screen reader testing (VoiceOver, NVDA)
- React Aria patterns for reference

**Research flag:** May need `/gsd:research-phase` for complex accessibility patterns (keyboard-driven drag-and-drop, screen reader announcements).

### Phase Ordering Rationale

- **Foundation first** because types, animation patterns, and base components are prerequisites for everything else. Critical performance and accessibility patterns must be established early; retrofitting breaks APIs.

- **Containers before DnD** because drag-and-drop needs existing Card and Container components to drag between. Layout logic is simpler and de-risks before tackling complex interactions.

- **Redux last** because core library must work standalone. Making Redux optional requires building non-connected components first, then wrapping them.

- **Build/Distribution separate** because it's infrastructure, not features. Can be set up early but requires completed components to validate tree-shaking.

- **Accessibility enhancement after core** because foundation was established in Phase 1, but comprehensive WCAG compliance needs dedicated focus once core features prove viable.

**Dependency chain:** Types → Card → Containers → DnD (uses Containers) → Redux (wraps all components)

**Pitfall avoidance:** Phases 1 and 3 directly address the highest-impact pitfalls (animation performance, Redux coupling, accessibility). Phase 5 ensures distribution quality.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Drag-and-Drop):** Performance optimization strategies if testing reveals issues with 100+ cards. dnd-kit is well-documented, but scale testing may reveal edge cases.
- **Phase 6 (Enhanced Accessibility):** Keyboard-driven drag-and-drop patterns and screen reader announcements for card games are niche. May need research into React Aria or custom ARIA patterns.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Types, base components, Motion animations — well-documented patterns
- **Phase 2 (Containers):** Layout math, container components — standard React patterns
- **Phase 4 (Redux):** RTK slice patterns, normalized state — Redux Toolkit documentation is comprehensive
- **Phase 5 (Build):** Library build configuration — templates provided in STACK.md

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Vite, TypeScript, Motion, dnd-kit are industry-standard with official docs. Version compatibility matrix verified against npm registry. React 19 compatibility confirmed across stack. |
| Features | MEDIUM | Competitor analysis shows clear gaps (animations, DnD, state management). MVP definition is solid, but feature prioritization based on inference from general component library practices. |
| Architecture | HIGH | Layered approach (hooks + components, optional Redux) aligns with React ecosystem best practices. Compound components, context composition, and build order are proven patterns. |
| Pitfalls | HIGH | Seven critical pitfalls identified from official docs (Kent C. Dodds, Redux.js), established sources (Smashing Magazine GPU animations), and verified GitHub issues (dnd-kit performance). |

**Overall confidence:** HIGH

Research is comprehensive with strong primary sources. Stack recommendations are backed by official documentation. Architecture patterns are industry-standard. Pitfalls are verified with authoritative sources and include concrete prevention strategies.

### Gaps to Address

- **Emoji rendering strategy:** Undecided between native emoji (cross-platform inconsistency), Twemoji (bundle size increase), or SVG symbols. Recommend making this configurable via `renderSymbol` prop and documenting the trade-offs. Address during Phase 1 visual implementation.

- **Virtualization threshold:** Research identifies virtualization as necessary for 50+ cards, but exact implementation strategy (react-window vs react-virtual vs custom) needs validation during Phase 3 performance testing. Defer until performance issues surface.

- **Server-Side Rendering (SSR):** Not explicitly researched. Next.js compatibility should be validated during Phase 5 build setup. Ensure no `window`/`document` access at module scope and test with Next.js app.

- **Animation choreography patterns:** Deal/shuffle animations (deferred to v2+) will need deeper research into Motion's stagger/sequence APIs. Not blocking for v1.0.

- **Multi-deck support:** Research assumes single 52-card deck. Support for multiple decks (common in games like Blackjack) may require architecture adjustments. Validate with early adopters during Phase 2.

## Sources

### Primary (HIGH confidence)
- **Official Documentation:** Vite 7.3 library mode, Vitest 4.0 guide, dnd-kit docs, Motion (Framer Motion) docs, Redux Toolkit, Storybook 10.2 installation, ESLint v9 flat config
- **Package Registries:** npm for Motion 12.27, @dnd-kit/core 6.3, changesets 2.29, RTK 2.11 — verified versions and peer dependencies
- **Authoritative Sources:** Kent C. Dodds (animation performance, React context), React Spectrum/Adobe (accessibility patterns), Redux.js troubleshooting guide

### Secondary (MEDIUM confidence)
- **Community Tutorials:** Builder.io React component libraries 2026, Nucamp state management patterns, Carl Rippon tree-shaking guide, Sentry React performance guide
- **Competitor Analysis:** @heruka_urgyen/react-playing-cards, wmaillard/react-playing-cards, ink-playing-cards, listingslab/react-playing-cards — feature comparison
- **Best Practices:** Smashing Magazine GPU animation guide, Slack Engineering emoji picker rebuild, LogRocket debugging React performance

### Tertiary (LOW confidence)
- **GitHub Issues:** dnd-kit #389 (rerenders), react-dnd #421 (1000+ drop targets), react-spectrum #5630 (a11y) — specific edge cases needing validation
- **Blog Posts:** Building React component libraries with Vite (victorlillo.dev), Vitest vs Jest 2025 comparison (Medium), drag-and-drop libraries comparison (dev.to)

---
*Research completed: 2026-02-02*
*Ready for roadmap: yes*
