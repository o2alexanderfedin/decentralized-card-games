---
phase: 01-foundation
plan: 02
subsystem: ui
tags: [react, motion, hooks, animation, accessibility, spring-physics]

# Dependency graph
requires:
  - phase: 01-01
    provides: SPRING_PRESETS, SpringConfig from constants/animations.ts
provides:
  - useCardFlip hook with MotionValue-based flip animation
  - usePrefersReducedMotion hook for accessibility motion detection
  - Hooks barrel export from src/hooks/index.ts
affects: [01-04, phase-2, phase-3]

# Tech tracking
tech-stack:
  added: []
  patterns: [motion-value-animation, useSpring-for-gpu-acceleration, useTransform-derived-values, media-query-hook]

key-files:
  created: [src/hooks/useCardFlip.ts, src/hooks/useCardFlip.test.ts, src/hooks/usePrefersReducedMotion.ts, src/hooks/usePrefersReducedMotion.test.ts, src/hooks/index.ts]
  modified: [src/index.ts]

key-decisions:
  - "useSpring (not useMotionValue) for automatic spring-animated transitions"
  - "useTransform with 4-point input range [0,89,90,180] for sharp opacity crossover at 90 degrees"
  - "useMotionValueEvent for animationStart/animationComplete tracking instead of onChange polling"
  - "Callback ref pattern (useRef) for onFlipComplete to avoid stale closures"
  - "Custom usePrefersReducedMotion instead of Motion's built-in useReducedMotion for independence from Motion library"

patterns-established:
  - "MotionValue pattern: animation state lives outside React state to prevent re-renders"
  - "Spring preset resolution: accept union type of preset names or custom config objects"
  - "SSR-safe hooks: check typeof window before accessing browser APIs"
  - "Media query hook: useState + useEffect + addEventListener('change') pattern"

# Metrics
duration: 11min
completed: 2026-02-03
---

# Phase 1 Plan 2: Animation Hooks Summary

**useCardFlip with GPU-accelerated spring rotation via Motion useSpring/useTransform, plus usePrefersReducedMotion for accessibility**

## Performance

- **Duration:** 11 min
- **Started:** 2026-02-03T05:05:48Z
- **Completed:** 2026-02-03T05:16:27Z
- **Tasks:** 3/3
- **Files created:** 5
- **Files modified:** 1

## Accomplishments

- `useCardFlip` hook encapsulating flip animation with MotionValues that animate on GPU without React re-renders
- Spring physics integration via SPRING_PRESETS from Plan 01-01, with support for custom `{ stiffness, damping }` configs
- Derived opacity values using `useTransform` with sharp crossover at 90 degrees (front fades at 89-90, back appears at 90-91)
- Animation lifecycle tracking via `useMotionValueEvent` for `animationStart`/`animationComplete` events
- `usePrefersReducedMotion` accessibility hook detecting system `prefers-reduced-motion: reduce` preference
- SSR-safe implementation with `typeof window` guards
- 16 new tests (11 for useCardFlip, 5 for usePrefersReducedMotion), all passing
- Total test suite: 66 tests passing across 7 test files

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useCardFlip hook with motion values** - `8f6cd61` (feat)
2. **Task 2: Create usePrefersReducedMotion accessibility hook** - `24eb08c` (feat)
3. **Task 3: Create hooks barrel export** - `11d38d3` (feat)

**Feature merge:** `85ffb92` (Merge branch 'feature/01-02-animation-hooks' into develop)

## Files Created/Modified

- `src/hooks/useCardFlip.ts` - 166 lines: flip animation hook with useSpring, useTransform, useMotionValueEvent
- `src/hooks/useCardFlip.test.ts` - 123 lines: 11 tests for rotation, opacity, presets, callbacks
- `src/hooks/usePrefersReducedMotion.ts` - 58 lines: system motion preference detection hook
- `src/hooks/usePrefersReducedMotion.test.ts` - 86 lines: 5 tests for detection, reactivity, cleanup
- `src/hooks/index.ts` - 8 lines: barrel export for hooks and types
- `src/index.ts` - added `export * from './hooks'` to root barrel

## Decisions Made

- **useSpring over useMotionValue:** Used `useSpring` directly instead of `useMotionValue` + manual `animate()` because useSpring automatically applies spring physics when the target value changes via `.set()`, simplifying the implementation
- **4-point opacity transform:** Used `[0, 89, 90, 180]` input range (instead of 3-point `[0, 90, 180]`) to create a sharp crossover at exactly 90 degrees where front disappears and back appears simultaneously, preventing both faces being visible at the midpoint
- **useMotionValueEvent over onChange:** Used Motion's `useMotionValueEvent` hook for animation lifecycle instead of subscribing via `rotateY.on('change')` -- cleaner lifecycle management with automatic cleanup
- **Ref-based callback:** Stored `onFlipComplete` in a ref to prevent stale closure issues when the callback changes between renders
- **Custom reduced motion hook:** Built independent `usePrefersReducedMotion` rather than using Motion's built-in `useReducedMotion` to keep the hook usable outside of Motion contexts and testable without Motion

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **Branch context loss between bash calls:** Working directory switched branches between tool calls due to other feature branches existing in the repo. Resolved by cherry-picking commits to the correct branch and resetting the incorrect one. No impact on final result.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Hooks are ready for Card component integration in Plan 01-04
- `useCardFlip` exports `MotionValue<number>` for `rotateY`, `frontOpacity`, `backOpacity` -- Card component will apply these as `style` props on `motion.div` elements
- `usePrefersReducedMotion` can be used in Card to skip or simplify flip animation
- No blockers or concerns

---
*Phase: 01-foundation*
*Completed: 2026-02-03*
