/**
 * Type definitions for the DroppableZone component.
 *
 * DroppableZone wraps the existing DropZone with dnd-kit's
 * useDroppable hook, driving visual states from DnD context.
 *
 * @module DroppableZone
 */

import { ReactNode } from 'react';
import type { DropValidationFn } from '../../types';
import type { DropZoneEmptyState } from '../DropZone/DropZone.types';

/** Props for the {@link DroppableZone} component. */
export interface DroppableZoneProps {
  /** Unique zone identifier for dnd-kit (required). */
  id: string;
  /** Card types this zone accepts (e.g., `['card']`). */
  accepts?: string[];
  /** Custom validation callback for drop acceptance. */
  onValidate?: DropValidationFn;
  /** Zone content (typically cards). */
  children?: ReactNode;
  /** Empty state passed through to DropZone. */
  emptyState?: DropZoneEmptyState;
  /** Label passed through to DropZone. */
  label?: string;
  /** Additional CSS class. */
  className?: string;
  /** Disable drop acceptance. */
  disabled?: boolean;
}
