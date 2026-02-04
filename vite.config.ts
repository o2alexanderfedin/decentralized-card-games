import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    }),
  ],
  build: {
    lib: {
      entry: {
        'card-components': resolve(__dirname, 'src/index.ts'),
        'card-components-redux': resolve(__dirname, 'src/redux/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react', 'react-dom', 'react/jsx-runtime',
        'motion', 'motion/react',
        '@dnd-kit/core', '@dnd-kit/utilities', '@dnd-kit/modifiers',
        '@reduxjs/toolkit', 'react-redux',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          motion: 'motion',
          'motion/react': 'motionReact',
          '@reduxjs/toolkit': 'RTK',
          'react-redux': 'ReactRedux',
        },
      },
    },
    cssModules: true,
  },
});
