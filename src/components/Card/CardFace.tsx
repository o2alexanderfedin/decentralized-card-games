/**
 * CardFace component - renders the front face of a playing card.
 *
 * Displays suit emoji and rank with standard playing card pip layouts:
 * - Number cards (2-10): show multiple suit symbols in traditional arrangements
 * - Face cards (J, Q, K) and Ace: show single large center symbol
 *
 * Supports two-color and four-color suit schemes.
 */

import { CardData, parseCard } from '../../types';
import { SUIT_EMOJI, getSuitColor } from '../../constants';
import type { ColorScheme } from '../../constants';
import { NumberCardLayout, FaceCardLayout } from './layouts';
import type { CardLayoutStrategy } from './layouts';
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

/** Whether a rank is a number card with pip layout. */
function isNumberCard(rank: string): boolean {
  return ['2', '3', '4', '5', '6', '7', '8', '9', 'T'].includes(rank);
}

/** Strategy instances (reused for all cards) */
const numberCardLayout = new NumberCardLayout();
const faceCardLayout = new FaceCardLayout();

/** Select appropriate layout strategy for the given rank */
function getLayoutStrategy(rank: string): CardLayoutStrategy {
  return isNumberCard(rank) ? numberCardLayout : faceCardLayout;
}

/**
 * CardFace renders the front of a playing card with suit emoji and rank.
 *
 * Number cards (2-10) display pip layouts with multiple suit symbols:
 * ```
 * +-------+
 * | 5     |
 * | ♠     |
 * | ♠   ♠ |
 * |   ♠   |
 * | ♠   ♠ |
 * |     ♠ |
 * |     5 |
 * +-------+
 * ```
 *
 * Face cards and Ace display a single large center symbol:
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
 * <CardFace card="♠6" /> // Shows 6 spade pips in standard layout
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

  // Never show suit symbols in corners - only rank
  const showSuitInCorner = false;

  return (
    <div
      className={`${styles.face} ${styles.front} ${className ?? ''}`.trim()}
      style={{ color }}
      role="img"
      aria-label={`${label} of ${suit}`}
    >
      <div className={styles.cardContent}>
        {/* Top region */}
        <div className={styles.topRegion}>
          <div className={`${styles.corner} ${styles['corner--top']}`}>
            <span className={styles.rank}>{label}</span>
            {showSuitInCorner && <span className={styles.suit}>{emoji}</span>}
          </div>
        </div>

        {/* Center region: strategy pattern handles layout for number cards vs face/ace */}
        <div className={styles.centerRegion}>
          {getLayoutStrategy(rank).renderCenter(emoji, rank)}
        </div>

        {/* Bottom region - no corner rank needed */}
        <div className={styles.bottomRegion}>
          {/* Bottom corner rank removed per user request */}
        </div>
      </div>
    </div>
  );
}
