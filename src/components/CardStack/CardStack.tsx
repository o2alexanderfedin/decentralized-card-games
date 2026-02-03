/**
 * CardStack component -- overlapping cards with cascade layout.
 *
 * Displays cards stacked with a configurable diagonal offset and rotation,
 * suitable for discard piles, played cards, and generic stacking areas.
 * Uses {@link calculateStackLayout} for position calculations.
 *
 * @module CardStack
 */

import { useMemo, useCallback } from 'react';
import { normalizeCard, formatCard } from '../../types';
import type { CardData } from '../../types';
import { calculateStackLayout } from '../../utils/layout';
import { Card } from '../Card';
import type { CardStackProps, FaceUpMode } from './CardStack.types';
import styles from './CardStack.module.css';

/**
 * Resolve the isFaceUp value for a card at a given index.
 */
function resolveIsFaceUp(
  mode: FaceUpMode,
  index: number,
  total: number,
): boolean {
  if (mode === 'top-only') return index === total - 1;
  return !!mode;
}

/**
 * CardStack container component.
 *
 * @example
 * ```tsx
 * <CardStack cards={["sA", "h7", "dK"]} faceUp="top-only" />
 * ```
 *
 * @see {@link CardStackProps} for all available props
 */
export const CardStack: React.FC<CardStackProps> = (props) => {
  const {
    cards,
    cardWidth = 120,
    cardHeight = 168,
    offsetX = cardWidth * 0.05,
    offsetY = cardHeight * 0.05,
    maxRotation = 3,
    faceUp = 'top-only',
    onTopCardClick,
    className,
  } = props;

  // Normalize card inputs, filtering out invalid strings
  const normalizedCards = useMemo(() => {
    const result: CardData[] = [];
    for (const input of cards) {
      const card = normalizeCard(input);
      if (card) result.push(card);
    }
    return result;
  }, [cards]);

  // Calculate layout positions
  const layouts = useMemo(
    () =>
      calculateStackLayout(normalizedCards.length, {
        offsetX,
        offsetY,
        maxRotation,
      }),
    [normalizedCards.length, offsetX, offsetY, maxRotation],
  );

  // Top card click handler
  const handleTopCardClick = useCallback(() => {
    if (onTopCardClick && normalizedCards.length > 0) {
      const lastIndex = normalizedCards.length - 1;
      onTopCardClick(normalizedCards[lastIndex], lastIndex);
    }
  }, [onTopCardClick, normalizedCards]);

  // ---------------------------------------------------------------------------
  // CSS class assembly
  // ---------------------------------------------------------------------------
  const containerClasses = [styles.stack, className]
    .filter(Boolean)
    .join(' ');

  if (normalizedCards.length === 0) {
    return null;
  }

  // Calculate total size including offsets for the spacer
  const totalOffsetX = (normalizedCards.length - 1) * offsetX;
  const totalOffsetY = (normalizedCards.length - 1) * offsetY;

  return (
    <div className={containerClasses} data-testid="card-stack">
      {/* Spacer to give the container natural height/width */}
      <div
        style={{
          width: cardWidth + totalOffsetX,
          height: cardHeight + totalOffsetY,
        }}
      />

      {normalizedCards.map((card, i) => {
        const layout = layouts[i];
        const isTop = i === normalizedCards.length - 1;
        const cardIsFaceUp = resolveIsFaceUp(faceUp, i, normalizedCards.length);
        const key = formatCard(card) + '-' + i;

        const slotClasses = [
          styles.cardSlot,
          isTop && onTopCardClick ? styles['cardSlot--top'] : undefined,
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div
            key={key}
            className={slotClasses}
            style={{
              transform: `translate(${layout.x}px, ${layout.y}px) rotate(${layout.rotation}deg)`,
              zIndex: layout.zIndex,
            }}
            data-testid="card-stack-slot"
            {...(isTop && onTopCardClick ? { onClick: handleTopCardClick } : {})}
          >
            <Card
              card={card}
              isFaceUp={cardIsFaceUp}
              style={{ width: cardWidth, height: cardHeight }}
            />
          </div>
        );
      })}
    </div>
  );
};

CardStack.displayName = 'CardStack';
