import React from 'react';

// NOTE: This is a temporary script to bypass the crash when rendering the dynamic logo.
interface HeaderProps {
  DynamicLogo: React.FC | (() => null);
  companyName: string;
}

export const Header: React.FC<HeaderProps> = ({ companyName }) => {
  // We are forcing the display of the QLM title, ignoring the DynamicLogo component.
  return (
    <header className="text-center py-6">
      <h1 className="font-orbitron text-4xl md:text-5xl font-black text-cyan-300 glowing-text uppercase tracking-widest">
        QLM Driver Upload - RUNTIME TEST
      </h1>
      {companyName !== 'default' && (
          // Display the company name as text to confirm the theme logic is working
          <p className="text-xl text-gray-400 mt-2">Theme active for: {companyName}</p>
      )}
    </header>
  );
};