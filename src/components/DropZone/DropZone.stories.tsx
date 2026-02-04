import type { Meta, StoryObj } from '@storybook/react';
import { DropZone } from './DropZone';
import { Card } from '../Card';
import { parseCard } from '../../types';

const meta = {
  title: 'Layouts/DropZone',
  component: DropZone,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The DropZone component renders a visual container for card drop targets. ' +
          'Visual states (idle, active, hover) are controlled via the `state` prop. ' +
          'Supports placeholder, none, or custom empty states. In Phase 3, actual ' +
          'drag-and-drop behavior is integrated via DroppableZone wrapper.',
      },
    },
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'active', 'hover'],
    },
    emptyState: {
      control: 'select',
      options: ['none', 'placeholder'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 200 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DropZone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default (Idle)',
  args: {
    label: 'Discard',
    state: 'idle',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default idle state with placeholder text and label.',
      },
    },
  },
};

export const WithPlaceholder: Story = {
  name: 'With Placeholder',
  args: {
    label: 'Draw pile',
    emptyState: 'placeholder',
    state: 'idle',
  },
  parameters: {
    docs: {
      description: {
        story: 'Placeholder mode shows "Drop here" text with an optional label.',
      },
    },
  },
};

export const ActiveState: Story = {
  name: 'Active State',
  args: {
    label: 'Discard',
    state: 'active',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Active state simulates a card being dragged over the zone. ' +
          'The border and background change to indicate a valid drop target.',
      },
    },
  },
};

export const HoverState: Story = {
  name: 'Hover State',
  args: {
    label: 'Discard',
    state: 'hover',
  },
  parameters: {
    docs: {
      description: {
        story: 'Hover state with subtle visual feedback.',
      },
    },
  },
};

export const NoPlaceholder: Story = {
  name: 'No Placeholder',
  args: {
    emptyState: 'none',
    state: 'idle',
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty zone with `emptyState="none"`. Container is visible but content-free.',
      },
    },
  },
};

export const WithCard: Story = {
  name: 'With Card Inside',
  args: {
    label: 'Played card',
    state: 'idle',
  },
  render: (args) => (
    <DropZone {...args}>
      <Card
        card={parseCard('A\u2660')!}
        isFaceUp={true}
        interactive={false}
        style={{ width: 100, height: 140 }}
      />
    </DropZone>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A DropZone containing a card. When children are present, the placeholder is hidden.',
      },
    },
  },
};
