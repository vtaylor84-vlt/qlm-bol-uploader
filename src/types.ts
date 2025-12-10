// src/types.ts (COMPLETE, FINAL SCRIPT - Defining all missing types)
import React from 'react';

// ------------------- Type Definitions -------------------

// All possible names a company can have, based on the constants list.
export type CompanyName = 'default' | 'Greenleaf Xpress' | 'BST Expedite' | 'Other Carrier' | string;

// The structure for theme objects (used in constants.ts)
export interface CompanyTheme {
    name: CompanyName;
    logo: React.FC<any>; // FIX TS2322/TS2304: Ensure the logo accepts props like 'className'
    palette: {
        primary: string;
        secondary: string;
        glow: string;
        shadow?: string;
    };
}
// Alias for easy use
export type Theme = CompanyTheme; 

// The file wrapper object (used in useUploader, FilePreview, etc.)
export interface UploadedFile {
    id: string;
    file: File;
    previewUrl: string;
    type: 'BOL' | 'FREIGHT';
    category?: 'Pick Up' | 'Delivery' | string;
}

// FIX TS2305: Added alias for SelectedFile (used in useFormValidation, geminiService)
export type SelectedFile = UploadedFile; 
export type FileData = UploadedFile; // Alias used in GeminiAISection

// The state for files (used in useUploader)
// FIX TS2305: Added FileState
export interface FileState {
    bolFiles: UploadedFile[];
    freightFiles: UploadedFile[];
}

// The main form data (used in useUploader, Form, etc.)
export interface FormState {
    company: CompanyName;
    driverName: string;
    loadNumber: string;
    bolNumber: string;
    puCity: string;
    puState: string;
    delCity: string;
    delState: string;
    description: string;
    bolDocType: string;
}

// The final submission object (used for saving/queuing)
export interface LoadSubmission extends FormState {
    files: UploadedFile[];
    timestamp: number;
    submissionId: string;
}

// The structure for data stored in the queue (used in queueService)
// FIX TS2305: Added QueuedSubmission
export interface QueuedSubmission extends Omit<LoadSubmission, 'files'> {
    // Stores only the file IDs and path (not the full File objects)
    fileIds: string[]; 
    filesToUpload: { id: string, file: File }[];
    status: 'pending' | 'uploading' | 'complete' | 'failed';
    retries: number;
}

export type Status = 'idle' | 'loading' | 'submitting' | 'success' | 'error';
export type ToastState = { message: string, type: 'success' | 'error' | 'warning' };