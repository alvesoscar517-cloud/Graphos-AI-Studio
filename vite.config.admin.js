import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Vite config cho Admin Panel - Web Application
export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, 'admin-panel'),
  base: '/', // Root path for web app
  css: {
    postcss: resolve(__dirname, 'admin-panel/postcss.config.js'),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'admin-panel'),
    },
  },
  server: {
    port: 5174,
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
    },
    fs: {
      allow: ['..']
    }
  },
  build: {
    outDir: resolve(__dirname, 'dist-admin'),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'admin-panel/index.html')
      },
      output: {
        // Code splitting configuration
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-form': ['react-hook-form', 'zod', '@hookform/resolvers'],
        },
        // Asset naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
  },
  publicDir: resolve(__dirname, 'admin-panel/public')
})
