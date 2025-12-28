import React from 'react';

export const BstLogo: React.FC = () => {
    // This forces the browser to treat the SVG as a fresh element every time
    const cacheBuster = Date.now(); 

    return (
        <div className="text-center py-6 flex flex-col items-center animate-in fade-in duration-700"> 
            <svg 
                key={cacheBuster}
                width="340" 
                height="120" 
                viewBox="0 0 400 120" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="bst-metal" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0ea5e9" />
                        <stop offset="50%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                    <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* THE "BST" BOLD TEXT */}
                <text 
                    x="200" 
                    y="70" 
                    textAnchor="middle" 
                    className="font-black italic"
                    style={{ 
                        fontSize: '85px', 
                        fill: 'url(#bst-metal)', 
                        filter: 'url(#neon-glow)',
                        fontFamily: 'Arial Black, sans-serif'
                    }}
                >
                    BST
                </text>

                {/* THE "EXPEDITE INC" SUBTEXT */}
                <text 
                    x="200" 
                    y="105" 
                    textAnchor="middle" 
                    className="tracking-[0.5em] font-bold"
                    style={{ 
                        fontSize: '14px', 
                        fill: '#93c5fd',
                        fontFamily: 'monospace'
                    }}
                >
                    EXPEDITE INC
                </text>
                
                {/* DECORATIVE SPEED LINES */}
                <rect x="20" y="75" width="80" height="2" fill="#3b82f6" opacity="0.5" />
                <rect x="300" y="75" width="80" height="2" fill="#3b82f6" opacity="0.5" />
            </svg>
        </div>
    );
};