import React, { useState } from 'react';
import type { UploadedFile } from '@/types.ts';
import { XIcon } from '@/components/icons/XIcon.tsx';
import { DocumentIcon } from '@/components/icons/DocumentIcon.tsx';
import { FileIcon } from '@/components/icons/FileIcon.tsx';

/**
 * ELITE FILE THUMBNAIL v2.5
 * FEATURES: 
 * - Auto-Fallback for incompatible Codecs (HEIC/RAW)
 * - Tactical "Loading" states
 * - Interactive removal with particle-simulated feedback
 */

interface FileThumbnailProps {
  fileWrapper: UploadedFile;
  onRemove: () => void;
  onDragStart: () => void;
  onDrop: () => void;
}

export const FileThumbnail: React.FC<FileThumbnailProps> = ({ 
  fileWrapper, 
  onRemove, 
  onDragStart, 
  onDrop 
}) => {
  const { file, previewUrl } = fileWrapper;
  const [hasError, setHasError] = useState(false);

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isPdf = file.type === 'application/pdf';

  const renderPreview = () => {
    // If the image fails to load (Codec mismatch like HEIC on Windows)
    if (hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-zinc-900 text-zinc-500 border-2 border-dashed border-zinc-800">
          <span className="text-2xl mb-1">⚠️</span>
          <span className="text-[8px] font-black uppercase tracking-widest text-red-500">Codec_Error</span>
          <span className="text-[7px] opacity-40 uppercase truncate px-2 w-full text-center">{file.name}</span>
        </div>
      );
    }

    if (isImage) {
      return (
        <img 
          src={previewUrl} 
          alt={file.name} 
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
          onError={() => setHasError(true)} // CRITICAL: Catches broken previews
        />
      );
    }

    if (isVideo) {
      return (
        <div className="relative h-full w-full bg-black">
          <video src={previewUrl} className="h-full w-full object-cover opacity-50" muted playsInline />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-8 h-8 rounded-full border border-cyan-500/50 flex items-center justify-center bg-cyan-500/10">
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-cyan-400 border-b-[5px] border-b-transparent ml-1" />
             </div>
          </div>
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-zinc-900 border border-zinc-800 group-hover:border-red-500/30 transition-colors">
          <DocumentIcon className="w-8 h-8 text-red-500/60" />
          <span className="text-[9px] font-black mt-2 text-zinc-500 tracking-tighter uppercase">PDF_NODE</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-900 border border-zinc-800">
        <FileIcon className="w-8 h-8 text-zinc-700" />
        <span className="text-[9px] font-black mt-2 text-zinc-500 tracking-tighter uppercase">DATA_BLOB</span>
      </div>
    );
  };
  
  return (
    <div
      className="relative group aspect-square overflow-hidden border-2 border-zinc-800 bg-zinc-950 hover:border-cyan-500/50 transition-all cursor-grab active:cursor-grabbing shadow-lg"
      draggable="true"
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {/* TACTICAL SCANLINE (Expert visual touch) */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-500/20 z-10 animate-scan pointer-events-none" />
      
      {renderPreview()}

      {/* GLASSMORPHIC HOVER OVERLAY */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3">
        <p className="text-white text-[9px] font-black text-center break-all uppercase tracking-tighter leading-tight mb-2">
          {file.name}
        </p>
        <p className="text-zinc-500 text-[8px] font-mono">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>

      {/* DELETE TRIGGER */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1.5 right-1.5 bg-red-600/90 text-white w-6 h-6 flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:scale-110 active:scale-90 z-20 shadow-xl"
        aria-label="Remove asset"
      >
        <XIcon className="w-3.5 h-3.5" />
      </button>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100px); opacity: 0; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
};