# Roadmap: Decentralized Card Games Component Library

## Overview

This roadmap delivers a lean React component library for rendering and interacting with playing cards. The journey progresses from foundational card components with animations, through container components and layout presets, to drag-and-drop interactions, optional Redux state management, comprehensive accessibility, and finally build/distribution infrastructure. Each phase delivers a coherent, testable capability that builds on the previous.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Core Rendering** - Card components with flip animations and TypeScript types
- [x] **Phase 2: Container Components & Layouts** - Hand, Deck, Stack with layout presets
- [ ] **Phase 3: Drag & Drop** - dnd-kit integration with draggable cards and drop zones
- [ ] **Phase 4: State Management** - Optional Redux Toolkit integration layer
- [ ] **Phase 5: Accessibility** - WCAG compliance with keyboard navigation and screen readers
- [ ] **Phase 6: Developer Experience & Build** - Storybook, tree-shakeable build, distribution

## Phase Details

### Phase 1: Foundation & Core Rendering
**Goal**: Developers can render any of the 52 playing cards with flip animations
**Depends on**: Nothing (first phase)
**Requirements**: FNDN-01, FNDN-02, FNDN-03, FNDN-04, FNDN-05, FNDN-06, FNDN-07, ANIM-01, ANIM-02, ANIM-03, ANIM-04
**Success Criteria** (what must be TRUE):
  1. Developer can render any card from the 52-card deck by specifying suit and rank
  2. Cards display correct suit emoji and rank, or card back when face-down
  3. Cards flip smoothly with 3D CSS transform animation when toggled
  4. Click/tap on card triggers event handler with card identity
  5. Cards scale responsively within their container
**Plans**: 4 plans in 3 waves

Plans:
- [x] 01-01-PLAN.md - Project foundation and TypeScript types (Wave 1)
- [x] 01-02-PLAN.md - Animation hooks with motion values (Wave 2)
- [x] 01-03-PLAN.md - Card face and back presentation components (Wave 2)
- [x] 01-04-PLAN.md - Complete Card component integration with tests (Wave 3)

### Phase 2: Container Components & Layouts
**Goal**: Developers can display cards in hands, decks, and stacks with layout presets
**Depends on**: Phase 1
**Requirements**: CNTR-01, CNTR-02, CNTR-03, CNTR-04, LYOT-01, LYOT-02, LYOT-03, LYOT-04
**Success Criteria** (what must be TRUE):
  1. Hand component displays cards in fan, spread, or stack arrangement
  2. Deck component shows card stack with draw action that removes top card
  3. CardStack component displays overlapping cards with configurable offset
  4. Layout utilities calculate correct rotation and overlap for any card count
**Plans**: 4 plans in 3 waves

Plans:
- [x] 02-01-PLAN.md — Layout utilities, container types, constants, and useContainerSize hook (Wave 1)
- [x] 02-02-PLAN.md — Hand component with fan/spread/stack layouts (Wave 2)
- [x] 02-03-PLAN.md — Deck, CardStack, and DropZone components (Wave 2)
- [x] 02-04-PLAN.md — Barrel exports and integration verification (Wave 3)

### Phase 3: Drag & Drop
**Goal**: Developers can build card games where cards can be dragged between zones
**Depends on**: Phase 2
**Requirements**: DND-01, DND-02, DND-03, DND-04, DND-05, DND-06
**Success Criteria** (what must be TRUE):
  1. Cards can be picked up and dragged with mouse or touch
  2. Drop zones visually indicate when a card can be dropped
  3. Drag preview shows the card being dragged at cursor position
  4. Dragging 50+ cards simultaneously does not cause visible jank
  5. Touch gestures work on mobile devices (iOS Safari, Android Chrome)
**Plans**: TBD

Plans:
- [ ] 03-01: (TBD during plan-phase)

### Phase 4: State Management
**Goal**: Redux users can integrate card state with their application store
**Depends on**: Phase 3
**Requirements**: STATE-01, STATE-02, STATE-03, STATE-04, STATE-05
**Success Criteria** (what must be TRUE):
  1. Library works without Redux (internal context provides state)
  2. Redux users can import slice and selectors from separate entry point
  3. useDeck and useHand hooks provide convenient state access
  4. Card state is normalized (byId, allIds, locations) for efficient updates
**Plans**: TBD

Plans:
- [ ] 04-01: (TBD during plan-phase)

### Phase 5: Accessibility
**Goal**: Users with disabilities can fully interact with card components
**Depends on**: Phase 3
**Requirements**: A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-06, A11Y-07, A11Y-08
**Success Criteria** (what must be TRUE):
  1. All interactive elements are reachable via Tab key navigation
  2. Screen readers announce card identity and available actions
  3. Keyboard users can move cards between zones without mouse
  4. Animations respect prefers-reduced-motion system setting
  5. Touch targets meet minimum 44x44px size requirement
**Plans**: TBD

Plans:
- [ ] 05-01: (TBD during plan-phase)

### Phase 6: Developer Experience & Build
**Goal**: Library is published with documentation and tree-shakeable imports
**Depends on**: Phase 5
**Requirements**: DX-01, DX-02, DX-03, DX-04, DX-05, DX-06, BUILD-01, BUILD-02, BUILD-03, BUILD-04, BUILD-05, BUILD-06
**Success Criteria** (what must be TRUE):
  1. Storybook shows interactive examples of all components
  2. Importing single component does not bundle entire library
  3. TypeScript users get full type definitions and autocomplete
  4. Test suite passes with >80% coverage
  5. Library installs and works in fresh Vite/Next.js projects
**Plans**: TBD

Plans:
- [ ] 06-01: (TBD during plan-phase)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Core Rendering | 4/4 | Complete | 2026-02-03 |
| 2. Container Components & Layouts | 4/4 | Complete | 2026-02-03 |
| 3. Drag & Drop | 0/TBD | Not started | - |
| 4. State Management | 0/TBD | Not started | - |
| 5. Accessibility | 0/TBD | Not started | - |
| 6. Developer Experience & Build | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-02*
*Last updated: 2026-02-03*
