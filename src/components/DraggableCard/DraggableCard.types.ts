/**
 * Prop types for the DraggableCard component.
 *
 * Extends Card visual props with drag-and-drop identity and control.
 *
 * @module DraggableCard
 */

import type { CardProps } from '../Card/Card.types';
import type { CardData } from '../../types';

/**
 * Props for DraggableCard.
 *
 * Combines Card visual props with dnd-kit draggable identity.
 * The `id` is required for dnd-kit; the `card` prop determines
 * which card is rendered and included in drag data.
 */
export interface DraggableCardProps
  extends Omit<CardProps, 'card'> {
  /** Unique identifier for dnd-kit (required). */
  id: string;
  /** Card identity in notation format (e.g., "sA") or CardData object. */
  card: string | CardData;
  /** Disable dragging for this card. Defaults to false. */
  disabled?: boolean;
  /** Zone this card belongs to (included in drag data for drop validation). */
  sourceZoneId?: string;
}
