/**
 * Integration tests for StatefulCardDndProvider.
 *
 * Verifies that DnD lifecycle events automatically dispatch state actions
 * (MOVE_CARD) when cards are dragged between zones, and that custom
 * callbacks still fire alongside auto-dispatch.
 *
 * Tests cover both GameProvider (context mode) and ReduxGameProvider (Redux mode).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import type { CardData } from '../../types';
import type { CardState } from '../../state/types';

/* ------------------------------------------------------------------ */
/*  Capture CardDndProvider callback props for testing                  */
/* ------------------------------------------------------------------ */

let capturedOnDragEnd: ((card: CardData, targetZoneId: string | null, sourceZoneId?: string) => void) | undefined;
let capturedOnDragStart: ((card: CardData, sourceZoneId?: string) => void) | undefined;

vi.mock('../CardDndProvider', () => ({
  CardDndProvider: ({
    children,
    onDragEnd,
    onDragStart,
  }: {
    children?: React.ReactNode;
    onDragEnd?: (card: CardData, targetZoneId: string | null, sourceZoneId?: string) => void;
    onDragStart?: (card: CardData, sourceZoneId?: string) => void;
  }) => {
    capturedOnDragEnd = onDragEnd;
    capturedOnDragStart = onDragStart;
    return <div data-testid="card-dnd-provider">{children}</div>;
  },
}));

import { StatefulCardDndProvider } from './StatefulCardDndProvider';
import { GameProvider } from '../../context/GameProvider';
import { useLocation } from '../../hooks/useLocation';

/* ------------------------------------------------------------------ */
/*  Test data                                                          */
/* ------------------------------------------------------------------ */

const aceOfSpades: CardData = { suit: 'spades', rank: 'A' };
const _kingOfHearts: CardData = { suit: 'hearts', rank: 'K' };

function makeCard(suit: CardState['suit'], rank: CardState['rank']): CardState {
  return { suit, rank, faceUp: false, selected: false };
}

const initialCardsState = {
  locations: {
    deck: [makeCard('spades', 'A'), makeCard('hearts', 'K')],
    hand: [] as CardState[],
  },
};

/* ------------------------------------------------------------------ */
/*  Test helper components                                             */
/* ------------------------------------------------------------------ */

/** Displays card count for a given location. */
function LocationDisplay({ locationId }: { locationId: string }) {
  const cards = useLocation(locationId);
  return <span data-testid={`location-${locationId}`}>{cards.length}</span>;
}

/** Displays card details at a location for identity verification. */
function LocationCards({ locationId }: { locationId: string }) {
  const cards = useLocation(locationId);
  return (
    <span data-testid={`cards-${locationId}`}>
      {cards.map(c => `${c.rank}${c.suit}`).join(',')}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  localStorage mock (needed for GameProvider)                        */
/* ------------------------------------------------------------------ */

function mockLocalStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { for (const key of Object.keys(store)) delete store[key]; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((_index: number) => null),
  };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('StatefulCardDndProvider', () => {
  beforeEach(() => {
    capturedOnDragEnd = undefined;
    capturedOnDragStart = undefined;
    vi.clearAllMocks();
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage(),
      writable: true,
      configurable: true,
    });
  });

  // -------------------------------------------------------------------
  // 1. Auto-dispatches MOVE_CARD on drag end
  // -------------------------------------------------------------------
  it('auto-dispatches MOVE_CARD on drag end between different zones', () => {
    render(
      <GameProvider initialState={initialCardsState} persist={false}>
        <StatefulCardDndProvider>
          <LocationDisplay locationId="deck" />
          <LocationDisplay locationId="hand" />
          <LocationCards locationId="hand" />
        </StatefulCardDndProvider>
      </GameProvider>,
    );

    // Before drag
    expect(screen.getByTestId('location-deck').textContent).toBe('2');
    expect(screen.getByTestId('location-hand').textContent).toBe('0');

    // Simulate drag end: ace of spades from deck to hand
    act(() => {
      capturedOnDragEnd!(aceOfSpades, 'hand', 'deck');
    });

    // After drag -- card moved
    expect(screen.getByTestId('location-deck').textContent).toBe('1');
    expect(screen.getByTestId('location-hand').textContent).toBe('1');
    expect(screen.getByTestId('cards-hand').textContent).toBe('Aspades');
  });

  // -------------------------------------------------------------------
  // 2. Skips dispatch when targetZoneId is null
  // -------------------------------------------------------------------
  it('skips dispatch when targetZoneId is null (dropped outside)', () => {
    render(
      <GameProvider initialState={initialCardsState} persist={false}>
        <StatefulCardDndProvider>
          <LocationDisplay locationId="deck" />
          <LocationDisplay locationId="hand" />
        </StatefulCardDndProvider>
      </GameProvider>,
    );

    act(() => {
      capturedOnDragEnd!(aceOfSpades, null, 'deck');
    });

    // State unchanged
    expect(screen.getByTestId('location-deck').textContent).toBe('2');
    expect(screen.getByTestId('location-hand').textContent).toBe('0');
  });

  // -------------------------------------------------------------------
  // 3. Skips dispatch when source equals target
  // -------------------------------------------------------------------
  it('skips dispatch when sourceZoneId equals targetZoneId (same zone)', () => {
    render(
      <GameProvider initialState={initialCardsState} persist={false}>
        <StatefulCardDndProvider>
          <LocationDisplay locationId="deck" />
        </StatefulCardDndProvider>
      </GameProvider>,
    );

    act(() => {
      capturedOnDragEnd!(aceOfSpades, 'deck', 'deck');
    });

    // State unchanged
    expect(screen.getByTestId('location-deck').textContent).toBe('2');
  });

  // -------------------------------------------------------------------
  // 4. autoDispatch=false disables auto-dispatch
  // -------------------------------------------------------------------
  it('does not auto-dispatch when autoDispatch=false', () => {
    const userOnDragEnd = vi.fn();

    render(
      <GameProvider initialState={initialCardsState} persist={false}>
        <StatefulCardDndProvider autoDispatch={false} onDragEnd={userOnDragEnd}>
          <LocationDisplay locationId="deck" />
          <LocationDisplay locationId="hand" />
        </StatefulCardDndProvider>
      </GameProvider>,
    );

    act(() => {
      capturedOnDragEnd!(aceOfSpades, 'hand', 'deck');
    });

    // State unchanged
    expect(screen.getByTestId('location-deck').textContent).toBe('2');
    expect(screen.getByTestId('location-hand').textContent).toBe('0');

    // But user callback was still called
    expect(userOnDragEnd).toHaveBeenCalledWith(aceOfSpades, 'hand', 'deck');
  });

  // -------------------------------------------------------------------
  // 5. User onDragEnd still fires alongside auto-dispatch
  // -------------------------------------------------------------------
  it('calls user onDragEnd alongside auto-dispatch', () => {
    const userOnDragEnd = vi.fn();

    render(
      <GameProvider initialState={initialCardsState} persist={false}>
        <StatefulCardDndProvider onDragEnd={userOnDragEnd}>
          <LocationDisplay locationId="deck" />
          <LocationDisplay locationId="hand" />
        </StatefulCardDndProvider>
      </GameProvider>,
    );

    act(() => {
      capturedOnDragEnd!(aceOfSpades, 'hand', 'deck');
    });

    // Auto-dispatch happened
    expect(screen.getByTestId('location-deck').textContent).toBe('1');
    expect(screen.getByTestId('location-hand').textContent).toBe('1');

    // User callback also fired
    expect(userOnDragEnd).toHaveBeenCalledWith(aceOfSpades, 'hand', 'deck');
  });

  // -------------------------------------------------------------------
  // 6. Works with ReduxGameProvider
  // -------------------------------------------------------------------
  it('works with ReduxGameProvider', async () => {
    // Dynamic import to avoid issues when redux is not available in all environments
    const { ReduxGameProvider } = await import('../../redux/ReduxGameProvider');

    render(
      <ReduxGameProvider initialState={initialCardsState}>
        <StatefulCardDndProvider>
          <LocationDisplay locationId="deck" />
          <LocationDisplay locationId="hand" />
          <LocationCards locationId="hand" />
        </StatefulCardDndProvider>
      </ReduxGameProvider>,
    );

    // Before drag
    expect(screen.getByTestId('location-deck').textContent).toBe('2');
    expect(screen.getByTestId('location-hand').textContent).toBe('0');

    // Simulate drag end
    act(() => {
      capturedOnDragEnd!(aceOfSpades, 'hand', 'deck');
    });

    // After drag -- card moved
    expect(screen.getByTestId('location-deck').textContent).toBe('1');
    expect(screen.getByTestId('location-hand').textContent).toBe('1');
    expect(screen.getByTestId('cards-hand').textContent).toBe('Aspades');
  });

  // -------------------------------------------------------------------
  // 7. Passes through onDragStart
  // -------------------------------------------------------------------
  it('calls user onDragStart when drag begins', () => {
    const userOnDragStart = vi.fn();

    render(
      <GameProvider initialState={initialCardsState} persist={false}>
        <StatefulCardDndProvider onDragStart={userOnDragStart}>
          <div>Content</div>
        </StatefulCardDndProvider>
      </GameProvider>,
    );

    act(() => {
      capturedOnDragStart!(aceOfSpades, 'deck');
    });

    expect(userOnDragStart).toHaveBeenCalledWith(aceOfSpades, 'deck');
  });

  // -------------------------------------------------------------------
  // 8. Skips dispatch when sourceZoneId is undefined
  // -------------------------------------------------------------------
  it('skips dispatch when sourceZoneId is undefined', () => {
    render(
      <GameProvider initialState={initialCardsState} persist={false}>
        <StatefulCardDndProvider>
          <LocationDisplay locationId="deck" />
          <LocationDisplay locationId="hand" />
        </StatefulCardDndProvider>
      </GameProvider>,
    );

    act(() => {
      capturedOnDragEnd!(aceOfSpades, 'hand', undefined);
    });

    // State unchanged -- no source zone means no auto-dispatch
    expect(screen.getByTestId('location-deck').textContent).toBe('2');
    expect(screen.getByTestId('location-hand').textContent).toBe('0');
  });
});
