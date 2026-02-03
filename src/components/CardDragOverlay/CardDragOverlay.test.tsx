/**
 * Tests for the CardDragOverlay component.
 *
 * Covers always-mounted DragOverlay, single-card preview, multi-card
 * stack, badge count, and preview mode CSS class application.
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import type { CardData } from '../../types';

/* ------------------------------------------------------------------ */
/*  Mock @dnd-kit/core                                                 */
/* ------------------------------------------------------------------ */

vi.mock('@dnd-kit/core', () => ({
  DragOverlay: ({ children, ...props }: { children?: React.ReactNode; [k: string]: unknown }) => (
    <div data-testid="dnd-drag-overlay" data-zindex={props.zIndex}>
      {children}
    </div>
  ),
  defaultDropAnimationSideEffects: vi.fn(() => 'side-effects'),
}));

/* ------------------------------------------------------------------ */
/*  Mock Card component                                                */
/* ------------------------------------------------------------------ */

vi.mock('../Card', () => ({
  Card: ({ card, isFaceUp }: { card: CardData; isFaceUp?: boolean }) => (
    <div data-testid="mock-card" data-suit={card.suit} data-rank={card.rank} data-faceup={String(isFaceUp)} />
  ),
}));

/* ------------------------------------------------------------------ */
/*  Mock CSS modules                                                   */
/* ------------------------------------------------------------------ */

vi.mock('./CardDragOverlay.module.css', () => ({
  default: {
    overlay: 'overlay',
    'overlay--translucent': 'overlay--translucent',
    'overlay--miniature': 'overlay--miniature',
    multiStack: 'multiStack',
    multiCard: 'multiCard',
    badge: 'badge',
  },
}));

/* ------------------------------------------------------------------ */
/*  Mock matchMedia for reduced motion hook                            */
/* ------------------------------------------------------------------ */

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

import { CardDragOverlay } from './CardDragOverlay';

/* ------------------------------------------------------------------ */
/*  Test data                                                          */
/* ------------------------------------------------------------------ */

const aceOfSpades: CardData = { suit: 'spades', rank: 'A' };
const kingOfHearts: CardData = { suit: 'hearts', rank: 'K' };
const queenOfDiamonds: CardData = { suit: 'diamonds', rank: 'Q' };
const jackOfClubs: CardData = { suit: 'clubs', rank: 'J' };
const tenOfSpades: CardData = { suit: 'spades', rank: 'T' };

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('CardDragOverlay', () => {
  it('always renders DragOverlay element', () => {
    render(<CardDragOverlay activeCard={null} />);
    expect(screen.getByTestId('dnd-drag-overlay')).toBeDefined();
  });

  it('renders Card when activeCard is provided', () => {
    render(<CardDragOverlay activeCard={aceOfSpades} />);
    const card = screen.getByTestId('mock-card');
    expect(card).toBeDefined();
    expect(card.getAttribute('data-suit')).toBe('spades');
    expect(card.getAttribute('data-rank')).toBe('A');
    expect(card.getAttribute('data-faceup')).toBe('true');
  });

  it('renders nothing inside DragOverlay when activeCard is null', () => {
    render(<CardDragOverlay activeCard={null} />);
    const overlay = screen.getByTestId('dnd-drag-overlay');
    // DragOverlay is mounted but has no card children
    expect(overlay.children.length).toBe(0);
    expect(screen.queryByTestId('mock-card')).toBeNull();
  });

  it('applies translucent class for translucent preview mode', () => {
    render(<CardDragOverlay activeCard={aceOfSpades} previewMode="translucent" />);
    const single = screen.getByTestId('drag-overlay-single');
    expect(single.className).toContain('overlay--translucent');
  });

  it('applies miniature class for miniature preview mode', () => {
    render(<CardDragOverlay activeCard={aceOfSpades} previewMode="miniature" />);
    const single = screen.getByTestId('drag-overlay-single');
    expect(single.className).toContain('overlay--miniature');
  });

  it('renders multi-card stack for selectedCards with 2+ items', () => {
    render(
      <CardDragOverlay
        activeCard={aceOfSpades}
        selectedCards={[aceOfSpades, kingOfHearts]}
      />,
    );
    const multi = screen.getByTestId('drag-overlay-multi');
    expect(multi).toBeDefined();
    const cards = screen.getAllByTestId('mock-card');
    expect(cards.length).toBe(2);
  });

  it('shows badge with count for 4+ selected cards', () => {
    render(
      <CardDragOverlay
        activeCard={aceOfSpades}
        selectedCards={[aceOfSpades, kingOfHearts, queenOfDiamonds, jackOfClubs]}
      />,
    );
    const badge = screen.getByTestId('drag-overlay-badge');
    expect(badge.textContent).toBe('+1');
  });

  it('limits visual stack to 3 cards', () => {
    render(
      <CardDragOverlay
        activeCard={aceOfSpades}
        selectedCards={[aceOfSpades, kingOfHearts, queenOfDiamonds, jackOfClubs, tenOfSpades]}
      />,
    );
    // Only 3 cards rendered visually
    const cards = screen.getAllByTestId('mock-card');
    expect(cards.length).toBe(3);
    // Badge shows +2
    const badge = screen.getByTestId('drag-overlay-badge');
    expect(badge.textContent).toBe('+2');
  });

  it('passes zIndex to DragOverlay', () => {
    render(<CardDragOverlay activeCard={null} zIndex={1500} />);
    const overlay = screen.getByTestId('dnd-drag-overlay');
    expect(overlay.getAttribute('data-zindex')).toBe('1500');
  });
});
