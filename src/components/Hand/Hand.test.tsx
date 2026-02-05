/**
 * Tests for the Hand container component.
 *
 * Covers rendering, layout modes, controlled/uncontrolled selection,
 * ref API, hover effects, card click events, and edge cases.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { createRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Hand } from './Hand';
import type { HandRef } from './Hand.types';

// ---------------------------------------------------------------------------
// Global mocks
// ---------------------------------------------------------------------------

// jsdom does not implement window.matchMedia
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

// Mock ResizeObserver (jsdom doesn't have it)
let _resizeCallback: ResizeObserverCallback | null = null;
const mockResizeObserver = vi.fn().mockImplementation((cb: ResizeObserverCallback) => {
  _resizeCallback = cb;
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
});

beforeAll(() => {
  (globalThis as unknown as Record<string, unknown>).ResizeObserver = mockResizeObserver;
});

afterAll(() => {
  vi.restoreAllMocks();
});

// Mock motion/react to avoid animation timing issues in tests.
// We use importOriginal to keep useSpring/useTransform/useMotionValueEvent
// (needed by Card's useCardFlip hook) while replacing visual components.
vi.mock('motion/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('motion/react')>();
  const React = await import('react');
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLDivElement>) => {
        const {
          initial: _initial,
          animate: _animate,
          exit: _exit,
          transition: _transition,
          layout: _layout,
          ...domProps
        } = props;
        return React.createElement('div', { ...domProps, ref });
      }),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => {
      return React.createElement(React.Fragment, null, children);
    },
  };
});

describe('Hand', () => {
  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  describe('rendering', () => {
    it('renders correct number of Card components for given cards array', () => {
      render(<Hand cards={['sA', 'h7', 'dK']} />);
      const slots = screen.getAllByTestId('card-slot');
      expect(slots).toHaveLength(3);
    });

    it('accepts string notation cards and CardData objects', () => {
      render(
        <Hand
          cards={[
            'sA',
            { suit: 'hearts', rank: '7' },
          ]}
        />,
      );
      const slots = screen.getAllByTestId('card-slot');
      expect(slots).toHaveLength(2);
    });

    it('applies fan layout by default with data-testid="hand"', () => {
      render(<Hand cards={['sA']} />);
      expect(screen.getByTestId('hand')).toBeInTheDocument();
    });

    it('renders with spread layout', () => {
      render(<Hand cards={['sA', 'h7']} layout="spread" />);
      const slots = screen.getAllByTestId('card-slot');
      expect(slots).toHaveLength(2);
    });

    it('renders with stack layout', () => {
      render(<Hand cards={['sA', 'h7', 'dK']} layout="stack" />);
      const slots = screen.getAllByTestId('card-slot');
      expect(slots).toHaveLength(3);
    });
  });

  // -------------------------------------------------------------------------
  // Card click events
  // -------------------------------------------------------------------------
  describe('card click events', () => {
    it('fires onCardClick with card data and index when a card slot is clicked', () => {
      const onCardClick = vi.fn();
      render(<Hand cards={['sA', 'h7']} onCardClick={onCardClick} />);

      const slots = screen.getAllByTestId('card-slot');
      fireEvent.click(slots[1]);

      expect(onCardClick).toHaveBeenCalledWith(
        { suit: 'hearts', rank: '7' },
        1,
      );
    });

    it('fires onCardClick with correct data for first card', () => {
      const onCardClick = vi.fn();
      render(<Hand cards={['sA', 'h7']} onCardClick={onCardClick} />);

      const slots = screen.getAllByTestId('card-slot');
      fireEvent.click(slots[0]);

      expect(onCardClick).toHaveBeenCalledWith(
        { suit: 'spades', rank: 'A' },
        0,
      );
    });
  });

  // -------------------------------------------------------------------------
  // Uncontrolled selection
  // -------------------------------------------------------------------------
  describe('uncontrolled selection', () => {
    it('clicking a card toggles selection (cardSlot--selected class)', () => {
      render(<Hand cards={['sA', 'h7', 'dK']} />);

      const slots = screen.getAllByTestId('card-slot');

      // Initially no slot has --selected class
      expect(slots[0].className).not.toContain('selected');

      // Click first card
      fireEvent.click(slots[0]);

      // Re-query after state update
      const slotsAfterClick = screen.getAllByTestId('card-slot');
      expect(slotsAfterClick[0].className).toContain('selected');

      // Click again to deselect
      fireEvent.click(slotsAfterClick[0]);

      const slotsAfterSecondClick = screen.getAllByTestId('card-slot');
      expect(slotsAfterSecondClick[0].className).not.toContain('selected');
    });
  });

  // -------------------------------------------------------------------------
  // Controlled selection
  // -------------------------------------------------------------------------
  describe('controlled selection', () => {
    it('renders selectedCards indices as selected', () => {
      render(<Hand cards={['sA', 'h7', 'dK']} selectedCards={[0, 2]} />);

      const slots = screen.getAllByTestId('card-slot');
      expect(slots[0].className).toContain('selected');
      expect(slots[1].className).not.toContain('selected');
      expect(slots[2].className).toContain('selected');
    });

    it('calls onSelectionChange when card is clicked in controlled mode', () => {
      const onSelectionChange = vi.fn();
      render(
        <Hand
          cards={['sA', 'h7', 'dK']}
          selectedCards={[0]}
          onSelectionChange={onSelectionChange}
        />,
      );

      const slots = screen.getAllByTestId('card-slot');
      // Click card at index 1 to add to selection
      fireEvent.click(slots[1]);

      expect(onSelectionChange).toHaveBeenCalled();
      const newSelection = onSelectionChange.mock.calls[0][0] as number[];
      expect(newSelection).toContain(0);
      expect(newSelection).toContain(1);
    });

    it('removes card from selection when clicking an already-selected card', () => {
      const onSelectionChange = vi.fn();
      render(
        <Hand
          cards={['sA', 'h7', 'dK']}
          selectedCards={[0, 1]}
          onSelectionChange={onSelectionChange}
        />,
      );

      const slots = screen.getAllByTestId('card-slot');
      // Click card at index 0 to remove from selection
      fireEvent.click(slots[0]);

      expect(onSelectionChange).toHaveBeenCalled();
      const newSelection = onSelectionChange.mock.calls[0][0] as number[];
      expect(newSelection).not.toContain(0);
      expect(newSelection).toContain(1);
    });
  });

  // -------------------------------------------------------------------------
  // Ref API
  // -------------------------------------------------------------------------
  describe('ref API', () => {
    it('selectCard toggles selection and getSelectedCards returns indices', () => {
      const ref = createRef<HandRef>();
      render(<Hand cards={['sA', 'h7', 'dK']} ref={ref} />);

      expect(ref.current).not.toBeNull();

      // Initially empty
      expect(ref.current!.getSelectedCards()).toEqual([]);

      // Select card at index 1
      act(() => {
        ref.current!.selectCard(1);
      });

      expect(ref.current!.getSelectedCards()).toContain(1);

      // Toggle off
      act(() => {
        ref.current!.selectCard(1);
      });

      expect(ref.current!.getSelectedCards()).not.toContain(1);
    });

    it('selectCard works in controlled mode via onSelectionChange', () => {
      const onSelectionChange = vi.fn();
      const ref = createRef<HandRef>();
      render(
        <Hand
          cards={['sA', 'h7']}
          selectedCards={[]}
          onSelectionChange={onSelectionChange}
          ref={ref}
        />,
      );

      act(() => {
        ref.current!.selectCard(0);
      });

      expect(onSelectionChange).toHaveBeenCalled();
      const newSelection = onSelectionChange.mock.calls[0][0] as number[];
      expect(newSelection).toContain(0);
    });
  });

  // -------------------------------------------------------------------------
  // Empty state
  // -------------------------------------------------------------------------
  describe('empty state', () => {
    it('renders empty state class when cards array is empty', () => {
      render(<Hand cards={[]} />);
      const hand = screen.getByTestId('hand');
      expect(hand.className).toContain('empty');
    });

    it('does not render any card slots when empty', () => {
      render(<Hand cards={[]} />);
      expect(screen.queryAllByTestId('card-slot')).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // Hover effects
  // -------------------------------------------------------------------------
  describe('hover effects', () => {
    it('applies hover-lift class by default', () => {
      render(<Hand cards={['sA']} />);
      const hand = screen.getByTestId('hand');
      expect(hand.className).toContain('hover-lift');
    });

    it('applies hover-highlight class when specified', () => {
      render(<Hand cards={['sA']} hoverEffect="highlight" />);
      const hand = screen.getByTestId('hand');
      expect(hand.className).toContain('hover-highlight');
    });

    it('does not apply hover classes when hoverEffect is none', () => {
      render(<Hand cards={['sA']} hoverEffect="none" />);
      const hand = screen.getByTestId('hand');
      expect(hand.className).not.toContain('hover-lift');
      expect(hand.className).not.toContain('hover-highlight');
    });
  });

  // -------------------------------------------------------------------------
  // className prop
  // -------------------------------------------------------------------------
  describe('className prop', () => {
    it('accepts className prop and merges with hand classes', () => {
      render(<Hand cards={['sA']} className="my-hand" />);
      const hand = screen.getByTestId('hand');
      expect(hand.className).toContain('my-hand');
      // Should still have hand base class
      expect(hand.className).toContain('hand');
    });
  });

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------
  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<Hand cards={['sA', 'h7', 'dK']} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has listbox role', () => {
      render(<Hand cards={['sA', 'h7']} />);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('cards have option role', () => {
      render(<Hand cards={['sA', 'h7']} />);
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(2);
    });

    it('only one card has tabIndex 0 (roving tabindex)', () => {
      render(<Hand cards={['sA', 'h7', 'dK']} />);
      const options = screen.getAllByRole('option');
      const tabbable = options.filter((o) => o.tabIndex === 0);
      expect(tabbable).toHaveLength(1);
    });

    it('arrow right moves focus to next card', async () => {
      render(<Hand cards={['sA', 'h7', 'dK']} />);
      const options = screen.getAllByRole('option');
      options[0].focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(options[1]).toHaveFocus();
    });

    it('space toggles card selection', async () => {
      render(<Hand cards={['sA', 'h7']} />);
      const options = screen.getAllByRole('option');
      options[0].focus();
      await userEvent.keyboard(' ');
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('includes position context in aria-label', () => {
      render(<Hand cards={['sA', 'h7']} />);
      const options = screen.getAllByRole('option');
      // Should contain position info like "card 1 of 2"
      expect(options[0].getAttribute('aria-label')).toContain('card 1 of 2');
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------
  describe('edge cases', () => {
    it('handles mixed array of strings and CardData objects', () => {
      render(
        <Hand
          cards={[
            'sA',
            { suit: 'hearts', rank: '7' },
            'dK',
            { suit: 'clubs', rank: 'Q' },
          ]}
        />,
      );
      const slots = screen.getAllByTestId('card-slot');
      expect(slots).toHaveLength(4);
    });

    it('filters out invalid card notations gracefully (no crash)', () => {
      render(<Hand cards={['sA', 'xyz', 'h7', 'invalid']} />);
      // Only valid cards should render
      const slots = screen.getAllByTestId('card-slot');
      expect(slots).toHaveLength(2);
    });

    it('renders single card without error', () => {
      render(<Hand cards={['sA']} />);
      const slots = screen.getAllByTestId('card-slot');
      expect(slots).toHaveLength(1);
    });
  });
});
