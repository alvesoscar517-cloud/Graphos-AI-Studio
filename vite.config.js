import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// Vite config for Main App (Chrome Extension)
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: '_locales',
          dest: '.'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Deduplicate Firebase to ensure single instance
    dedupe: [
      'firebase',
      '@firebase/app',
      '@firebase/auth',
      '@firebase/firestore',
      '@firebase/util',
      '@firebase/component',
      '@firebase/logger'
    ]
  },
  optimizeDeps: {
    // Force Vite to pre-bundle these together
    include: [
      'firebase/app',
      'firebase/auth', 
      'firebase/firestore',
      'rxdb',
      'rxdb/plugins/replication-firestore'
    ],
    // Exclude to prevent duplication
    exclude: []
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
    // Production optimizations
    minify: mode === 'production' ? 'esbuild' : false,
    sourcemap: mode === 'production' ? false : true,
    // Remove console.log in production
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/main-[hash].js',
        chunkFileNames: 'assets/main-chunk-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        // Code splitting for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'clsx', 'tailwind-merge'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        }
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
  },
  publicDir: 'public',
  // Define environment variables
  define: {
    __DEV__: mode !== 'production',
  }
}))
