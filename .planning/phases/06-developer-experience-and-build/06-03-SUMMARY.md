---
phase: 06-developer-experience-and-build
plan: 03
subsystem: build
tags: [vite, umd, esm, tree-shaking, size-limit, sourcemaps, exports-map]

# Dependency graph
requires:
  - phase: 06-developer-experience-and-build
    provides: "ESLint/coverage/CSS theming infrastructure (06-01, 06-02)"
provides:
  - "ESM + UMD production build output"
  - "Package.json exports map with subpath imports"
  - "sideEffects field for tree-shaking"
  - "Bundle size monitoring via size-limit"
  - "Source maps for all output formats"
affects: ["06-04", "06-05"]

# Tech tracking
tech-stack:
  added: [size-limit, "@size-limit/preset-small-lib"]
  patterns: [two-pass-vite-build, esm-multi-entry, umd-single-entry]

key-files:
  created: [vite.config.umd.ts]
  modified: [vite.config.ts, package.json]

key-decisions:
  - "Two-pass build: ESM multi-entry + separate UMD single-entry (Vite prohibits multi-entry with UMD)"
  - "UMD global name: CardComponents"
  - "Redux entry ESM-only (no require/UMD) since Redux users always use bundlers"
  - "./styles subpath export for CSS import"
  - "sideEffects: ['**/*.css'] for tree-shaking all JS"
  - "Size budgets: 60kB main, 10kB redux (brotli+minified)"

patterns-established:
  - "Two-pass Vite build: vite.config.ts for ESM, vite.config.umd.ts for UMD"
  - "Shared externals/globals arrays between configs"
  - "size-limit in package.json for CI-enforceable size budgets"

# Metrics
duration: 8min
completed: 2026-02-04
---

# Phase 6 Plan 3: Build Configuration Summary

**ESM+UMD production build with two-pass Vite config, exports map, tree-shaking sideEffects, and size-limit bundle monitoring**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-04T09:53:44Z
- **Completed:** 2026-02-04T11:26:08Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Two-pass Vite build producing ESM (multi-entry) and UMD (main entry only) with source maps
- Package.json exports map with `.`, `./redux`, and `./styles` subpath imports
- Tree-shaking enabled via `sideEffects: ["**/*.css"]`
- Bundle size monitoring: main 57.55kB / 60kB budget, redux 1.34kB / 10kB budget
- dnd-kit UMD globals added for CDN consumers

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure Vite for ESM+UMD build with source maps** - `3bbb690` (feat)
2. **Task 2: Update package.json exports, sideEffects, and add bundle size monitoring** - changes absorbed by 06-04 commits (`ffc2348`, `a303328`) due to concurrent session

**Plan metadata:** (included in final commit)

## Files Created/Modified
- `vite.config.ts` - ESM multi-entry build config with source maps, shared externals/globals
- `vite.config.umd.ts` - UMD single-entry build config (emptyOutDir: false to preserve ESM output)
- `package.json` - exports map, sideEffects, main/module fields, size-limit config, size scripts
- `package-lock.json` - size-limit dependency tree
- `src/components/Card/Card.stories.tsx` - Fixed type errors (added args to render-only stories)
- `src/components/Deck/Deck.stories.tsx` - Fixed type errors (added args to render-only stories)

## Decisions Made
- **Two-pass build over single build:** Vite does not support multi-entry with UMD format. Used separate `vite.config.umd.ts` with `emptyOutDir: false` to append UMD output after ESM build.
- **UMD global name `CardComponents`:** Single global for CDN script tag usage.
- **Redux entry ESM-only:** Removed `require` from `./redux` export since Redux users always use bundlers.
- **CSS subpath export (`./styles`):** Points to `dist/card-components.css` for explicit style import.
- **Size budgets:** 60kB for main bundle (currently 57.55kB), 10kB for redux (currently 1.34kB), measured with brotli compression.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] UMD multi-entry incompatibility required two-pass build**
- **Found during:** Task 1
- **Issue:** Vite throws "Multiple entry points are not supported when output formats include 'umd'" with multi-entry + UMD
- **Fix:** Split into two configs: vite.config.ts (ESM multi-entry) and vite.config.umd.ts (UMD single-entry with emptyOutDir: false)
- **Files modified:** vite.config.ts, vite.config.umd.ts, package.json (build script)
- **Verification:** `npm run build` produces all expected output files
- **Committed in:** 3bbb690

**2. [Rule 3 - Blocking] Storybook story type errors prevented build**
- **Found during:** Task 2
- **Issue:** Card.stories.tsx and Deck.stories.tsx had `render`-only stories without `args`, but `satisfies Meta<typeof Card>` requires `args` to be present
- **Fix:** Added minimal `args` with a dummy card/count to satisfy TypeScript while `render` function still controls output
- **Files modified:** src/components/Card/Card.stories.tsx, src/components/Deck/Deck.stories.tsx
- **Verification:** `tsc --noEmit` passes, all 435 tests pass
- **Committed in:** absorbed by 06-04 commits (concurrent session)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes necessary for build to succeed. No scope creep.

## Issues Encountered
- Task 2 changes (exports map, sideEffects, size-limit, story fixes) were absorbed by concurrent 06-04 Storybook commits since both sessions modified package.json. All changes are correctly present in the tree.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Production build pipeline complete and verified
- Bundle sizes tracked and enforced
- Ready for documentation (06-05) or publishing workflows

---
*Phase: 06-developer-experience-and-build*
*Completed: 2026-02-04*
