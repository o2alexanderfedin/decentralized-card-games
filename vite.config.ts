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
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CardComponents',
      formats: ['es', 'cjs'],
      fileName: 'card-components',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'motion', 'motion/react'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          motion: 'motion',
          'motion/react': 'motionReact',
        },
      },
    },
    cssModules: true,
  },
});
