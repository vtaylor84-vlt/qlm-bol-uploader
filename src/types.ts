import React from 'react';

// --- Theme Types ---
export type ThemePalette = {
    primary: string;
    secondary: string;
    glow: string;
    shadow: string;
};

export type CompanyTheme = {
    name: string;
    logo: React.FC;
    palette: ThemePalette;
};

// --- Form & Data Types ---
export type CompanyName = 'default' | 'Greenleaf Xpress' | 'BST Expedite';

// FIX 1: Defining the radio button values
export type BolCategory = 'Pickup' | 'Delivery'; 

export type LoadSubmission = {
    company: CompanyName;
    driverName: string;
    loadNumber: string;
    bolNumber: string;
    pickupCity: string;
    pickupState: string;
    deliveryCity: string;
    deliveryState: string;
    description: string;
    // FIX 2: Added bolDocType to the submission metadata
    bolDocType: BolCategory | ''; 
    files: QueuedFile[];
    timestamp: number;
    submissionId: string;
};

// --- Application State Types (Required by useUploader.ts) ---

// FIX 3: FormState structure used by useUploader hook
export interface FormState {
  company: string;
  driverName: string;
  loadNumber: string;
  bolNumber: string;
  puCity: string; // Using 'puCity' to match hook usage
  puState: string;
  delCity: string;
  delState: string;
  description: string;
  // FIX 4: The required field for the radio button group
  bolDocType: BolCategory | ''; 
}

export type FileType = 'BOL' | 'FREIGHT';

// FIX 5: Type for individual uploaded files
export type UploadedFile = {
    id: string; // Unique ID for file preview/tracking
    file: File;
    previewUrl: string; // URL for thumbnail display
};

// FIX 6: FileState used by useUploader hook
export interface FileState {
    bolFiles: UploadedFile[];
    freightFiles: UploadedFile[];
}

// FIX 7: Status types
export type Status = 'idle' | 'loading' | 'submitting' | 'success' | 'error';

// FIX 8: Toast types
export type ToastState = {
    message: string;
    type: 'success' | 'error' | 'warning';
};


// --- IndexedDB Queue Item ---

// Removed redundant SelectedFile type based on current app structure

export type LoadSubmissionMetadata = Omit<LoadSubmission, 'files'> & { fileIds: string[] };

export type QueuedSubmission = {
    id?: number; // IndexedDB key
    data: LoadSubmissionMetadata; // Metadata
    files: { id: string, content: Blob, fileName: string, fileType: string }[]; // File Blobs
    status: 'pending' | 'failed';
    attemptCount: number;
    timestamp: number;
};