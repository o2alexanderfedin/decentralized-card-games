import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Deck } from './Deck';

const meta = {
  title: 'Layouts/Deck',
  component: Deck,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The Deck component renders a clickable pile of face-down cards with a count badge. ' +
          'Clicking the deck fires `onDraw`. Visual stack depth shows up to 5 layers. ' +
          'Configurable empty states when count reaches 0.',
      },
    },
  },
  argTypes: {
    count: {
      control: { type: 'number', min: 0, max: 52 },
    },
    emptyState: {
      control: 'select',
      options: ['none', 'placeholder'],
    },
  },
} satisfies Meta<typeof Deck>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullDeck: Story = {
  name: 'Full Deck (52 cards)',
  args: {
    count: 52,
    onDraw: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'A full 52-card deck. Shows maximum visual depth (5 layers) with count badge.',
      },
    },
  },
};

export const PartialDeck: Story = {
  name: 'Partial Deck (10 cards)',
  args: {
    count: 10,
    onDraw: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'A partial deck with 10 cards. Fewer visual layers reflect lower count.',
      },
    },
  },
};

export const EmptyDeck: Story = {
  name: 'Empty Deck',
  args: {
    count: 0,
    emptyState: 'placeholder',
  },
  parameters: {
    docs: {
      description: {
        story: 'An empty deck showing the placeholder state (dashed outline).',
      },
    },
  },
};

export const EmptyDeckHidden: Story = {
  name: 'Empty Deck (hidden)',
  args: {
    count: 0,
    emptyState: 'none',
  },
  parameters: {
    docs: {
      description: {
        story: 'An empty deck with `emptyState="none"`. Container exists but is invisible.',
      },
    },
  },
};

export const WithDrawAction: Story = {
  name: 'Interactive Draw',
  args: {
    count: 52,
  },
  render: function DrawDemo() {
    const [remaining, setRemaining] = useState(52);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Deck
          count={remaining}
          onDraw={() => setRemaining((r) => Math.max(0, r - 1))}
        />
        <div>
          <p style={{ margin: 0, fontFamily: 'sans-serif' }}>
            Cards remaining: <strong>{remaining}</strong>
          </p>
          <button
            onClick={() => setRemaining(52)}
            style={{ marginTop: 8, cursor: 'pointer' }}
          >
            Reset
          </button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Click the deck to draw cards one by one. The count badge updates and the visual ' +
          'stack shrinks as cards are drawn. Reset to refill.',
      },
    },
  },
};
