import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

const externals = [
  'react', 'react-dom', 'react/jsx-runtime',
  'motion', 'motion/react',
  '@dnd-kit/core', '@dnd-kit/utilities', '@dnd-kit/modifiers',
  '@reduxjs/toolkit', 'react-redux',
];

const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'react/jsx-runtime': 'jsxRuntime',
  motion: 'motion',
  'motion/react': 'motionReact',
  '@dnd-kit/core': 'DndKitCore',
  '@dnd-kit/utilities': 'DndKitUtilities',
  '@dnd-kit/modifiers': 'DndKitModifiers',
  '@reduxjs/toolkit': 'RTK',
  'react-redux': 'ReactRedux',
};

// ESM multi-entry build (main config)
// UMD single-entry build runs separately via vite.config.umd.ts
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.stories.tsx'],
    }),
  ],
  build: {
    sourcemap: true,
    lib: {
      entry: {
        'card-components': resolve(__dirname, 'src/index.ts'),
        'card-components-redux': resolve(__dirname, 'src/redux/index.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: externals,
      output: {
        globals,
      },
    },
    cssModules: true,
  },
});
