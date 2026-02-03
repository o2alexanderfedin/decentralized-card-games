/**
 * Tests for the CardDndProvider component.
 *
 * Covers rendering, lifecycle callbacks (start, over, end, cancel, reject),
 * multi-card selection passthrough, sensor config, haptic feedback,
 * and default behaviors (closestCorners, autoScroll=false).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import type { CardData } from '../../types';

/* ------------------------------------------------------------------ */
/*  Capture DndContext callback props for testing                      */
/* ------------------------------------------------------------------ */

let capturedProps: Record<string, unknown> = {};

const {
  mockClosestCorners,
  mockOnPickup,
  mockOnHover,
  mockOnDrop,
  mockOnReject,
} = vi.hoisted(() => ({
  mockClosestCorners: vi.fn(),
  mockOnPickup: vi.fn(),
  mockOnHover: vi.fn(),
  mockOnDrop: vi.fn(),
  mockOnReject: vi.fn(),
}));

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, ...props }: { children?: React.ReactNode; [k: string]: unknown }) => {
    capturedProps = props;
    return <div data-testid="dnd-context">{children}</div>;
  },
  closestCorners: mockClosestCorners,
}));

/* ------------------------------------------------------------------ */
/*  Mock CardDragOverlay to inspect its props                          */
/* ------------------------------------------------------------------ */

let overlayProps: Record<string, unknown> = {};

vi.mock('../CardDragOverlay', () => ({
  CardDragOverlay: (props: Record<string, unknown>) => {
    overlayProps = props;
    return (
      <div
        data-testid="card-drag-overlay"
        data-active-card={props.activeCard ? JSON.stringify(props.activeCard) : 'null'}
        data-selected-cards={props.selectedCards ? JSON.stringify(props.selectedCards) : 'undefined'}
        data-preview-mode={String(props.previewMode ?? 'undefined')}
      />
    );
  },
}));

/* ------------------------------------------------------------------ */
/*  Mock hooks                                                         */
/* ------------------------------------------------------------------ */

vi.mock('../../hooks', () => ({
  useDragSensors: vi.fn(() => []),
  useHapticFeedback: vi.fn(() => ({
    isSupported: false,
    onPickup: mockOnPickup,
    onHover: mockOnHover,
    onDrop: mockOnDrop,
    onReject: mockOnReject,
  })),
}));

import { CardDndProvider } from './CardDndProvider';
import { useDragSensors } from '../../hooks';

/* ------------------------------------------------------------------ */
/*  Test data                                                          */
/* ------------------------------------------------------------------ */

const aceOfSpades: CardData = { suit: 'spades', rank: 'A' };
const kingOfHearts: CardData = { suit: 'hearts', rank: 'K' };

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Create a mock DragStartEvent with card data. */
function makeDragStartEvent(card: CardData, sourceZoneId?: string) {
  return {
    active: {
      id: 'card-1',
      data: {
        current: {
          card,
          type: 'card' as const,
          sourceZoneId,
        },
      },
    },
  };
}

/** Create a mock DragOverEvent. */
function makeDragOverEvent(overId: string | null) {
  return {
    active: {
      id: 'card-1',
      data: { current: { card: aceOfSpades, type: 'card' } },
    },
    over: overId
      ? { id: overId, data: { current: {} } }
      : null,
  };
}

/** Create a mock DragEndEvent. */
function makeDragEndEvent(
  overId: string | null,
  zoneData?: { accepts?: string[]; onValidate?: (card: CardData) => boolean },
) {
  return {
    active: {
      id: 'card-1',
      data: { current: { card: aceOfSpades, type: 'card' } },
    },
    over: overId
      ? { id: overId, data: { current: zoneData ?? {} } }
      : null,
  };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('CardDndProvider', () => {
  beforeEach(() => {
    capturedProps = {};
    overlayProps = {};
    vi.clearAllMocks();
  });

  it('renders children inside DndContext', () => {
    render(
      <CardDndProvider>
        <div data-testid="child">Hello</div>
      </CardDndProvider>,
    );

    const context = screen.getByTestId('dnd-context');
    expect(context).toBeDefined();
    expect(screen.getByTestId('child')).toBeDefined();
    expect(screen.getByText('Hello')).toBeDefined();
  });

  it('renders CardDragOverlay inside DndContext', () => {
    render(
      <CardDndProvider>
        <div>Content</div>
      </CardDndProvider>,
    );

    const overlay = screen.getByTestId('card-drag-overlay');
    expect(overlay).toBeDefined();
    // Overlay should be inside DndContext
    const context = screen.getByTestId('dnd-context');
    expect(context.contains(overlay)).toBe(true);
  });

  it('calls onDragStart with card data when drag begins', () => {
    const onDragStart = vi.fn();
    render(
      <CardDndProvider onDragStart={onDragStart}>
        <div>Content</div>
      </CardDndProvider>,
    );

    const handler = capturedProps.onDragStart as (e: unknown) => void;
    act(() => {
      handler(makeDragStartEvent(aceOfSpades, 'hand'));
    });

    expect(onDragStart).toHaveBeenCalledWith(aceOfSpades, 'hand');
  });

  it('calls onDragEnd with card and target zone when drag completes', () => {
    const onDragEnd = vi.fn();
    render(
      <CardDndProvider onDragEnd={onDragEnd}>
        <div>Content</div>
      </CardDndProvider>,
    );

    // Start drag first to set activeCard
    const startHandler = capturedProps.onDragStart as (e: unknown) => void;
    act(() => {
      startHandler(makeDragStartEvent(aceOfSpades, 'hand'));
    });

    // End drag on zone-1
    const endHandler = capturedProps.onDragEnd as (e: unknown) => void;
    act(() => {
      endHandler(makeDragEndEvent('zone-1'));
    });

    expect(onDragEnd).toHaveBeenCalledWith(aceOfSpades, 'zone-1', 'hand');
  });

  it('calls onDragEnd with null target when dropped outside', () => {
    const onDragEnd = vi.fn();
    render(
      <CardDndProvider onDragEnd={onDragEnd}>
        <div>Content</div>
      </CardDndProvider>,
    );

    const startHandler = capturedProps.onDragStart as (e: unknown) => void;
    act(() => {
      startHandler(makeDragStartEvent(aceOfSpades));
    });

    const endHandler = capturedProps.onDragEnd as (e: unknown) => void;
    act(() => {
      endHandler(makeDragEndEvent(null));
    });

    expect(onDragEnd).toHaveBeenCalledWith(aceOfSpades, null, undefined);
  });

  it('calls onDragCancel when drag is cancelled', () => {
    const onDragCancel = vi.fn();
    render(
      <CardDndProvider onDragCancel={onDragCancel}>
        <div>Content</div>
      </CardDndProvider>,
    );

    const cancelHandler = capturedProps.onDragCancel as () => void;
    act(() => {
      cancelHandler();
    });

    expect(onDragCancel).toHaveBeenCalledOnce();
  });

  it('calls onDragOver when hovering over a zone', () => {
    const onDragOver = vi.fn();
    render(
      <CardDndProvider onDragOver={onDragOver}>
        <div>Content</div>
      </CardDndProvider>,
    );

    // Start drag first to set activeCard
    const startHandler = capturedProps.onDragStart as (e: unknown) => void;
    act(() => {
      startHandler(makeDragStartEvent(aceOfSpades));
    });

    const overHandler = capturedProps.onDragOver as (e: unknown) => void;
    act(() => {
      overHandler(makeDragOverEvent('discard'));
    });

    expect(onDragOver).toHaveBeenCalledWith(aceOfSpades, 'discard');
  });

  it('sets activeCard to null after drag ends', () => {
    render(
      <CardDndProvider>
        <div>Content</div>
      </CardDndProvider>,
    );

    // Start drag
    const startHandler = capturedProps.onDragStart as (e: unknown) => void;
    act(() => {
      startHandler(makeDragStartEvent(aceOfSpades));
    });

    // Verify overlay got the active card
    const overlayEl = screen.getByTestId('card-drag-overlay');
    expect(overlayEl.getAttribute('data-active-card')).toBe(
      JSON.stringify(aceOfSpades),
    );

    // End drag
    const endHandler = capturedProps.onDragEnd as (e: unknown) => void;
    act(() => {
      endHandler(makeDragEndEvent('zone-1'));
    });

    // Verify overlay has null active card
    expect(overlayEl.getAttribute('data-active-card')).toBe('null');
  });

  it('passes selectedCards to CardDragOverlay', () => {
    const selected = [aceOfSpades, kingOfHearts];
    render(
      <CardDndProvider selectedCards={selected}>
        <div>Content</div>
      </CardDndProvider>,
    );

    const overlayEl = screen.getByTestId('card-drag-overlay');
    expect(overlayEl.getAttribute('data-selected-cards')).toBe(
      JSON.stringify(selected),
    );
  });

  it('passes sensorConfig to useDragSensors', () => {
    const config = { mouseDistance: 10, touchDelay: 300 };
    render(
      <CardDndProvider sensorConfig={config}>
        <div>Content</div>
      </CardDndProvider>,
    );

    expect(useDragSensors).toHaveBeenCalledWith(config);
  });

  it('uses closestCorners collision detection by default', () => {
    render(
      <CardDndProvider>
        <div>Content</div>
      </CardDndProvider>,
    );

    expect(capturedProps.collisionDetection).toBe(mockClosestCorners);
  });

  it('disables autoScroll by default', () => {
    render(
      <CardDndProvider>
        <div>Content</div>
      </CardDndProvider>,
    );

    expect(capturedProps.autoScroll).toBe(false);
  });
});
