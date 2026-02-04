/**
 * State management types for card game state.
 *
 * Pure TypeScript types with NO Redux Toolkit dependencies.
 * These types are shared between Context mode (useReducer) and Redux mode (createSlice).
 */

import type { Suit, Rank } from '../types/card';

// ---------------------------------------------------------------------------
// Card State
// ---------------------------------------------------------------------------

/** A card with UI state fields layered on top of CardData identity. */
export interface CardState {
  /** The card's suit. */
  readonly suit: Suit;
  /** The card's rank. */
  readonly rank: Rank;
  /** Whether the card is face-up (visible). Defaults to false. */
  faceUp: boolean;
  /** Whether the card is currently selected. Defaults to false. */
  selected: boolean;
  /** Optional absolute position for free-form layouts. */
  position?: { x: number; y: number };
}

// ---------------------------------------------------------------------------
// Game State
// ---------------------------------------------------------------------------

/** Top-level game state. */
export interface GameState {
  /** Cards grouped by dynamic location string (e.g. 'deck', 'player1Hand'). */
  locations: Record<string, CardState[]>;
  /** Identifier of the current player, or null if unset. */
  currentPlayer: string | null;
  /** Current game phase label, or null if unset. */
  gamePhase: string | null;
  /** Arbitrary game-specific metadata. */
  meta: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Action Payloads
// ---------------------------------------------------------------------------

/** Payload for moving a card between locations by index. */
export interface MoveCardPayload {
  cardIndex: number;
  from: string;
  to: string;
}

/** Payload for flipping a card's face-up state. */
export interface FlipCardPayload {
  location: string;
  cardIndex: number;
  faceUp: boolean;
}

/** Payload for selecting / deselecting a card. */
export interface SelectCardPayload {
  location: string;
  cardIndex: number;
  selected: boolean;
}

/** Payload for bulk-setting location contents. */
export interface SetLocationsPayload {
  locations: Record<string, CardState[]>;
}

/** Payload for dealing cards from a source to multiple targets. */
export interface DealCardsPayload {
  from: string;
  to: Record<string, number>;
  faceUp?: boolean;
}

// ---------------------------------------------------------------------------
// Game Action (discriminated union)
// ---------------------------------------------------------------------------

export type GameAction =
  | { type: 'MOVE_CARD'; payload: MoveCardPayload }
  | { type: 'FLIP_CARD'; payload: FlipCardPayload }
  | { type: 'SELECT_CARD'; payload: SelectCardPayload }
  | { type: 'SET_LOCATIONS'; payload: SetLocationsPayload }
  | { type: 'SET_GAME_PHASE'; payload: string }
  | { type: 'SET_CURRENT_PLAYER'; payload: string }
  | { type: 'DEAL_CARDS'; payload: DealCardsPayload }
  | { type: 'SHUFFLE_LOCATION'; payload: string }
  | { type: 'RESET'; payload?: Partial<GameState> };
