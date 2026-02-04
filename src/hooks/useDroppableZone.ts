/**
 * Headless drop zone hook.
 *
 * Thin wrapper around dnd-kit's `useDroppable` that attaches
 * the library's zone validation protocol. Consumers get drop
 * state and ref bindings without needing the opinionated
 * `DroppableZone` component wrapper.
 *
 * @module useDroppableZone
 *
 * @example
 * ```tsx
 * function MyCustomDropArea({ id }: { id: string }) {
 *   const { ref, isOver, active } = useDroppableZone({
 *     id,
 *     accepts: ['card'],
 *   });
 *
 *   return (
 *     <div
 *       ref={ref}
 *       style={{
 *         border: isOver ? '2px solid green' : '2px dashed gray',
 *       }}
 *     >
 *       {active ? 'Drop here!' : 'Drop zone'}
 *     </div>
 *   );
 * }
 * ```
 */

import { useDroppable } from '@dnd-kit/core';
import type { Active } from '@dnd-kit/core';
import type { DropValidationFn } from '../types/dnd';

/**
 * Options for the useDroppableZone hook.
 */
export interface UseDroppableZoneOptions {
  /** Unique identifier for this droppable zone. */
  id: string;
  /** Accepted drag item types (e.g. ['card']). */
  accepts?: string[];
  /** Custom validation callback for drop acceptance. */
  onValidate?: DropValidationFn;
  /** When true, dropping is disabled. */
  disabled?: boolean;
}

/**
 * Return value from the useDroppableZone hook.
 */
export interface UseDroppableZoneReturn {
  /** Ref callback to attach to the droppable DOM element. */
  ref: (node: HTMLElement | null) => void;
  /** Whether a dragged item is currently hovering over this zone. */
  isOver: boolean;
  /** The currently active (dragged) item, or null if nothing is being dragged. */
  active: Active | null;
}

/**
 * Headless hook for creating a droppable zone.
 *
 * Wraps dnd-kit's `useDroppable` with the library's zone
 * validation protocol, so `CardDndProvider` can check `accepts`
 * arrays and `onValidate` callbacks during drop resolution.
 *
 * @param options - Configuration for the droppable zone
 * @returns Ref, isOver state, and active drag item
 */
export function useDroppableZone({
  id,
  accepts,
  onValidate,
  disabled = false,
}: UseDroppableZoneOptions): UseDroppableZoneReturn {
  const { setNodeRef, isOver, active } = useDroppable({
    id,
    data: { accepts, onValidate },
    disabled,
  });

  return {
    ref: setNodeRef,
    isOver,
    active,
  };
}
