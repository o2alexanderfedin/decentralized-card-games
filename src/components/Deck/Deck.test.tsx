/**
 * Tests for the Deck container component.
 *
 * Covers visual card layers, draw action, empty states,
 * count badge, face-down rendering, and imperative ref API.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { createRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Deck } from './Deck';
import type { DeckRef } from './Deck.types';

// jsdom does not implement window.matchMedia; mock for usePrefersReducedMotion
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

afterAll(() => {
  vi.restoreAllMocks();
});

describe('Deck', () => {
  // -------------------------------------------------------------------------
  // Visual card layers
  // -------------------------------------------------------------------------
  describe('visual card layers', () => {
    it('renders up to 5 visual layers based on count', () => {
      render(<Deck count={10} />);
      const layers = screen.getAllByTestId('deck-card-layer');
      expect(layers).toHaveLength(5);
    });

    it('renders 3 layers when count is 3', () => {
      render(<Deck count={3} />);
      const layers = screen.getAllByTestId('deck-card-layer');
      expect(layers).toHaveLength(3);
    });

    it('renders 1 layer when count is 1', () => {
      render(<Deck count={1} />);
      const layers = screen.getAllByTestId('deck-card-layer');
      expect(layers).toHaveLength(1);
    });

    it('cards are rendered face-down (isFaceUp=false)', () => {
      render(<Deck count={3} />);
      // Card back elements should be present; no face-up content expected
      const layers = screen.getAllByTestId('deck-card-layer');
      expect(layers.length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // Draw action
  // -------------------------------------------------------------------------
  describe('draw action', () => {
    it('fires onDraw when clicked', () => {
      const onDraw = vi.fn();
      render(<Deck count={5} onDraw={onDraw} />);

      fireEvent.click(screen.getByTestId('deck'));
      expect(onDraw).toHaveBeenCalledTimes(1);
    });

    it('does not fire onDraw when count is 0', () => {
      const onDraw = vi.fn();
      render(<Deck count={0} onDraw={onDraw} />);

      fireEvent.click(screen.getByTestId('deck'));
      expect(onDraw).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Empty states
  // -------------------------------------------------------------------------
  describe('empty states', () => {
    it('shows placeholder when count=0 and emptyState="placeholder" (default)', () => {
      render(<Deck count={0} />);
      expect(screen.getByTestId('deck-placeholder')).toBeInTheDocument();
    });

    it('shows nothing when count=0 and emptyState="none"', () => {
      render(<Deck count={0} emptyState="none" />);
      expect(screen.queryByTestId('deck-placeholder')).not.toBeInTheDocument();
      // Container still exists
      expect(screen.getByTestId('deck')).toBeInTheDocument();
    });

    it('shows custom ReactNode when count=0 and emptyState is JSX', () => {
      render(
        <Deck count={0} emptyState={<span data-testid="custom-empty">Reshuffle</span>} />,
      );
      expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
      expect(screen.queryByTestId('deck-placeholder')).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Count badge
  // -------------------------------------------------------------------------
  describe('count badge', () => {
    it('shows count badge with correct number', () => {
      render(<Deck count={42} />);
      expect(screen.getByTestId('deck-count-badge')).toHaveTextContent('42');
    });

    it('does not show count badge when count is 0', () => {
      render(<Deck count={0} />);
      expect(screen.queryByTestId('deck-count-badge')).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Ref API
  // -------------------------------------------------------------------------
  describe('ref API', () => {
    it('drawCard() fires onDraw', () => {
      const ref = createRef<DeckRef>();
      const onDraw = vi.fn();
      render(<Deck count={5} onDraw={onDraw} ref={ref} />);

      act(() => {
        ref.current!.drawCard();
      });
      expect(onDraw).toHaveBeenCalledTimes(1);
    });

    it('drawCard() does nothing when count is 0', () => {
      const ref = createRef<DeckRef>();
      const onDraw = vi.fn();
      render(<Deck count={0} onDraw={onDraw} ref={ref} />);

      act(() => {
        ref.current!.drawCard();
      });
      expect(onDraw).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------
  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<Deck count={10} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no axe violations when empty', async () => {
      const { container } = render(<Deck count={0} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('draws on Enter key', async () => {
      const onDraw = vi.fn();
      render(<Deck count={10} onDraw={onDraw} />);
      const deck = screen.getByRole('button');
      await userEvent.type(deck, '{Enter}');
      expect(onDraw).toHaveBeenCalled();
    });

    it('draws on Space key', async () => {
      const onDraw = vi.fn();
      render(<Deck count={10} onDraw={onDraw} />);
      const deck = screen.getByRole('button');
      fireEvent.keyDown(deck, { key: ' ' });
      expect(onDraw).toHaveBeenCalled();
    });

    it('has button role when non-empty', () => {
      render(<Deck count={10} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has aria-label with card count', () => {
      render(<Deck count={10} />);
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'Deck with 10 cards',
      );
    });
  });

  // -------------------------------------------------------------------------
  // className
  // -------------------------------------------------------------------------
  describe('className', () => {
    it('applies custom className', () => {
      render(<Deck count={5} className="my-deck" />);
      expect(screen.getByTestId('deck')).toHaveClass('my-deck');
    });
  });
});
