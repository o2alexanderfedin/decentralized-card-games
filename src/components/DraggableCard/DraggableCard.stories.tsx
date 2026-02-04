import type { Meta, StoryObj } from '@storybook/react';
import { DraggableCard } from './DraggableCard';
import { CardDndProvider } from '../CardDndProvider/CardDndProvider';
import { DroppableZone } from '../DroppableZone/DroppableZone';
import { parseCard } from '../../types';

const meta = {
  title: 'Interactions/DraggableCard',
  component: DraggableCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <CardDndProvider>
        <div style={{ padding: '2rem' }}>
          <Story />
        </div>
      </CardDndProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'DraggableCard wraps the Card component with dnd-kit drag capabilities. ' +
          'Must be rendered inside a CardDndProvider (or DndContext). ' +
          'Supports drag overlay, source zone tracking, and disabled state.',
      },
    },
  },
} satisfies Meta<typeof DraggableCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicDrag: Story = {
  name: 'Basic Drag',
  args: {
    id: 'card-ace-spades',
    card: parseCard('A\u2660')!,
    isFaceUp: true,
    style: { width: 120, height: 168 },
  },
  parameters: {
    docs: {
      description: {
        story:
          'A single draggable card. Click and drag to move it around. ' +
          'The source card becomes hidden while the drag overlay follows the cursor.',
      },
    },
  },
};

export const DisabledDrag: Story = {
  name: 'Disabled Drag',
  args: {
    id: 'card-king-hearts',
    card: parseCard('K\u2665')!,
    isFaceUp: true,
    disabled: true,
    style: { width: 120, height: 168 },
  },
  parameters: {
    docs: {
      description: {
        story:
          'A card with dragging disabled. The cursor changes to indicate ' +
          'the card cannot be dragged.',
      },
    },
  },
};

export const WithDragOverlay: Story = {
  name: 'With Drag Overlay',
  args: {
    id: 'card-queen-diamonds',
    card: parseCard('Q\u2666')!,
    isFaceUp: true,
    sourceZoneId: 'demo-zone',
    style: { width: 120, height: 168 },
  },
  render: (args) => (
    <DroppableZone id="demo-zone" label="Drop Zone" accepts={['card']} emptyState="placeholder">
      <DraggableCard {...args} />
    </DroppableZone>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A draggable card inside a DroppableZone. Drag the card to see the overlay. ' +
          'The source zone ID is included in the drag data for drop validation.',
      },
    },
  },
};
