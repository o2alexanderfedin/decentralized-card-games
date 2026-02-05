import type { Meta, StoryObj } from '@storybook/react';
import { StatefulCardDndProvider } from './StatefulCardDndProvider';
import { DraggableCard } from '../DraggableCard/DraggableCard';
import { DroppableZone } from '../DroppableZone/DroppableZone';
import { Deck } from '../Deck/Deck';
import { GameProvider } from '../../context/GameProvider';
import { useGameActions } from '../../hooks/useGameActions';
import { useLocation } from '../../hooks/useLocation';
import { allCards, formatCard } from '../../types';
import type { CardState } from '../../state/types';

const meta = {
  title: 'Games/Card Table',
  component: StatefulCardDndProvider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'StatefulCardDndProvider bridges drag-and-drop with state management. ' +
          'Wraps CardDndProvider and auto-dispatches MOVE_CARD when cards are ' +
          'dragged between zones. Use with GameProvider for full state integration.',
      },
    },
  },
} satisfies Meta<typeof StatefulCardDndProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Helper: build initial deck as CardState[]
// ---------------------------------------------------------------------------

function buildDeck(): CardState[] {
  return allCards().map((card) => ({
    suit: card.suit,
    rank: card.rank,
    faceUp: false,
    selected: false,
  }));
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ---------------------------------------------------------------------------
// DealAndMove -- full game-like demo
// ---------------------------------------------------------------------------

function DealAndMoveBoard() {
  const dispatch = useGameActions();
  const deckCards = useLocation('deck');
  const handCards = useLocation('hand');
  const tableCards = useLocation('table');

  const handleDeal = () => {
    if (deckCards.length === 0) return;
    dispatch('DEAL_CARDS', {
      from: 'deck',
      to: { hand: 1 },
      faceUp: true,
    } as unknown as Record<string, unknown>);
  };

  const handleReset = () => {
    dispatch('SET_LOCATIONS', {
      locations: {
        deck: shuffleArray(buildDeck()),
        hand: [],
        table: [],
      },
    } as unknown as Record<string, unknown>);
  };

  return (
    <StatefulCardDndProvider>
      <div style={{ fontFamily: 'sans-serif' }}>
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={handleReset}
            style={{
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              borderRadius: 4,
              border: '1px solid #ccc',
              background: '#f5f5f5',
            }}
          >
            New Game
          </button>
          <span style={{ color: '#666', fontSize: 14 }}>
            Click the deck to deal. Drag cards from your hand to the table.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Deck */}
          <div>
            <h4 style={{ margin: '0 0 0.5rem' }}>Deck</h4>
            <Deck count={deckCards.length} onDraw={handleDeal} />
          </div>

          {/* Hand */}
          <div style={{ flex: 1, minWidth: 250 }}>
            <h4 style={{ margin: '0 0 0.5rem' }}>Hand ({handCards.length})</h4>
            <DroppableZone id="hand" label="Hand" accepts={['card']} emptyState="placeholder">
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  minHeight: 140,
                  padding: '0.5rem',
                  alignContent: 'flex-start',
                }}
              >
                {handCards.map((card, idx) => (
                  <DraggableCard
                    key={`hand-${formatCard(card)}-${idx}`}
                    id={`hand-${formatCard(card)}-${idx}`}
                    card={card}
                    isFaceUp={card.faceUp}
                    sourceZoneId="hand"
                    style={{ width: 80, height: 112 }}
                  />
                ))}
              </div>
            </DroppableZone>
          </div>

          {/* Table */}
          <div style={{ flex: 1, minWidth: 250 }}>
            <h4 style={{ margin: '0 0 0.5rem' }}>Table ({tableCards.length})</h4>
            <DroppableZone id="table" label="Table" accepts={['card']} emptyState="placeholder">
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  minHeight: 140,
                  padding: '0.5rem',
                  alignContent: 'flex-start',
                }}
              >
                {tableCards.map((card, idx) => (
                  <DraggableCard
                    key={`table-${formatCard(card)}-${idx}`}
                    id={`table-${formatCard(card)}-${idx}`}
                    card={card}
                    isFaceUp={card.faceUp}
                    sourceZoneId="table"
                    style={{ width: 80, height: 112 }}
                  />
                ))}
              </div>
            </DroppableZone>
          </div>
        </div>
      </div>
    </StatefulCardDndProvider>
  );
}

function DealAndMoveDemo() {
  return (
    <GameProvider
      persist={false}
      initialState={{
        locations: {
          deck: shuffleArray(buildDeck()),
          hand: [],
          table: [],
        },
      }}
    >
      <DealAndMoveBoard />
    </GameProvider>
  );
}

export const DealAndMove: Story = {
  name: 'Deal and Move',
  args: { children: null },
  render: () => <DealAndMoveDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'A complete game-like demo combining state management with drag-and-drop. ' +
          'Click "New Game" to shuffle and reset. Click the deck to deal cards to your hand. ' +
          'Drag cards from your hand to the table, or between hand and table. ' +
          'Uses GameProvider + StatefulCardDndProvider for automatic state synchronization.',
      },
    },
  },
};
