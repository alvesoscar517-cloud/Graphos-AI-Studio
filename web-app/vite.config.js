import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import seoPrerender from './vite-plugin-seo-prerender.js'

export default defineConfig(({ mode }) => ({
  // Base URL for deployment (use '/' for root domain)
  base: '/',
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: '_locales',
          dest: '.'
        }
      ]
    }),
    // SEO Prerender plugin - injects static content for crawlers
    seoPrerender()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
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
    }
  },
  build: {
    outDir: 'dist',
    minify: mode === 'production' ? 'esbuild' : false,
    sourcemap: mode === 'production' ? false : true,
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'clsx', 'tailwind-merge'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        }
      }
    },
    chunkSizeWarningLimit: 500,
  },
  publicDir: 'public',
  define: {
    __DEV__: mode !== 'production',
  }
}))
