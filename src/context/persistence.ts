/**
 * localStorage persistence helpers for game state.
 *
 * All operations are wrapped in try/catch to handle:
 * - Private browsing mode (localStorage may throw)
 * - Quota exceeded errors
 * - Corrupt stored data (invalid JSON)
 */

import type { GameState } from '../state/types';

/** Default localStorage key for game state. */
export const DEFAULT_STORAGE_KEY = 'cardGameState';

/**
 * Load game state from localStorage.
 *
 * @param key - Storage key (default: 'cardGameState')
 * @returns Parsed GameState or undefined if not found or corrupt
 */
export function loadState(key: string = DEFAULT_STORAGE_KEY): GameState | undefined {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) return undefined;
    return JSON.parse(serialized) as GameState;
  } catch {
    return undefined;
  }
}

/**
 * Save game state to localStorage.
 *
 * Silently fails on quota exceeded or private browsing restrictions.
 *
 * @param state - GameState to persist
 * @param key - Storage key (default: 'cardGameState')
 */
export function saveState(state: GameState, key: string = DEFAULT_STORAGE_KEY): void {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Silently fail on quota exceeded or private browsing
  }
}

/**
 * Clear persisted game state from localStorage.
 *
 * @param key - Storage key (default: 'cardGameState')
 */
export function clearState(key: string = DEFAULT_STORAGE_KEY): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}
