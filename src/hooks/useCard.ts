/**
 * Hook returning a single card by location and index.
 *
 * Uses useSyncExternalStore for tear-safe reads and selectCard selector.
 */

import { useCallback, useSyncExternalStore } from 'react';
import type { CardState } from '../state/types';
import { selectCard } from '../state/selectors';
import { useStateBackend } from './useStateBackend';

/**
 * Returns a single CardState at the given location and index.
 *
 * @param location - Location identifier
 * @param cardIndex - Zero-based index within the location
 * @throws Error if called outside a provider
 * @returns CardState or undefined if out of bounds / location missing
 */
export function useCard(location: string, cardIndex: number): CardState | undefined {
  const backend = useStateBackend();

  const getSnapshot = useCallback(
    () => selectCard(backend.getState(), location, cardIndex),
    [backend, location, cardIndex],
  );

  return useSyncExternalStore(backend.subscribe, getSnapshot);
}
