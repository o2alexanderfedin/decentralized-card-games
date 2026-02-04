# Architecture Research: v2.0 Documentation Site & Game Demos

**Domain:** GitHub Pages documentation site with Storybook integration and game demos for a React component library
**Researched:** 2026-02-04
**Confidence:** HIGH

## System Overview

```
+-----------------------------------------------------------------------+
|                    GitHub Pages Site                                    |
|                https://<user>.github.io/<repo>/                        |
+-----------------------------------------------------------------------+
|                                                                        |
|  /                        /storybook/             /games/              |
|  +-------------------+    +------------------+    +------------------+ |
|  | Landing Page      |    | Storybook        |    | Game Demos       | |
|  | (Vite SPA)        |    | (storybook-static|    | (Vite SPA)       | |
|  |                   |    |  built separately)|    |                  | |
|  | - Hero            |    |                  |    | /games/memory/   | |
|  | - Install guide   |    | - Component docs |    | /games/war/      | |
|  | - Feature cards   |    | - Interactive    |    | /games/solitaire/| |
|  | - Links to        |    |   playground     |    |                  | |
|  |   Storybook +     |    | - A11y tests     |    | Each game is a   | |
|  |   game demos      |    |                  |    | route in the     | |
|  +-------------------+    +------------------+    | games SPA        | |
|                                                    +------------------+ |
|                                                                        |
+-----------------------------------------------------------------------+
|                                                                        |
|  All three sections consume the SAME library from src/ via             |
|  direct source imports (NOT npm package) during build                  |
|                                                                        |
+-----------------------------------------------------------------------+
|                                                                        |
|  @decentralized-games/card-components (src/)                           |
|  +------------------+  +------------------+  +------------------+      |
|  | Components       |  | Hooks            |  | State Management |      |
|  | Card, Deck, Hand |  | useCardFlip      |  | gameReducer      |      |
|  | DraggableCard    |  | useDragSensors   |  | GameProvider     |      |
|  | DropZone, etc.   |  | useGameActions   |  | Redux (optional) |      |
|  +------------------+  +------------------+  +------------------+      |
+-----------------------------------------------------------------------+
```

## Recommended Architecture: Unified Build with Subdirectory Composition

### Strategy: Single `dist/site/` Output Assembled from Three Builds

**Recommendation:** Build three artifacts separately, then compose them into a single directory structure for GitHub Pages deployment. This avoids complex multi-page Vite configuration and keeps each concern independent.

**Why this approach over alternatives:**

| Approach | Verdict | Reason |
|----------|---------|--------|
| **Composed directory (RECOMMENDED)** | Use this | Each app builds independently, CI script copies into unified structure |
| Vite multi-page app | Rejected | Landing page and games share one Vite config but Storybook builds separately anyway -- you end up with two build systems regardless |
| Three separate deployments | Rejected | GitHub Pages serves from one branch/directory only; separate repos would fragment the experience |
| Monorepo with workspaces | Overkill | The library already exists in `src/`; adding workspaces for three small apps adds complexity without value |

### Build Composition Strategy

```
CI/CD Build Step Sequence:
==========================

1. npm run build              # Library dist/ (already exists)
2. npm run build-storybook    # storybook-static/ (already exists)
3. npm run build:site         # NEW: builds landing page + games

Composition Step:
=================

4. mkdir -p site-dist/
5. cp -r site/dist/*       site-dist/          # Landing page at /
6. cp -r storybook-static/ site-dist/storybook/ # Storybook at /storybook/
7. cp -r games/dist/*      site-dist/games/     # Games at /games/

Deploy: site-dist/ -> GitHub Pages
```

### Component Responsibilities

| Component | Responsibility | Build Tool | Output |
|-----------|----------------|------------|--------|
| **Landing Page** (`site/`) | Marketing/installation landing page | Vite (React SPA) | `site/dist/` |
| **Storybook** (`.storybook/`) | Interactive component documentation | Storybook CLI | `storybook-static/` |
| **Game Demos** (`games/`) | Three playable card games showcasing the library | Vite (React SPA with routes) | `games/dist/` |
| **Library** (`src/`) | Card component library (the product) | Vite (library mode) | `dist/` |
| **CI/CD** (`.github/workflows/`) | Orchestrates builds + deploys composed site | GitHub Actions | `site-dist/` |

## Recommended Project Structure

```
project-root/
+-- src/                          # Library source (EXISTING, unchanged)
|   +-- components/
|   +-- hooks/
|   +-- state/
|   +-- redux/
|   +-- types/
|   +-- utils/
|   +-- constants/
|   +-- index.ts
|
+-- site/                         # NEW: Landing page
|   +-- index.html                # Entry point
|   +-- main.tsx                  # React mount
|   +-- App.tsx                   # Landing page content
|   +-- components/               # Landing-page-specific components
|   |   +-- Hero.tsx              # Hero section with card animation
|   |   +-- Features.tsx          # Feature cards grid
|   |   +-- InstallGuide.tsx      # npm install + quick start code
|   |   +-- GameShowcase.tsx      # Links/previews of game demos
|   |   +-- Footer.tsx            # Links, GitHub, npm
|   +-- styles/                   # Landing page styles
|   +-- vite.config.ts            # Separate Vite config for site build
|
+-- games/                        # NEW: Game demos
|   +-- index.html                # Entry point
|   +-- main.tsx                  # React mount with router
|   +-- App.tsx                   # Game demo shell with navigation
|   +-- shared/                   # Shared game utilities
|   |   +-- GameLayout.tsx        # Common game chrome (header, back nav)
|   |   +-- ScoreBoard.tsx        # Reusable score display
|   |   +-- GameControls.tsx      # New game, restart buttons
|   +-- memory/                   # Memory (card matching) game
|   |   +-- MemoryGame.tsx        # Game component
|   |   +-- useMemoryGame.ts      # Game logic hook
|   |   +-- memory.types.ts       # Game-specific types
|   +-- war/                      # War (comparison) game
|   |   +-- WarGame.tsx
|   |   +-- useWarGame.ts
|   |   +-- war.types.ts
|   +-- solitaire/                # Klondike solitaire
|   |   +-- SolitaireGame.tsx
|   |   +-- useSolitaire.ts
|   |   +-- solitaire.types.ts
|   |   +-- zones/                # Solitaire-specific zone components
|   |       +-- Tableau.tsx
|   |       +-- Foundation.tsx
|   |       +-- Stock.tsx
|   |       +-- Waste.tsx
|   +-- vite.config.ts            # Separate Vite config for games build
|
+-- .storybook/                   # EXISTING: Storybook config
|   +-- main.ts                   # (may need viteFinal for base URL)
|   +-- preview.ts
|
+-- demo/                         # EXISTING: Dev demo (keep for development)
|   +-- App.tsx
|   +-- main.tsx
|
+-- .github/                      # NEW: CI/CD
|   +-- workflows/
|       +-- ci.yml                # Test + lint on all PRs
|       +-- deploy.yml            # Build + deploy site to GitHub Pages
|
+-- dist/                         # EXISTING: Library build output
+-- storybook-static/             # EXISTING: Storybook build output
+-- coverage/                     # EXISTING: Test coverage
```

### Structure Rationale

- **`site/` separate from `demo/`:** The existing `demo/` is a development sandbox importing directly from `../src`. The landing page in `site/` is a polished marketing page, not a dev tool. Keep both -- `demo/` for development, `site/` for production site.
- **`games/` as single SPA:** Three games in one Vite app with client-side routing. This avoids three separate Vite configs and produces one optimized bundle where shared code (React, the card library, shared game components) is deduplicated.
- **Each has its own `vite.config.ts`:** Landing page and games need different base URLs (`/<repo>/` and `/<repo>/games/`) and different build targets. Separate configs keep concerns clean.
- **Games import from `../src/`:** During build, games import the library source directly (not from `dist/` or npm). This means they always use the latest code and benefit from tree-shaking. This matches the existing `demo/` pattern.

## Architectural Patterns

### Pattern 1: Direct Source Import for Demo Apps

**What:** Game demos and landing page import the component library directly from `../src/index.ts` rather than consuming it as an npm package.
**When to use:** When demo apps live in the same repository as the library and are always built together.
**Trade-offs:** Pros: always in sync, no publish step needed, tree-shaking works. Cons: demos test source, not the published artifact.

**Example:**
```typescript
// games/memory/MemoryGame.tsx
import {
  Card,
  Hand,
  GameProvider,
  useGameActions,
  useGameState,
} from '../../src';
import type { CardData } from '../../src';
```

**Vite config to support this:**
```typescript
// games/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/decentralized-card-games/games/',
  root: resolve(__dirname),
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@card-lib': resolve(__dirname, '../src'),
    },
  },
});
```

### Pattern 2: Game Logic as Custom Hooks

**What:** Each game separates its logic into a custom hook (`useMemoryGame`, `useWarGame`, `useSolitaire`) that returns state and actions. The game component is purely presentational.
**When to use:** Always for game demos. This is the pattern the library itself follows (headless hooks), so demos should showcase it.
**Trade-offs:** Clean separation, testable logic, but requires discipline to keep hooks pure.

**Example:**
```typescript
// games/memory/useMemoryGame.ts
import { useReducer, useCallback } from 'react';
import { allCards } from '../../src';
import type { CardData } from '../../src';

interface MemoryGameState {
  cards: Array<{ card: CardData; id: string; matched: boolean }>;
  flipped: string[];       // Currently flipped card IDs (max 2)
  moves: number;
  matches: number;
  gameOver: boolean;
}

export function useMemoryGame(pairCount: number = 8) {
  const [state, dispatch] = useReducer(memoryReducer, pairCount, initGame);

  const flipCard = useCallback((id: string) => {
    dispatch({ type: 'FLIP', id });
  }, []);

  const newGame = useCallback(() => {
    dispatch({ type: 'NEW_GAME', pairCount });
  }, [pairCount]);

  return { ...state, flipCard, newGame };
}
```

```typescript
// games/memory/MemoryGame.tsx
import { Card } from '../../src';
import { useMemoryGame } from './useMemoryGame';
import { GameLayout } from '../shared/GameLayout';

export function MemoryGame() {
  const { cards, flipped, moves, matches, gameOver, flipCard, newGame } =
    useMemoryGame(8);

  return (
    <GameLayout title="Memory" moves={moves} onNewGame={newGame}>
      <div className="memory-grid">
        {cards.map(({ card, id, matched }) => (
          <Card
            key={id}
            card={card}
            faceUp={flipped.includes(id) || matched}
            onClick={() => flipCard(id)}
            // Use library's built-in flip animation
          />
        ))}
      </div>
      {gameOver && <div>You won in {moves} moves!</div>}
    </GameLayout>
  );
}
```

### Pattern 3: Shared Game Shell with Client-Side Routing

**What:** All three game demos share a navigation shell and use client-side routing (hash-based) to switch between games.
**When to use:** When deploying multiple related pages to GitHub Pages as a static SPA.
**Trade-offs:** Single bundle with code-splitting keeps load fast; hash routing avoids 404 issues on GitHub Pages.

**Why hash routing, not browser history routing:** GitHub Pages does not support server-side routing. With browser history routing, navigating directly to `/games/memory/` would return a 404 because there is no `memory/index.html` file. Hash routing (`/#/memory`) avoids this entirely because the path never reaches the server.

**Example:**
```typescript
// games/App.tsx
import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';

const MemoryGame = lazy(() => import('./memory/MemoryGame'));
const WarGame = lazy(() => import('./war/WarGame'));
const SolitaireGame = lazy(() => import('./solitaire/SolitaireGame'));

export function App() {
  return (
    <HashRouter>
      <nav>
        <Link to="/">All Games</Link>
        <Link to="/memory">Memory</Link>
        <Link to="/war">War</Link>
        <Link to="/solitaire">Solitaire</Link>
      </nav>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<GameIndex />} />
          <Route path="/memory" element={<MemoryGame />} />
          <Route path="/war" element={<WarGame />} />
          <Route path="/solitaire" element={<SolitaireGame />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
```

## Data Flow

### How Games Consume the Library

```
Game Demo (e.g., MemoryGame)
    |
    | import { Card, GameProvider, useGameActions } from '../../src'
    |
    v
Library Source (src/index.ts)
    |
    +---> Components (Card, Hand, Deck, DropZone, etc.)
    |         |
    |         +---> Render cards with flip animations
    |         +---> Handle drag-and-drop (Solitaire)
    |
    +---> State Management (gameReducer, GameProvider)
    |         |
    |         +---> Memory: Track flipped/matched cards
    |         +---> War: Track player hands, compare cards
    |         +---> Solitaire: Track 7 tableaux + 4 foundations + stock/waste
    |
    +---> Hooks (useGameState, useGameActions, useCardFlip)
              |
              +---> Game logic hooks call library action dispatchers
              +---> Components subscribe to library state selectors
```

### Library Usage by Game Complexity

| Game | Library Components Used | Library State Used | Complexity |
|------|------------------------|-------------------|------------|
| **Memory** | `Card` (flip only) | Minimal -- custom hook manages match state | Low |
| **War** | `Card`, `Deck`, `CardStack` | `gameReducer` for deck/hand management | Medium |
| **Solitaire** | `Card`, `CardStack`, `DraggableCard`, `DroppableZone`, `CardDndProvider` | Full `GameProvider` with multiple locations | High |

### State Architecture Per Game

```
Memory Game State (custom useReducer):
======================================
{
  cards: [{ card: CardData, id: string, matched: boolean }]
  flipped: string[]    // 0-2 currently visible cards
  moves: number
  gameOver: boolean
}
--> Does NOT use library GameProvider (too simple)
--> Uses Card component with faceUp prop for flip animation

War Game State (library GameProvider):
======================================
GameProvider with locations:
  - "player-deck"   -> CardState[]
  - "computer-deck" -> CardState[]
  - "player-play"   -> CardState[]  (current battle card)
  - "computer-play"  -> CardState[]
  - "war-pile"       -> CardState[]
--> Uses library moveCard/flipCard actions
--> Custom useWarGame hook wraps library actions with game rules

Solitaire State (library GameProvider):
=======================================
GameProvider with locations:
  - "stock"          -> CardState[]
  - "waste"          -> CardState[]
  - "foundation-0"   -> CardState[] (through "foundation-3")
  - "tableau-0"      -> CardState[] (through "tableau-6")
--> Full DnD integration with drop validation
--> Uses library moveCard + custom validation logic
--> Most complex: demonstrates all library capabilities
```

### Landing Page Data Flow

```
Landing Page
    |
    | import { Card, Hand, Deck } from '../src'
    |
    +---> Hero Section
    |         |
    |         +---> Animated card fan display (decorative)
    |         +---> Uses Hand component in non-interactive mode
    |
    +---> Feature Cards
    |         |
    |         +---> Static Card components showing different states
    |         +---> Demonstrates: face-up, face-down, suits, drag
    |
    +---> Code Snippets
              |
              +---> Static code blocks (no library import)
              +---> Shows npm install + usage examples
```

## Integration Points

### Landing Page <-> Storybook

| Integration | Method | Notes |
|-------------|--------|-------|
| "View Documentation" link | `<a href="./storybook/">` | Relative URL from landing page to Storybook subdirectory |
| Storybook back-link | Not needed | Storybook has its own navigation; adding a back link would require Storybook customization (low value) |

### Landing Page <-> Game Demos

| Integration | Method | Notes |
|-------------|--------|-------|
| "Play Games" links | `<a href="./games/#/memory">` | Hash-based deep links into the games SPA |
| Game preview cards | Static screenshots or live Card components | Landing page renders a few Card components as visual previews |

### Game Demos <-> Storybook

| Integration | Method | Notes |
|-------------|--------|-------|
| "View Component Docs" link in game | `<a href="../storybook/">` | Each game can link to relevant Storybook story |
| No deep integration | Intentional | Games are end-user demos; Storybook is developer docs |

### Build <-> Deploy (GitHub Actions)

| Step | Dependency | Notes |
|------|-----------|-------|
| `npm test` | None | Run first, fail fast |
| `npm run lint` | None | Run in parallel with tests |
| `npm run build` | Tests pass | Library build (validates types) |
| `npm run build-storybook` | Library build | Storybook imports from src/, needs deps installed |
| `npm run build:site` | Library build | Landing page imports from src/ |
| `npm run build:games` | Library build | Games import from src/ |
| Compose `site-dist/` | All builds complete | Script copies outputs into unified directory |
| Deploy to GitHub Pages | Composition complete | Upload `site-dist/` artifact |

## Vite Configuration Details

### Landing Page Vite Config

```typescript
// site/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname),
  base: '/decentralized-card-games/',  // GitHub Pages project base
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@card-lib': resolve(__dirname, '../src'),
    },
  },
});
```

### Games Vite Config

```typescript
// games/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname),
  base: '/decentralized-card-games/games/',  // Subdirectory base
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@card-lib': resolve(__dirname, '../src'),
    },
  },
});
```

### Storybook Base URL Configuration

The existing `.storybook/main.ts` needs a `viteFinal` configuration to set the base URL for subdirectory deployment:

```typescript
// .storybook/main.ts (modified)
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    defaultName: 'Documentation',
  },
  viteFinal: async (config) => {
    return mergeConfig(config, {
      base: process.env.STORYBOOK_BASE || '/',
    });
  },
};

export default config;
```

**Build command:** `STORYBOOK_BASE=/decentralized-card-games/storybook/ npm run build-storybook`

This uses an environment variable so local `npm run storybook` still works at `/` while CI builds target the subdirectory.

## GitHub Actions Deployment Architecture

```yaml
# .github/workflows/deploy.yml (architecture sketch)
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]  # or develop, depending on git-flow strategy

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci

      # Build all artifacts
      - run: npm run build                    # Library
      - run: npm run build:site               # Landing page
      - run: npm run build:games              # Game demos
      - run: |                                # Storybook with base URL
          STORYBOOK_BASE=/decentralized-card-games/storybook/ \
          npm run build-storybook

      # Compose site
      - run: |
          mkdir -p site-dist/storybook site-dist/games
          cp -r site/dist/* site-dist/
          cp -r storybook-static/* site-dist/storybook/
          cp -r games/dist/* site-dist/games/
          touch site-dist/.nojekyll

      # Deploy
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: site-dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

**Key detail:** The `.nojekyll` file in `site-dist/` prevents GitHub Pages from running Jekyll processing, which would break files starting with underscores (common in Vite/Storybook output).

## URL Structure

After deployment, the site is accessible at:

| URL | Content | Source |
|-----|---------|--------|
| `https://<user>.github.io/<repo>/` | Landing page | `site/dist/` |
| `https://<user>.github.io/<repo>/storybook/` | Storybook documentation | `storybook-static/` |
| `https://<user>.github.io/<repo>/games/` | Game demos index | `games/dist/` |
| `https://<user>.github.io/<repo>/games/#/memory` | Memory game | `games/dist/` (hash route) |
| `https://<user>.github.io/<repo>/games/#/war` | War game | `games/dist/` (hash route) |
| `https://<user>.github.io/<repo>/games/#/solitaire` | Solitaire game | `games/dist/` (hash route) |

## Anti-Patterns

### Anti-Pattern 1: Building Games as Storybook Stories

**What people do:** Put game demos inside Storybook as complex stories.
**Why it is wrong:** Storybook stories are for isolated component demonstration, not full application experiences. Games need routing, complex state, and a different UX than a component playground. The Storybook iframe sandbox also limits layout and interaction fidelity.
**Do this instead:** Build games as standalone Vite apps that import library components directly. Link from Storybook to the games and vice versa.

### Anti-Pattern 2: Publishing Library to npm Before Building Demos

**What people do:** Publish the library, then `npm install` it in demo apps.
**Why it is wrong:** Creates a publish-before-demo circular dependency. Every library change requires a publish cycle before demos can test it. Breaks development velocity.
**Do this instead:** Import from source (`../../src/`) during development and builds. The published npm package is for external consumers, not internal demos.

### Anti-Pattern 3: Single Vite Config for Everything

**What people do:** Try to configure one `vite.config.ts` with multiple entry points for landing page, games, and library.
**Why it is wrong:** Library mode and app mode are fundamentally different Vite configurations. Library mode externalizes React; app mode bundles it. Mixing them in one config leads to confusing build output and broken artifacts.
**Do this instead:** Separate Vite configs per build target: `vite.config.ts` (library), `site/vite.config.ts` (landing page), `games/vite.config.ts` (games).

### Anti-Pattern 4: Browser History Routing on GitHub Pages

**What people do:** Use `react-router-dom` with `BrowserRouter` for game navigation.
**Why it is wrong:** GitHub Pages is static file hosting with no server-side routing. Navigating to `/games/memory/` directly returns 404 because no `memory/index.html` exists. The common workaround (copying `index.html` to `404.html`) is fragile and breaks proper 404 behavior.
**Do this instead:** Use `HashRouter` for game demos. URLs become `/games/#/memory` which always loads `games/index.html` and lets JavaScript handle the route.

### Anti-Pattern 5: Duplicating Library Code in Games

**What people do:** Copy library utility functions or components into game code instead of importing.
**Why it is wrong:** Code duplication means bug fixes must be applied in multiple places. Demos should showcase the library as consumers would use it.
**Do this instead:** Always import from the library. If a game needs functionality the library does not provide, that is either a signal to add it to the library or keep it as game-specific logic in the game's own hook.

## New vs. Modified Components

### New Files (to be created)

| Category | Files | Purpose |
|----------|-------|---------|
| Landing page | `site/index.html`, `site/main.tsx`, `site/App.tsx`, `site/vite.config.ts` | Standalone marketing/docs landing page |
| Landing components | `site/components/Hero.tsx`, `Features.tsx`, `InstallGuide.tsx`, `GameShowcase.tsx`, `Footer.tsx` | Landing page sections |
| Games shell | `games/index.html`, `games/main.tsx`, `games/App.tsx`, `games/vite.config.ts` | Game demo SPA with routing |
| Games shared | `games/shared/GameLayout.tsx`, `ScoreBoard.tsx`, `GameControls.tsx` | Common game UI chrome |
| Memory game | `games/memory/MemoryGame.tsx`, `useMemoryGame.ts` | Card matching game |
| War game | `games/war/WarGame.tsx`, `useWarGame.ts` | Card comparison game |
| Solitaire game | `games/solitaire/SolitaireGame.tsx`, `useSolitaire.ts`, zone components | Klondike implementation |
| CI/CD | `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` | Automation |

### Modified Files (existing, need changes)

| File | Change | Why |
|------|--------|-----|
| `.storybook/main.ts` | Add `viteFinal` with base URL from env var | Subdirectory deployment support |
| `package.json` | Add `build:site`, `build:games`, `build:deploy` scripts | New build targets |
| `.gitignore` | Add `site/dist/`, `games/dist/`, `site-dist/` | Ignore new build outputs |
| `tsconfig.json` | Possibly add path aliases for `@card-lib` | Cleaner imports in games/site |

### Unchanged Files

| Category | Files | Why Unchanged |
|----------|-------|---------------|
| Library source | All `src/**/*` | v2.0 does not modify library components |
| Library build | `vite.config.ts`, `vite.config.umd.ts` | Library build pipeline is already complete |
| Dev demo | `demo/**/*` | Keep as development sandbox |
| Tests | All `*.test.tsx`, `vitest.config.ts` | Existing tests remain; new game tests are additive |

## Build Order (Dependencies)

```
Phase 1: CI/CD Foundation
=========================
 1. .github/workflows/ci.yml        # Test/lint on PRs (no deployment)
 2. package.json script updates      # Add build:site, build:games

Phase 2: Landing Page
=====================
 3. site/vite.config.ts              # Build configuration
 4. site/index.html + main.tsx       # Entry point
 5. site/App.tsx                     # Page structure
 6. site/components/Hero.tsx         # Hero with live card animation
 7. site/components/InstallGuide.tsx # npm install + usage code
 8. site/components/Features.tsx     # Feature highlight cards
 9. site/components/GameShowcase.tsx # Links to game demos
10. site/components/Footer.tsx       # Links, attribution

Phase 3: Game Demos (ordered by complexity)
===========================================
11. games/vite.config.ts             # Build configuration
12. games/shared/*                   # Common game UI components
13. games/index.html + main.tsx      # Entry point with router
14. games/memory/*                   # Simplest game (Card flip only)
15. games/war/*                      # Medium (Deck + state management)
16. games/solitaire/*                # Complex (full DnD + multi-zone)

Phase 4: Storybook Integration
==============================
17. .storybook/main.ts modification  # Add viteFinal for base URL

Phase 5: Deployment Pipeline
============================
18. .github/workflows/deploy.yml     # Full build + compose + deploy
19. Composition script               # Assembles site-dist/
20. .nojekyll + final configuration  # GitHub Pages setup
```

### Build Order Rationale

- **CI first:** Quality gates before any new code. Even an empty workflow establishes the pattern.
- **Landing page before games:** Landing page is simpler (no routing, no game logic) and establishes the Vite app build pattern that games reuse.
- **Memory before War before Solitaire:** Each game increases in library feature usage. Memory uses only Card flip. War adds Deck and state management. Solitaire adds full DnD. This progression validates library capabilities incrementally.
- **Storybook modification last in build phase:** Minimal change, just base URL. Do it after other builds are working so you can test the full composition.
- **Deployment pipeline last:** Requires all builds to exist. The composition script ties everything together.

## Scaling Considerations

| Concern | Current Scale | Future Scale | Notes |
|---------|---------------|--------------|-------|
| Build time | ~30s total (est.) | Add caching | Parallel builds in CI could cut this further |
| Site size | ~2MB (est. with Storybook) | Grows with stories/games | Storybook dominates; games are small |
| GitHub Pages limits | 1GB repo, 100GB/month bandwidth | Unlikely to hit | Static assets only, no server |
| Code splitting | Lazy load game routes | Add per-game chunks | React.lazy already handles this |

### Scaling Priorities

1. **First concern:** Build time in CI. Mitigate with npm caching and parallel build steps.
2. **Second concern:** Storybook size. Already handled -- Storybook tree-shakes unused addons in production build.

## Sources

### HIGH Confidence (Official Documentation)
- [Vite: Building for Production - Multi-Page App](https://vite.dev/guide/build) -- rollupOptions.input for multi-page builds
- [Vite: Deploying a Static Site - GitHub Pages](https://vite.dev/guide/static-deploy) -- base URL config, GitHub Actions workflow template
- [Storybook: viteFinal configuration](https://storybook.js.org/docs/api/main-config/main-config-vite-final) -- customizing Vite base URL in Storybook builds

### MEDIUM Confidence (Verified with Multiple Sources)
- [Storybook subdirectory deployment discussion](https://github.com/storybookjs/storybook/discussions/17433) -- confirmed `viteFinal` with `base` property approach
- [Storybook base path discussion](https://github.com/storybookjs/storybook/discussions/25858) -- environment variable pattern for conditional base URL
- [Deploying multiple apps from monorepo to GitHub Pages](https://www.thisdot.co/blog/deploying-multiple-apps-from-a-monorepo-to-github-pages) -- composed directory deployment pattern
- [Deploy Storybook to GitHub Pages with GitHub Actions](https://www.bitovi.com/blog/deploy-storybook-to-github-pages-with-github-actions) -- subdirectory TARGET_FOLDER approach
- [Using Vite with linked dependencies](https://dev.to/hontas/using-vite-with-linked-dependencies-37n7) -- resolve alias pattern for local library imports

### LOW Confidence (Single Source, Needs Validation)
- Hash routing vs browser history routing on GitHub Pages: Based on general knowledge of GitHub Pages static hosting limitations. The 404.html workaround exists but is fragile for complex routing scenarios.

---
*Architecture research for: v2.0 Documentation Site & Game Demo Integration*
*Researched: 2026-02-04*
