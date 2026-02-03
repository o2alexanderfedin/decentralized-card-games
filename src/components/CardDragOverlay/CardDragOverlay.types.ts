/**
 * Type definitions for the CardDragOverlay component.
 *
 * CardDragOverlay wraps dnd-kit's DragOverlay to provide
 * a floating card preview during drag operations.
 *
 * @module CardDragOverlay
 */

import type { CardData } from '../../types';
import type { DragPreviewMode } from '../../types';

/** Props for the {@link CardDragOverlay} component. */
export interface CardDragOverlayProps {
  /** The card currently being dragged. `null` when nothing is dragging. */
  activeCard: CardData | null;
  /** Additional selected cards for multi-card drag preview. */
  selectedCards?: CardData[];
  /** How the drag preview displays the card. Default: `'original'`. */
  previewMode?: DragPreviewMode;
  /** Custom drop animation config (overrides default). */
  dropAnimation?: object;
  /** z-index for the overlay layer. Default: `999`. */
  zIndex?: number;
}
