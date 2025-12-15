import React, { useState } from 'react';
// Corrected relative path: up from 'components' to 'src', then to 'types.ts'
import { FileData, Theme } from '../types';
// Corrected relative path: up from 'components' to 'src', then down to 'services'
import { generateCargoDescription } from '../services/geminiService.ts'; 
// Corrected relative path: for sibling components/hooks
import { useToast } from './Toast'; 

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
  // Assuming the hook is named useToast, not addToast
  const addToast = useToast(); 

  const handleGenerateDescription = async () => {
    if (freightFiles.length === 0) {
      addToast('Please attach freight photos/videos first.', 'warning');
      return;
    }

    setIsLoading(true);
    setDescription('Generating AI description...');
    try {
      // Note: generateCargoDescription should be exported from geminiService
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
  
  // Custom Tailwind style for the button glow
  const focusStyle = {
    boxShadow: `0 0 0 2px ${theme.palette.primary}, 0 0 10px ${theme.palette.primary}`,
  };

  return (
    <div className="mb-6 p-4 rounded-xl bg-gray-900 border-2 border-gray-700">
      <h3 className={`text-xl font-orbitron mb-3 text-cyan-400`}>AI Cargo Analysis</h3>
      
      <button
        type="button"
        onClick={handleGenerateDescription}
        disabled={isLoading}
        className={`w-full p-3 rounded-lg text-white font-bold transition duration-300 border-2 border-gray-700 bg-cyan-500 mb-4 ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
        style={isLoading ? {} : { boxShadow: `0 0 8px ${theme.palette.glow}` }}
        onFocus={(e) => {
            if (!isLoading) e.currentTarget.style.boxShadow = focusStyle.boxShadow;
        }}
        onBlur={(e) => {
            if (!isLoading) e.currentTarget.style.boxShadow = `0 0 8px ${theme.palette.glow}`;
        }}
      >
        {isLoading ? '🧠 Analyzing Cargo...' : '✨ Generate Description (Gemini AI)'}
      </button>

      {/* The original code had a placeholder for FormField but used a textarea, keeping the textarea */}
      <textarea
        id="description"
        name="description"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={isLoading ? 'AI is generating content...' : 'AI-generated or manual cargo description for BOL...'}
        className={`w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white transition duration-300`}
        style={{
            boxShadow: isLoading ? `0 0 0 2px ${theme.palette.primary}` : 'none',
            minHeight: '100px'
        }}
        disabled={isLoading}
      />
    </div>
  );
};