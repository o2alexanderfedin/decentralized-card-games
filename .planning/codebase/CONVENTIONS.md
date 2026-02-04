# Coding Conventions

**Analysis Date:** 2026-02-04

## Naming Patterns

**Files:**
- React components: PascalCase with matching filename (`Card.tsx`, `Hand.tsx`, `CardDndProvider.tsx`)
- Type definitions: Component name + `.types.ts` suffix (`Card.types.ts`, `Hand.types.ts`)
- Tests: Component/module name + `.test.ts[x]` suffix (co-located with source)
- CSS Modules: Component name + `.module.css` suffix (`Card.module.css`)
- Stories: Component name + `.stories.tsx` suffix (`Card.stories.tsx`)
- Barrel exports: `index.ts` in each component directory
- Non-component modules: camelCase (`card.ts`, `animations.ts`, `a11y.ts`)

**Functions:**
- camelCase for all functions and methods
- Action creators: verb + noun (`moveCard`, `flipCard`, `dealStandardDeck`)
- Selectors: `select` prefix (`selectAllLocations`, `selectCardState`)
- Event handlers: `handle` prefix (`handleClick`, `handleKeyDown`)
- Formatters: `format` prefix (`formatCard`, `formatCardForSpeech`)
- Type guards: `is` prefix (`isSuit`, `isRank`)
- Calculation utilities: `calculate` prefix (`calculateFanLayout`)

**Variables:**
- camelCase for all variables
- Constants in UPPERCASE with underscores (`SPRING_PRESETS`, `SUIT_EMOJI`, `RANK_NAMES`)
- Boolean variables: `is`, `has`, or `should` prefix (`isControlled`, `faceUp`, `reducedMotion`)
- Refs: suffix with `Ref` (`cardRef`, `onFlipCompleteRef`, `staticRotateYRef`)

**Types:**
- PascalCase for interfaces and types (`CardData`, `GameState`, `HandProps`)
- Component props: Component name + `Props` suffix (`CardProps`, `HandProps`)
- Component ref types: Component name + `Ref` suffix (`CardRef`, `HandRef`)
- Hook return types: Hook name (camelCase) converted to PascalCase + `Return` (`UseCardFlipReturn`)
- Hook options: Hook name + `Options` (`UseCardFlipOptions`)
- Action types: Noun + `Action` suffix (`GameAction`)
- Payload types: Action name + `Payload` suffix (`MoveCardPayload`, `FlipCardPayload`)

## Code Style

**Formatting:**
- No explicit formatter config detected (no `.prettierrc`)
- Inferred style from codebase:
  - Indentation: 2 spaces
  - Quotes: Single quotes for strings
  - Semicolons: Always
  - Trailing commas: ES5 style
  - Line length: ~80-100 characters (not enforced)
  - Arrow functions: Parentheses around single parameters when types present

**Linting:**
- Tool: ESLint 9.x with flat config (`eslint.config.js`)
- Base configs: `@eslint/js`, `typescript-eslint/recommended`, `jsx-a11y/recommended`
- Plugins: `react`, `react-hooks`, `jsx-a11y`
- Key rules:
  - `react/react-in-jsx-scope`: off (React 19+ JSX transform)
  - `react/prop-types`: off (TypeScript used for type safety)
  - `react-hooks/rules-of-hooks`: error (enforced)
  - `react-hooks/exhaustive-deps`: warn
  - `@typescript-eslint/no-unused-vars`: warn with ignore pattern for `_` prefix
- Ignored paths: `dist/`, `storybook-static/`, `*.config.*`, `node_modules/`

**TypeScript:**
- Strict mode enabled (`tsconfig.json`)
- Target: ES2020
- Module: ESNext with bundler resolution
- JSX: `react-jsx` (automatic runtime)
- Path alias: `@/*` maps to `./src/*`
- Unused locals and parameters flagged as errors
- Source maps and declaration maps generated
- Tests excluded from compilation (`**/*.test.ts`, `**/*.test.tsx`)

## Import Organization

**Order:**
1. React and framework imports (`react`, `react-dom`, `motion/react`)
2. Third-party libraries (`@dnd-kit/*`, `@reduxjs/toolkit`)
3. Internal hooks (`../../hooks`)
4. Internal types (`../../types`, `./Card.types`)
5. Internal utilities (`../../utils`)
6. Internal components (`../Card`, `./CardFace`)
7. Constants (`../../constants`)
8. CSS modules (`./Card.module.css`)

**Path Aliases:**
- `@/*` available but rarely used (most imports are relative)
- Relative imports dominate: `../../hooks`, `../components`
- Barrel exports via `index.ts` in each directory

**Import Style:**
- Named imports preferred: `import { Card, Hand } from './components'`
- Type imports use `import type` syntax: `import type { CardData } from './types'`
- Default exports for components, named exports for utilities

## Error Handling

**Patterns:**
- **Guard clauses**: Early returns for invalid state
  ```typescript
  if (!cards || cardIndex < 0 || cardIndex >= cards.length) {
    return state;
  }
  ```
- **Null safety**: Functions return `null` for invalid input rather than throwing
  - `parseCard("xyz")` returns `null`, not exception
- **Type guards**: Used extensively (`isSuit`, `isRank`) to narrow types before use
- **Reducer safety**: Reducers return unchanged state reference for no-ops or invalid actions

**Error boundaries:**
- Not implemented at component level (library assumes consumer provides error boundaries)

## Logging

**Framework:** Console (no dedicated logging library)

**Patterns:**
- No logging in production code paths
- Logging reserved for development/debugging
- Callbacks used for instrumentation (`onFlipComplete`, `onFlipStart`)
- Consumer responsible for error reporting/monitoring

## Comments

**When to Comment:**
- File-level JSDoc for modules explaining purpose and key behaviors
- Function-level JSDoc for all public APIs (components, hooks, utilities)
- Inline comments for complex algorithms (e.g., Fisher-Yates shuffle in `src/state/reducer.ts`)
- Inline section dividers in long files (e.g., `// ---------------------------------------------------------------------------`)

**JSDoc/TSDoc:**
- Comprehensive JSDoc on all exported functions, components, and hooks
- Include `@param`, `@returns`, `@example` tags
- Component props documented in JSDoc above component definition
- Hook return types have JSDoc on interface fields
- Pattern:
  ```typescript
  /**
   * Hook for managing card flip animation state using Motion values.
   *
   * Uses `useSpring` and `useTransform` from Motion so that rotation
   * and opacity values update on the GPU without triggering React
   * re-renders during the animation (critical for 60 fps performance).
   *
   * @module useCardFlip
   */
  ```

**Inline comments:**
- Section dividers for major blocks within functions (e.g., `// Controlled / uncontrolled mode detection`)
- Explanation of non-obvious behavior (e.g., Motion value references, animation timing)
- Accessibility rationale (e.g., why reduced motion uses crossfade vs rotation)

## Function Design

**Size:**
- Components: 100-220 lines typical
- Hooks: 50-220 lines
- Utilities: 10-50 lines
- Reducers: Single reducer handles all actions (190 lines)

**Parameters:**
- Components: Props object destructured at function entry
- Hooks: Options object for multiple parameters (`UseCardFlipOptions`)
- Utilities: Positional parameters for simple functions (1-4 params)
- Optional parameters have defaults in destructuring: `colorScheme = 'two-color'`

**Return Values:**
- Components: JSX element
- Hooks: Object with named properties (`{ rotateY, frontOpacity, backOpacity, isAnimating }`)
- Utilities: Primitive or object (depends on purpose)
- Reducers: New state object (immutable updates)
- Type guards: Boolean

**Destructuring:**
- Props destructured at component/hook entry with defaults
- Unused parameters prefixed with `_` to satisfy linter

## Module Design

**Exports:**
- Components: Default export for component, named export from barrel `index.ts`
- Types: Named exports only
- Utilities: Named exports only
- Constants: Named exports only
- Pattern: Component defines exports, `index.ts` re-exports for consumers

**Barrel Files:**
- Every component directory has `index.ts` that re-exports component and types
- Main `src/index.ts` aggregates all public API exports
- Barrel files are lean (no logic, just re-export statements)

**Module Structure:**
```
src/
├── components/
│   ├── Card/
│   │   ├── Card.tsx              # Component implementation
│   │   ├── Card.types.ts         # Props, Ref, and data types
│   │   ├── Card.test.tsx         # Tests
│   │   ├── Card.module.css       # Styles
│   │   ├── Card.stories.tsx      # Storybook stories
│   │   └── index.ts              # Barrel export
│   └── index.ts                  # Components barrel
├── hooks/
│   ├── useCardFlip.ts            # Hook implementation
│   ├── useCardFlip.test.ts       # Hook tests
│   └── index.ts                  # Hooks barrel
├── types/
│   ├── card.ts                   # Core type definitions
│   ├── card.test.ts              # Type utility tests
│   └── index.ts                  # Types barrel
├── utils/
│   ├── a11y.ts                   # Utility functions
│   ├── a11y.test.ts              # Utility tests
│   └── index.ts                  # Utils barrel
└── index.ts                      # Main public API
```

## Special Patterns

**Controlled/Uncontrolled Mode:**
- Components support both modes (detected via presence of controlled prop)
- Uncontrolled mode: internal state with imperative ref API
- Controlled mode: parent manages state via props
- Pattern used in `src/components/Card/Card.tsx`, `src/components/Hand/Hand.tsx`

**Immutable State Updates:**
- All state updates use spread operator (no mutation)
- Reducer pattern: return new object references for changed state, same reference for no-ops
- Example: `return { ...state, locations: { ...state.locations, [location]: newCards } }`

**Motion Values:**
- Animation state lives in Motion values (not React state)
- Avoids re-renders during animation for 60fps performance
- Pattern: `useSpring` for animated values, `useTransform` for derived values
- Refs used to hold stable Motion value references across renders

**Type Safety:**
- Const assertions for arrays that become literal unions: `as const`
- Type guards for runtime validation before type narrowing
- Discriminated unions for action types (reducer pattern)
- Generic utilities typed with `<T>` when reusable across types

---

*Convention analysis: 2026-02-04*
