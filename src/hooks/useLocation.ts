/**
 * Hook returning cards at a specific location.
 *
 * Uses useSyncExternalStore for tear-safe reads and selectLocation selector.
 */

import { useCallback, useRef, useSyncExternalStore } from 'react';
import type { CardState } from '../state/types';
import { useStateBackend } from './useStateBackend';

/** Shared empty array to avoid re-allocation. */
const EMPTY: CardState[] = [];

/**
 * Returns the array of CardState at the given location.
 *
 * Returns a referentially stable empty array when the location does not exist.
 * Preserves reference identity when the underlying location array has not changed.
 *
 * @param locationId - Location identifier (e.g. 'hand', 'deck')
 * @throws Error if called outside a provider
 * @returns CardState[] for the location
 */
export function useLocation(locationId: string): CardState[] {
  const backend = useStateBackend();

  // Track previous result for reference stability
  const prevRef = useRef<CardState[]>([]);

  const getSnapshot = useCallback(() => {
    const state = backend.getState();
    // Read directly from locations to get a stable reference (or undefined)
    const raw = state.locations[locationId];

    if (raw === undefined) {
      // Location missing -- return the cached empty array for stability
      if (prevRef.current.length === 0) return prevRef.current;
      prevRef.current = EMPTY;
      return EMPTY;
    }

    // Preserve reference when location array is the same object
    if (raw === prevRef.current) return prevRef.current;
    prevRef.current = raw;
    return raw;
  }, [backend, locationId]);

  return useSyncExternalStore(backend.subscribe, getSnapshot);
}
