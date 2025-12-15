import { useState, useCallback, useEffect, ChangeEvent } from 'react';
import type { FormState, FileState, UploadedFile, Status, ToastState } from '../types';
// FIX 1: Change back to a named import, aliasing the likely exported name
import { generateDescription as generateDescriptionFromImages } from '../services/geminiService';
// FIX 2 (Previous fix): Corrected the queue service function name
import { saveSubmissionToQueue, processQueue } from '../services/queueService';

const initialState: FormState = {
  company: '', 
  driverName: '',
  loadNumber: '',
  bolNumber: '',
  puCity: '',
  puState: '', 
  delCity: '',
  delState: '', 
  description: '',
  bolDocType: 'Pick Up'
};

const initialFileState: FileState = {
  bolFiles: [],
  freightFiles: [],
};

export const useUploader = () => {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [fileState, setFileState] = useState<FileState>(initialFileState);
  const [status, setStatus] = useState<Status>('idle');
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success' });
  const [validationError, setValidationError] = useState<string>('');

  // Effect to process the queue on app load and when network status changes
  useEffect(() => {
    processQueue();
    window.addEventListener('online', processQueue);
    const intervalId = setInterval(processQueue, 60000);

    return () => {
      window.removeEventListener('online', processQueue);
      clearInterval(intervalId);
      [...fileState.bolFiles, ...fileState.freightFiles].forEach(f => URL.revokeObjectURL(f.previewUrl));
    };
  }, []); // Run only once on mount

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  }, []);

  const showToast = (message: string, type: ToastState['type'] = 'success') => {
    setToast({ message, type });
    // This timeout is for auto-clearing the message state. The component itself handles visibility.
    setTimeout(() => setToast(prev => (prev.message === message ? { message: '', type: 'success' } : prev)), 5500);
  };

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
          });
          existingFileSignatures.add(signature);
        }
      }
      
      setFileState(prevState => ({ ...prevState, [fileType]: [...prevState[fileType], ...newFiles] }));
    }
  }, [fileState.bolFiles, fileState.freightFiles]);

  const handleRemoveFile = useCallback((fileId: string, fileType: keyof FileState) => {
    setFileState(prevState => {
      const fileToRemove = prevState[fileType].find(f => f.id === fileId);
      if(fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return {
        ...prevState,
        [fileType]: prevState[fileType].filter(f => f.id !== fileId)
      };
    });
  }, []);

  const handleFileReorder = useCallback((draggedId: string, targetId: string, fileType: keyof FileState) => {
    setFileState(prevState => {
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
    if (!formState.company) return "Please select a company.";
    if (!formState.driverName) return "Please enter the driver's name.";
    if (fileState.bolFiles.length === 0 && fileState.freightFiles.length === 0) return "Please upload at least one file.";
    return "";
  };

  const resetForm = () => {
    const company = formState.company;
    setFormState({...initialState, company});
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
      await saveSubmissionToQueue({ formState, fileState });
      
      const loadId = formState.loadNumber || formState.bolNumber || `Trip-${formState.puCity}-${formState.delCity}`;
      showToast(`${formState.company}: Load ${loadId} saved!`, 'success');
      
      processQueue();
      
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
      if(imageFiles.length === 0) {
        setFormState(prev => ({ ...prev, description: 'No images found to analyze.' }));
        setStatus('idle');
        return;
      }
      const description = await generateDescriptionFromImages(imageFiles);
      setFormState(prev => ({ ...prev, description }));
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
  };
};