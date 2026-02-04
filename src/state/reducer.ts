/**
 * Pure game state reducer.
 *
 * Handles all GameAction types via immutable spread patterns.
 * No Redux Toolkit or Immer -- this reducer is framework-agnostic and
 * can be used with React useReducer (Context mode) or wrapped by
 * createSlice (Redux mode).
 */

import type { GameState, GameAction, CardState } from './types';
import { createInitialState } from './initialState';

/**
 * Fisher-Yates (Knuth) shuffle on a copy of the array.
 * Returns a new shuffled array; does not mutate the input.
 */
function fisherYatesShuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Update a single card within a location array by index (immutable).
 * Returns a new array with the card at `index` replaced by `updater(card)`.
 */
function updateCardAt(
  cards: readonly CardState[],
  index: number,
  updater: (card: CardState) => CardState,
): CardState[] {
  return cards.map((c, i) => (i === index ? updater(c) : c));
}

/**
 * Pure reducer for game state.
 *
 * @param state - Current game state
 * @param action - Dispatched game action
 * @returns New game state (or same reference if action has no effect)
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    // -----------------------------------------------------------------
    // MOVE_CARD
    // -----------------------------------------------------------------
    case 'MOVE_CARD': {
      const { cardIndex, from, to } = action.payload;
      const sourceCards = state.locations[from];

      if (!sourceCards || cardIndex < 0 || cardIndex >= sourceCards.length) {
        return state;
      }

      const movedCard = sourceCards[cardIndex];
      const newSource = [...sourceCards.slice(0, cardIndex), ...sourceCards.slice(cardIndex + 1)];
      const newTarget = [...(state.locations[to] ?? []), movedCard];

      return {
        ...state,
        locations: {
          ...state.locations,
          [from]: newSource,
          [to]: newTarget,
        },
      };
    }

    // -----------------------------------------------------------------
    // FLIP_CARD
    // -----------------------------------------------------------------
    case 'FLIP_CARD': {
      const { location, cardIndex, faceUp } = action.payload;
      const cards = state.locations[location];

      if (!cards || cardIndex < 0 || cardIndex >= cards.length) {
        return state;
      }

      return {
        ...state,
        locations: {
          ...state.locations,
          [location]: updateCardAt(cards, cardIndex, c => ({ ...c, faceUp })),
        },
      };
    }

    // -----------------------------------------------------------------
    // SELECT_CARD
    // -----------------------------------------------------------------
    case 'SELECT_CARD': {
      const { location, cardIndex, selected } = action.payload;
      const cards = state.locations[location];

      if (!cards || cardIndex < 0 || cardIndex >= cards.length) {
        return state;
      }

      return {
        ...state,
        locations: {
          ...state.locations,
          [location]: updateCardAt(cards, cardIndex, c => ({ ...c, selected })),
        },
      };
    }

    // -----------------------------------------------------------------
    // SET_LOCATIONS (merge, not replace)
    // -----------------------------------------------------------------
    case 'SET_LOCATIONS': {
      return {
        ...state,
        locations: {
          ...state.locations,
          ...action.payload.locations,
        },
      };
    }

    // -----------------------------------------------------------------
    // SET_GAME_PHASE
    // -----------------------------------------------------------------
    case 'SET_GAME_PHASE': {
      return { ...state, gamePhase: action.payload };
    }

    // -----------------------------------------------------------------
    // SET_CURRENT_PLAYER
    // -----------------------------------------------------------------
    case 'SET_CURRENT_PLAYER': {
      return { ...state, currentPlayer: action.payload };
    }

    // -----------------------------------------------------------------
    // DEAL_CARDS
    // -----------------------------------------------------------------
    case 'DEAL_CARDS': {
      const { from, to, faceUp = false } = action.payload;
      const sourceCards = [...(state.locations[from] ?? [])];
      const newLocations: Record<string, CardState[]> = { ...state.locations };

      for (const [target, count] of Object.entries(to)) {
        const dealt: CardState[] = [];
        for (let i = 0; i < count; i++) {
          if (sourceCards.length === 0) break;
          const card = sourceCards.shift()!;
          dealt.push({ ...card, faceUp });
        }
        newLocations[target] = [...(newLocations[target] ?? []), ...dealt];
        if (sourceCards.length === 0) break;
      }

      newLocations[from] = sourceCards;

      return { ...state, locations: newLocations };
    }

    // -----------------------------------------------------------------
    // SHUFFLE_LOCATION
    // -----------------------------------------------------------------
    case 'SHUFFLE_LOCATION': {
      const location = action.payload;
      const cards = state.locations[location];

      if (!cards) {
        return state;
      }

      return {
        ...state,
        locations: {
          ...state.locations,
          [location]: fisherYatesShuffle(cards),
        },
      };
    }

    // -----------------------------------------------------------------
    // RESET
    // -----------------------------------------------------------------
    case 'RESET': {
      return { ...createInitialState(), ...action.payload };
    }

    // -----------------------------------------------------------------
    // Unknown action -- return state unchanged
    // -----------------------------------------------------------------
    default:
      return state;
  }
}
