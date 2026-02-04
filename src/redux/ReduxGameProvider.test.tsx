/**
 * Integration tests for ReduxGameProvider.
 *
 * Verifies that unified hooks (useGameState, useLocation, useCard, useGameActions)
 * work identically when backed by Redux via ReduxGameProvider.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { ReduxGameProvider } from './ReduxGameProvider';
import { configureGameStore } from './store';
import { gameSlice } from './slice';
import { useGameState } from '../hooks/useGameState';
import { useLocation } from '../hooks/useLocation';
import { useCard } from '../hooks/useCard';
import { useGameActions } from '../hooks/useGameActions';
import type { CardState } from '../state/types';
import type { GameRootState } from './store';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeCard(suit: CardState['suit'], rank: CardState['rank'], faceUp = false): CardState {
  return { suit, rank, faceUp, selected: false };
}

/** Component that renders the full game state as JSON. */
function StateDisplay() {
  const state = useGameState();
  return <div data-testid="state">{JSON.stringify(state)}</div>;
}

/** Component that renders a specific location. */
function LocationDisplay({ locationId }: { locationId: string }) {
  const cards = useLocation(locationId);
  return <div data-testid={`location-${locationId}`}>{cards.length} cards</div>;
}

/** Component that renders a single card. */
function CardDisplay({ location, index }: { location: string; index: number }) {
  const card = useCard(location, index);
  return (
    <div data-testid="card">
      {card ? `${card.rank}${card.suit} faceUp=${card.faceUp}` : 'none'}
    </div>
  );
}

/** Component that dispatches actions. */
function ActionDispatcher({
  actionType,
  payload,
}: {
  actionType: string;
  payload?: Record<string, unknown>;
}) {
  const dispatch = useGameActions();
  return (
    <button data-testid="dispatch" onClick={() => dispatch(actionType, payload)}>
      dispatch
    </button>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ReduxGameProvider', () => {
  it('hooks work with ReduxGameProvider (initial state)', () => {
    render(
      <ReduxGameProvider>
        <StateDisplay />
      </ReduxGameProvider>,
    );

    const stateEl = screen.getByTestId('state');
    const state = JSON.parse(stateEl.textContent!);
    expect(state.locations).toEqual({});
    expect(state.currentPlayer).toBeNull();
    expect(state.gamePhase).toBeNull();
    expect(state.meta).toEqual({});
  });

  it('dispatch via useGameActions updates state', () => {
    const cards: CardState[] = [
      makeCard('hearts', 'A'),
      makeCard('spades', 'K'),
    ];

    render(
      <ReduxGameProvider
        initialState={{
          locations: { deck: cards },
        }}
      >
        <LocationDisplay locationId="deck" />
        <LocationDisplay locationId="hand" />
        <ActionDispatcher
          actionType="MOVE_CARD"
          payload={{ cardIndex: 0, from: 'deck', to: 'hand' }}
        />
      </ReduxGameProvider>,
    );

    // Before dispatch
    expect(screen.getByTestId('location-deck').textContent).toBe('2 cards');
    expect(screen.getByTestId('location-hand').textContent).toBe('0 cards');

    // Dispatch MOVE_CARD
    act(() => {
      screen.getByTestId('dispatch').click();
    });

    // After dispatch
    expect(screen.getByTestId('location-deck').textContent).toBe('1 cards');
    expect(screen.getByTestId('location-hand').textContent).toBe('1 cards');
  });

  it('dealStandardDeck integration via SET_LOCATIONS', () => {
    // Generate 52 cards
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'] as const;
    const deck: CardState[] = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push(makeCard(suit, rank));
      }
    }

    render(
      <ReduxGameProvider>
        <LocationDisplay locationId="deck" />
        <ActionDispatcher
          actionType="SET_LOCATIONS"
          payload={{ locations: { deck } } as unknown as Record<string, unknown>}
        />
      </ReduxGameProvider>,
    );

    expect(screen.getByTestId('location-deck').textContent).toBe('0 cards');

    act(() => {
      screen.getByTestId('dispatch').click();
    });

    expect(screen.getByTestId('location-deck').textContent).toBe('52 cards');
  });

  it('custom store prop is used', () => {
    const store = configureGameStore({ gamePhase: 'playing' });

    render(
      <ReduxGameProvider store={store}>
        <StateDisplay />
      </ReduxGameProvider>,
    );

    const state = JSON.parse(screen.getByTestId('state').textContent!);
    expect(state.gamePhase).toBe('playing');
  });

  it('custom initialState prop sets state', () => {
    render(
      <ReduxGameProvider initialState={{ currentPlayer: 'Bob' }}>
        <StateDisplay />
      </ReduxGameProvider>,
    );

    const state = JSON.parse(screen.getByTestId('state').textContent!);
    expect(state.currentPlayer).toBe('Bob');
  });

  it('Redux useSelector reads from the same store', () => {
    function ReduxSelectorDisplay() {
      const gamePhase = useSelector(
        (state: GameRootState) => state[gameSlice.reducerPath].gamePhase,
      );
      return <div data-testid="redux-phase">{gamePhase ?? 'null'}</div>;
    }

    render(
      <ReduxGameProvider initialState={{ gamePhase: 'setup' }}>
        <ReduxSelectorDisplay />
      </ReduxGameProvider>,
    );

    expect(screen.getByTestId('redux-phase').textContent).toBe('setup');
  });

  it('FLIP_CARD action updates card state', () => {
    const cards: CardState[] = [makeCard('hearts', 'A', false)];

    render(
      <ReduxGameProvider initialState={{ locations: { hand: cards } }}>
        <CardDisplay location="hand" index={0} />
        <ActionDispatcher
          actionType="FLIP_CARD"
          payload={{ location: 'hand', cardIndex: 0, faceUp: true }}
        />
      </ReduxGameProvider>,
    );

    expect(screen.getByTestId('card').textContent).toBe('Ahearts faceUp=false');

    act(() => {
      screen.getByTestId('dispatch').click();
    });

    expect(screen.getByTestId('card').textContent).toBe('Ahearts faceUp=true');
  });

  it('RESET action restores initial state', () => {
    render(
      <ReduxGameProvider initialState={{ gamePhase: 'playing', currentPlayer: 'Alice' }}>
        <StateDisplay />
        <ActionDispatcher actionType="RESET" />
      </ReduxGameProvider>,
    );

    const stateBefore = JSON.parse(screen.getByTestId('state').textContent!);
    expect(stateBefore.gamePhase).toBe('playing');
    expect(stateBefore.currentPlayer).toBe('Alice');

    act(() => {
      screen.getByTestId('dispatch').click();
    });

    const stateAfter = JSON.parse(screen.getByTestId('state').textContent!);
    expect(stateAfter.gamePhase).toBeNull();
    expect(stateAfter.currentPlayer).toBeNull();
    expect(stateAfter.locations).toEqual({});
  });
});
