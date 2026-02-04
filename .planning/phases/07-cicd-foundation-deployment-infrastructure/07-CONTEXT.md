# Phase 7: CI/CD Foundation & Deployment Infrastructure - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish automated quality gates and deployment pipeline for a TypeScript component library with Storybook and game demos. This includes:
- Running tests, linting, and builds on every push
- Deploying the composed site (landing + Storybook + games) to GitHub Pages
- Making the repository public with status badges

New capabilities (code coverage thresholds, security scanning, release automation) belong in other phases.

</domain>

<decisions>
## Implementation Decisions

### CI Job Organization
- **Parallel execution**: Run tests, lint, and builds in parallel for faster feedback (~3-5 min)
- **Lightweight on feature branches**: Tests + lint + build verification (no deployment)
- **Full builds on releases**: Complete matrix (library + Storybook + games) on release branches
- **Target time**: 5-10 minutes for feature branch CI feedback

### Caching Strategy
- **npm cache only**: Cache npm packages but rebuild everything
- Simpler cache invalidation, still provides ~30-40% speedup
- Avoid caching node_modules or build artifacts

### Deployment Triggers
- **Production deployment**: Only from `main` branch to GitHub Pages
- **Preview deployment**: Deploy `develop` branch to staging URL for pre-release preview
- **No feature branch deployments**: Feature branches run checks + verification only
- **CI on every push**: Immediate feedback on all branches, including features

### Build Failure Handling
- **Block merges completely**: PRs cannot merge until all CI checks pass (no admin override)
- **Fail loudly on deployment failures**: Halt workflow, require manual investigation (no auto-retry)
- **Notify on all failures**: Send notifications for every CI failure (feature branches included)
- **Treat all failures equally**: Test failure = build failure = lint failure (no special handling by type)

### Status Visibility
- **Badges**: Build status, test coverage, bundle size, npm version (all four)
- **Badge placement**: Top of README, immediately below title
- **Workflow name**: "CI/CD Pipeline" (descriptive, appears in Actions tab)
- **PR check names**: Descriptive names ("Run Tests", "Build Library", "Deploy to GitHub Pages")

### Claude's Discretion
- Exact parallelization strategy for jobs (which jobs can run concurrently)
- Specific GitHub Actions versions to use
- Node.js version matrix (if multiple versions should be tested)
- Artifact retention policies
- Exact notification mechanism (GitHub native vs third-party)

</decisions>

<specifics>
## Specific Ideas

- Follow git-flow branch strategy strictly: feature/* → develop → release/* → main
- Use GitHub's built-in branch protection rules for merge blocking
- Ensure deployment pipeline respects the base path `/decentralized-card-games/` from research
- Apply NODE_OPTIONS memory allocation from research findings to prevent Storybook build OOM

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope

</deferred>

---

*Phase: 07-cicd-foundation-deployment-infrastructure*
*Context gathered: 2026-02-04*
