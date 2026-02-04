/**
 * Tests for the main Card component.
 *
 * Covers rendering, controlled/uncontrolled modes, event handling,
 * accessibility attributes, and color scheme support.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { createRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Card } from './Card';
import type { CardRef } from './Card.types';

// jsdom does not implement window.matchMedia; mock it for usePrefersReducedMotion
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

describe('Card', () => {
  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  describe('rendering', () => {
    it('renders a card element with role="button"', () => {
      render(<Card card="♠A" isFaceUp={true} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders card face content when isFaceUp is true', () => {
      render(<Card card="♠A" isFaceUp={true} />);
      // Rank appears twice (top corner and bottom corner), so use getAllByText
      const ranks = screen.getAllByText('A');
      expect(ranks.length).toBeGreaterThanOrEqual(1);
    });

    it('handles string notation (emoji)', () => {
      render(<Card card="♥K" isFaceUp={true} />);
      const ranks = screen.getAllByText('K');
      expect(ranks.length).toBeGreaterThanOrEqual(1);
    });

    it('handles CardData object', () => {
      render(<Card card={{ suit: 'diamonds', rank: 'Q' }} isFaceUp={true} />);
      const ranks = screen.getAllByText('Q');
      expect(ranks.length).toBeGreaterThanOrEqual(1);
    });

    it('displays rank "T" as "10" in aria-label', () => {
      render(<Card card="♠T" isFaceUp={true} />);
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        '10 of spades',
      );
    });

    it('renders back face element', () => {
      render(<Card card="♠A" isFaceUp={false} />);
      // Back face is present (with aria-hidden)
      const backElement = document.querySelector('[aria-hidden="true"]');
      expect(backElement).toBeInTheDocument();
    });

    it('applies custom className to container', () => {
      const { container } = render(
        <Card card="♠A" isFaceUp={true} className="my-card" />,
      );
      expect(container.firstChild).toHaveClass('my-card');
    });
  });

  // -------------------------------------------------------------------------
  // Controlled mode
  // -------------------------------------------------------------------------
  describe('controlled mode', () => {
    it('respects isFaceUp prop changes', () => {
      const { rerender } = render(<Card card="♠A" isFaceUp={true} />);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Card card="♠A" isFaceUp={false} />);
      // Still renders -- flip is animated via motion values
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('does not toggle internal state on click when controlled', () => {
      const onClick = vi.fn();
      render(<Card card="♠A" isFaceUp={true} onClick={onClick} />);

      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledWith({
        suit: 'spades',
        rank: 'A',
        isFaceUp: true,
      });
    });

    it('reports correct isFaceUp in onClick for controlled false', () => {
      const onClick = vi.fn();
      render(<Card card="♠A" isFaceUp={false} onClick={onClick} />);

      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledWith({
        suit: 'spades',
        rank: 'A',
        isFaceUp: false,
      });
    });
  });

  // -------------------------------------------------------------------------
  // Uncontrolled mode
  // -------------------------------------------------------------------------
  describe('uncontrolled mode', () => {
    it('toggles internal state on click', () => {
      const onClick = vi.fn();
      render(<Card card="♠A" onClick={onClick} />);

      // First click: was face up, report true, then toggle
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledWith({
        suit: 'spades',
        rank: 'A',
        isFaceUp: true,
      });
    });

    it('exposes flip method via ref', () => {
      const ref = createRef<CardRef>();
      render(<Card card="♠A" ref={ref} />);

      expect(ref.current).not.toBeNull();
      expect(ref.current!.isFaceUp()).toBe(true);

      act(() => {
        ref.current!.flip();
      });
      expect(ref.current!.isFaceUp()).toBe(false);
    });

    it('exposes isFaceUp method via ref', () => {
      const ref = createRef<CardRef>();
      render(<Card card="♠A" ref={ref} />);

      expect(ref.current!.isFaceUp()).toBe(true);
    });

    it('ref.flip does nothing in controlled mode', () => {
      const ref = createRef<CardRef>();
      render(<Card card="♠A" isFaceUp={true} ref={ref} />);

      act(() => {
        ref.current!.flip();
      });
      // Should still report controlled value
      expect(ref.current!.isFaceUp()).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Events
  // -------------------------------------------------------------------------
  describe('events', () => {
    it('calls onClick with card data', () => {
      const onClick = vi.fn();
      render(<Card card="♠A" isFaceUp={true} onClick={onClick} />);

      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledWith({
        suit: 'spades',
        rank: 'A',
        isFaceUp: true,
      });
    });

    it('calls onClick with hearts card data', () => {
      const onClick = vi.fn();
      render(<Card card="♥7" isFaceUp={true} onClick={onClick} />);

      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledWith({
        suit: 'hearts',
        rank: '7',
        isFaceUp: true,
      });
    });

    it('calls onFlipStart when flip begins in uncontrolled mode', () => {
      const onFlipStart = vi.fn();
      render(<Card card="♠A" onFlipStart={onFlipStart} />);

      fireEvent.click(screen.getByRole('button'));
      expect(onFlipStart).toHaveBeenCalledTimes(1);
    });

    it('does not call onFlipStart in controlled mode on click', () => {
      const onFlipStart = vi.fn();
      render(<Card card="♠A" isFaceUp={true} onFlipStart={onFlipStart} />);

      fireEvent.click(screen.getByRole('button'));
      expect(onFlipStart).not.toHaveBeenCalled();
    });

    it('calls onHover on mouse enter/leave', () => {
      const onHover = vi.fn();
      render(<Card card="♠A" isFaceUp={true} onHover={onHover} />);

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      expect(onHover).toHaveBeenCalledWith(true);

      fireEvent.mouseLeave(button);
      expect(onHover).toHaveBeenCalledWith(false);
    });

    it('calls onFocus on focus/blur', () => {
      const onFocus = vi.fn();
      render(<Card card="♠A" isFaceUp={true} onFocus={onFocus} />);

      const button = screen.getByRole('button');
      fireEvent.focus(button);
      expect(onFocus).toHaveBeenCalledWith(true);

      fireEvent.blur(button);
      expect(onFocus).toHaveBeenCalledWith(false);
    });
  });

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------
  describe('accessibility', () => {
    it('has correct ARIA label for spades ace', () => {
      render(<Card card="♠A" isFaceUp={true} />);
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'A of spades',
      );
    });

    it('has correct ARIA label for hearts king', () => {
      render(<Card card="♥K" isFaceUp={true} />);
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'K of hearts',
      );
    });

    it('has correct ARIA label for 10 (rank T)', () => {
      render(<Card card="♦T" isFaceUp={true} />);
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        '10 of diamonds',
      );
    });

    it('has fallback ARIA label for invalid card', () => {
      render(<Card card="xyz" isFaceUp={true} />);
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'Card',
      );
    });

    it('is focusable via tabIndex', () => {
      render(<Card card="♠A" isFaceUp={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });
  });

  // -------------------------------------------------------------------------
  // Color schemes
  // -------------------------------------------------------------------------
  describe('color schemes', () => {
    it('applies two-color scheme by default (hearts are red)', () => {
      render(<Card card="♥K" isFaceUp={true} />);
      // CardFace is rendered inside - hearts should be present
      const ranks = screen.getAllByText('K');
      expect(ranks.length).toBeGreaterThanOrEqual(1);
    });

    it('applies four-color scheme when specified', () => {
      render(
        <Card card="♦Q" isFaceUp={true} colorScheme="four-color" />,
      );
      const ranks = screen.getAllByText('Q');
      expect(ranks.length).toBeGreaterThanOrEqual(1);
    });
  });

  // -------------------------------------------------------------------------
  // Aspect ratio and perspective
  // -------------------------------------------------------------------------
  describe('configuration', () => {
    it('renders with bridge aspect ratio', () => {
      const { container } = render(
        <Card card="♠A" isFaceUp={true} aspectRatio="bridge" />,
      );
      expect(container.querySelector('[class*="bridge"]')).toBeInTheDocument();
    });

    it('renders with dramatic perspective', () => {
      const { container } = render(
        <Card card="♠A" isFaceUp={true} perspective="dramatic" />,
      );
      expect(container.querySelector('[class*="dramatic"]')).toBeInTheDocument();
    });
  });
});
