/**
 * Factory for creating the initial game state.
 *
 * Provides a clean default GameState with optional partial overrides
 * for customisation at setup time.
 */

import type { GameState } from './types';

/**
 * Create a fresh initial GameState.
 *
 * @param overrides - Optional partial state to merge on top of defaults.
 * @returns A new GameState object.
 *
 * @example
 * ```ts
 * const state = createInitialState();
 * // { locations: {}, currentPlayer: null, gamePhase: null, meta: {} }
 *
 * const custom = createInitialState({ gamePhase: 'setup' });
 * // { locations: {}, currentPlayer: null, gamePhase: 'setup', meta: {} }
 * ```
 */
export function createInitialState(overrides?: Partial<GameState>): GameState {
  return {
    locations: {},
    currentPlayer: null,
    gamePhase: null,
    meta: {},
    ...overrides,
  };
}
