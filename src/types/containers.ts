/**
 * Shared types for card container components (Hand, Deck, CardStack).
 *
 * Containers accept cards as either CardData objects or string notation,
 * and use CardLayout to describe each card's visual position.
 *
 * @module containers
 */

import type { CardData } from './card';
import { parseCard } from './card';

/**
 * Flexible card input accepted by container components.
 *
 * - `string` notation (e.g. "sA", "\u2660A") is parsed via `parseCard`
 * - `CardData` objects pass through directly
 */
export type CardInput = string | CardData;

/**
 * Describes the visual layout position of a single card
 * within a container component.
 */
export interface CardLayout {
  /** Horizontal offset in pixels from the container's center. */
  x: number;
  /** Vertical offset in pixels from the container's center. */
  y: number;
  /** Rotation in degrees (positive = clockwise). */
  rotation: number;
  /** Stack ordering (higher = on top). */
  zIndex: number;
  /** Scale factor (1 = normal size). */
  scale: number;
}

/**
 * Normalize a CardInput to CardData.
 *
 * - If given a string, delegates to `parseCard`.
 * - If given a CardData object, passes it through unchanged.
 *
 * @param input - Card string notation or CardData object
 * @returns Parsed CardData, or null if the string is invalid
 *
 * @example
 * ```ts
 * normalizeCard("sA")                        // { suit: 'spades', rank: 'A' }
 * normalizeCard({ suit: 'hearts', rank: '7' }) // { suit: 'hearts', rank: '7' }
 * normalizeCard("xyz")                        // null
 * ```
 */
export function normalizeCard(input: CardInput): CardData | null {
  if (typeof input === 'string') {
    return parseCard(input);
  }
  return input;
}
