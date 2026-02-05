import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CardDndProvider } from './CardDndProvider';
import { DraggableCard } from '../DraggableCard/DraggableCard';
import { DroppableZone } from '../DroppableZone/DroppableZone';
import { parseCard, formatCard } from '../../types';
import type { CardData } from '../../types';

const meta = {
  title: 'Interactions/Drag and Drop',
  component: CardDndProvider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'CardDndProvider is the top-level drag-and-drop context for card games. ' +
          'It configures sensors, drag overlay, haptic feedback, and lifecycle callbacks. ' +
          'Wrap your game board in this component to enable card DnD.',
      },
    },
  },
} satisfies Meta<typeof CardDndProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// DragBetweenZones -- interactive demo with state management
// ---------------------------------------------------------------------------

const zoneStyle: React.CSSProperties = {
  minWidth: 200,
  minHeight: 220,
  padding: '1rem',
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
  alignContent: 'flex-start',
};

function DragBetweenZonesDemo() {
  const [zone1Cards, setZone1Cards] = useState<CardData[]>([
    parseCard('A\u2660')!,
    parseCard('K\u2665')!,
    parseCard('Q\u2666')!,
  ]);
  const [zone2Cards, setZone2Cards] = useState<CardData[]>([]);

  const handleDragEnd = (card: CardData, targetZoneId: string | null, sourceZoneId?: string) => {
    if (!targetZoneId || targetZoneId === sourceZoneId) return;

    const removeFrom = (cards: CardData[]) =>
      cards.filter((c) => !(c.suit === card.suit && c.rank === card.rank));

    if (targetZoneId === 'zone2' && sourceZoneId === 'zone1') {
      setZone1Cards(removeFrom);
      setZone2Cards((prev) => [...prev, card]);
    } else if (targetZoneId === 'zone1' && sourceZoneId === 'zone2') {
      setZone2Cards(removeFrom);
      setZone1Cards((prev) => [...prev, card]);
    }
  };

  return (
    <CardDndProvider onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div>
          <h4 style={{ margin: '0 0 0.5rem', fontFamily: 'sans-serif' }}>Zone 1</h4>
          <DroppableZone id="zone1" label="Zone 1" accepts={['card']} emptyState="placeholder">
            <div style={zoneStyle}>
              {zone1Cards.map((card) => (
                <DraggableCard
                  key={formatCard(card)}
                  id={`z1-${formatCard(card)}`}
                  card={card}
                  isFaceUp
                  sourceZoneId="zone1"
                  style={{ width: 80, height: 112 }}
                />
              ))}
            </div>
          </DroppableZone>
        </div>
        <div>
          <h4 style={{ margin: '0 0 0.5rem', fontFamily: 'sans-serif' }}>Zone 2</h4>
          <DroppableZone id="zone2" label="Zone 2" accepts={['card']} emptyState="placeholder">
            <div style={zoneStyle}>
              {zone2Cards.map((card) => (
                <DraggableCard
                  key={formatCard(card)}
                  id={`z2-${formatCard(card)}`}
                  card={card}
                  isFaceUp
                  sourceZoneId="zone2"
                  style={{ width: 80, height: 112 }}
                />
              ))}
            </div>
          </DroppableZone>
        </div>
      </div>
    </CardDndProvider>
  );
}

export const DragBetweenZones: Story = {
  name: 'Drag Between Zones',
  args: { children: null },
  render: () => <DragBetweenZonesDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Drag cards between two drop zones. Cards move from one zone to the other ' +
          'on successful drop. Try dragging all cards to Zone 2 and back.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// DragWithValidation -- zone that only accepts hearts
// ---------------------------------------------------------------------------

function DragWithValidationDemo() {
  const initialCards: CardData[] = [
    parseCard('A\u2660')!,
    parseCard('K\u2665')!,
    parseCard('Q\u2666')!,
    parseCard('J\u2663')!,
    parseCard('T\u2665')!,
  ];

  const [sourceCards, setSourceCards] = useState<CardData[]>(initialCards);
  const [heartsOnly, setHeartsOnly] = useState<CardData[]>([]);

  const handleDragEnd = (card: CardData, targetZoneId: string | null, sourceZoneId?: string) => {
    if (!targetZoneId || targetZoneId === sourceZoneId) return;

    const removeFrom = (cards: CardData[]) =>
      cards.filter((c) => !(c.suit === card.suit && c.rank === card.rank));

    if (targetZoneId === 'hearts-zone' && sourceZoneId === 'source-zone') {
      setSourceCards(removeFrom);
      setHeartsOnly((prev) => [...prev, card]);
    } else if (targetZoneId === 'source-zone' && sourceZoneId === 'hearts-zone') {
      setHeartsOnly(removeFrom);
      setSourceCards((prev) => [...prev, card]);
    }
  };

  return (
    <CardDndProvider onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div>
          <h4 style={{ margin: '0 0 0.5rem', fontFamily: 'sans-serif' }}>All Cards</h4>
          <DroppableZone id="source-zone" label="All Cards" accepts={['card']} emptyState="placeholder">
            <div style={zoneStyle}>
              {sourceCards.map((card) => (
                <DraggableCard
                  key={formatCard(card)}
                  id={`src-${formatCard(card)}`}
                  card={card}
                  isFaceUp
                  sourceZoneId="source-zone"
                  style={{ width: 80, height: 112 }}
                />
              ))}
            </div>
          </DroppableZone>
        </div>
        <div>
          <h4 style={{ margin: '0 0 0.5rem', fontFamily: 'sans-serif' }}>
            Hearts Only (validated)
          </h4>
          <DroppableZone
            id="hearts-zone"
            label="Hearts Only"
            accepts={['card']}
            onValidate={(card) => card.suit === 'hearts'}
            emptyState="placeholder"
          >
            <div style={zoneStyle}>
              {heartsOnly.map((card) => (
                <DraggableCard
                  key={formatCard(card)}
                  id={`hrt-${formatCard(card)}`}
                  card={card}
                  isFaceUp
                  sourceZoneId="hearts-zone"
                  style={{ width: 80, height: 112 }}
                />
              ))}
            </div>
          </DroppableZone>
        </div>
      </div>
    </CardDndProvider>
  );
}

export const DragWithValidation: Story = {
  name: 'Drag With Validation',
  args: { children: null },
  render: () => <DragWithValidationDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'The right zone only accepts hearts. Try dragging a spade or diamond -- ' +
          'it will be rejected. Only heart cards can be dropped in the validated zone.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// MultipleCards -- several draggable cards with a single drop zone
// ---------------------------------------------------------------------------

function MultipleCardsDemo() {
  const allInitial: CardData[] = [
    parseCard('A\u2660')!,
    parseCard('K\u2665')!,
    parseCard('Q\u2666')!,
    parseCard('J\u2663')!,
    parseCard('T\u2660')!,
    parseCard('9\u2665')!,
    parseCard('8\u2666')!,
  ];

  const [handCards, setHandCards] = useState<CardData[]>(allInitial);
  const [discardCards, setDiscardCards] = useState<CardData[]>([]);

  const handleDragEnd = (card: CardData, targetZoneId: string | null, sourceZoneId?: string) => {
    if (!targetZoneId || targetZoneId === sourceZoneId) return;

    const removeFrom = (cards: CardData[]) =>
      cards.filter((c) => !(c.suit === card.suit && c.rank === card.rank));

    if (targetZoneId === 'discard' && sourceZoneId === 'hand') {
      setHandCards(removeFrom);
      setDiscardCards((prev) => [...prev, card]);
    } else if (targetZoneId === 'hand' && sourceZoneId === 'discard') {
      setDiscardCards(removeFrom);
      setHandCards((prev) => [...prev, card]);
    }
  };

  return (
    <CardDndProvider onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div>
          <h4 style={{ margin: '0 0 0.5rem', fontFamily: 'sans-serif' }}>
            Hand ({handCards.length} cards)
          </h4>
          <DroppableZone id="hand" label="Hand" accepts={['card']} emptyState="placeholder">
            <div style={{ ...zoneStyle, minWidth: 300 }}>
              {handCards.map((card) => (
                <DraggableCard
                  key={formatCard(card)}
                  id={`hand-${formatCard(card)}`}
                  card={card}
                  isFaceUp
                  sourceZoneId="hand"
                  style={{ width: 70, height: 98 }}
                />
              ))}
            </div>
          </DroppableZone>
        </div>
        <div>
          <h4 style={{ margin: '0 0 0.5rem', fontFamily: 'sans-serif' }}>
            Discard ({discardCards.length} cards)
          </h4>
          <DroppableZone id="discard" label="Discard Pile" accepts={['card']} emptyState="placeholder">
            <div style={zoneStyle}>
              {discardCards.map((card) => (
                <DraggableCard
                  key={formatCard(card)}
                  id={`disc-${formatCard(card)}`}
                  card={card}
                  isFaceUp
                  sourceZoneId="discard"
                  style={{ width: 70, height: 98 }}
                />
              ))}
            </div>
          </DroppableZone>
        </div>
      </div>
    </CardDndProvider>
  );
}

export const MultipleCards: Story = {
  name: 'Multiple Cards',
  args: { children: null },
  render: () => <MultipleCardsDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Seven cards in a hand with a discard pile. Drag cards to discard, ' +
          'or drag them back. Demonstrates multiple simultaneous draggable items.',
      },
    },
  },
};
