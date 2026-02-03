/**
 * DraggableCard - wraps the Card component with dnd-kit's useDraggable hook.
 *
 * Handles drag transform application, touch-action CSS for iOS Safari,
 * cursor feedback, and opacity control during drag (source card hidden
 * while DragOverlay shows the visible clone).
 *
 * Wrapped in React.memo for performance with 50+ cards.
 *
 * @module DraggableCard
 */

import React, { useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../Card';
import { parseCard } from '../../types';
import type { CardData } from '../../types';
import type { DragItemData } from '../../types/dnd';
import type { DraggableCardProps } from './DraggableCard.types';
import styles from './DraggableCard.module.css';

const DraggableCardInner: React.FC<DraggableCardProps> = ({
  id,
  card,
  disabled = false,
  sourceZoneId,
  // Card visual props
  isFaceUp,
  colorScheme,
  aspectRatio,
  perspective,
  spring,
  cardBack,
  onClick,
  onFlipStart,
  onFlipComplete,
  onHover,
  onFocus,
  className,
  style,
}) => {
  // Resolve card data for drag payload
  const resolvedCardData: CardData | null = useMemo(() => {
    if (typeof card === 'string') {
      return parseCard(card);
    }
    return card;
  }, [card]);

  // Build drag item data payload
  const dragData: DragItemData | undefined = useMemo(() => {
    if (!resolvedCardData) return undefined;
    return {
      card: resolvedCardData,
      type: 'card' as const,
      sourceZoneId,
    };
  }, [resolvedCardData, sourceZoneId]);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: dragData,
      disabled,
    });

  // Compute inline transform style from dnd-kit transform
  const transformStyle = transform
    ? CSS.Translate.toString(transform)
    : undefined;

  // Assemble CSS classes
  const wrapperClasses = [
    styles.draggable,
    isDragging ? styles['draggable--dragging'] : undefined,
    disabled ? styles['draggable--disabled'] : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={setNodeRef}
      className={wrapperClasses}
      style={{ transform: transformStyle, ...style }}
      data-testid={`draggable-card-${id}`}
      {...attributes}
      {...listeners}
    >
      <Card
        card={card}
        isFaceUp={isFaceUp}
        colorScheme={colorScheme}
        aspectRatio={aspectRatio}
        perspective={perspective}
        spring={spring}
        cardBack={cardBack}
        onClick={onClick}
        onFlipStart={onFlipStart}
        onFlipComplete={onFlipComplete}
        onHover={onHover}
        onFocus={onFocus}
      />
    </div>
  );
};

DraggableCardInner.displayName = 'DraggableCard';

/**
 * Draggable card component.
 *
 * Wraps {@link Card} with dnd-kit's `useDraggable` hook.
 * Must be rendered inside a `DndContext` (or `CardDndProvider`).
 *
 * @example
 * ```tsx
 * <CardDndProvider>
 *   <DraggableCard id="card-1" card="sA" />
 * </CardDndProvider>
 * ```
 */
export const DraggableCard = React.memo(DraggableCardInner);
