/**
 * Face card and Ace layout strategy.
 *
 * Renders single large center symbol for face cards (J,Q,K) and Ace.
 */

import type { ReactNode } from 'react';
import { CardLayoutStrategy } from './CardLayoutStrategy';
import styles from '../Card.module.css';

/** Face card layout strategy implementation */
export class FaceCardLayout implements CardLayoutStrategy {
  renderCenter(emoji: string): ReactNode {
    return (
      <div className={styles.center}>
        <span>{emoji}</span>
      </div>
    );
  }
}
