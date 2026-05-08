import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TableTan',
      formats: ['es', 'umd'],
      fileName: (format) => `table-tan.${format}.js`,
    },
    cssCodeSplit: false,
    rollupOptions: {
      // Externalize everything that consumers must install themselves
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@tanstack/react-table',
        '@tanstack/react-virtual',
        '@dnd-kit/core',
        '@dnd-kit/sortable',
        '@dnd-kit/utilities',
        'localforage',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          '@tanstack/react-table': 'TanStackReactTable',
          '@tanstack/react-virtual': 'TanStackReactVirtual',
          '@dnd-kit/core': 'DndKitCore',
          '@dnd-kit/sortable': 'DndKitSortable',
          '@dnd-kit/utilities': 'DndKitUtilities',
          localforage: 'localforage',
        },
        // Preserve CSS class names used by Tailwind JIT
        assetFileNames: 'style[extname]',
      },
    },
  },
});
