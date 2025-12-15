// src/components/Header.tsx

import React from 'react';

// Define the type for the dynamic content object
interface DynamicHeaderContent {
  type: 'logo' | 'title';
  src?: string;
  text?: string;
  alt?: string;
  className: string;
}

interface HeaderProps {
  DynamicHeaderContent: DynamicHeaderContent;
}

export const Header: React.FC<HeaderProps> = ({ DynamicHeaderContent }) => {
  return (
    <header className="text-center mb-8">
      {/* Conditional rendering logic */}
      {DynamicHeaderContent.type === 'logo' ? (
        <img 
          src={DynamicHeaderContent.src} 
          alt={DynamicHeaderContent.alt} 
          // FIX 3: Add object-contain and mb-4 for better scaling and vertical separation
          className={`${DynamicHeaderContent.className} object-contain mb-4`} 
        />
      ) : (
        <h1 className={DynamicHeaderContent.className}>
          {DynamicHeaderContent.text}
        </h1>
      )}
    </header>
  );
};