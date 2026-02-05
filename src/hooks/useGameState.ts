/**
 * Hook returning the full GameState.
 *
 * Uses useSyncExternalStore for tear-safe reads from the StateBackend.
 */

import { useSyncExternalStore } from 'react';
import type { GameState } from '../state/types';
import { useStateBackend } from './useStateBackend';

/**
 * Returns the full GameState from the active StateBackend provider.
 *
 * @throws Error if called outside a provider
 * @returns Current GameState snapshot
 */
export function useGameState(): GameState {
  const backend = useStateBackend();
  return useSyncExternalStore(backend.subscribe, backend.getState);
}
