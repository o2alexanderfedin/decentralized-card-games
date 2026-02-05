/**
 * Accessibility utilities for card game components.
 *
 * Provides human-readable text builders for screen reader announcements,
 * ARIA labels, and drag-and-drop live region updates.
 */

import type { CardData, Rank, Suit } from '../types/card';

/**
 * Maps single-character rank codes to full spoken names.
 *
 * Number ranks map to themselves (e.g. '2' -> '2').
 * Face ranks and special ranks use full words (e.g. 'A' -> 'Ace').
 */
export const RANK_NAMES: Record<Rank, string> = {
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  T: 'Ten',
  J: 'Jack',
  Q: 'Queen',
  K: 'King',
  A: 'Ace',
};

/**
 * Maps suit identifiers to full spoken names.
 */
export const SUIT_NAMES: Record<Suit, string> = {
  spades: 'Spades',
  hearts: 'Hearts',
  diamonds: 'Diamonds',
  clubs: 'Clubs',
};

/**
 * Format a card as natural language for speech output.
 *
 * Used for drag-and-drop announcements and concise ARIA labels.
 *
 * @param card - The card to describe
 * @returns Natural language card name (e.g. "Ace of Spades")
 *
 * @example
 * ```ts
 * formatCardForSpeech({ suit: 'spades', rank: 'A' }) // "Ace of Spades"
 * formatCardForSpeech({ suit: 'hearts', rank: '7' }) // "7 of Hearts"
 * ```
 */
export function formatCardForSpeech(card: CardData): string {
  return `${RANK_NAMES[card.rank]} of ${SUIT_NAMES[card.suit]}`;
}

/**
 * Format a card label with full positional context for screen readers.
 *
 * Used for ARIA labels on cards within containers (Hand, CardStack).
 *
 * @param card - The card to describe
 * @param position - 1-based position of the card in its container
 * @param total - Total number of cards in the container
 * @param location - Human-readable location name (e.g. "your hand", "the deck")
 * @returns Full context label (e.g. "Ace of Spades, card 3 of 7 in your hand")
 */
export function formatCardLabel(
  card: CardData,
  position: number,
  total: number,
  location: string,
): string {
  return `${RANK_NAMES[card.rank]} of ${SUIT_NAMES[card.suit]}, card ${position} of ${total} in ${location}`;
}

/**
 * Format a label for a face-down card without revealing its identity.
 *
 * Critical for game secrecy: screen readers must not give players
 * an unfair advantage by announcing hidden card identities.
 *
 * @param position - 1-based position of the card in its container
 * @param total - Total number of cards in the container
 * @param location - Human-readable location name (e.g. "deck", "opponent's hand")
 * @returns Face-down label (e.g. "Face-down card, card 3 of 7 in deck")
 */
export function formatFaceDownLabel(
  position: number,
  total: number,
  location: string,
): string {
  return `Face-down card, card ${position} of ${total} in ${location}`;
}
