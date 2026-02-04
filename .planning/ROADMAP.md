# Roadmap: Decentralized Card Games Component Library

**Project:** Decentralized Card Games - Documentation Site & Game Demos
**Milestone:** v2.0 Distribution & Showcase
**Created:** 2026-02-04
**Depth:** Comprehensive
**Status:** Active

## Overview

Transform the v1.0 component library into a public-facing project with CI/CD automation, GitHub Pages documentation site, and three playable game demos (Memory, War, Solitaire). This milestone makes the library discoverable and demonstrates its capabilities through real-world implementations while establishing quality gates for future contributions.

## Phase Structure

### Phase 7: CI/CD Foundation & Deployment Infrastructure

**Goal:** Automated quality gates and deployment pipeline are operational before building content

**Dependencies:** None (foundational phase)

**Requirements:**
- CICD-01: Tests run on every push to develop/feature branches
- CICD-02: Linting runs on every push
- CICD-03: Library build verification on every push
- CICD-04: Storybook build in CI pipeline
- CICD-05: Game demos build in CI pipeline
- CICD-06: Composite site deployment to GitHub Pages
- CICD-07: npm caching for faster builds
- CICD-08: NODE_OPTIONS memory allocation
- REPO-01: Repository visibility changed to public
- REPO-02: Build status badge in README

**Success Criteria:**
1. Developer pushes to feature branch and sees CI pass/fail status within 5 minutes
2. Pull request to develop shows all checks (tests, lint, build) with pass/fail indicators
3. Merge to main triggers automatic deployment to GitHub Pages at https://{username}.github.io/decentralized-card-games/
4. GitHub Actions page shows successful deployment with green checkmarks
5. Repository is publicly visible and README displays live build status badge

---

### Phase 8: Landing Page & Storybook Integration

**Goal:** Public-facing documentation site with hero, installation guide, and component docs is live

**Dependencies:** Phase 7 (deployment infrastructure required)

**Requirements:**
- SITE-01: Hero section showcasing library capabilities
- SITE-02: Installation instructions with npm command
- SITE-03: Quick start code example
- SITE-04: Feature highlights section
- SITE-05: Navigation links to Storybook
- SITE-06: Navigation links to game demos
- SITE-07: Storybook deployed at /storybook/ subdirectory
- SITE-08: Games deployed at /games/ subdirectory
- SITE-09: .nojekyll file prevents Jekyll filtering
- SITE-10: All artifacts composed into site-dist/
- REPO-03: npm version badge
- REPO-04: Bundle size badge
- REPO-05: Link to live GitHub Pages site
- REPO-06: Link to Storybook documentation

**Success Criteria:**
1. User visits site root and sees project identity and "what is this" within 5 seconds
2. User can copy-paste npm install command from installation section
3. User can copy quick start code and render first Card component
4. User clicks "Documentation" link and lands on Storybook with all 35 stories
5. User clicks "Demos" link and sees navigation to three games
6. All CSS/JS assets load correctly (no 404s from base path mismatch)

---

### Phase 9: Memory Game Demo

**Goal:** First playable game demo proves library works for card flip gameplay

**Dependencies:** Phase 8 (site shell required for game navigation)

**Requirements:**
- MEM-01: Start new Memory game with shuffled pairs
- MEM-02: Flip cards by clicking
- MEM-03: Cards auto-flip back if no match
- MEM-04: Matched pairs remain face-up and disabled
- MEM-05: Win detection when all matched
- MEM-06: Move counter and elapsed time display
- MEM-07: Reset game functionality

**Success Criteria:**
1. User navigates to /games/#/memory and sees grid of face-down cards
2. User clicks two cards and sees flip animation with 3D transform
3. User matches two cards and they remain face-up
4. User mismatches two cards and they auto-flip back after 1 second delay
5. User matches all pairs and sees "You Won!" message with move count and time
6. User clicks "New Game" and grid reshuffles

---

### Phase 10: War Game Demo

**Goal:** Second game demo showcases deck management and automated gameplay

**Dependencies:** Phase 9 (game build pattern established)

**Requirements:**
- WAR-01: Start War game with split deck
- WAR-02: Automated card drawing and comparison
- WAR-03: Higher card wins round
- WAR-04: "War" tie scenario with face-down/face-up sequence
- WAR-05: Current card count display for both players
- WAR-06: Win detection when one player has all cards
- WAR-07: Pause/resume automated gameplay

**Success Criteria:**
1. User navigates to /games/#/war and sees two decks with 26 cards each
2. User clicks "Start" and cards automatically draw and compare each round
3. User sees higher-ranked card win the round and both cards move to winner's pile
4. User sees "War!" scenario when cards tie, followed by face-down then face-up resolution
5. User sees real-time card counts update (e.g., "Player: 28, Computer: 24")
6. User sees "You Win!" or "Computer Wins!" when one side reaches 52 cards
7. User clicks "Pause" and gameplay stops mid-round

---

### Phase 11: Solitaire Game Demo

**Goal:** Complex game demo proves library handles production-grade drag-and-drop scenarios

**Dependencies:** Phase 10 (simpler games validated)

**Requirements:**
- SOL-01: Klondike initial layout with 7 tableau columns
- SOL-02: Drag cards between tableau columns
- SOL-03: Drag cards to foundation piles (4 foundations by suit)
- SOL-04: Draw cards from stock to waste (draw 3 mode)
- SOL-05: Drag from waste to tableau/foundations
- SOL-06: Legal move validation (alternating colors, descending rank)
- SOL-07: Auto-reveal face-down cards when top card removed
- SOL-08: Win detection when all foundations complete
- SOL-09: Restart game with new shuffle

**Success Criteria:**
1. User navigates to /games/#/solitaire and sees 7 tableau columns with cascading cards
2. User drags King from tableau to empty column and drop is accepted
3. User drags Red 6 onto Black 7 and cards stack correctly
4. User attempts to drag Black 6 onto Black 7 and drop is rejected
5. User drags Ace to foundation pile and card moves
6. User clicks stock pile and 3 cards flip to waste pile
7. User completes all 4 foundations and sees "You Won!" message
8. User clicks "New Game" and layout reshuffles

---

### Phase 12: Repository Documentation & Community Preparation

**Goal:** Repository is ready for public contribution with clear guidelines and documentation

**Dependencies:** Phase 11 (all features complete)

**Requirements:**
- REPO-07: CONTRIBUTING.md file created
- REPO-08: Development setup instructions
- REPO-09: Testing guidelines
- REPO-10: Code style expectations

**Success Criteria:**
1. External contributor finds CONTRIBUTING.md in repository root
2. Contributor follows setup instructions and runs `npm install && npm test` successfully
3. Contributor reads testing guidelines and understands how to add tests
4. Contributor reads code style section and knows project uses ESLint + Prettier
5. Repository README displays all badges (build, npm, bundle size) with live links

---

## Progress Tracking

| Phase | Status | Plans | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 7 - CI/CD Foundation | Pending | 0 | 0 | ░░░░░░░░░░ 0% |
| 8 - Landing Page | Pending | 0 | 0 | ░░░░░░░░░░ 0% |
| 9 - Memory Game | Pending | 0 | 0 | ░░░░░░░░░░ 0% |
| 10 - War Game | Pending | 0 | 0 | ░░░░░░░░░░ 0% |
| 11 - Solitaire Game | Pending | 0 | 0 | ░░░░░░░░░░ 0% |
| 12 - Repository Docs | Pending | 0 | 0 | ░░░░░░░░░░ 0% |

**Overall:** 0/6 phases complete (0%)

---

## Requirements Coverage

**Total v2.0 requirements:** 51
**Mapped to phases:** 51
**Unmapped:** 0

### Coverage by Category

| Category | Requirements | Phase |
|----------|--------------|-------|
| CI/CD Pipeline | 8 | Phase 7 |
| GitHub Pages Site | 10 | Phase 8 |
| Memory Game | 7 | Phase 9 |
| War Game | 7 | Phase 10 |
| Solitaire Game | 9 | Phase 11 |
| Repository Docs | 10 | Phase 7, 8, 12 |

**Coverage: 100%** ✓

---

## Dependency Graph

```
Phase 7 (CI/CD Foundation)
    ↓
Phase 8 (Landing Page & Storybook)
    ↓
Phase 9 (Memory Game)
    ↓
Phase 10 (War Game)
    ↓
Phase 11 (Solitaire Game)
    ↓
Phase 12 (Repository Docs)
```

**Critical path:** Linear progression from infrastructure → content → demos → polish

---

*Roadmap created: 2026-02-04*
*Last updated: 2026-02-04*
