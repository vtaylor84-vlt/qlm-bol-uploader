// src/components/QueueStatusBadge.tsx
import React from 'react';
import { useQueue } from '../hooks/useQueue';
import { useUploader } from '../hooks/useUploader';

export const QueueStatusBadge: React.FC = () => {
  const { currentTheme } = useUploader(); 
  const { queueCount, isSyncing } = useQueue();

  if (queueCount === 0) return null;

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 
                  bg-gray-800 border ${currentTheme.border} 
                  text-sm font-bold text-gray-100 
                  px-4 py-2 rounded-full shadow-lg transition-all duration-300
                  ${isSyncing ? 'animate-pulse' : ''}`}
    >
      {queueCount} job{queueCount !== 1 ? 's' : ''} queued {isSyncing ? '⏳' : '✅'}
    </div>
  );
};