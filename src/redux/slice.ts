/**
 * Redux Toolkit slice for card game state.
 *
 * Wraps the shared GameState types with Immer-powered mutations via createSlice.
 * All RTK imports are strictly confined to the src/redux/ directory.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  GameState,
  MoveCardPayload,
  FlipCardPayload,
  SelectCardPayload,
  SetLocationsPayload,
  DealCardsPayload,
} from '../state/types';
import { createInitialState } from '../state/initialState';

/**
 * Fisher-Yates in-place shuffle (Immer draft-safe).
 */
function fisherYatesInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export const gameSlice = createSlice({
  name: 'cardGame',
  initialState: createInitialState(),
  reducers: {
    moveCard(state, action: PayloadAction<MoveCardPayload>) {
      const { cardIndex, from, to } = action.payload;
      const sourceCards = state.locations[from];
      if (!sourceCards || cardIndex < 0 || cardIndex >= sourceCards.length) {
        return;
      }
      const [movedCard] = sourceCards.splice(cardIndex, 1);
      if (!state.locations[to]) {
        state.locations[to] = [];
      }
      state.locations[to].push(movedCard);
    },

    flipCard(state, action: PayloadAction<FlipCardPayload>) {
      const { location, cardIndex, faceUp } = action.payload;
      const cards = state.locations[location];
      if (!cards || cardIndex < 0 || cardIndex >= cards.length) {
        return;
      }
      cards[cardIndex].faceUp = faceUp;
    },

    selectCard(state, action: PayloadAction<SelectCardPayload>) {
      const { location, cardIndex, selected } = action.payload;
      const cards = state.locations[location];
      if (!cards || cardIndex < 0 || cardIndex >= cards.length) {
        return;
      }
      cards[cardIndex].selected = selected;
    },

    setLocations(state, action: PayloadAction<SetLocationsPayload>) {
      Object.assign(state.locations, action.payload.locations);
    },

    setGamePhase(state, action: PayloadAction<string>) {
      state.gamePhase = action.payload;
    },

    setCurrentPlayer(state, action: PayloadAction<string>) {
      state.currentPlayer = action.payload;
    },

    dealCards(state, action: PayloadAction<DealCardsPayload>) {
      const { from, to, faceUp = false } = action.payload;
      const sourceCards = state.locations[from];
      if (!sourceCards) return;

      for (const [target, count] of Object.entries(to)) {
        for (let i = 0; i < count; i++) {
          if (sourceCards.length === 0) return;
          const card = sourceCards.shift()!;
          card.faceUp = faceUp;
          if (!state.locations[target]) {
            state.locations[target] = [];
          }
          state.locations[target].push(card);
        }
      }
    },

    shuffleLocation(state, action: PayloadAction<string>) {
      const cards = state.locations[action.payload];
      if (!cards) return;
      fisherYatesInPlace(cards);
    },

    reset(_state, action: PayloadAction<Partial<GameState> | undefined>) {
      return { ...createInitialState(), ...action.payload };
    },
  },
  selectors: {
    selectLocations: (state) => state.locations,
    selectGamePhase: (state) => state.gamePhase,
    selectCurrentPlayer: (state) => state.currentPlayer,
  },
});

// Export all action creators
export const {
  moveCard,
  flipCard,
  selectCard,
  setLocations,
  setGamePhase,
  setCurrentPlayer,
  dealCards,
  shuffleLocation,
  reset,
} = gameSlice.actions;

// Default export: the reducer
export default gameSlice.reducer;
