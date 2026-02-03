/**
 * Type definitions for the DropZone container component.
 *
 * DropZone renders a visual container area with empty state options.
 * In Phase 2 it is a visual-only container; Phase 3 will add actual
 * drag-and-drop integration.
 *
 * @module DropZone
 */

import { ReactNode } from 'react';

/**
 * What to display when the drop zone has no children.
 *
 * - `'none'`        -- render nothing visible inside the zone
 * - `'placeholder'` -- render a dashed outline with optional label
 * - `ReactNode`     -- render custom content
 */
export type DropZoneEmptyState = 'none' | 'placeholder' | ReactNode;

/** Visual state of the drop zone. */
export type DropZoneVisualState = 'idle' | 'active' | 'hover';

/** Props for the {@link DropZone} component. */
export interface DropZoneProps {
  /** Content to render inside the drop zone (typically cards). */
  children?: ReactNode;
  /** What to show when no children.  Default: `'placeholder'`. */
  emptyState?: DropZoneEmptyState;
  /** Label for the zone (displayed in placeholder). */
  label?: string;
  /** Visual state.  Default: `'idle'`. */
  state?: DropZoneVisualState;
  /** Fired when something is dropped (future: DnD integration). */
  onDrop?: () => void;
  /** Additional CSS class. */
  className?: string;
}
