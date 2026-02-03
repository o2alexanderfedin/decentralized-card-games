/**
 * Layout preset constants for card container components.
 *
 * These values define default behaviour for fan, spread, and stack
 * arrangements.  Individual containers may override them via props.
 *
 * @module layouts
 */

/** Named fan angle presets. */
export type FanPreset = 'subtle' | 'standard' | 'dramatic';

/**
 * Total arc angle (in degrees) for each fan preset.
 * A wider angle fans the cards out further.
 */
export const FAN_PRESETS: Record<FanPreset, number> = {
  subtle: 35,
  standard: 60,
  dramatic: 90,
};

/**
 * Sensible defaults for each layout type.
 * All numeric values use pixels unless noted otherwise.
 */
export const LAYOUT_DEFAULTS = {
  fan: {
    /** Default fan preset name. */
    preset: 'standard' as FanPreset,
    /** Arc radius expressed as a multiple of cardHeight. */
    radius: 3,
  },
  spread: {
    /** Minimum visible portion of each card (px). */
    minOverlap: 30,
    /** Maximum gap between cards (px). */
    maxGap: 8,
  },
  stack: {
    /** Horizontal offset per card (px). */
    offsetX: 2,
    /** Vertical offset per card (px). */
    offsetY: 2,
    /** Total rotation spread across the stack (degrees). */
    maxRotation: 3,
  },
} as const;
