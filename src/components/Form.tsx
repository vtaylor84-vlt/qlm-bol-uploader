import React, { useState, useMemo, useCallback } from 'react';
// FIX TS6133: Removed unused SelectedFile import
import { LoadSubmission, FormState } from '@/types.ts';
import { useUploader } from '@/hooks/useUploader.ts'; 
import { useFormValidation } from '@/hooks/useFormValidation.ts';
import { useToast } from '@/components/Toast.tsx';
import { COMPANY_OPTIONS, STATES_US } from '@/constants.ts';
import { saveSubmissionToQueue } from '@/services/queueService.ts';
import { FormField } from '@/components/FormField.tsx';
import { SelectField } from '@/components/SelectField.tsx';
import { FileUploadArea } from '@/components/FileUploadArea.tsx';
import { SectionHeader } from '@/components/SectionHeader.tsx';


// FIX TS6133: This local const is now correctly typed as FormState
const initialFormState: FormState = {
    company: 'default',
    driverName: '',
    loadNumber: '',
    bolNumber: '',
    puCity: '',
    puState: '',
    delCity: '',
    delState: '',
    description: '',
    bolDocType: '',
};

export const Form: React.FC = () => {
    const { 
        formState: form, 
        handleInputChange: handleChange, 
        handleFileChange, 
        handleRemoveFile, 
        handleFileReorder, 
        bolFiles, 
        freightFiles,
        currentTheme,
    } = useUploader(); 

    const company = form.company;
    
    const showToast = useToast();
    const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
    
    // FIX TS6133: Removed unused `setForm` and `newState` placeholders
    const allFiles = useMemo(() => [...bolFiles, ...freightFiles], [bolFiles, freightFiles]);
    const { isValid } = useFormValidation(form as LoadSubmission, allFiles);


    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValid) {
            showToast("Please complete all required fields and attach at least one file.", 'error');
            return;
        }
        
        setStatus('submitting');
        
        const submissionId = crypto.randomUUID();
        const finalSubmission: LoadSubmission = {
            ...form,
            company: company,
            files: allFiles,
            timestamp: Date.now(),
            submissionId: submissionId,
        };

        try {
            await saveSubmissionToQueue(finalSubmission);

            showToast(`Load ${form.loadNumber || 'N/A'} saved to queue! Uploading in background.`, 'success');

        } catch (error) {
            console.error("Failed to save to queue:", error);
            showToast("Critical Error: Could not save submission locally.", 'error');
        } finally {
            setStatus('idle');
        }

    }, [form, allFiles, isValid, company, showToast]);
    
    
    const formGlowClass = currentTheme.name === 'Greenleaf Xpress' ? 'form-glow-green' : 
                          currentTheme.name === 'BST Expedite' ? 'form-glow-sky' : 
                          'form-glow-cyan';

    const isPulsing = isValid && status !== 'submitting';
    const getLoadIdentifier = () => form.loadNumber || form.bolNumber || `Trip--`;


    return (
        <form 
            onSubmit={handleSubmit} 
            className={`relative form-container space-y-8 p-6 bg-black/60 rounded-xl backdrop-blur-sm ${formGlowClass}`}
        >
            
            {/* Company & Driver Section (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
                <SelectField
                    label="Company"
                    id="company"
                    value={company}
                    options={[
                        { value: 'default', label: 'Select a Company...' }, 
                        ...COMPANY_OPTIONS.map(c => ({ value: c, label: c }))
                    ]}
                    onChange={handleChange} 
                    required
                />
                <FormField
                    label="Driver's Name"
                    id="driverName"
                    value={form.driverName}
                    onChange={handleChange}
                    required
                    placeholder="e.g., John Doe"
                />
            </div>

            {/* Load Identifiers (2 columns) */}
            <div className="space-y-4">
                <SectionHeader title="Load Data" />
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Load #" id="loadNumber" value={form.loadNumber} onChange={handleChange} placeholder="e.g., 123456" />
                    <FormField label="BOL #" id="bolNumber" value={form.bolNumber} onChange={handleChange} placeholder="e.g., 7891011" />
                </div>
            </div>

            {/* Trip Cities/States (4 columns, stacked 2x2) */}
            <div className="grid grid-cols-2 gap-4">
                <FormField label="Pickup City/State" id="puCity" value={form.puCity} onChange={handleChange} placeholder="City" />
                <SelectField 
                    label="Pickup State" 
                    id="puState" 
                    value={form.puState} 
                    options={[{ value: '', label: 'Select an option' }, ...STATES_US.map(state => ({ value: state, label: state }))]} 
                    onChange={handleChange} 
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField label="Delivery City/State" id="delCity" value={form.delCity} onChange={handleChange} placeholder="City" />
                <SelectField 
                    label="Delivery State" 
                    id="delState" 
                    value={form.delState} 
                    options={[{ value: '', label: 'Select an option' }, ...STATES_US.map(state => ({ value: state, label: state }))]} 
                    onChange={handleChange} 
                />
            </div>

            {/* Documents & Freight Section */}
            <div className="space-y-3 pt-4">
                <SectionHeader title="Documents & Freight" />
            </div>
            
            {/* BOL Photos / PDFs */}
            <div className="space-y-3 pt-4">
                <div className="flex items-center space-x-4">
                     <h3 className={`text-lg font-bold text-white`}>BOL Photos/PDFs</h3>
                     <SelectField
                         id="bolDocType"
                         label="Select Type..." 
                         value={form.bolDocType}
                         options={['', 'Pick Up', 'Delivery'].map(t => ({ value: t, label: t || 'Select Type...' }))}
                         onChange={handleChange}
                     />
                </div>
                
                <FileUploadArea 
                    id="bolFiles" 
                    files={bolFiles} 
                    onFileChange={handleFileChange}
                    onRemoveFile={handleRemoveFile}
                    onFileReorder={handleFileReorder}
                    accept="image/*,application/pdf"
                />
            </div>

            {/* Freight Photos / Videos */}
            <div className="space-y-3 pt-4">
                <h3 className={`text-lg font-bold text-white`}>Freight Photos/Videos</h3>
                <FileUploadArea 
                    id="freightFiles" 
                    files={freightFiles} 
                    onFileChange={handleFileChange}
                    onRemoveFile={handleRemoveFile}
                    onFileReorder={handleFileReorder}
                    accept="image/*,video/*"
                />
            </div>
            
            {/* SUBMIT BUTTON (Matches image aesthetic) */}
            <button
                type="submit"
                disabled={!isValid || status === 'submitting'}
                className={`
                    w-full py-4 rounded-xl text-white font-bold text-lg tracking-wider
                    transition-all duration-300 transform 
                    ${isPulsing ? 'animate-pulse-glow' : ''}
                    ${isValid ? 'bg-gradient-to-r from-[--color-primary] to-[--color-secondary] hover:scale-[1.01]' : 'bg-gray-700 opacity-50 cursor-not-allowed'}
                `}
                style={isValid ? { boxShadow: `var(--shadow-glow)` } : {}}
            >
                {status === 'submitting' ? 'INITIATING UPLOAD...' : `SUBMIT DOCUMENTS FOR LOAD: ${getLoadIdentifier()}`}
            </button>
        </form>
    );
};

import { useMemo } from 'react';
import { LoadSubmission, SelectedFile } from '@/types'; // Fixed import path

export const useFormValidation = (form: LoadSubmission, files: SelectedFile[]) => {
    const isValid = useMemo(() => {
        const hasCompanyAndDriver = form.company !== 'default' && form.driverName.trim().length > 0;
        const hasIdentification = form.loadNumber.trim().length > 0 || 
                                 form.bolNumber.trim().length > 0 || 
                                 (form.puCity.trim().length > 0 && form.delCity.trim().length > 0); // Corrected property names to match Form.tsx
        const hasFiles = files.length > 0;

        return hasCompanyAndDriver && hasIdentification && hasFiles;
    }, [form, files]);

    return { isValid };
};

// components/GeminiAISection.tsx
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