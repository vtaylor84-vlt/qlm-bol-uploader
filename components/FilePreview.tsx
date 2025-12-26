import React from 'react';
import { SelectedFile } from '@/types';

interface FilePreviewProps {
    file: SelectedFile;
    onRemove: (id: string) => void;
    index: number;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove, index }) => {
    const isImage = file.file.type.startsWith('image/');
    
    return (
        <div className="relative group w-full aspect-square border-2 border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 shadow-xl hover:border-cyan-500/40 transition-all">
            {/* PREVIEW CONTENT */}
            <div className="w-full h-full">
                {isImage ? (
                    <img src={file.previewUrl} className="object-cover w-full h-full" alt="Preview" />
                ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500 font-black text-[10px]">
                        {file.file.type.split('/')[1].toUpperCase()}
                    </div>
                )}
            </div>

            {/* DELETE OVERLAY (Mobile Friendly) */}
            <button
                onClick={() => onRemove(file.id)}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* TACTICAL FOOTER TAG */}
            <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-md p-1.5 translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="text-[8px] text-white font-bold truncate px-1 uppercase tracking-tighter">
                    {file.file.name}
                </p>
            </div>
        </div>
    );
};