---
created: 2026-02-04T15:06
title: Add Playwright-based deployment verification tests
area: testing
files:
  - .github/workflows/deploy.yml
  - .github/workflows/ci.yml
---

## Problem

The CI/CD pipeline successfully builds and deploys to GitHub Pages, but we lack automated verification that the deployed site actually works correctly. We need:

1. **Local deployment verification** - Tests that verify the built site works when served locally (before pushing to production)
2. **GitHub Pages verification** - Tests that verify the live site at `https://o2alexanderfedin.github.io/decentralized-card-games/` is accessible and functional after deployment

This is critical because:
- Build can succeed but site may have runtime errors (missing assets, broken links, base path issues)
- GitHub Pages-specific issues (404s, routing problems, CORS) won't appear in local dev
- Manual verification doesn't scale and is error-prone

## Solution

Implement Playwright E2E tests that:

1. **Local verification suite:**
   - Serve the built `site-dist/` directory locally
   - Verify Storybook loads at `/storybook/` path
   - Check component stories render without errors
   - Validate navigation and interactive elements

2. **Production verification suite:**
   - Test against live GitHub Pages URL
   - Verify base path routing works correctly
   - Check all critical pages load (landing, Storybook, future game demos)
   - Validate assets load (CSS, JS, images)
   - Test cross-page navigation

3. **CI/CD Integration:**
   - Add verification job to `ci.yml` that runs after build
   - Add post-deployment verification to `deploy.yml` (smoke tests on production)
   - Fail pipeline if verification fails

**Technical approach:**
- Install `@playwright/test` and `playwright` browsers
- Create `tests/e2e/deployment/` directory for test files
- Use `playwright.config.ts` with separate projects for local/production
- Add npm scripts: `test:e2e:local`, `test:e2e:production`
- Consider lightweight server like `serve` or `http-server` for local testing

**Reference:**
- Playwright MCP server already available in project
- GitHub Pages site enabled at: https://o2alexanderfedin.github.io/decentralized-card-games/
- Base path: `/decentralized-card-games/`
