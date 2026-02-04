/**
 * Integration tests for GameProvider.
 *
 * Proves that hooks (useGameState, useLocation, useGameActions) work
 * end-to-end within GameProvider, and that localStorage persistence
 * saves and rehydrates state correctly.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { GameProvider } from './GameProvider';
import { useGameState } from '../hooks/useGameState';
import { useLocation } from '../hooks/useLocation';
import { useGameActions } from '../hooks/useGameActions';
import type { GameState } from '../state/types';
import { dealStandardDeck } from '../state/actions';

// ---------------------------------------------------------------------------
// Test helper components
// ---------------------------------------------------------------------------

/** Renders full GameState as JSON for inspection. */
function StateInspector() {
  const state = useGameState();
  return <pre data-testid="state">{JSON.stringify(state)}</pre>;
}

/** Renders a location's card count and dispatches actions via buttons. */
function LocationInspector({ locationId }: { locationId: string }) {
  const cards = useLocation(locationId);
  return <span data-testid={`location-${locationId}`}>{cards.length}</span>;
}

/** Provides dispatch for test interactions. */
function DispatchButton({
  actionType,
  payload,
  label,
}: {
  actionType: string;
  payload?: Record<string, unknown>;
  label: string;
}) {
  const dispatch = useGameActions();
  return (
    <button data-testid={label} onClick={() => dispatch(actionType, payload)}>
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// localStorage mock helpers
// ---------------------------------------------------------------------------

function mockLocalStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      for (const key of Object.keys(store)) delete store[key];
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((_index: number) => null),
    _store: store,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GameProvider', () => {
  let storage: ReturnType<typeof mockLocalStorage>;

  beforeEach(() => {
    storage = mockLocalStorage();
    Object.defineProperty(globalThis, 'localStorage', {
      value: storage,
      writable: true,
      configurable: true,
    });
  });

  // -----------------------------------------------------------------------
  // 1. Default state
  // -----------------------------------------------------------------------
  it('renders with default empty state', () => {
    render(
      <GameProvider persist={false}>
        <StateInspector />
      </GameProvider>,
    );

    const state: GameState = JSON.parse(
      screen.getByTestId('state').textContent!,
    );

    expect(state.locations).toEqual({});
    expect(state.gamePhase).toBeNull();
    expect(state.currentPlayer).toBeNull();
    expect(state.meta).toEqual({});
  });

  // -----------------------------------------------------------------------
  // 2. Dispatch MOVE_CARD
  // -----------------------------------------------------------------------
  it('dispatches MOVE_CARD and updates location', () => {
    const initialCards = {
      locations: {
        deck: [
          { suit: 'spades' as const, rank: 'A' as const, faceUp: false, selected: false },
          { suit: 'hearts' as const, rank: 'K' as const, faceUp: false, selected: false },
        ],
        hand: [],
      },
    };

    render(
      <GameProvider initialState={initialCards} persist={false}>
        <LocationInspector locationId="deck" />
        <LocationInspector locationId="hand" />
        <DispatchButton
          actionType="MOVE_CARD"
          payload={{ cardIndex: 0, from: 'deck', to: 'hand' }}
          label="move"
        />
      </GameProvider>,
    );

    // Before move
    expect(screen.getByTestId('location-deck').textContent).toBe('2');
    expect(screen.getByTestId('location-hand').textContent).toBe('0');

    // Dispatch move
    act(() => {
      screen.getByTestId('move').click();
    });

    // After move
    expect(screen.getByTestId('location-deck').textContent).toBe('1');
    expect(screen.getByTestId('location-hand').textContent).toBe('1');
  });

  // -----------------------------------------------------------------------
  // 3. SET_LOCATIONS with dealStandardDeck data
  // -----------------------------------------------------------------------
  it('dispatches SET_LOCATIONS to populate a 52-card deck', () => {
    const action = dealStandardDeck();

    render(
      <GameProvider persist={false}>
        <LocationInspector locationId="deck" />
        <DispatchButton
          actionType={action.type}
          payload={action.payload}
          label="deal"
        />
      </GameProvider>,
    );

    // Before
    expect(screen.getByTestId('location-deck').textContent).toBe('0');

    // Deal
    act(() => {
      screen.getByTestId('deal').click();
    });

    // After -- 52 cards
    expect(screen.getByTestId('location-deck').textContent).toBe('52');
  });

  // -----------------------------------------------------------------------
  // 4. localStorage persistence: saves and rehydrates
  // -----------------------------------------------------------------------
  it('persists state to localStorage and rehydrates on mount', () => {
    const initialCards = {
      locations: {
        deck: [
          { suit: 'spades' as const, rank: 'A' as const, faceUp: false, selected: false },
        ],
      },
    };

    // Mount with persist=true
    const { unmount } = render(
      <GameProvider initialState={initialCards} persist={true}>
        <StateInspector />
      </GameProvider>,
    );

    // Verify saveState was called (localStorage.setItem)
    expect(storage.setItem).toHaveBeenCalled();
    const savedKey = storage.setItem.mock.calls[0][0];
    expect(savedKey).toBe('cardGameState');

    // Unmount
    unmount();

    // Remount without initialState -- should rehydrate from localStorage
    render(
      <GameProvider persist={true}>
        <StateInspector />
      </GameProvider>,
    );

    const state: GameState = JSON.parse(
      screen.getByTestId('state').textContent!,
    );

    expect(state.locations.deck).toHaveLength(1);
    expect(state.locations.deck[0].suit).toBe('spades');
  });

  // -----------------------------------------------------------------------
  // 5. persist=false disables localStorage
  // -----------------------------------------------------------------------
  it('does not write to localStorage when persist=false', () => {
    render(
      <GameProvider persist={false}>
        <DispatchButton
          actionType="SET_GAME_PHASE"
          payload={'playing' as unknown as Record<string, unknown>}
          label="set-phase"
        />
      </GameProvider>,
    );

    // Dispatch an action
    act(() => {
      screen.getByTestId('set-phase').click();
    });

    // localStorage should not have been written to
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // 6. Custom initialState prop
  // -----------------------------------------------------------------------
  it('applies custom initialState overrides', () => {
    render(
      <GameProvider
        initialState={{ currentPlayer: 'Alice', gamePhase: 'dealing' }}
        persist={false}
      >
        <StateInspector />
      </GameProvider>,
    );

    const state: GameState = JSON.parse(
      screen.getByTestId('state').textContent!,
    );

    expect(state.currentPlayer).toBe('Alice');
    expect(state.gamePhase).toBe('dealing');
  });

  // -----------------------------------------------------------------------
  // 7. Custom storageKey
  // -----------------------------------------------------------------------
  it('uses custom storageKey for localStorage', () => {
    const initialCards = {
      locations: {
        deck: [
          { suit: 'hearts' as const, rank: '2' as const, faceUp: false, selected: false },
        ],
      },
    };

    render(
      <GameProvider
        initialState={initialCards}
        persist={true}
        storageKey="myGame"
      >
        <StateInspector />
      </GameProvider>,
    );

    // Should use custom key
    expect(storage.setItem).toHaveBeenCalled();
    const savedKey = storage.setItem.mock.calls[0][0];
    expect(savedKey).toBe('myGame');
  });
});
