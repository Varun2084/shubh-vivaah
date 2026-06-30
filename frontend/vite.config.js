import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The backend runs on :8000; proxy /api and status routes during dev.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
      '/status': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
})
