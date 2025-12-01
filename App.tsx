import React from 'react';
import { Header } from '@/components/Header.tsx';
import { FormField } from '@/components/FormField.tsx';
import { SelectField } from '@/components/SelectField.tsx';
import { FileUploadArea } from '@/components/FileUploadArea.tsx';
import { ToastContainer } from '@/components/Toast.tsx'; // Use ToastContainer if Toast.tsx exports a container
import { GeminiAISection } from '@/components/GeminiAISection.tsx';
import { useUploader } from '@/hooks/useUploader.ts';
import { COMPANY_OPTIONS, STATES_US } from '@/constants.ts'; // Corrected import names
import { SectionHeader } from '@/components/SectionHeader.tsx';
import '@/src/style.css'; // Ensure global styles are loaded

export default function App() {
  const {
    formState,
    fileState,
    status,
    toast,
    validationError,
    handleInputChange,
    handleFileChange,
    handleRemoveFile,
    handleFileReorder,
    handleSubmit,
    generateDescription,
    DynamicLogo, // ⚠️ Pulled the DynamicLogo from the hook
  } = useUploader();

  const isFormValid =
    formState.company !== 'default' &&
    formState.driverName &&
    (fileState.bolFiles.length > 0 || fileState.freightFiles.length > 0);
  
  const getLoadIdentifier = () => {
    if (!isFormValid) return '';
    return formState.loadNumber || formState.bolNumber || `Trip-${formState.puCity.toUpperCase()}-${formState.delCity.toUpperCase()}`;
  };

  return (
    <div className="min-h-screen text-gray-100 flex flex-col items-center p-4 selection:bg-cyan-400 selection:text-black relative z-10">
      <div className="w-full max-w-2xl mx-auto">
        
        {/* ⚠️ FIX 3: Pass DynamicLogo and companyName to Header */}
        <Header 
          DynamicLogo={DynamicLogo} 
          companyName={formState.company} 
        />
        
        <main className="mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-2 p-4 bg-black/70 border border-gray-700 backdrop-blur-sm"
          >
            {/* --- Company & Driver --- */}
            <div className="border border-gray-600 p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  id="company"
                  label="Company"
                  value={formState.company}
                  // Ensure 'name' matches 'id' for the handler to work correctly
                  onChange={(e) => handleInputChange({ ...e, target: { ...e.target, name: 'company' } as HTMLSelectElement })}
                  options={[
                    { value: 'default', label: 'Select a Company...' }, 
                    ...COMPANY_OPTIONS.map(c => ({ value: c, label: c }))
                  ]}
                  required
                />
                <FormField
                  id="driverName"
                  label="Driver Name"
                  value={formState.driverName}
                  onChange={(e) => handleInputChange({ ...e, target: { ...e.target, name: 'driverName' } as HTMLInputElement })}
                  placeholder="e.g., John Doe"
                  required
                />
              </div>
            </div>

            <SectionHeader title="Load Data" />

            {/* --- Load Data --- */}
            <div className="border border-gray-600 p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField id="loadNumber" label="Load #" value={formState.loadNumber} onChange={(e) => handleInputChange({ ...e, target: { ...e.target, name: 'loadNumber' } as HTMLInputElement })} placeholder="e.g., 123456" />
                  <FormField id="bolNumber" label="BOL #" value={formState.bolNumber} onChange={(e) => handleInputChange({ ...e, target: { ...e.target, name: 'bolNumber' } as HTMLInputElement })} placeholder="e.g., 7891011" />
                  <div className="grid grid-cols-2 gap-px bg-gray-600 border border-gray-600">
                      <FormField id="puCity" label="Pickup City" value={formState.puCity} onChange={(e) => handleInputChange({ ...e, target: { ...e.target, name: 'puCity' } as HTMLInputElement })} placeholder="City" />
                      <SelectField id="puState" label="Pickup State" value={formState.puState} onChange={(e) => handleInputChange({ ...e, target: { ...e.target, name: 'puState' } as HTMLSelectElement })} options={STATES_US.map(s => ({ value: s, label: s || 'Select an option' }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-gray-600 border border-gray-600">
                      <FormField id="delCity" label="Delivery City" value={formState.delCity} onChange={(e) => handleInputChange({ ...e, target: { ...e.target, name: 'delCity' } as HTMLInputElement })} placeholder="City" />
                      <SelectField id="delState" label="Delivery State" value={formState.delState} onChange={(e) => handleInputChange({ ...e, target: { ...e.target, name: 'delState' } as HTMLSelectElement })} options={STATES_US.map(s => ({ value: s, label: s || 'Select an option' }))} />
                  </div>
              </div>
            </div>

            <SectionHeader title="Documents & Freight" />

            {/* --- BOL / POD --- */}
            <div className="border border-gray-600 p-4 space-y-4">
                <h3 className="font-bold text-gray-300">BOL / POD Uploads</h3>
                <div className="radio-group flex items-center space-x-4 text-gray-300">
                    <span className="font-semibold">BOL Type:</span>
                    <input type="radio" id="pickup" name="bolDocType" value="Pick Up" checked={formState.bolDocType === 'Pick Up'} onChange={handleInputChange} />
                    <label htmlFor="pickup">Pick Up</label>
                    <input type="radio" id="delivery" name="bolDocType" value="Delivery" checked={formState.bolDocType === 'Delivery'} onChange={handleInputChange} />
                    <label htmlFor="delivery">Delivery</label>
                    <input type="radio" id="selectType" name="bolDocType" value="" checked={formState.bolDocType === ''} onChange={handleInputChange} className="sr-only" />
                </div>
                <FileUploadArea
                  id="bolFiles"
                  files={fileState.bolFiles}
                  onFileChange={handleFileChange}
                  onRemoveFile={handleRemoveFile}
                  onFileReorder={handleFileReorder}
                  accept="image/*,application/pdf"
                />
            </div>
            
            {/* --- Freight --- */}
            <div className="border border-gray-600 p-4 space-y-4">
              <h3 className="font-bold text-gray-300">Freight / Video Uploads</h3>
              <FileUploadArea
                id="freightFiles"
                files={fileState.freightFiles}
                onFileChange={handleFileChange}
                onRemoveFile={handleRemoveFile}
                onFileReorder={handleFileReorder}
                accept="image/*,video/*"
              />
            </div>

            {/* --- AI Section --- */}
            {fileState.freightFiles.length > 0 && (
              <div className="border border-gray-600 p-4">
                <GeminiAISection
                    onGenerate={() => generateDescription(fileState.freightFiles)}
                    description={formState.description}
                    handleInputChange={(e) => handleInputChange({ ...e, target: { ...e.target, name: 'description' } as HTMLTextAreaElement })}
                    status={status}
                />
              </div>
            )}

            {/* --- Submit --- */}
            <div className="pt-4">
              {validationError && <p className="text-red-400 text-center mb-4">{validationError}</p>}
              <button
                type="submit"
                disabled={!isFormValid || status === 'submitting'}
                className="w-full text-lg font-orbitron font-bold text-black bg-gray-300 hover:bg-white disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed py-3 transition-colors duration-200"
              >
                {status === 'submitting' ? 'SAVING...' : isFormValid ? `Submit Documents for Load: ${getLoadIdentifier()}` : 'Complete Required Fields'}
              </button>
            </div>
          </form>
        </main>
      </div>

      {toast.message && (
        <ToastContainer // Assuming this is the correct component export
          message={toast.message}
          type={toast.type}
        />
      )}
    </div>
  );
}