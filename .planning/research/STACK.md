# Stack Research: v2.0 CI/CD, Deployment & Game Demos

**Domain:** CI/CD pipeline, GitHub Pages deployment, game demo infrastructure
**Researched:** 2026-02-04
**Confidence:** HIGH
**Context:** Subsequent milestone adding distribution infrastructure to existing React component library (v1.0 shipped)

## Executive Summary

The v2.0 milestone requires three categories of stack additions: (1) GitHub Actions for CI/CD automation, (2) GitHub Pages for hosting a combined site (landing page + Storybook + game demos), and (3) game demo apps consuming the library. The good news: the existing Vite/React/TypeScript stack handles all three without new frameworks. GitHub Actions is the only CI/CD platform that makes sense given the GitHub-hosted repository. The main architectural decision is how to structure the combined GitHub Pages site -- use Vite's native multi-page app support to build a unified site, not separate deployments.

**Current project versions (from package.json):** Storybook 8.6.x, Vite 6.1.x, Vitest 3.x, React 19.x. The previous STACK.md research (2026-02-02) recommended future versions (Vite 7.3, Storybook 10.2, Vitest 4.0); the actual installed versions are older. This research uses the **actual installed versions** as the baseline and notes where upgrades are recommended vs. optional.

---

## Existing Stack (DO NOT CHANGE)

These are already validated and shipping. Listed for context only.

| Technology | Installed Version | Purpose |
|------------|-------------------|---------|
| React | ^19.0.0 (peer: ^18 \|\| ^19) | UI framework |
| TypeScript | ^5.8.0 | Type safety |
| Vite | ^6.1.0 | Build tool & dev server |
| Vitest | ^3.0.0 (with @vitest/coverage-v8 ^3.2.4) | Test runner |
| Storybook | ^8.6.15 (@storybook/react-vite) | Component workshop |
| ESLint | ^9.39.2 (flat config) | Linting |
| Motion | ^12.27.0 | Animations |
| @dnd-kit/core | ^6.3.1 | Drag & drop |
| size-limit | ^12.0.0 | Bundle size checking |

---

## New Stack Additions for v2.0

### 1. CI/CD Pipeline (GitHub Actions)

No npm packages needed. GitHub Actions is configured via YAML workflow files.

| Component | Version | Purpose | Why |
|-----------|---------|---------|-----|
| **actions/checkout** | v6 | Clone repository | Latest stable; upgraded to Node 24 runtime. v6.0.2 is current (Jan 2025). |
| **actions/setup-node** | v6 | Install Node.js + cache npm | v6.2.0 (Jan 2025). Built-in npm caching via `cache: 'npm'` -- no separate cache action needed. |
| **actions/upload-pages-artifact** | v4 | Package site for GitHub Pages | v4.0.0 (Aug 2025). Required by GitHub Pages Actions-based deployment. Excludes dotfiles by default. |
| **actions/deploy-pages** | v4 | Deploy to GitHub Pages | v4.0.5 (Mar 2025). Required companion to upload-pages-artifact. |
| **actions/configure-pages** | v5 | Configure Pages environment | v5.0.0 (Mar 2024). Sets up environment variables for Pages. |
| **Node.js** | 22.x (in CI) | Runtime for builds/tests | Node 22 is Maintenance LTS (supported until Apr 2027). Use 22 instead of 24 because Storybook 8.6.x may not be validated on Node 24 yet. Upgrade to 24 when moving to Storybook 10. |

**Confidence:** HIGH -- all versions verified from GitHub release pages (fetched 2026-02-04).

#### Workflow Architecture (3 workflows)

**Workflow 1: `ci.yml` -- Continuous Integration**
- **Triggers:** Push to `develop`, `feature/*`, `release/*`, `hotfix/*` branches
- **Steps:** Install deps (cached), lint, typecheck, test with coverage, build library, size-limit check
- **Why separate:** Fast feedback on every push. No deployment artifacts needed.
- **Solo dev note:** No PR validation step needed. Trigger on push, not pull_request.

**Workflow 2: `deploy-site.yml` -- Build & Deploy Site**
- **Triggers:** Push to `main` only (production deployments)
- **Steps:** Install deps, build library, build Storybook, build game demos, build landing page, assemble combined site, deploy to GitHub Pages
- **Why separate:** Deployment is slower and only runs on production pushes.

**Workflow 3: `release.yml` -- npm Publish (optional, future)**
- **Triggers:** Manual dispatch or tag creation
- **Steps:** Build, test, publish to npm
- **Why separate:** Publishing is a deliberate action, not automated on every push.

### 2. GitHub Pages Site Structure

No additional npm packages needed for the site shell. Vite builds everything.

| Decision | Recommendation | Why |
|----------|---------------|-----|
| **Pages source** | GitHub Actions (not branch) | Actions-based deployment is the modern approach. No need for a `gh-pages` branch cluttering the repo. |
| **Base path** | `'/decentralized-card-games/'` | Repo URL will be `https://o2alexanderfedin.github.io/decentralized-card-games/`. All Vite builds must set `base` to this path. |
| **Site assembly** | Shell script in CI, not Vite MPA | Simpler: build each part independently, then `cp -r` into a combined `_site/` directory. Avoids complex Vite multi-entry config. |
| **Storybook subpath** | `/storybook/` subdirectory | Build Storybook with `--output-dir _site/storybook`. No viteFinal base hacking needed if Storybook is at a predictable subpath. |

#### Combined Site Directory Structure

```
_site/                          # Assembled in CI, uploaded to Pages
  index.html                    # Landing page (built by Vite from site/)
  assets/                       # Landing page assets
  storybook/                    # Storybook build (from build-storybook)
    index.html
    ...
  demos/                        # Game demos (built by Vite from demos/)
    memory/
      index.html
      assets/
    war/
      index.html
      assets/
    solitaire/
      index.html
      assets/
```

**Confidence:** HIGH for the overall approach. MEDIUM for the exact Storybook subpath handling (Storybook 8.6 + Vite subpath has known issues per GitHub discussions, may need `viteFinal` base override).

### 3. Landing Page

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Vite** | existing (^6.1.0) | Build the landing page | Already in the project. Create a separate Vite config (`vite.config.site.ts`) for the landing page build. |
| **React** | existing (^19.0.0) | Landing page components | Same React, different entry point. |

**New files needed:**
```
site/
  index.html          # Landing page HTML entry
  main.tsx            # React entry point
  App.tsx             # Landing page layout
  components/         # Landing page specific components
```

**Vite config:** `vite.config.site.ts` with:
- `root: 'site'`
- `base: '/decentralized-card-games/'`
- `build.outDir: '../_site'`

No new npm dependencies. The landing page uses the existing React/Vite stack.

### 4. Game Demo Applications

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Vite** | existing (^6.1.0) | Build each game demo | One Vite config per game, or a shared config with different entry points. |
| **React** | existing (^19.0.0) | Game UI | Same React, consuming the card-components library from `../src`. |
| **react-router-dom** | NOT RECOMMENDED | SPA routing | **DO NOT ADD.** Each game is a standalone page. No routing needed. HashRouter adds complexity for zero benefit in this case. |

**New files needed:**
```
demos/
  shared/             # Shared game utilities (shuffle, scoring)
    types.ts
    utils.ts
  memory/
    index.html        # Entry HTML
    main.tsx          # React entry
    App.tsx           # Memory game
  war/
    index.html
    main.tsx
    App.tsx           # War game
  solitaire/
    index.html
    main.tsx
    App.tsx           # Solitaire game
```

**Build approach:** A single Vite config (`vite.config.demos.ts`) using Vite's native multi-page input:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'demos',
  base: '/decentralized-card-games/demos/',
  build: {
    outDir: '../_site/demos',
    rollupOptions: {
      input: {
        memory: resolve(__dirname, 'demos/memory/index.html'),
        war: resolve(__dirname, 'demos/war/index.html'),
        solitaire: resolve(__dirname, 'demos/solitaire/index.html'),
      },
    },
  },
});
```

**Confidence:** HIGH -- Vite's multi-page input is documented in official Vite docs and verified.

### 5. Storybook Subpath Configuration

The existing Storybook 8.6 setup needs ONE change for GitHub Pages subpath deployment.

**In `.storybook/main.ts`**, add `viteFinal` to set the base path:

```typescript
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  // ... existing config ...
  viteFinal: async (config) => {
    return mergeConfig(config, {
      base: process.env.STORYBOOK_BASE || '/',
    });
  },
};
```

Then in CI: `STORYBOOK_BASE=/decentralized-card-games/storybook/ npm run build-storybook -- --output-dir _site/storybook`

This keeps local development working (`/` base) while supporting the subpath in production.

**Confidence:** MEDIUM -- `viteFinal` base override works per Storybook docs, but multiple GitHub discussions report edge cases with asset paths in Storybook 8.x under subpaths. May need testing.

---

## New package.json Scripts

```json
{
  "scripts": {
    "build:site": "vite build --config vite.config.site.ts",
    "build:demos": "vite build --config vite.config.demos.ts",
    "build:storybook": "STORYBOOK_BASE=/decentralized-card-games/storybook/ storybook build --output-dir _site/storybook",
    "build:pages": "npm run build:site && npm run build:demos && npm run build:storybook",
    "preview:site": "vite preview --config vite.config.site.ts",
    "dev:site": "vite --config vite.config.site.ts",
    "dev:demos": "vite --config vite.config.demos.ts"
  }
}
```

---

## Storybook Version Decision

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Stay on 8.6.x** | Zero migration effort; stable, tested | Larger install; CJS support baggage; won't receive new features | **Recommended for v2.0** |
| **Upgrade to 9.x** | Path to 10.x; addon consolidation | Breaking changes (addon renames, ESM shift); migration effort | Not worth it as intermediate step |
| **Upgrade to 10.x** | ESM-only (29% smaller install); module automocking; CSF factories | Major breaking change; requires Node 20+; all addons must be ESM | **Recommended for v2.1 or later** |

**Rationale:** The v2.0 milestone focuses on CI/CD and game demos. Storybook works as-is for documentation. Upgrading Storybook is orthogonal to the milestone goals and adds risk. Do it later as a separate effort.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not Alternative |
|----------|-------------|-------------|---------------------|
| **CI/CD** | GitHub Actions | CircleCI, Travis CI | Project is on GitHub; Actions is free for public repos; no external service needed |
| **CI/CD** | GitHub Actions | GitLab CI | Wrong platform; repo is on GitHub |
| **Hosting** | GitHub Pages | Vercel, Netlify | Adds external dependency; Pages is free and integrated; no server-side rendering needed |
| **Hosting** | GitHub Pages (Actions deploy) | GitHub Pages (branch deploy) | Actions deploy is cleaner -- no gh-pages branch, no force-push artifacts to repo |
| **Site assembly** | Shell script in CI | Vite MPA (single build) | Each sub-site (landing, Storybook, demos) has different build tools/configs; forcing into one Vite build is fragile |
| **Site assembly** | Shell script in CI | Turborepo/Nx | Massive overkill for a single-repo solo-dev project; adds 100MB+ of tooling |
| **Game routing** | Separate HTML pages (MPA) | React Router SPA | Each game is independent; no shared state between games; MPA avoids SPA routing issues on GitHub Pages |
| **Game routing** | Separate HTML pages | HashRouter SPA | Hash URLs are ugly and unnecessary; each game gets a clean `/demos/memory/` path |
| **Demo framework** | Vanilla React + existing components | Phaser / game engine | Games are simple card games, not action games; React components ARE the game pieces; adding a game engine is absurd overhead |

---

## What NOT to Add

| Avoid | Why | What to Do Instead |
|-------|-----|---------------------|
| **react-router-dom** | No routing needed; each game is a separate page; avoids GitHub Pages SPA 404 issues | Use Vite multi-page input with separate `index.html` per game |
| **Turborepo / Nx** | Solo developer, single repo, three small sub-builds; monorepo tooling adds complexity for zero benefit | Chain npm scripts: `build:site && build:demos && build:storybook` |
| **Docker** | GitHub Pages is static hosting; no containers needed | Build static files in CI, deploy via Pages action |
| **Vercel / Netlify** | External service dependency for what GitHub Pages does natively; overkill for static site | GitHub Pages with Actions deployment |
| **Chromatic** | Paid service for visual testing/hosting; Storybook deploys fine to GitHub Pages for free | Self-host Storybook on GitHub Pages |
| **Playwright / Cypress for CI** | No E2E tests in v2.0 scope; Vitest + Testing Library covers component testing | Keep existing Vitest setup; add E2E later if needed |
| **Codecov / Coveralls** | Solo developer; coverage is already in CI output; external badge service is vanity | Print coverage in CI logs; set threshold in vitest.config.ts (already done at 80%) |
| **Husky / lint-staged** | Project already has a custom pre-commit hook for branch enforcement; adding Husky conflicts | Keep existing `.git/hooks/pre-commit`; CI handles lint/test |
| **pnpm / yarn** | Project uses npm with package-lock.json; switching package managers mid-project risks lockfile issues | Stay on npm; `actions/setup-node` caches npm natively |

---

## Version Compatibility

| Package | Compatible With | CI Notes |
|---------|-----------------|----------|
| Storybook ^8.6.15 | Vite ^6.x, React 18/19, Node 20+ | Build command: `storybook build` |
| Vite ^6.1.0 | React 19, TypeScript 5.x, Node 20+ | Multiple configs via `--config` flag |
| Vitest ^3.0.0 | Vite ^6.x | Runs in CI with `vitest run --coverage` |
| actions/checkout@v6 | Node 24 runner | Compatible with ubuntu-latest |
| actions/setup-node@v6 | Node 22.x, npm cache | `cache: 'npm'` requires `package-lock.json` (present) |
| actions/upload-pages-artifact@v4 | deploy-pages@v4 | Must pair v4 upload with v4 deploy |
| actions/deploy-pages@v4 | upload-pages-artifact@v4 | Requires `pages: write` and `id-token: write` permissions |

---

## CI Workflow Template

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [develop, 'feature/**', 'release/**', 'hotfix/**']

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test -- --coverage
      - run: npm run build
      - run: npm run size
```

```yaml
# .github/workflows/deploy-site.yml
name: Deploy Site

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run build                    # Library build (validates before deploy)
      - run: npm run test -- --coverage       # Tests pass before deploy
      - run: npm run build:site               # Landing page -> _site/
      - run: npm run build:demos              # Game demos -> _site/demos/
      - run: npm run build:storybook          # Storybook -> _site/storybook/
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v4
        with:
          path: _site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

---

## Installation Summary

**No new npm packages required for v2.0 CI/CD and deployment.**

The only additions are:
1. YAML workflow files in `.github/workflows/`
2. New Vite config files for site and demos builds
3. Source files for landing page and game demos (using existing React/TS)
4. Minor Storybook config change for subpath (`viteFinal` base)

```bash
# Nothing to install. Existing dependencies cover everything.
# The following are already in the project:
# - vite (builds landing page and demos)
# - react, react-dom (game demo UI)
# - @vitejs/plugin-react (JSX transform for demos)
# - storybook (documentation build)

# Future (v2.1): Storybook upgrade
npx storybook@latest upgrade  # When ready to move to Storybook 10
```

---

## Sources

### Official Documentation (HIGH confidence)
- [Vite Static Deploy Guide](https://vite.dev/guide/static-deploy) -- GitHub Pages workflow with actions/upload-pages-artifact@v4, actions/deploy-pages@v4
- [Vite Multi-Page App](https://vite.dev/guide/build.html) -- rollupOptions.input for multiple HTML entries
- [Storybook Publish Guide](https://storybook.js.org/docs/sharing/publish-storybook) -- GitHub Pages deployment recommendations
- [Storybook viteFinal Config](https://storybook.js.org/docs/8.6/api/main-config/main-config-vite-final) -- Base path override for subpath deployment
- [Storybook 10 Migration](https://storybook.js.org/docs/releases/migration-guide) -- ESM-only breaking change

### GitHub Release Pages (HIGH confidence, fetched 2026-02-04)
- [actions/checkout releases](https://github.com/actions/checkout/releases) -- v6.0.2 (Jan 2025)
- [actions/setup-node releases](https://github.com/actions/setup-node/releases) -- v6.2.0 (Jan 2025)
- [actions/upload-pages-artifact releases](https://github.com/actions/upload-pages-artifact/releases) -- v4.0.0 (Aug 2025)
- [actions/deploy-pages releases](https://github.com/actions/deploy-pages/releases) -- v4.0.5 (Mar 2025)
- [actions/configure-pages releases](https://github.com/actions/configure-pages/releases) -- v5.0.0 (Mar 2024)

### Node.js (HIGH confidence)
- [Node.js Releases](https://nodejs.org/en/about/previous-releases) -- Node 22 Maintenance LTS (until Apr 2027), Node 24 Active LTS

### Community Resources (MEDIUM confidence)
- [Deploying Multiple Vite Apps to GitHub Pages](https://medium.com/@saranyasshiva/deploying-multiple-react-vite-apps-into-a-single-repository-using-github-page-a7d4aacf5b3b) -- Multi-app single-repo pattern
- [Storybook Subpath Deployment Discussion](https://github.com/storybookjs/storybook/discussions/25858) -- viteFinal base override approach
- [GitHub Pages SPA Routing Issues](https://github.com/orgs/community/discussions/36010) -- Why HashRouter/BrowserRouter is problematic on Pages
- [Bitovi Storybook GitHub Pages Action](https://github.com/bitovi/github-actions-storybook-to-github-pages) -- Alternative community action (not recommended; prefer native Pages actions)

### GitHub Blog (MEDIUM confidence)
- [GitHub Actions 2026 Updates](https://github.blog/news-insights/product-news/lets-talk-about-github-actions/) -- Parallel steps coming mid-2026
- [Pages Deprecation Notice](https://github.blog/changelog/2024-12-05-deprecation-notice-github-pages-actions-to-require-artifacts-actions-v4-on-github-com/) -- v4 artifact actions required

---

*Stack research for: v2.0 CI/CD, Deployment & Game Demo Infrastructure*
*Researched: 2026-02-04*
