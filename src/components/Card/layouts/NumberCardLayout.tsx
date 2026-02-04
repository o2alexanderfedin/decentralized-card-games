/**
 * Number card layout strategy (2-10).
 *
 * Renders pip grid with multiple suit symbols in traditional arrangements.
 */

import type { ReactNode } from 'react';
import { CardLayoutStrategy } from './CardLayoutStrategy';
import styles from '../Card.module.css';

/** Number of pips for each numeric rank */
const RANK_PIP_COUNT: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
  '7': 7, '8': 8, '9': 9, 'T': 10,
};

/** Pip position descriptor */
interface PipPosition {
  col: 'left' | 'center' | 'right';
  row: number;
  flipped: boolean;
}

/** Standard playing card pip layouts */
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
    { col: 'left', row: 2, flipped: false },
    { col: 'right', row: 2, flipped: false },
    { col: 'center', row: 2, flipped: false },
    { col: 'left', row: 4, flipped: true },
    { col: 'right', row: 4, flipped: true },
    { col: 'center', row: 4, flipped: true },
    { col: 'left', row: 5, flipped: true },
    { col: 'right', row: 5, flipped: true },
  ],
};

/** Column CSS class lookup */
const COL_CLASS: Record<string, string> = {
  left: styles['pip--left'],
  center: styles['pip--center'],
  right: styles['pip--right'],
};

/** Number card layout strategy implementation */
export class NumberCardLayout implements CardLayoutStrategy {
  renderCenter(emoji: string, rank: string): ReactNode {
    const count = RANK_PIP_COUNT[rank];
    const layout = PIP_LAYOUTS[count];

    if (!layout) {
      return <div className={styles.center}><span>{emoji}</span></div>;
    }

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
}
