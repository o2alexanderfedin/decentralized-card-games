import { describe, it, expect } from 'vitest';
import {
  SUITS,
  RANKS,
  parseCard,
  formatCard,
  allCards,
  isSuit,
  isRank,
} from './card';

describe('SUITS and RANKS constants', () => {
  it('has exactly 4 suits', () => {
    expect(SUITS).toHaveLength(4);
    expect(SUITS).toEqual(['spades', 'hearts', 'diamonds', 'clubs']);
  });

  it('has exactly 13 ranks', () => {
    expect(RANKS).toHaveLength(13);
    expect(RANKS).toEqual([
      '2', '3', '4', '5', '6', '7', '8', '9', 'T',
      'J', 'Q', 'K', 'A',
    ]);
  });
});

describe('isSuit', () => {
  it('returns true for valid suits', () => {
    expect(isSuit('spades')).toBe(true);
    expect(isSuit('hearts')).toBe(true);
    expect(isSuit('diamonds')).toBe(true);
    expect(isSuit('clubs')).toBe(true);
  });

  it('returns false for invalid suits', () => {
    expect(isSuit('joker')).toBe(false);
    expect(isSuit('')).toBe(false);
    expect(isSuit('SPADES')).toBe(false);
  });
});

describe('isRank', () => {
  it('returns true for valid ranks', () => {
    expect(isRank('A')).toBe(true);
    expect(isRank('K')).toBe(true);
    expect(isRank('T')).toBe(true);
    expect(isRank('2')).toBe(true);
  });

  it('returns false for invalid ranks', () => {
    expect(isRank('1')).toBe(false);
    expect(isRank('10')).toBe(false);
    expect(isRank('')).toBe(false);
    expect(isRank('X')).toBe(false);
  });
});

describe('parseCard', () => {
  it('parses emoji notation for all suits', () => {
    expect(parseCard('\u2660A')).toEqual({ suit: 'spades', rank: 'A' });
    expect(parseCard('\u26657')).toEqual({ suit: 'hearts', rank: '7' });
    expect(parseCard('\u2666T')).toEqual({ suit: 'diamonds', rank: 'T' });
    expect(parseCard('\u2663K')).toEqual({ suit: 'clubs', rank: 'K' });
  });

  it('parses text notation for all suits', () => {
    expect(parseCard('sA')).toEqual({ suit: 'spades', rank: 'A' });
    expect(parseCard('h7')).toEqual({ suit: 'hearts', rank: '7' });
    expect(parseCard('dT')).toEqual({ suit: 'diamonds', rank: 'T' });
    expect(parseCard('cK')).toEqual({ suit: 'clubs', rank: 'K' });
  });

  it('handles case-insensitive text notation', () => {
    expect(parseCard('SA')).toEqual({ suit: 'spades', rank: 'A' });
    expect(parseCard('H7')).toEqual({ suit: 'hearts', rank: '7' });
  });

  it('returns null for invalid notation', () => {
    expect(parseCard('invalid')).toBeNull();
    expect(parseCard('')).toBeNull();
    expect(parseCard('x')).toBeNull();
    expect(parseCard('\u26601')).toBeNull(); // Invalid rank
    expect(parseCard('\u266010')).toBeNull(); // Multi-char invalid rank
    expect(parseCard('z5')).toBeNull(); // Invalid suit letter
  });

  it('correctly parses all 52 cards via emoji notation', () => {
    const suitEmojis: Record<string, string> = {
      spades: '\u2660',
      hearts: '\u2665',
      diamonds: '\u2666',
      clubs: '\u2663',
    };

    for (const suit of SUITS) {
      for (const rank of RANKS) {
        const notation = `${suitEmojis[suit]}${rank}`;
        const result = parseCard(notation);
        expect(result).not.toBeNull();
        expect(result!.suit).toBe(suit);
        expect(result!.rank).toBe(rank);
      }
    }
  });

  it('correctly parses all 52 cards via text notation', () => {
    const suitLetters: Record<string, string> = {
      spades: 's',
      hearts: 'h',
      diamonds: 'd',
      clubs: 'c',
    };

    for (const suit of SUITS) {
      for (const rank of RANKS) {
        const notation = `${suitLetters[suit]}${rank}`;
        const result = parseCard(notation);
        expect(result).not.toBeNull();
        expect(result!.suit).toBe(suit);
        expect(result!.rank).toBe(rank);
      }
    }
  });
});

describe('formatCard', () => {
  it('formats card data to emoji notation', () => {
    expect(formatCard({ suit: 'spades', rank: 'A' })).toBe('\u2660A');
    expect(formatCard({ suit: 'hearts', rank: '7' })).toBe('\u26657');
    expect(formatCard({ suit: 'diamonds', rank: 'T' })).toBe('\u2666T');
    expect(formatCard({ suit: 'clubs', rank: 'K' })).toBe('\u2663K');
  });

  it('is the inverse of parseCard', () => {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        const card = { suit, rank };
        const notation = formatCard(card);
        const parsed = parseCard(notation);
        expect(parsed).toEqual(card);
      }
    }
  });
});

describe('allCards', () => {
  it('returns exactly 52 cards', () => {
    expect(allCards()).toHaveLength(52);
  });

  it('contains no duplicates', () => {
    const cards = allCards();
    const notations = cards.map(formatCard);
    const unique = new Set(notations);
    expect(unique.size).toBe(52);
  });

  it('contains all suits and ranks', () => {
    const cards = allCards();
    const suits = new Set(cards.map((c) => c.suit));
    const ranks = new Set(cards.map((c) => c.rank));
    expect(suits.size).toBe(4);
    expect(ranks.size).toBe(13);
  });
});
