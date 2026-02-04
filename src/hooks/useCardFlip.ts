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
  motionValue,
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

  /**
   * When `true`, the card flip uses a quick opacity crossfade (250ms) instead
   * of 3D rotation, per WCAG prefers-reduced-motion guidance. This avoids
   * vestibular discomfort for users who have opted to minimize motion.
   *
   * @default false
   */
  reducedMotion?: boolean;

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
  const {
    isFaceUp,
    spring = 'default',
    reducedMotion = false,
    onFlipComplete,
  } = options;

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

  // Derived opacity values from rotation (no re-renders) -------------------
  const rotationFrontOpacity = useTransform(
    rotateY,
    [0, 89, 90, 180],
    [1, 1, 0, 0],
  );

  const rotationBackOpacity = useTransform(
    rotateY,
    [0, 89, 90, 180],
    [0, 0, 1, 1],
  );

  // Crossfade opacity values for reduced motion (250ms linear) -------------
  const crossfadeFrontOpacity = useSpring(isFaceUp ? 1 : 0, { duration: 250 });
  const crossfadeBackOpacity = useSpring(isFaceUp ? 0 : 1, { duration: 250 });

  // Static rotateY=0 for reduced motion (no 3D rotation at all) -----------
  const staticRotateYRef = useRef(motionValue(0));
  const staticRotateY = staticRotateYRef.current;

  // Drive crossfade opacities when isFaceUp changes -----------------------
  useEffect(() => {
    crossfadeFrontOpacity.set(isFaceUp ? 1 : 0);
    crossfadeBackOpacity.set(isFaceUp ? 0 : 1);
  }, [isFaceUp, crossfadeFrontOpacity, crossfadeBackOpacity]);

  // When reducedMotion is active, hold rotateY at 0 (no rotation) ----------
  useEffect(() => {
    if (reducedMotion) {
      rotateY.jump(0);
    }
  }, [reducedMotion, rotateY, isFaceUp]);

  // Animation-in-progress flag (the only React state) ----------------------
  const [isAnimating, setIsAnimating] = useState(false);

  // Stable callback ref so the event handler never goes stale
  const onFlipCompleteRef = useRef(onFlipComplete);
  useEffect(() => {
    onFlipCompleteRef.current = onFlipComplete;
  }, [onFlipComplete]);

  useMotionValueEvent(rotateY, 'animationStart', useCallback(() => {
    if (!reducedMotion) {
      setIsAnimating(true);
    }
  }, [reducedMotion]));

  useMotionValueEvent(rotateY, 'animationComplete', useCallback(() => {
    if (!reducedMotion) {
      setIsAnimating(false);
      onFlipCompleteRef.current?.();
    }
  }, [reducedMotion]));

  // Select which opacity values to return based on motion preference -------
  // Crossfade fires onFlipComplete after a short delay for reduced motion
  useEffect(() => {
    if (reducedMotion) {
      onFlipCompleteRef.current?.();
    }
  }, [isFaceUp, reducedMotion]);

  // Memoize the return to select between rotation-based and crossfade paths
  const frontOpacity = reducedMotion ? crossfadeFrontOpacity : rotationFrontOpacity;
  const backOpacity = reducedMotion ? crossfadeBackOpacity : rotationBackOpacity;
  // When reducedMotion is active, rotateY is held at 0 (no 3D rotation)
  const effectiveRotateY = reducedMotion ? staticRotateY : rotateY;

  return { rotateY: effectiveRotateY, frontOpacity, backOpacity, isAnimating };
}
