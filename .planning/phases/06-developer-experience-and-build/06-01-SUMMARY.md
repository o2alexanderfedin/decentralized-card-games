---
phase: 06-developer-experience-and-build
plan: 01
subsystem: testing
tags: [eslint, vitest, coverage, jsx-a11y, typescript-eslint, v8-coverage]

# Dependency graph
requires:
  - phase: 05-accessibility
    provides: Accessible components with ARIA attributes (jsx-a11y now validates these)
provides:
  - ESLint 9 flat config with TypeScript, React, React Hooks, and jsx-a11y rules
  - Vitest coverage with v8 provider and 80% threshold enforcement
  - lint, lint:fix, and test:coverage npm scripts
affects: [06-02, 06-03, 06-04, 06-05, CI/CD pipelines]

# Tech tracking
tech-stack:
  added: [eslint@9, @eslint/js, typescript-eslint, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-jsx-a11y, globals, @vitest/coverage-v8@3]
  patterns: [ESLint 9 flat config (ESM), v8 coverage with threshold enforcement]

key-files:
  created: [eslint.config.js]
  modified: [vitest.config.ts, package.json]

key-decisions:
  - "ESLint 9 flat config with ESM format (not legacy .eslintrc)"
  - "@vitest/coverage-v8@^3.2.4 pinned to match vitest@^3.0 (4.x incompatible)"
  - "80% thresholds on lines/functions/branches/statements"
  - "Coverage excludes barrel files, stories, test-setup, and type declarations"

patterns-established:
  - "ESLint flat config: js.configs.recommended + tseslint.configs.recommended + jsxA11y.flatConfigs.recommended"
  - "Coverage reporters: text + json + html + lcov for CI and local inspection"

# Metrics
duration: 6min
completed: 2026-02-04
---

# Phase 6 Plan 1: Lint & Coverage Summary

**ESLint 9 flat config with TypeScript/React/jsx-a11y rules and Vitest v8 coverage enforcing 80% thresholds**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-04T09:06:12Z
- **Completed:** 2026-02-04T09:12:30Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- ESLint 9 flat config with TypeScript, React, React Hooks, and jsx-a11y recommended rules
- Vitest coverage with v8 provider producing text, JSON, HTML, and lcov reports
- 80% threshold enforcement on lines, functions, branches, and statements
- Current codebase coverage: 93.65% statements, 92.45% branches, 88.88% functions

## Task Commits

Each task was committed atomically:

1. **Task 1: Install ESLint ecosystem and create flat config** - `b4a2edd` (feat)
2. **Task 2: Install coverage provider and configure thresholds** - `de8fe67` (feat)

## Files Created/Modified
- `eslint.config.js` - ESLint 9 flat config with TypeScript, React, React Hooks, jsx-a11y rules
- `vitest.config.ts` - Added coverage configuration with v8 provider and thresholds
- `package.json` - Updated lint script, added lint:fix, test:coverage scripts; added ESLint and coverage devDependencies

## Decisions Made
- ESLint 9 flat config in ESM format (not legacy .eslintrc) -- aligned with ESLint 9 defaults
- Pinned `@vitest/coverage-v8@^3.2.4` to match `vitest@^3.0` -- 4.x has peer dependency conflict
- 80% thresholds on all four metrics (lines, functions, branches, statements)
- Coverage excludes barrel index.ts files, stories, test-setup.ts, and css-modules.d.ts
- `eslint-plugin-react-hooks@^7.0.1` installed (supports flat config natively)
- `@typescript-eslint/no-unused-vars` set to warn with `^_` ignore patterns for both args and vars

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `@vitest/coverage-v8` default install resolved to 4.x which is incompatible with vitest 3.x; pinned to `@^3.0` per plan guidance
- ESLint found 4 existing errors and 6 warnings in codebase (jsx-a11y and TypeScript rules); these are pre-existing code issues, not configuration problems

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Lint and coverage tooling in place for all subsequent Phase 6 plans
- ESLint config ready to be extended by future plans (e.g., Storybook stories linting)
- Coverage baseline established at 93%+ across all metrics
- No blockers for subsequent plans

---
*Phase: 06-developer-experience-and-build*
*Completed: 2026-02-04*
