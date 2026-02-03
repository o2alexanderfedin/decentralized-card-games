/**
 * Pure layout calculation functions for card container components.
 *
 * Each function takes a card count and configuration options, returning
 * an array of {@link CardLayout} objects that describe how to position
 * every card.  The functions are stateless and side-effect free, making
 * them straightforward to test and compose.
 *
 * @module layout
 */

import type { CardLayout } from '../types/containers';
import type { FanPreset } from '../constants/layouts';
import { FAN_PRESETS, LAYOUT_DEFAULTS } from '../constants/layouts';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Degrees to radians. */
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/* ------------------------------------------------------------------ */
/*  Fan layout                                                         */
/* ------------------------------------------------------------------ */

/** Options for {@link calculateFanLayout}. */
export interface FanLayoutOptions {
  /** Named preset for the total arc angle. */
  preset?: FanPreset;
  /** Explicit total arc angle in degrees (overrides preset). */
  maxAngle?: number;
  /** Arc radius — defaults to `LAYOUT_DEFAULTS.fan.radius * cardHeight`. */
  radius?: number;
  /** Width of a single card in px (used for radius calculation). */
  cardWidth: number;
  /** Height of a single card in px (used for radius default). */
  cardHeight: number;
}

/**
 * Distribute cards along an arc (fan shape).
 *
 * The fan is centered at rotation 0.  Cards at the edges have the
 * largest absolute rotation and the highest y offset (they sit lower
 * on the arc).
 *
 * @param count   - Number of cards to lay out.
 * @param options - Fan configuration.
 * @returns Array of `CardLayout` objects, one per card.
 */
export function calculateFanLayout(
  count: number,
  options: FanLayoutOptions,
): CardLayout[] {
  if (count <= 0) return [];

  const {
    preset,
    maxAngle: explicitMaxAngle,
    cardHeight,
  } = options;

  const baseAngle =
    explicitMaxAngle ?? FAN_PRESETS[preset ?? LAYOUT_DEFAULTS.fan.preset];
  const radius =
    options.radius ?? LAYOUT_DEFAULTS.fan.radius * cardHeight;

  if (count === 1) {
    return [{ x: 0, y: 0, rotation: 0, zIndex: 1, scale: 1 }];
  }

  // Scale effective angle based on card count to avoid extreme spread
  // with few cards and provide gentle growth for many cards.
  const effectiveAngle =
    count <= 3
      ? baseAngle * (count / 5)
      : Math.min(baseAngle, baseAngle * Math.sqrt(count / 7));

  const halfAngle = effectiveAngle / 2;
  const layouts: CardLayout[] = [];

  for (let i = 0; i < count; i++) {
    // Distribute angles evenly from -halfAngle to +halfAngle
    const angleDeg =
      count === 1 ? 0 : -halfAngle + (effectiveAngle * i) / (count - 1);
    const angleRad = toRad(angleDeg);

    layouts.push({
      x: radius * Math.sin(angleRad),
      y: radius * (1 - Math.cos(angleRad)),
      rotation: angleDeg,
      zIndex: i + 1,
      scale: 1,
    });
  }

  return layouts;
}

/* ------------------------------------------------------------------ */
/*  Spread layout                                                      */
/* ------------------------------------------------------------------ */

/** Options for {@link calculateSpreadLayout}. */
export interface SpreadLayoutOptions {
  /** Available container width in px. */
  containerWidth: number;
  /** Width of a single card in px. */
  cardWidth: number;
  /** Minimum visible portion of each card in px. */
  minOverlap?: number;
  /** Maximum gap between adjacent cards in px. */
  maxGap?: number;
}

/**
 * Lay cards out in a horizontal row, adapting spacing to the
 * available container width.
 *
 * When space is plentiful the cards are spaced by `maxGap`.  When
 * space is tight they overlap, but each card always shows at least
 * `minOverlap` pixels.
 *
 * @param count   - Number of cards.
 * @param options - Spread configuration.
 * @returns Array of `CardLayout` objects, one per card.
 */
export function calculateSpreadLayout(
  count: number,
  options: SpreadLayoutOptions,
): CardLayout[] {
  if (count <= 0) return [];

  const { containerWidth, cardWidth } = options;
  const maxGap = options.maxGap ?? LAYOUT_DEFAULTS.spread.maxGap;
  const minOverlap = options.minOverlap ?? LAYOUT_DEFAULTS.spread.minOverlap;

  if (count === 1) {
    return [{ x: 0, y: 0, rotation: 0, zIndex: 1, scale: 1 }];
  }

  // Ideal total width when using maxGap between card centres.
  const idealSpacing = cardWidth + maxGap;
  const idealTotalWidth = cardWidth + (count - 1) * idealSpacing;

  let spacing: number;

  if (idealTotalWidth <= containerWidth) {
    // Plenty of room — use maxGap between card left edges.
    spacing = idealSpacing;
  } else {
    // Compress.  Total width = cardWidth + (count-1)*spacing
    // We want total width = containerWidth.
    spacing = (containerWidth - cardWidth) / (count - 1);
    // Never compress below minOverlap visible portion.
    spacing = Math.max(spacing, minOverlap);
  }

  const totalWidth = cardWidth + (count - 1) * spacing;
  const startX = -(totalWidth - cardWidth) / 2;

  const layouts: CardLayout[] = [];
  for (let i = 0; i < count; i++) {
    layouts.push({
      x: startX + i * spacing,
      y: 0,
      rotation: 0,
      zIndex: i + 1,
      scale: 1,
    });
  }

  return layouts;
}

/* ------------------------------------------------------------------ */
/*  Stack layout                                                       */
/* ------------------------------------------------------------------ */

/** Options for {@link calculateStackLayout}. */
export interface StackLayoutOptions {
  /** Horizontal offset per card in px. */
  offsetX?: number;
  /** Vertical offset per card in px. */
  offsetY?: number;
  /** Total rotation spread across the stack in degrees. */
  maxRotation?: number;
}

/**
 * Stack cards with a diagonal offset and subtle rotation.
 *
 * This layout is typically used for face-down decks or discard piles
 * where cards overlap almost completely but show a hint of depth.
 *
 * @param count   - Number of cards.
 * @param options - Stack configuration (all fields optional).
 * @returns Array of `CardLayout` objects, one per card.
 */
export function calculateStackLayout(
  count: number,
  options?: StackLayoutOptions,
): CardLayout[] {
  if (count <= 0) return [];

  const offsetX = options?.offsetX ?? LAYOUT_DEFAULTS.stack.offsetX;
  const offsetY = options?.offsetY ?? LAYOUT_DEFAULTS.stack.offsetY;
  const maxRotation =
    options?.maxRotation ?? LAYOUT_DEFAULTS.stack.maxRotation;

  if (count === 1) {
    return [{ x: 0, y: 0, rotation: 0, zIndex: 1, scale: 1 }];
  }

  const halfRotation = maxRotation / 2;
  const layouts: CardLayout[] = [];

  for (let i = 0; i < count; i++) {
    const rotation =
      -halfRotation + (maxRotation * i) / (count - 1);

    layouts.push({
      x: i * offsetX,
      y: i * offsetY,
      rotation,
      zIndex: i + 1,
      scale: 1,
    });
  }

  return layouts;
}
