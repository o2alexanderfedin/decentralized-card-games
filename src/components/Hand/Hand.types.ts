/**
 * Prop and ref types for the Hand container component.
 *
 * The Hand displays a collection of cards in fan, spread, or stack
 * arrangements with optional selection and hover effects.
 *
 * @module Hand.types
 */

import type { CardData } from '../../types';
import type { CardInput } from '../../types';
import type { FanPreset } from '../../constants';

/** Layout arrangement mode for the Hand component. */
export type HandLayout = 'fan' | 'spread' | 'stack';

/** Hover effect applied to individual cards in the hand. */
export type HoverEffect = 'lift' | 'highlight' | 'none';

/** Props for the {@link Hand} component. */
export interface HandProps {
  /** Cards to display. Accepts CardData objects, string notation, or mixed. */
  cards: CardInput[];

  /** Layout arrangement. Default: 'fan'. */
  layout?: HandLayout;

  /** Fan preset (only used when layout='fan'). Default: 'standard'. */
  fanPreset?: FanPreset;

  /** Controlled selection: indices of selected cards. */
  selectedCards?: number[];

  /** Fired when selection changes (controlled mode). */
  onSelectionChange?: (indices: number[]) => void;

  /** Fired when any card is clicked. */
  onCardClick?: (card: CardData, index: number) => void;

  /** Hover effect on individual cards. Default: 'lift'. */
  hoverEffect?: HoverEffect;

  /** Whether all cards are face up. Default: true. */
  faceUp?: boolean;

  /** Additional CSS class for the hand container. */
  className?: string;
}

/** Imperative handle exposed via ref for the Hand component. */
export interface HandRef {
  /** Programmatically toggle selection of a card by index. */
  selectCard: (index: number) => void;
  /** Get indices of currently selected cards. */
  getSelectedCards: () => number[];
}
