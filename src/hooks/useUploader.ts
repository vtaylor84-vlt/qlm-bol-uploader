// src/hooks/useUploader.ts (FINAL VERIFIED & SYNTAX-CORRECT SCRIPT)
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

// Helper to convert THEME_CONFIG array to a map for O(1) lookups
const THEME_MAP = THEME_CONFIG.reduce((acc, theme) => {
  acc[theme.name as CompanyName] = theme;
  return acc;
}, {} as Record<CompanyName, Theme>);

const DEFAULT_THEME = THEME_MAP['default'];

// Create the context
const UploaderContext = React.createContext<ReturnType<typeof useUploaderLogic> | undefined>(undefined);

export const useUploader = () => {
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

  // Dynamic Theme/Logo Logic
  const currentTheme = useMemo(() => {
    return THEME_MAP[formState.company as CompanyName] || DEFAULT_THEME;
  }, [formState.company]);

  const DynamicLogo = useMemo(() => {
    return currentTheme.logo;
  }, [currentTheme]);

  // Process queue + cleanup on mount/unmount
  useEffect(() => {
    processQueue();
    window.addEventListener('online', processQueue);
    const intervalId = setInterval(processQueue, 60000);

    return () => {
      window.removeEventListener('online', processQueue);
      clearInterval(intervalId);
      [...fileState.bolFiles, ...fileState.freightFiles].forEach((f: UploadedFile) =>
        URL.revokeObjectURL(f.previewUrl)
      );
    };
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormState(prev => ({ ...prev, [name]: value }));
    },
    []
  );

  const showToast = (message: string, type: ToastState['type'] = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(prev => (prev.message === message ? { message: '', type: 'success' } : prev)), 5500);
  };

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, fileType: keyof FileState) => {
      if (!e.target.files) return;

      const allCurrentFiles = [...fileState.bolFiles, ...fileState.freightFiles];
      const existingSignatures = new Set(
        allCurrentFiles.map(f => `${f.file.name}-${f.file.size}-${f.file.lastModified}`)
      );

      const newFiles: UploadedFile[] = [];
      for (const file of Array.from(e.target.files)) {
        const signature = `${file.name}-${file.size}-${file.lastModified}`;
        if (existingSignatures.has(signature)) {
          showToast(`File already added: ${file.name}`, 'warning');
        } else {
          newFiles.push({
            id: `${file.name}-${file.lastModified}-${Math.random()}`,
            file,
            previewUrl: URL.createObjectURL(file),
            type: fileType === 'bolFiles' ? 'BOL' as const : 'FREIGHT' as const,
            category: fileType === 'bolFiles' ? initialState.bolDocType as 'Pick Up' | 'Delivery' : undefined,
          });
          existingSignatures.add(signature);
        }
      }

      setFileState(prev => ({
        ...prev,
        [fileType]: [...prev[fileType], ...newFiles],
      }));
    },
    [fileState.bolFiles, fileState.freightFiles, initialState.bolDocType, showToast]
  );

  const handleRemoveFile = useCallback((fileId: string, fileType: keyof FileState) => {
    setFileState(prev => {
      const fileToRemove = prev[fileType].find(f => f.id === fileId);
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.previewUrl);
      return {
        ...prev,
        [fileType]: prev[fileType].filter(f => f.id !== fileId),
      };
    });
  }, []);

  const handleFileReorder = useCallback((draggedId: string, targetId: string, fileType: keyof FileState) => {
    setFileState(prev => {
      const files = [...prev[fileType]];
      const draggedIndex = files.findIndex(f => f.id === draggedId);
      const targetIndex = files.findIndex(f => f.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const [removed] = files.splice(draggedIndex, 1);
      files.splice(targetIndex, 0, removed);

      return { ...prev, [fileType]: files };
    });
  }, []);

  const validateForm = (): string => {
    if (formState.company === 'default' || !formState.company) return 'Please select a company.';
    if (!formState.driverName) return "Please enter the driver's name.";
    if (fileState.bolFiles.length === 0 && fileState.freightFiles.length === 0)
      return 'Please upload at least one file.';
    return '';
  };

  const resetForm = () => {
    const company = formState.company;
    setFormState({ ...initialState, company });
    [...fileState.bolFiles, ...fileState.freightFiles].forEach(f => URL.revokeObjectURL(f.previewUrl));
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
        submissionId,
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
    setFormState(prev => ({ ...prev, description: 'AI is thinking...' }));

    try {
      const imageFiles = files.filter(f => f.file.type.startsWith('image/')).map(f => f.file);
      if (imageFiles.length === 0) {
        setFormState(prev => ({ ...prev, description: 'No images found to analyze.' }));
        setStatus('idle');
        return;
      }

      const descriptionResult = await generateCargoDescription(imageFiles);
      setFormState(prev => ({ ...prev, description: descriptionResult as string }));
      setStatus('success');
    } catch (err) {
      console.error(err);
      setFormState(prev => ({ ...prev, description: 'Failed to generate description.' }));
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
    generateDescription: generateDescription as any, // temporary any to avoid argument mismatch
    DynamicLogo,
    currentTheme,
    bolFiles: fileState.bolFiles,
    freightFiles: fileState.freightFiles,
  };
};

// Provider component
export const UploaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UploaderContext.Provider value={useUploaderLogic()}>
    {children}
  </UploaderContext.Provider>
);