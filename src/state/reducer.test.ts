import { describe, it, expect } from 'vitest';
import { gameReducer } from './reducer';
import { createInitialState } from './initialState';
import type { GameState, CardState, GameAction } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function card(suit: CardState['suit'], rank: CardState['rank'], overrides: Partial<CardState> = {}): CardState {
  return { suit, rank, faceUp: false, selected: false, ...overrides };
}

function stateWith(locations: Record<string, CardState[]>): GameState {
  return createInitialState({ locations });
}

// ---------------------------------------------------------------------------
// MOVE_CARD
// ---------------------------------------------------------------------------

describe('gameReducer - MOVE_CARD', () => {
  it('moves a card from one location to another by index', () => {
    const state = stateWith({
      deck: [card('spades', 'A'), card('hearts', 'K')],
      hand: [card('clubs', '3')],
    });
    const result = gameReducer(state, {
      type: 'MOVE_CARD',
      payload: { cardIndex: 0, from: 'deck', to: 'hand' },
    });
    expect(result.locations.deck).toHaveLength(1);
    expect(result.locations.deck[0].rank).toBe('K');
    expect(result.locations.hand).toHaveLength(2);
    expect(result.locations.hand[1].rank).toBe('A');
  });

  it('returns unchanged state if source location does not exist', () => {
    const state = stateWith({ hand: [card('spades', 'A')] });
    const result = gameReducer(state, {
      type: 'MOVE_CARD',
      payload: { cardIndex: 0, from: 'nonexistent', to: 'hand' },
    });
    expect(result).toBe(state);
  });

  it('returns unchanged state if card index is out of bounds', () => {
    const state = stateWith({ deck: [card('spades', 'A')] });
    const result = gameReducer(state, {
      type: 'MOVE_CARD',
      payload: { cardIndex: 5, from: 'deck', to: 'hand' },
    });
    expect(result).toBe(state);
  });

  it('auto-creates target location if missing', () => {
    const state = stateWith({ deck: [card('spades', 'A')] });
    const result = gameReducer(state, {
      type: 'MOVE_CARD',
      payload: { cardIndex: 0, from: 'deck', to: 'newLocation' },
    });
    expect(result.locations.newLocation).toHaveLength(1);
    expect(result.locations.newLocation[0].suit).toBe('spades');
  });
});

// ---------------------------------------------------------------------------
// FLIP_CARD
// ---------------------------------------------------------------------------

describe('gameReducer - FLIP_CARD', () => {
  it('sets faceUp on card at location and index', () => {
    const state = stateWith({ hand: [card('spades', 'A')] });
    const result = gameReducer(state, {
      type: 'FLIP_CARD',
      payload: { location: 'hand', cardIndex: 0, faceUp: true },
    });
    expect(result.locations.hand[0].faceUp).toBe(true);
  });

  it('returns unchanged state if location does not exist', () => {
    const state = stateWith({});
    const result = gameReducer(state, {
      type: 'FLIP_CARD',
      payload: { location: 'missing', cardIndex: 0, faceUp: true },
    });
    expect(result).toBe(state);
  });

  it('returns unchanged state if index out of bounds', () => {
    const state = stateWith({ hand: [card('spades', 'A')] });
    const result = gameReducer(state, {
      type: 'FLIP_CARD',
      payload: { location: 'hand', cardIndex: 5, faceUp: true },
    });
    expect(result).toBe(state);
  });
});

// ---------------------------------------------------------------------------
// SELECT_CARD
// ---------------------------------------------------------------------------

describe('gameReducer - SELECT_CARD', () => {
  it('sets selected on card at location and index', () => {
    const state = stateWith({ hand: [card('spades', 'A')] });
    const result = gameReducer(state, {
      type: 'SELECT_CARD',
      payload: { location: 'hand', cardIndex: 0, selected: true },
    });
    expect(result.locations.hand[0].selected).toBe(true);
  });

  it('returns unchanged state if location or index invalid', () => {
    const state = stateWith({});
    const result = gameReducer(state, {
      type: 'SELECT_CARD',
      payload: { location: 'missing', cardIndex: 0, selected: true },
    });
    expect(result).toBe(state);
  });
});

// ---------------------------------------------------------------------------
// SET_LOCATIONS
// ---------------------------------------------------------------------------

describe('gameReducer - SET_LOCATIONS', () => {
  it('merges provided locations into existing state', () => {
    const state = stateWith({
      deck: [card('spades', 'A')],
      hand: [card('hearts', 'K')],
    });
    const result = gameReducer(state, {
      type: 'SET_LOCATIONS',
      payload: { locations: { discard: [card('clubs', '2')] } },
    });
    // existing locations preserved
    expect(result.locations.deck).toHaveLength(1);
    expect(result.locations.hand).toHaveLength(1);
    // new location added
    expect(result.locations.discard).toHaveLength(1);
  });

  it('overwrites location if key already exists in payload', () => {
    const state = stateWith({ deck: [card('spades', 'A')] });
    const result = gameReducer(state, {
      type: 'SET_LOCATIONS',
      payload: { locations: { deck: [card('hearts', 'K'), card('clubs', '2')] } },
    });
    expect(result.locations.deck).toHaveLength(2);
    expect(result.locations.deck[0].suit).toBe('hearts');
  });
});

// ---------------------------------------------------------------------------
// SET_GAME_PHASE
// ---------------------------------------------------------------------------

describe('gameReducer - SET_GAME_PHASE', () => {
  it('sets gamePhase string', () => {
    const state = createInitialState();
    const result = gameReducer(state, { type: 'SET_GAME_PHASE', payload: 'dealing' });
    expect(result.gamePhase).toBe('dealing');
  });
});

// ---------------------------------------------------------------------------
// SET_CURRENT_PLAYER
// ---------------------------------------------------------------------------

describe('gameReducer - SET_CURRENT_PLAYER', () => {
  it('sets currentPlayer string', () => {
    const state = createInitialState();
    const result = gameReducer(state, { type: 'SET_CURRENT_PLAYER', payload: 'player1' });
    expect(result.currentPlayer).toBe('player1');
  });
});

// ---------------------------------------------------------------------------
// DEAL_CARDS
// ---------------------------------------------------------------------------

describe('gameReducer - DEAL_CARDS', () => {
  it('deals N cards from source to each target', () => {
    const deck = Array.from({ length: 10 }, (_, i) =>
      card('spades', String(i) as CardState['rank']),
    );
    // Use valid ranks
    const validDeck = [
      card('spades', '2'), card('spades', '3'), card('spades', '4'),
      card('spades', '5'), card('spades', '6'), card('spades', '7'),
      card('spades', '8'), card('spades', '9'), card('hearts', '2'),
      card('hearts', '3'),
    ];
    const state = stateWith({ deck: validDeck });
    const result = gameReducer(state, {
      type: 'DEAL_CARDS',
      payload: { from: 'deck', to: { hand1: 3, hand2: 3 }, faceUp: true },
    });
    expect(result.locations.hand1).toHaveLength(3);
    expect(result.locations.hand2).toHaveLength(3);
    expect(result.locations.deck).toHaveLength(4);
    // dealt cards should be face-up
    expect(result.locations.hand1[0].faceUp).toBe(true);
  });

  it('handles insufficient cards gracefully', () => {
    const state = stateWith({ deck: [card('spades', 'A')] });
    const result = gameReducer(state, {
      type: 'DEAL_CARDS',
      payload: { from: 'deck', to: { hand1: 5, hand2: 5 } },
    });
    // Should deal what it can without crashing
    const totalDealt = (result.locations.hand1?.length ?? 0) + (result.locations.hand2?.length ?? 0);
    expect(totalDealt).toBeLessThanOrEqual(1);
    expect(result.locations.deck).toHaveLength(0);
  });

  it('defaults faceUp to false when not specified', () => {
    const state = stateWith({ deck: [card('spades', 'A'), card('hearts', 'K')] });
    const result = gameReducer(state, {
      type: 'DEAL_CARDS',
      payload: { from: 'deck', to: { hand: 2 } },
    });
    expect(result.locations.hand[0].faceUp).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// SHUFFLE_LOCATION
// ---------------------------------------------------------------------------

describe('gameReducer - SHUFFLE_LOCATION', () => {
  it('preserves array length after shuffle', () => {
    const cards = [
      card('spades', 'A'), card('hearts', 'K'), card('diamonds', 'Q'),
      card('clubs', 'J'), card('spades', 'T'),
    ];
    const state = stateWith({ deck: cards });
    const result = gameReducer(state, { type: 'SHUFFLE_LOCATION', payload: 'deck' });
    expect(result.locations.deck).toHaveLength(5);
  });

  it('preserves same card instances (contents not lost)', () => {
    const cards = [
      card('spades', 'A'), card('hearts', 'K'), card('diamonds', 'Q'),
    ];
    const state = stateWith({ deck: cards });
    const result = gameReducer(state, { type: 'SHUFFLE_LOCATION', payload: 'deck' });
    const suits = result.locations.deck.map(c => c.suit).sort();
    expect(suits).toEqual(['diamonds', 'hearts', 'spades']);
  });

  it('returns unchanged state if location does not exist', () => {
    const state = stateWith({});
    const result = gameReducer(state, { type: 'SHUFFLE_LOCATION', payload: 'missing' });
    expect(result).toBe(state);
  });
});

// ---------------------------------------------------------------------------
// RESET
// ---------------------------------------------------------------------------

describe('gameReducer - RESET', () => {
  it('returns initial state', () => {
    const state = stateWith({ deck: [card('spades', 'A')] });
    const result = gameReducer(state, { type: 'RESET' });
    expect(result.locations).toEqual({});
    expect(result.currentPlayer).toBeNull();
    expect(result.gamePhase).toBeNull();
    expect(result.meta).toEqual({});
  });

  it('merges optional partial override', () => {
    const state = stateWith({ deck: [card('spades', 'A')] });
    const result = gameReducer(state, {
      type: 'RESET',
      payload: { gamePhase: 'lobby' },
    });
    expect(result.gamePhase).toBe('lobby');
    expect(result.locations).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Unknown action
// ---------------------------------------------------------------------------

describe('gameReducer - unknown action', () => {
  it('returns state unchanged for unknown action type', () => {
    const state = createInitialState();
    const result = gameReducer(state, { type: 'UNKNOWN_ACTION' } as unknown as GameAction);
    expect(result).toBe(state);
  });
});
