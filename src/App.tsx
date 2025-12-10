// src/App.tsx (COMPLETE, FINAL SCRIPT - Fixing handleInputChange access)
import React from 'react';
// FIX TS6133: Removed unused useTheme import
// import { useTheme } from '@/hooks/useTheme'; 
import { Header } from '@/components/Header';
import { Form } from '@/components/Form';
import { ToastContainer } from '@/components/Toast';
import { GeminiAISection } from '@/components/GeminiAISection'; 
import { useUploader } from '@/hooks/useUploader'; 
// FIX TS2304: Ensure Theme is imported to satisfy the cast
import type { Theme } from '@/types.ts'; 

const App: React.FC = () => {
    // FIX TS2339: Destructure handleInputChange from the useUploader return object
    const { currentTheme: theme, formState, freightFiles, handleInputChange } = useUploader(); 
    
    // We already have the Theme object, so we rename currentTheme to theme for simplicity.
    const themeWithFallback = theme && theme.palette ? theme : { 
        palette: { primary: '#000000', secondary: '#999999', glow: 'rgba(0,0,0,0.5)' } 
    };

    return (
        <div 
            className="min-h-screen background-gradient" 
            style={{ 
                '--color-primary': themeWithFallback.palette.primary, 
                '--color-secondary': themeWithFallback.palette.secondary, 
                '--shadow-glow': themeWithFallback.palette.glow 
            } as React.CSSProperties}
        >
            <ToastContainer />
            <div className="container mx-auto px-4 py-8">
                {/* We pass the company name to Header so Header can call useTheme with the right arg */}
                <Header companyName={formState.company} /> 
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    <div className="lg:col-span-2">
                        <Form />
                    </div>
                    <aside className="lg:col-span-1">
                        <GeminiAISection 
                            freightFiles={freightFiles}
                            description={formState.description}
                            // FIX TS2339: Use the destructured handleInputChange function directly
                            setDescription={(value) => handleInputChange({ target: { name: 'description', value } } as React.ChangeEvent<HTMLTextAreaElement>)}
                            theme={themeWithFallback as Theme}
                        />
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default App;