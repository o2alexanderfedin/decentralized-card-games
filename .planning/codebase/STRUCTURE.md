# Codebase Structure

**Analysis Date:** 2026-02-04

## Directory Layout

```
decentralized-card-games/
├── .planning/              # GSD planning artifacts (phases, codebase docs, todos)
├── .storybook/             # Storybook configuration
├── coverage/               # Test coverage reports (generated)
├── demo/                   # Demo/example files
├── dist/                   # Build output (generated)
├── node_modules/           # Dependencies (generated)
├── src/                    # Source code (main library)
│   ├── components/         # React components
│   ├── constants/          # Configuration and presets
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── redux/              # Redux Toolkit integration
│   ├── state/              # Pure state management
│   ├── styles/             # Global styles
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Pure utility functions
│   └── index.ts            # Main library entry point
├── storybook-static/       # Built Storybook (generated)
├── package.json            # NPM package manifest
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite ESM build config
├── vite.config.umd.ts      # Vite UMD build config
└── vitest.config.ts        # Test configuration
```

## Directory Purposes

**`src/`:**
- Purpose: Main source code directory
- Contains: All library implementation code
- Key files: `index.ts` (public API), `test-setup.ts` (test utilities), `css-modules.d.ts` (CSS typing)

**`src/components/`:**
- Purpose: React component implementations
- Contains: 10 component directories, each with Component.tsx, Component.types.ts, Component.test.tsx, Component.stories.tsx, Component.module.css, index.ts
- Key files: Component-specific implementations (Card, Hand, Deck, CardStack, DropZone, DraggableCard, CardDragOverlay, DroppableZone, CardDndProvider, StatefulCardDndProvider)

**`src/types/`:**
- Purpose: TypeScript type definitions and type guards
- Contains: Type files for domain concepts
- Key files: `card.ts` (CardData, Suit, Rank), `dnd.ts` (DragItemData, callbacks), `containers.ts` (container component types), `index.ts` (barrel export)

**`src/state/`:**
- Purpose: Framework-agnostic state management (pure reducer)
- Contains: GameState types, pure reducer, action creators, selectors
- Key files: `reducer.ts` (pure gameReducer), `actions.ts` (action creators), `selectors.ts` (state selectors), `types.ts` (GameState, GameAction), `initialState.ts` (factory)

**`src/redux/`:**
- Purpose: Redux Toolkit integration (optional dependency)
- Contains: Redux slice wrapping pure reducer with Immer
- Key files: `slice.ts` (RTK createSlice), `ReduxGameProvider.tsx` (provider), `selectors.ts` (Redux selectors), `store.ts` (store factory)

**`src/context/`:**
- Purpose: React Context state provider (no Redux)
- Contains: Context provider using useReducer
- Key files: `GameProvider.tsx` (Context provider), `GameContext.ts` (context definition), `persistence.ts` (localStorage helpers)

**`src/hooks/`:**
- Purpose: Reusable React hooks
- Contains: 23+ custom hooks for animation, layout, DnD, state, accessibility
- Key files: `useCardFlip.ts`, `useContainerSize.ts`, `useDragSensors.ts`, `useStateBackend.ts`, `useGameState.ts`, `useRovingTabIndex.ts`, `useKeyboardShortcuts.ts`, `useDraggableCard.ts`, `useDroppableZone.ts`, `index.ts` (barrel export)

**`src/constants/`:**
- Purpose: Immutable configuration values
- Contains: Presets and lookup tables
- Key files: `suits.ts` (SUIT_EMOJI, SUIT_COLORS), `animations.ts` (SPRING_PRESETS, PERSPECTIVE_VALUES), `layouts.ts` (FAN_PRESETS, LAYOUT_DEFAULTS)

**`src/utils/`:**
- Purpose: Pure utility functions
- Contains: Layout calculators, accessibility formatters
- Key files: `layout.ts` (calculateFanLayout, calculateSpreadLayout, calculateStackLayout), `a11y.ts` (formatCardForSpeech, formatCardLabel), `index.ts` (barrel export)

**`src/styles/`:**
- Purpose: Global CSS styles
- Contains: Global stylesheets (if any)
- Key files: Not extensively used (component-scoped CSS modules preferred)

**`.planning/`:**
- Purpose: GSD (Get Stuff Done) planning system
- Contains: `codebase/` (analysis docs), `phases/` (implementation plans), `todos/` (tasks), `milestones/`, `research/`
- Key files: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, etc.

**`.storybook/`:**
- Purpose: Storybook configuration
- Contains: Storybook setup files
- Key files: `main.ts` (Storybook config), `preview.tsx` (global decorators)

**`dist/`:**
- Purpose: Build output (generated, not committed)
- Contains: ESM and UMD bundles, TypeScript declarations, CSS
- Key files: `card-components.js` (ESM main), `card-components.umd.cjs` (UMD), `card-components-redux.js` (Redux submodule), `index.d.ts` (types), `card-components.css` (styles)

**`coverage/`:**
- Purpose: Test coverage reports (generated)
- Contains: HTML coverage reports, LCOV data
- Key files: `lcov-report/index.html`, `lcov.info`

## Key File Locations

**Entry Points:**
- `src/index.ts`: Main library public API
- `src/redux/index.ts`: Redux submodule entry point
- `index.html`: Vite dev server entry point
- `.storybook/main.ts`: Storybook entry point

**Configuration:**
- `package.json`: NPM package config, scripts, dependencies
- `tsconfig.json`: TypeScript compiler options (strict mode)
- `vite.config.ts`: ESM build config (multi-entry)
- `vite.config.umd.ts`: UMD build config (single-entry)
- `vitest.config.ts`: Test runner config
- `eslint.config.js`: ESLint rules
- `.gitignore`: Git exclusions

**Core Logic:**
- `src/state/reducer.ts`: Pure game state reducer (framework-agnostic)
- `src/components/Card/Card.tsx`: Main card component
- `src/components/CardDndProvider/CardDndProvider.tsx`: Drag-and-drop provider
- `src/hooks/useStateBackend.ts`: State management strategy abstraction

**Testing:**
- `src/test-setup.ts`: Vitest global setup
- `src/**/*.test.tsx`: Co-located component tests
- `src/**/*.test.ts`: Co-located hook/utility tests

## Naming Conventions

**Files:**
- **Components**: PascalCase (e.g., `Card.tsx`, `CardDndProvider.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useCardFlip.ts`, `useStateBackend.ts`)
- **Types**: PascalCase with `.types.ts` suffix (e.g., `Card.types.ts`, `DraggableCard.types.ts`)
- **Tests**: Match source file with `.test.ts` or `.test.tsx` suffix (e.g., `Card.test.tsx`, `useCardFlip.test.ts`)
- **Stories**: Match component with `.stories.tsx` suffix (e.g., `Card.stories.tsx`)
- **CSS Modules**: Match component with `.module.css` suffix (e.g., `Card.module.css`)
- **Utilities/Constants**: camelCase (e.g., `layout.ts`, `suits.ts`, `a11y.ts`)
- **Index files**: `index.ts` (barrel exports)

**Directories:**
- **Components**: PascalCase (e.g., `Card/`, `DraggableCard/`, `StatefulCardDndProvider/`)
- **Non-components**: camelCase (e.g., `hooks/`, `utils/`, `constants/`)

## Where to Add New Code

**New Card Component:**
- Primary code: `src/components/NewComponent/NewComponent.tsx`
- Types: `src/components/NewComponent/NewComponent.types.ts`
- Styles: `src/components/NewComponent/NewComponent.module.css`
- Tests: `src/components/NewComponent/NewComponent.test.tsx`
- Stories: `src/components/NewComponent/NewComponent.stories.tsx`
- Index: `src/components/NewComponent/index.ts`
- Export: Add to `src/components/index.ts` and `src/index.ts`

**New Hook:**
- Implementation: `src/hooks/useNewHook.ts`
- Tests: `src/hooks/useNewHook.test.ts`
- Export: Add to `src/hooks/index.ts` and `src/index.ts`

**New Utility Function:**
- Implementation: `src/utils/newUtil.ts`
- Tests: `src/utils/newUtil.test.ts`
- Export: Add to `src/utils/index.ts` and `src/index.ts`

**New Type:**
- Definition: `src/types/newType.ts`
- Tests: `src/types/newType.test.ts` (if type guards present)
- Export: Add to `src/types/index.ts` and `src/index.ts`

**New Game Action:**
- Action type: Add to `src/state/types.ts` (GameAction union)
- Action creator: Add to `src/state/actions.ts`
- Reducer case: Add to `src/state/reducer.ts` (pure) and `src/redux/slice.ts` (Immer)
- Selector: Add to `src/state/selectors.ts` (if needed)
- Export: Add to `src/state/index.ts` and `src/index.ts`

**New Constant/Preset:**
- Definition: `src/constants/newConstants.ts`
- Tests: `src/constants/newConstants.test.ts`
- Export: Add to `src/constants/index.ts` and `src/index.ts`

**Documentation:**
- Planning docs: `.planning/codebase/` (codebase analysis)
- Phase plans: `.planning/phases/XX-phase-name/` (implementation plans)
- README: `README.md` (project overview)
- CLAUDE.md: `CLAUDE.md` (Claude AI instructions)

## Special Directories

**`src/components/Card/layouts/`:**
- Purpose: Alternative card face layouts (future extensibility)
- Generated: No
- Committed: Yes

**`dist/`:**
- Purpose: Build output for NPM distribution
- Generated: Yes (via `npm run build`)
- Committed: No (gitignored)

**`coverage/`:**
- Purpose: Test coverage HTML reports
- Generated: Yes (via `npm run test:coverage`)
- Committed: No (gitignored)

**`storybook-static/`:**
- Purpose: Built Storybook for deployment
- Generated: Yes (via `npm run build-storybook`)
- Committed: No (gitignored)

**`node_modules/`:**
- Purpose: Installed dependencies
- Generated: Yes (via `npm install`)
- Committed: No (gitignored)

**`.planning/`:**
- Purpose: GSD planning system artifacts
- Generated: Manually by Claude/developers during planning
- Committed: Yes (planning is part of project history)

**`.git/`:**
- Purpose: Git version control metadata
- Generated: Yes (git operations)
- Committed: N/A (Git internal)

## Component Directory Pattern

Each component follows a consistent structure:

```
ComponentName/
├── ComponentName.tsx           # Component implementation
├── ComponentName.types.ts      # TypeScript types/interfaces
├── ComponentName.module.css    # Scoped styles
├── ComponentName.test.tsx      # Unit/integration tests
├── ComponentName.stories.tsx   # Storybook stories
└── index.ts                    # Barrel export
```

**Example** (`src/components/Card/`):
- `Card.tsx` (main component)
- `CardFace.tsx` (sub-component)
- `CardBack.tsx` (sub-component)
- `Card.types.ts` (CardProps, CardRef, CardClickData)
- `Card.module.css` (scoped styles)
- `Card.test.tsx` (component tests)
- `Card.stories.tsx` (Storybook documentation)
- `index.ts` (exports Card, CardFace, CardBack)
- `layouts/` (subdirectory for alternate layouts)

---

*Structure analysis: 2026-02-04*
