/**
 * Redux-backed provider that bridges Redux store to StateBackend.
 *
 * Wraps children in both react-redux Provider and StateBackendContext.Provider
 * so that unified hooks (useGameState, useLocation, useCard, useGameActions)
 * work identically whether using GameProvider or ReduxGameProvider.
 *
 * All RTK/react-redux imports are strictly confined to the src/redux/ directory.
 */

import React, { useMemo } from 'react';
import { Provider } from 'react-redux';
import { StateBackendContext, type StateBackend } from '../hooks/useStateBackend';
import { configureGameStore, type GameStore } from './store';
import { gameSlice } from './slice';
import type { GameState } from '../state/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ReduxGameProviderProps {
  /** React children to render within the provider. */
  children: React.ReactNode;
  /** Optional pre-configured Redux store (for advanced users). */
  store?: GameStore;
  /** Optional initial state (used only if no store prop is provided). */
  initialState?: Partial<GameState>;
}

// ---------------------------------------------------------------------------
// Action type to slice action creator mapping
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
const ACTION_CREATOR_MAP: Record<string, (p: any) => any> = {
  MOVE_CARD: gameSlice.actions.moveCard,
  FLIP_CARD: gameSlice.actions.flipCard,
  SELECT_CARD: gameSlice.actions.selectCard,
  SET_LOCATIONS: gameSlice.actions.setLocations,
  SET_GAME_PHASE: gameSlice.actions.setGamePhase,
  SET_CURRENT_PLAYER: gameSlice.actions.setCurrentPlayer,
  DEAL_CARDS: gameSlice.actions.dealCards,
  SHUFFLE_LOCATION: gameSlice.actions.shuffleLocation,
  RESET: gameSlice.actions.reset,
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Redux-backed game state provider.
 *
 * Provides a Redux store and populates the StateBackend context so that
 * unified hooks work transparently.
 *
 * @example
 * ```tsx
 * // Quick setup
 * <ReduxGameProvider initialState={{ gamePhase: 'setup' }}>
 *   <GameBoard />
 * </ReduxGameProvider>
 *
 * // Advanced: bring your own store
 * const store = configureGameStore();
 * <ReduxGameProvider store={store}>
 *   <GameBoard />
 * </ReduxGameProvider>
 * ```
 */
export function ReduxGameProvider({
  children,
  store,
  initialState,
}: ReduxGameProviderProps): React.ReactNode {
  // Create or use provided store
  const reduxStore = useMemo(
    () => store ?? configureGameStore(initialState),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store],
  );

  // Bridge Redux store to StateBackend interface
  const backend: StateBackend = useMemo(
    () => ({
      getState: () => reduxStore.getState()[gameSlice.reducerPath],
      dispatch: (type: string, payload?: Record<string, unknown>) => {
        const creator = ACTION_CREATOR_MAP[type];
        if (creator) {
          reduxStore.dispatch(creator(payload));
        }
      },
      subscribe: (listener: () => void) => reduxStore.subscribe(listener),
    }),
    [reduxStore],
  );

  return (
    <Provider store={reduxStore}>
      <StateBackendContext.Provider value={backend}>
        {children}
      </StateBackendContext.Provider>
    </Provider>
  );
}
