import React from 'react';

export const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4M17 6v4M18 9h4M10 21v2M13 13h4M16 11V7M12 17h2M18 19h2M11 5H7M7 11V7" />
    </svg>
);