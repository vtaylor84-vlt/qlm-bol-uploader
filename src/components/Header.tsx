// src/components/Header.tsx (COMPLETE, FINAL SCRIPT - Logo Prop Fix)
import React from 'react';
import { useTheme } from '@/hooks/useTheme'; 
import { CompanyName } from '@/types'; 

interface HeaderProps {
    companyName: CompanyName | string;
}

export const Header: React.FC<HeaderProps> = ({ companyName }) => {
    // useTheme takes the companyName string and returns the Theme object
    const theme = useTheme(companyName as CompanyName);
    
    const DynamicLogo = theme.logo;

    return (
        <header className="py-4 border-b border-[--color-secondary] flex justify-between items-center relative">
            <h1 className="text-2xl font-orbitron font-bold text-white tracking-widest">
                QLM Driver Upload
            </h1>
            <div className="text-[--color-primary] transition-colors duration-300">
                {/* FIX TS2322: This is now valid because we fixed the prop typing in src/types.ts */}
                {DynamicLogo && <DynamicLogo className="h-10 w-auto" />} 
            </div>
            
            <span className="absolute bottom-2 right-0 text-xs text-gray-500">
                {theme.name !== 'default' ? theme.name : ''}
            </span>
        </header>
    );
};