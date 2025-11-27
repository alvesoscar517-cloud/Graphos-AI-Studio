import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Vite config cho Admin Panel - Standalone Extension
export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, 'admin-panel'),
  base: './', // Relative paths cho extension
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://ai-authenticator-472729326429.us-central1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/send-feedback': {
        target: 'https://ai-authenticator-472729326429.us-central1.run.app',
        changeOrigin: true,
        secure: false,
      }
    },
    fs: {
      allow: ['..']
    }
  },
  build: {
    outDir: resolve(__dirname, 'dist-admin'), // Build to separate folder
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'admin-panel/index.html')
      }
    }
  },
  publicDir: resolve(__dirname, 'admin-panel/public')
})
