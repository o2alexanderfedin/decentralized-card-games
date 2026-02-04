import { describe, it, expect } from 'vitest';
import {
  dealStandardDeck,
  shuffleLocation,
  moveCard,
  flipCard,
  selectCard,
  setGamePhase,
  setCurrentPlayer,
  reset,
} from './actions';

describe('dealStandardDeck', () => {
  it('produces SET_LOCATIONS action with 52 cards at default "deck" location', () => {
    const action = dealStandardDeck();
    expect(action.type).toBe('SET_LOCATIONS');
    expect(action.payload.locations['deck']).toHaveLength(52);
  });

  it('uses custom location id when provided', () => {
    const action = dealStandardDeck('drawPile');
    expect(action.payload.locations['drawPile']).toHaveLength(52);
    expect(action.payload.locations['deck']).toBeUndefined();
  });

  it('creates cards with faceUp=false and selected=false', () => {
    const action = dealStandardDeck();
    const cards = action.payload.locations['deck'];
    for (const c of cards) {
      expect(c.faceUp).toBe(false);
      expect(c.selected).toBe(false);
    }
  });

  it('contains all 4 suits and 13 ranks', () => {
    const action = dealStandardDeck();
    const cards = action.payload.locations['deck'];
    const suits = new Set(cards.map(c => c.suit));
    const ranks = new Set(cards.map(c => c.rank));
    expect(suits.size).toBe(4);
    expect(ranks.size).toBe(13);
  });
});

describe('shuffleLocation', () => {
  it('produces SHUFFLE_LOCATION action with location payload', () => {
    const action = shuffleLocation('deck');
    expect(action.type).toBe('SHUFFLE_LOCATION');
    expect(action.payload).toBe('deck');
  });
});

describe('moveCard', () => {
  it('produces MOVE_CARD action', () => {
    const action = moveCard(0, 'deck', 'hand');
    expect(action.type).toBe('MOVE_CARD');
    expect(action.payload).toEqual({ cardIndex: 0, from: 'deck', to: 'hand' });
  });
});

describe('flipCard', () => {
  it('produces FLIP_CARD action', () => {
    const action = flipCard('hand', 0, true);
    expect(action.type).toBe('FLIP_CARD');
    expect(action.payload).toEqual({ location: 'hand', cardIndex: 0, faceUp: true });
  });
});

describe('selectCard', () => {
  it('produces SELECT_CARD action', () => {
    const action = selectCard('hand', 2, true);
    expect(action.type).toBe('SELECT_CARD');
    expect(action.payload).toEqual({ location: 'hand', cardIndex: 2, selected: true });
  });
});

describe('setGamePhase', () => {
  it('produces SET_GAME_PHASE action', () => {
    const action = setGamePhase('dealing');
    expect(action.type).toBe('SET_GAME_PHASE');
    expect(action.payload).toBe('dealing');
  });
});

describe('setCurrentPlayer', () => {
  it('produces SET_CURRENT_PLAYER action', () => {
    const action = setCurrentPlayer('player1');
    expect(action.type).toBe('SET_CURRENT_PLAYER');
    expect(action.payload).toBe('player1');
  });
});

describe('reset', () => {
  it('produces RESET action without payload', () => {
    const action = reset();
    expect(action.type).toBe('RESET');
    expect(action.payload).toBeUndefined();
  });

  it('produces RESET action with partial override', () => {
    const action = reset({ gamePhase: 'lobby' });
    expect(action.type).toBe('RESET');
    expect(action.payload).toEqual({ gamePhase: 'lobby' });
  });
});
