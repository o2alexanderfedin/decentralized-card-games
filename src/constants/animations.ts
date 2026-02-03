/**
 * Animation constants for card components.
 *
 * Spring presets, perspective values, and aspect ratios used
 * across card rendering and flip animations.
 */

/** Spring physics configuration for Motion animations. */
export interface SpringConfig {
  /** Spring stiffness (higher = faster). */
  stiffness: number;
  /** Damping ratio (higher = less bounce). */
  damping: number;
}

/**
 * Predefined spring configurations for card animations.
 *
 * - `default`: Balanced feel with slight bounce
 * - `bouncy`: Playful, noticeable bounce
 * - `stiff`: Quick, minimal oscillation
 */
export const SPRING_PRESETS: Record<string, SpringConfig> = {
  default: { stiffness: 100, damping: 15 },
  bouncy: { stiffness: 100, damping: 10 },
  stiff: { stiffness: 200, damping: 20 },
};

/**
 * CSS perspective values for 3D card transforms.
 *
 * Perspective controls the depth of the 3D effect:
 * - `subtle`: Far camera, minimal depth (good for small cards)
 * - `moderate`: Default depth, natural 3D feel
 * - `dramatic`: Close camera, strong depth (good for large cards)
 */
export const PERSPECTIVE_VALUES: Record<string, string> = {
  subtle: '2000px',
  moderate: '1000px',
  dramatic: '600px',
};

/** Perspective level identifier. */
export type PerspectiveLevel = 'subtle' | 'moderate' | 'dramatic';

/**
 * Standard playing card aspect ratios.
 *
 * - `poker`: 2.5:3.5 inches (standard poker/bridge size width:height = 5:7)
 * - `bridge`: 2.25:3.5 inches (narrower bridge size width:height = 9:14)
 */
export const ASPECT_RATIOS: Record<string, number> = {
  poker: 5 / 7,
  bridge: 9 / 14,
};

/** Aspect ratio preset identifier. */
export type AspectRatioPreset = 'poker' | 'bridge';
