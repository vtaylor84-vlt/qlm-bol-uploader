// src/components/GeminiAISection.tsx (REPLACE ALL)

import React, { useState } from 'react';
// Corrected relative path: up from 'components' to 'src', then to 'types.ts'
import { FileData, Theme } from '../types';
// FIX: Changed import name from 'generateCargoDescription' to 'generateDescription' 
import { generateDescription } from '../services/geminiService.ts'; 
// Corrected relative path: for sibling components/hooks
// NOTE: useToast is typically a hook or utility, assuming it's imported here for simplicity
// If your toast logic is handled by the hook in App.tsx, you might not need this line.
// We are keeping it based on your provided context.
import { useToast } from './Toast'; 

interface GeminiAISectionProps {
  // NOTE: Based on the hook, you only need onGenerate and props handled by useUploader
  onGenerate: () => Promise<void>; // Use a function provided by the hook
  description: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; // Use generic change handler from hook
  status: 'idle' | 'loading' | 'success' | 'error' | 'submitting';
}

export const GeminiAISection: React.FC<GeminiAISectionProps> = ({
  onGenerate, // Use the generated function from the hook
  description,
  handleInputChange,
  status,
}) => {
  // Use status passed from the hook instead of local isLoading state
  const isLoading = status === 'loading'; 
  
  // NOTE: Removing local useToast logic; assume hook manages toasts
  // const addToast = useToast(); 

  return (
    <div className="mb-6 p-4 rounded-xl bg-gray-900 border-2 border-gray-700">
      <h3 className={`text-xl font-orbitron mb-3 text-cyan-400`}>AI Cargo Analysis</h3>
      
      <button
        type="button"
        onClick={onGenerate} // Call the function provided by the hook
        disabled={isLoading}
        className={`w-full p-3 rounded-lg text-white font-bold transition duration-300 border-2 border-gray-700 bg-cyan-500 mb-4 ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
      >
        {isLoading ? '🧠 Analyzing Cargo...' : '✨ Generate Description (Gemini AI)'}
      </button>

      {/* The original code had a placeholder for FormField but used a textarea, keeping the textarea */}
      <textarea
        id="description"
        name="description"
        rows={4}
        value={description}
        onChange={handleInputChange} // Use the change handler from the hook
        placeholder={isLoading ? 'AI is generating content...' : 'AI-generated or manual cargo description for BOL...'}
        className={`w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white transition duration-300 focus:ring-2 focus:ring-cyan-500`}
        disabled={isLoading}
      />
    </div>
  );
};