/**
 * DroppableZone component -- drop target with DnD integration.
 *
 * Wraps the existing DropZone visual component with dnd-kit's
 * useDroppable hook. Derives the visual state (idle/active/hover)
 * from DnD context, supporting both `accepts` filter and
 * `onValidate` callback for drop acceptance.
 *
 * @module DroppableZone
 */

import { useDroppable } from '@dnd-kit/core';
import { DropZone } from '../DropZone';
import type { DropZoneVisualState } from '../DropZone/DropZone.types';
import type { DragItemData } from '../../types';
import type { DroppableZoneProps } from './DroppableZone.types';

/**
 * DroppableZone integrates useDroppable with DropZone visual states.
 *
 * @example
 * ```tsx
 * <DroppableZone id="discard" label="Discard Pile" accepts={['card']}>
 *   {discardCards}
 * </DroppableZone>
 * ```
 *
 * @see {@link DroppableZoneProps} for all available props
 */
export const DroppableZone: React.FC<DroppableZoneProps> = ({
  id,
  accepts,
  onValidate,
  children,
  emptyState,
  label,
  className,
  disabled,
}) => {
  const { setNodeRef, isOver, active } = useDroppable({
    id,
    data: { accepts, onValidate },
    disabled,
  });

  // ---------------------------------------------------------------------------
  // Derive visual state from DnD context
  // ---------------------------------------------------------------------------
  let visualState: DropZoneVisualState = 'idle';

  if (active) {
    const dragData = active.data.current as DragItemData | undefined;
    const isAccepted = accepts
      ? accepts.includes(dragData?.type ?? '')
      : true;
    const isValid =
      onValidate && dragData?.card
        ? onValidate(dragData.card)
        : isAccepted;

    visualState = isOver ? (isValid ? 'hover' : 'idle') : 'active';
  }

  // ---------------------------------------------------------------------------
  // Render: wrap DropZone in a div that receives the droppable ref
  // ---------------------------------------------------------------------------
  return (
    <div
      ref={setNodeRef}
      data-testid="droppable-zone-wrapper"
      role="region"
      aria-label={label ?? 'Drop zone'}
    >
      <DropZone
        state={visualState}
        emptyState={emptyState}
        label={label}
        className={className}
      >
        {children}
      </DropZone>
    </div>
  );
};

DroppableZone.displayName = 'DroppableZone';
