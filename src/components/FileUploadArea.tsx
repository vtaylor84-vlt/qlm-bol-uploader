import React, { useRef } from 'react';
import type { UploadedFile } from '../types';
import { FileThumbnail } from './FileThumbnail';
import { CameraIcon } from './icons/CameraIcon';
import { FolderIcon } from './icons/FolderIcon';

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

  const handleDragStart = (id: string) => { dragId.current = id; };
  const handleDrop = (targetId: string) => {
    if (dragId.current && dragId.current !== targetId) {
      onFileReorder(dragId.current, targetId, id);
    }
    dragId.current = null;
  };

  return (
    <div className="space-y-4 border border-cyan-900/50 bg-gray-900/50 p-4 rounded-lg">
      {/* Buttons Area */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-cyan-400 text-gray-300 hover:text-cyan-400 font-semibold py-4 px-4 transition-all duration-200 flex flex-col items-center justify-center space-y-2 rounded"
        >
          <FolderIcon className="w-8 h-8" />
          <span>Select Files</span>
        </button>
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-cyan-400 text-gray-300 hover:text-cyan-400 font-semibold py-4 px-4 transition-all duration-200 flex flex-col items-center justify-center space-y-2 rounded"
        >
          <CameraIcon className="w-8 h-8" />
          <span>Use Camera</span>
        </button>
      </div>

      {/* Helper Text - Moved Below Buttons */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
            Supported: {accept.includes('video') ? 'Images & Video' : 'Images & PDF'} (Max 50MB)
        </p>
      </div>
      
      <input ref={fileInputRef} type="file" className="sr-only" multiple accept={accept.replace(',video/*', '')} onChange={(e) => onFileChange(e, id)} />
      <input ref={cameraInputRef} type="file" className="sr-only" multiple accept="image/*" capture="environment" onChange={(e) => onFileChange(e, id)} />
      
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 pt-2">
          {files.map((file) => (
            <FileThumbnail
              key={file.id}
              fileWrapper={file}
              onRemove={() => onRemoveFile(file.id, id)}
              onDragStart={() => handleDragStart(file.id)}
              onDrop={() => handleDrop(file.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};