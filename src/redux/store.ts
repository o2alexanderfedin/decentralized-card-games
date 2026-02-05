/**
 * Redux store factory for card game state.
 *
 * Provides configureGameStore() for quick setup and type exports.
 * All RTK imports are strictly confined to the src/redux/ directory.
 */

import { configureStore } from '@reduxjs/toolkit';
import { gameSlice } from './slice';
import { createInitialState } from '../state/initialState';
import type { GameState } from '../state/types';

/**
 * Create a fully configured Redux store for card game state.
 *
 * @param preloadedState - Optional partial state to merge with defaults
 * @returns A configured Redux store
 *
 * @example
 * ```ts
 * const store = configureGameStore();
 * // or with preloaded state:
 * const store = configureGameStore({ gamePhase: 'playing' });
 * ```
 */
export function configureGameStore(preloadedState?: Partial<GameState>) {
  return configureStore({
    reducer: {
      [gameSlice.reducerPath]: gameSlice.reducer,
    },
    preloadedState: preloadedState
      ? { [gameSlice.reducerPath]: { ...createInitialState(), ...preloadedState } }
      : undefined,
  });
}

/** Type of the configured game store. */
export type GameStore = ReturnType<typeof configureGameStore>;

/** Root state shape of the game store. */
export type GameRootState = ReturnType<GameStore['getState']>;

/** Dispatch type of the game store. */
export type GameDispatch = GameStore['dispatch'];
