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

  it('shows suit emoji in center and corners', () => {
    const { container } = render(<CardFace card="♣5" />);
    const text = container.textContent ?? '';
    // Club emoji should appear 3 times (top corner, center, bottom corner)
    const matches = text.match(/♣/g);
    expect(matches).toHaveLength(3);
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
});
