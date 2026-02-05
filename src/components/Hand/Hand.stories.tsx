import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Hand } from './Hand';
import { parseCard } from '../../types';
import type { CardData } from '../../types';

const sampleHand: CardData[] = [
  parseCard('A\u2660')!,
  parseCard('K\u2665')!,
  parseCard('Q\u2666')!,
  parseCard('J\u2663')!,
  parseCard('T\u2660')!,
];

const largeHand: CardData[] = [
  parseCard('A\u2660')!,
  parseCard('K\u2660')!,
  parseCard('Q\u2660')!,
  parseCard('J\u2660')!,
  parseCard('T\u2660')!,
  parseCard('9\u2665')!,
  parseCard('8\u2665')!,
  parseCard('7\u2665')!,
  parseCard('6\u2666')!,
  parseCard('5\u2666')!,
  parseCard('4\u2663')!,
  parseCard('3\u2663')!,
  parseCard('2\u2663')!,
];

const meta = {
  title: 'Layouts/Hand',
  component: Hand,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The Hand component renders a collection of cards in fan, spread, or stack arrangements. ' +
          'It supports controlled/uncontrolled card selection, hover effects, and enter/exit animations. ' +
          'Card dimensions scale dynamically based on container width.',
      },
    },
  },
  argTypes: {
    layout: {
      control: 'select',
      options: ['fan', 'spread', 'stack'],
    },
    hoverEffect: {
      control: 'select',
      options: ['lift', 'highlight', 'none'],
    },
    faceUp: {
      control: 'boolean',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: 800, padding: 40 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Hand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FanLayout: Story = {
  name: 'Fan Layout',
  args: {
    cards: sampleHand,
    layout: 'fan',
    onCardClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Default fan arrangement with 5 cards. Cards arc outward with rotation.',
      },
    },
  },
};

export const SpreadLayout: Story = {
  name: 'Spread Layout',
  args: {
    cards: sampleHand,
    layout: 'spread',
    onCardClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Cards spread horizontally with overlap. Adapts to container width.',
      },
    },
  },
};

export const StackLayout: Story = {
  name: 'Stack Layout',
  args: {
    cards: sampleHand,
    layout: 'stack',
    onCardClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Cards stacked with slight offset for depth. Minimal footprint.',
      },
    },
  },
};

export const LargeHand: Story = {
  name: 'Large Hand (13 cards)',
  args: {
    cards: largeHand,
    layout: 'fan',
    onCardClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '13 cards in a fan. Card sizes scale down and fan angle adjusts automatically.',
      },
    },
  },
};

export const WithSelection: Story = {
  name: 'With Selection',
  args: {
    cards: sampleHand,
    layout: 'fan',
    selectedCards: [1, 3],
    onSelectionChange: fn(),
    onCardClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Controlled selection mode. Cards at indices 1 and 3 are pre-selected (lifted). ' +
          'Click cards to toggle selection.',
      },
    },
  },
};

export const EmptyHand: Story = {
  name: 'Empty Hand',
  args: {
    cards: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'An empty hand container. Useful as a placeholder for dealt cards.',
      },
    },
  },
};
