/**
 * CardFace component - renders the front face of a playing card.
 *
 * Displays suit emoji and rank in standard playing card layout:
 * top-left corner, center pip, and bottom-right corner (rotated 180deg).
 *
 * Supports two-color and four-color suit schemes.
 */

import { CardData, parseCard } from '../../types';
import { SUIT_EMOJI, getSuitColor } from '../../constants';
import type { ColorScheme } from '../../constants';
import styles from './Card.module.css';

/** Props for the CardFace component. */
interface CardFaceProps {
  /** Card data or notation string (e.g., "♠A"). */
  card: string | CardData;
  /** Color scheme for suit colors. Defaults to 'two-color'. */
  colorScheme?: ColorScheme;
  /** Additional CSS class name. */
  className?: string;
}

/**
 * Resolve a display rank label from a Rank character.
 * Converts 'T' to '10' for display; all others pass through.
 */
function displayRank(rank: string): string {
  return rank === 'T' ? '10' : rank;
}

/**
 * CardFace renders the front of a playing card with suit emoji and rank.
 *
 * Layout:
 * ```
 * +-------+
 * | A     |
 * | ♠     |
 * |       |
 * |   ♠   |
 * |       |
 * |     ♠ |
 * |     A |
 * +-------+
 * ```
 *
 * @example
 * ```tsx
 * <CardFace card="♠A" />
 * <CardFace card={{ suit: 'hearts', rank: 'K' }} colorScheme="four-color" />
 * ```
 */
export function CardFace({ card, colorScheme = 'two-color', className }: CardFaceProps) {
  // Parse card if string notation
  const cardData: CardData | null =
    typeof card === 'string' ? parseCard(card) : card;

  // Handle invalid card gracefully
  if (!cardData) {
    return (
      <div className={`${styles.face} ${styles.front} ${styles.error} ${className ?? ''}`.trim()}>
        <span>?</span>
      </div>
    );
  }

  const { suit, rank } = cardData;
  const emoji = SUIT_EMOJI[suit];
  const color = getSuitColor(suit, colorScheme);
  const label = displayRank(rank);

  return (
    <div
      className={`${styles.face} ${styles.front} ${className ?? ''}`.trim()}
      style={{ color }}
      role="img"
      aria-label={`${label} of ${suit}`}
    >
      {/* Top-left corner */}
      <div className={`${styles.corner} ${styles['corner--top']}`}>
        <span className={styles.rank}>{label}</span>
        <span className={styles.suit}>{emoji}</span>
      </div>

      {/* Center pip */}
      <div className={styles.center}>
        <span>{emoji}</span>
      </div>

      {/* Bottom-right corner (rotated 180deg via CSS) */}
      <div className={`${styles.corner} ${styles['corner--bottom']}`}>
        <span className={styles.rank}>{label}</span>
        <span className={styles.suit}>{emoji}</span>
      </div>
    </div>
  );
}
