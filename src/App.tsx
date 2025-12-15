// src/App.tsx (REPLACE ALL)

import React from 'react';
import { Header } from './components/Header';
import { FormField } from './components/FormField';
import { SelectField } from './components/SelectField';
import Toast from './components/Toast';
import { GeminiAISection } from './components/GeminiAISection';
import { useUploader } from './hooks/useUploader';
import { COMPANY_OPTIONS, STATES_US } from './constants.ts'; 
import { CombinedLocationField } from './components/CombinedLocationField'; 
import { ThumbnailGallery } from './components/ThumbnailGallery'; // FIX 1: Import ThumbnailGallery
import { QueueStatusBadge } from './components/QueueStatusBadge'; // FIX 2: Import QueueStatusBadge

export default function App() {
  const {
    isFormValid,
    formState,
    fileState,
    status,
    toast,
    validationError,
    handleInputChange,
    handleRemoveFile,
    handleFileReorder,
    handleSubmit,
    generateDescription,
    DynamicHeaderContent, 
    currentTheme, 
    loadIdentifierValue,
    handleFileDrop, 
  } = useUploader();

  
  const getLoadIdentifier = () => {
    return loadIdentifierValue;
  };

  // --- Placeholder Logic ---
  const companyOptions = [
    { value: '', label: 'Select a Company...' }, 
    ...COMPANY_OPTIONS.map(c => ({ value: c, label: c }))
  ];
  
  const stateOptions = [
    { value: '', label: 'Select a state' }, 
    ...STATES_US.map(s => ({ value: s, label: s }))
  ];
  // --- End Placeholder Logic ---

  return (
    <div className="min-h-screen text-gray-100 flex flex-col items-center p-4 selection:bg-cyan-400 selection:text-black relative z-10">
      <div className="w-full max-w-2xl mx-auto">
        <Header DynamicHeaderContent={DynamicHeaderContent} />
        
        <main className="mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className={`p-6 space-y-4 bg-black/80 border ${currentTheme.border} shadow-2xl shadow-cyan-900/20 backdrop-blur-sm rounded-xl`}
          >
            {/* --- Company & Driver (Top Block) --- */}
            <div> 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  id="company"
                  label="Company"
                  value={formState.company}
                  onChange={handleInputChange}
                  options={companyOptions} 
                  required
                  theme={currentTheme}
                />
                <FormField
                  id="driverName"
                  label="Driver's Name"
                  value={formState.driverName}
                  onChange={handleInputChange}
                  placeholder="Enter your name" 
                  required
                  theme={currentTheme}
                />
              </div>
            </div>

            {/* --- Load Data: Identifiers --- */}
            <div> 
              <div className="grid grid-cols-2 gap-4">
                <FormField 
                  id="loadNumber" 
                  label="LOAD #" 
                  value={formState.loadNumber} 
                  onChange={handleInputChange} 
                  placeholder="Enter Load ID or Load #" 
                  theme={currentTheme}
                />
                <FormField 
                  id="bolNumber" 
                  label="BOL #" 
                  value={formState.bolNumber} 
                  onChange={handleInputChange} 
                  placeholder="Enter BOL #" 
                  theme={currentTheme}
                />
              </div>
            </div>
              
            {/* --- Load Data: Pickup AND Delivery Location --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CombinedLocationField
                    prefix="pu"
                    label="Pickup City/State" 
                    cityValue={formState.puCity}
                    stateValue={formState.puState}
                    handleInputChange={handleInputChange}
                    stateOptions={stateOptions}
                    required 
                    theme={currentTheme}
                />
                
                <CombinedLocationField
                    prefix="del"
                    label="Delivery City/State" 
                    cityValue={formState.delCity}
                    stateValue={formState.delState}
                    handleInputChange={handleInputChange}
                    stateOptions={stateOptions}
                    required 
                    theme={currentTheme}
                />
            </div>
            
            {/* --- BOL TYPE RADIO BUTTONS --- */}
            <div className="radio-group flex items-center space-x-6 text-gray-300 bg-gray-900 p-3 border border-cyan-900/50 rounded">
                <span className={`font-semibold text-sm ${currentTheme.text}`}>BOL Type:<span className="text-red-400 pl-1">*</span></span>
                <div className="flex items-center space-x-2">
                    <input type="radio" id="pickup" name="bolDocType" value="Pickup" checked={formState.bolDocType === 'Pickup'} onChange={handleInputChange} />
                    <label htmlFor="pickup" className="text-sm">Pickup</label>
                </div>
                <div className="flex items-center space-x-2">
                    <input type="radio" id="delivery" name="bolDocType" value="Delivery" checked={formState.bolDocType === 'Delivery'} onChange={handleInputChange} />
                    <label htmlFor="delivery" className="text-sm">Delivery</label>
                </div>
            </div>

            {/* --- BOL / POD UPLOADS --- */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className={`font-bold ${currentTheme.text} uppercase tracking-wider text-sm`}>UPLOAD BOL IMAGE(S)</h3>
                </div>
                
                {/* FIX 3: Thumbnail Gallery for BOLs */}
                <ThumbnailGallery
                  fileType="bolFiles"
                  files={fileState.bolFiles}
                  onRemoveFile={handleRemoveFile}
                  onFileReorder={handleFileReorder}
                  onFileDrop={handleFileDrop}
                  theme={currentTheme}
                  accept={{'image/*': ['.jpeg', '.png'], 'application/pdf': ['.pdf']}}
                />
            </div>
            
            {/* --- Freight --- */}
            <div className="space-y-4 mb-4">
              <h3 className={`font-bold ${currentTheme.text} uppercase tracking-wider text-sm`}>UPLOAD IMAGES OF FREIGHT LOADED ON THE TRAILER</h3>
              
              {/* FIX 4: Thumbnail Gallery for Freight */}
              <ThumbnailGallery
                fileType="freightFiles"
                files={fileState.freightFiles}
                onRemoveFile={handleRemoveFile}
                onFileReorder={handleFileReorder}
                onFileDrop={handleFileDrop}
                theme={currentTheme}
                accept={{'image/*': ['.jpeg', '.png'], 'video/*': ['.mp4', '.mov']}}
              />
            </div>

            {/* --- AI Section (Conditional visibility remains) --- */}
            {fileState.freightFiles.length > 0 && (
              <div className={`border ${currentTheme.border} bg-gray-900/50 p-4 rounded`}>
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
                // FIX 5: Button has glow/pulse classes and is disabled if invalid/submitting
                disabled={!isFormValid || status === 'submitting'}
                className={`w-full text-lg font-orbitron font-bold text-black disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed py-4 rounded transition-all duration-200 
                            ${currentTheme.buttonBg} ${currentTheme.buttonHover} ${currentTheme.glow} ${isFormValid ? 'animate-pulse' : ''}`}
              >
                {/* FIX 6: Conditional button text with Load ID */}
                {status === 'submitting' 
                  ? 'QUEUING...' 
                  : isFormValid 
                  ? `SUBMIT DOCUMENTS FOR ${loadIdentifierValue.split(': ')[1]}` 
                  : 'COMPLETE REQUIRED FIELDS'}
              </button>
            </div>
          </form>
        </main>
      </div>

      {/* FIX 7: Corrected Toast rendering condition to prevent blank popup */}
      {toast.message && toast.message.trim().length > 0 && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => showToast('', 'success')} // Need to pass a function to clear the toast
        />
      )}
      
      {/* FIX 8: Add Queue Status Indicator */}
      <QueueStatusBadge /> 
    </div>
  );
}