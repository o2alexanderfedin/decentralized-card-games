/**
 * Action creator functions for game state management.
 *
 * Each function returns a typed GameAction object ready for dispatch.
 * No Redux Toolkit dependencies -- these are plain object creators.
 */

import { allCards } from '../types/card';
import type { GameState, GameAction, CardState } from './types';

/**
 * Create a SET_LOCATIONS action that populates a location with a full
 * 52-card standard deck. All cards default to faceUp=false, selected=false.
 *
 * @param locationId - Location key to place the deck (default: 'deck')
 * @returns SET_LOCATIONS action with 52 CardState entries
 */
export function dealStandardDeck(locationId: string = 'deck'): GameAction & { type: 'SET_LOCATIONS' } {
  const cards: CardState[] = allCards().map(c => ({
    suit: c.suit,
    rank: c.rank,
    faceUp: false,
    selected: false,
  }));

  return {
    type: 'SET_LOCATIONS',
    payload: { locations: { [locationId]: cards } },
  };
}

/**
 * Create a SHUFFLE_LOCATION action.
 *
 * @param locationId - Location to shuffle
 */
export function shuffleLocation(locationId: string): GameAction & { type: 'SHUFFLE_LOCATION' } {
  return { type: 'SHUFFLE_LOCATION', payload: locationId };
}

/**
 * Create a MOVE_CARD action.
 *
 * @param cardIndex - Index of the card in the source location
 * @param from - Source location key
 * @param to - Target location key
 */
export function moveCard(cardIndex: number, from: string, to: string): GameAction & { type: 'MOVE_CARD' } {
  return { type: 'MOVE_CARD', payload: { cardIndex, from, to } };
}

/**
 * Create a FLIP_CARD action.
 *
 * @param location - Location key containing the card
 * @param cardIndex - Index of the card
 * @param faceUp - Whether the card should be face-up
 */
export function flipCard(location: string, cardIndex: number, faceUp: boolean): GameAction & { type: 'FLIP_CARD' } {
  return { type: 'FLIP_CARD', payload: { location, cardIndex, faceUp } };
}

/**
 * Create a SELECT_CARD action.
 *
 * @param location - Location key containing the card
 * @param cardIndex - Index of the card
 * @param selected - Whether the card should be selected
 */
export function selectCard(location: string, cardIndex: number, selected: boolean): GameAction & { type: 'SELECT_CARD' } {
  return { type: 'SELECT_CARD', payload: { location, cardIndex, selected } };
}

/**
 * Create a SET_GAME_PHASE action.
 *
 * @param phase - Game phase label string
 */
export function setGamePhase(phase: string): GameAction & { type: 'SET_GAME_PHASE' } {
  return { type: 'SET_GAME_PHASE', payload: phase };
}

/**
 * Create a SET_CURRENT_PLAYER action.
 *
 * @param player - Player identifier string
 */
export function setCurrentPlayer(player: string): GameAction & { type: 'SET_CURRENT_PLAYER' } {
  return { type: 'SET_CURRENT_PLAYER', payload: player };
}

/**
 * Create a RESET action.
 *
 * @param partial - Optional partial GameState to merge with initial state
 */
export function reset(partial?: Partial<GameState>): GameAction & { type: 'RESET' } {
  return { type: 'RESET', payload: partial };
}
