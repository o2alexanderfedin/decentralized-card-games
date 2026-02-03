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

/** Number of pips for each numeric rank. */
const RANK_PIP_COUNT: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
  '7': 7, '8': 8, '9': 9, 'T': 10,
};

/** Whether a rank is a number card with pip layout. */
function isNumberCard(rank: string): boolean {
  return rank in RANK_PIP_COUNT;
}

/**
 * Pip position descriptor.
 * col: 'left' | 'center' | 'right' - which column
 * row: 1-5 - which row (top to bottom)
 * flipped: whether pip is rotated 180deg (bottom half pips)
 */
interface PipPosition {
  col: 'left' | 'center' | 'right';
  row: number;
  flipped: boolean;
}

/**
 * Standard playing card pip layouts.
 *
 * These match the traditional arrangements found on real playing cards.
 * The grid is 3 columns (left, center, right) x 5 rows (top to bottom).
 */
const PIP_LAYOUTS: Record<number, PipPosition[]> = {
  2: [
    { col: 'center', row: 1, flipped: false },
    { col: 'center', row: 5, flipped: true },
  ],
  3: [
    { col: 'center', row: 1, flipped: false },
    { col: 'center', row: 3, flipped: false },
    { col: 'center', row: 5, flipped: true },
  ],
  4: [
    { col: 'left', row: 1, flipped: false },
    { col: 'right', row: 1, flipped: false },
    { col: 'left', row: 5, flipped: true },
    { col: 'right', row: 5, flipped: true },
  ],
  5: [
    { col: 'left', row: 1, flipped: false },
    { col: 'right', row: 1, flipped: false },
    { col: 'center', row: 3, flipped: false },
    { col: 'left', row: 5, flipped: true },
    { col: 'right', row: 5, flipped: true },
  ],
  6: [
    { col: 'left', row: 1, flipped: false },
    { col: 'right', row: 1, flipped: false },
    { col: 'left', row: 3, flipped: false },
    { col: 'right', row: 3, flipped: false },
    { col: 'left', row: 5, flipped: true },
    { col: 'right', row: 5, flipped: true },
  ],
  7: [
    { col: 'left', row: 1, flipped: false },
    { col: 'right', row: 1, flipped: false },
    { col: 'center', row: 2, flipped: false },
    { col: 'left', row: 3, flipped: false },
    { col: 'right', row: 3, flipped: false },
    { col: 'left', row: 5, flipped: true },
    { col: 'right', row: 5, flipped: true },
  ],
  8: [
    { col: 'left', row: 1, flipped: false },
    { col: 'right', row: 1, flipped: false },
    { col: 'center', row: 2, flipped: false },
    { col: 'left', row: 3, flipped: false },
    { col: 'right', row: 3, flipped: false },
    { col: 'center', row: 4, flipped: true },
    { col: 'left', row: 5, flipped: true },
    { col: 'right', row: 5, flipped: true },
  ],
  9: [
    { col: 'left', row: 1, flipped: false },
    { col: 'right', row: 1, flipped: false },
    { col: 'left', row: 2, flipped: false },
    { col: 'right', row: 2, flipped: false },
    { col: 'center', row: 3, flipped: false },
    { col: 'left', row: 4, flipped: true },
    { col: 'right', row: 4, flipped: true },
    { col: 'left', row: 5, flipped: true },
    { col: 'right', row: 5, flipped: true },
  ],
  10: [
    { col: 'left', row: 1, flipped: false },
    { col: 'right', row: 1, flipped: false },
    { col: 'center', row: 2, flipped: false },
    { col: 'left', row: 2, flipped: false },
    { col: 'right', row: 2, flipped: false },
    { col: 'left', row: 4, flipped: true },
    { col: 'right', row: 4, flipped: true },
    { col: 'center', row: 4, flipped: true },
    { col: 'left', row: 5, flipped: true },
    { col: 'right', row: 5, flipped: true },
  ],
};

/** Column CSS class lookup. */
const COL_CLASS: Record<string, string> = {
  left: styles['pip--left'],
  center: styles['pip--center'],
  right: styles['pip--right'],
};

/**
 * Renders the pip layout grid for number cards (2-10).
 */
function PipLayout({ emoji, count }: { emoji: string; count: number }) {
  const layout = PIP_LAYOUTS[count];
  if (!layout) return null;

  return (
    <div className={styles.pipGrid} data-testid="pip-grid">
      {layout.map((pip, i) => (
        <span
          key={i}
          className={`${styles.pip} ${COL_CLASS[pip.col]} ${pip.flipped ? styles['pip--flipped'] : ''}`.trim()}
          style={{ gridRow: pip.row }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
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
  const pipCount = RANK_PIP_COUNT[rank];

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
            <span className={styles.suit}>{emoji}</span>
          </div>
        </div>

        {/* Center region: pip layout for number cards, single large symbol for face/ace */}
        <div className={styles.centerRegion}>
          {isNumberCard(rank) ? (
            <PipLayout emoji={emoji} count={pipCount} />
          ) : (
            <div className={styles.center}>
              <span>{emoji}</span>
            </div>
          )}
        </div>

        {/* Bottom region */}
        <div className={styles.bottomRegion}>
          <div className={`${styles.corner} ${styles['corner--bottom']}`}>
            <span className={styles.rank}>{label}</span>
            <span className={styles.suit}>{emoji}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
