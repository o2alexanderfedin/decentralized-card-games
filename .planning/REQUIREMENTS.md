# Requirements: Decentralized Card Games Component Library

**Defined:** 2026-02-04
**Core Value:** Developers can drop in fully interactive card components without building card UI from scratch

## Milestone v2.0 Requirements

### CI/CD Pipeline

- [ ] **CICD-01**: GitHub Actions workflow runs tests on every push to develop/feature branches
- [ ] **CICD-02**: GitHub Actions workflow runs linting (TypeScript, ESLint) on every push
- [ ] **CICD-03**: GitHub Actions workflow builds library artifacts and verifies success
- [ ] **CICD-04**: GitHub Actions workflow builds Storybook static site
- [ ] **CICD-05**: GitHub Actions workflow builds all game demos
- [ ] **CICD-06**: GitHub Actions workflow deploys composite site to GitHub Pages on successful builds
- [ ] **CICD-07**: CI workflow includes proper caching for node_modules and build artifacts
- [ ] **CICD-08**: CI workflow sets NODE_OPTIONS for memory allocation to prevent OOM errors

### GitHub Pages Site

- [ ] **SITE-01**: Landing page with hero section showcasing library capabilities
- [ ] **SITE-02**: Landing page includes installation instructions (npm install command)
- [ ] **SITE-03**: Landing page includes quick start code example
- [ ] **SITE-04**: Landing page includes feature highlights section
- [ ] **SITE-05**: Landing page includes navigation links to Storybook documentation
- [ ] **SITE-06**: Landing page includes navigation links to game demos
- [ ] **SITE-07**: Storybook deployed to `/storybook/` subdirectory with correct base path
- [ ] **SITE-08**: Game demos deployed to `/games/` subdirectory with hash routing
- [ ] **SITE-09**: Site includes `.nojekyll` file to prevent Jekyll asset filtering
- [ ] **SITE-10**: All site artifacts composed into single `site-dist/` for deployment

### Memory Game Demo

- [ ] **MEM-01**: User can start a new Memory game with shuffled card pairs
- [ ] **MEM-02**: User can flip cards by clicking to reveal face
- [ ] **MEM-03**: Cards flip back automatically if no match after short delay
- [ ] **MEM-04**: Matched card pairs remain face-up and disabled
- [ ] **MEM-05**: Game detects win condition when all pairs are matched
- [ ] **MEM-06**: Game displays move counter and elapsed time
- [ ] **MEM-07**: User can reset game to play again

### War Game Demo

- [ ] **WAR-01**: User can start War game with deck split between two players
- [ ] **WAR-02**: Cards are automatically drawn and compared each round
- [ ] **WAR-03**: Higher card wins the round and both cards go to winner's pile
- [ ] **WAR-04**: "War" scenario handles ties (multiple cards played face-down, then face-up)
- [ ] **WAR-05**: Game displays current card counts for both players
- [ ] **WAR-06**: Game detects win condition when one player has all cards
- [ ] **WAR-07**: User can pause/resume automated gameplay

### Solitaire Game Demo

- [ ] **SOL-01**: User can start Klondike Solitaire with proper initial layout (7 tableau columns)
- [ ] **SOL-02**: User can drag cards between tableau columns following Klondike rules
- [ ] **SOL-03**: User can drag cards from tableau to foundation piles (4 foundations, sorted by suit)
- [ ] **SOL-04**: User can draw cards from stock to waste pile (draw 3 mode)
- [ ] **SOL-05**: User can drag cards from waste pile to tableau or foundations
- [ ] **SOL-06**: Game validates legal moves (alternating colors, descending rank for tableau)
- [ ] **SOL-07**: Game auto-reveals face-down tableau cards when top card is moved
- [ ] **SOL-08**: Game detects win condition when all foundations complete (King to Ace)
- [ ] **SOL-09**: User can restart game with new shuffle

### Repository & Documentation

- [ ] **REPO-01**: Repository visibility changed from private to public
- [ ] **REPO-02**: README includes build status badge linked to GitHub Actions
- [ ] **REPO-03**: README includes npm version badge
- [ ] **REPO-04**: README includes bundle size badge
- [ ] **REPO-05**: README includes link to live GitHub Pages site
- [ ] **REPO-06**: README includes link to Storybook documentation
- [ ] **REPO-07**: CONTRIBUTING.md file created with contribution guidelines
- [ ] **REPO-08**: CONTRIBUTING.md includes development setup instructions
- [ ] **REPO-09**: CONTRIBUTING.md includes testing guidelines
- [ ] **REPO-10**: CONTRIBUTING.md includes code style expectations

## Future Requirements

Deferred to later milestones.

### Enhanced Game Features

- **MEM-02**: Difficulty levels (4x4, 6x6, 8x8 grids)
- **MEM-03**: Leaderboard with best times
- **WAR-02**: Speed control slider for automated gameplay
- **SOL-02**: Draw 1 mode toggle
- **SOL-03**: Undo move functionality
- **SOL-04**: Hint system

### Site Polish

- **SITE-11**: Dark mode toggle for landing page
- **SITE-12**: Animated hero section with floating cards
- **SITE-13**: View source toggle for game demos
- **SITE-14**: Mobile-responsive game layouts

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multiplayer games | No server infrastructure, demos are single-player only |
| User accounts/authentication | Documentation site doesn't need user management |
| Custom domain (e.g., cardlib.dev) | GitHub Pages default domain sufficient for v2.0 |
| npm package publishing automation | Manual publishing provides control and verification |
| Game high scores persistence | No backend storage, in-memory only is sufficient for demos |
| Touch gestures for mobile | Desktop-first demos, mobile is secondary |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CICD-01 | Phase 7 | Pending |
| CICD-02 | Phase 7 | Pending |
| CICD-03 | Phase 7 | Pending |
| CICD-04 | Phase 7 | Pending |
| CICD-05 | Phase 7 | Pending |
| CICD-06 | Phase 7 | Pending |
| CICD-07 | Phase 7 | Pending |
| CICD-08 | Phase 7 | Pending |
| SITE-01 | Phase 8 | Pending |
| SITE-02 | Phase 8 | Pending |
| SITE-03 | Phase 8 | Pending |
| SITE-04 | Phase 8 | Pending |
| SITE-05 | Phase 8 | Pending |
| SITE-06 | Phase 8 | Pending |
| SITE-07 | Phase 8 | Pending |
| SITE-08 | Phase 8 | Pending |
| SITE-09 | Phase 8 | Pending |
| SITE-10 | Phase 8 | Pending |
| MEM-01 | Phase 9 | Pending |
| MEM-02 | Phase 9 | Pending |
| MEM-03 | Phase 9 | Pending |
| MEM-04 | Phase 9 | Pending |
| MEM-05 | Phase 9 | Pending |
| MEM-06 | Phase 9 | Pending |
| MEM-07 | Phase 9 | Pending |
| WAR-01 | Phase 10 | Pending |
| WAR-02 | Phase 10 | Pending |
| WAR-03 | Phase 10 | Pending |
| WAR-04 | Phase 10 | Pending |
| WAR-05 | Phase 10 | Pending |
| WAR-06 | Phase 10 | Pending |
| WAR-07 | Phase 10 | Pending |
| SOL-01 | Phase 11 | Pending |
| SOL-02 | Phase 11 | Pending |
| SOL-03 | Phase 11 | Pending |
| SOL-04 | Phase 11 | Pending |
| SOL-05 | Phase 11 | Pending |
| SOL-06 | Phase 11 | Pending |
| SOL-07 | Phase 11 | Pending |
| SOL-08 | Phase 11 | Pending |
| SOL-09 | Phase 11 | Pending |
| REPO-01 | Phase 7 | Pending |
| REPO-02 | Phase 7 | Pending |
| REPO-03 | Phase 8 | Pending |
| REPO-04 | Phase 8 | Pending |
| REPO-05 | Phase 8 | Pending |
| REPO-06 | Phase 8 | Pending |
| REPO-07 | Phase 12 | Pending |
| REPO-08 | Phase 12 | Pending |
| REPO-09 | Phase 12 | Pending |
| REPO-10 | Phase 12 | Pending |

**Coverage:**
- v2.0 requirements: 51 total
- Mapped to phases: 51/51
- Unmapped: 0 ✓

**Phase Distribution:**
- Phase 7 (CI/CD Foundation): 10 requirements
- Phase 8 (Landing Page): 10 requirements
- Phase 9 (Memory Game): 7 requirements
- Phase 10 (War Game): 7 requirements
- Phase 11 (Solitaire Game): 9 requirements
- Phase 12 (Repository Docs): 4 requirements

---
*Requirements defined: 2026-02-04*
*Last updated: 2026-02-04 after roadmap creation*
