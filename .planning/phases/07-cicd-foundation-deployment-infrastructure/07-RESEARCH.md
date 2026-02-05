# Phase 7: CI/CD Foundation & Deployment Infrastructure - Research

**Researched:** 2026-02-04
**Domain:** GitHub Actions CI/CD workflows, GitHub Pages deployment, npm caching
**Confidence:** HIGH

## Summary

Phase 7 establishes automated quality gates and deployment infrastructure for a TypeScript component library with Storybook and game demos. The standard approach uses GitHub Actions with a two-workflow strategy: a CI workflow for tests/lint/build verification on all branches (feature/develop/release/hotfix per git-flow), and a deployment workflow that builds and deploys the composite site (landing page + Storybook + games) to GitHub Pages from main. The existing project already has vitest, eslint, vite build, and storybook build commands, so the CI/CD work is primarily workflow configuration rather than new tooling.

Research confirms three critical configuration requirements: (1) GitHub Pages must be set to deploy from "GitHub Actions" source in repository settings, (2) workflows need `pages: write` and `id-token: write` permissions for deployment, and (3) `NODE_OPTIONS: --max-old-space-size=4096` is required to prevent Storybook build OOM errors in GitHub Actions runners. The existing project research from v2.0 planning has already identified the base path requirement (`/decentralized-card-games/`) and .nojekyll file need, which this phase implements.

**Primary recommendation:** Create two GitHub Actions workflows (`ci.yml` for parallel test/lint/build verification, `deploy.yml` for main-branch deployment), configure npm caching via `actions/setup-node@v6` with `cache: 'npm'`, set NODE_OPTIONS for memory allocation, add branch protection rules requiring CI status checks, and update README with shields.io badges.

## Standard Stack

### Core (GitHub Actions Ecosystem)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `actions/checkout` | v6 | Clone repository in workflow | Official GitHub action, widely adopted, LTS support |
| `actions/setup-node` | v6 | Configure Node.js environment with caching | Official action, built-in npm/pnpm/yarn cache support |
| `actions/upload-pages-artifact` | v4 | Package static files for Pages deployment | Official GitHub Pages action, proper tar/gzip format |
| `actions/deploy-pages` | v4 | Deploy artifact to GitHub Pages | Official GitHub Pages action, OIDC token verification |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `actions/cache` | v4 | Manual cache control | Only if setup-node caching proves insufficient |
| `github/codeql-action` | v3 | Security scanning | Future phase (deferred from Phase 7 scope) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| GitHub Actions | CircleCI/Travis CI | External service adds complexity; GitHub Actions is native and free for public repos |
| `setup-node` cache | `actions/cache` directly | setup-node cache is simpler, handles lockfile hashing automatically |
| Shields.io badges | GitHub workflow badges | Shields.io provides more badge types (npm version, bundle size) with consistent styling |
| Deploy from Actions | Deploy from branch | Branch deployment requires separate gh-pages branch management; Actions workflow is cleaner |

**No npm dependencies required.** GitHub Actions workflows use YAML configuration files only.

## Architecture Patterns

### Recommended Workflow Structure

```
.github/
├── workflows/
│   ├── ci.yml           # Tests, lint, build verification
│   └── deploy.yml       # Site composition and GitHub Pages deployment
```

### Pattern 1: Parallel Job Execution for CI

**What:** Run tests, lint, and build jobs in parallel to minimize feedback time
**When to use:** All CI workflows where jobs don't depend on each other

```yaml
# Source: GitHub Actions Documentation - Running variations of jobs in a workflow
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop, 'feature/**', 'release/**', 'hotfix/**']
  pull_request:
    branches: [main, develop]

env:
  NODE_OPTIONS: --max-old-space-size=4096

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm test

  lint:
    name: Run Linting
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  build-library:
    name: Build Library
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run build

  build-storybook:
    name: Build Storybook
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run build-storybook
```

### Pattern 2: GitHub Pages Deployment with Artifact Composition

**What:** Build multiple artifacts (landing, Storybook, games), compose into single directory, deploy
**When to use:** Production deployment from main branch

```yaml
# Source: Vite Static Deploy Guide, actions/deploy-pages README
name: Deploy Site

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

env:
  NODE_OPTIONS: --max-old-space-size=4096

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

      # Build all artifacts
      - name: Build Library
        run: npm run build

      - name: Build Storybook
        run: npm run build-storybook
        env:
          STORYBOOK_BASE: /decentralized-card-games/storybook/

      # Compose site directory
      - name: Compose Site
        run: |
          mkdir -p site-dist/storybook
          cp -r storybook-static/* site-dist/storybook/
          touch site-dist/.nojekyll

      - name: Upload Pages Artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: site-dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Pattern 3: Git-Flow Branch Triggering

**What:** Configure CI to trigger on all git-flow branch patterns
**When to use:** All repositories using git-flow branching strategy

```yaml
# Source: Project CLAUDE.md, GitHub Actions branch patterns
on:
  push:
    branches:
      - main
      - develop
      - 'feature/**'
      - 'release/**'
      - 'hotfix/**'
  pull_request:
    branches:
      - main
      - develop
```

### Pattern 4: README Badges with Shields.io

**What:** Add status badges to README for build status, npm version, and bundle size
**When to use:** Public repositories requiring visibility into project health

```markdown
# Project Name

[![CI/CD Pipeline](https://github.com/o2alexanderfedin/decentralized-card-games/actions/workflows/ci.yml/badge.svg)](https://github.com/o2alexanderfedin/decentralized-card-games/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@decentralized-games/card-components)](https://www.npmjs.com/package/@decentralized-games/card-components)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@decentralized-games/card-components)](https://bundlephobia.com/package/@decentralized-games/card-components)
[![coverage](https://img.shields.io/badge/coverage-80%25-green)](https://github.com/o2alexanderfedin/decentralized-card-games)
```

### Anti-Patterns to Avoid

- **Don't cache node_modules directly:** Cache npm's global cache via setup-node instead. node_modules caching causes version mismatch issues and doesn't work across different Node versions.
- **Don't use `npm install` in CI:** Always use `npm ci` for reproducible builds from lockfile.
- **Don't skip permissions block:** GitHub Pages deployment requires explicit `pages: write` and `id-token: write` permissions.
- **Don't use same job name across workflows:** Branch protection rules use job names as status check identifiers; duplicates cause merge blocking issues.
- **Don't run deployment on pull requests:** PRs should only run verification, not deployment.
- **Don't auto-retry deployment failures:** Per CONTEXT.md decision, fail loudly and require manual investigation.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| npm dependency caching | Custom actions/cache config | `setup-node` with `cache: 'npm'` | Handles lockfile hashing and cache key management automatically |
| GitHub Pages deployment | Custom artifact upload/serving | `upload-pages-artifact` + `deploy-pages` | Ensures proper tar/gzip format, handles deployment tokens, provides URL output |
| Build status badges | Custom status endpoints | Shields.io badges | Dynamic updates, consistent styling, supports many badge types |
| Branch protection | Manual review process | GitHub branch protection rules | Automated enforcement, audit trail, integrates with status checks |
| Workflow artifact sharing | Custom file upload/download | `actions/upload-artifact` + `download-artifact` | Handles large files, automatic cleanup, cross-job sharing |

**Key insight:** GitHub Actions has mature official actions for every CI/CD pattern this phase requires. The implementation complexity is in workflow YAML configuration and GitHub repository settings, not in building custom solutions.

## Common Pitfalls

### Pitfall 1: GitHub Pages Source Not Set to Actions

**What goes wrong:** Deployment workflow runs successfully but site doesn't update; Pages serves old content or 404s.
**Why it happens:** Repository settings default to "Deploy from branch" which ignores Actions workflow deployments.
**How to avoid:** Navigate to Settings > Pages and change "Build and deployment" source to "GitHub Actions" before first deployment.
**Warning signs:** Workflow shows green checkmark but site content is stale; `deploy-pages` step completes but URL returns 404.

### Pitfall 2: Missing Workflow Permissions

**What goes wrong:** Deployment fails with 403 Forbidden or "Resource not accessible by integration" error.
**Why it happens:** Workflows need explicit `pages: write` and `id-token: write` permissions for OIDC-based Pages deployment.
**How to avoid:** Add permissions block at workflow level:
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```
**Warning signs:** Error message mentions "Resource not accessible" or "Authentication required".

### Pitfall 3: Storybook Build OOM in GitHub Actions

**What goes wrong:** `npm run build-storybook` fails with "JavaScript heap out of memory" error.
**Why it happens:** Storybook with Vite builder requires more than Node's default ~2GB heap; GitHub runners have 7GB RAM but Node doesn't use it automatically.
**How to avoid:** Set `NODE_OPTIONS: --max-old-space-size=4096` (or 6144) as workflow environment variable.
**Warning signs:** Build works locally but fails in CI with "FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed".

### Pitfall 4: Base Path Mismatch Causes 404s

**What goes wrong:** Site deploys but all CSS/JS assets return 404; page loads but has no styling or functionality.
**Why it happens:** Vite defaults to `/` base path but GitHub Pages serves from `/<repo>/` subdirectory.
**How to avoid:** Configure `base: '/decentralized-card-games/'` in Vite config, and `STORYBOOK_BASE` environment variable for Storybook's viteFinal.
**Warning signs:** HTML loads but Network tab shows 404s for all .js and .css files; browser console shows "Failed to load resource".

### Pitfall 5: Missing .nojekyll File Breaks Storybook

**What goes wrong:** Storybook deploys but assets starting with underscore (like `_storybook/`) return 404.
**Why it happens:** GitHub Pages runs Jekyll by default which filters out underscore-prefixed paths.
**How to avoid:** Add `touch site-dist/.nojekyll` to workflow before uploading artifact.
**Warning signs:** Some Storybook chunks load while others 404; specifically `_storybook/*` paths fail.

### Pitfall 6: Git-Flow Branches Don't Trigger CI

**What goes wrong:** Developers push to `feature/my-feature` but no CI runs; PR shows no status checks.
**Why it happens:** Default workflow triggers only include `main` or `master` branches.
**How to avoid:** Use glob patterns in workflow triggers: `'feature/**'`, `'release/**'`, `'hotfix/**'`.
**Warning signs:** CI runs on main/develop but developers get no feedback on feature branches.

### Pitfall 7: Concurrent Deployments Cause Race Conditions

**What goes wrong:** Two merges to main in quick succession cause deployment conflicts or corrupted site state.
**Why it happens:** Default GitHub Actions behavior runs workflows in parallel.
**How to avoid:** Add concurrency group with cancel-in-progress: false to queue deployments:
```yaml
concurrency:
  group: 'pages'
  cancel-in-progress: false
```
**Warning signs:** Intermittent deployment failures or partially updated sites after rapid merges.

### Pitfall 8: Duplicate Job Names Block PRs

**What goes wrong:** PRs stay blocked even after CI passes; branch protection shows pending or failed checks that don't exist.
**Why it happens:** Using same job name (e.g., "build") across multiple workflows creates ambiguous status check references.
**How to avoid:** Use unique, descriptive job names per CONTEXT.md: "Run Tests", "Build Library", "Deploy to GitHub Pages".
**Warning signs:** Branch protection shows pending checks that never resolve; status API returns multiple entries for same name.

## Code Examples

### Complete CI Workflow

```yaml
# .github/workflows/ci.yml
# Source: GitHub Actions Documentation, Project CONTEXT.md decisions
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop, 'feature/**', 'release/**', 'hotfix/**']
  pull_request:
    branches: [main, develop]

env:
  NODE_OPTIONS: --max-old-space-size=4096

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm test

  lint:
    name: Run Linting
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck

  build-library:
    name: Build Library
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run build

  build-storybook:
    name: Build Storybook
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run build-storybook
```

### Complete Deployment Workflow

```yaml
# .github/workflows/deploy.yml
# Source: actions/deploy-pages README, Vite Static Deploy Guide
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

env:
  NODE_OPTIONS: --max-old-space-size=4096

jobs:
  build:
    name: Build Site
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v6
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Library
        run: npm run build

      - name: Build Storybook
        run: npm run build-storybook

      - name: Compose Site Directory
        run: |
          mkdir -p site-dist/storybook
          cp -r storybook-static/* site-dist/storybook/
          touch site-dist/.nojekyll
          echo "Site composed successfully"
          ls -la site-dist/

      - name: Upload Pages Artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: site-dist/

  deploy:
    name: Deploy to GitHub Pages
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Storybook Base Path Configuration

```typescript
// .storybook/main.ts - Updated for subdirectory deployment
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(ts|tsx)',
  ],
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
    // Set base path for GitHub Pages subdirectory deployment
    if (process.env.STORYBOOK_BASE) {
      config.base = process.env.STORYBOOK_BASE;
    }
    return config;
  },
};

export default config;
```

### README Badges Section

```markdown
# @decentralized-games/card-components

[![CI/CD Pipeline](https://github.com/o2alexanderfedin/decentralized-card-games/actions/workflows/ci.yml/badge.svg)](https://github.com/o2alexanderfedin/decentralized-card-games/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@decentralized-games/card-components)](https://www.npmjs.com/package/@decentralized-games/card-components)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@decentralized-games/card-components)](https://bundlephobia.com/package/@decentralized-games/card-components)
[![coverage](https://img.shields.io/badge/coverage-80%25-green)](https://github.com/o2alexanderfedin/decentralized-card-games)

React component library for visualizing and interacting with playing cards.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Deploy from gh-pages branch | Deploy from GitHub Actions | 2022-2023 | No separate branch maintenance; workflow-based deployment |
| actions/cache for npm | setup-node with cache: 'npm' | 2021 | Simpler config; automatic lockfile-based cache keys |
| Webpack CI builds | Vite CI builds | 2023-2024 | Faster builds; but requires NODE_OPTIONS for Storybook memory |
| Travis CI / CircleCI | GitHub Actions | 2020-2023 | Native GitHub integration; free for public repos; unified platform |
| actions/checkout@v3 | actions/checkout@v6 | 2024-2025 | Node 24 runtime; improved performance |
| Manual artifact upload | upload-pages-artifact | 2022-2023 | Automatic tar/gzip packaging; proper Pages format compliance |

**Deprecated/outdated:**
- **gh-pages npm package:** Replaced by official GitHub Actions workflow; adds unnecessary dependency
- **Travis CI:** GitHub Actions is now standard for GitHub-hosted projects
- **actions/checkout@v3:** EOL approaching; v6 uses Node 24 runtime
- **Deploy from branch:** GitHub recommends Actions-based deployment for build-required sites

## Open Questions

1. **Develop Branch Preview Deployment**
   - What we know: CONTEXT.md specifies "Deploy develop branch to staging URL for pre-release preview"
   - What's unclear: GitHub Pages only supports one deployment environment per repository
   - Recommendation: Either (a) use GitHub's deployment environments feature with separate URLs, or (b) deploy develop to a different branch/directory that doesn't conflict. The planner should decide between these approaches. Option (b) is simpler: deploy develop to `site-dist/preview/` at a separate URL path.

2. **Node.js Version Selection**
   - What we know: Project currently uses Node 23.11.0 locally; CI should use LTS version
   - What's unclear: Whether to test against multiple Node versions (matrix strategy)
   - Recommendation: Use Node 22.x (current LTS, maintenance until Apr 2027) for CI. Single version is simpler per CONTEXT decision; matrix testing is deferred to future phase if needed.

3. **Notification Mechanism**
   - What we know: CONTEXT.md specifies "Notify on all failures" but leaves mechanism to Claude's discretion
   - What's unclear: GitHub native notifications vs third-party (Slack, email)
   - Recommendation: Use GitHub's built-in email notifications (enabled by default for workflow failures). Third-party integrations add complexity for minimal benefit in a public open-source project.

4. **Artifact Retention Policy**
   - What we know: Default GitHub retention is 90 days; CONTEXT.md leaves to Claude's discretion
   - What's unclear: Whether shorter retention saves cost or reduces clutter
   - Recommendation: Use default 90-day retention for workflow artifacts. Pages artifacts are automatically managed by GitHub Pages. No action needed.

## Sources

### Primary (HIGH confidence)

- [GitHub Actions Documentation - Running variations of jobs](https://docs.github.com/actions/writing-workflows/choosing-what-your-workflow-does/running-variations-of-jobs-in-a-workflow) - Matrix strategy, parallel jobs
- [actions/setup-node README](https://github.com/actions/setup-node) - Cache configuration, Node version setup
- [actions/deploy-pages README](https://github.com/actions/deploy-pages) - Deployment permissions, environment configuration
- [actions/upload-pages-artifact README](https://github.com/actions/upload-pages-artifact) - Artifact requirements, path configuration
- [Vite Static Deploy Guide](https://vite.dev/guide/static-deploy.html) - GitHub Pages workflow, base path configuration
- [Storybook Publishing Documentation](https://storybook.js.org/docs/sharing/publish-storybook) - GitHub Pages deployment workflow
- [GitHub Docs - About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) - Required status checks
- [Shields.io](https://shields.io/) - Badge generation for npm version, bundle size, build status

### Secondary (MEDIUM confidence)

- [storybookjs/builder-vite Issue #282](https://github.com/storybookjs/builder-vite/issues/282) - NODE_OPTIONS memory fix
- [GitHub Community Discussions](https://github.com/orgs/community/discussions) - Pages permission troubleshooting
- [Bitovi Storybook GitHub Pages Guide](https://www.bitovi.com/blog/deploy-storybook-to-github-pages-with-github-actions) - Deployment patterns
- [DEV Community CI/CD Tutorials](https://dev.to/efkumah/implementing-cicd-pipeline-with-github-actions-and-github-pages-in-a-react-app-ij9) - React deployment patterns

### Tertiary (LOW confidence)

- Project-specific v2.0 research (../research/SUMMARY.md) - Validated architecture patterns (internal documentation)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All actions are official GitHub-maintained with stable APIs
- Architecture: HIGH - Workflow patterns derived from official documentation and widely adopted
- Pitfalls: HIGH - All pitfalls verified through official docs and multiple community reports
- Open questions: MEDIUM - Preview deployment approach needs validation in implementation

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable ecosystem; GitHub Actions release cycle is slow)
