import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Vite config riêng cho Admin Panel
export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, 'admin-panel'),
  base: '/admin/',
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
    outDir: resolve(__dirname, 'dist/admin'),
    emptyOutDir: true
  },
  publicDir: resolve(__dirname, 'admin-panel/public')
})
