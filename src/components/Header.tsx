import React from 'react';

interface HeaderProps {
  LogoComponent: React.FC;
}

export const Header: React.FC<HeaderProps> = ({ LogoComponent }) => {
  return (
    <header className="text-center mb-8">
      {/* Assuming LogoComponent is the DynamicLogo from your hook */}
      {/* <div className="mb-4">
        <LogoComponent />
      </div> */}
      {/* FIX: Changed the title text to be shorter and more concise */}
      <h1 className="text-3xl sm:text-4xl font-orbitron font-extrabold text-cyan-400 tracking-widest leading-snug">
        BOL / PHOTO UPLOAD
      </h1>
    </header>
  );
};