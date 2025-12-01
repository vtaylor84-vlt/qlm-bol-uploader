import React, { useRef, useState, DragEvent } from 'react';
import type { UploadedFile } from '@/types'; // Use absolute path for safety
import { FileThumbnail } from '@/components/FileThumbnail.tsx'; // Use absolute path for safety
import { CameraIcon } from '@/components/icons/CameraIcon.tsx'; // Use absolute path for safety
import { FolderIcon } from '@/components/icons/FolderIcon.tsx'; // Use absolute path for safety

interface FileUploadAreaProps {
  id: 'bolFiles' | 'freightFiles';
  files: UploadedFile[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, fileType: 'bolFiles' | 'freightFiles') => void;
  onRemoveFile: (fileId: string, fileType: 'bolFiles' | 'freightFiles') => void;
  onFileReorder: (draggedId: string, targetId: string, fileType: 'bolFiles' | 'freightFiles') => void;
  accept: string;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  id,
  files,
  onFileChange,
  onRemoveFile,
  onFileReorder,
  accept,
}) => {
  const dragId = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handlers for File Reordering (for existing thumbnails)
  const handleDragStart = (id: string) => { dragId.current = id; };
  const handleDropReorder = (targetId: string) => {
    if (dragId.current && dragId.current !== targetId) {
      onFileReorder(dragId.current, targetId, id);
    }
    dragId.current = null;
  };
  
  // --- DRAG & DROP ZONE LOGIC (For initial file upload) ---
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set isDragging to false if we fully leave the element
    if (e.currentTarget.contains(e.relatedTarget as Node) === false) {
        setIsDragging(false);
    }
  };

  const handleDropUpload = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Create a mock change event object to pass to the existing handler in useUploader
      const mockEvent = {
        target: { files: e.dataTransfer.files } as HTMLInputElement,
        // The type property is often needed for React events, adding it here for safety
        type: 'change'
      } as React.ChangeEvent<HTMLInputElement>; 
      
      onFileChange(mockEvent, id);
    }
  };
  
  // Helper to trigger the hidden file input when clicking the drop zone
  const triggerFileInput = () => fileInputRef.current?.click();

  const primaryAccept = id === 'bolFiles' ? 'image/*,application/pdf' : 'image/*,video/*';

  return (
    <div className="space-y-4">
      
      {/* 1. FILE INPUTS (Hidden) */}
      <input ref={fileInputRef} type="file" className="sr-only" multiple accept={primaryAccept} onChange={(e) => onFileChange(e, id)} />
      <input ref={cameraInputRef} type="file" className="sr-only" multiple accept="image/*" capture="environment" onChange={(e) => onFileChange(e, id)} />
      
      {/* 2. THUMBNAILS (Displayed if files exist) */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
          {files.map((file) => (
            <FileThumbnail
              key={file.id}
              fileWrapper={file}
              onRemove={() => onRemoveFile(file.id, id)}
              onDragStart={() => handleDragStart(file.id)}
              onDrop={() => handleDropReorder(file.id)}
            />
          ))}
        </div>
      )}

      {/* 3. DROP ZONE UI (Displayed below/above thumbnails) */}
      <div 
        className={`
          flex flex-col items-center justify-center p-8 text-center h-48 rounded-lg 
          border-2 border-dashed transition-all duration-300 cursor-pointer
          ${isDragging 
            ? 'border-cyan-400 bg-black/80 shadow-[0_0_15px_rgba(0,255,255,0.5)]' 
            : 'border-gray-700 bg-gray-900/60 hover:border-gray-500'
          }
        `}
        onClick={triggerFileInput} // Click anywhere to open file dialog
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropUpload}
      >
        <CameraIcon className="w-10 h-10 text-cyan-400 mb-2" />
        <p className="font-orbitron text-gray-300 font-semibold text-lg">
          Tap to open camera or upload files
        </p>
        <p className="text-sm text-gray-500">
          Drag & drop is also supported (Max ${id === 'bolFiles' ? 'PDF/Image' : 'Video/Image'})
        </p>
        
        {/* BUTTONS (If you want to keep them visible but smaller, integrate them here) */}
        <div className="flex space-x-4 mt-3">
          <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="flex items-center text-sm text-gray-400 hover:text-white">
            <FolderIcon className="w-5 h-5 mr-1" /> Select Files
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }} className="flex items-center text-sm text-gray-400 hover:text-white">
            <CameraIcon className="w-5 h-5 mr-1" /> Use Camera
          </button>
        </div>
      </div>
    </div>
  );
};