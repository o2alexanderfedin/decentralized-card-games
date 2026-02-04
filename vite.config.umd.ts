import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
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

// UMD build for main entry only (CDN usage)
// Multi-entry not supported with UMD format, so this is a separate build pass
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['umd'],
      name: 'CardComponents',
      fileName: () => 'card-components.umd.cjs',
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
