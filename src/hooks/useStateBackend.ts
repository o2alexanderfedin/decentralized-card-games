/**
 * StateBackend abstraction and context.
 *
 * The StateBackend interface is the strategy pattern pivot. Both Context mode
 * (GameStateProvider) and Redux mode (ReduxGameProvider) populate it.
 * All unified hooks read from this context, so they work identically
 * regardless of which provider is above them.
 */

import { createContext, useContext } from 'react';
import type { GameState } from '../state/types';

// ---------------------------------------------------------------------------
// Dispatch type
// ---------------------------------------------------------------------------

/**
 * Redux-style dispatch function signature.
 *
 * Usage: `dispatch('MOVE_CARD', { cardIndex: 0, from: 'deck', to: 'hand' })`
 */
export type GameDispatchFn = (type: string, payload?: Record<string, unknown>) => void;

// ---------------------------------------------------------------------------
// StateBackend interface
// ---------------------------------------------------------------------------

/**
 * Strategy interface that both Context and Redux providers implement.
 *
 * - `getState` returns the current snapshot (for useSyncExternalStore)
 * - `dispatch` sends actions with Redux-style `(type, payload)` API
 * - `subscribe` registers a listener called on every state change
 */
export interface StateBackend {
  /** Return the current game state snapshot. */
  getState: () => GameState;
  /** Dispatch an action by type and optional payload. */
  dispatch: GameDispatchFn;
  /** Subscribe to state changes. Returns an unsubscribe function. */
  subscribe: (listener: () => void) => () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

/**
 * React context holding the active StateBackend.
 * Null when no provider is mounted above the consumer.
 */
export const StateBackendContext = createContext<StateBackend | null>(null);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access the StateBackend from the nearest provider.
 *
 * @throws Error if called outside a GameStateProvider or ReduxGameProvider
 * @returns The active StateBackend instance
 */
export function useStateBackend(): StateBackend {
  const backend = useContext(StateBackendContext);
  if (backend === null) {
    throw new Error(
      'useStateBackend must be used within a GameStateProvider or ReduxGameProvider',
    );
  }
  return backend;
}
