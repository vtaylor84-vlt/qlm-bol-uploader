// src/components/ThumbnailGallery.tsx
import React, { useCallback, useMemo } from 'react';
import { UploadedFile, FileType } from '../types';
import { useDropzone } from 'react-dropzone';
import { Image, Video, FileText, X } from 'lucide-react';
import { useUploader } from '../hooks/useUploader'; 

interface ThumbnailGalleryProps {
  fileType: keyof FileState;
  files: UploadedFile[];
  onRemoveFile: (fileId: string, fileType: keyof FileState) => void;
  onFileReorder: (draggedId: string, targetId: string, fileType: keyof FileState) => void;
  onFileDrop: (newFiles: File[], fileType: keyof FileState) => void;
  theme: any;
  accept: { [key: string]: string[] };
}

// Utility to render the file icon/preview
const FilePreview: React.FC<{ file: UploadedFile }> = ({ file }) => {
  const isVideo = file.file.type.startsWith('video');
  const isImage = file.file.type.startsWith('image');
  
  if (isImage) {
    return <img src={file.previewUrl} alt="Preview" className="w-full h-full object-cover" />;
  }
  if (isVideo) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-700">
        <Video size={36} className="text-gray-400" />
      </div>
    );
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-700 p-1">
      <FileText size={36} className="text-gray-400" />
      <span className="text-xs text-gray-400 truncate w-full px-1">{file.file.name}</span>
    </div>
  );
};


export const ThumbnailGallery: React.FC<ThumbnailGalleryProps> = ({ 
  fileType, files, onRemoveFile, onFileReorder, onFileDrop, theme, accept 
}) => {
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFileDrop(acceptedFiles, fileType);
  }, [onFileDrop, fileType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept });
  
  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, fileId: string) => {
    e.dataTransfer.setData('fileId', fileId);
    e.dataTransfer.setData('fileType', fileType);
    e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('fileId');
    const draggedFileType = e.dataTransfer.getData('fileType');
    
    // Only allow reordering within the same container
    if (draggedFileType === fileType && draggedId !== targetId) {
        onFileReorder(draggedId, targetId, fileType);
    }
  };


  return (
    <div className="space-y-4">
      
      {/* Thumbnail Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
          {files.map(file => (
            <div
              key={file.id}
              className={`relative h-24 w-full cursor-grab 
                          border-2 border-transparent hover:border-${theme.primary}-500 
                          rounded-lg overflow-hidden transition-shadow duration-200`}
              draggable
              onDragStart={(e) => handleDragStart(e, file.id)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, file.id)}
              aria-label={`File thumbnail: ${file.file.name}. Drag to reorder.`}
            >
              <FilePreview file={file} />
              
              <button 
                className="absolute top-0 right-0 bg-red-600 hover:bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs rounded-bl-lg transition-colors"
                onClick={() => onRemoveFile(file.id, fileType)}
                aria-label={`Remove file: ${file.file.name}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone Area for desktop */}
      <div 
        {...getRootProps()} 
        className={`w-full p-6 border-2 border-dashed ${theme.border} rounded-lg text-center cursor-pointer transition-all duration-300
                    ${isDragActive ? `bg-${theme.primary}-900/20` : 'bg-gray-900/50'}`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-400">
          {isDragActive 
            ? `Drop files here for ${fileType}...` 
            : `Or drag and drop files here.`}
        </p>
      </div>
    </div>
  );
};