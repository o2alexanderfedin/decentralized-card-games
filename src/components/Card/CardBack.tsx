/**
 * CardBack component - renders the back face of a playing card.
 *
 * Shows a customizable card back design. When no children are provided,
 * renders a default navy blue gradient with diagonal line pattern.
 * The back face is pre-rotated 180deg via CSS for 3D flip compatibility.
 */

import { ReactNode } from 'react';
import styles from './Card.module.css';

/** Props for the CardBack component. */
interface CardBackProps {
  /** Custom content for card back (image, pattern, or component). */
  children?: ReactNode;
  /** Additional CSS class name. */
  className?: string;
}

/**
 * CardBack renders the back of a playing card.
 *
 * Accepts optional children for custom card back designs.
 * Without children, displays a default pattern with material design aesthetics.
 *
 * @example
 * ```tsx
 * // Default card back
 * <CardBack />
 *
 * // Custom card back with image
 * <CardBack>
 *   <img src="/custom-back.png" alt="Custom card back" />
 * </CardBack>
 * ```
 */
export function CardBack({ children, className }: CardBackProps) {
  return (
    <div
      className={`${styles.face} ${styles.back} ${className ?? ''}`.trim()}
      aria-hidden="true"
    >
      {children ?? <div className={styles.backPattern} />}
    </div>
  );
}
