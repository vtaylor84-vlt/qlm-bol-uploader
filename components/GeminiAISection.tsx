// components/GeminiAISection.tsx (COMPLETE, CORRECTED SCRIPT)
import React, { useState } from 'react';
// FIX Imports: Use correct types from new types.ts
import { FileData, Theme } from '@/types.ts'; 
import { generateCargoDescription } from '@/services/geminiService.ts'; 
import { useToast } from '@/components/Toast.tsx'; 
// FIX: Changed import to FormField, assuming InputField.tsx is actually FormField.tsx
import { FormField } from '@/components/FormField.tsx'; 

interface GeminiAISectionProps {
  freightFiles: FileData[];
  description: string;
  setDescription: (desc: string) => void;
  theme: Theme;
}

export const GeminiAISection: React.FC<GeminiAISectionProps> = ({
  freightFiles,
  description,
  setDescription,
  theme,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const addToast = useToast(); 

  const handleGenerateDescription = async () => {
    if (freightFiles.length === 0) {
      addToast('Please attach freight photos/videos first.', 'warning');
      return;
    }

    setIsLoading(true);
    setDescription('Generating AI description...');
    try {
      const result = await generateCargoDescription(freightFiles); 
      setDescription(result);
      addToast('AI description generated successfully.', 'success');
    } catch (error) {
      console.error('Gemini AI Error:', error);
      setDescription(`AI generation failed: ${(error as Error).message}`);
      addToast('Failed to generate AI description.', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // FIX TS2551: Defined standard style object
  const focusStyle = {
    boxShadow: `0 0 0 2px ${theme.palette.glow}, 0 0 10px ${theme.palette.glow}`,
  };

  return (
    <div className="mb-6 p-4 rounded-xl bg-gray-900 border-2 border-gray-700">
      <h3 className={`text-xl font-orbitron mb-3 text-[--color-primary]`}>AI Cargo Analysis</h3>
      
      <button
        type="button"
        onClick={handleGenerateDescription}
        disabled={isLoading}
        className={`w-full p-3 rounded-lg text-white font-bold transition duration-300 border-2 border-gray-700 bg-gradient-to-r from-[--color-primary] to-[--color-secondary] mb-4 ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
        style={isLoading ? {} : { boxShadow: `0 0 8px var(--shadow-glow)` }}
        onFocus={(e) => {
             // FIX TS2551: Use the correct style property name
            if (!isLoading) e.currentTarget.style.boxShadow = focusStyle.boxShadow; 
        }}
        onBlur={(e) => {
             // FIX TS2551: Use the correct style property name
            if (!isLoading) e.currentTarget.style.boxShadow = `0 0 8px var(--shadow-glow)`;
        }}
      >
        {isLoading ? '🧠 Analyzing Cargo...' : '✨ Generate Description (Gemini AI)'}
      </button>

      <textarea
        id="description"
        name="description"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={isLoading ? 'AI is generating content...' : 'AI-generated or manual cargo description for BOL...'}
        className={`w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white transition duration-300`}
        style={{
            boxShadow: isLoading ? `0 0 0 2px var(--color-primary)` : 'none',
            minHeight: '100px'
        }}
        disabled={isLoading}
      />
    </div>
  );
};