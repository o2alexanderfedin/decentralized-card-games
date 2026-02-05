# Project Research Summary

**Project:** Decentralized Card Games - Documentation Site & Game Demos (v2.0)
**Domain:** Component library documentation and marketing site with interactive game demonstrations
**Researched:** 2026-02-04
**Confidence:** HIGH

## Executive Summary

The v2.0 milestone transforms an existing React card component library (v1.0 shipped with 10 components, 35 Storybook stories) into a public-facing project by adding CI/CD automation, a GitHub Pages documentation site, and three playable game demos. Research reveals this is achievable without new frameworks or dependencies -- the existing Vite/React/TypeScript/Storybook stack handles everything. The key architectural decision is to build three separate artifacts (landing page, Storybook, game demos) and compose them into a unified site structure for GitHub Pages deployment.

The recommended approach treats game demos as lightweight showcases rather than production-grade applications. Memory, War, and Solitaire games each demonstrate different library capabilities (card flip animations, deck management, drag-and-drop) using only the existing component API. GitHub Actions provides CI/CD with zero additional tooling, and GitHub Pages hosts the combined site for free. The primary risks are deployment configuration pitfalls (base path mismatches, missing .nojekyll file, permission errors) and scope creep on game implementations -- both mitigated through strict configuration standards and hard scope constraints.

This research has HIGH confidence for stack and pitfalls (verified against official Vite, GitHub, and Storybook documentation), MEDIUM-HIGH confidence for architecture (validated deployment patterns but unique three-way composition), and HIGH confidence for features (clear differentiation between table stakes and anti-features based on competitor analysis).

## Key Findings

### Recommended Stack

No new npm dependencies are required for v2.0. The existing Vite 6.1, React 19, TypeScript 5.8, and Storybook 8.6 stack already supports all three build targets (landing page, game demos, Storybook documentation). GitHub Actions handles CI/CD through YAML workflow files, and GitHub Pages provides free hosting. The only additions are configuration files (separate Vite configs for site and games) and source files for the new applications.

**Core technologies:**
- GitHub Actions (v6 actions suite) — CI/CD automation, zero-cost for public repos, native GitHub integration eliminates external dependencies
- GitHub Pages (Actions-based deployment) — Free static hosting at subdirectory path, no Jekyll processing via .nojekyll file
- Vite 6.1 (existing) — Builds landing page and game demos as separate SPAs, multi-page app support via rollupOptions.input
- Storybook 8.6 (existing) — Component documentation already complete, requires only base path configuration via viteFinal for subdirectory deployment
- React 19 (existing) — Shared across all applications, games import library components directly from ../src/ during builds

**Critical versions:**
- actions/checkout@v6.0.2, actions/setup-node@v6.2.0 with npm caching
- actions/upload-pages-artifact@v4 + actions/deploy-pages@v4 (must match versions)
- Node 22.x in CI (Maintenance LTS compatible with Storybook 8.6)

### Expected Features

Documentation sites for component libraries require a three-tier feature set: table stakes (expected by all users), differentiators (competitive advantages), and deliberate anti-features (scope protection).

**Must have (table stakes):**
- Landing page with clear project identity and "what is this" clarity within 5 seconds
- Installation instructions (copy-paste npm install command)
- Quick start code example demonstrating first component render
- Link to full Storybook documentation (component-level API docs)
- Feature overview highlighting DnD, animations, state management, accessibility, theming
- GitHub repository link and MIT license visibility
- Mobile-responsive landing page layout
- At least one working game demo to prove the library works

**Should have (competitive differentiators):**
- Three playable game demos (Memory, War, Solitaire) proving real-world scenarios
- Live embedded game on landing page for immediate engagement
- View source toggle on demos showing implementation code
- Component capability matrix (at-a-glance feature comparison)
- Bundle size badges (library already optimized at 60kB limit)
- Dark mode toggle demonstrating CSS variable theming
- Animated card hero visual using actual library components

**Defer (anti-features - deliberately NOT built):**
- Custom documentation framework (Docusaurus/Nextra) — Storybook already provides comprehensive docs
- API reference duplication — Links to Storybook autodocs instead
- User accounts/leaderboards — Requires backend infrastructure, games are showcases not products
- Multiplayer networked play — Games are single-player or vs-computer only
- Full production game features (undo, hints, auto-complete, sound effects) — Minimal viable rules sufficient
- Mobile-first touch controls — Desktop-optimized, mobile gets simplified experience

### Architecture Approach

Use a composed directory deployment pattern where three independent Vite builds (landing page, game demos, Storybook) are assembled into a unified site structure for single GitHub Pages deployment. Each application builds separately with its own Vite config, then a CI script copies outputs into a composed site-dist/ directory. This avoids complex multi-page Vite configuration and keeps each concern isolated.

**Major components:**
1. **Landing Page (site/)** — Marketing page with hero, install guide, feature cards, links to Storybook and games. Built as Vite SPA with base path /decentralized-card-games/. Imports Card/Hand components from ../src/ for visual demonstrations.

2. **Game Demos (games/)** — Single Vite SPA with HashRouter containing Memory, War, and Solitaire games. Each game separates logic into custom hooks (useMemoryGame, useWarGame, useSolitaire) with presentational components. Built with base path /decentralized-card-games/games/. Games import all components from ../src/ (not from published package during development).

3. **Storybook Build** — Existing .storybook/ configuration with viteFinal modification to set base: /decentralized-card-games/storybook/ via environment variable. Built to storybook-static/ and copied into site-dist/storybook/.

4. **CI/CD Pipeline (.github/workflows/)** — Two workflows: ci.yml (tests/lint on all branches) and deploy-site.yml (build + compose + deploy on main only). Deployment workflow builds all three artifacts, composes them into site-dist/, adds .nojekyll file, and uploads to GitHub Pages.

**Key architectural patterns:**
- Direct source imports (games/site import from ../src/ not npm package)
- Game logic as custom hooks (useMemoryGame returns state and actions)
- Hash routing for games (avoids GitHub Pages SPA 404 issues)
- Separate Vite configs per build target (library vs. app mode)
- Environment variable-based base paths (local dev uses /, CI uses /<repo>/)

### Critical Pitfalls

Research identified 15 pitfalls across critical/moderate/minor severity. Top 5 that cause deployment failures:

1. **Missing .nojekyll file breaks Storybook** — GitHub Pages runs Jekyll by default which ignores underscore-prefixed files/directories. Storybook generates _storybook/ assets that return 404 without .nojekyll bypass. Must be added to site root before first deployment.

2. **Vite base path mismatch causes 404s for all assets** — GitHub Pages serves from /<repo>/ subpath but Vite defaults to /. All three builds (landing page, games, Storybook) must configure base paths correctly or every CSS/JS file returns 404. Set via vite.config.ts base property and Storybook viteFinal.

3. **GitHub Actions permission denied (403) on deployment** — Three overlapping issues: workflow permissions missing pages: write and id-token: write, repository settings have "Deploy from branch" instead of "GitHub Actions", or Actions permissions set to read-only. Must configure all three correctly.

4. **Storybook build out-of-memory in GitHub Actions** — Storybook + Vite build with 35+ stories exceeds default Node heap limit in CI (GitHub runners have 7GB but Node defaults to ~2GB heap). Set NODE_OPTIONS: '--max_old_space_size=4096' in workflow environment.

5. **CI workflow blocks on git-flow branch strategy** — Most tutorials use on: push: branches: [main] but project uses git-flow where development happens on feature/* and develop branches. CI must trigger on [main, develop, 'feature/**', 'release/**', 'hotfix/**'] or developer gets no CI feedback until merge.

## Implications for Roadmap

Based on research, v2.0 should be structured as a linear progression from infrastructure to content, with clear separation between CI foundation, static content, and interactive demos.

### Phase 1: CI/CD Foundation & GitHub Pages Infrastructure
**Rationale:** All subsequent work depends on working deployment pipeline. Establish CI early to catch issues immediately rather than debugging deployment at the end. Landing page and games are useless if they can't be deployed.

**Delivers:**
- GitHub Actions workflows (ci.yml for tests/lint, deploy-site.yml for deployment)
- GitHub Pages configuration and permissions
- Base path configuration strategy (environment variables)
- npm dependency caching in CI
- Concurrency controls to prevent deployment races

**Addresses:**
- Critical pitfall #3 (permission denied) — configure repo settings and workflow permissions
- Critical pitfall #5 (git-flow branch triggers) — align workflow triggers with branching model
- Moderate pitfall #6 (no npm caching) — add actions/setup-node cache: 'npm'
- Moderate pitfall #10 (no concurrency controls) — prevent deployment conflicts

**Avoids:** Building features that can't be deployed, debugging deployment issues after everything is built

### Phase 2: Landing Page & Storybook Integration
**Rationale:** Landing page is simpler than game demos (no routing, no game logic) and establishes the Vite app build pattern. Storybook already exists and just needs deployment configuration. Combined, these create the site shell that games will plug into.

**Delivers:**
- site/ directory with Vite config, React entry point, App component
- Hero section with project identity and animated card visual
- Installation guide with npm install command and quick start code
- Feature overview cards highlighting library capabilities
- Links to Storybook documentation (deployed at /storybook/ subpath)
- Storybook viteFinal configuration for base path
- Footer with GitHub link and license

**Uses:**
- Vite 6.1 (existing) for landing page build
- Storybook 8.6 (existing) with minor viteFinal modification
- React 19 (existing) for landing page components

**Implements:**
- Landing Page component (architecture)
- Storybook Build component (architecture)
- Composed directory structure foundation

**Addresses:**
- Table stakes features: landing page, install guide, Storybook link, GitHub link
- Critical pitfall #1 (missing .nojekyll) — add to site composition script
- Critical pitfall #2 (base path mismatch) — configure for both landing page and Storybook
- Moderate pitfall #7 (wrong Vite config) — create separate site/vite.config.ts

**Avoids:** Building games before the site shell exists, duplicating API docs outside Storybook

### Phase 3: Memory Game Demo
**Rationale:** Simplest game (card flip only, no DnD). Validates the game demo build pattern, direct source imports from ../src/, and game-specific custom hooks. Success here establishes the pattern for War and Solitaire.

**Delivers:**
- games/ directory with Vite config and React entry point
- games/shared/ components (GameLayout, ScoreBoard, GameControls)
- games/memory/ with MemoryGame component and useMemoryGame hook
- Grid of face-down cards with flip-to-match gameplay
- Win detection and reset functionality
- Integration into combined site at /games/#/memory

**Uses:**
- Card component (flip animation)
- GameProvider (state management)
- Vite multi-page app pattern

**Implements:**
- Game Demos component (architecture)
- Direct source import pattern (architecture)
- Game logic as custom hooks pattern (architecture)

**Addresses:**
- Competitive differentiator: first playable game demo
- Moderate pitfall #8 (game scope creep) — hard limit to flip-pairs-match only, no difficulty levels or timers
- Moderate pitfall #11 (game imports from source) — establish ../src/ import pattern

**Avoids:** Over-engineering first game, adding game-specific dependencies

### Phase 4: War Game Demo
**Rationale:** Medium complexity game demonstrating Deck component and state management beyond Memory's simple grid. No player decisions required (fully automated comparison) keeps scope minimal. Validates library's deck/hand management capabilities.

**Delivers:**
- games/war/ with WarGame component and useWarGame hook
- Two card piles (player vs. computer) with Deck component
- Automated card comparison and pile updates
- War scenario handling (tie resolution with face-down cards)
- Game over detection when one side has all cards

**Uses:**
- Card component (flip for reveal)
- Deck component (pile management with count display)
- GameProvider (more complex state than Memory)

**Addresses:**
- Competitive differentiator: second game demo showcasing different capabilities
- Feature research note: War is inherently simple, no player choices

**Avoids:** Animated card movement between piles, complex War variant rules

### Phase 5: Solitaire Game Demo
**Rationale:** Most complex game exercising full library capabilities including drag-and-drop, multi-zone state, and validation rules. Built last to avoid blocking simpler games if DnD proves complex. Success here proves the library handles production-grade game scenarios.

**Delivers:**
- games/solitaire/ with SolitaireGame, useSolitaire, and zone components
- 7 tableau columns with cascading cards (CardStack with stacking)
- 4 foundation piles (Ace to King by suit with DroppableZone validation)
- Stock and waste piles (draw-1 only, no draw-3 variant)
- Drag cards between tableau columns and to foundations
- Auto-flip revealed cards in tableau
- Win detection (all cards in foundations)

**Uses:**
- Card, CardStack, Deck components
- DraggableCard, DroppableZone, CardDndProvider (full DnD integration)
- GameProvider (most complex state: 12+ locations)

**Implements:**
- Complete demonstration of all library components working together

**Addresses:**
- Competitive differentiator: drag-and-drop proof in real game scenario (no competing library has this)
- Architecture note: Solitaire is most complex, demonstrates all library capabilities
- Moderate pitfall #8 (scope creep) — explicitly NO undo, NO hints, NO auto-complete, single-card drag only

**Avoids:** Production Solitaire features that don't showcase library capabilities

### Phase 6: Polish & Post-Launch Enhancements
**Rationale:** Core v2.0 deliverable is complete after Phase 5 (CI + landing + three games). This phase adds nice-to-have features based on actual usage patterns and feedback.

**Delivers:**
- View source toggle on game demos (shows implementation code alongside gameplay)
- Dark mode toggle on landing page (demonstrates CSS variable theming)
- Animated card hero on landing page (fan/flip animation using library)
- Bundle size badges (automated from size-limit in CI)
- Component capability matrix (static content, high evaluation value)
- Embedded game on landing page (Memory or War in hero section)

**Addresses:**
- Differentiator features marked "should have" in research
- UX pitfall: landing page with no visible demo

**Avoids:** Treating these as blockers for v2.0 launch

### Phase Ordering Rationale

- **CI first:** Quality gates and deployment infrastructure before any content. Failing to deploy after building everything is demoralizing and wastes time.
- **Landing page before games:** Simpler application establishes Vite build pattern. Games need a navigation context to live within.
- **Memory → War → Solitaire:** Progressive complexity validates library capabilities incrementally. Memory uses only Card flip. War adds Deck and state management. Solitaire adds full DnD. Each success de-risks the next.
- **Storybook early:** Component docs already exist, just needs deployment config. Provides immediate value to the landing page.
- **Polish last:** Core functionality (CI + site + games) must work before adding view-source toggles and dark mode.

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 5 (Solitaire):** Complex drag-and-drop validation rules and multi-zone state management. May need research into Klondike rule edge cases and dnd-kit collision detection for stacked cards. Storybook stories already cover basic DnD but not cascading droppable zones.

- **Phase 1 (CI/CD):** GitHub Actions-based Pages deployment is well-documented but the specific three-way composition (landing + Storybook + games) may surface edge cases. Recommend test deployment with minimal "hello world" site before building full content.

Phases with standard patterns (skip research-phase):

- **Phase 2 (Landing Page):** Standard Vite React SPA. No novel patterns.
- **Phase 3 (Memory Game):** Card flip and match detection are well-understood patterns. Multiple React memory game tutorials exist.
- **Phase 4 (War Game):** Card game rules are trivial. State management already proven in library tests.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified from official GitHub release pages and npm registry. No new dependencies reduces uncertainty. Existing Vite/React/Storybook setup is proven. |
| Features | HIGH | Table stakes derived from shadcn/ui and Chakra UI documentation patterns. Competitor analysis shows no existing card library has game demos (clear differentiation). Anti-features identified from scope creep patterns in similar projects. |
| Architecture | MEDIUM-HIGH | Composed directory deployment pattern validated across multiple sources (Vite docs, Storybook subdirectory discussions, multi-app monorepo articles). Specific three-way composition (landing + Storybook + games) is less common but logical extension. Hash routing for GitHub Pages is standard. |
| Pitfalls | HIGH | Critical pitfalls verified from official GitHub/Vite/Storybook documentation and multiple community reports. .nojekyll, base path, and permissions issues have dozens of GitHub discussions confirming them. Memory limits confirmed in Storybook builder-vite issues. |

**Overall confidence:** HIGH

### Gaps to Address

Research was comprehensive but three areas need validation during implementation:

- **Storybook viteFinal base path edge cases:** Multiple GitHub discussions (storybookjs/storybook#17433, #25858) report that Storybook 8.x has inconsistent behavior with base paths in some scenarios. The recommended viteFinal approach works per official docs but may need testing with actual build. Fallback: use environment variable to conditionally set base only in CI, not locally.

- **Game demo bundle sizes:** Research assumes games tree-shake the library correctly during Vite build. This should be verified early in Phase 3 (Memory game) by checking the built games/dist/ output size. If a simple game bundles the entire library (>200KB), may need to review imports and ensure they are named imports from specific paths, not wildcard imports.

- **HashRouter vs. subdirectory routing:** Games use HashRouter (/#/memory, /#/war, /#/solitaire) which is standard for GitHub Pages SPAs. However, the architecture also suggests separate index.html per game in the directory structure. These two approaches are contradictory. Resolution: Choose HashRouter (single games/index.html with routes) for v2.0. Defer multi-HTML approach to future if needed.

## Sources

### Primary (HIGH confidence)

**Official Documentation:**
- Vite Static Deploy Guide (vite.dev/guide/static-deploy) — GitHub Pages workflow, base path config, multi-page apps
- GitHub Actions Documentation (docs.github.com/actions) — Workflow syntax, caching, permissions, concurrency
- GitHub Pages Documentation (docs.github.com/pages) — Publishing sources (Actions vs. branch), Jekyll bypass
- Storybook viteFinal API (storybook.js.org/docs/8.6/api/main-config-vite-final) — Base path override for subdirectory deployment
- GitHub Actions Marketplace — Verified versions for checkout@v6.0.2, setup-node@v6.2.0, upload-pages-artifact@v4.0.0, deploy-pages@v4.0.5

**Release Pages (verified 2026-02-04):**
- actions/checkout releases — v6.0.2 (Jan 2025)
- actions/setup-node releases — v6.2.0 (Jan 2025)
- actions/upload-pages-artifact releases — v4.0.0 (Aug 2025)
- actions/deploy-pages releases — v4.0.5 (Mar 2025)
- Node.js releases — Node 22 Maintenance LTS (until Apr 2027)

### Secondary (MEDIUM confidence)

**Community Resources:**
- Storybook GitHub Discussions #17433, #25858 — Subdirectory deployment viteFinal base path approach
- GitHub Community Discussions #171242, #60392 — Pages deployment permission errors
- Storybook builder-vite Issues #282, #409 — Out-of-memory solutions (NODE_OPTIONS)
- Medium article: Deploying Multiple Vite Apps to GitHub Pages — Multi-app single-repo pattern
- This Dot blog: Deploying from monorepo to GitHub Pages — Composed directory deployment
- Bitovi blog: Deploy Storybook to GitHub Pages — Alternative community action (not used but validates approach)

**Game Implementation:**
- Wikipedia: War card game rules — Complete rule reference
- freeCodeCamp: Memory game tutorial — React patterns and accessibility
- GitHub: gcedo/react-solitaire — Klondike reference implementation

**Design Patterns:**
- shadcn/ui documentation site — Progressive disclosure, framework-specific install, interactive demos
- Chakra UI documentation site — Hero with tagline, component showcase

### Tertiary (LOW confidence)

- GitHub Pages SPA routing workarounds (github.com/rafgraph/spa-github-pages) — 404.html redirect pattern (not recommended, using HashRouter instead)
- Smashing Magazine: S(GH)PA article — Older but still relevant SPA hack for GitHub Pages
- Evil Martians: Super GitHub Pages — Multi-app deployment pattern (confirms architecture direction)

---
*Research completed: 2026-02-04*
*Ready for roadmap: yes*
