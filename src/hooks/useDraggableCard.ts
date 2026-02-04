/**
 * Headless drag hook for cards.
 *
 * Thin wrapper around dnd-kit's `useDraggable` that attaches
 * the library's card-specific drag data protocol. Consumers
 * get drag state and ref bindings without needing the
 * opinionated `DraggableCard` component wrapper.
 *
 * @module useDraggableCard
 *
 * @example
 * ```tsx
 * function MyCustomCard({ card }: { card: CardData }) {
 *   const { ref, dragAttributes, dragListeners, transform, isDragging } =
 *     useDraggableCard({ id: 'card-1', card });
 *
 *   return (
 *     <div
 *       ref={ref}
 *       {...dragAttributes}
 *       {...dragListeners}
 *       style={{
 *         transform: transform
 *           ? `translate(${transform.x}px, ${transform.y}px)`
 *           : undefined,
 *         opacity: isDragging ? 0 : 1,
 *       }}
 *     >
 *       {card.rank} of {card.suit}
 *     </div>
 *   );
 * }
 * ```
 */

import { useDraggable } from '@dnd-kit/core';
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';
import type { CardData } from '../types';
import type { DragItemData } from '../types/dnd';

/**
 * Options for the useDraggableCard hook.
 */
export interface UseDraggableCardOptions {
  /** Unique identifier for this draggable instance. */
  id: string;
  /** Card data to attach to the drag payload. */
  card: CardData;
  /** ID of the zone this card belongs to (included in drag data). */
  sourceZoneId?: string;
  /** When true, dragging is disabled. */
  disabled?: boolean;
}

/**
 * Return value from the useDraggableCard hook.
 */
export interface UseDraggableCardReturn {
  /** Ref callback to attach to the draggable DOM element. */
  ref: (node: HTMLElement | null) => void;
  /** ARIA attributes for the draggable element. */
  dragAttributes: DraggableAttributes;
  /** Event listeners for drag activation (pointer/touch/mouse). */
  dragListeners: DraggableSyntheticListeners;
  /** Current drag transform offset, or null when not dragging. */
  transform: { x: number; y: number } | null;
  /** Whether this element is currently being dragged. */
  isDragging: boolean;
}

/**
 * Headless hook for making a card draggable.
 *
 * Wraps dnd-kit's `useDraggable` with the library's card data
 * protocol (`DragItemData`), so drag events carry typed card
 * information that `DroppableZone` and `CardDndProvider` understand.
 *
 * @param options - Configuration for the draggable card
 * @returns Ref, attributes, listeners, transform, and drag state
 */
export function useDraggableCard({
  id,
  card,
  sourceZoneId,
  disabled = false,
}: UseDraggableCardOptions): UseDraggableCardReturn {
  const dragData: DragItemData = {
    type: 'card' as const,
    card,
    sourceZoneId,
  };

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: dragData,
      disabled,
    });

  return {
    ref: setNodeRef,
    dragAttributes: attributes,
    dragListeners: listeners,
    transform: transform ? { x: transform.x, y: transform.y } : null,
    isDragging,
  };
}
