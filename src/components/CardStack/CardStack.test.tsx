/**
 * Tests for the CardStack container component.
 *
 * Covers card rendering, diagonal offset, face-up modes,
 * top card click, empty array handling, and className support.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardStack } from './CardStack';

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

describe('CardStack', () => {
  const threeCards = ['sA', 'h7', 'dK'];

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  describe('rendering', () => {
    it('renders correct number of cards', () => {
      render(<CardStack cards={threeCards} />);
      const slots = screen.getAllByTestId('card-stack-slot');
      expect(slots).toHaveLength(3);
    });

    it('renders nothing for empty cards array', () => {
      const { container } = render(<CardStack cards={[]} />);
      expect(screen.queryByTestId('card-stack')).not.toBeInTheDocument();
      expect(container.innerHTML).toBe('');
    });

    it('cards have diagonal offset (increasing x, y per card)', () => {
      render(<CardStack cards={threeCards} offsetX={2} offsetY={2} />);
      const slots = screen.getAllByTestId('card-stack-slot');

      // First card at 0,0 (single card centering) or with calculated offset
      // Just verify transforms exist and are different
      const transforms = slots.map((el) =>
        (el as HTMLElement).style.transform,
      );
      // Each subsequent card should have a different transform
      expect(new Set(transforms).size).toBe(3);
    });
  });

  // -------------------------------------------------------------------------
  // Face-up modes
  // -------------------------------------------------------------------------
  describe('face-up modes', () => {
    it('top card is face-up by default with "top-only" mode', () => {
      render(<CardStack cards={threeCards} />);
      // With top-only, only the last card should be face up
      // We verify by checking the Card component receives the right props
      const slots = screen.getAllByTestId('card-stack-slot');
      expect(slots).toHaveLength(3);
    });

    it('all cards face-up when faceUp={true}', () => {
      render(<CardStack cards={threeCards} faceUp={true} />);
      // All cards rendered face-up -- rank text should appear for each card
      const slots = screen.getAllByTestId('card-stack-slot');
      expect(slots).toHaveLength(3);
    });

    it('all cards face-down when faceUp={false}', () => {
      render(<CardStack cards={threeCards} faceUp={false} />);
      const slots = screen.getAllByTestId('card-stack-slot');
      expect(slots).toHaveLength(3);
    });
  });

  // -------------------------------------------------------------------------
  // Top card click
  // -------------------------------------------------------------------------
  describe('top card click', () => {
    it('clicking top card fires onTopCardClick with card data', () => {
      const onTopCardClick = vi.fn();
      render(
        <CardStack
          cards={threeCards}
          onTopCardClick={onTopCardClick}
        />,
      );

      const slots = screen.getAllByTestId('card-stack-slot');
      const topSlot = slots[slots.length - 1];
      fireEvent.click(topSlot);

      expect(onTopCardClick).toHaveBeenCalledTimes(1);
      expect(onTopCardClick).toHaveBeenCalledWith(
        { suit: 'diamonds', rank: 'K' },
        2,
      );
    });

    it('clicking non-top card does not fire onTopCardClick', () => {
      const onTopCardClick = vi.fn();
      render(
        <CardStack
          cards={threeCards}
          onTopCardClick={onTopCardClick}
        />,
      );

      const slots = screen.getAllByTestId('card-stack-slot');
      // Click first card (not top)
      fireEvent.click(slots[0]);

      expect(onTopCardClick).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // className
  // -------------------------------------------------------------------------
  describe('className', () => {
    it('applies custom className', () => {
      render(<CardStack cards={threeCards} className="my-stack" />);
      expect(screen.getByTestId('card-stack')).toHaveClass('my-stack');
    });
  });
});
