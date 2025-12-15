// src/services/geminiService.ts (REPLACED)

import { SelectedFile } from '@/types.ts'; 

// The application will securely retrieve the GEMINI_API_KEY from Netlify's environment variables.
// The actual API key is NOT hardcoded here.

const generatePrompt = (fileNames: string[]): string => {
    return `You are an expert logistics coordinator. Based on the following images of freight on a truck, provide a concise, professional description for a Bill of Lading. Mention the type of goods, packaging (e.g., pallets, boxes), and any visible special handling notes. Do not describe the truck itself, only the cargo. The files for analysis are: ${fileNames.join(', ')}.`;
};

const fileToGenerativePart = async (file: File) => {
    // Convert file to Base64 (required for Gemini API call)
    const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
    
    return {
        inlineData: {
            data: base64Data,
            mimeType: file.type
        }
    };
};

/**
 * Analyzes freight images using the Gemini 2.5 Flash model.
 * This function is exported to be used by useUploader.ts.
 * @param files Array of SelectedFile objects for cargo analysis.
 * @returns A promise that resolves to the AI-generated description string.
 */
export const generateDescription = async (files: SelectedFile[]): Promise<string> => { // FIX: Renamed function to generateDescription
    // Securely retrieve the key from Netlify Environment Variable
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

    if (!GEMINI_API_KEY) {
        console.error("Gemini API Key is MISSING from Netlify environment variables. Returning mock response.");
        await new Promise(r => setTimeout(r, 1500)); // Simulate delay
        return "MOCK AI Description: Key Missing. 12 standard-sized pallets containing mixed consumer electronics, shrink-wrapped and stacked 5 high. Visible warning labels for 'Fragile: Handle with Care'.";
    }

    const imageParts = await Promise.all(
        files.filter(f => f.file.type.startsWith('image/')).map(f => fileToGenerativePart(f.file))
    );

    const fileNames = files.map(f => f.file.name);
    const prompt = generatePrompt(fileNames);
    
    // The actual API call structure (conceptually) - Replace with your actual fetch or SDK call:
    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [ {text: prompt}, ...imageParts ] }]
            })
        });
        
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Gemini API call failed with status ${response.status}: ${errorBody}`);
        }
        
        const json = await response.json();
        return json.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("AI Service Error:", error);
        return "AI Description Failed: Could not analyze freight. Check network or API key permissions.";
    }
};