/**
 * Context types and provider props for GameProvider.
 *
 * Defines the configuration interface for the standalone Context mode provider.
 */

import type { ReactNode } from 'react';
import type { GameState } from '../state/types';

/**
 * Props for the GameProvider component.
 */
export interface GameProviderProps {
  /** React children to wrap with state context. */
  children: ReactNode;
  /** Optional partial state to merge with initial state. */
  initialState?: Partial<GameState>;
  /** Enable localStorage persistence. Defaults to true. */
  persist?: boolean;
  /** Custom localStorage key. Defaults to 'cardGameState'. */
  storageKey?: string;
}
