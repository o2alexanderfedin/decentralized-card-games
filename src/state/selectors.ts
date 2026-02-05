/**
 * Pure selector functions on GameState.
 *
 * These selectors are framework-agnostic -- no Redux Toolkit imports.
 * They can be used directly or composed into memoized selectors by
 * either Context mode or Redux mode.
 */

import type { GameState, CardState } from './types';

/**
 * Select all locations from game state.
 *
 * @param state - Current game state
 * @returns Record of location id to card arrays
 */
export function selectAllLocations(state: GameState): Record<string, CardState[]> {
  return state.locations;
}

/**
 * Select cards at a specific location.
 *
 * @param state - Current game state
 * @param locationId - Location identifier
 * @returns Array of cards at the location, or empty array if location does not exist
 */
export function selectLocation(state: GameState, locationId: string): CardState[] {
  return state.locations[locationId] ?? [];
}

/**
 * Select a single card by location and index.
 *
 * @param state - Current game state
 * @param location - Location identifier
 * @param cardIndex - Zero-based index within the location
 * @returns The card at that position, or undefined if out of bounds or location missing
 */
export function selectCard(
  state: GameState,
  location: string,
  cardIndex: number,
): CardState | undefined {
  return state.locations[location]?.[cardIndex];
}

/**
 * Select the current game phase.
 *
 * @param state - Current game state
 * @returns Game phase string or null if unset
 */
export function selectGamePhase(state: GameState): string | null {
  return state.gamePhase;
}

/**
 * Select the current player identifier.
 *
 * @param state - Current game state
 * @returns Current player string or null if unset
 */
export function selectCurrentPlayer(state: GameState): string | null {
  return state.currentPlayer;
}

/**
 * Select the number of cards at a location.
 *
 * @param state - Current game state
 * @param locationId - Location identifier
 * @returns Number of cards at the location (0 if location does not exist)
 */
export function selectLocationCount(state: GameState, locationId: string): number {
  return (state.locations[locationId] ?? []).length;
}
