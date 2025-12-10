// src/constants.ts (COMPLETE, FINAL SCRIPT)

// FIX TS2307: Correct path structure for logo component files
import { GreenleafLogo } from '@/assets/GreenleafLogo.tsx'; 
import { BstLogo } from '@/assets/BstLogo.tsx';

export const COMPANY_OPTIONS: string[] = ['default', 'Greenleaf Xpress', 'BST Expedite', 'Other Carrier'];

export const STATES_US: string[] = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 
    'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 
    'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 
    'WI', 'WY'
];

export const THEME_CONFIG = [
    { name: 'default', logo: BstLogo, palette: { primary: '#007FFF', secondary: '#003366', glow: 'rgba(0, 127, 255, 0.5)' } }, 
    { name: 'Greenleaf Xpress', logo: GreenleafLogo, palette: { primary: '#03C03C', secondary: '#005600', glow: 'rgba(3, 192, 60, 0.5)' } },
    { name: 'BST Expedite', logo: BstLogo, palette: { primary: '#007FFF', secondary: '#003366', glow: 'rgba(0, 127, 255, 0.5)' } },
];