import { describe, it, expect } from 'vitest';
import {
  RANK_NAMES,
  SUIT_NAMES,
  formatCardForSpeech,
  formatCardLabel,
  formatFaceDownLabel,
} from './a11y';
import type { CardData, Rank } from '../types/card';
import { RANKS, SUITS } from '../types/card';

describe('RANK_NAMES', () => {
  it('maps number ranks to themselves', () => {
    const numberRanks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9'];
    for (const rank of numberRanks) {
      expect(RANK_NAMES[rank]).toBe(rank);
    }
  });

  it('maps T to Ten', () => {
    expect(RANK_NAMES['T']).toBe('Ten');
  });

  it('maps J to Jack', () => {
    expect(RANK_NAMES['J']).toBe('Jack');
  });

  it('maps Q to Queen', () => {
    expect(RANK_NAMES['Q']).toBe('Queen');
  });

  it('maps K to King', () => {
    expect(RANK_NAMES['K']).toBe('King');
  });

  it('maps A to Ace', () => {
    expect(RANK_NAMES['A']).toBe('Ace');
  });

  it('covers all 13 ranks', () => {
    for (const rank of RANKS) {
      expect(RANK_NAMES[rank]).toBeDefined();
    }
    expect(Object.keys(RANK_NAMES)).toHaveLength(13);
  });
});

describe('SUIT_NAMES', () => {
  it('maps spades to Spades', () => {
    expect(SUIT_NAMES['spades']).toBe('Spades');
  });

  it('maps hearts to Hearts', () => {
    expect(SUIT_NAMES['hearts']).toBe('Hearts');
  });

  it('maps diamonds to Diamonds', () => {
    expect(SUIT_NAMES['diamonds']).toBe('Diamonds');
  });

  it('maps clubs to Clubs', () => {
    expect(SUIT_NAMES['clubs']).toBe('Clubs');
  });

  it('covers all 4 suits', () => {
    for (const suit of SUITS) {
      expect(SUIT_NAMES[suit]).toBeDefined();
    }
    expect(Object.keys(SUIT_NAMES)).toHaveLength(4);
  });
});

describe('formatCardForSpeech', () => {
  it('formats Ace of Spades', () => {
    const card: CardData = { suit: 'spades', rank: 'A' };
    expect(formatCardForSpeech(card)).toBe('Ace of Spades');
  });

  it('formats 7 of Hearts', () => {
    const card: CardData = { suit: 'hearts', rank: '7' };
    expect(formatCardForSpeech(card)).toBe('7 of Hearts');
  });

  it('formats Ten of Diamonds (T rank)', () => {
    const card: CardData = { suit: 'diamonds', rank: 'T' };
    expect(formatCardForSpeech(card)).toBe('Ten of Diamonds');
  });

  it('formats King of Clubs', () => {
    const card: CardData = { suit: 'clubs', rank: 'K' };
    expect(formatCardForSpeech(card)).toBe('King of Clubs');
  });

  it('formats Queen of Hearts', () => {
    const card: CardData = { suit: 'hearts', rank: 'Q' };
    expect(formatCardForSpeech(card)).toBe('Queen of Hearts');
  });

  it('formats Jack of Spades', () => {
    const card: CardData = { suit: 'spades', rank: 'J' };
    expect(formatCardForSpeech(card)).toBe('Jack of Spades');
  });
});

describe('formatCardLabel', () => {
  it('includes card name, position, total, and location', () => {
    const card: CardData = { suit: 'spades', rank: 'A' };
    const result = formatCardLabel(card, 3, 7, 'your hand');
    expect(result).toBe('Ace of Spades, card 3 of 7 in your hand');
  });

  it('formats position 1 of 1', () => {
    const card: CardData = { suit: 'diamonds', rank: '2' };
    const result = formatCardLabel(card, 1, 1, 'the discard pile');
    expect(result).toBe('2 of Diamonds, card 1 of 1 in the discard pile');
  });

  it('uses the provided location string verbatim', () => {
    const card: CardData = { suit: 'clubs', rank: 'K' };
    const result = formatCardLabel(card, 5, 13, "opponent's hand");
    expect(result).toContain("opponent's hand");
  });
});

describe('formatFaceDownLabel', () => {
  it('returns face-down label with position context', () => {
    const result = formatFaceDownLabel(3, 7, 'deck');
    expect(result).toBe('Face-down card, card 3 of 7 in deck');
  });

  it('never includes card identity', () => {
    // Verify the function signature doesn't accept card data.
    // The function has no CardData parameter, so card identity cannot leak.
    const result = formatFaceDownLabel(1, 52, 'the stock');
    expect(result).not.toMatch(/\bace\b|\bking\b|\bqueen\b|\bjack\b|\bspades?\b|\bhearts?\b|\bdiamonds?\b|\bclubs?\b/i);
    expect(result).toContain('Face-down card');
  });

  it('includes position and total', () => {
    const result = formatFaceDownLabel(10, 20, 'stock');
    expect(result).toContain('card 10 of 20');
  });

  it('includes location', () => {
    const result = formatFaceDownLabel(1, 1, "opponent's hand");
    expect(result).toContain("opponent's hand");
  });
});
