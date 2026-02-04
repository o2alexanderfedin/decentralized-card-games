/**
 * Deck component -- a clickable pile of face-down cards with a draw action.
 *
 * Renders a visual stack of face-down {@link Card} components (up to 5 layers)
 * to create depth.  Clicking the deck fires `onDraw` without managing card
 * state internally.  Supports configurable empty states when count reaches 0.
 *
 * @module Deck
 */

import { forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import { Card } from '../Card';
import type { DeckProps, DeckRef, DeckEmptyState } from './Deck.types';
import styles from './Deck.module.css';

/** Maximum number of visual card layers rendered for the stacking effect. */
const MAX_VISUAL_LAYERS = 5;

/**
 * Determine whether the emptyState value represents one of the two
 * string-based presets (`'none'` or `'placeholder'`).
 */
function isStringPreset(value: DeckEmptyState | undefined): value is 'none' | 'placeholder' {
  return value === 'none' || value === 'placeholder';
}

/**
 * Deck container component.
 *
 * @example
 * ```tsx
 * <Deck count={remaining} onDraw={() => draw()} />
 * ```
 *
 * @see {@link DeckProps} for all available props
 * @see {@link DeckRef} for imperative ref API
 */
export const Deck = forwardRef<DeckRef, DeckProps>((props, ref) => {
  const {
    count,
    onDraw,
    emptyState = 'placeholder',
    className,
  } = props;

  // ---------------------------------------------------------------------------
  // Imperative ref API
  // ---------------------------------------------------------------------------
  const handleDraw = useCallback(() => {
    if (count > 0) {
      onDraw?.();
    }
  }, [count, onDraw]);

  useImperativeHandle(
    ref,
    () => ({
      drawCard: handleDraw,
    }),
    [handleDraw],
  );

  // ---------------------------------------------------------------------------
  // Visual layers
  // ---------------------------------------------------------------------------
  const layerCount = useMemo(
    () => Math.min(Math.max(count, 0), MAX_VISUAL_LAYERS),
    [count],
  );

  // ---------------------------------------------------------------------------
  // CSS class assembly
  // ---------------------------------------------------------------------------
  const containerClasses = [
    styles.deck,
    count <= 0 ? styles['deck--empty'] : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // ---------------------------------------------------------------------------
  // Empty state rendering
  // ---------------------------------------------------------------------------
  if (count <= 0) {
    if (emptyState === 'none') {
      return (
        <div className={containerClasses} data-testid="deck" aria-label="Empty deck" />
      );
    }

    if (emptyState === 'placeholder' || isStringPreset(emptyState)) {
      return (
        <div className={containerClasses} data-testid="deck" aria-label="Empty deck">
          <div className={styles.placeholder} data-testid="deck-placeholder">
            Empty
          </div>
        </div>
      );
    }

    // Custom ReactNode
    return (
      <div className={containerClasses} data-testid="deck" aria-label="Empty deck">
        {emptyState}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Normal rendering -- face-down card stack
  // ---------------------------------------------------------------------------
  return (
    <div
      className={containerClasses}
      data-testid="deck"
      onClick={handleDraw}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleDraw();
        }
      }}
      role="button"
      aria-label={`Deck with ${count} card${count === 1 ? '' : 's'}`}
      tabIndex={0}
    >
      {/* Spacer to establish aspect ratio from the bottom card */}
      <div style={{ aspectRatio: '5 / 7' }} />

      {Array.from({ length: layerCount }, (_, i) => (
        <div
          key={i}
          className={styles.cardLayer}
          style={{
            transform: `translate(${i}px, ${i}px)`,
            zIndex: i + 1,
          }}
          data-testid="deck-card-layer"
        >
          <Card card="sA" isFaceUp={false} style={{ width: 120, height: 168 }} />
        </div>
      ))}

      {/* Count badge */}
      <div className={styles.countBadge} data-testid="deck-count-badge">
        {count}
      </div>
    </div>
  );
});

Deck.displayName = 'Deck';
