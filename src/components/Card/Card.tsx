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
  // Calculate responsive font size based on card dimensions
  // ---------------------------------------------------------------------------
  const cardFontSize = useMemo(() => {
    // Extract width from style prop, default to 120px (standard poker card width)
    const width = (style?.width as number) ?? 120;
    // Base font size scales with card width, but with minimum for readability
    // Formula: clamp(min 12px, preferred width * 0.12, max 16px)
    // 80px → 12px (min), 120px → 14.4px, 140px+ → 16px (max)
    const scaledSize = width * 0.12;
    return `clamp(12px, ${scaledSize}px, 16px)`;
  }, [style?.width]);

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
          style={{ opacity: frontOpacity, fontSize: cardFontSize }}
        >
          <CardFace card={cardData ?? card} colorScheme={colorScheme} />
        </motion.div>

        {/* Back face */}
        <motion.div
          className={`${styles.face} ${styles.back}`}
          style={{ opacity: backOpacity, fontSize: cardFontSize }}
        >
          <CardBack>{cardBack}</CardBack>
        </motion.div>
      </motion.div>
    </div>
  );
});

Card.displayName = 'Card';
