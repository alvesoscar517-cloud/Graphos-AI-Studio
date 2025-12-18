import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh for better DX
      fastRefresh: true
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      '@styles': resolve(__dirname, './src/styles'),
      '@i18n': resolve(__dirname, './src/i18n'),
      '@config': resolve(__dirname, './src/config'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'es2020',
    cssCodeSplit: true,
    cssMinify: 'lightningcss',
    chunkSizeWarningLimit: 500,
    // Enable module preload polyfill
    modulePreload: {
      polyfill: true
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2, // Multiple compression passes
        ecma: 2020,
        unsafe_arrows: true,
        unsafe_methods: true,
      },
      mangle: {
        safari10: true,
        properties: false, // Don't mangle properties for safety
      },
      format: {
        comments: false, // Remove all comments
        ecma: 2020,
      },
    },
    rollupOptions: {
      output: {
        // Improved chunk splitting for better caching
        manualChunks: (id) => {
          // Core React + scheduler - MUST be in same chunk to avoid undefined errors
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'react-core'
          }
          // React-dependent libraries - bundle together to ensure React loads first
          if (id.includes('react-router') || id.includes('react-i18next')) {
            return 'react-libs'
          }
          // i18n core
          if (id.includes('i18next') && !id.includes('react-i18next')) {
            return 'i18n'
          }
          // Heavy animation libraries
          if (id.includes('framer-motion')) {
            return 'animation-framer'
          }
          // 3D/WebGL - very heavy, separate chunk
          if (id.includes('three') || id.includes('vanta')) {
            return 'animation-3d'
          }
          // Particles - separate for lazy loading
          if (id.includes('tsparticles')) {
            return 'particles'
          }
          // Lottie animations
          if (id.includes('lottie')) {
            return 'lottie'
          }
          // Other vendor chunks
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
        // Asset file naming for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/woff2?|ttf|eot/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 3001,
  },
  // Optimize dependencies - pre-bundle for faster dev
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'i18next', 
      'react-i18next',
      'framer-motion',
      'clsx',
      'tailwind-merge'
    ],
    // Exclude heavy libs from pre-bundling
    exclude: ['three', 'vanta']
  },
  // Enable esbuild for faster transforms
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
  }
})
