import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { CardStack } from './CardStack';
import { parseCard } from '../../types';
import type { CardData } from '../../types';

const sampleCards: CardData[] = [
  parseCard('A\u2660')!,
  parseCard('7\u2665')!,
  parseCard('K\u2666')!,
];

const meta = {
  title: 'Layouts/CardStack',
  component: CardStack,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The CardStack component displays overlapping cards with a diagonal cascade offset ' +
          'and slight rotation. Suitable for discard piles, played cards, and generic stacking areas. ' +
          'Supports top-only, all face-up, or all face-down display modes.',
      },
    },
  },
  argTypes: {
    faceUp: {
      control: 'select',
      options: [true, false, 'top-only'],
    },
    maxRotation: {
      control: { type: 'number', min: 0, max: 15 },
    },
    cardWidth: {
      control: { type: 'number', min: 60, max: 200 },
    },
    cardHeight: {
      control: { type: 'number', min: 84, max: 280 },
    },
  },
} satisfies Meta<typeof CardStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TopOnly: Story = {
  name: 'Top Card Face Up',
  args: {
    cards: sampleCards,
    faceUp: 'top-only',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Default mode: only the top card (King of Diamonds) is face up. ' +
          'Lower cards are face down. Typical for discard piles.',
      },
    },
  },
};

export const AllFaceUp: Story = {
  name: 'All Face Up',
  args: {
    cards: sampleCards,
    faceUp: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'All cards are face up with cascading offset. Shows card identities.',
      },
    },
  },
};

export const Cascading: Story = {
  name: 'Cascading (Wide Offset)',
  args: {
    cards: [
      parseCard('A\u2660')!,
      parseCard('K\u2665')!,
      parseCard('Q\u2666')!,
      parseCard('J\u2663')!,
      parseCard('T\u2660')!,
    ],
    faceUp: true,
    offsetX: 20,
    offsetY: 25,
    maxRotation: 5,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Larger offset values create a more spread-out cascade. ' +
          '5 cards with 20px horizontal and 25px vertical offset.',
      },
    },
  },
};

export const WithTopCardClick: Story = {
  name: 'Clickable Top Card',
  args: {
    cards: sampleCards,
    faceUp: 'top-only',
    onTopCardClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Click the top card to see the event data in the Actions panel.',
      },
    },
  },
};

export const SingleCard: Story = {
  name: 'Single Card',
  args: {
    cards: [parseCard('A\u2660')!],
    faceUp: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'A stack with just one card. No cascade offset visible.',
      },
    },
  },
};
