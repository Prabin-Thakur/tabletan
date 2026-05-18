import { defineConfig } from 'vite';  // Vite's type-safe config helper
import react from '@vitejs/plugin-react';  // Enables React JSX and Fast Refresh
import dts from 'vite-plugin-dts';  // Generates TypeScript .d.ts declaration files
import { resolve } from 'path';  // Creates absolute paths (cross-platform)

export default defineConfig({
  plugins: [
    react(),  // Process JSX/TSX and enable React Fast Refresh during dev
    dts({
      rollupTypes: true,  // Merge all .d.ts files into a single index.d.ts (cleaner npm package)
      tsconfigPath: "./tsconfig.json",  // Use this TypeScript config for type generation
      outDir: "dist/types",  // Temporary output folder for .d.ts files before merging
    }), 
  ],
  build: {
    lib: {  // Library mode (build for npm, not for app deployment)
      entry: resolve(__dirname, 'src/index.ts'),  // Main entry file - exports all public APIs
      name: 'tabletan',  // Global variable name for UMD build (window.tabletan)
      formats: ['es', 'umd',],  // ES Modules (modern bundlers) + UMD (CDN/script tags)
      fileName: (format) => `index.${format}.js`,  // Output: index.es.js, index.umd.js
    },
    copyPublicDir: false,  // Don't copy public/ folder - libraries don't need static assets
    cssCodeSplit: false,  // Bundle all CSS into one file (easier for consumers to import)
    rollupOptions: {
      // Externalize everything that consumers must install themselves
      // Prevents bundling these packages - avoids duplicate React, version conflicts, and reduces size
      external: [
        'react',  // Core React - prevents "invalid hook call" errors from duplicate React
        'react-dom',  // React DOM - must match React version
        'react/jsx-runtime',  // React 17+ JSX transform - avoids version mismatches
        '@tanstack/react-table',  // Table logic - user will have their own copy
        '@tanstack/react-virtual',  // Virtual scrolling - optional peer dependency
        '@dnd-kit/core',  // Drag and drop core - user may need custom setup
        '@dnd-kit/sortable',  // Sortable DnD - avoid bundling duplicate
        '@dnd-kit/utilities',  // DnD helpers - same as above
        'localforage',  // Storage solution - user might prefer IndexedDB wrapper alternatives
      ],
      output: {
        // Global variable names for UMD build (when loaded via <script src="...">)
        // Maps package names to their expected global variables in the browser
        globals: {
          react: 'React',  // window.React
          'react-dom': 'ReactDOM',  // window.ReactDOM
          'react/jsx-runtime': 'jsxRuntime',  // window.jsxRuntime
          '@tanstack/react-table': 'TanStackReactTable',  // window.TanStackReactTable
          '@tanstack/react-virtual': 'TanStackReactVirtual',  // window.TanStackReactVirtual
          '@dnd-kit/core': 'DndKitCore',  // window.DndKitCore
          '@dnd-kit/sortable': 'DndKitSortable',  // window.DndKitSortable
          '@dnd-kit/utilities': 'DndKitUtilities',  // window.DndKitUtilities
          localforage: 'localforage',  // window.localforage
        },
      },
    },
    sourcemap: process.env.NODE_ENV === 'development',  // Generate source maps only in dev (saves production size)
    outDir: 'dist',  // Output everything to this folder
    emptyOutDir: true,  // Delete old dist folder before each build (clean builds)
  },
});