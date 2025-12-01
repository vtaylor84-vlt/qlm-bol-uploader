import React from 'react';
import type { Status, CompanyTheme } from '@/types.ts';
import { SparkleIcon } from '@/components/icons/SparkleIcon.tsx'; // Use absolute path

interface GeminiAISectionProps {
    onGenerate: () => void;
    description: string;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    status: Status;
    currentTheme: CompanyTheme; // ⚠️ ADDED: Pass the theme object
}

export const GeminiAISection: React.FC<GeminiAISectionProps> = ({ onGenerate, description, handleInputChange, status, currentTheme }) => {
    
    // ⚠️ FIX: Use correct palette properties defined in constants.ts
    const primaryColor = currentTheme.palette.primary;
    const glowShadow = currentTheme.palette.glow;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                 <h3 className="text-lg font-semibold text-gray-300 font-orbitron">AI Cargo Analysis</h3>
                <button
                    type="button"
                    onClick={onGenerate}
                    disabled={status === 'loading'}
                    className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold text-gray-900 bg-yellow-400 hover:bg-yellow-300 rounded-none transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-wait`}
                    // Use CSS variables for dynamic glow box-shadow if needed, or use the Tailwind JIT utility
                    style={{ 
                        boxShadow: status === 'loading' ? `0 0 5px ${primaryColor}` : 'none',
                    }}
                >
                    <SparkleIcon className="w-4 h-4" />
                    <span>{status === 'loading' ? 'Analyzing...' : 'Generate AI Description (Gemini)'}</span>
                </button>
            </div>
            <textarea
                id="description"
                name="description"
                rows={4}
                value={description}
                onChange={handleInputChange}
                placeholder={status === 'loading' ? 'AI is generating content...' : 'AI-generated or manual cargo description for BOL...'}
                className="block w-full bg-transparent border border-gray-600 py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
            />
        </div>
    );
};