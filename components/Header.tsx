import React from 'react';

interface HeaderProps {
  DynamicLogo: React.FC | (() => null);
  companyName: string;
}

export const Header: React.FC<HeaderProps> = ({ DynamicLogo, companyName }) => {
  return (
    <header className="text-center py-6">
      {companyName === 'default' ? (
        // QLM Driver Upload title when no company is selected
        <h1 className="font-orbitron text-4xl md:text-5xl font-black text-cyan-300 glowing-text uppercase tracking-widest">
          QLM Driver Upload
        </h1>
      ) : (
        // Logo when a company is selected
        <div className="mt-4">
          <DynamicLogo />
        </div>
      )}
    </header>
  );
};