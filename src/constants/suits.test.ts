import { describe, it, expect } from 'vitest';
import {
  SUIT_EMOJI,
  SUIT_COLORS_TWO,
  SUIT_COLORS_FOUR,
  getSuitColor,
} from './suits';
import { SUITS } from '../types';

describe('SUIT_EMOJI', () => {
  it('maps all four suits to emoji symbols', () => {
    expect(SUIT_EMOJI['spades']).toBe('\u2660');
    expect(SUIT_EMOJI['hearts']).toBe('\u2665');
    expect(SUIT_EMOJI['diamonds']).toBe('\u2666');
    expect(SUIT_EMOJI['clubs']).toBe('\u2663');
  });

  it('has entries for all suits', () => {
    for (const suit of SUITS) {
      expect(SUIT_EMOJI[suit]).toBeDefined();
      expect(typeof SUIT_EMOJI[suit]).toBe('string');
    }
  });
});

describe('SUIT_COLORS_TWO', () => {
  it('uses black for spades and clubs', () => {
    expect(SUIT_COLORS_TWO['spades']).toBe('#000000');
    expect(SUIT_COLORS_TWO['clubs']).toBe('#000000');
  });

  it('uses red for hearts and diamonds', () => {
    expect(SUIT_COLORS_TWO['hearts']).toBe('#cc0000');
    expect(SUIT_COLORS_TWO['diamonds']).toBe('#cc0000');
  });
});

describe('SUIT_COLORS_FOUR', () => {
  it('assigns distinct colors to each suit', () => {
    expect(SUIT_COLORS_FOUR['spades']).toBe('#000000');   // black
    expect(SUIT_COLORS_FOUR['hearts']).toBe('#cc0000');   // red
    expect(SUIT_COLORS_FOUR['diamonds']).toBe('#0066cc'); // blue
    expect(SUIT_COLORS_FOUR['clubs']).toBe('#009933');    // green
  });

  it('all four colors are unique', () => {
    const colors = Object.values(SUIT_COLORS_FOUR);
    const unique = new Set(colors);
    expect(unique.size).toBe(4);
  });
});

describe('getSuitColor', () => {
  it('defaults to two-color scheme', () => {
    expect(getSuitColor('diamonds')).toBe('#cc0000');
    expect(getSuitColor('clubs')).toBe('#000000');
  });

  it('returns four-color values when specified', () => {
    expect(getSuitColor('diamonds', 'four-color')).toBe('#0066cc');
    expect(getSuitColor('clubs', 'four-color')).toBe('#009933');
  });

  it('returns two-color values when explicitly specified', () => {
    expect(getSuitColor('diamonds', 'two-color')).toBe('#cc0000');
    expect(getSuitColor('clubs', 'two-color')).toBe('#000000');
  });
});
