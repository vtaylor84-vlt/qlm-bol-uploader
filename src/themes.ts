// src/themes.ts

interface ThemeConfig {
    primary: string; // Base Tailwind color (e.g., 'cyan', 'emerald')
    primaryHex: string; // The hex code for custom glow effects
    text: string; // Full Tailwind class (e.g., 'text-cyan-400')
    border: string; // Full Tailwind class (e.g., 'border-cyan-400/50')
    focusRing: string; // Full Tailwind class (e.g., 'focus:ring-cyan-400')
    buttonBg: string; // Full Tailwind class (e.g., 'bg-cyan-500')
    buttonHover: string; // Full Tailwind class (e.g., 'hover:bg-cyan-400')
    glow: string; // Tailwind shadow class for glow effect
}

export const THEMES: { [key: string]: ThemeConfig } = {
    // Default Theme (Neutral)
    '': {
        primary: 'gray',
        primaryHex: 'rgb(156 163 175)', // Gray-400
        text: 'text-gray-400',
        border: 'border-gray-700',
        focusRing: 'focus:ring-gray-400',
        buttonBg: 'bg-gray-500',
        buttonHover: 'hover:bg-gray-400',
        glow: 'shadow-[0_0_15px_rgba(156,163,175,0.5)] hover:shadow-[0_0_25px_rgba(156,163,175,0.7)]',
    },
    
    // Greenleaf Xpress Theme (Green/Emerald)
    'Greenleaf Xpress': {
        primary: 'emerald',
        primaryHex: 'rgb(52 211 153)', // Emerald-400
        text: 'text-emerald-400',
        border: 'border-emerald-700',
        focusRing: 'focus:ring-emerald-400',
        buttonBg: 'bg-emerald-500',
        buttonHover: 'hover:bg-emerald-400',
        glow: 'shadow-[0_0_15px_rgba(52,211,153,0.5)] hover:shadow-[0_0_25px_rgba(52,211,153,0.7)]',
    },

    // BST Expedite Theme (Red/Cyan - Using the existing Cyan base for submission button)
    'BST Expedite': {
        primary: 'cyan',
        primaryHex: 'rgb(6 182 212)', // Cyan-400
        text: 'text-cyan-400',
        border: 'border-cyan-700',
        focusRing: 'focus:ring-cyan-400',
        buttonBg: 'bg-cyan-500',
        buttonHover: 'hover:bg-cyan-400',
        glow: 'shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)]',
    },
};

export const defaultTheme = THEMES[''];