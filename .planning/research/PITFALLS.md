# Pitfalls Research

**Domain:** React Card Component Library (Interactive/Game-related)
**Researched:** 2026-02-02
**Confidence:** HIGH (verified across multiple authoritative sources)

## Critical Pitfalls

### Pitfall 1: Unnecessary Re-renders from Animation State

**What goes wrong:**
Animation state stored in React state triggers component re-renders on every frame (60+ times per second), causing severe performance degradation. A single missing `useCallback` can cause 47,000+ unnecessary component re-renders per minute.

**Why it happens:**
Developers naturally reach for `useState` to track animation progress, card positions, or drag coordinates. React's reconciliation process runs on every state change, even when the DOM output would be identical.

**How to avoid:**
- Use Motion Values (from Framer Motion) or refs for animation state - these update without triggering React renders
- Store mutable animation state in `useRef` to avoid triggering reconciliation on every frame
- Only use React state for values that should trigger UI updates
- Use `React.memo` and `useMemo`/`useCallback` to memoize expensive components and callbacks

**Warning signs:**
- Laggy card dragging or flip animations
- High CPU usage during animations (>15% for simple animations)
- React DevTools showing frequent re-renders during drag/animation
- Browser performance profile showing excessive "Recalculate Style" events

**Phase to address:**
Foundation/Core Architecture phase - animation state management patterns must be established before any interactive features are built

---

### Pitfall 2: Redux Store Coupling in Distributed Components

**What goes wrong:**
Component library ships with connected Redux components, forcing consumers to either adopt the library's Redux store structure or face conflicts with their own state management. Multiple component instances end up sharing state inappropriately.

**Why it happens:**
Connecting components directly to Redux makes development easier initially. The coupling only becomes apparent when consumers try to integrate with their own Redux stores or use multiple instances.

**How to avoid:**
- Ship non-connected components that receive data via props
- Provide optional Redux bindings as a separate package (`@library/redux`)
- Let consumers choose to connect components to their own store
- Use component-local state for UI state (hover, focus, animation)
- If Redux is needed internally, use a custom context instead of the default React-Redux context to avoid conflicts

**Warning signs:**
- Components require a specific Redux store shape to function
- Consumer apps crash when using their own Redux alongside the library
- Multiple card instances share state unexpectedly
- Error messages about context conflicts or missing providers

**Phase to address:**
Architecture phase - state management boundaries must be defined before component implementation

---

### Pitfall 3: Non-Tree-Shakeable Bundle Structure

**What goes wrong:**
Consumers import one component but get the entire 140kb+ library in their bundle. Tree shaking fails silently, and bundle bloat isn't discovered until production audits.

**Why it happens:**
- Library built with CommonJS (CJS) instead of ES Modules (ESM)
- Missing or incorrect `sideEffects: false` in package.json
- Rollup configured to bundle into single file (default behavior)
- Internal barrel exports (index.js re-exporting everything)

**How to avoid:**
- Build with ESM format and preserve module structure (`preserveModules: true` in Rollup)
- Set `sideEffects: false` in package.json (or list specific side-effect files)
- Use `module` field in package.json to point to ESM build
- Test tree-shaking with webpack-bundle-analyzer or similar tools
- Provide individual component imports: `import { Card } from '@lib/Card'`

**Warning signs:**
- Bundle analyzer shows entire library despite partial imports
- Vite transforming 1000+ modules when you only use a few components
- Consumer bundle size grows significantly after adding library
- Next.js apps importing full 140kb+ packages for single components

**Phase to address:**
Build/Distribution phase - but architecture must support it from Foundation phase (avoid circular dependencies, barrel exports)

---

### Pitfall 4: CSS Transform Animations Without GPU Acceleration

**What goes wrong:**
Card flip, drag, and stack animations cause visual jank, especially on mobile devices. Frame rates drop below 60fps during interactions, making the library feel sluggish.

**Why it happens:**
Animating properties like `width`, `height`, `top`, `left`, or `margin` triggers browser layout recalculation and repainting on every frame. These operations run on the main thread, competing with JavaScript execution.

**How to avoid:**
- Only animate `transform` and `opacity` - these are GPU-accelerated and bypass most of the rendering pipeline
- Use `translate3d()`, `scale()`, and `rotate()` instead of position properties
- Apply `will-change: transform` sparingly on elements about to animate
- Use CSS keyframe animations or Framer Motion's hardware-accelerated transforms
- Test animations with browser DevTools performance profiler

**Warning signs:**
- Animation code uses `top`, `left`, `width`, `height` instead of transforms
- Browser DevTools shows "Layout" or "Paint" events during animations
- Animations smooth on desktop but janky on mobile
- CPU usage spikes during card movements

**Phase to address:**
Foundation phase - establish animation utilities and patterns that enforce GPU-accelerated properties only

---

### Pitfall 5: Accessibility as Afterthought

**What goes wrong:**
Library ships without keyboard navigation, screen reader support, or focus management. Accessibility audit reveals dozens of WCAG violations, requiring extensive refactoring that breaks existing API.

**Why it happens:**
Accessibility is invisible during visual development. Interactive card games seem inherently visual, leading developers to deprioritize a11y. Issues only surface during formal audits or when users complain.

**How to avoid:**
- Use correct semantic HTML elements (buttons for actions, not divs with onClick)
- Implement keyboard navigation from the start (Tab, Enter, Space, Arrow keys)
- Add proper ARIA labels with context ("Next card" not just "Next")
- Don't hide visible content with `aria-hidden`
- Integrate eslint-plugin-jsx-a11y into CI pipeline
- Test with screen readers (VoiceOver, NVDA) during development
- Support `prefers-reduced-motion` media query for users who need reduced motion

**Warning signs:**
- Components use `<div onClick>` instead of `<button>`
- No `aria-label` on icon-only buttons
- Focus indicators removed for aesthetics
- Tab key doesn't navigate through interactive elements
- ARIA roles duplicating semantic HTML (role="table" on `<table>`)

**Phase to address:**
Foundation phase - accessibility patterns must be baked into base components; retrofitting is 10x harder

---

### Pitfall 6: Drag-and-Drop Performance with Many Elements

**What goes wrong:**
Performance degrades significantly when many cards are draggable or droppable. Dragging one card causes all other cards to re-render, creating visible lag.

**Why it happens:**
Drag-and-drop libraries like react-dnd and dnd-kit trigger re-renders on all draggable/droppable components when drag state changes. Without optimization, every position change re-renders dozens of components.

**How to avoid:**
- Use dnd-kit over react-dnd for better out-of-box performance
- Implement `shouldComponentUpdate` or wrap drag targets in `React.memo`
- Pass stable references (objects by ID) instead of dynamically-created arrays
- Use virtualization for long lists of cards (react-window, react-virtual)
- Batch position updates rather than updating on every mouse move

**Warning signs:**
- FPS drops when dragging with more than 20 cards visible
- All cards visibly re-render during drag (check with React DevTools)
- GitHub issues for your chosen DnD library mentioning >1000 drop target performance
- Drag preview lags behind cursor position

**Phase to address:**
Interactive Features phase - but architecture must anticipate this (component boundaries, memoization hooks)

---

### Pitfall 7: Cross-Platform Emoji Rendering Inconsistency

**What goes wrong:**
Card suits and values using emoji (e.g., spades, hearts) look completely different across Windows, macOS, iOS, and Android. Windows renders particularly ugly emoji, making the library look unprofessional.

**Why it happens:**
Emoji are Unicode characters rendered by the operating system's emoji font. Apple Color Emoji, Noto Color Emoji (Google), and Segoe UI Emoji (Windows) produce visually distinct results. There's no CSS way to standardize this.

**How to avoid:**
- Use Twemoji (Twitter's emoji library) for consistent cross-platform rendering
- Alternatively, use SVG or image assets for card symbols
- If using native emoji, document the inconsistency and make it configurable
- Provide a `renderSymbol` prop allowing consumers to override rendering
- Test on Windows specifically (worst emoji rendering)

**Warning signs:**
- QA reports that cards look different on Windows vs Mac
- Emoji appear as black-and-white symbols on some browsers
- Color schemes clash because emoji colors vary by platform
- Some emoji don't render at all on older systems

**Phase to address:**
Visual Design/Rendering phase - decide on emoji strategy before implementing card rendering

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `any` types in TypeScript | Faster development, bypasses errors | No type safety, runtime errors, poor DX for consumers | Never for exported APIs; prototyping only |
| Inline styles for animations | Quick to implement | Can't be overridden, no theming, bundle bloat from duplicates | Truly dynamic values only |
| Global CSS without namespacing | Simple styling | Conflicts with consumer CSS, unpredictable overrides | Never for distributed libraries |
| Skipping `sideEffects` flag | One less config to understand | Broken tree-shaking, bloated consumer bundles | Never |
| Using `React.FC` for all components | Team consistency | Implicit children prop, verbose, Kent C. Dodds advises against | Never - use explicit function types |
| Storing animation state in Redux | Single source of truth | 60fps re-renders through entire Redux cycle, massive perf hit | Never for frame-by-frame animation data |

## Integration Gotchas

Common mistakes when connecting to external services or consumer applications.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Consumer's Redux store | Expecting specific store shape | Ship non-connected components; let consumers connect |
| Consumer's CSS | Assuming CSS reset exists | Use CSS-in-JS or fully namespaced classes with fallback styles |
| Consumer's React version | Using hooks only available in React 18+ | Declare peer dependency range, test against minimum supported version |
| Consumer's bundler | Assuming webpack with specific config | Test with Vite, Rollup, and webpack; use standard package.json fields |
| Consumer's TypeScript | Shipping JS with separate .d.ts | Ship proper TypeScript with `"declaration": true`; ensure types match runtime |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Rendering all cards regardless of visibility | Slow initial render, high memory | Virtualize long lists with react-window | >50 cards in single container |
| Creating new objects in render | Components never memoize correctly | Move object creation outside render or use useMemo | Any memoized child components |
| Expensive selectors without memoization | Every state change recalculates derived data | Use Reselect or RTK's createSelector | Complex derived state with frequent updates |
| Animation on every CSS property | Janky animations, high CPU | Only animate transform/opacity | Any visible animations |
| Synchronous layout measurements | Forced reflows block main thread | Batch reads, then writes; use ResizeObserver | Frequent resize/position calculations |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Executing user-provided card data as code | XSS via card names/descriptions | Sanitize all user content; never use `dangerouslySetInnerHTML` with untrusted data |
| Storing game state in localStorage without validation | State tampering in multiplayer contexts | Validate all persisted state; consider signed state tokens |
| Exposing internal component state via refs | Consumers can manipulate internal state | Use `useImperativeHandle` to expose limited, documented API |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visual feedback during drag | Users unsure if drag registered | Immediate visual change (scale, shadow, cursor) |
| Animation duration too long | Interface feels sluggish | 150-300ms for micro-interactions; respect `prefers-reduced-motion` |
| Touch targets too small | Mobile users can't tap cards | Minimum 44x44px touch targets per WCAG |
| No undo for destructive actions | Frustration from accidental moves | Provide undo capability or confirmation for irreversible actions |
| Missing loading states | Users think UI is broken | Skeleton cards or spinners during async operations |
| Focus trap in modals | Keyboard users stuck | Proper focus management; return focus on close |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Drag-and-drop:** Often missing keyboard accessibility (Arrow keys to move cards) — verify Tab + Enter/Space works
- [ ] **Card flip animation:** Often missing `backface-visibility` handling — verify no flicker at 90 degrees
- [ ] **Touch support:** Often missing gesture recognition (swipe) — verify pinch-zoom doesn't conflict
- [ ] **TypeScript types:** Often missing prop type exports — verify `ComponentProps<typeof Card>` works
- [ ] **Bundle:** Often missing ESM build — verify `import { Card } from 'lib'` tree-shakes correctly
- [ ] **Accessibility:** Often missing focus indicators — verify Tab navigation shows visible focus ring
- [ ] **Animation:** Often missing `prefers-reduced-motion` support — verify animations respect system settings
- [ ] **SSR:** Often causing hydration mismatch — verify works with Next.js SSR
- [ ] **Ref forwarding:** Often broken — verify `ref` prop reaches DOM element for consumers

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Redux coupling | HIGH | Extract state to props interface; create adapter hooks; major version bump |
| Non-tree-shakeable bundle | MEDIUM | Restructure exports; add sideEffects flag; requires consumer action |
| Missing accessibility | HIGH | Audit with axe-core; systematic fix requires API changes; major version |
| Animation performance | MEDIUM | Replace state with motion values; may require API changes |
| TypeScript types issues | LOW-MEDIUM | Add proper exports; augment module declarations; minor version |
| Cross-platform emoji | LOW | Add Twemoji option; make renderer configurable; minor version |
| Drag-and-drop performance | MEDIUM | Add memoization; switch DnD library if necessary; internal refactor |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Re-render from animation state | Foundation | Performance profile shows <10% CPU during animations |
| Redux store coupling | Architecture | Components work without any Redux provider |
| Non-tree-shakeable bundle | Build/Distribution | Bundle analyzer confirms partial imports work |
| CSS animation without GPU | Foundation | DevTools shows no Layout/Paint during animations |
| Accessibility afterthought | Foundation | eslint-plugin-jsx-a11y passes in CI |
| DnD performance | Interactive Features | Smooth drag with 100+ cards (test explicitly) |
| Emoji inconsistency | Visual/Rendering | Manual test on Windows, Mac, iOS |

## Sources

### HIGH Confidence (Official Documentation, Authoritative Sources)
- [Kent C. Dodds: Fix the slow render before you fix the re-render](https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render)
- [Motion.dev: Reduce bundle size of Framer Motion](https://motion.dev/docs/react-reduce-bundle-size)
- [Redux.js: Troubleshooting](https://redux.js.org/usage/troubleshooting)
- [React TypeScript Cheatsheets: Troubleshooting](https://react-typescript-cheatsheet.netlify.app/docs/basic/troubleshooting/types/)
- [React Spectrum: React Aria Accessibility](https://react-spectrum.adobe.com/react-aria/accessibility.html)
- [dnd-kit Documentation](https://docs.dndkit.com)

### MEDIUM Confidence (Multiple Sources Agree, Verified with Examples)
- [Smashing Magazine: CSS GPU Animation](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/)
- [Carl Rippon: How to Make Your React Component Library Tree Shakeable](https://carlrippon.com/how-to-make-your-react-component-library-tree-shakeable/)
- [Sentry Blog: React Performance Guide](https://blog.sentry.io/react-js-performance-guide/)
- [Brad Frost: Design System Versioning](https://bradfrost.com/blog/post/design-system-versioning-single-library-or-individual-components/)
- [Slack Engineering: Rebuilding Slack's Emoji Picker in React](https://slack.engineering/rebuilding-slacks-emoji-picker-in-react/)
- [LogRocket: Debugging React Performance with Why Did You Render](https://blog.logrocket.com/debugging-react-performance-issues-with-why-did-you-render/)

### LOW Confidence (Single Source, Community Discussion)
- [GitHub Issue: dnd-kit rerenders](https://github.com/clauderic/dnd-kit/issues/389)
- [GitHub Issue: react-dnd performance with 1000+ drop targets](https://github.com/react-dnd/react-dnd/issues/421)
- [GitHub Issue: React Aria accessibility issues](https://github.com/adobe/react-spectrum/issues/5630)

---
*Pitfalls research for: React Card Component Library (Interactive/Game-related)*
*Researched: 2026-02-02*
