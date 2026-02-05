import { describe, it, expect } from 'vitest';
import type { GameState, CardState } from './types';
import {
  selectAllLocations,
  selectLocation,
  selectCard,
  selectGamePhase,
  selectCurrentPlayer,
  selectLocationCount,
} from './selectors';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const aceOfSpades: CardState = { suit: 'S', rank: 'A', faceUp: false, selected: false };
const kingOfHearts: CardState = { suit: 'H', rank: 'K', faceUp: true, selected: false };
const queenOfDiamonds: CardState = { suit: 'D', rank: 'Q', faceUp: false, selected: true };

const sampleState: GameState = {
  locations: {
    deck: [aceOfSpades],
    hand: [kingOfHearts, queenOfDiamonds],
  },
  currentPlayer: 'player1',
  gamePhase: 'dealing',
  meta: {},
};

const emptyState: GameState = {
  locations: {},
  currentPlayer: null,
  gamePhase: null,
  meta: {},
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('selectAllLocations', () => {
  it('returns the locations record', () => {
    expect(selectAllLocations(sampleState)).toBe(sampleState.locations);
  });

  it('returns empty object when no locations exist', () => {
    expect(selectAllLocations(emptyState)).toEqual({});
  });
});

describe('selectLocation', () => {
  it('returns cards at an existing location', () => {
    expect(selectLocation(sampleState, 'hand')).toEqual([kingOfHearts, queenOfDiamonds]);
  });

  it('returns empty array for missing location', () => {
    expect(selectLocation(sampleState, 'nonexistent')).toEqual([]);
  });

  it('returns empty array from empty state', () => {
    expect(selectLocation(emptyState, 'deck')).toEqual([]);
  });
});

describe('selectCard', () => {
  it('returns the card at a valid index', () => {
    expect(selectCard(sampleState, 'hand', 0)).toBe(kingOfHearts);
    expect(selectCard(sampleState, 'hand', 1)).toBe(queenOfDiamonds);
  });

  it('returns undefined for out-of-bounds index', () => {
    expect(selectCard(sampleState, 'hand', 99)).toBeUndefined();
  });

  it('returns undefined for negative index', () => {
    expect(selectCard(sampleState, 'hand', -1)).toBeUndefined();
  });

  it('returns undefined for missing location', () => {
    expect(selectCard(sampleState, 'nonexistent', 0)).toBeUndefined();
  });
});

describe('selectGamePhase', () => {
  it('returns the game phase when set', () => {
    expect(selectGamePhase(sampleState)).toBe('dealing');
  });

  it('returns null when unset', () => {
    expect(selectGamePhase(emptyState)).toBeNull();
  });
});

describe('selectCurrentPlayer', () => {
  it('returns the current player when set', () => {
    expect(selectCurrentPlayer(sampleState)).toBe('player1');
  });

  it('returns null when unset', () => {
    expect(selectCurrentPlayer(emptyState)).toBeNull();
  });
});

describe('selectLocationCount', () => {
  it('returns the number of cards at an existing location', () => {
    expect(selectLocationCount(sampleState, 'hand')).toBe(2);
    expect(selectLocationCount(sampleState, 'deck')).toBe(1);
  });

  it('returns 0 for missing location', () => {
    expect(selectLocationCount(sampleState, 'nonexistent')).toBe(0);
  });

  it('returns 0 from empty state', () => {
    expect(selectLocationCount(emptyState, 'deck')).toBe(0);
  });
});
