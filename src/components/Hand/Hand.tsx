/**
 * Hand component - renders cards in fan, spread, or stack arrangements.
 *
 * Placeholder: full implementation in Task 2.
 *
 * @module Hand
 */

import { forwardRef, useImperativeHandle } from 'react';
import type { HandProps, HandRef } from './Hand.types';

/**
 * Hand container component.
 * Renders a collection of cards with configurable layout and interaction.
 */
export const Hand = forwardRef<HandRef, HandProps>((_props, ref) => {
  useImperativeHandle(ref, () => ({
    selectCard: () => {},
    getSelectedCards: () => [],
  }), []);

  return <div data-testid="hand" />;
});

Hand.displayName = 'Hand';
