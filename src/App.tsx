import React from 'react';
import { Header } from './components/Header';
import { FormField } from './components/FormField';
import { SelectField } from './components/SelectField';
import { FileUploadArea } from './components/FileUploadArea';
// FINAL FIX: Change to default import
import Toast from './components/Toast';
import { GeminiAISection } from './components/GeminiAISection';
import { useUploader } from './hooks/useUploader';
// Imported variable names now align with constants.ts
import { COMPANY_OPTIONS, STATES_US } from './constants.ts'; 
import { SectionHeader } from './components/SectionHeader';

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
    DynamicLogo,
  } = useUploader();

  const isFormValid =
    formState.company &&
    formState.driverName &&
    (fileState.bolFiles.length > 0 || fileState.freightFiles.length > 0);
  
  const getLoadIdentifier = () => {
    if (!isFormValid) return '';
    return formState.loadNumber || formState.bolNumber || `Trip-${formState.puCity.toUpperCase()}-${formState.delCity.toUpperCase()}`;
  };

  return (
    <div className="min-h-screen text-gray-100 flex flex-col items-center p-4 selection:bg-cyan-400 selection:text-black relative z-10">
      <div className="w-full max-w-2xl mx-auto">
        <Header LogoComponent={DynamicLogo} />
        
        <main className="mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-6 p-6 bg-black/80 border border-gray-800 shadow-2xl shadow-cyan-900/20 backdrop-blur-sm rounded-xl"
          >
            {/* --- Company & Driver --- */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SelectField handles its own margin (mb-4) */}
                <SelectField
                  id="company"
                  label="Company"
                  value={formState.company}
                  onChange={handleInputChange}
                  options={COMPANY_OPTIONS.map(c => ({ value: c, label: c === '' ? 'Select a Company...' : c }))}
                  required
                />
                {/* Wrapped FormField in mb-4 for vertical alignment consistency */}
                <div className="mb-4">
                  <FormField
                    id="driverName"
                    label="Driver Name"
                    value={formState.driverName}
                    onChange={handleInputChange}
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>
              </div>
            </div>

            <SectionHeader title="Load Data" />

            {/* --- Load Data (FIXED FLOW: Load/BOL, PU Pair, DEL Pair) --- */}
            <div className="space-y-4">
              {/* Row 1: Load # & BOL # (Identifiers) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <FormField id="loadNumber" label="Load #" value={formState.loadNumber} onChange={handleInputChange} placeholder="e.g., 123456" />
                </div>
                <div className="mb-4">
                  <FormField id="bolNumber" label="BOL #" value={formState.bolNumber} onChange={handleInputChange} placeholder="e.g., 7891011" />
                </div>
              </div>
              
              {/* Row 2: Pickup City & State (Location 1) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <FormField id="puCity" label="Pickup City" value={formState.puCity} onChange={handleInputChange} placeholder="City" />
                </div>
                <SelectField id="puState" label="Pickup State" value={formState.puState} onChange={handleInputChange} options={STATES_US.map(s => ({ value: s, label: s || 'Select...' }))} />
              </div>

              {/* Row 3: Delivery City & State (Location 2) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <FormField id="delCity" label="Delivery City" value={formState.delCity} onChange={handleInputChange} placeholder="City" />
                </div>
                <SelectField id="delState" label="Delivery State" value={formState.delState} onChange={handleInputChange} options={STATES_US.map(s => ({ value: s, label: s || 'Select...' }))} />
              </div>
            </div>

            <SectionHeader title="Documents & Freight" />

            {/* --- BOL / POD --- */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-cyan-400 uppercase tracking-wider text-sm">BOL / POD Uploads</h3>
                </div>
                
                {/* Radio Buttons (KEPT AS REQUESTED) */}
                <div className="radio-group flex items-center space-x-6 text-gray-300 bg-gray-900 p-3 border border-cyan-900/50 rounded">
                    <span className="font-semibold text-sm text-gray-400">BOL Type:</span>
                    <div className="flex items-center space-x-2">
                        <input type="radio" id="pickup" name="bolDocType" value="Pick Up" checked={formState.bolDocType === 'Pick Up'} onChange={handleInputChange} />
                        <label htmlFor="pickup" className="text-sm">Pick Up</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="radio" id="delivery" name="bolDocType" value="Delivery" checked={formState.bolDocType === 'Delivery'} onChange={handleInputChange} />
                        <label htmlFor="delivery" className="text-sm">Delivery</label>
                    </div>
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
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <h3 className="font-bold text-cyan-400 uppercase tracking-wider text-sm">Freight Photos/Videos</h3>
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
              <div className="border border-gray-800 bg-gray-900/50 p-4 rounded">
                <GeminiAISection
                    onGenerate={() => generateDescription(fileState.freightFiles)}
                    description={formState.description}
                    handleInputChange={handleInputChange}
                    status={status}
                />
              </div>
            )}

            {/* --- Submit --- */}
            <div className="pt-6">
              {validationError && <p className="text-red-400 text-center mb-4 bg-red-900/20 py-2 rounded border border-red-900">{validationError}</p>}
              <button
                type="submit"
                disabled={!isFormValid || status === 'submitting'}
                className="w-full text-lg font-orbitron font-bold text-black bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed py-4 rounded transition-all duration-200 shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)]"
              >
                {status === 'submitting' ? 'SAVING...' : 'SUBMIT DOCUMENTS FOR LOAD'}
              </button>
            </div>
          </form>
        </main>
      </div>

      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => {}}
        />
      )}
    </div>
  );
}