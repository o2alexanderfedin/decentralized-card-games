# Technology Stack

**Analysis Date:** 2026-02-04

## Languages

**Primary:**
- TypeScript 5.8.0 - All source code in `src/`
- JavaScript (ESM) - Configuration files and build output

**Secondary:**
- CSS - Component styling in `src/components/**/*.module.css`
- HTML - Demo page at `index.html`

## Runtime

**Environment:**
- Browser (ES2020 target, DOM + DOM.Iterable)
- Node.js v23.11.0 (development environment)

**Package Manager:**
- npm 10.9.2
- Lockfile: package-lock.json (lockfileVersion 3) - present and committed

## Frameworks

**Core:**
- React 19.0.0 - UI component library foundation
- React DOM 19.0.0 - DOM rendering

**Testing:**
- Vitest 3.0.0 - Test runner and assertions
- jsdom 26.0.0 - Browser environment simulation
- @testing-library/react 16.2.0 - Component testing utilities
- @testing-library/jest-dom 6.6.3 - DOM assertion matchers
- @testing-library/user-event 14.6.1 - User interaction simulation
- vitest-axe 0.1.0 - Accessibility testing (via `src/test-setup.ts`)

**Build/Dev:**
- Vite 6.1.0 - Build tool and dev server
- @vitejs/plugin-react 4.3.0 - React Fast Refresh support
- vite-plugin-dts 4.5.0 - TypeScript declaration generation
- Storybook 8.6.15 - Component development environment

**Linting/Quality:**
- ESLint 9.39.2 - Code linting
- typescript-eslint 8.54.0 - TypeScript-specific rules
- eslint-plugin-react 7.37.5 - React best practices
- eslint-plugin-react-hooks 7.0.1 - React hooks rules
- eslint-plugin-jsx-a11y 6.10.2 - Accessibility linting
- size-limit 12.0.0 - Bundle size monitoring

## Key Dependencies

**Critical:**
- @dnd-kit/core 6.3.1 - Drag and drop primitives (used in `src/components/DraggableCard/`, `src/components/DropZone/`, `src/hooks/useDraggableCard.ts`, `src/hooks/useDroppableZone.ts`)
- @dnd-kit/utilities 3.2.2 - DnD utility functions
- @dnd-kit/modifiers 9.0.0 - Drag behavior modifiers
- motion 12.27.0 - Animation library (replaces Framer Motion, used throughout for card animations)

**State Management (Peer Dependencies):**
- @reduxjs/toolkit 2.11.2 - Optional Redux integration (separate entry point `src/redux/index.ts`)
- react-redux 9.2.0 - Optional React-Redux bindings

**Infrastructure:**
- TypeScript compiler - Strict mode enabled, generates declarations
- Rollup (via Vite) - Multiple build formats: ESM, UMD

## Configuration

**Environment:**
- No `.env` files detected - library runs entirely client-side
- No external API keys or secrets required
- State persistence uses browser localStorage (see `src/context/persistence.ts`)

**Build:**
- `vite.config.ts` - Main ESM build (multi-entry)
- `vite.config.umd.ts` - UMD build for CDN usage
- `vitest.config.ts` - Test configuration with 80% coverage thresholds
- `tsconfig.json` - TypeScript compiler config (ES2020 target, strict mode, path aliases `@/*`)
- `eslint.config.js` - Flat config format with React, TypeScript, and a11y rules

**Package Exports:**
- Main entry: `./dist/card-components.js` (ESM) + `./dist/card-components.umd.cjs` (UMD)
- Redux entry: `./dist/card-components-redux.js` (ESM only)
- Styles: `./dist/card-components.css`
- Type definitions: `./dist/index.d.ts`

## Platform Requirements

**Development:**
- Node.js v23.11.0 (current environment)
- npm 10.9.2
- Modern browser with ES2020 support

**Production:**
- Browser environment (ES2020+)
- React 18.0.0+ or 19.0.0+ (peer dependency)
- Optional: @reduxjs/toolkit 2.0.0+ and react-redux 9.0.0+ for Redux integration

**Deployment:**
- Published as npm package: `@decentralized-games/card-components`
- Version: 1.0.0
- Repository: https://github.com/o2alexanderfedin/decentralized-card-games.git
- MIT License

**Bundle Size Limits:**
- Main bundle: 60 kB (enforced by size-limit)
- Redux bundle: 10 kB (enforced by size-limit)

---

*Stack analysis: 2026-02-04*
