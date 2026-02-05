/**
 * Standalone Context mode provider using useReducer + localStorage.
 *
 * GameProvider wraps children and populates StateBackendContext so all
 * unified hooks (useGameState, useLocation, useCard, useGameActions)
 * work without Redux.
 *
 * No Redux Toolkit imports -- this provider uses React's built-in
 * useReducer with the shared pure gameReducer.
 */

import {
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { gameReducer } from '../state/reducer';
import { createInitialState } from '../state/initialState';
import { StateBackendContext } from '../hooks/useStateBackend';
import type { StateBackend } from '../hooks/useStateBackend';
import type { GameAction } from '../state/types';
import { loadState, saveState } from './persistence';
import type { GameProviderProps } from './GameContext';

/**
 * Standalone game state provider backed by React useReducer.
 *
 * - Populates StateBackendContext so all unified hooks work
 * - Optionally persists state to localStorage (enabled by default)
 * - Rehydrates persisted state on mount
 *
 * @example
 * ```tsx
 * <GameProvider>
 *   <MyGameBoard />
 * </GameProvider>
 *
 * // With custom initial state and no persistence:
 * <GameProvider initialState={{ gamePhase: 'setup' }} persist={false}>
 *   <MyGameBoard />
 * </GameProvider>
 * ```
 */
export function GameProvider({
  children,
  initialState: initialStateOverrides,
  persist = true,
  storageKey = 'cardGameState',
}: GameProviderProps) {
  // Compute initial state: merge defaults + persisted + prop overrides
  const [state, rawDispatch] = useReducer(
    gameReducer,
    undefined,
    () => {
      const base = createInitialState();
      const persisted = persist ? loadState(storageKey) : undefined;
      return {
        ...base,
        ...(persisted ?? {}),
        ...(initialStateOverrides ?? {}),
      };
    },
  );

  // Keep a mutable ref to current state for getState() in subscribe pattern
  const stateRef = useRef(state);
  stateRef.current = state;

  // Listeners for subscribe pattern (used by useSyncExternalStore)
  const listenersRef = useRef(new Set<() => void>());

  // Notify listeners and persist state on every state change
  useEffect(() => {
    // Notify all subscribers
    listenersRef.current.forEach(listener => listener());

    // Persist to localStorage if enabled
    if (persist) {
      saveState(state, storageKey);
    }
  }, [state, persist, storageKey]);

  // Stable subscribe function for useSyncExternalStore
  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  // Build the StateBackend object
  const backend: StateBackend = useMemo(() => ({
    getState: () => stateRef.current,
    dispatch: (type: string, payload?: Record<string, unknown>) => {
      rawDispatch({ type, payload } as GameAction);
    },
    subscribe,
  }), [subscribe]);

  return (
    <StateBackendContext.Provider value={backend}>
      {children}
    </StateBackendContext.Provider>
  );
}
