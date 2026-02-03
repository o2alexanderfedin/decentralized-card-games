# Stack Research: React Card Component Library

**Domain:** React Component Library (Interactive Playing Cards)
**Researched:** 2026-02-02
**Confidence:** HIGH

## Executive Summary

The 2025 React component library ecosystem has standardized around Vite for build tooling, Vitest for testing, and TypeScript as a first-class citizen. For an interactive card component library with drag-and-drop and animations, dnd-kit and Motion (formerly Framer Motion) are the clear choices. This stack prioritizes developer experience, bundle size, and tree-shaking for library consumers.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| **React** | ^18.0 \|\| ^19.0 | UI Framework | Peer dependency range supports both major versions; React 19 ecosystem still maturing | HIGH |
| **TypeScript** | ^5.8 | Type Safety | Required for component library DX; generates .d.ts declarations for consumers | HIGH |
| **Vite** | ^7.3 | Build Tool & Dev Server | Native library mode, sub-second HMR, Rollup-based production builds | HIGH |
| **Redux Toolkit** | ^2.11 | State Management | Required per project constraint; RTK 2.x has excellent TS support, reduced boilerplate | HIGH |

### Build & Bundling

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| **Vite (Library Mode)** | ^7.3 | Production Bundler | Built-in library mode with ESM/CJS output; tree-shakeable by default | HIGH |
| **vite-plugin-dts** | ^4.5 | Type Declarations | Generates .d.ts from TS source; integrates with Vite build pipeline | HIGH |
| **Rollup** | (bundled with Vite) | Production Optimization | Vite uses Rollup internally; no separate config needed | HIGH |

### Animation & Interaction

| Library | Version | Purpose | Why Recommended | Confidence |
|---------|---------|---------|-----------------|------------|
| **Motion** | ^12.27 | Animations | Declarative React API; gestures, spring physics, layout animations; ~32KB gzipped | HIGH |
| **@dnd-kit/core** | ^6.3 | Drag & Drop | Modular ~10KB core; accessible; keyboard/touch/pointer support; no HTML5 DnD limitations | HIGH |
| **@dnd-kit/sortable** | ^10.0 | Sortable Lists | For card stacking/reordering; pairs with core | HIGH |

### Testing

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| **Vitest** | ^4.0 | Test Runner | 10x faster than Jest; native Vite integration; Jest-compatible API | HIGH |
| **@testing-library/react** | ^16.2 | Component Testing | User-centric testing; industry standard | HIGH |
| **@testing-library/user-event** | ^14.6 | Interaction Testing | Realistic user event simulation | HIGH |
| **jsdom** | ^26.0 | DOM Environment | Fast Node.js DOM simulation for unit tests | HIGH |

### Component Development

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| **Storybook** | ^10.2 | Component Workshop | Isolated development; visual testing; documentation | HIGH |
| **@storybook/react-vite** | ^10.2 | Vite Integration | Native Vite support; fast builds | HIGH |

### Code Quality

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| **ESLint** | ^9.20 | Linting | Flat config default; catches bugs; enforces consistency | HIGH |
| **typescript-eslint** | ^8.25 | TS Linting | Type-aware rules for TypeScript | HIGH |
| **eslint-plugin-react-hooks** | ^5.1 | Hooks Linting | Enforces Rules of Hooks | HIGH |
| **Prettier** | ^3.5 | Formatting | Consistent code style; ESLint integration | HIGH |
| **eslint-config-prettier** | ^10.0 | ESLint/Prettier Compat | Disables conflicting ESLint formatting rules | HIGH |

### Package Publishing

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| **changesets** | ^2.29 | Versioning | Semantic versioning; changelog generation; monorepo support | HIGH |
| **publint** | ^0.3 | Package Validation | Validates package.json exports; catches publishing mistakes | MEDIUM |

---

## Installation

```bash
# Core dependencies (will be peer dependencies in published library)
npm install react react-dom @reduxjs/toolkit react-redux

# Library dependencies
npm install motion @dnd-kit/core @dnd-kit/sortable

# Dev dependencies - Build
npm install -D vite vite-plugin-dts typescript @types/react @types/react-dom

# Dev dependencies - Testing
npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @vitest/coverage-v8

# Dev dependencies - Storybook
npm install -D storybook @storybook/react-vite @storybook/addon-essentials @storybook/addon-interactions

# Dev dependencies - Code Quality
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks eslint-config-prettier prettier

# Dev dependencies - Publishing
npm install -D @changesets/cli
```

---

## Configuration Templates

### vite.config.ts (Library Mode)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      rollupTypes: true  // Bundle all declarations into one file
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CardComponents',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', '@reduxjs/toolkit', 'react-redux'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    sourcemap: true
  }
})
```

### package.json (Dual ESM/CJS)

```json
{
  "name": "@your-scope/card-components",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.cjs"
      }
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src",
    "format": "prettier --write src",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "npm run build && changeset publish"
  }
}
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.stories.tsx', '**/test/**']
    }
  }
})
```

### eslint.config.js (Flat Config)

```javascript
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  {
    plugins: {
      react,
      'react-hooks': reactHooks
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off'
    },
    settings: {
      react: { version: 'detect' }
    }
  },
  prettier,
  {
    ignores: ['dist/**', 'storybook-static/**', '*.config.*']
  }
]
```

---

## Alternatives Considered

| Category | Recommended | Alternative | When to Use Alternative |
|----------|-------------|-------------|-------------------------|
| **Build Tool** | Vite | tsup | Simpler config for pure TS libs; lacks dev server and Storybook integration |
| **Build Tool** | Vite | Rollup (direct) | Maximum control over bundling; more configuration overhead |
| **Test Runner** | Vitest | Jest | React Native projects (mandatory); legacy codebases with Jest config investment |
| **Animation** | Motion | React Spring | Physics-first animations; lower-level control; no gesture support built-in |
| **Animation** | Motion | GSAP | Complex timeline sequences; non-React projects; requires refs (imperative) |
| **Drag & Drop** | dnd-kit | react-dnd | Need HTML5 DnD (file drops from desktop); existing codebase using it |
| **Drag & Drop** | dnd-kit | @hello-pangea/dnd | Kanban-style lists only; less customization needed |
| **State** | Redux Toolkit | Zustand | Simpler apps; project doesn't require Redux (but this project requires Redux) |
| **Styling** | CSS Modules | Tailwind CSS | Utility-first preference; larger projects with design system |
| **Styling** | CSS Modules | Vanilla Extract | Type-safe CSS-in-JS with zero runtime |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Create React App** | Deprecated; no library mode; slow builds | Vite |
| **Webpack** | Overly complex for libraries; slower than Vite | Vite (library mode) |
| **Jest** | 10x slower than Vitest; complex ESM config | Vitest |
| **react-beautiful-dnd** | Unmaintained by Atlassian since 2022 | @hello-pangea/dnd (fork) or dnd-kit |
| **styled-components / Emotion** | Runtime CSS-in-JS has hydration issues; RSC incompatible; adds bundle weight | CSS Modules or compile-time CSS-in-JS |
| **Enzyme** | Deprecated; not maintained for React 18+ | @testing-library/react |
| **Moment.js** | Huge bundle; deprecated | date-fns or native Date |
| **lodash (default)** | Not tree-shakeable | lodash-es or native methods |
| **React.PropTypes** | Deprecated; TypeScript provides better type checking | TypeScript interfaces |

---

## Stack Patterns by Variant

**If adding CSS styling to components:**
- Use CSS Modules (`.module.css`) for component-scoped styles
- Avoid runtime CSS-in-JS due to RSC compatibility and bundle size
- Because: Library consumers can override easily; no runtime cost

**If components need global theme support:**
- Export CSS custom properties (variables)
- Accept theme prop for runtime theming
- Because: Allows consumers to customize without forking

**If targeting React Native in future:**
- Abstract styling into platform-agnostic primitives
- Use StyleSheet patterns that translate
- Because: CSS Modules won't work in RN

---

## Version Compatibility Matrix

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Vite ^7.3 | React 18/19, TypeScript 5.x | Requires Node.js 20+ |
| Vitest ^4.0 | Vite ^7.0 | Must match Vite major version |
| Storybook ^10.2 | Vite 5+, React 18/19, Node 20+ | Auto-detects Vite config |
| Motion ^12.27 | React 18/19 | Replaces framer-motion package |
| @dnd-kit/core ^6.3 | React 18/19 | Peer dep: react ^16.8 \|\| ^17 \|\| ^18 \|\| ^19 |
| Redux Toolkit ^2.11 | React 18/19, TypeScript 5.x | Peer dep: react ^16.8 \|\| ^17 \|\| ^18 \|\| ^19 |
| ESLint ^9.20 | typescript-eslint ^8.x | Flat config only; no .eslintrc |

---

## React 19 Compatibility Notes

React 19.1 (released March 2025) is now stable, but some ecosystem packages lag in declaring peer dependency support. Current status:

| Package | React 19 Support | Notes |
|---------|------------------|-------|
| @testing-library/react | YES | v16.x supports React 19 |
| Motion | YES | Native support |
| @dnd-kit/core | YES | Works but may show peer dep warning |
| Redux Toolkit | YES | RTK 2.x fully supports React 19 |
| Storybook | YES | 10.x has React 19 support |

**Mitigation for peer dependency warnings:**
- Use pnpm or bun (no warnings)
- Or use `npm install --legacy-peer-deps` during development

---

## Rationale Summary

### Why Vite over tsup/Rollup direct?
Vite provides library mode with Rollup under the hood PLUS a dev server PLUS Storybook integration. tsup is faster for pure builds but lacks dev tooling. Direct Rollup is more config overhead for the same result.

### Why Vitest over Jest?
10x faster test execution, native ESM support, shared Vite config, Jest-compatible migration path. Jest only wins for React Native (mandatory) or teams with heavy Jest investment.

### Why dnd-kit over react-dnd?
Modular architecture (10KB core), accessible by default, better touch support, no HTML5 DnD API limitations. react-dnd only wins when you need native file drag-from-desktop.

### Why Motion over GSAP/React Spring?
Declarative React-first API, built-in gestures, layout animations, excellent DX. GSAP wins for complex timelines but requires imperative patterns. React Spring wins for physics-first needs but lacks gestures.

### Why CSS Modules over CSS-in-JS?
Zero runtime cost, RSC compatible, build-time optimization, easy consumer overrides. Runtime CSS-in-JS adds ~11KB+ and has hydration issues.

---

## Sources

### Official Documentation (HIGH confidence)
- [Vite Library Mode](https://vite.dev/guide/build.html) - v7.3.1 configuration
- [Vitest Guide](https://vitest.dev/guide/) - v4.0.17 testing setup
- [dnd-kit Documentation](https://docs.dndkit.com/) - Installation and core concepts
- [Storybook Installation](https://storybook.js.org/docs/get-started/install) - v10.2 requirements
- [Redux Toolkit](https://redux-toolkit.js.org/) - RTK 2.x features

### Package Registries (HIGH confidence)
- [Motion npm](https://www.npmjs.com/package/motion) - v12.27.0 current
- [@dnd-kit/core npm](https://www.npmjs.com/package/@dnd-kit/core) - v6.3.1 current
- [changesets npm](https://www.npmjs.com/package/@changesets/cli) - v2.29.7 current

### Community Resources (MEDIUM confidence)
- [Building React Component Library with Vite](https://victorlillo.dev/blog/react-typescript-vite-component-library)
- [Vitest vs Jest 2025](https://medium.com/@ruverd/jest-vs-vitest-which-test-runner-should-you-use-in-2025-5c85e4f2bda9)
- [Top React Drag and Drop Libraries 2025](https://dev.to/puckeditor/top-5-drag-and-drop-libraries-for-react-24lb)
- [React Animation Libraries 2025](https://dev.to/ciphernutz/top-react-animation-libraries-framer-motion-gsap-react-spring-and-more-4854)
- [ESLint v9 Flat Config for React](https://javascript.plainenglish.io/how-to-configure-eslint-v9-in-a-react-project-2025-guide-a86d893e1703)
- [Dual ESM/CJS Publishing](https://snyk.io/blog/building-npm-package-compatible-with-esm-and-cjs-2024/)

---

*Stack research for: React Playing Card Component Library*
*Researched: 2026-02-02*
