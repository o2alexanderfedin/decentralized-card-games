/**
 * Type definitions for the StatefulCardDndProvider component.
 *
 * Extends CardDndProviderProps with automatic state dispatch options
 * so DnD lifecycle events can update game state without manual wiring.
 *
 * @module StatefulCardDndProvider
 */

import type { CardDndProviderProps } from '../CardDndProvider';

/**
 * Props for the {@link StatefulCardDndProvider} component.
 *
 * Inherits all CardDndProvider props and adds `autoDispatch` to
 * control whether DnD events automatically trigger state actions.
 */
export interface StatefulCardDndProviderProps extends CardDndProviderProps {
  /**
   * When true (default), automatically dispatches MOVE_CARD on
   * successful drag-end between different zones.
   *
   * Set to false to disable automatic state updates while still
   * receiving DnD lifecycle callbacks.
   *
   * @default true
   */
  autoDispatch?: boolean;
}
