/**
 * Hook returning a Redux-style dispatch function.
 *
 * The returned function follows the dispatch('ACTION_TYPE', payload) pattern.
 */

import type { GameDispatchFn } from './useStateBackend';
import { useStateBackend } from './useStateBackend';

/**
 * Returns the dispatch function from the active StateBackend provider.
 *
 * Usage:
 * ```ts
 * const dispatch = useGameActions();
 * dispatch('MOVE_CARD', { cardIndex: 0, from: 'deck', to: 'hand' });
 * ```
 *
 * @throws Error if called outside a provider
 * @returns GameDispatchFn - stable dispatch reference
 */
export function useGameActions(): GameDispatchFn {
  const backend = useStateBackend();
  return backend.dispatch;
}
