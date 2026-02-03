/**
 * Strategy pattern for card center content layouts.
 *
 * Different card types (number cards vs face cards) require different
 * center layout strategies.
 */

import { ReactNode } from 'react';

/** Common interface for all card layout strategies */
export interface CardLayoutStrategy {
  /**
   * Render the center content for this card type.
   * @param emoji - Suit emoji symbol
   * @param rank - Card rank
   * @returns React node for center region
   */
  renderCenter(emoji: string, rank: string): ReactNode;
}
