/**
 * Hook for managing card flip animation state using Motion values.
 *
 * Uses `useSpring` and `useTransform` from Motion so that rotation
 * and opacity values update on the GPU without triggering React
 * re-renders during the animation (critical for 60 fps performance).
 *
 * @module useCardFlip
 */

import {
  useSpring,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
  type SpringOptions,
} from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SPRING_PRESETS, type SpringConfig } from '../constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Spring preset name or custom spring physics values. */
export type SpringPresetOrCustom =
  | 'default'
  | 'bouncy'
  | 'stiff'
  | { stiffness: number; damping: number };

/** Options accepted by {@link useCardFlip}. */
export interface UseCardFlipOptions {
  /** Current face-up state. `true` = front visible, `false` = back visible. */
  isFaceUp: boolean;

  /**
   * Spring configuration preset name or custom `{ stiffness, damping }`.
   * @default 'default'
   */
  spring?: SpringPresetOrCustom;

  /** Fired once when the flip animation settles at its target rotation. */
  onFlipComplete?: () => void;
}

/** Values returned by {@link useCardFlip}. */
export interface UseCardFlipReturn {
  /** Y-axis rotation in degrees (0 = front face, 180 = back face). */
  rotateY: MotionValue<number>;

  /**
   * Front-face opacity.
   * - 1 when rotateY is in [0, 89]
   * - 0 when rotateY is in [90, 180]
   */
  frontOpacity: MotionValue<number>;

  /**
   * Back-face opacity.
   * - 0 when rotateY is in [0, 89]
   * - 1 when rotateY is in [90, 180]
   */
  backOpacity: MotionValue<number>;

  /** `true` while the spring is animating toward its target value. */
  isAnimating: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve a preset name or custom object into Motion's SpringOptions. */
function resolveSpring(spring: SpringPresetOrCustom): SpringOptions {
  if (typeof spring === 'object') {
    return spring;
  }
  const preset: SpringConfig | undefined =
    SPRING_PRESETS[spring as keyof typeof SPRING_PRESETS];
  return preset ?? SPRING_PRESETS.default;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Encapsulates the card-flip animation using Motion values.
 *
 * The returned `rotateY`, `frontOpacity` and `backOpacity` are
 * **MotionValues** -- they animate on the compositor thread and never
 * cause React re-renders during the transition.  Only the boolean
 * `isAnimating` flag lives in React state so the consumer can
 * optionally gate pointer events while the flip is in flight.
 *
 * @example
 * ```tsx
 * const { rotateY, frontOpacity, backOpacity } = useCardFlip({
 *   isFaceUp: true,
 *   spring: 'bouncy',
 *   onFlipComplete: () => console.log('done'),
 * });
 * ```
 */
export function useCardFlip(options: UseCardFlipOptions): UseCardFlipReturn {
  const { isFaceUp, spring = 'default', onFlipComplete } = options;

  // Resolve spring config --------------------------------------------------
  const springOptions = resolveSpring(spring);

  // Core motion value -- drives the entire animation -----------------------
  const targetRotation = isFaceUp ? 0 : 180;
  const rotateY = useSpring(targetRotation, springOptions);

  // Keep spring config in sync when the consumer changes it ----------------
  const prevSpringRef = useRef(springOptions);
  useEffect(() => {
    const prev = prevSpringRef.current;
    if (
      prev.stiffness !== springOptions.stiffness ||
      prev.damping !== springOptions.damping
    ) {
      // useSpring re-applies config on source change; we just record it
      prevSpringRef.current = springOptions;
    }
  }, [springOptions]);

  // Drive rotation toward the target when isFaceUp changes -----------------
  useEffect(() => {
    rotateY.set(targetRotation);
  }, [targetRotation, rotateY]);

  // Derived opacity values (no re-renders) ---------------------------------
  const frontOpacity = useTransform(
    rotateY,
    [0, 89, 90, 180],
    [1, 1, 0, 0],
  );

  const backOpacity = useTransform(
    rotateY,
    [0, 89, 90, 180],
    [0, 0, 1, 1],
  );

  // Animation-in-progress flag (the only React state) ----------------------
  const [isAnimating, setIsAnimating] = useState(false);

  // Stable callback ref so the event handler never goes stale
  const onFlipCompleteRef = useRef(onFlipComplete);
  useEffect(() => {
    onFlipCompleteRef.current = onFlipComplete;
  }, [onFlipComplete]);

  useMotionValueEvent(rotateY, 'animationStart', useCallback(() => {
    setIsAnimating(true);
  }, []));

  useMotionValueEvent(rotateY, 'animationComplete', useCallback(() => {
    setIsAnimating(false);
    onFlipCompleteRef.current?.();
  }, []));

  return { rotateY, frontOpacity, backOpacity, isAnimating };
}
