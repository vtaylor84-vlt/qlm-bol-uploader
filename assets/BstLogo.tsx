import React from 'react';
// Assuming your logo is saved in the same directory as bst_logo.jpg
import bstLogoImage from './image_595262.jpg'; 

export const BstLogo: React.FC = () => {
    return (
        <div className="text-center py-4 flex flex-col items-center"> 
            <div className="relative group max-w-[340px] transition-transform duration-500 hover:scale-105">
                {/* Advanced Shadow/Glow Effect */}
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                {/* Your Custom High-Fidelity Logo */}
                <img 
                    src={bstLogoImage} 
                    alt="BST Expedite Inc Logo" 
                    className="relative z-10 w-full h-auto drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                />
            </div>
        </div>
    );
};