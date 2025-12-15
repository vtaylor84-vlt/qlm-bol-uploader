import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path'; // <--- CRITICAL: Import path module

export default defineConfig({
  plugins: [react()],
  root: 'src', 
  // ⚠️ CRITICAL: Add the resolve block to define the alias
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Set '@' to point to the 'src' directory
    },
  },
  build: {
    outDir: '../dist',
  },
});