/**
 * Memoized Redux selectors for card game state.
 *
 * Uses createSelector from RTK for efficient derived data.
 * All RTK imports are strictly confined to the src/redux/ directory.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { GameRootState } from './store';
import type { CardState } from '../state/types';
import { gameSlice } from './slice';

// ---------------------------------------------------------------------------
// Base selector: extract GameState from RootState
// ---------------------------------------------------------------------------

/**
 * Select the game state slice from the root Redux state.
 */
export const selectGameState = (state: GameRootState) =>
  state[gameSlice.reducerPath];

// ---------------------------------------------------------------------------
// Re-export built-in selectors (wrapped for RootState)
// ---------------------------------------------------------------------------

/** Select all locations from root state. */
export const selectLocations = createSelector(
  selectGameState,
  (game) => game.locations,
);

/** Select the current game phase from root state. */
export const selectGamePhase = createSelector(
  selectGameState,
  (game) => game.gamePhase,
);

/** Select the current player from root state. */
export const selectCurrentPlayer = createSelector(
  selectGameState,
  (game) => game.currentPlayer,
);

// ---------------------------------------------------------------------------
// Memoized selector factories
// ---------------------------------------------------------------------------

/**
 * Factory: create a memoized selector for a specific location.
 *
 * @param locationId - Location key to select
 * @returns Memoized selector returning CardState[] for that location
 *
 * @example
 * ```ts
 * const selectHand = makeSelectLocation('hand');
 * const hand = selectHand(store.getState()); // CardState[]
 * ```
 */
export function makeSelectLocation(locationId: string) {
  return createSelector(
    selectGameState,
    (game): CardState[] => game.locations[locationId] ?? [],
  );
}

/**
 * Factory: create a memoized selector for a specific card.
 *
 * @param location - Location key containing the card
 * @param cardIndex - Zero-based index within the location
 * @returns Memoized selector returning CardState or undefined
 *
 * @example
 * ```ts
 * const selectFirstCard = makeSelectCard('hand', 0);
 * const card = selectFirstCard(store.getState()); // CardState | undefined
 * ```
 */
export function makeSelectCard(location: string, cardIndex: number) {
  return createSelector(
    selectGameState,
    (game): CardState | undefined => game.locations[location]?.[cardIndex],
  );
}
