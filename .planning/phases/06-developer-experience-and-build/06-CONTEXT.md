# Phase 6: Developer Experience & Build - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Build and distribute a production-ready React component library with interactive documentation, optimized builds, comprehensive developer guides, and npm distribution. This phase focuses on making the library discoverable, usable, and maintainable for external developers.

</domain>

<decisions>
## Implementation Decisions

### Storybook structure & examples
- Stories organized by use case (Getting Started/Layouts/Interactions/Games) — user journey focused
- Both static and interactive examples — start simple, progress to complex in each section
- All four addons included: Accessibility (a11y), Interactions, Docs, Viewport
- Redux integration approach: Claude's discretion (choose what helps Redux users best)

### Package distribution strategy
- Package name: `@decentralized-games/cards` — scoped to organization
- Monorepo with two packages — separate `@decentralized-games/cards` and `@decentralized-games/cards-redux`
- Semantic versioning (semver) — standard 1.0.0, 1.1.0, 2.0.0 with breaking changes bumping major
- No pre-release channels — stable releases only, use branches for testing
- Locked versions across packages in monorepo

### Documentation depth & format
- Separate docs site deployed to hosting platform
- Documentation framework: Docusaurus — React-based, versioned docs, search, i18n support
- API documentation: auto-generated from TypeScript + JSDoc, then manually curated with examples
- Required sections:
  - Getting Started guide (installation, first component, basic examples)
  - Migration guides (major version upgrade paths)
  - Recipes/cookbook (blackjack hand, poker table, solitaire layout patterns)
  - Architecture guide (design decisions, extension points, internal structure)

### Build optimization & DX
- Bundle size target: Feature-complete (<60kb core gzipped) — full feature set, size secondary
- Source maps: included in package for full debugging support
- Output formats: ESM + UMD + TypeScript definitions (.d.ts) — no CommonJS
- Developer conveniences:
  - Development warnings (runtime warnings for common mistakes)
  - Bundle size reporting (CI checks for unexpected growth)
  - Type-only imports optimization (prevent type imports from bloating runtime)
  - Inline CSS extraction (separate .css files for custom styling)

### Detailed developer's guide
- Guide covers: component composition, state management strategies, performance tips, testing strategies
- Includes multiple complete game implementations (poker, blackjack, solitaire)
- Dedicated troubleshooting section (common errors, debugging, performance, accessibility)
- Relationship to Storybook: Claude's discretion (choose best developer experience)

### Claude's Discretion
- Exact Storybook story structure within use case categories
- Whether to show Redux integration inline or in dedicated section
- How to best integrate written guide with Storybook (MDX pages vs separate site)
- Specific game choices for cookbook/recipes (beyond poker, blackjack, solitaire)
- CI/CD pipeline configuration
- Hosting platform choice for docs site (GitHub Pages, Vercel, Netlify, etc.)
- Monorepo tooling (Turborepo, Nx, pnpm workspaces, etc.)

</decisions>

<specifics>
## Specific Ideas

- Storybook should demonstrate real game interactions — not just static prop variations
- Use case organization (Getting Started → Layouts → Interactions → Games) should guide new developers through capability progression
- Docusaurus chosen specifically for versioned docs support (important for migration guides)
- Monorepo allows independent versioning if needed but defaults to locked versions for simplicity
- Recipe/cookbook section should show practical patterns developers can copy-paste-adapt
- Bundle size target (<60kb) prioritizes complete feature set — this is a comprehensive library, not a minimal utility
- Source maps in package improve debugging experience even at cost of larger download

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-developer-experience-and-build*
*Context gathered: 2026-02-04*
