import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardFace } from './CardFace';
import { allCards, formatCard } from '../../types';

describe('CardFace', () => {
  it('renders Ace of Spades from string notation', () => {
    render(<CardFace card="♠A" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'A of spades');
  });

  it('renders King of Hearts from CardData', () => {
    render(<CardFace card={{ suit: 'hearts', rank: 'K' }} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'K of hearts');
  });

  it('displays rank "10" for T notation', () => {
    const { container } = render(<CardFace card="♦T" />);
    // T rank should display as "10" in the rendered output
    expect(container.textContent).toContain('10');
    // Should appear twice (top and bottom corners)
    const matches = (container.textContent ?? '').match(/10/g);
    expect(matches).toHaveLength(2);
  });

  it('applies two-color scheme by default (hearts = red)', () => {
    const { container } = render(<CardFace card="♥7" />);
    const face = container.firstElementChild as HTMLElement;
    expect(face.style.color).toBe('rgb(204, 0, 0)'); // #cc0000
  });

  it('applies four-color scheme (diamonds = blue)', () => {
    const { container } = render(<CardFace card="♦J" colorScheme="four-color" />);
    const face = container.firstElementChild as HTMLElement;
    expect(face.style.color).toBe('rgb(0, 102, 204)'); // #0066cc
  });

  it('applies four-color scheme (clubs = green)', () => {
    const { container } = render(<CardFace card="♣Q" colorScheme="four-color" />);
    const face = container.firstElementChild as HTMLElement;
    expect(face.style.color).toBe('rgb(0, 153, 51)'); // #009933
  });

  it('renders invalid card gracefully with "?" placeholder', () => {
    const { container } = render(<CardFace card="xyz" />);
    expect(container.textContent).toContain('?');
  });

  it('renders all 52 cards without errors', () => {
    const cards = allCards();
    expect(cards).toHaveLength(52);

    for (const card of cards) {
      const notation = formatCard(card);
      const { container, unmount } = render(<CardFace card={notation} />);
      const face = container.querySelector('[role="img"]');
      expect(face).not.toBeNull();
      unmount();
    }
  });

  it('applies custom className', () => {
    const { container } = render(<CardFace card="♠A" className="custom-class" />);
    const face = container.firstElementChild as HTMLElement;
    expect(face.className).toContain('custom-class');
  });

  // ── Pip layout tests ──

  describe('pip layouts for number cards', () => {
    const pipCounts: [string, string, number][] = [
      ['♠2', '2 of spades', 2],
      ['♥3', '3 of hearts', 3],
      ['♦4', '4 of diamonds', 4],
      ['♣5', '5 of clubs', 5],
      ['♠6', '6 of spades', 6],
      ['♥7', '7 of hearts', 7],
      ['♦8', '8 of diamonds', 8],
      ['♣9', '9 of clubs', 9],
      ['♠T', '10 of spades', 10],
    ];

    it.each(pipCounts)(
      '%s shows %d suit symbols in pip grid',
      (notation, _label, expectedCount) => {
        const { container } = render(<CardFace card={notation} />);
        const pipGrid = container.querySelector('[data-testid="pip-grid"]');
        expect(pipGrid).not.toBeNull();
        // Count pip elements inside the grid
        const pips = pipGrid!.querySelectorAll('span');
        expect(pips).toHaveLength(expectedCount);
      }
    );

    it('number card suit symbols are inside pip grid, not center', () => {
      const { container } = render(<CardFace card="♣5" />);
      const pipGrid = container.querySelector('[data-testid="pip-grid"]');
      expect(pipGrid).not.toBeNull();
      // No .center div should exist for number cards
      const text = container.textContent ?? '';
      // Club emoji appears: 5 pips only (no suit in corners for number cards)
      const matches = text.match(/♣/g);
      expect(matches).toHaveLength(5);
    });

    it('pip grid is not rendered for face cards', () => {
      const { container: jContainer } = render(<CardFace card="♠J" />);
      expect(jContainer.querySelector('[data-testid="pip-grid"]')).toBeNull();

      const { container: qContainer } = render(<CardFace card="♥Q" />);
      expect(qContainer.querySelector('[data-testid="pip-grid"]')).toBeNull();

      const { container: kContainer } = render(<CardFace card="♦K" />);
      expect(kContainer.querySelector('[data-testid="pip-grid"]')).toBeNull();
    });

    it('pip grid is not rendered for Ace', () => {
      const { container } = render(<CardFace card="♠A" />);
      expect(container.querySelector('[data-testid="pip-grid"]')).toBeNull();
    });

    it('face cards show single large center symbol', () => {
      const { container } = render(<CardFace card="♠K" />);
      const text = container.textContent ?? '';
      // Spade emoji appears: 2 corners + 1 center = 3 total
      const matches = text.match(/♠/g);
      expect(matches).toHaveLength(3);
    });

    it('Ace shows single large center symbol', () => {
      const { container } = render(<CardFace card="♥A" />);
      const text = container.textContent ?? '';
      // Heart emoji appears: 2 corners + 1 center = 3 total
      const matches = text.match(/♥/g);
      expect(matches).toHaveLength(3);
    });
  });
});
