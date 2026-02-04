import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderHook } from '@testing-library/react';
import type { GameState, CardState } from '../state/types';
import type { StateBackend } from './useStateBackend';
import { StateBackendContext } from './useStateBackend';
import { useGameState } from './useGameState';
import { useLocation } from './useLocation';
import { useCard } from './useCard';
import { useGameActions } from './useGameActions';
import { useStateBackend } from './useStateBackend';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const aceOfSpades: CardState = { suit: 'S', rank: 'A', faceUp: false, selected: false };
const kingOfHearts: CardState = { suit: 'H', rank: 'K', faceUp: true, selected: false };
const queenOfDiamonds: CardState = { suit: 'D', rank: 'Q', faceUp: false, selected: true };

const sampleState: GameState = {
  locations: {
    deck: [aceOfSpades],
    hand: [kingOfHearts, queenOfDiamonds],
  },
  currentPlayer: 'player1',
  gamePhase: 'dealing',
  meta: {},
};

// ---------------------------------------------------------------------------
// Mock StateBackend Provider
// ---------------------------------------------------------------------------

function createMockBackend(state: GameState = sampleState): StateBackend {
  return {
    getState: vi.fn(() => state),
    dispatch: vi.fn(),
    subscribe: vi.fn(() => vi.fn()), // returns unsubscribe
  };
}

function MockStateBackendProvider({
  children,
  backend,
}: {
  children: React.ReactNode;
  backend: StateBackend;
}) {
  return (
    <StateBackendContext.Provider value={backend}>
      {children}
    </StateBackendContext.Provider>
  );
}

function createWrapper(backend: StateBackend) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MockStateBackendProvider backend={backend}>
        {children}
      </MockStateBackendProvider>
    );
  };
}

// ---------------------------------------------------------------------------
// useStateBackend
// ---------------------------------------------------------------------------

describe('useStateBackend', () => {
  it('throws when used outside a provider', () => {
    expect(() => {
      renderHook(() => useStateBackend());
    }).toThrow('useStateBackend must be used within a GameStateProvider or ReduxGameProvider');
  });

  it('returns the backend when inside a provider', () => {
    const backend = createMockBackend();
    const { result } = renderHook(() => useStateBackend(), {
      wrapper: createWrapper(backend),
    });
    expect(result.current).toBe(backend);
  });
});

// ---------------------------------------------------------------------------
// useGameState
// ---------------------------------------------------------------------------

describe('useGameState', () => {
  it('returns full game state', () => {
    const backend = createMockBackend();
    const { result } = renderHook(() => useGameState(), {
      wrapper: createWrapper(backend),
    });
    expect(result.current).toBe(sampleState);
  });

  it('throws when used outside a provider', () => {
    expect(() => {
      renderHook(() => useGameState());
    }).toThrow('useStateBackend must be used within a GameStateProvider or ReduxGameProvider');
  });
});

// ---------------------------------------------------------------------------
// useLocation
// ---------------------------------------------------------------------------

describe('useLocation', () => {
  it('returns cards at an existing location', () => {
    const backend = createMockBackend();
    const { result } = renderHook(() => useLocation('hand'), {
      wrapper: createWrapper(backend),
    });
    expect(result.current).toEqual([kingOfHearts, queenOfDiamonds]);
  });

  it('returns empty array for nonexistent location', () => {
    const backend = createMockBackend();
    const { result } = renderHook(() => useLocation('nonexistent'), {
      wrapper: createWrapper(backend),
    });
    expect(result.current).toEqual([]);
  });

  it('throws when used outside a provider', () => {
    expect(() => {
      renderHook(() => useLocation('hand'));
    }).toThrow('useStateBackend must be used within a GameStateProvider or ReduxGameProvider');
  });
});

// ---------------------------------------------------------------------------
// useCard
// ---------------------------------------------------------------------------

describe('useCard', () => {
  it('returns the first card at a location', () => {
    const backend = createMockBackend();
    const { result } = renderHook(() => useCard('hand', 0), {
      wrapper: createWrapper(backend),
    });
    expect(result.current).toBe(kingOfHearts);
  });

  it('returns the second card at a location', () => {
    const backend = createMockBackend();
    const { result } = renderHook(() => useCard('hand', 1), {
      wrapper: createWrapper(backend),
    });
    expect(result.current).toBe(queenOfDiamonds);
  });

  it('returns undefined for out-of-bounds index', () => {
    const backend = createMockBackend();
    const { result } = renderHook(() => useCard('hand', 99), {
      wrapper: createWrapper(backend),
    });
    expect(result.current).toBeUndefined();
  });

  it('returns undefined for missing location', () => {
    const backend = createMockBackend();
    const { result } = renderHook(() => useCard('nonexistent', 0), {
      wrapper: createWrapper(backend),
    });
    expect(result.current).toBeUndefined();
  });

  it('throws when used outside a provider', () => {
    expect(() => {
      renderHook(() => useCard('hand', 0));
    }).toThrow('useStateBackend must be used within a GameStateProvider or ReduxGameProvider');
  });
});

// ---------------------------------------------------------------------------
// useGameActions
// ---------------------------------------------------------------------------

describe('useGameActions', () => {
  it('returns the dispatch function', () => {
    const backend = createMockBackend();
    const { result } = renderHook(() => useGameActions(), {
      wrapper: createWrapper(backend),
    });
    expect(result.current).toBe(backend.dispatch);
  });

  it('dispatch invokes backend.dispatch with type and payload', () => {
    const backend = createMockBackend();
    const { result } = renderHook(() => useGameActions(), {
      wrapper: createWrapper(backend),
    });

    result.current('MOVE_CARD', { cardIndex: 0, from: 'deck', to: 'hand' });

    expect(backend.dispatch).toHaveBeenCalledWith('MOVE_CARD', {
      cardIndex: 0,
      from: 'deck',
      to: 'hand',
    });
  });

  it('dispatch works without payload', () => {
    const backend = createMockBackend();
    const { result } = renderHook(() => useGameActions(), {
      wrapper: createWrapper(backend),
    });

    result.current('RESET');

    expect(backend.dispatch).toHaveBeenCalledWith('RESET');
  });

  it('throws when used outside a provider', () => {
    expect(() => {
      renderHook(() => useGameActions());
    }).toThrow('useStateBackend must be used within a GameStateProvider or ReduxGameProvider');
  });
});
