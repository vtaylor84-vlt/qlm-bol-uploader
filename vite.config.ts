import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path'; // ⚠️ CRITICAL: Import path module

export default defineConfig({
  plugins: [react()],
  // ⚠️ CRITICAL: Add the resolve block to define the alias
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'), 
    },
  },
  build: {
    outDir: 'dist', // The required output folder name for Netlify
  },
});