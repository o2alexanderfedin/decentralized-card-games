/**
 * Card component - the main playing card with 3D flip animation.
 *
 * Supports controlled mode (parent manages `isFaceUp` prop) and
 * uncontrolled mode (internal state with imperative ref API).
 *
 * Animation is driven by Motion values (GPU-accelerated, no React
 * re-renders during flip) via the {@link useCardFlip} hook.
 *
 * @module Card
 */

import {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { motion } from 'motion/react';
import { useCardFlip, usePrefersReducedMotion } from '../../hooks';
import { parseCard } from '../../types';
import type { CardData } from '../../types';
import { PERSPECTIVE_VALUES } from '../../constants';
import { CardFace } from './CardFace';
import { CardBack } from './CardBack';
import type { CardProps, CardRef, CardClickData } from './Card.types';
import styles from './Card.module.css';

/**
 * Playing card component with 3D flip animation.
 *
 * **Controlled mode** (parent manages face-up state):
 * ```tsx
 * <Card card="♠A" isFaceUp={showFace} onClick={handleClick} />
 * ```
 *
 * **Uncontrolled mode** (flips on click, ref for imperative control):
 * ```tsx
 * const cardRef = useRef<CardRef>(null);
 * <Card card="♠A" ref={cardRef} />
 * // cardRef.current.flip();
 * ```
 *
 * @see {@link CardProps} for all available props
 * @see {@link CardRef} for imperative ref API
 */
export const Card = forwardRef<CardRef, CardProps>((props, ref) => {
  const {
    card,
    isFaceUp: controlledFaceUp,
    colorScheme = 'two-color',
    aspectRatio = 'poker',
    perspective = 'moderate',
    spring = 'default',
    cardBack,
    onClick,
    onFlipStart,
    onFlipComplete,
    onHover,
    onFocus,
    className,
    style,
  } = props;

  // ---------------------------------------------------------------------------
  // Controlled / uncontrolled mode detection
  // ---------------------------------------------------------------------------
  const isControlled = controlledFaceUp !== undefined;
  const [internalFaceUp, setInternalFaceUp] = useState(true);
  const faceUp = isControlled ? controlledFaceUp : internalFaceUp;

  // ---------------------------------------------------------------------------
  // Card data resolution
  // ---------------------------------------------------------------------------
  const cardData: CardData | null = useMemo(() => {
    if (typeof card === 'string') {
      return parseCard(card);
    }
    return card;
  }, [card]);

  // ---------------------------------------------------------------------------
  // Animation hook integration
  // ---------------------------------------------------------------------------
  const prefersReducedMotion = usePrefersReducedMotion();
  const { rotateY, frontOpacity, backOpacity } = useCardFlip({
    isFaceUp: faceUp,
    spring: prefersReducedMotion
      ? { stiffness: 1000, damping: 50 }
      : spring,
    onFlipComplete,
  });

  // ---------------------------------------------------------------------------
  // Imperative API for uncontrolled mode
  // ---------------------------------------------------------------------------
  useImperativeHandle(
    ref,
    () => ({
      flip: () => {
        if (!isControlled) {
          onFlipStart?.();
          setInternalFaceUp((prev) => !prev);
        }
      },
      isFaceUp: () => faceUp,
    }),
    [isControlled, faceUp, onFlipStart],
  );

  // ---------------------------------------------------------------------------
  // Click handler
  // ---------------------------------------------------------------------------
  const handleClick = useCallback(() => {
    if (!isControlled) {
      onFlipStart?.();
      setInternalFaceUp((prev) => !prev);
    }
    if (onClick && cardData) {
      const clickData: CardClickData = {
        suit: cardData.suit,
        rank: cardData.rank,
        isFaceUp: faceUp,
      };
      onClick(clickData);
    }
  }, [isControlled, onClick, cardData, faceUp, onFlipStart]);

  // ---------------------------------------------------------------------------
  // CSS class assembly
  // ---------------------------------------------------------------------------
  const containerClasses = [
    styles.container,
    styles[`container--${perspective}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const cardClasses = [
    styles.card,
    aspectRatio === 'bridge' ? styles['card--bridge'] : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  // Resolve perspective value for inline style fallback
  const perspectiveValue = PERSPECTIVE_VALUES[perspective] ?? PERSPECTIVE_VALUES.moderate;

  // ---------------------------------------------------------------------------
  // ARIA label
  // ---------------------------------------------------------------------------
  const ariaLabel = useMemo(() => {
    if (!cardData) return 'Card';
    const displayRank = cardData.rank === 'T' ? '10' : cardData.rank;
    return `${displayRank} of ${cardData.suit}`;
  }, [cardData]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div
      className={containerClasses}
      style={{ perspective: perspectiveValue, ...style }}
    >
      <motion.div
        className={cardClasses}
        style={{ rotateY }}
        onClick={handleClick}
        onMouseEnter={() => onHover?.(true)}
        onMouseLeave={() => onHover?.(false)}
        onFocus={() => onFocus?.(true)}
        onBlur={() => onFocus?.(false)}
        tabIndex={0}
        role="button"
        aria-label={ariaLabel}
      >
        {/* Front face */}
        <motion.div
          className={`${styles.face} ${styles.front}`}
          style={{ opacity: frontOpacity }}
        >
          <CardFace card={cardData ?? card} colorScheme={colorScheme} />
        </motion.div>

        {/* Back face */}
        <motion.div
          className={`${styles.face} ${styles.back}`}
          style={{ opacity: backOpacity }}
        >
          <CardBack>{cardBack}</CardBack>
        </motion.div>
      </motion.div>
    </div>
  );
});

Card.displayName = 'Card';
