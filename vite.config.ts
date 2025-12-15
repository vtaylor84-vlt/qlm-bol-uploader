import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// You no longer need 'path' or the 'resolve' block if you use relative imports.

export default defineConfig({
  plugins: [react()],
  // ⚠️ CRITICAL: Tell Vite that the source root is the 'src' folder
  root: 'src', 
  build: {
    outDir: '../dist', // Output must be outside the 'src' folder
  },
});