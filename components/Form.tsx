// components/Form.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { LoadSubmission, SelectedFile } from '@/types.ts';
// ⚠️ FIX: Import the correct hook (useUploader) which contains all logic and state.
import { useUploader } from '@/hooks/useUploader.ts'; 
import { useFormValidation } from '@/hooks/useFormValidation.ts';
import { useToast } from '@/components/Toast.tsx';
import { COMPANY_OPTIONS, STATES_US } from '@/constants.ts';
import { saveSubmissionToQueue } from '@/services/queueService.ts';
import { FormField } from '@/components/FormField.tsx';
import { SelectField } from '@/components/SelectField.tsx';
import { FileUploadArea } from '@/components/FileUploadArea.tsx';
import { SectionHeader } from '@/components/SectionHeader.tsx';


const initialFormState: Omit<LoadSubmission, 'files' | 'timestamp' | 'submissionId'> = {
    company: 'default', // MUST be 'default' to trigger the placeholder option
    driverName: '',
    loadNumber: '',
    bolNumber: '',
    puCity: '',
    puState: '', // Empty string for "Select an option" placeholder
    delCity: '',
    delState: '', // Empty string for "Select an option" placeholder
    description: '',
    bolDocType: '', // Empty string for "Select Type..." placeholder
};

export const Form: React.FC = () => {
    // ⚠️ FIX: Destructure all required state and handlers from useUploader()
    const { 
        formState: form, 
        setFormState: setForm,
        handleInputChange: handleChange, 
        handleFileChange, 
        handleRemoveFile, 
        handleFileReorder, 
        bolFiles, 
        freightFiles,
        currentTheme,
        setCompany,
        // The actual company value is form.company, which is handled via handleChange/setForm
    } = useUploader(); 

    const company = form.company; // Use the value from the formState
    
    const showToast = useToast();
    const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
    
    // --- Validation Logic ---
    const allFiles = useMemo(() => [...bolFiles, ...freightFiles], [bolFiles, freightFiles]);
    const { isValid } = useFormValidation({ ...form, files: allFiles, timestamp: 0, submissionId: '' }, allFiles);
    // --- End Validation Logic ---


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

            // Reset form, keeping company selection
            setForm({...initialFormState, company: company}); 
        } catch (error) {
            console.error("Failed to save to queue:", error);
            showToast("Critical Error: Could not save submission locally.", 'error');
        } finally {
            setStatus('idle');
        }

    }, [form, allFiles, isValid, company, showToast, setForm]);
    
    
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
                    // ⚠️ FIX: Read value directly from local 'company' variable derived from hook state
                    value={company}
                    options={[
                        { value: 'default', label: 'Select a Company...' }, 
                        ...COMPANY_OPTIONS.map(c => ({ value: c, label: c }))
                    ]}
                    // ⚠️ FIX: Change handler relies on handleInputChange from hook 
                    // to set formState and setCompany
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
                    placeholder="State" 
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
                    placeholder="State" 
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
                         srOnlyLabel="Select Type"
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