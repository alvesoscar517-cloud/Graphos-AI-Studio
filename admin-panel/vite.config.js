import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  root: '.',
  base: '/',
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'data-vendor': ['@tanstack/react-query', '@tanstack/react-table'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'chart-vendor': ['recharts'],
          'radix-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-switch',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-popover',
            '@radix-ui/react-avatar',
            '@radix-ui/react-progress',
          ],
          'date-vendor': ['date-fns', 'react-day-picker'],
          'utils-vendor': ['clsx', 'tailwind-merge'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  
  server: {
    port: 5175,
    strictPort: true,
    open: true,
  },
  
  preview: {
    port: 4174,
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'recharts',
      'date-fns',
    ],
  },
})
