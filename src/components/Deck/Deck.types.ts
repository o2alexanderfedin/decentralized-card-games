/**
 * Type definitions for the Deck container component.
 *
 * The Deck represents a clickable pile of face-down cards with a
 * draw action.  It fires `onDraw` on click without managing card
 * state internally -- the developer handles state updates.
 *
 * @module Deck
 */

import { ReactNode } from 'react';

/**
 * What to display when the deck is empty (count === 0).
 *
 * - `'none'`        -- render nothing (container still exists but invisible)
 * - `'placeholder'` -- render a dashed outline card placeholder
 * - `ReactNode`     -- render custom content
 */
export type DeckEmptyState = 'none' | 'placeholder' | ReactNode;

/** Props for the {@link Deck} component. */
export interface DeckProps {
  /** Number of cards remaining.  Controls visual stack thickness. */
  count: number;
  /** Fired when the deck is clicked / tapped (draw action). */
  onDraw?: () => void;
  /** What to show when count is 0.  Default: `'placeholder'`. */
  emptyState?: DeckEmptyState;
  /** Additional CSS class. */
  className?: string;
}

/** Imperative handle exposed via ref for the Deck component. */
export interface DeckRef {
  /** Programmatically trigger a draw (fires `onDraw` if count > 0). */
  drawCard: () => void;
}
