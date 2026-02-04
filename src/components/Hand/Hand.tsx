/**
 * Hand component -- the primary player-facing card container.
 *
 * Renders cards in fan, spread, or stack arrangements using the layout
 * utilities from Plan 01, adapts to container width via useContainerSize,
 * supports controlled/uncontrolled card selection, and animates card
 * enter/exit with Motion's AnimatePresence.
 *
 * @module Hand
 */

import {
  forwardRef,
  useImperativeHandle,
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../Card';
import { useContainerSize, usePrefersReducedMotion, useRovingTabIndex } from '../../hooks';
import {
  calculateFanLayout,
  calculateSpreadLayout,
  calculateStackLayout,
} from '../../utils';
import { formatCardLabel, formatFaceDownLabel } from '../../utils/a11y';
import { normalizeCard, formatCard } from '../../types';
import type { CardData } from '../../types';
import type { HandProps, HandRef } from './Hand.types';
import styles from './Hand.module.css';

/**
 * Hand container component.
 *
 * Renders a collection of cards with configurable layout, selection,
 * hover effects, and enter/exit animations.
 *
 * **Controlled selection** (parent manages selection state):
 * ```tsx
 * <Hand
 *   cards={['sA', 'h7', 'dK']}
 *   selectedCards={selected}
 *   onSelectionChange={setSelected}
 * />
 * ```
 *
 * **Uncontrolled selection** (internal toggle on click):
 * ```tsx
 * <Hand cards={['sA', 'h7', 'dK']} />
 * ```
 *
 * **Ref API** for programmatic control:
 * ```tsx
 * const ref = useRef<HandRef>(null);
 * ref.current.selectCard(0);
 * ref.current.getSelectedCards(); // [0]
 * ```
 *
 * @see {@link HandProps} for all available props
 * @see {@link HandRef} for imperative ref API
 */
export const Hand = forwardRef<HandRef, HandProps>((props, ref) => {
  const {
    cards,
    layout = 'fan',
    fanPreset = 'standard',
    selectedCards,
    onSelectionChange,
    onCardClick,
    hoverEffect = 'lift',
    faceUp = true,
    ariaLabel = 'Your hand',
    className,
  } = props;

  // ---------------------------------------------------------------------------
  // Container sizing
  // ---------------------------------------------------------------------------
  const { ref: containerRef, size } = useContainerSize();

  // Derive card dimensions from container width
  const cardWidth = useMemo(
    () => Math.min(120, Math.max(60, size.width / (cards.length + 4))),
    [size.width, cards.length],
  );
  const cardHeight = useMemo(() => cardWidth * 1.4, [cardWidth]);

  // ---------------------------------------------------------------------------
  // Card normalization
  // ---------------------------------------------------------------------------
  const normalizedCards = useMemo(() => {
    const result: CardData[] = [];
    for (const input of cards) {
      const card = normalizeCard(input);
      if (card) {
        result.push(card);
      }
    }
    return result;
  }, [cards]);

  // ---------------------------------------------------------------------------
  // Layout calculation
  // ---------------------------------------------------------------------------
  const layouts = useMemo(() => {
    const count = normalizedCards.length;

    switch (layout) {
      case 'fan':
        return calculateFanLayout(count, {
          preset: fanPreset,
          cardWidth,
          cardHeight,
        });

      case 'spread':
        return calculateSpreadLayout(count, {
          containerWidth: size.width,
          cardWidth,
          minOverlap: 30,
          maxGap: 8,
        });

      case 'stack':
        return calculateStackLayout(count);

      default:
        return calculateFanLayout(count, {
          preset: fanPreset,
          cardWidth,
          cardHeight,
        });
    }
  }, [normalizedCards.length, layout, fanPreset, size.width, cardWidth, cardHeight]);

  // ---------------------------------------------------------------------------
  // Selection state
  // ---------------------------------------------------------------------------
  const isControlled = selectedCards !== undefined;
  const [internalSelected, setInternalSelected] = useState<Set<number>>(
    new Set(),
  );

  const effectiveSelected = useMemo(
    () => (isControlled ? new Set(selectedCards) : internalSelected),
    [isControlled, selectedCards, internalSelected],
  );

  // ---------------------------------------------------------------------------
  // Selection toggle helper
  // ---------------------------------------------------------------------------
  const toggleSelection = useCallback(
    (index: number) => {
      if (isControlled) {
        const current = new Set(selectedCards);
        if (current.has(index)) {
          current.delete(index);
        } else {
          current.add(index);
        }
        onSelectionChange?.(Array.from(current));
      } else {
        setInternalSelected((prev) => {
          const next = new Set(prev);
          if (next.has(index)) {
            next.delete(index);
          } else {
            next.add(index);
          }
          return next;
        });
      }
    },
    [isControlled, selectedCards, onSelectionChange],
  );

  // ---------------------------------------------------------------------------
  // Imperative ref API
  // ---------------------------------------------------------------------------
  useImperativeHandle(
    ref,
    () => ({
      selectCard: (index: number) => {
        toggleSelection(index);
      },
      getSelectedCards: () => Array.from(effectiveSelected),
    }),
    [toggleSelection, effectiveSelected],
  );

  // ---------------------------------------------------------------------------
  // Card click handler
  // ---------------------------------------------------------------------------
  const handleCardClick = useCallback(
    (card: CardData, index: number) => {
      onCardClick?.(card, index);
      toggleSelection(index);
    },
    [onCardClick, toggleSelection],
  );

  // ---------------------------------------------------------------------------
  // Reduced motion preference
  // ---------------------------------------------------------------------------
  const prefersReducedMotion = usePrefersReducedMotion();

  // ---------------------------------------------------------------------------
  // Roving tabindex for keyboard navigation
  // ---------------------------------------------------------------------------
  const { activeIndex, getTabIndex, handleKeyDown: handleRovingKeyDown } = useRovingTabIndex(normalizedCards.length);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    cardRefs.current[activeIndex]?.focus();
  }, [activeIndex]);

  // ---------------------------------------------------------------------------
  // CSS class assembly
  // ---------------------------------------------------------------------------
  const handClasses = [
    styles.hand,
    hoverEffect === 'lift' ? styles['hand--hover-lift'] : undefined,
    hoverEffect === 'highlight' ? styles['hand--hover-highlight'] : undefined,
    normalizedCards.length === 0 ? styles['hand--empty'] : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div
      ref={containerRef}
      className={handClasses}
      data-testid="hand"
      role="listbox"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
    >
      <AnimatePresence mode="popLayout">
        {normalizedCards.map((card, i) => {
          const cardLayout = layouts[i];
          const key = formatCard(card);
          const isSelected = effectiveSelected.has(i);
          const selectedYOffset = isSelected ? -15 : 0;

          const cardAriaLabel = faceUp
            ? formatCardLabel(card, i + 1, normalizedCards.length, ariaLabel)
            : formatFaceDownLabel(i + 1, normalizedCards.length, ariaLabel);

          return (
            <motion.div
              key={key}
              ref={(el) => { cardRefs.current[i] = el; }}
              className={[
                styles.cardSlot,
                isSelected ? styles['cardSlot--selected'] : undefined,
              ]
                .filter(Boolean)
                .join(' ')}
              role="option"
              aria-selected={isSelected}
              aria-label={cardAriaLabel}
              tabIndex={getTabIndex(i)}
              onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                handleRovingKeyDown(e, i);
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handleCardClick(card, i);
                }
              }}
              layout
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{
                opacity: 1,
                scale: cardLayout?.scale ?? 1,
                x: cardLayout?.x ?? 0,
                y: (cardLayout?.y ?? 0) + selectedYOffset,
                rotate: cardLayout?.rotation ?? 0,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 300, damping: 25 }
              }
              style={{ zIndex: cardLayout?.zIndex ?? 0 }}
              onClick={() => handleCardClick(card, i)}
              data-testid="card-slot"
            >
              <Card
                card={card}
                isFaceUp={faceUp}
                style={{ width: cardWidth, height: cardHeight }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
});

Hand.displayName = 'Hand';
