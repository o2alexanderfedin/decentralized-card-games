/**
 * CardDragOverlay component -- floating card preview during drag operations.
 *
 * Wraps dnd-kit's DragOverlay to render a clone of the dragged card
 * at the cursor position. Supports single-card, multi-card stack,
 * and configurable preview modes (original, translucent, miniature).
 *
 * CRITICAL: DragOverlay is ALWAYS mounted. Only its children are
 * conditionally rendered. This ensures drop animations work correctly.
 *
 * @module CardDragOverlay
 */

import { DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import type { Modifier } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Card } from '../Card';
import type { CardDragOverlayProps } from './CardDragOverlay.types';
import styles from './CardDragOverlay.module.css';

/** Maximum number of cards rendered visually in multi-card stack. */
const MAX_VISUAL_CARDS = 3;

/** Default drop animation configuration. */
const defaultDropAnim = {
  duration: 200,
  easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.5' } },
  }),
};

/**
 * Custom modifier that centers the dragged element on the cursor.
 * Without this, the element maintains its original click offset,
 * which can feel awkward for card dragging.
 */
const snapCenterToCursor: Modifier = ({ activatorEvent, draggingNodeRect, transform }) => {
  if (draggingNodeRect && activatorEvent) {
    const activatorCoordinates = {
      x: activatorEvent instanceof MouseEvent || activatorEvent instanceof TouchEvent
        ? ('clientX' in activatorEvent ? activatorEvent.clientX : activatorEvent.touches[0]?.clientX ?? 0)
        : 0,
      y: activatorEvent instanceof MouseEvent || activatorEvent instanceof TouchEvent
        ? ('clientY' in activatorEvent ? activatorEvent.clientY : activatorEvent.touches[0]?.clientY ?? 0)
        : 0,
    };

    const offsetX = activatorCoordinates.x - draggingNodeRect.left;
    const offsetY = activatorCoordinates.y - draggingNodeRect.top;

    return {
      ...transform,
      x: transform.x + (draggingNodeRect.width / 2 - offsetX),
      y: transform.y + (draggingNodeRect.height / 2 - offsetY),
    };
  }

  return transform;
};

/**
 * CardDragOverlay renders a floating card clone during drag.
 *
 * @example
 * ```tsx
 * <CardDragOverlay activeCard={draggedCard} previewMode="translucent" />
 * ```
 *
 * @see {@link CardDragOverlayProps} for all available props
 */
export const CardDragOverlay: React.FC<CardDragOverlayProps> = ({
  activeCard,
  selectedCards,
  previewMode = 'original',
  dropAnimation,
  zIndex = 999,
}) => {
  // Build preview mode class
  const overlayClasses = [
    styles.overlay,
    previewMode === 'translucent' ? styles['overlay--translucent'] : undefined,
    previewMode === 'miniature' ? styles['overlay--miniature'] : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  // Determine if this is a multi-card drag
  const isMulti = selectedCards && selectedCards.length >= 2;
  const totalCount = isMulti ? selectedCards.length : 0;
  const visibleCards = isMulti ? selectedCards.slice(0, MAX_VISUAL_CARDS) : [];
  const extraCount = totalCount - MAX_VISUAL_CARDS;

  // Render content conditionally (DragOverlay itself stays mounted)
  const renderContent = () => {
    if (!activeCard) return null;

    if (isMulti) {
      return (
        <div className={`${overlayClasses} ${styles.multiStack}`} data-testid="drag-overlay-multi">
          {visibleCards.map((card, i) => (
            <div
              key={`${card.suit}-${card.rank}`}
              className={styles.multiCard}
              style={{ top: i * 4, left: i * 2 }}
            >
              <Card card={card} isFaceUp />
            </div>
          ))}
          {extraCount > 0 && (
            <div className={styles.badge} data-testid="drag-overlay-badge">
              +{extraCount}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={overlayClasses} data-testid="drag-overlay-single">
        <Card card={activeCard} isFaceUp />
      </div>
    );
  };

  return (
    <DragOverlay
      dropAnimation={dropAnimation ?? defaultDropAnim}
      zIndex={zIndex}
      modifiers={[snapCenterToCursor, restrictToWindowEdges]}
    >
      {renderContent()}
    </DragOverlay>
  );
};

CardDragOverlay.displayName = 'CardDragOverlay';
