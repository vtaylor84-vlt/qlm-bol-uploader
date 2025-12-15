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
  DynamicHeaderContent: DynamicHeaderContent; // FIX: Accept the dynamic content object
}

export const Header: React.FC<HeaderProps> = ({ DynamicHeaderContent }) => {
  return (
    <header className="text-center mb-8">
      {/* FIX: Conditional rendering logic based on the returned type */}
      {DynamicHeaderContent.type === 'logo' ? (
        <img 
          src={DynamicHeaderContent.src} 
          alt={DynamicHeaderContent.alt} 
          className={DynamicHeaderContent.className}
        />
      ) : (
        <h1 className={DynamicHeaderContent.className}>
          {DynamicHeaderContent.text}
        </h1>
      )}
    </header>
  );
};