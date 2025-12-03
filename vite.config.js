import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vite config for Main App (does not include admin)
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://graphosai-472729326429.us-central1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/send-feedback': {
        target: 'https://graphosai-472729326429.us-central1.run.app',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't delete admin when building main
    rollupOptions: {
      output: {
        entryFileNames: 'assets/main-[hash].js',
        chunkFileNames: 'assets/main-chunk-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  publicDir: 'public'
})
