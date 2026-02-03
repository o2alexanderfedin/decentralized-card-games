/**
 * DropZone component -- a visual container for card drop targets.
 *
 * Renders a container area with configurable visual states
 * (`idle` / `active` / `hover`) and empty state options.  In Phase 2
 * this is a visual-only container; Phase 3 will integrate actual
 * drag-and-drop behaviour via a DnD library.
 *
 * @module DropZone
 */

import { Children } from 'react';
import type { DropZoneProps, DropZoneEmptyState } from './DropZone.types';
import styles from './DropZone.module.css';

/**
 * Determine whether the emptyState value represents one of the two
 * string-based presets (`'none'` or `'placeholder'`).
 */
function isStringPreset(value: DropZoneEmptyState | undefined): value is 'none' | 'placeholder' {
  return value === 'none' || value === 'placeholder';
}

/**
 * DropZone container component.
 *
 * @example
 * ```tsx
 * <DropZone label="Discard" state="idle" />
 * ```
 *
 * @see {@link DropZoneProps} for all available props
 */
export const DropZone: React.FC<DropZoneProps> = (props) => {
  const {
    children,
    emptyState = 'placeholder',
    label,
    state = 'idle',
    onDrop,
    className,
  } = props;

  // ---------------------------------------------------------------------------
  // CSS class assembly
  // ---------------------------------------------------------------------------
  const stateClass = styles[`dropZone--${state}`] ?? styles['dropZone--idle'];
  const containerClasses = [styles.dropZone, stateClass, className]
    .filter(Boolean)
    .join(' ');

  const hasChildren = Children.count(children) > 0;

  // ---------------------------------------------------------------------------
  // Render empty state content
  // ---------------------------------------------------------------------------
  const renderEmptyContent = () => {
    if (emptyState === 'none') {
      return null;
    }

    if (emptyState === 'placeholder' || isStringPreset(emptyState)) {
      return (
        <div className={styles.placeholder} data-testid="dropzone-placeholder">
          <span>Drop here</span>
          {label && (
            <span className={styles.label} data-testid="dropzone-label">
              {label}
            </span>
          )}
        </div>
      );
    }

    // Custom ReactNode
    return emptyState;
  };

  return (
    <div
      className={containerClasses}
      data-testid="drop-zone"
      onClick={onDrop}
    >
      {hasChildren ? children : renderEmptyContent()}
    </div>
  );
};

DropZone.displayName = 'DropZone';
