import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 🔥 ADD THIS esbuild block to fix the "Unexpected JSX expression" error permanently
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/, // This tells Vite to treat .js and .jsx files as JSX
  },
})