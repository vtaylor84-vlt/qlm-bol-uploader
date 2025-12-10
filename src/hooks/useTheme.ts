// src/hooks/useTheme.ts (COMPLETE, FINAL SCRIPT - Logic Fix for App.tsx)
import { useMemo } from 'react';
import { CompanyName, CompanyTheme as Theme } from '@/types.ts';
import { THEME_CONFIG } from '@/constants.ts';

// Helper to convert array to map for O(1) lookups
const THEME_MAP = THEME_CONFIG.reduce((acc, theme) => {
    acc[theme.name as CompanyName] = theme;
    return acc;
}, {} as Record<CompanyName, Theme>);

const DEFAULT_THEME = THEME_MAP['default'];

// FIX: Change function signature to accept the company name and return the theme object directly.
export const useTheme = (company: CompanyName): Theme => {
    // FIX TS2339 & TS7015: Safely look up the theme by company name string
    const currentTheme = useMemo(() => {
        return THEME_MAP[company] || DEFAULT_THEME;
    }, [company]);
    
    return currentTheme;
};