import type { Preview } from '@storybook/react';
import '../src/styles/variables.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: { enable: true },
    },
  },
};

export default preview;
