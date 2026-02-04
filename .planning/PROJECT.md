# Decentralized Card Games - Component Library

## What This Is

A lean React component library for visualizing and interacting with standard playing cards. Provides reusable, interactive card components (drag, flip, animations) using Redux for state management and emoji-based icons instead of image assets.

## Core Value

Developers can drop in fully interactive card components without building card UI from scratch. The library handles all visualization and interaction patterns for standard playing cards.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Render standard 52-card deck (4 suits × 13 ranks)
- [ ] Card face and back visualization using emoji icons
- [ ] Card flip animations
- [ ] Drag and drop card interactions
- [ ] Redux state management for card state
- [ ] Data structures that support future card customization
- [ ] Component API for integrating cards into any React app

### Out of Scope

- **Game logic** — This library only handles card visualization, not game rules (Poker, Durak, etc.)
- **Multiplayer/networking** — No server communication or real-time features
- **Decentralization/blockchain** — Deferred to future platform work
- **Card builder UI** — Data model supports it, but builder interface not in v1
- **Image assets** — Using emojis only for icons and card suits

## Context

This library is the foundation for a future decentralized card games platform. The current focus is purely on the visualization and interaction layer - building robust, reusable components that work well before tackling game logic or decentralization.

Starting with standard playing cards (poker deck) as the baseline, with data structures designed to accommodate custom card types in the future.

## Constraints

- **Tech stack**: React + Redux — chosen for familiarity and state management needs
- **No image assets**: Emoji-based icons only — keeps the library lean and avoids asset management complexity
- **Standard deck first**: Focus on 52-card poker deck, but design data model to support extensions
- **Interactive by default**: Cards must support drag, flip, and animations out of the box

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + Redux | Familiar stack, Redux handles complex card state well | — Pending |
| Emoji icons over images | Avoid asset management, keep library lightweight | — Pending |
| Library-first approach | Build reusable foundation before implementing specific games | — Pending |
| Standard 52-card deck | Well-understood domain, validates component patterns before customization | — Pending |

---
*Last updated: 2026-02-02 after initialization*
