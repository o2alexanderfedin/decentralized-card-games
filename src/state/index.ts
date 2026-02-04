/**
 * Shared state management module.
 *
 * Barrel exports for types, reducer, initial state, and action creators.
 * This module is framework-agnostic -- it contains NO Redux Toolkit imports.
 */

// Types
export type {
  CardState,
  GameState,
  GameAction,
  MoveCardPayload,
  FlipCardPayload,
  SelectCardPayload,
  SetLocationsPayload,
  DealCardsPayload,
} from './types';

// Reducer
export { gameReducer } from './reducer';

// Initial state
export { createInitialState } from './initialState';

// Action creators
export {
  dealStandardDeck,
  shuffleLocation,
  moveCard,
  flipCard,
  selectCard,
  setGamePhase,
  setCurrentPlayer,
  reset,
} from './actions';
