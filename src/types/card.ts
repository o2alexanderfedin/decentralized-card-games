/**
 * Core type definitions for playing cards.
 *
 * Uses TypeScript const assertions and literal unions for type-safe
 * representation of the standard 52-card deck.
 */

/** All four card suits in standard order. */
export const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const;

/** A card suit: spades, hearts, diamonds, or clubs. */
export type Suit = (typeof SUITS)[number];

/**
 * All thirteen card ranks.
 * 'T' represents 10 (single-character notation for consistent string lengths).
 */
export const RANKS = [
  '2', '3', '4', '5', '6', '7', '8', '9', 'T',
  'J', 'Q', 'K', 'A',
] as const;

/** A card rank: 2-9, T (10), J, Q, K, A. */
export type Rank = (typeof RANKS)[number];

/** Data representation of a single playing card. */
export interface CardData {
  /** The card's suit. */
  suit: Suit;
  /** The card's rank. */
  rank: Rank;
}

/**
 * Mapping from emoji suit symbols to Suit type values.
 * Used internally by parseCard for emoji notation parsing.
 */
const EMOJI_TO_SUIT: Record<string, Suit> = {
  '\u2660': 'spades',   // ♠
  '\u2665': 'hearts',   // ♥
  '\u2666': 'diamonds', // ♦
  '\u2663': 'clubs',    // ♣
};

/**
 * Mapping from Suit type values to emoji suit symbols.
 * Used internally by formatCard for emoji notation output.
 */
const SUIT_TO_EMOJI: Record<Suit, string> = {
  spades: '\u2660',   // ♠
  hearts: '\u2665',   // ♥
  diamonds: '\u2666', // ♦
  clubs: '\u2663',    // ♣
};

/**
 * Mapping from text suit abbreviations to Suit type values.
 * Supports alternative notation: s=spades, h=hearts, d=diamonds, c=clubs.
 */
const TEXT_TO_SUIT: Record<string, Suit> = {
  s: 'spades',
  h: 'hearts',
  d: 'diamonds',
  c: 'clubs',
};

/**
 * Type guard: checks if a value is a valid Suit.
 */
export function isSuit(value: string): value is Suit {
  return (SUITS as readonly string[]).includes(value);
}

/**
 * Type guard: checks if a value is a valid Rank.
 */
export function isRank(value: string): value is Rank {
  return (RANKS as readonly string[]).includes(value);
}

/**
 * Parse card notation string to CardData.
 *
 * Supports two notation formats:
 * - Emoji notation: "♠A", "♥7", "♦T", "♣K"
 * - Text notation: "sA", "h7", "dT", "cK"
 *
 * @param notation - Card notation string (e.g., "♠A" or "sA")
 * @returns CardData if valid, null if notation is invalid
 *
 * @example
 * ```ts
 * parseCard("♠A")  // { suit: 'spades', rank: 'A' }
 * parseCard("♥7")  // { suit: 'hearts', rank: '7' }
 * parseCard("sA")  // { suit: 'spades', rank: 'A' }
 * parseCard("xyz") // null
 * ```
 */
export function parseCard(notation: string): CardData | null {
  if (!notation || notation.length < 2) {
    return null;
  }

  let suit: Suit | undefined;
  let rankStr: string;

  // Try suit-first notation (♠A, sA)
  const firstChar = notation.charAt(0);
  suit = EMOJI_TO_SUIT[firstChar];

  if (suit) {
    rankStr = notation.slice(1);
  } else {
    // Try text notation (first character is s/h/d/c)
    suit = TEXT_TO_SUIT[firstChar.toLowerCase()];
    if (suit) {
      rankStr = notation.slice(1);
    } else {
      // Try rank-first notation (A♠, As)
      const lastChar = notation.charAt(notation.length - 1);
      suit = EMOJI_TO_SUIT[lastChar];

      if (!suit) {
        suit = TEXT_TO_SUIT[lastChar.toLowerCase()];
      }

      if (suit) {
        rankStr = notation.slice(0, -1);
      } else {
        return null;
      }
    }
  }

  // Validate rank
  if (!isRank(rankStr)) {
    return null;
  }

  return { suit, rank: rankStr };
}

/**
 * Format CardData to emoji notation string.
 *
 * @param card - CardData to format
 * @returns Emoji notation string (e.g., "♠A", "♥7")
 *
 * @example
 * ```ts
 * formatCard({ suit: 'spades', rank: 'A' })  // "♠A"
 * formatCard({ suit: 'hearts', rank: '7' })   // "♥7"
 * ```
 */
export function formatCard(card: CardData): string {
  return `${SUIT_TO_EMOJI[card.suit]}${card.rank}`;
}

/**
 * Generate all 52 cards in the standard deck.
 *
 * @returns Array of 52 CardData objects, ordered by suit then rank
 */
export function allCards(): CardData[] {
  const cards: CardData[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ suit, rank });
    }
  }
  return cards;
}
