// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  // CRITICAL: This array tells Tailwind where to look for class names to build the CSS
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'], 
      },
      // --- DYNAMIC THEME COLORS (References CSS variables from App.tsx) ---
      colors: {
        'color-primary': 'var(--color-primary)',
        'color-secondary': 'var(--color-secondary)',
      },
      boxShadow: {
        // Dynamic glow effect for the submit button/form border
        'glow-dynamic': 'var(--shadow-glow)', 
      },
      keyframes: {
        // Custom animation for the pulsing submit button
        'pulse-glow': {
          '0%, 100%': { opacity: '1', 'box-shadow': 'var(--shadow-glow)' },
          '50%': { opacity: '0.8', 'box-shadow': 'none' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      // -------------------------------------------------------------------
    },
  },
  plugins: [],
} satisfies Config;