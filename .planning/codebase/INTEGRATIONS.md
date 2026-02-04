# External Integrations

**Analysis Date:** 2026-02-04

## APIs & External Services

**None Detected:**
This is a pure client-side React component library with no external API integrations. No HTTP requests, fetch calls, or external service SDKs found in source code.

**Future Consideration:**
While `CLAUDE.md` mentions blockchain integration as part of the "decentralized platform" vision, the current codebase (`@decentralized-games/card-components`) contains no web3, blockchain, or smart contract integrations. This is a standalone card visualization library.

## Data Storage

**Databases:**
- None - No database clients, ORMs, or database connections

**File Storage:**
- Local filesystem only (no cloud storage)
- Card assets referenced via string-based card data (`Suit` + `Rank`)
- No image uploads, S3, IPFS, or external asset storage

**Caching:**
- Browser localStorage - Optional game state persistence
  - Implementation: `src/context/persistence.ts`
  - Default key: `'cardGameState'`
  - Used by: `src/context/GameProvider.tsx` (when `persist={true}`)
  - Functions: `loadState()`, `saveState()`, `clearState()`
  - Error handling: Try/catch wraps all operations (handles private browsing, quota exceeded, corrupt JSON)

**In-Memory State:**
- React Context (`src/context/GameProvider.tsx`) - Standalone state management
- Redux Toolkit (optional) - `src/redux/store.ts` + `src/redux/slice.ts`
- No external caching layers (Redis, Memcached, etc.)

## Authentication & Identity

**Auth Provider:**
- None - Library has no authentication or user management

**Authorization:**
- None - No role-based access control or permissions

## Monitoring & Observability

**Error Tracking:**
- None - No Sentry, Bugsnag, or error reporting integrations

**Logs:**
- Console only - No structured logging or external log aggregation

**Analytics:**
- None - No Google Analytics, Mixpanel, or usage tracking

**Performance Monitoring:**
- None - No external APM tools
- Bundle size monitoring via size-limit (local development tool)

## CI/CD & Deployment

**Hosting:**
- npm registry - Package published as `@decentralized-games/card-components`

**CI Pipeline:**
- Not detected in codebase - No `.github/workflows/`, `.gitlab-ci.yml`, or CI config files

**Version Control:**
- Git - Enforced git-flow workflow via pre-commit hooks
- Repository: https://github.com/o2alexanderfedin/decentralized-card-games.git

## Environment Configuration

**Required env vars:**
- None - Library requires no environment variables

**Secrets location:**
- Not applicable - No secrets, API keys, or credentials needed

**Configuration:**
- All configuration via TypeScript/JavaScript module imports
- Component props drive behavior (no global config files)

## Webhooks & Callbacks

**Incoming:**
- None - No webhook endpoints or HTTP listeners

**Outgoing:**
- None - No webhook dispatching or HTTP callbacks

## Browser APIs Used

**Web APIs:**
- localStorage - Game state persistence (optional)
- matchMedia - `prefers-reduced-motion` detection (`src/hooks/usePrefersReducedMotion.ts`)
- ResizeObserver - Container size tracking (`src/hooks/useContainerSize.ts`)
- Vibration API - Haptic feedback on drag events (`src/hooks/useHapticFeedback.ts`)
- Keyboard Events - Accessibility and shortcuts (`src/hooks/useKeyboardShortcuts.ts`)
- Pointer Events - Drag and drop interactions (via @dnd-kit/core)

**Polyfills:**
- None required - Targets modern browsers (ES2020+)

## Development Tools

**Storybook:**
- @storybook/react-vite 8.6.15 - Component development UI
- @storybook/addon-essentials 8.6.14 - Core Storybook features
- @storybook/addon-a11y 8.6.15 - Accessibility audit panel
- @storybook/addon-interactions 8.6.14 - Interaction testing
- Config: `.storybook/main.ts`, `.storybook/preview.ts`
- Stories: `src/components/**/*.stories.tsx`

**Coverage Reporting:**
- @vitest/coverage-v8 3.2.4 - Code coverage via V8
- Reporters: text, json, html, lcov
- Thresholds: 80% (lines, functions, branches, statements)

---

*Integration audit: 2026-02-04*
