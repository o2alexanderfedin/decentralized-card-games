import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Card } from './Card';
import { parseCard } from '../../types';

const meta = {
  title: 'Getting Started/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The Card component renders a playing card with 3D flip animation. ' +
          'It supports controlled mode (parent manages `isFaceUp`) and uncontrolled mode ' +
          '(internal state with imperative ref API). Animation is GPU-accelerated via Motion.',
      },
    },
  },
  argTypes: {
    card: {
      description: 'Card identity in notation format (e.g. "A\u2660") or CardData object',
    },
    isFaceUp: {
      control: 'boolean',
      description: 'Controlled mode: explicitly set face-up state',
    },
    colorScheme: {
      control: 'select',
      options: ['two-color', 'four-color'],
    },
    aspectRatio: {
      control: 'select',
      options: ['poker', 'bridge'],
    },
    perspective: {
      control: 'select',
      options: ['subtle', 'moderate', 'dramatic'],
    },
    spring: {
      control: 'select',
      options: ['default', 'bouncy', 'stiff'],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AceOfSpades: Story = {
  args: {
    card: parseCard('A\u2660')!,
    isFaceUp: true,
    style: { width: 120, height: 168 },
  },
};

export const FaceDown: Story = {
  args: {
    card: parseCard('A\u2660')!,
    isFaceUp: false,
    style: { width: 120, height: 168 },
  },
};

export const FlipAnimation: Story = {
  name: 'Flip Animation (Bouncy)',
  args: {
    card: parseCard('K\u2665')!,
    spring: 'bouncy',
    style: { width: 120, height: 168 },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Click the card to flip it. Uses the "bouncy" spring preset for a playful feel.',
      },
    },
  },
};

export const AllSuits: Story = {
  name: 'All Suits',
  args: {
    card: parseCard('A\u2660')!,
  },
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      {['\u2660', '\u2665', '\u2666', '\u2663'].map((suit) => (
        <Card
          key={suit}
          card={parseCard(`A${suit}`)!}
          isFaceUp={true}
          style={{ width: 120, height: 168 }}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'One Ace per suit showing the two-color scheme (black/red).',
      },
    },
  },
};

export const FourColorScheme: Story = {
  name: 'Four-Color Scheme',
  args: {
    card: parseCard('A\u2660')!,
  },
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      {['\u2660', '\u2665', '\u2666', '\u2663'].map((suit) => (
        <Card
          key={suit}
          card={parseCard(`A${suit}`)!}
          isFaceUp={true}
          colorScheme="four-color"
          style={{ width: 120, height: 168 }}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Four-color scheme: Spades (black), Hearts (red), Diamonds (blue), Clubs (green).',
      },
    },
  },
};

export const WithClickHandler: Story = {
  name: 'With Click Handler',
  args: {
    card: parseCard('Q\u2665')!,
    isFaceUp: true,
    onClick: fn(),
    style: { width: 120, height: 168 },
  },
  parameters: {
    docs: {
      description: {
        story: 'Click the card to see the click event data logged in the Actions panel.',
      },
    },
  },
};
