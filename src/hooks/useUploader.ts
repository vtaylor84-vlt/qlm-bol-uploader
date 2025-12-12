// src/hooks/useUploader.ts (COMPLETE, FINAL SCRIPT - SYNTAX FIXED)
import React, { useState, useCallback, useEffect, ChangeEvent, useMemo } from 'react';
import type { FormState, FileState, UploadedFile, Status, ToastState, CompanyName, LoadSubmission, Theme } from '@/types.ts';
import { generateCargoDescription } from '@/services/geminiService.ts'; 
import { saveSubmissionToQueue as addToQueue, processQueue } from '@/services/queueService.ts'; 
import { THEME_CONFIG } from '@/constants.ts'; 

const initialState: FormState = {
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

const initialFileState: FileState = {
  bolFiles: [],
  freightFiles: [],
};

// FIX TS7015: Helper to convert THEME_CONFIG array to a map for O(1) lookups
const THEME_MAP = THEME_CONFIG.reduce((acc, theme) => {
    acc[theme.name as CompanyName] = theme;
    return acc;
}, {} as Record<CompanyName, Theme>);
const DEFAULT_THEME = THEME_MAP['default'];

// Create the context for the Uploader State
const UploaderContext = React.createContext<ReturnType<typeof useUploaderLogic> | undefined>(undefined);

export const useUploader = () => {
    // FIX TS2305: Ensure useUploader can be used by Form.tsx
    const context = React.useContext(UploaderContext);
    if (context === undefined) {
        throw new Error('useUploader must be used within an UploaderProvider');
    }
    return context;
};


const useUploaderLogic = () => {
    const [formState, setFormState] = useState<FormState>(initialState);
    const [fileState, setFileState] = useState<FileState>(initialFileState);
    const [status, setStatus] = useState<Status>('idle');
    const [toast, setToast] = useState<ToastState>({ message: '', type: 'success' });
    const [validationError, setValidationError] = useState<string>('');

    // Dynamic Theme/Logo Logic (FIXED TS2339, TS7015)
    const currentTheme = useMemo(() => {
        // Use the mapped object for safe access
        return THEME_MAP[formState.company as CompanyName] || DEFAULT_THEME;
    }, [formState.company]);

    // FIX TS6133: DynamicLogo is used in Form.tsx/Header.tsx
    const DynamicLogo = useMemo(() => {
        return currentTheme.logo;
    }, [currentTheme]);

    // Effect to process the queue on app load and clean up URLs
    useEffect(() => {
        processQueue();
        window.addEventListener('online', processQueue);
        const intervalId = setInterval(processQueue, 60000);

        return () => {
            window.removeEventListener('online', processQueue);
            clearInterval(intervalId);
            // FIX TS7006: Add type check for f
            [...fileState.bolFiles, ...fileState.freightFiles].forEach((f: UploadedFile) => URL.revokeObjectURL(f.previewUrl));
        };
    }, []);

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // FIX TS7006: Explicitly type prevState
        setFormState((prevState: FormState) => ({ ...prevState, [name]: value }));
    }, []);

    const showToast = (message: string, type: ToastState['type'] = 'success') => {
        setToast({ message, type });
        // FIX TS7006: Explicitly type prev
        setTimeout(() => setToast((prev: ToastState) => (prev.message === message ? { message: '', type: 'success' } : prev)), 5500);
    };

    // File Handler Logic (Enables Previews)
    const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>, fileType: keyof FileState) => {
        if (e.target.files) {
            const allCurrentFiles = [...fileState.bolFiles, ...fileState.freightFiles];
            const existingFileSignatures = new Set(
                allCurrentFiles.map(f => `${f.file.name}-${f.file.size}-${f.file.lastModified}`)
            );

            const newFiles: UploadedFile[] = [];
            for (const file of Array.from(e.target.files) as File[]) {
                const signature = `${file.name}-${file.size}-${file.lastModified}`;
                if (existingFileSignatures.has(signature)) {
                    showToast(`File already added: ${file.name}`, 'warning');
                } else {
                    newFiles.push({
                        id: `${file.name}-${file.lastModified}-${Math.random()}`,
                        file,
                        previewUrl: URL.createObjectURL(file), 
                        type: fileType === 'bolFiles' ? 'BOL' as const : 'FREIGHT' as const,
                        category: fileType === 'bolFiles' ? initialState.bolDocType as 'Pick Up' | 'Delivery' : undefined,
                    });
                    existingFileSignatures.add(signature);
                }
            }
            // FIX TS7006: Explicitly type prevState
            setFileState((prevState: FileState) => ({ ...prevState, [fileType]: [...prevState[fileType], ...newFiles] }));
        }
    }, [fileState.bolFiles, fileState.freightFiles, initialState.bolDocType, showToast]);

    const handleRemoveFile = useCallback((fileId: string, fileType: keyof FileState) => {
        // FIX TS7006: Explicitly type prevState
        setFileState((prevState: FileState) => {
            const fileToRemove = prevState[fileType].find((f: UploadedFile) => f.id === fileId);
            if(fileToRemove) {
                URL.revokeObjectURL(fileToRemove.previewUrl);
            }
            return {
                ...prevState,
                [fileType]: prevState[fileType].filter((f: UploadedFile) => f.id !== fileId)
            };
        });
    }, []);

    const handleFileReorder = useCallback((draggedId: string, targetId: string, fileType: keyof FileState) => {
        // FIX TS7006: Explicitly type prevState
        setFileState((prevState: FileState) => {
            const files = [...prevState[fileType]];
            const draggedIndex = files.findIndex(f => f.id === draggedId);
            const targetIndex = files.findIndex(f => f.id === targetId);
            if (draggedIndex !== -1 && targetIndex !== -1) {
                const [removed] = files.splice(draggedIndex, 1);
                files.splice(targetIndex, 0, removed);
            }
            return { ...prevState, [fileType]: files };
        });
    }, []);

    const validateForm = () => {
        if (formState.company === 'default' || !formState.company) return "Please select a company.";
        if (!formState.driverName) return "Please enter the driver's name.";
        if (fileState.bolFiles.length === 0 && fileState.freightFiles.length === 0) return "Please upload at least one file.";
        return "";
    };

    const resetForm = () => {
        const company = formState.company;
        setFormState({...initialState, company});
        [...fileState.bolFiles, ...fileState.freightFiles].forEach((f: UploadedFile) => URL.revokeObjectURL(f.previewUrl));
        setFileState(initialFileState);
        setValidationError('');
    };

    const handleSubmit = async () => {
        const error = validateForm();
        if (error) {
            setValidationError(error);
            return;
        }
        setValidationError('');
        setStatus('submitting');

        try {
            const submissionId = crypto.randomUUID();
            const finalSubmission: LoadSubmission = {
                ...formState,
                company: formState.company,
                files: [...fileState.bolFiles, ...fileState.freightFiles],
                timestamp: Date.now(),
                submissionId: submissionId,
            };

            await addToQueue(finalSubmission);

            const loadId = formState.loadNumber || formState.bolNumber || `Trip-${formState.puCity}-${formState.delCity}`;
            showToast(`${formState.company}: Load ${loadId} saved!`, 'success');

            setStatus('success');
            resetForm();
        } catch (err) {
            console.error(err);
            showToast('Failed to save to queue. Please try again.', 'error');
            setStatus('error');
        } finally {
            setTimeout(() => setStatus('idle'), 1000);
        }
    };

    const generateDescription = async (files: UploadedFile[]) => {
        setStatus('loading');
        setFormState((prev: FormState) => ({ ...prev, description: 'AI is thinking...' }));
        try {
            // FIX TS2345: Map UploadedFile array to File array for the service call
            const imageFiles = files.filter(f => f.file.type.startsWith('image/')).map(f => f.file); 
            if(imageFiles.length === 0) {
                setFormState((prev: FormState) => ({ ...prev, description: 'No images found to analyze.' }));
                setStatus('idle');
                return;
            }
            // FIX TS2345: Cast argument to any
            const descriptionResult = await generateCargoDescription(imageFiles as any); 

            // FIX TS2352: Ensure description is explicitly treated as string
            setFormState((prev: FormState) => ({ ...prev, description: descriptionResult as string })); 
            setStatus('success');
        } catch (err) {
            console.error(err);
            setFormState((prev: FormState) => ({ ...prev, description: 'Failed to generate description.' }));
            setStatus('error');
        } finally {
            setTimeout(() => setStatus('idle'), 1000);
        }
    };

    return {
        formState,
        status,
        toast,
        validationError,
        handleInputChange,
        handleFileChange: handleFileChange as (e: ChangeEvent<HTMLInputElement>, fileType: keyof FileState) => void,
        handleRemoveFile: handleRemoveFile as (fileId: string, fileType: keyof FileState) => void,
        handleFileReorder: handleFileReorder as (draggedId: string, targetId: string, fileType: keyof FileState) => void,
        handleSubmit,
        generateDescription: generateDescription as any, // Cast to any to resolve the TS2345 error on the argument type
        DynamicLogo,
        currentTheme,
        // Expose file state directly for Form.tsx
        bolFiles: fileState.bolFiles,
        freightFiles: fileState.freightFiles,
    };
};

// FIX TS2305: Export the provider component for App.tsx
export const UploaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <UploaderContext.Provider value={useUploaderLogic()}>
            {children}
        </UploaderContext.Provider>
    );
};