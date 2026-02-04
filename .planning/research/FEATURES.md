# Feature Research: Documentation Site & Game Demos

**Domain:** Component library documentation site with interactive game demonstrations
**Researched:** 2026-02-04
**Confidence:** HIGH (based on analysis of leading component library docs sites, Storybook official docs, and established game demo patterns)

## Context: What Already Exists

Before defining features, it is critical to understand what v1.0 already provides:

- **10 components**: Card, Hand, Deck, CardStack, DropZone, DraggableCard, DroppableZone, CardDragOverlay, CardDndProvider, StatefulCardDndProvider
- **35 Storybook stories** with autodocs, a11y testing, and interactive examples
- **State management**: GameProvider, gameReducer, context-based and Redux-compatible
- **Drag-and-drop**: Full dnd-kit integration with stateful provider
- **Accessibility**: ARIA labels, keyboard navigation, roving tab index, screen reader announcements
- **Build output**: ESM + UMD, TypeScript types, CSS variables theming

The v2.0 goal is NOT to rebuild documentation (Storybook already handles component-level docs). It is to create a **marketing + adoption layer** that sits in front of Storybook and proves the library works through playable games.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features developers assume a credible component library site has. Missing these = library looks abandoned or unprofessional.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Landing page with project identity** | Every serious library has a homepage; npm README links here | MEDIUM | Hero section, tagline, visual card showcase. Must establish "what is this" in 5 seconds |
| **Installation instructions** | First thing devs look for; copy-pasteable npm install | LOW | `npm install @decentralized-games/card-components` with framework-specific setup notes |
| **Quick start code example** | Developers evaluate by trying; need < 30-second path to first render | LOW | Minimal JSX showing a card rendering. Must be copy-pasteable |
| **Link to full Storybook docs** | Component-level API docs already exist; do not duplicate | LOW | Prominent "View All Components" button linking to deployed Storybook |
| **Feature overview / highlights** | Developers scan capabilities before deep-diving docs | LOW | Bullet list or card grid: DnD, animations, state management, accessibility, theming |
| **GitHub repository link** | Open source credibility signal; developers check stars, activity | LOW | Header/footer link to repo |
| **License visibility** | Legal requirement for adoption decisions | LOW | Footer or dedicated section. MIT license is expected |
| **Mobile-responsive layout** | Developers evaluate on multiple devices; looks broken on phone = red flag | MEDIUM | Responsive breakpoints. Games can degrade gracefully on mobile |
| **At least one working demo** | Proves the library actually works, not just renders in Storybook | HIGH | A single playable game is minimum. Multiple is better but one is the floor |

### Differentiators (Competitive Advantage)

Features that make this documentation site memorable and drive adoption. No competing card component library has these.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Three playable game demos (Memory, War, Solitaire)** | Proves the library handles real game scenarios, not just isolated component rendering. Each game showcases different capabilities | HIGH | See Game Demo Features section below for scoping details |
| **Live embedded game on landing page** | Immediate "wow factor" -- visitor can play without navigating away. shadcn/ui has interactive dashboard on homepage; we have a game | MEDIUM | Embed simplest game (Memory or War) directly in hero/feature section. Not an iframe -- actual React components |
| **"View source" toggle on demos** | Developers want to see HOW games use the library. Toggle between playing and reading the implementation | MEDIUM | Code panel alongside game. Similar to Storybook canvas/docs toggle but for full game implementations |
| **Component capability matrix** | At-a-glance view of what each component does. Table format: Component vs. capabilities (DnD, animation, state, a11y) | LOW | Static content, but highly valuable for evaluation |
| **Bundle size badge** | Size-conscious developers check this. Library is already optimized (60kB limit) -- show it | LOW | Display actual bundle sizes from size-limit. Automated via build |
| **Dark mode / theme toggle** | Shows theming system works in practice. CSS variables make this straightforward | MEDIUM | Demonstrates CSS variable theming as a feature of the library itself |
| **Animated card hero visual** | Cards fanning out, flipping, or stacking on landing page. Uses the actual library components | MEDIUM | Demonstrates animation capabilities immediately. Not a GIF -- live rendered cards |

### Anti-Features (Deliberately NOT Built)

Features that seem good but create scope creep, maintenance burden, or wrong focus.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| **Custom documentation framework (Docusaurus/Nextra)** | "We need proper docs" | Storybook already generates comprehensive component docs with autodocs. Building a parallel docs system creates duplication, maintenance divergence, and confusion about which is canonical | Use Storybook as the docs system. Landing page links to Storybook. Games are standalone React pages |
| **API reference on the site** | "Put all props/types on the landing page" | Already exists in Storybook autodocs. Duplicating means two sources of truth that will drift. Component docs should live with components | Link to Storybook autodocs. "View API" button per component goes to Storybook page |
| **User accounts / leaderboards** | "Track high scores" | Requires backend, database, auth. Massive scope for a demo. Games are showcases, not products | Store scores in localStorage only. No server. No accounts |
| **Multiplayer / networked play** | "War should be player vs. player online" | Requires WebSocket server, state sync, hosting. The library is about components, not networking | All games are single-player or player-vs-computer. Sufficient for showcase purposes |
| **Full production game logic** | "Solitaire should have undo, hints, auto-complete, multiple variants" | Games are DEMOS, not products. Undo/hint/auto-complete each add significant complexity without proving library capabilities | Build minimal viable rules. Enough to play a full game. No undo, no hints, no variant selection |
| **Blog / changelog on site** | "Keep users updated" | GitHub releases and CHANGELOG.md already serve this purpose. Blog requires ongoing content creation commitment | Link to GitHub releases. Changelog in README |
| **Search across docs** | "Full-text search" | Storybook has built-in search. Landing page is small enough to not need search | Storybook search handles component/API discovery |
| **Tutorials / step-by-step guides** | "Walk through building a game" | High maintenance cost. Becomes stale as APIs evolve. Better as blog posts or external content | Link to game demo source code with inline comments. "View Source" toggle is the tutorial |
| **Sound effects in demos** | "Games feel better with sound" | Bloats bundle, auto-play policies are complex, accessibility concerns. Not related to library capabilities | Silent games. Library is visual/interactive, not audio |
| **Mobile-first game controls** | "Touch drag on mobile" | DnD on mobile is complex (touch vs scroll conflict). Games are developer evaluation tools, not consumer products | Games work on desktop. Mobile gets a "best on desktop" note or simplified click-only controls |

---

## Game Demo Features (Detailed Scoping)

Each game serves a specific showcase purpose. Scope must be ruthlessly minimal -- enough to prove the library works, not enough to ship as a standalone game.

### Memory Game

**Showcase purpose:** Card flip animation, grid layout, state management, component reuse

**Must have (demo-grade):**
| Feature | Showcases | Complexity |
|---------|-----------|------------|
| Grid of face-down cards | Card component rendering, CardStack/layout | LOW |
| Click to flip | Card flip animation, onClick handler | LOW |
| Match detection (2 cards) | State management via GameProvider | LOW |
| Matched pairs stay face-up | Conditional rendering, card state | LOW |
| Win detection | Simple state check: all matched | LOW |
| Card count display | Basic game chrome | LOW |
| Reset / new game button | State reset via dispatch | LOW |

**Explicitly NOT building:**
- Difficulty levels (different grid sizes)
- Timer / scoring
- Move counter optimization
- Animated card dealing at start
- Card matching animations beyond flip

**Total complexity:** LOW-MEDIUM (simplest of the three games)

### War

**Showcase purpose:** Deck component, card comparison, CardStack for piles, deal animation

**Must have (demo-grade):**
| Feature | Showcases | Complexity |
|---------|-----------|------------|
| Two card piles (player + computer) | Deck component with count display | LOW |
| Click/button to reveal top cards | Card flip, deal from deck | LOW |
| Card rank comparison (higher wins) | Game logic (not library feature -- pure JS) | LOW |
| Winner takes cards, piles update | State management, Deck count | LOW |
| War scenario (tie handling) | Multiple cards face-down then reveal | MEDIUM |
| Game over when one side has all cards | Win condition check | LOW |
| Card count per player | UI chrome | LOW |

**Explicitly NOT building:**
- Animated card movement between piles
- Speed War variant
- Multiple tie resolution depth (cap at 1 war)
- Card history / replay

**Total complexity:** LOW-MEDIUM (War is inherently simple -- no player decisions)

### Solitaire (Klondike)

**Showcase purpose:** Drag-and-drop between zones, DroppableZone validation, complex multi-zone state, CardStack with peek

**Must have (demo-grade):**
| Feature | Showcases | Complexity |
|---------|-----------|------------|
| 7 tableau columns with cascading cards | CardStack with stacking/offset | MEDIUM |
| Face-down cards with top card face-up | Card face state management | LOW |
| 4 foundation piles (Ace to King by suit) | DroppableZone with validation rules | MEDIUM |
| Stock pile (click to draw) | Deck component with draw action | LOW |
| Waste pile (drawn cards) | CardStack or single card display | LOW |
| Drag cards between tableau columns | DraggableCard + DroppableZone + StatefulCardDndProvider | HIGH |
| Drag cards to foundation | Drop validation (correct suit, sequential rank) | MEDIUM |
| Auto-flip revealed cards in tableau | State management on card removal | LOW |
| Win detection (all cards in foundations) | State check | LOW |

**Explicitly NOT building:**
- Undo functionality
- Hint system
- Auto-complete (when winnable)
- Draw-3 mode (only draw-1)
- Scoring system
- Timer
- Vegas variant
- Multi-card drag from tableau (single card drag only for v2.0)

**Total complexity:** HIGH (most complex game due to multi-zone DnD with validation)

---

## Feature Dependencies

```
[Landing Page]
    |
    +-- requires --> [GitHub Pages deployment pipeline]
    |
    +-- requires --> [Built Storybook (already exists)]
    |
    +-- enhances --> [Embedded game demo on page]
    |                    |
    |                    +-- requires --> [At least Memory or War game complete]
    |
    +-- enhances --> [Theme toggle]
                         |
                         +-- requires --> [CSS variable theming (already exists)]

[Memory Game]
    |
    +-- requires --> [Card component (exists)]
    +-- requires --> [GameProvider / state management (exists)]
    +-- requires --> [Card flip animation (exists)]
    +-- standalone (no game depends on it)

[War Game]
    |
    +-- requires --> [Card component (exists)]
    +-- requires --> [Deck component (exists)]
    +-- requires --> [GameProvider / state management (exists)]
    +-- standalone (no game depends on it)

[Solitaire Game]
    |
    +-- requires --> [Card component (exists)]
    +-- requires --> [Deck component (exists)]
    +-- requires --> [CardStack component (exists)]
    +-- requires --> [DraggableCard (exists)]
    +-- requires --> [DroppableZone (exists)]
    +-- requires --> [StatefulCardDndProvider (exists)]
    +-- requires --> [GameProvider / state management (exists)]
    +-- most complex -- build last

[View Source Toggle]
    |
    +-- requires --> [At least one game complete]
    +-- requires --> [Source code extraction / embedding approach]

[GitHub Pages Deployment]
    |
    +-- requires --> [Vite build for landing page]
    +-- requires --> [Storybook build (already configured)]
    +-- requires --> [GitHub Actions workflow]
    +-- must handle --> [Base path configuration for repo subpath]
```

### Dependency Notes

- **All games depend on existing library components:** No new library features needed. Games consume the public API
- **Memory and War are independent:** Can be built in parallel or any order
- **Solitaire depends on DnD maturity:** Should be built last as it exercises the most complex interactions
- **Landing page can start before games:** Static content (hero, install, features) does not need games. Embed game later
- **GitHub Pages deployment blocks everything being visible:** Should be set up early as infrastructure

---

## MVP Definition

### v2.0 Launch Requirements

The minimum needed to ship a credible documentation site with game demos.

- [ ] **Landing page** -- Hero, tagline, install command, feature highlights, link to Storybook
- [ ] **Storybook deployed** -- Built and accessible via link from landing page
- [ ] **Memory game** -- Playable, demonstrates flip + state management
- [ ] **War game** -- Playable, demonstrates Deck + card comparison
- [ ] **Solitaire game** -- Playable, demonstrates DnD + multi-zone state
- [ ] **GitHub Pages deployment** -- Automated via GitHub Actions
- [ ] **Responsive landing page** -- Works on mobile (games can be desktop-only)

### Add After Launch (v2.x)

Features to add once the site is live and receiving traffic.

- [ ] **View source toggle** -- Trigger: developers asking "how did you build this?"
- [ ] **Dark mode toggle** -- Trigger: demonstrates theming capabilities
- [ ] **Animated card hero** -- Trigger: landing page feels static
- [ ] **Bundle size badges** -- Trigger: automated via CI, add when build pipeline is stable
- [ ] **Component capability matrix** -- Trigger: developers asking which component does what

### Defer Indefinitely

- [ ] Custom documentation framework -- Storybook is sufficient
- [ ] Blog / changelog -- GitHub releases is sufficient
- [ ] User accounts / leaderboards -- Not a product
- [ ] Multiplayer -- Not a library showcase need

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Landing page (hero, install, features) | HIGH | MEDIUM | **P1** |
| GitHub Pages deployment | HIGH | MEDIUM | **P1** |
| Storybook link from landing page | HIGH | LOW | **P1** |
| Memory game demo | HIGH | LOW-MEDIUM | **P1** |
| War game demo | HIGH | LOW-MEDIUM | **P1** |
| Solitaire game demo | HIGH | HIGH | **P1** |
| Responsive landing page | MEDIUM | MEDIUM | **P1** |
| GitHub repo link + license | HIGH | LOW | **P1** |
| View source toggle | MEDIUM | MEDIUM | **P2** |
| Dark mode toggle | MEDIUM | MEDIUM | **P2** |
| Animated card hero | MEDIUM | MEDIUM | **P2** |
| Bundle size badges | LOW | LOW | **P2** |
| Component capability matrix | MEDIUM | LOW | **P2** |
| Embedded game in landing page | MEDIUM | LOW | **P2** |

**Priority Key:**
- **P1:** Must have for v2.0 launch -- site is incomplete without these
- **P2:** Should have, add iteratively after launch
- **P3:** Nice to have, future consideration

---

## Competitor Feature Analysis

No direct competitor has a documentation site with playable game demos for a card component library. This is the differentiator.

| Feature | @heruka_urgyen/react-playing-cards | react-playing-cards (wmaillard) | ink-playing-cards | shadcn/ui (for site pattern) | Our Approach |
|---------|-----------------------------------|-------------------------------|-------------------|------------------------------|--------------|
| Documentation site | npm README only | GitHub README only | GitHub README + examples | Full docs site with interactive examples | **Landing page + Storybook + game demos** |
| Live demos | None | None | Terminal only | Interactive component playground | **Three playable card games** |
| Installation guide | npm install one-liner | Clone instructions | npm install | Framework-specific guides | **Copy-paste install + quick start** |
| Interactive examples | None | None | Code snippets | Live code playground | **Storybook stories (35 existing) + full games** |
| Source code visibility | Open source repo | Open source repo | Open source repo | "View Code" per component | **View Source toggle on game demos** |
| Theming showcase | None | None | None | Theme customizer | **Dark mode toggle using CSS variables** |

### Competitive Gaps We Fill

1. **No card library has a documentation site** -- They all rely on README files. Having a proper landing page with deployed Storybook is already unusual
2. **No card library has playable demos** -- Proving the library works in real game scenarios is unprecedented in this niche
3. **No card library shows DnD working** -- Solitaire demo proves drag-and-drop works for card games, which is the highest-value differentiator
4. **Interactive evaluation** -- Developers can play games before reading any docs, dramatically reducing evaluation friction

---

## Implementation Complexity Notes

### What Makes This Achievable

The landing page + games approach is achievable because:

1. **All game components already exist.** Memory, War, and Solitaire can be built using only the existing public API (Card, Deck, Hand, CardStack, DraggableCard, DroppableZone, GameProvider, StatefulCardDndProvider)
2. **Storybook is already configured.** Just needs `storybook build` in CI and deployment
3. **Vite is already configured.** Landing page and games can use the existing Vite setup
4. **Game logic is simple.** Memory matching, War comparison, and Klondike rules are well-documented algorithms with no ambiguity

### What Is Harder Than It Looks

1. **Solitaire DnD validation rules** -- Determining valid drops (tableau: alternating colors descending, foundation: same suit ascending) requires careful state management
2. **GitHub Pages base path** -- Vite needs `base: '/<repo-name>/'` for assets to load correctly on GitHub Pages subpaths
3. **Combining Storybook + custom pages** -- Need to decide: same deployment or separate subpaths (/storybook/ vs root)
4. **Solitaire tableau cascading layout** -- Overlapping face-down cards with only the bottom card visible, while maintaining DnD targets for each card

---

## Sources

### Component Library Documentation Patterns
- [shadcn/ui documentation site](https://ui.shadcn.com) -- Progressive disclosure pattern, framework-specific install, interactive demos on landing page (HIGH confidence)
- [Chakra UI documentation site](https://chakra-ui.com) -- Hero with tagline, component showcase, enterprise credibility section (HIGH confidence)
- [Storybook embed documentation](https://storybook.js.org/docs/sharing/embed) -- iframe embedding with viewMode and singleStory parameters (HIGH confidence)
- [Storybook publish documentation](https://storybook.js.org/docs/sharing/publish-storybook) -- Static build and deployment options (HIGH confidence)

### Deployment
- [Vite static deployment guide](https://vite.dev/guide/static-deploy) -- GitHub Pages configuration with base path (HIGH confidence)
- [Deploy Storybook to GitHub Pages Action](https://github.com/marketplace/actions/deploy-storybook-to-github-pages) -- Community GitHub Action for Storybook deployment (MEDIUM confidence)

### Game Implementation References
- [War card game rules](https://en.wikipedia.org/wiki/War_(card_game)) -- Complete rule reference for minimal implementation (HIGH confidence)
- [freeCodeCamp Memory Game tutorial](https://www.freecodecamp.org/news/how-to-build-a-memory-card-game-using-react/) -- React memory game patterns and accessibility (MEDIUM confidence)
- [React Solitaire implementation](https://github.com/gcedo/react-solitaire) -- Reference implementation for Klondike rules (MEDIUM confidence)

### Design Patterns
- [Page UI components](https://pageui.shipixen.com/) -- Landing page section patterns (hero, features, CTA) (MEDIUM confidence)

---
*Feature research for: Documentation Site & Game Demos (v2.0)*
*Researched: 2026-02-04*
