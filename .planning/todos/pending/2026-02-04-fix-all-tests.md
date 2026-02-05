---
created: 2026-02-04T23:56
title: Fix all tests
area: testing
files:
  - tests/e2e/deployment/production.spec.ts
  - .github/workflows/deploy.yml:155-189
---

## Problem

Production E2E tests are failing due to GitHub Pages CDN cache propagation issues. After releasing v1.0.1 and fixing CI/CD infrastructure:

- 7/10 production tests failing with 404 errors
- Tests query live GitHub Pages but CDN hasn't fully propagated
- curl from CI runner succeeds (200 OK) but Playwright gets 404
- Fastly CDN caching causes different responses from different edge locations
- Deployment polling works but tests still fail immediately after

Current workaround: `continue-on-error: true` on verify-production job, so tests run but don't block CI/CD pipeline.

## Solution

Wait for CDN to fully propagate (15-30 minutes after first deployment), then:

1. Re-run production tests manually or trigger new deployment
2. Consider increasing wait time after deployment polling
3. Add retry logic with exponential backoff in tests themselves
4. Or accept that first few deployments may have test failures until CDN stabilizes

Tests should pass once CDN caches fully propagate globally.
