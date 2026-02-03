/**
 * Suit display constants: emoji mappings and color schemes.
 *
 * Provides visual configuration for card rendering, supporting
 * both traditional two-color and modern four-color variants.
 */

import type { Suit } from '../types';

/**
 * Emoji symbol for each suit.
 *
 * @example
 * ```ts
 * SUIT_EMOJI['spades']   // '♠'
 * SUIT_EMOJI['hearts']   // '♥'
 * ```
 */
export const SUIT_EMOJI: Record<Suit, string> = {
  spades: '\u2660',   // ♠
  hearts: '\u2665',   // ♥
  diamonds: '\u2666', // ♦
  clubs: '\u2663',    // ♣
};

/**
 * Traditional two-color scheme.
 * Spades and clubs are black; hearts and diamonds are red.
 */
export const SUIT_COLORS_TWO: Record<Suit, string> = {
  spades: '#000000',
  hearts: '#cc0000',
  diamonds: '#cc0000',
  clubs: '#000000',
};

/**
 * Four-color scheme for improved readability.
 * Each suit has a distinct color: black, red, blue, green.
 *
 * Decision from CONTEXT.md: support four-color variant for
 * better suit differentiation in digital environments.
 */
export const SUIT_COLORS_FOUR: Record<Suit, string> = {
  spades: '#000000',   // black
  hearts: '#cc0000',   // red
  diamonds: '#0066cc', // blue
  clubs: '#009933',    // green
};

/** Color scheme type identifier. */
export type ColorScheme = 'two-color' | 'four-color';

/**
 * Get the color for a suit given a color scheme.
 *
 * @param suit - The card suit
 * @param scheme - The color scheme to use
 * @returns Hex color string
 */
export function getSuitColor(suit: Suit, scheme: ColorScheme = 'two-color'): string {
  return scheme === 'four-color'
    ? SUIT_COLORS_FOUR[suit]
    : SUIT_COLORS_TWO[suit];
}
