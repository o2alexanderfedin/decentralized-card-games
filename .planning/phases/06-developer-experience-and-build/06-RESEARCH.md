# Phase 6: Developer Experience & Build - Research

**Researched:** 2026-02-04
**Domain:** React component library build, documentation, and distribution
**Confidence:** HIGH

## Summary

Phase 6 transforms the existing `@decentralized-games/card-components` library (Phases 1-5 complete, 435 passing tests, 31 test files) into a production-ready, distributable package. The work divides into six areas: (1) Storybook interactive documentation, (2) headless hooks for DnD/flip, (3) CSS variable theming system, (4) build optimization (ESM + UMD + tree-shaking), (5) linting/coverage enforcement, and (6) bundle size monitoring. A secondary effort establishes a monorepo structure with pnpm workspaces to separate `@decentralized-games/cards` and `@decentralized-games/cards-redux`, plus a Docusaurus documentation site.

The existing codebase already has a functioning multi-entry Vite library build producing ESM + CJS with vite-plugin-dts for type generation, CSS Modules for component styling, and partial CSS custom properties on the Card component. The gap analysis shows: no Storybook, no ESLint config, no coverage provider installed, no `sideEffects` field in package.json, no UMD output, and no bundle size monitoring.

**Primary recommendation:** Use Storybook 8.x (not 10.x which is too new) with `@storybook/react-vite` for interactive documentation, ESLint 9 flat config with `eslint-plugin-jsx-a11y` for linting, `@vitest/coverage-v8` for coverage enforcement, `size-limit` with `@size-limit/preset-small-lib` for bundle size monitoring, and pnpm workspaces for the monorepo structure. Transition build output from ESM/CJS to ESM/UMD per the CONTEXT.md decision.

## Standard Stack

### Core (New Dependencies for Phase 6)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `storybook` | ^8.5 | Component workshop CLI | Latest stable 8.x line; well-tested with Vite; 10.x too new for production |
| `@storybook/react-vite` | ^8.5 | Storybook framework adapter | Uses existing vite.config.ts; CSS Modules work out of the box |
| `@storybook/addon-essentials` | ^8.5 | Docs, viewport, controls, actions | Bundled addons covering DX-01 requirements |
| `@storybook/addon-a11y` | ^8.5 | Accessibility panel in Storybook | Runs axe-core on stories; matches Phase 5 a11y work |
| `@storybook/addon-interactions` | ^8.5 | Play function testing in Storybook | Interactive story testing for DnD and flip demos |
| `@vitest/coverage-v8` | ^3.0 | V8 coverage provider for Vitest | Must match Vitest 3.x major; AST-based remapping since v3.2.0 |
| `eslint` | ^9.20 | JavaScript/TypeScript linter | Flat config format; required for BUILD-05 |
| `typescript-eslint` | ^8.25 | TypeScript ESLint integration | Type-aware linting rules |
| `eslint-plugin-react` | latest | React-specific lint rules | JSX best practices |
| `eslint-plugin-react-hooks` | ^5.1 | Hooks lint rules | Rules of Hooks enforcement |
| `eslint-plugin-jsx-a11y` | ^6.10 | Accessibility lint rules | WCAG compliance in JSX; supports flat config via `flatConfigs.recommended` |
| `size-limit` | ^11.0 | Bundle size monitoring | Accurate dependency analysis; esbuild-powered; CI-friendly |
| `@size-limit/preset-small-lib` | ^11.0 | Size Limit preset for libraries | Uses esbuild for fast size checks; appropriate for <60kb library |

### Supporting (Monorepo & Docs - Future Plans)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `pnpm` | ^9.x | Package manager with workspaces | Required for monorepo structure per CONTEXT decision |
| `docusaurus` | ^3.x | Documentation site framework | Versioned docs, MDX support, React-native; per CONTEXT decision |
| `@changesets/cli` | ^2.29 | Semantic versioning and changelog | Package publishing workflow |
| `publint` | ^0.3 | Package.json exports validation | Pre-publish check for correct exports |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Storybook 8.x | Storybook 10.x | 10.x is very new (Feb 2026); ecosystem addons may lag; 8.5 is battle-tested |
| size-limit | bundlesize | bundlesize is simpler but less accurate; size-limit uses real bundler (esbuild) for dependency analysis |
| pnpm workspaces | Turborepo/Nx | pnpm workspaces is sufficient for 2-3 packages; Turbo/Nx add complexity for minimal benefit here |
| ESLint flat config | Legacy .eslintrc | ESLint 9 defaults to flat config; .eslintrc is deprecated |
| Docusaurus | Starlight/VitePress | Docusaurus is locked decision per CONTEXT; React-based, versioned docs |

**Installation (new dev dependencies):**
```bash
# Storybook (use init for scaffolding, then verify addons)
npx storybook@8 init --type react_vite

# Coverage
npm install -D @vitest/coverage-v8

# ESLint ecosystem
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y globals

# Bundle size monitoring
npm install -D size-limit @size-limit/preset-small-lib
```

## Architecture Patterns

### Recommended Project Structure (Phase 6 additions)

```
.storybook/
├── main.ts              # Storybook config (framework, addons, stories glob)
├── preview.ts           # Global decorators, parameters, CSS imports
└── manager.ts           # Storybook UI customization (optional)

src/
├── components/
│   ├── Card/
│   │   ├── Card.tsx
│   │   ├── Card.module.css
│   │   ├── Card.test.tsx
│   │   └── Card.stories.tsx    # NEW: co-located stories
│   ├── Hand/
│   │   └── Hand.stories.tsx    # NEW
│   └── ...
├── hooks/
│   ├── useCardFlip.ts          # EXISTS: already a "headless hook" (DX-02)
│   ├── useDragSensors.ts       # EXISTS
│   └── useDroppableCard.ts     # NEW: headless DnD hook if needed
├── styles/
│   └── variables.css           # NEW: CSS custom property tokens (DX-03)
└── index.ts                    # Existing barrel exports

eslint.config.js                # NEW: ESLint flat config (BUILD-05)
```

### Pattern 1: Storybook Story Organization (Use-Case Focused)

**What:** Organize stories by developer journey, not component hierarchy
**When to use:** Per CONTEXT decision - Getting Started > Layouts > Interactions > Games

```typescript
// Source: Storybook CSF3 format + CONTEXT decisions
// src/components/Card/Card.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Getting Started/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A single playing card that can flip, be selected, and respond to clicks.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const AceOfSpades: Story = {
  args: {
    card: 'A♠',
    isFaceUp: true,
  },
};

export const FaceDown: Story = {
  args: {
    card: 'A♠',
    isFaceUp: false,
  },
};

export const FlipAnimation: Story = {
  args: {
    card: 'K♥',
    isFaceUp: true,
    spring: 'bouncy',
  },
};
```

### Pattern 2: CSS Custom Property Theming System (DX-03)

**What:** Expose all visual tokens as CSS custom properties consumers can override
**When to use:** Every component that has visual styling should use CSS variables

```css
/* src/styles/variables.css - Global token definitions */
:root {
  /* Card tokens */
  --card-bg: #ffffff;
  --card-back-bg: linear-gradient(135deg, #1a365d 0%, #2d4a7c 100%);
  --card-border-radius: 8px;
  --card-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  --card-shadow-hover: 0 4px 8px rgba(0, 0, 0, 0.3);
  --card-perspective: 1000px;
  --card-padding: 0.5em;

  /* Suit colors (two-color scheme) */
  --suit-red: #cc0000;
  --suit-black: #000000;

  /* Container tokens */
  --deck-badge-bg: #1a365d;
  --deck-badge-color: white;
  --empty-border-color: rgba(0, 0, 0, 0.15);
  --dropzone-active-border: rgba(59, 130, 246, 0.5);

  /* Focus tokens */
  --focus-ring-offset: 2px;
  --selected-shadow: 0 0 0 3px rgba(34, 197, 94, 0.6);
}
```

```css
/* Consumer override example */
.dark-theme {
  --card-bg: #2d2d2d;
  --card-back-bg: linear-gradient(135deg, #4a0e0e 0%, #6b1a1a 100%);
  --suit-red: #ff6666;
  --suit-black: #e0e0e0;
  --deck-badge-bg: #8b0000;
}
```

### Pattern 3: ESLint Flat Config with jsx-a11y (BUILD-05)

**What:** Modern ESLint 9 configuration with accessibility rules
**When to use:** Project-wide linting

```javascript
// eslint.config.js
// Source: eslint-plugin-jsx-a11y official docs (flatConfigs.recommended)
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
    settings: { react: { version: 'detect' } },
  },
  {
    ignores: ['dist/**', 'storybook-static/**', '*.config.*', 'node_modules/**'],
  },
];
```

### Pattern 4: Vite UMD Build Configuration (BUILD-01, BUILD-02)

**What:** Transition from ESM+CJS to ESM+UMD per CONTEXT decision
**When to use:** Library build configuration

```typescript
// vite.config.ts - Updated for UMD output
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.stories.tsx'],
    }),
  ],
  build: {
    lib: {
      entry: {
        'card-components': resolve(__dirname, 'src/index.ts'),
        'card-components-redux': resolve(__dirname, 'src/redux/index.ts'),
      },
      // Note: UMD requires 'name' per entry. Multi-entry with UMD may require
      // separate build passes or rollup output configuration.
      formats: ['es', 'umd'],
      name: 'CardComponents',
    },
    rollupOptions: {
      external: [
        'react', 'react-dom', 'react/jsx-runtime',
        'motion', 'motion/react',
        '@dnd-kit/core', '@dnd-kit/utilities', '@dnd-kit/modifiers',
        '@reduxjs/toolkit', 'react-redux',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          motion: 'motion',
          'motion/react': 'motionReact',
          '@dnd-kit/core': 'DndKitCore',
          '@dnd-kit/utilities': 'DndKitUtilities',
          '@dnd-kit/modifiers': 'DndKitModifiers',
          '@reduxjs/toolkit': 'RTK',
          'react-redux': 'ReactRedux',
        },
      },
    },
    sourcemap: true,
  },
});
```

**IMPORTANT NOTE on UMD + multi-entry:** Vite defaults to `['es', 'cjs']` when multiple entries are used. UMD requires a single `name` global, which is problematic with multiple entry points. The recommended approach is either:
1. Build each entry separately (two build passes), OR
2. Use `['es', 'umd']` with a single main entry and keep redux as ESM-only, OR
3. Use rollup `output` array with different configs per entry.

This is a critical implementation detail the planner must resolve.

### Pattern 5: Coverage Configuration (BUILD-04)

**What:** Vitest coverage with v8 provider and >80% threshold enforcement
**When to use:** Vitest configuration

```typescript
// vitest.config.ts - Updated with coverage
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/**/index.ts',        // barrel files
        'src/test-setup.ts',
        'src/css-modules.d.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

### Pattern 6: Bundle Size Monitoring (BUILD-06)

**What:** Enforce bundle size limits in CI and development
**When to use:** After build, as part of test/CI pipeline

```json
// package.json additions
{
  "size-limit": [
    {
      "path": "dist/card-components.js",
      "limit": "60 kB"
    },
    {
      "path": "dist/card-components-redux.js",
      "limit": "10 kB"
    },
    {
      "path": "dist/card-components.css",
      "limit": "5 kB"
    }
  ],
  "scripts": {
    "size": "size-limit",
    "size:why": "size-limit --why"
  }
}
```

### Anti-Patterns to Avoid

- **Don't use Storybook 10.x yet:** It was just released and addon ecosystem hasn't caught up. Storybook 8.5 is battle-tested and has full addon support.
- **Don't use preserveModules with UMD:** Rollup's `preserveModules` is incompatible with UMD format. Use multi-entry approach instead.
- **Don't set `sideEffects: false` without `["**/*.css"]`:** CSS imports have side effects; setting `false` without the CSS exception will cause consumers' bundlers to tree-shake away CSS.
- **Don't use `@vitest/coverage-v8` version 4.x:** The project uses Vitest 3.x; coverage provider version must match the major version.
- **Don't inline CSS into JS chunks:** Keep CSS as separate files. The CONTEXT specifies "Inline CSS extraction (separate .css files for custom styling)."

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Coverage reporting | Custom test scripts counting lines | `@vitest/coverage-v8` with thresholds | V8 native coverage is accurate; AST-based remapping since v3.2.0 |
| Bundle size monitoring | `ls -la dist/` or manual checks | `size-limit` with `@size-limit/preset-small-lib` | Automated, CI-friendly, includes dependency analysis with `--why` |
| Package.json validation | Manual checking exports fields | `publint` | Catches common publishing mistakes (missing types, wrong paths) |
| Accessibility linting | Manual WCAG checklist review | `eslint-plugin-jsx-a11y` flat config | 57+ rules covering WCAG; catches issues at author time |
| Storybook type inference | Manual arg types in stories | `tags: ['autodocs']` + react-docgen | Auto-generates prop documentation from TypeScript types |
| CSS variable documentation | README listing all variables | Storybook controls panel | Variables become interactive when components use them with args |

**Key insight:** The build/DX tooling ecosystem for React component libraries is mature. Every requirement in this phase maps to a well-maintained, standard tool. The implementation risk is in configuration and integration, not in choosing tools.

## Common Pitfalls

### Pitfall 1: UMD + Multi-Entry Incompatibility
**What goes wrong:** Vite defaults to `['es', 'cjs']` for multi-entry builds. Switching to `['es', 'umd']` fails because UMD requires a single global `name`, but you have two entries (`card-components` and `card-components-redux`).
**Why it happens:** UMD wraps the entire bundle in a single IIFE with one global variable. Two entries would need two globals.
**How to avoid:** Either (a) separate the builds into two passes using a build script, (b) keep redux entry as ESM-only since redux users are always in a module bundler context, or (c) configure rollup `output` as an array with different settings per format.
**Warning signs:** Build errors about missing `name` field, or unexpected single-file output.

### Pitfall 2: sideEffects Misconfiguration
**What goes wrong:** Setting `"sideEffects": false` without listing CSS causes consumer bundlers (Webpack, Next.js) to tree-shake away all CSS imports, resulting in unstyled components.
**Why it happens:** CSS imports are side effects (they register styles globally). Bundlers trust the `sideEffects` field.
**How to avoid:** Use `"sideEffects": ["**/*.css"]` in package.json. This tells bundlers "only CSS imports have side effects; everything else is tree-shakeable."
**Warning signs:** Components render but have no styles in consumer apps.

### Pitfall 3: Storybook Version Mismatch with Addons
**What goes wrong:** Installing Storybook 10.x but addons are only compatible with 8.x, or vice versa.
**Why it happens:** Storybook 10 was recently released; some community addons haven't been updated.
**How to avoid:** Pin to Storybook 8.5.x ecosystem. Use `npx storybook@8 init` (not `@latest`).
**Warning signs:** Addon loading errors, missing panels, webpack/vite configuration conflicts.

### Pitfall 4: Coverage Provider Version Mismatch
**What goes wrong:** Installing `@vitest/coverage-v8@4.x` with `vitest@3.x` causes runtime errors.
**Why it happens:** Coverage provider must match Vitest major version.
**How to avoid:** Install `@vitest/coverage-v8@^3.0` to match current `vitest@^3.0` in package.json.
**Warning signs:** Error: "Cannot find dependency '@vitest/coverage-v8'" (current state of project).

### Pitfall 5: CSS Modules Class Names in Storybook
**What goes wrong:** CSS Module class names appear as `undefined` in Storybook.
**Why it happens:** Storybook's webpack builder doesn't process CSS Modules by default.
**How to avoid:** Use `@storybook/react-vite` (not webpack-based framework). Vite handles CSS Modules natively. The existing project already uses Vite, so this works automatically.
**Warning signs:** Components render but have no styling in Storybook.

### Pitfall 6: CSS Custom Properties Not Reaching Components in CSS Modules
**What goes wrong:** Defining `:root` CSS variables in a separate file but they don't reach CSS Module scoped selectors.
**Why it happens:** CSS Modules scope class names but CSS custom properties inherit through the DOM (not CSS Module scope). The variables file must be loaded globally.
**How to avoid:** Import the variables.css file in Storybook's preview.ts and ensure it's included in the library's CSS output. CSS custom properties cascade through DOM inheritance, so `:root` variables always reach scoped components.
**Warning signs:** Default values shown; theme overrides don't apply.

### Pitfall 7: Monorepo Migration Breaking Existing Imports
**What goes wrong:** Restructuring into a monorepo changes the package name and internal paths, breaking all existing consumer imports.
**Why it happens:** CONTEXT specifies renaming from `@decentralized-games/card-components` to `@decentralized-games/cards`.
**How to avoid:** This is a breaking change. Plan it as the last step, with clear migration documentation. Consider keeping the old package name as a deprecated re-export.
**Warning signs:** Consumer projects fail to resolve imports after upgrade.

## Code Examples

### Storybook Interactive Story with Play Function (DX-01)

```typescript
// Source: Storybook docs - Interaction Testing
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Interactions/Card Flip',
  component: Card,
};
export default meta;

type Story = StoryObj<typeof Card>;

export const ClickToFlip: Story = {
  args: {
    card: 'A♠',
    isFaceUp: false,
    interactive: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole('button');
    await userEvent.click(card);
    // Verify the card flipped (visual check in Storybook)
  },
};
```

### Headless Hook Pattern (DX-02)

```typescript
// The existing useCardFlip hook IS a headless hook (DX-02 already partial).
// DraggableCard and DroppableZone use dnd-kit hooks internally.
// DX-02 asks for: useDraggableCard, useDroppableZone, useCardFlip
// useCardFlip: EXISTS and is exported
// useDraggableCard: Thin wrapper exposing dnd-kit's useDraggable + card-specific data
// useDroppableZone: Thin wrapper exposing dnd-kit's useDroppable + zone validation

// Example: useDraggableCard headless hook
import { useDraggable } from '@dnd-kit/core';
import type { CardData } from '../types';

export interface UseDraggableCardOptions {
  id: string;
  card: CardData;
  sourceZoneId?: string;
  disabled?: boolean;
}

export function useDraggableCard({ id, card, sourceZoneId, disabled }: UseDraggableCardOptions) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { type: 'card', card, sourceZoneId } satisfies DragItemData,
    disabled,
  });

  return {
    ref: setNodeRef,
    dragAttributes: attributes,
    dragListeners: listeners,
    transform,
    isDragging,
  };
}
```

### Package.json Exports with Subpath Imports (DX-06)

```json
{
  "name": "@decentralized-games/cards",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/card-components.js",
      "require": "./dist/card-components.umd.cjs"
    },
    "./redux": {
      "types": "./dist/redux/index.d.ts",
      "import": "./dist/card-components-redux.js",
      "require": "./dist/card-components-redux.umd.cjs"
    },
    "./styles": {
      "import": "./dist/card-components.css",
      "require": "./dist/card-components.css"
    },
    "./styles/variables": {
      "import": "./dist/variables.css",
      "require": "./dist/variables.css"
    }
  },
  "sideEffects": ["**/*.css"],
  "files": ["dist"]
}
```

### Storybook Configuration for This Project

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    defaultName: 'Documentation',
  },
};

export default config;
```

```typescript
// .storybook/preview.ts
import type { Preview } from '@storybook/react';

// Import global CSS variables for theming
import '../src/styles/variables.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // Run axe-core on all stories by default
      test: { enable: true },
    },
  },
};

export default preview;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Storybook 7 + Webpack | Storybook 8.5 + Vite builder | 2024 | Much faster builds; native CSS Module support |
| ESLint .eslintrc + extends | ESLint 9 flat config + TypeScript support | 2024-2025 | Simpler config; native TS config file support in 9.18+ |
| Jest + @jest/coverage | Vitest + @vitest/coverage-v8 | 2024-2025 | 10x faster; V8 native coverage with AST accuracy since v3.2 |
| bundlesize | size-limit with esbuild plugin | 2024-2025 | More accurate; esbuild-powered; `--why` dependency analysis |
| styled-components theming | CSS custom properties | 2023-2025 | Zero runtime; RSC compatible; cascading inheritance |
| Single package | Monorepo with pnpm workspaces | 2024-2025 | Standard for libraries with optional peer dependencies |
| npm publish | changesets + publint | 2024-2025 | Automated versioning, changelog, export validation |

**Deprecated/outdated:**
- **ESLint .eslintrc format:** Deprecated in ESLint 9; will be removed in ESLint 10
- **Storybook 6/7 with Webpack:** Vite builder is now the recommended default
- **bundlesize:** Maintenance has stalled; size-limit is actively maintained with better analysis
- **@storybook/addon-docs standalone:** Now included in `@storybook/addon-essentials`

## Open Questions

1. **UMD + Multi-Entry Build Strategy**
   - What we know: Vite defaults to `['es', 'cjs']` for multi-entry. UMD requires a single global name. CONTEXT specifies "ESM + UMD" output.
   - What's unclear: Best approach for producing UMD from two entry points.
   - Recommendation: Keep redux entry as ESM-only (redux users always use bundlers). Produce UMD only for the main entry. This avoids complexity and aligns with real-world usage. The planner should confirm this approach.

2. **Monorepo Migration Timing**
   - What we know: CONTEXT says "Monorepo with two packages -- separate `@decentralized-games/cards` and `@decentralized-games/cards-redux`". This is a significant structural change.
   - What's unclear: Whether to do the monorepo migration in Phase 6 or defer it (package rename is breaking).
   - Recommendation: Build Phase 6 features on the current single-package structure first. Monorepo migration should be the last plan in the phase, or a separate follow-up. The CONTEXT also mentions Docusaurus as a third package in the monorepo.

3. **Docusaurus Scope**
   - What we know: CONTEXT specifies Docusaurus for versioned docs with Getting Started guide, migration guides, recipes, and architecture guide.
   - What's unclear: Whether to scaffold Docusaurus in Phase 6 or create it as an empty shell for future content.
   - Recommendation: Scaffold Docusaurus with basic structure and Getting Started page. Full content is iterative and can grow post-phase.

4. **CSS Variables Scope of Refactoring**
   - What we know: Card component already has 5 CSS custom properties (`--card-perspective`, `--card-border-radius`, `--card-padding`, `--card-shadow`, `--card-shadow-hover`). Other components (Hand, Deck, DropZone, CardStack) use hardcoded values.
   - What's unclear: How extensive the refactoring needs to be -- extract every hardcoded color/size, or focus on key theming tokens?
   - Recommendation: Extract key theming tokens (colors, border radius, shadows, spacing, focus styles) from all components. Don't extract every internal measurement. Focus on values consumers would realistically want to customize.

5. **Storybook Version Pinning**
   - What we know: Storybook 10.x was just released. The initial stack research noted ^10.2. But 8.5 is the battle-tested line.
   - What's unclear: Whether 10.x has any blocking issues.
   - Recommendation: Use Storybook 8.5.x. It's the safe choice. If `npx storybook@latest init` installs 10.x, explicitly downgrade to 8.5. The planner should pin the version.

## Sources

### Primary (HIGH confidence)
- Vite Build Options (official docs) - Library mode, formats, CSS extraction
- Storybook React+Vite docs (storybook.js.org/docs/get-started/frameworks/react-vite) - Framework setup
- eslint-plugin-jsx-a11y GitHub (jsx-eslint/eslint-plugin-jsx-a11y) - Flat config support (`flatConfigs.recommended`)
- Vitest Coverage Guide (vitest.dev/guide/coverage.html) - V8 coverage, thresholds
- size-limit GitHub (ai/size-limit) - Library preset, esbuild plugin

### Secondary (MEDIUM confidence)
- ESLint 9 flat config tutorial (dev.to/aolyang) - Configuration patterns verified with official docs
- Storybook 8.5 blog (storybook.js.org/blog/storybook-8-5/) - a11y addon improvements
- CSS custom properties for React (joshwcomeau.com) - Theming patterns
- pnpm workspaces (pnpm.io/workspaces) - Monorepo configuration
- vite-plugin-lib-inject-css (GitHub) - Per-component CSS tree-shaking approach

### Tertiary (LOW confidence)
- Storybook 10.x compatibility with existing addons - Not fully verified; recent release
- Docusaurus 3 + React component library integration patterns - Based on community discussions, not official guidance

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All tools are well-established with official documentation
- Architecture: HIGH - Patterns derived from official docs and verified against codebase
- Pitfalls: HIGH - Based on known Vite/Storybook limitations documented in issue trackers
- Monorepo/Docusaurus: MEDIUM - Implementation details depend on project-specific decisions

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable ecosystem)
