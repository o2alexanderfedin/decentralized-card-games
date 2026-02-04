/**
 * Redux entry point for card game state management.
 *
 * This is the SEPARATE entry point for Redux users.
 * Non-Redux users import from the main entry point and never encounter RTK.
 *
 * @example
 * ```tsx
 * import {
 *   ReduxGameProvider,
 *   configureGameStore,
 *   gameSlice,
 * } from '@decentralized-games/card-components/redux';
 * ```
 */

// Slice and action creators
export { gameSlice } from './slice';
export {
  moveCard,
  flipCard,
  selectCard,
  setLocations,
  setGamePhase,
  setCurrentPlayer,
  dealCards,
  shuffleLocation,
  reset,
} from './slice';

// Store factory and types
export { configureGameStore } from './store';
export type { GameStore, GameRootState, GameDispatch } from './store';

// Provider
export { ReduxGameProvider } from './ReduxGameProvider';
export type { ReduxGameProviderProps } from './ReduxGameProvider';

// Memoized selectors
export {
  selectGameState,
  selectLocations,
  selectGamePhase,
  selectCurrentPlayer,
  makeSelectLocation,
  makeSelectCard,
} from './selectors';

// Re-export shared types that Redux users need
export type {
  GameState,
  CardState,
  GameAction,
  MoveCardPayload,
  FlipCardPayload,
  SelectCardPayload,
  SetLocationsPayload,
  DealCardsPayload,
} from '../state/types';

// Re-export shared utilities
export { createInitialState } from '../state/initialState';

// Re-export action creators (plain object form)
export {
  dealStandardDeck,
  shuffleLocation as shuffleLocationAction,
  moveCard as moveCardAction,
  flipCard as flipCardAction,
  selectCard as selectCardAction,
  setGamePhase as setGamePhaseAction,
  setCurrentPlayer as setCurrentPlayerAction,
  reset as resetAction,
} from '../state/actions';
