/**
 * Type definitions for the CardStack container component.
 *
 * CardStack displays overlapping cards with a diagonal cascade offset
 * and slight rotation -- suitable for discard piles, played cards,
 * and generic stacking.
 *
 * @module CardStack
 */

import type { CardData, CardInput } from '../../types';

/**
 * Face-up display mode for cards in the stack.
 *
 * - `true`       -- all cards face up
 * - `false`      -- all cards face down
 * - `'top-only'` -- only the last (top) card is face up
 */
export type FaceUpMode = boolean | 'top-only';

/** Props for the {@link CardStack} component. */
export interface CardStackProps {
  /** Cards to display in the stack. */
  cards: CardInput[];
  /** Card width in px. Default: `120`. */
  cardWidth?: number;
  /** Card height in px. Default: `168`. */
  cardHeight?: number;
  /** Horizontal offset per card in px. Default: `5% of cardWidth`. */
  offsetX?: number;
  /** Vertical offset per card in px. Default: `5% of cardHeight`. */
  offsetY?: number;
  /** Maximum rotation spread in degrees.  Default: `3`. */
  maxRotation?: number;
  /** Whether cards are face up.  Default: `'top-only'`. */
  faceUp?: FaceUpMode;
  /** Fired when the top card is clicked. */
  onTopCardClick?: (card: CardData, index: number) => void;
  /** ARIA label for screen readers. Default: "Card stack, N card(s)". */
  ariaLabel?: string;
  /** Additional CSS class. */
  className?: string;
}
