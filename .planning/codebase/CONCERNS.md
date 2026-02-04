# Codebase Concerns

**Analysis Date:** 2026-02-04

## Tech Debt

**Redux Integration Type Safety:**
- Issue: `ReduxGameProvider.tsx` uses `eslint-disable @typescript-eslint/no-explicit-any` for action creator mapping
- Files: `src/redux/ReduxGameProvider.tsx` (lines 35-47)
- Impact: String-based action dispatch loses type safety. Runtime errors possible if action type string doesn't match reducer
- Fix approach: Replace string-based dispatch with direct action creator imports, or use typed action map with discriminated union types

**Reduced Motion Animation Completion:**
- Issue: `useCardFlip` hook has incomplete animation event handling in reduced motion mode
- Files: `src/hooks/useCardFlip.ts` (lines 199-210)
- Impact: Animation completion callback fires immediately via useEffect rather than after actual crossfade completes, potentially causing state sync issues
- Fix approach: Add proper completion event tracking for crossfade animations with setTimeout matching CSS transition duration

**Storage Error Handling:**
- Issue: Silent failure in localStorage operations without error reporting
- Files: `src/context/persistence.ts` (lines 26-28, 42-44, 54-57)
- Impact: Users won't know if game state fails to persist (quota exceeded, private browsing). Lost progress without warning
- Fix approach: Return boolean success/failure from save operations, emit optional onError callback for consumers to handle

**Dependency Chain Depth:**
- Issue: Hook dependency arrays in `Hand.tsx` recalculate layout on every card state change
- Files: `src/components/Hand/Hand.tsx` (line 137)
- Impact: Potential performance degradation with large card collections (52+ cards). Layout recalc triggers for any card flip/select
- Fix approach: Split card state from layout-affecting props. Memoize layout independently of card faceUp/selected state

**React Hooks Exhaustive Deps Warning:**
- Issue: Intentional exclusion of `initialState` from `useMemo` dependencies with eslint-disable
- Files: `src/redux/ReduxGameProvider.tsx` (line 81)
- Impact: Store won't reinitialize if `initialState` prop changes after mount. Could confuse users expecting dynamic initial state
- Fix approach: Document this as intentional API design (store is singleton) or add warning in JSDoc about single initialization

## Known Bugs

None detected in source analysis. All phase verification documents report zero anti-patterns or unresolved issues.

## Security Considerations

**No Environment Variable Validation:**
- Risk: `.gitignore` blocks secret files but no runtime validation exists for required env vars
- Files: `.gitignore` (lines 56-61), no corresponding validation in code
- Current mitigation: Project is currently a component library without blockchain integration yet
- Recommendations: Add environment schema validation when blockchain features are implemented. Use a library like `zod` or `envalid`

**Client-Side State Only:**
- Risk: Game state lives entirely in browser memory/localStorage with no server validation
- Files: All state management in `src/state/` and `src/redux/`
- Current mitigation: This is a UI component library, not a full game implementation
- Recommendations: When integrating blockchain, implement state verification via smart contract events. Never trust client state for critical game logic

**No Input Sanitization Layer:**
- Risk: Card data passed through components has no validation at runtime
- Files: Type definitions in `src/types/card.ts` provide compile-time safety only
- Current mitigation: TypeScript prevents most issues at build time. Test suite validates data shapes
- Recommendations: Add runtime validation with `zod` schemas for external data (from API, blockchain, localStorage)

## Performance Bottlenecks

**Layout Recalculation on Every State Change:**
- Problem: `Hand` component recalculates fan/grid layout when any card state changes
- Files: `src/components/Hand/Hand.tsx` (lines 113-137)
- Cause: `normalizedCards.length` in dependency array triggers on card mutations even when count doesn't change
- Improvement path: Memoize `normalizedCards.length` separately. Split layout dependencies from card state dependencies

**No Virtualization for Large Decks:**
- Problem: Rendering 52+ cards simultaneously creates 50+ DOM nodes
- Files: `src/components/Hand/Hand.tsx`, `src/components/Deck/Deck.tsx`
- Cause: All cards render unconditionally. No intersection observer or virtual scrolling
- Improvement path: Add optional virtualization for hands/decks exceeding threshold (e.g., 20 cards). Use `react-virtual` or similar

**Motion Values Without Throttling:**
- Problem: `useCardFlip` subscribes to motion value changes without throttling
- Files: `src/hooks/useCardFlip.ts` (lines 198-203)
- Cause: `useMotionValueEvent` fires on every animation frame during spring transitions
- Improvement path: Spring animations are GPU-accelerated so impact is minimal. Monitor if users report jank

## Fragile Areas

**Type Coercion in Tests:**
- Files: Multiple test files use `as unknown as Record<string, unknown>` for type assertions
- Why fragile: Tests using `unknown` casts bypass TypeScript safety, may not catch breaking changes
- Safe modification: Add proper type fixtures/factories. Example: `src/components/StatefulCardDndProvider/StatefulCardDndProvider.test.tsx` (line 81)
- Test coverage: Good overall coverage (84%+), but type assertions reduce confidence in type safety

**Redux Selector Coverage Gap:**
- Files: `src/redux/selectors.ts` shows 0% coverage despite being exported API
- Why fragile: Selectors are memoization layer for Redux state. Untested selector logic could cause stale data bugs
- Safe modification: Add unit tests for `makeSelectLocation` and `makeSelectCard` factories
- Test coverage: `src/redux/selectors.ts` - 0 lines covered

**Redux Slice Conditional Logic Untested:**
- Files: `src/redux/slice.ts` shows 56.52% coverage with lines 77-92, 95-98 uncovered
- Why fragile: `dealCards` and `shuffleLocation` reducers have branching logic not exercised by tests
- Safe modification: Add tests for edge cases (empty source deck, invalid location, dealing more cards than available)
- Test coverage: Critical game actions like dealing have untested paths

## Scaling Limits

**Bundle Size Approaching Limit:**
- Current capacity: 57.45 kB of 60 kB limit (95.75% utilization)
- Limit: Main bundle size-limit is 60 kB (brotlied)
- Scaling path: Split optional features into separate chunks. Consider making more dependencies peer deps. Motion library is largest contributor

**LocalStorage Quota:**
- Current capacity: Unbounded game state serialization
- Limit: ~5-10MB localStorage limit in most browsers
- Scaling path: Implement state pruning (store only last N turns). Add quota monitoring. Consider IndexedDB for larger states

**No CDN Configuration:**
- Current capacity: Single bundle deployment via npm
- Limit: Consumers must rebuild to update. No edge caching
- Scaling path: Publish CSS separately. Add CDN-friendly build outputs with versioned filenames

## Dependencies at Risk

**Motion Library Major Version:**
- Risk: `motion` v12.x is a recent major release (from Framer Motion fork)
- Impact: Animation API could change in future versions. Migration path unclear
- Migration plan: Monitor Motion changelog. Animations are isolated in `useCardFlip` hook, making swap easier

**dnd-kit Ecosystem:**
- Risk: Three separate `@dnd-kit/*` packages must stay in sync
- Impact: Version mismatches could cause drag conflicts
- Migration plan: Pin versions together. Consider monorepo-style lockfile constraints

**Storybook 8.x:**
- Risk: Storybook v8 is newest major release (breaking changes from v7)
- Impact: Devtool only, doesn't affect runtime
- Migration plan: Already on latest. Monitor for v9 migration guides

**React 19 Peer Dependency:**
- Risk: Accepting both React 18 and 19 may cause hook behavior differences
- Impact: `useTransition`, `useDeferredValue` have different timing in React 19
- Migration plan: Test thoroughly against both versions. Document known differences

## Missing Critical Features

**No Blockchain Integration:**
- Problem: Project positioned as "decentralized card games" but contains no blockchain code
- Blocks: On-chain card ownership, trading, verifiable randomness, multiplayer state sync
- Priority: High (aligns with project vision in CLAUDE.md)

**No Server-Side State Validation:**
- Problem: All game logic runs client-side with no authoritative server
- Blocks: Multiplayer games, cheat prevention, competitive play
- Priority: High (required for any real-world card game)

**No Authentication/Authorization:**
- Problem: No wallet connection, no user identity system
- Blocks: Player identification, game history, matchmaking
- Priority: High (prerequisite for multiplayer)

**No Network Layer:**
- Problem: No WebSocket, WebRTC, or P2P connectivity
- Blocks: Real-time multiplayer gameplay
- Priority: Medium (could use centralized server initially)

## Test Coverage Gaps

**Headless Hooks Untested:**
- What's not tested: `useDraggableCard` and `useDroppableZone` hooks
- Files: `src/hooks/useDraggableCard.ts` (7.69% coverage), `src/hooks/useDroppableZone.ts` (11.11% coverage)
- Risk: Core DnD abstraction layer has minimal test coverage. API contract changes could break consumers silently
- Priority: High

**Type Definition Files:**
- What's not tested: All `*.types.ts` files show 0% coverage
- Files: `src/components/*/*.types.ts`, `src/state/types.ts`, `src/types/dnd.ts`
- Risk: Low (TypeScript validates at compile time). Affects coverage metrics only
- Priority: Low (exclude from coverage thresholds)

**Redux Selectors:**
- What's not tested: Factory functions `makeSelectLocation` and `makeSelectCard`
- Files: `src/redux/selectors.ts` (0% coverage)
- Risk: Memoization bugs could cause performance issues or stale data
- Priority: Medium

**Hand Component Edge Cases:**
- What's not tested: Lines 131-135, 254, 289 in Hand.tsx
- Files: `src/components/Hand/Hand.tsx` (96.39% coverage - near complete but gaps exist)
- Risk: Layout switching logic and card interaction edge cases may have bugs
- Priority: Low (high coverage overall, likely unreachable error branches)

**CardFlip Animation Completion:**
- What's not tested: Lines 199-202, 209-210 in useCardFlip
- Files: `src/hooks/useCardFlip.ts` (87.95% coverage)
- Risk: Reduced motion animation completion callback path not validated
- Priority: Medium (accessibility feature should be thoroughly tested)

---

*Concerns audit: 2026-02-04*
