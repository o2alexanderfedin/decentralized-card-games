# Pitfalls Research: CI/CD, GitHub Pages & Game Demos

**Domain:** CI/CD pipeline, static site deployment, and game demo implementation for a React component library
**Researched:** 2026-02-04
**Confidence:** HIGH (verified against official Vite docs, GitHub docs, Storybook docs, and multiple community sources)
**Context:** v2.0 milestone -- adding automation, public site, and demos to an existing shipped v1.0 library

---

## Critical Pitfalls

Mistakes that cause failed deployments, broken sites, or wasted days of debugging.

### Pitfall 1: Missing `.nojekyll` File Breaks Storybook and Asset Loading

**What goes wrong:**
GitHub Pages runs Jekyll by default, which ignores any file or directory starting with an underscore (`_`). Storybook generates assets in directories like `_storybook/` and files like `_buildManifest.js`. Without bypassing Jekyll, these files return 404, and the entire Storybook site appears blank or broken after deployment.

**Why it happens:**
Jekyll is GitHub Pages' default static site generator. Developers test locally where everything works, then deploy and find a blank page with no obvious error. The 404s only appear in the browser's network tab for underscore-prefixed paths.

**How to avoid:**
Add an empty `.nojekyll` file to the root of every deployed directory. In your GitHub Actions workflow, include `touch ./site/.nojekyll` (or equivalent) before uploading the artifact. When using `actions/upload-pages-artifact`, the artifact must include `.nojekyll` at its root.

**Warning signs:**
- Storybook deploys as blank white page
- Browser console shows 404 for `.js` files with underscore prefixes
- Landing page works but Storybook subdirectory does not
- Assets load locally but not on GitHub Pages

**Phase to address:**
CI/CD pipeline setup (first deployment workflow). Must be present from the very first deployment.

**Confidence:** HIGH -- verified via GitHub Blog official post on bypassing Jekyll, multiple Storybook deployment issues (#17433, #22710), and Next.js issue #2029.

---

### Pitfall 2: Vite Base Path Mismatch Causes Broken Asset References

**What goes wrong:**
All CSS, JS, and image assets fail to load on GitHub Pages. The HTML file loads, but every `<script>` and `<link>` tag points to `/assets/...` instead of `/decentralized-card-games/assets/...`, resulting in 404 errors for every resource.

**Why it happens:**
Vite defaults `base` to `'/'`, assuming the app is hosted at the server root. GitHub Pages project sites are hosted at `https://<user>.github.io/<repo>/`, creating a path prefix. This applies to three separate builds: the landing page, Storybook, and game demos. Each must have its base path configured correctly.

**How to avoid:**
1. Set `base` in `vite.config.ts` to `'/<repo-name>/'` for the landing page and game builds
2. Set Storybook's Vite base path via `viteFinal` in `.storybook/main.ts`:
   ```typescript
   viteFinal: async (config) => {
     config.base = process.env.STORYBOOK_BASE || '/decentralized-card-games/storybook/';
     return config;
   }
   ```
3. Use environment variables so the same config works locally (`/`) and in CI (`/<repo>/`)
4. Verify all three sub-apps have correct base paths in CI by checking the built HTML files

**Warning signs:**
- White/blank page after deployment with no visible errors
- Network tab shows 404 for every asset
- Works perfectly in local development (`npm run dev`)
- Built `index.html` contains `src="/assets/"` instead of `src="/<repo>/assets/"`

**Phase to address:**
CI/CD pipeline setup, before the first deployment. Set base path configuration as one of the first tasks.

**Confidence:** HIGH -- verified against official Vite static deployment docs (vite.dev/guide/static-deploy#github-pages) and Storybook viteFinal docs.

---

### Pitfall 3: GitHub Actions Permission Denied (403) on Pages Deployment

**What goes wrong:**
The GitHub Actions workflow completes the build step successfully, but fails at the deployment step with `Error: Resource not accessible by integration` or `403 Forbidden`. The site never updates.

**Why it happens:**
Three separate permission issues commonly overlap:
1. The repository's Settings > Actions > General > Workflow permissions is set to "Read" instead of "Read and write"
2. The workflow YAML has a `permissions` block that overwrites (not extends) defaults, so omitting `pages: write` or `id-token: write` silently removes those permissions
3. GitHub Pages source is still set to "Deploy from a branch" instead of "GitHub Actions" in Settings > Pages

**How to avoid:**
1. In repo Settings > Pages, set source to "GitHub Actions" (not branch)
2. In repo Settings > Actions > General, set workflow permissions to "Read and write permissions"
3. In the workflow YAML, always include ALL required permissions explicitly:
   ```yaml
   permissions:
     contents: read
     pages: write
     id-token: write
   ```
4. Test the deployment workflow on a non-protected branch first

**Warning signs:**
- Build succeeds but deploy step fails with 403
- Error message mentions "Resource not accessible by integration"
- Workflow worked in a fork but fails in the main repo (or vice versa)

**Phase to address:**
CI/CD pipeline setup, initial workflow configuration. Test with a minimal "hello world" deployment before building the full site.

**Confidence:** HIGH -- verified against GitHub official docs on Pages publishing sources and multiple community discussions (#171242, #60392).

---

### Pitfall 4: Storybook Build Out-of-Memory in GitHub Actions CI

**What goes wrong:**
`build-storybook` crashes with `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory` in GitHub Actions, even though it builds fine locally. The workflow fails intermittently or consistently.

**Why it happens:**
GitHub Actions runners have ~7GB RAM but Node.js defaults to a much lower heap limit (~1.5-2GB). Storybook + Vite builds with sourcemaps and minification are memory-intensive, especially with many stories (this project has 35+ stories). The build works locally because development machines typically have 16-32GB RAM with higher heap limits.

**How to avoid:**
1. Set `NODE_OPTIONS: '--max_old_space_size=4096'` as an environment variable in the workflow
2. Optionally disable sourcemaps for the Storybook production build in `.storybook/main.ts`:
   ```typescript
   viteFinal: async (config, { configType }) => {
     if (configType === 'PRODUCTION') {
       config.build = { ...config.build, sourcemap: false };
     }
     return config;
   }
   ```
3. Monitor the build step's memory usage in CI logs

**Warning signs:**
- Build succeeds locally but fails in CI
- Error message contains "heap out of memory" or "Allocation failed"
- Build fails intermittently (sometimes enough memory, sometimes not)
- Build time increases dramatically before the crash

**Phase to address:**
CI/CD pipeline setup, when adding the Storybook build step. Address proactively rather than waiting for the crash.

**Confidence:** HIGH -- verified via Storybook builder-vite issues (#282, #409) and multiple Storybook GitHub issues (#6408, #19994).

---

### Pitfall 5: Composite Site Routing -- Landing Page, Storybook, and Games Conflict

**What goes wrong:**
Deploying multiple sub-applications (landing page at `/`, Storybook at `/storybook/`, games at `/games/`) to a single GitHub Pages site causes routing conflicts. Links between sections break. Navigating from a game back to the landing page 404s. Storybook's internal routing conflicts with the top-level router.

**Why it happens:**
Each sub-application is a separate build artifact with its own routing assumptions. GitHub Pages serves static files -- there is no server-side routing. If any sub-app uses client-side routing (BrowserRouter), deep links will 404 because GitHub Pages does not know to serve that app's `index.html` for arbitrary paths within its subdirectory.

**How to avoid:**
1. Use a unified build directory structure:
   ```
   site/
     index.html          # Landing page
     storybook/
       index.html        # Storybook build output
     games/
       memory/index.html # Memory game
       war/index.html    # War game
       solitaire/index.html # Solitaire game
   ```
2. Use only hash-based routing (`/#/path`) or no client-side routing for game demos -- they are single-page apps that do not need URL routing
3. All cross-section links must use absolute paths with the repo base prefix
4. Add a `404.html` at the site root that redirects to the landing page (not to individual apps)
5. Each sub-app must be a fully self-contained build with no assumptions about parent routing

**Warning signs:**
- Clicking between landing page and Storybook produces 404
- Browser back button breaks after navigating between sections
- Game URLs work when navigated directly but fail from the landing page
- Storybook sidebar links produce 404 in production

**Phase to address:**
Architecture/site structure design, before building individual components. Define the directory structure and routing strategy as the first planning task for the GitHub Pages site.

**Confidence:** MEDIUM -- synthesized from multiple sources (GitHub Pages SPA discussions, Storybook subdirectory deployment discussions, Vite base path docs). Specific combination of landing page + Storybook + games is less commonly documented.

---

## Moderate Pitfalls

Mistakes that cause delays, confusing debugging sessions, or accumulated technical debt.

### Pitfall 6: Not Caching npm Dependencies in CI

**What goes wrong:**
Every CI run takes 2-5 minutes just for `npm ci` to install dependencies from scratch. Over time, this adds up to significant wasted time and makes the feedback loop slow, discouraging the solo developer from pushing frequently.

**Why it happens:**
The default GitHub Actions workflow does not include dependency caching. Developers copy a basic workflow template and never optimize it.

**How to avoid:**
Use the built-in caching in `actions/setup-node`:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'
```
This caches `~/.npm` (not `node_modules`) and restores it based on `package-lock.json` hash. Do NOT cache `node_modules` directly -- it breaks across Node versions and conflicts with `npm ci`.

**Prevention:**
Include caching from the very first workflow file. A solo developer running CI on every push will run it hundreds of times.

**Confidence:** HIGH -- verified against GitHub Actions official caching docs and actions/setup-node documentation.

---

### Pitfall 7: Building Library AND Site in the Same Vite Config

**What goes wrong:**
The existing `vite.config.ts` is configured for library mode (ESM + UMD output with externals). Attempting to reuse this config for building the landing page or game demos produces a broken build -- externals like React are excluded, CSS is not bundled, and the output is not a working application.

**Why it happens:**
Vite's library mode (`build.lib`) and application mode are fundamentally different. Library mode externalizes dependencies (React, etc.) and outputs a module. Application mode bundles everything into a self-contained app. Using the library config to build an application results in missing dependencies at runtime.

**How to avoid:**
Create separate Vite configs for different build targets:
- `vite.config.ts` -- library build (existing, keep as-is)
- `vite.config.umd.ts` -- UMD library build (existing, keep as-is)
- `vite.config.site.ts` -- landing page application build (new)
- Game demos: either separate configs or a shared app config with different entry points

Never modify the existing library configs to accommodate the site build. Keep them completely separate.

**Warning signs:**
- Landing page or games show "React is not defined" errors
- Built HTML files have no bundled JavaScript
- CSS appears missing in production but works in dev

**Phase to address:**
Site architecture phase, when setting up the landing page build.

**Confidence:** HIGH -- directly observed from the project's existing `vite.config.ts` which uses `build.lib` with externals.

---

### Pitfall 8: Game Demos That Become Unmaintainable Monoliths

**What goes wrong:**
Game demos start as "quick showcases" but grow into complex applications with their own state management, routing, and UI frameworks. Maintaining three games plus the component library becomes overwhelming for a solo developer. Games drift out of sync with the library API.

**Why it happens:**
Game logic (rules, scoring, win conditions) is inherently complex. Developers underestimate the scope: a "simple" Solitaire game needs 7 tableau piles, 4 foundation piles, a stock/waste area, undo support, win detection, and proper card movement validation. Each game becomes a mini-application.

**How to avoid:**
1. Set hard scope limits per game:
   - Memory: Flip pairs, match detection, score counter. No leaderboard, no difficulty levels.
   - War: Fully automated comparison. Play/reset buttons only. No variants.
   - Solitaire: Basic Klondike with click-to-move. No drag-to-foundation, no undo, no hint system.
2. Keep games as single-file or two-file implementations (game logic + UI)
3. Games should import from the published library API, not from internal source paths
4. Do NOT add game-specific dependencies (no game state machine libraries, no sound effects)
5. Time-box each game to a fixed number of hours

**Warning signs:**
- A game demo has more lines of code than the library component it showcases
- Adding game-specific npm dependencies
- Games need their own state management beyond React useState
- Game "bugs" dominate development time over library improvements

**Phase to address:**
Game demo planning phase. Define scope constraints before writing any game code.

**Confidence:** MEDIUM -- based on common patterns in component library demo projects and solo developer time management. No single authoritative source.

---

### Pitfall 9: CI Workflow That Blocks on git-flow Branch Strategy

**What goes wrong:**
The CI/CD workflow is configured to only run on `main` branch pushes, but the project uses git-flow where development happens on `feature/*` branches and `develop`. As a result, CI never runs during development -- only after merging to main, when it is too late to catch issues.

**Why it happens:**
Most CI/CD tutorial workflows use `on: push: branches: [main]`. The project's git-flow convention means `main` is only updated via release merges. A solo developer working on `feature/*` branches gets no CI feedback until the merge, defeating the purpose of CI.

**How to avoid:**
Configure the workflow to trigger on the branches that actually receive pushes:
```yaml
on:
  push:
    branches: [main, develop, 'feature/**', 'release/**', 'hotfix/**']
```
Optionally, only deploy to GitHub Pages from `main`, but run tests and builds on all branches:
- Tests + lint + build: All branches
- Deploy to Pages: Only `main`

**Warning signs:**
- CI workflow exists but has not run in weeks
- All CI runs are triggered by merge commits, not feature work
- Developer forgets to run tests locally because "CI will catch it" (but it does not)

**Phase to address:**
CI/CD pipeline setup, initial workflow configuration. Must align workflow triggers with the actual git-flow branching model from day one.

**Confidence:** HIGH -- directly derived from the project's `.git/hooks/pre-commit` enforcement of git-flow and the CLAUDE.md instructions.

---

### Pitfall 10: Forgetting Concurrency Controls on Deployment Workflows

**What goes wrong:**
Two rapid pushes to `main` trigger two deployment workflows simultaneously. Both try to deploy to GitHub Pages, causing a race condition. The first deployment's artifact gets overwritten mid-deploy, or the second deployment starts before the first finishes, resulting in a partially deployed site.

**Why it happens:**
GitHub Actions runs workflows in parallel by default. Without concurrency controls, every push triggers a new independent run.

**How to avoid:**
Add concurrency configuration to the deployment workflow:
```yaml
concurrency:
  group: 'pages'
  cancel-in-progress: false
```
Using `cancel-in-progress: false` ensures deployments queue rather than cancel each other. For test-only workflows, use `cancel-in-progress: true` to avoid wasting resources on outdated pushes.

**Prevention:**
Include concurrency controls in every workflow from the start. The solo developer workflow of "push, notice a typo, push again quickly" will trigger this immediately.

**Confidence:** HIGH -- verified against GitHub official documentation on workflow concurrency controls.

---

### Pitfall 11: Game Demos Importing from Library Source Instead of Published Package

**What goes wrong:**
Game demos import components using relative paths (`../../src/components/Card`) instead of the package name (`@decentralized-games/card-components`). The demos work in development but are not actually testing the library's public API. Breaking changes to the published API go undetected because demos bypass it.

**Why it happens:**
During development in a monorepo, relative imports are the path of least resistance. TypeScript resolves them instantly, and there is no build step required. Importing from the package requires either publishing to npm first or setting up npm workspace links.

**How to avoid:**
1. Configure the demos to import from the library's package name
2. Use npm workspaces or `npm link` to resolve the package name to the local build
3. Alternatively, run `npm run build` first and configure TypeScript paths to resolve to `./dist`
4. The CI workflow should build the library first, then build the demos -- ensuring demos consume the built output

**Warning signs:**
- Demos use `../src/` imports
- Demos work without running `npm run build` first
- Changing a component's exported API does not break any demo
- TypeScript path aliases point to source files, not dist

**Phase to address:**
Game demo architecture phase, before writing the first game. Set up the import pattern once and enforce it.

**Confidence:** HIGH -- this is a well-documented anti-pattern in component library development (Carl Rippon, Smashing Magazine tree-shaking guides).

---

## Minor Pitfalls

Mistakes that cause annoyance but are recoverable.

### Pitfall 12: Missing `concurrency` on Test Workflows Wastes CI Minutes

**What goes wrong:**
A solo developer pushes 5 commits in quick succession while iterating. Each push triggers a full CI run (test + lint + build). All 5 runs execute to completion, wasting ~25 minutes of CI time when only the last commit matters.

**How to avoid:**
Add `concurrency` with `cancel-in-progress: true` to test/lint workflows:
```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

**Confidence:** HIGH -- standard GitHub Actions pattern for non-deployment workflows.

---

### Pitfall 13: Storybook Dev vs. Build Configuration Drift

**What goes wrong:**
Storybook works in development (`npm run storybook`) but the production build (`npm run build-storybook`) fails or renders differently. Stories that work interactively break in the static build.

**How to avoid:**
1. Run `build-storybook` locally before pushing, at least once during setup
2. Include `build-storybook` in the CI workflow so it is tested on every push
3. Be aware that `viteFinal` receives a `configType` parameter (`'DEVELOPMENT'` vs `'PRODUCTION'`) -- ensure configurations work for both

**Confidence:** MEDIUM -- common Storybook issue, multiple community reports.

---

### Pitfall 14: Hardcoded Repository Name in Multiple Configs

**What goes wrong:**
The repository name `/decentralized-card-games/` is hardcoded in the Vite base path, Storybook config, landing page links, and game demo links. If the repository is ever renamed or forked, every config breaks simultaneously.

**How to avoid:**
Use environment variables or derive the base path from a single source:
```typescript
// vite.config.site.ts
const base = process.env.BASE_PATH || '/decentralized-card-games/';
```
In GitHub Actions, set it dynamically:
```yaml
env:
  BASE_PATH: /${{ github.event.repository.name }}/
```

**Confidence:** MEDIUM -- best practice from Vite community. The `import.meta.env.BASE_URL` approach is verified in official Vite docs.

---

### Pitfall 15: Browser Caching Masks Deployment Issues

**What goes wrong:**
After deploying an update to GitHub Pages, the developer checks the live site and sees the old version. They conclude the deployment failed and start debugging the workflow, when in reality the deployment succeeded but the browser cached the old assets.

**How to avoid:**
1. Always test deployments in an incognito/private window
2. Vite's production builds include content hashes in filenames by default (e.g., `index-a1b2c3d.js`), which busts the cache for changed files
3. Ensure the `index.html` itself is not aggressively cached -- GitHub Pages typically handles this correctly
4. Document this in the project's development notes to avoid confusion

**Confidence:** HIGH -- universally acknowledged web development issue, verified by Storybook deployment discussions.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Single workflow file for everything (test + build + deploy) | One file to maintain | Cannot rerun deploy without rerunning tests; slow feedback loop | MVP/initial setup only; split later |
| Skipping CI for game demos | Faster iteration | Games break silently when library API changes | Never -- at minimum, build verification |
| Hardcoding base paths | Quick setup | Breaks on fork/rename; copy-paste errors | Never -- use env variables from day one |
| Using `peaceiris/actions-gh-pages` instead of official `actions/deploy-pages` | Simpler config, supports subdirectories | Third-party dependency; may lag behind GitHub API changes | Acceptable if subdirectory deploy is critical |
| Copying Storybook's `storybook-static` directly into site output | Simple build script | Storybook version upgrades may change output structure | Acceptable for v2.0; revisit if Storybook major version changes |
| Game demos as Storybook stories instead of standalone apps | No extra build config; lives within existing Storybook | Games constrained by Storybook's iframe; limited interactivity; not independently linkable | Acceptable for very simple demos; not for full games |

## Integration Gotchas

Common mistakes when connecting CI/CD, GitHub Pages, and game demos.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Vite library build + site build | Using same config for both | Separate Vite configs: library mode (externals) vs. app mode (bundled) |
| GitHub Actions + GitHub Pages | Setting Pages source to "branch" | Set Pages source to "GitHub Actions" in repo settings |
| Storybook + subdirectory | Not setting base path | Use `viteFinal` to set `config.base` for production builds |
| Game demos + library | Importing from `src/` | Import from package name; build library first in CI |
| Landing page + game links | Relative links (`./games/memory`) | Absolute links with base path (`/repo-name/games/memory/`) |
| CI workflow + git-flow | Triggering only on `main` | Trigger tests on all branches; deploy only from `main` |
| Multiple builds + single deployment | Separate deployment steps | Combine all build outputs into single directory, deploy once |

## Performance Traps

Patterns that work at small scale but cause problems as the project grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| No npm cache in CI | 3-5 min install times | `actions/setup-node` with `cache: 'npm'` | First workflow run |
| Building Storybook without memory limit | Random CI failures | Set `NODE_OPTIONS='--max_old_space_size=4096'` | At ~30+ stories |
| No concurrency controls | Wasted CI minutes, race conditions | Add `concurrency` group to all workflows | First rapid-push session |
| Game demos bundling entire library | Slow page loads for simple demos | Tree-shake imports; monitor bundle size | When demos exceed 200KB |
| Deploying uncompressed assets | Slow site load time | Vite compresses by default; verify gzip in deployment | Large Storybook builds |

## Security Mistakes

Domain-specific security issues for CI/CD and GitHub Pages deployment.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Using third-party Actions without pinning to SHA | Supply chain attack via compromised action | Pin actions to commit SHA, not tag: `uses: actions/checkout@<sha>` |
| Storing secrets in workflow file | Credentials exposed in repo | Use GitHub encrypted secrets; never hardcode tokens |
| Granting `write` permissions to all workflow triggers | PR from fork can modify repo | Limit `write` permissions to push events on protected branches |
| Not restricting Pages deployment environment | Any branch can deploy to production | Add deployment protection rule for `github-pages` environment |

## UX Pitfalls

Common user experience mistakes in documentation sites and game demos.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Landing page with no visible demo | Visitors leave without understanding the library | Embed a live card component or animated GIF above the fold |
| Games with no loading feedback | Users think the page is broken | Show skeleton UI or loading spinner while game initializes |
| Storybook link opens in same tab | Users lose their place on the landing page | Open Storybook in a new tab (`target="_blank"`) |
| No mobile-responsive game demos | >50% of visitors on mobile see broken layout | Test all games at 375px width; disable complex interactions on mobile |
| Games with no "how to play" instructions | Users stare at cards not knowing what to do | Add a brief overlay or tooltip explaining controls on first visit |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **CI pipeline:** Often missing test step -- verify tests actually run and can fail the build
- [ ] **GitHub Pages:** Often missing `.nojekyll` -- verify underscore-prefixed assets load
- [ ] **Base path:** Often only set for landing page -- verify Storybook AND games also have correct base paths
- [ ] **Permissions:** Often missing `id-token: write` -- verify deployment step has all three required permissions
- [ ] **Concurrency:** Often missing on deploy workflow -- verify two rapid pushes do not corrupt the site
- [ ] **Git-flow alignment:** Often only triggers on `main` -- verify CI runs on `develop` and `feature/*` branches
- [ ] **Memory limits:** Often not set for Storybook build -- verify `NODE_OPTIONS` is set in CI environment
- [ ] **Game imports:** Often using relative paths -- verify games import from package name, not `src/`
- [ ] **Cross-linking:** Often using relative links between sections -- verify landing page links to Storybook and games work after deployment
- [ ] **404 handling:** Often no custom 404 page -- verify direct navigation to `/repo/games/memory` works

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Missing `.nojekyll` | LOW | Add file to build output; redeploy (5 min fix) |
| Wrong base path | LOW | Update config; rebuild; redeploy (15 min fix) |
| Permission denied (403) | LOW | Update repo settings and workflow permissions; re-trigger (10 min fix) |
| Out-of-memory Storybook build | LOW | Add NODE_OPTIONS env var; re-trigger (5 min fix) |
| Routing conflicts between sub-apps | MEDIUM | Restructure directory layout; update all cross-links (1-2 hours) |
| Library config used for site build | MEDIUM | Create separate Vite config; restructure build scripts (1-2 hours) |
| Game demos too complex | HIGH | Scope reduction requires rewriting; sunk cost of complex code (4-8 hours per game) |
| Games importing from source | MEDIUM | Restructure imports; set up workspace/linking; rebuild (2-3 hours) |
| CI not triggering on feature branches | LOW | Update workflow trigger branches (5 min fix) |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Missing `.nojekyll` | CI/CD setup | Deployed site loads Storybook correctly |
| Vite base path mismatch | CI/CD setup | All three sub-apps load assets correctly on GitHub Pages |
| GitHub Actions 403 | CI/CD setup | First deployment succeeds without manual intervention |
| Storybook OOM in CI | CI/CD setup | Storybook build completes in CI without memory errors |
| Composite site routing | Site architecture | All cross-links between landing/storybook/games work |
| No npm caching | CI/CD setup | `npm ci` step shows "cache hit" in CI logs |
| Wrong Vite config for site | Site architecture | Landing page loads with all dependencies bundled |
| Game demos too complex | Game planning | Each game is under 500 lines total |
| CI not on git-flow branches | CI/CD setup | CI runs on feature branch push |
| No concurrency controls | CI/CD setup | Two rapid pushes do not produce a broken deployment |
| Games importing from source | Game architecture | Games build successfully with only the dist/ output |
| Storybook dev/build drift | CI/CD setup | `build-storybook` is part of CI and passes |
| Hardcoded repo name | CI/CD setup | Base path derived from environment variable |
| Browser caching confusion | Documentation | README notes to test in incognito after deployment |
| Wasted CI minutes | CI/CD setup | `concurrency` with `cancel-in-progress` on test workflows |

## Solo Developer-Specific Warnings

Considerations unique to a single-person workflow with no PR review process.

| Concern | Risk | Mitigation |
|---------|------|------------|
| No PR review gate | Broken code deploys directly to production | CI must gate deployment: if tests fail, deploy must not run |
| Over-engineering CI | Spending days on CI instead of building features | Start with one simple workflow; split into multiple only when needed |
| Deployment debugging in production | Iterating on workflow by pushing to main | Test workflows on a `feature/*` branch first using `workflow_dispatch` trigger |
| Scope creep on games | "Just one more feature" on each game | Write scope constraints in the plan file; stick to them |
| Context switching | Jumping between CI config, landing page, games, and library | Complete one sub-system at a time: CI first, then site, then games |

## Sources

### HIGH Confidence (Official Documentation)
- [Vite: Deploying a Static Site - GitHub Pages](https://vite.dev/guide/static-deploy#github-pages) -- base path configuration and workflow template
- [GitHub Docs: Configuring a publishing source for GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) -- Actions vs. branch publishing
- [GitHub Docs: Caching dependencies to speed up workflows](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows) -- npm caching best practices
- [GitHub Docs: Control the concurrency of workflows and jobs](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency) -- concurrency groups
- [GitHub Blog: Bypassing Jekyll on GitHub Pages](https://github.blog/news-insights/bypassing-jekyll-on-github-pages/) -- `.nojekyll` file
- [Storybook Docs: viteFinal configuration](https://storybook.js.org/docs/api/main-config/main-config-vite-final) -- Vite config customization in Storybook
- [Storybook Docs: Vite builder](https://storybook.js.org/docs/builders/vite) -- Storybook + Vite integration

### MEDIUM Confidence (Multiple Sources Agree)
- [Storybook Discussion #17433: Deploying in a subdirectory](https://github.com/storybookjs/storybook/discussions/17433) -- subdirectory base path issues
- [Storybook builder-vite Issue #282: Out of memory in GitHub Actions](https://github.com/storybookjs/builder-vite/issues/282) -- memory limit solution
- [GitHub Community Discussion #171242: 403 error for Pages deployment](https://github.com/orgs/community/discussions/171242) -- permission configuration
- [GitHub Community Discussion #27676: SPA 404 on GitHub Pages](https://github.com/orgs/community/discussions/27676) -- SPA routing workaround
- [rafgraph/spa-github-pages](https://github.com/rafgraph/spa-github-pages) -- 404.html redirect pattern
- [actions/deploy-pages Issue #50: Publish artifacts by subdirectory](https://github.com/actions/deploy-pages/issues/50) -- multi-app deployment

### LOW Confidence (Single Source, Community Discussion)
- [Smashing Magazine: S(GH)PA: The Single-Page App Hack](https://www.smashingmagazine.com/2016/08/sghpa-single-page-app-hack-github-pages/) -- older but still relevant SPA hack
- [Evil Martians: Super GitHub Pages](https://evilmartians.com/chronicles/super-github-pages-budget-frontend-staging-with-storybook-and-more) -- multi-app GitHub Pages pattern

---
*Pitfalls research for: CI/CD, GitHub Pages deployment, and game demos for React component library*
*Researched: 2026-02-04*
*Supersedes: v1.0 PITFALLS.md (2026-02-02) which covered component library development pitfalls*
