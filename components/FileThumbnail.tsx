import React, { useState, useEffect } from 'react';
import type { UploadedFile } from '@/types.ts';
import { XIcon } from '@/components/icons/XIcon.tsx';
import { DocumentIcon } from '@/components/icons/DocumentIcon.tsx';
import { FileIcon } from '@/components/icons/FileIcon.tsx';

/**
 * ELITE FILE THUMBNAIL v2.6 - REINFORCED PREVIEW ENGINE
 * Logic: Persistent ObjectURL binding with hardware-accelerated transitions.
 */

interface FileThumbnailProps {
  fileWrapper: UploadedFile;
  onRemove: () => void;
  onDragStart?: () => void;
  onDrop?: () => void;
}

export const FileThumbnail: React.FC<FileThumbnailProps> = ({ 
  fileWrapper, 
  onRemove, 
  onDragStart, 
  onDrop 
}) => {
  const { file, previewUrl } = fileWrapper;
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isPdf = file.type === 'application/pdf';

  const renderPreview = () => {
    if (hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-zinc-900 border-2 border-dashed border-red-900/30">
          <span className="text-xl mb-1">⚠️</span>
          <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">Render_Failed</span>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="relative h-full w-full bg-zinc-900">
          {!isLoaded && <div className="absolute inset-0 animate-pulse bg-zinc-800" />}
          <img 
            src={previewUrl} 
            alt={file.name} 
            className={`h-full w-full object-cover transition-all duration-700 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} 
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="relative h-full w-full bg-black flex items-center justify-center">
          <video src={previewUrl} className="h-full w-full object-cover opacity-40" muted />
          <div className="absolute w-8 h-8 rounded-full border border-cyan-500/50 flex items-center justify-center bg-cyan-500/10">
            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-cyan-400 border-b-[5px] border-b-transparent ml-1" />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-900 border border-zinc-800">
        {isPdf ? <DocumentIcon className="w-8 h-8 text-red-500/60" /> : <FileIcon className="w-8 h-8 text-zinc-700" />}
        <span className="text-[9px] font-black mt-2 text-zinc-500 uppercase tracking-tighter">
          {isPdf ? 'PDF_NODE' : 'DATA_BLOB'}
        </span>
      </div>
    );
  };
  
  return (
    <div
      className="relative group aspect-square overflow-hidden border-2 border-zinc-800 bg-zinc-950 hover:border-cyan-500/50 transition-all cursor-grab active:cursor-grabbing shadow-2xl"
      draggable="true"
      onDragStart={onDragStart}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {renderPreview()}

      {/* TACTICAL OVERLAY */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-3">
        <p className="text-white text-[9px] font-black text-center break-all uppercase leading-tight mb-2">
          {file.name}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-90"
        >
          Remove asset
        </button>
      </div>

      {/* SCANLINE EFFECT */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500/10 z-10 animate-scan pointer-events-none" />
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        .animate-scan { animation: scan 4s linear infinite; }
      `}</style>
    </div>
  );
};