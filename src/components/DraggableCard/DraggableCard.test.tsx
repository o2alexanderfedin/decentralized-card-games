/**
 * Tests for the DraggableCard component.
 *
 * Since dnd-kit relies on getBoundingClientRect (returns zeros in jsdom),
 * we mock useDraggable and test rendering, CSS classes, prop passthrough,
 * drag states, and memoization.
 *
 * Full drag simulation is covered by E2E tests (Playwright in Phase 6).
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

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

// Mock state shared between test and mock
let mockUseDraggableReturn = {
  attributes: { role: 'button' as const, tabIndex: 0 },
  listeners: {} as Record<string, unknown>,
  setNodeRef: vi.fn(),
  transform: null as { x: number; y: number; scaleX: number; scaleY: number } | null,
  isDragging: false,
};

let mockUseDraggableArgs: unknown = undefined;

vi.mock('@dnd-kit/core', async () => {
  return {
    useDraggable: (args: unknown) => {
      mockUseDraggableArgs = args;
      return mockUseDraggableReturn;
    },
  };
});

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Translate: {
      toString: (transform: { x: number; y: number; scaleX: number; scaleY: number } | null) => {
        if (!transform) return undefined;
        return `translate3d(${transform.x}px, ${transform.y}px, 0)`;
      },
    },
  },
}));

// Mock motion/react to avoid animation complexity in unit tests
vi.mock('motion/react', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('motion/react');
  return {
    ...actual,
    motion: {
      div: React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLDivElement>) => {
        const { children, ...rest } = props;
        // Filter out motion-specific props
        const htmlProps: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(rest)) {
          if (!key.startsWith('on') || key === 'onClick' || key === 'onMouseEnter' || key === 'onMouseLeave' || key === 'onFocus' || key === 'onBlur') {
            htmlProps[key] = value;
          }
        }
        return <div ref={ref} {...htmlProps}>{children as React.ReactNode}</div>;
      }),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

import { DraggableCard } from './DraggableCard';

describe('DraggableCard', () => {
  beforeEach(() => {
    mockUseDraggableReturn = {
      attributes: { role: 'button' as const, tabIndex: 0 },
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      isDragging: false,
    };
    mockUseDraggableArgs = undefined;
  });

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  it('renders Card with correct card data', () => {
    render(<DraggableCard id="card-1" card="sA" />);
    const wrapper = screen.getByTestId('draggable-card-card-1');
    expect(wrapper).toBeInTheDocument();
    // Card should render inside - look for the card's aria-label on the inner Card element
    const cardElements = screen.getAllByRole('button', { name: /A of spades/i });
    expect(cardElements.length).toBeGreaterThanOrEqual(1);
  });

  it('applies touch-action: none CSS class', () => {
    render(<DraggableCard id="card-2" card="hK" />);
    const wrapper = screen.getByTestId('draggable-card-card-2');
    // The wrapper should have the draggable class which includes touch-action: none
    expect(wrapper.className).toContain('draggable');
  });

  it('passes through CardProps to inner Card', () => {
    render(
      <DraggableCard
        id="card-3"
        card="dQ"
        isFaceUp={false}
        className="custom-class"
      />,
    );
    const wrapper = screen.getByTestId('draggable-card-card-3');
    // className should be passed to wrapper
    expect(wrapper.className).toContain('custom-class');
  });

  // ---------------------------------------------------------------------------
  // Drag states
  // ---------------------------------------------------------------------------
  it('applies dragging class when isDragging is true', () => {
    mockUseDraggableReturn = {
      ...mockUseDraggableReturn,
      isDragging: true,
    };
    render(<DraggableCard id="card-4" card="cJ" />);
    const wrapper = screen.getByTestId('draggable-card-card-4');
    expect(wrapper.className).toContain('draggable--dragging');
  });

  it('applies disabled class when disabled prop is true', () => {
    render(<DraggableCard id="card-5" card="s2" disabled />);
    const wrapper = screen.getByTestId('draggable-card-card-5');
    expect(wrapper.className).toContain('draggable--disabled');
    // Verify useDraggable received disabled: true
    expect(mockUseDraggableArgs).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  // ---------------------------------------------------------------------------
  // Drag data
  // ---------------------------------------------------------------------------
  it('passes card data via useDraggable data prop', () => {
    render(
      <DraggableCard id="card-6" card="hA" sourceZoneId="hand-1" />,
    );
    expect(mockUseDraggableArgs).toEqual(
      expect.objectContaining({
        id: 'card-6',
        data: expect.objectContaining({
          type: 'card',
          sourceZoneId: 'hand-1',
          card: expect.objectContaining({
            suit: 'hearts',
            rank: 'A',
          }),
        }),
      }),
    );
  });

  // ---------------------------------------------------------------------------
  // Transform
  // ---------------------------------------------------------------------------
  it('applies transform from useDraggable', () => {
    mockUseDraggableReturn = {
      ...mockUseDraggableReturn,
      transform: { x: 10, y: 20, scaleX: 1, scaleY: 1 },
    };
    render(<DraggableCard id="card-7" card="sT" />);
    const wrapper = screen.getByTestId('draggable-card-card-7');
    expect(wrapper.style.transform).toBe('translate3d(10px, 20px, 0)');
  });

  it('renders without transform when transform is null', () => {
    mockUseDraggableReturn = {
      ...mockUseDraggableReturn,
      transform: null,
    };
    render(<DraggableCard id="card-8" card="d5" />);
    const wrapper = screen.getByTestId('draggable-card-card-8');
    expect(wrapper.style.transform).toBe('');
  });

  // ---------------------------------------------------------------------------
  // Memoization
  // ---------------------------------------------------------------------------
  it('is wrapped in React.memo', () => {
    // React.memo wrapping can be detected by checking the component type
    // React.memo components have a $$typeof of Symbol(react.memo) and a `type` property
    expect((DraggableCard as unknown as { $$typeof: symbol }).$$typeof).toBe(
      Symbol.for('react.memo'),
    );
  });
});
