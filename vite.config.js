import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config cho Main App (không bao gồm admin)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
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
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Không xóa admin khi build main
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
