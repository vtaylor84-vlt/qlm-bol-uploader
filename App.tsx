import React, { useState, useRef, useEffect } from 'react';

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

const App = () => {
  const [company, setCompany] = useState('');
  const [driverName, setDriverName] = useState('');
  const [loadNum, setLoadNum] = useState('');
  const [bolNum, setBolNum] = useState('');
  const [puCity, setPuCity] = useState('');
  const [puState, setPuState] = useState('');
  const [delCity, setDelCity] = useState('');
  const [delState, setDelState] = useState('');
  const [bolType, setBolType] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isNightMode, setIsNightMode] = useState(true); // ✅ Night Mode State
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    return () => uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
  }, [uploadedFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newFiles: FileWithPreview[] = [];
      filesArray.forEach((file) => {
        const isDuplicate = uploadedFiles.some(f => f.file.name === file.name && f.file.size === file.size);
        if (!isDuplicate) {
          newFiles.push({ file, preview: URL.createObjectURL(file), id: `${file.name}-${Date.now()}` });
        }
      });
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const removed = prev.find(f => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          audioRef.current?.play().catch(() => {});
          setTimeout(() => { setIsSubmitting(false); setShowSuccess(true); }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const brandColor = isGLX ? 'text-green-500' : isBST ? 'text-blue-400' : 'text-[#00ffff]';

  const isFormComplete = company !== '' && driverName.trim() !== '' && (loadNum !== '' || bolNum !== '') && puCity !== '' && puState !== '' && delCity !== '' && delState !== '' && bolType !== '' && uploadedFiles.length > 0;

  return (
    <div className={`app-container min-h-screen transition-all duration-1000 pb-20 relative overflow-hidden ${
      isNightMode ? 'bg-black' : 'bg-zinc-100'
    }`}>
      {/* Dynamic Grid */}
      <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${
        isSubmitting ? 'opacity-100' : 'opacity-10'
      }`} style={{ 
        backgroundImage: `linear-gradient(${isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#888'} 1px, transparent 1px), linear-gradient(90deg, ${isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#888'} 1px, transparent 1px)`,
        backgroundSize: '40px 40px' 
      }}></div>

      <div className="relative z-10 p-4 space-y-6 max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className={`font-orbitron text-xl tracking-tighter ${brandColor} uppercase transition-all`}>BOL UPLOADER</h1>
          {/* ✅ NIGHT MODE TOGGLE */}
          <button 
            onClick={() => setIsNightMode(!isNightMode)}
            className={`p-2 rounded-full border ${isNightMode ? 'border-zinc-700 text-yellow-400' : 'border-zinc-300 text-indigo-600'}`}
          >
            {isNightMode ? '☀️ Day' : '🌙 Night'}
          </button>
        </div>
        
        <div className={`border rounded-lg p-5 transition-all duration-700 space-y-8 backdrop-blur-md ${
          isNightMode ? 'bg-[#0a0a0a]/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-xl'
        } ${isGLX ? 'border-green-500 shadow-green-500/10' : isBST ? 'border-blue-500 shadow-blue-500/10' : ''}`}>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className={`text-[10px] mb-1 uppercase font-bold tracking-widest ${brandColor}`}>Company*</label>
              <select className={`p-2 rounded text-sm outline-none border ${isNightMode ? 'bg-[#111] text-white border-zinc-700' : 'bg-zinc-50 text-black border-zinc-300'}`} value={company} onChange={(e) => setCompany(e.target.value)}>
                <option value="">Select Company...</option>
                <option value="GLX">Greenleaf Xpress</option>
                <option value="BST">BST Expedite</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className={`text-[10px] mb-1 uppercase font-bold tracking-widest ${brandColor}`}>Driver Name*</label>
              <input type="text" placeholder="Name" className={`p-2 rounded text-sm outline-none border ${isNightMode ? 'bg-[#111] text-white border-zinc-700' : 'bg-zinc-50 text-black border-zinc-300'}`} value={driverName} onChange={(e) => setDriverName(e.target.value)} />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h2 className={`font-orbitron text-lg border-b pb-1 uppercase tracking-widest font-black ${brandColor} ${isNightMode ? 'border-zinc-800' : 'border-zinc-200'}`}>Load Data</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className={`text-[10px] mb-1 uppercase font-bold tracking-widest ${brandColor}`}>Load #</label>
                <input type="text" placeholder="ID" className={`p-2 rounded text-sm border ${isNightMode ? 'bg-[#111] text-white border-zinc-700' : 'bg-zinc-50 text-black border-zinc-300'}`} value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
              </div>
              <div className="flex flex-col">
                <label className={`text-[10px] mb-1 uppercase font-bold tracking-widest ${brandColor}`}>BOL #</label>
                <input type="text" placeholder="BOL" className={`p-2 rounded text-sm border ${isNightMode ? 'bg-[#111] text-white border-zinc-700' : 'bg-zinc-50 text-black border-zinc-300'}`} value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className={`font-orbitron text-lg border-b pb-1 uppercase tracking-widest font-black ${brandColor} ${isNightMode ? 'border-zinc-800' : 'border-zinc-200'}`}>Uploads</h2>
            <div className={`border-2 border-dashed p-6 rounded-md space-y-4 transition-all ${isNightMode ? 'bg-[#111] border-zinc-700' : 'bg-zinc-50 border-zinc-300'}`}>
              <div className="flex justify-between items-center">
                <span className={`text-[11px] font-bold uppercase ${brandColor}`}>BOL / POD*</span>
                <div className="flex gap-3 text-[10px] text-zinc-500 font-bold uppercase">
                  <label className="flex items-center cursor-pointer"><input type="radio" name="bolType" className="mr-1" onChange={() => setBolType('pickup')}/> PU</label>
                  <label className="flex items-center cursor-pointer"><input type="radio" name="bolType" className="mr-1" onChange={() => setBolType('delivery')}/> DEL</label>
                </div>
              </div>
              <div className="py-4 text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="flex justify-center gap-6 text-[11px] font-bold uppercase">
                  <button type="button" className={brandColor} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>📁 Files</button>
                  <button type="button" className={brandColor} onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}>📷 Camera</button>
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
              <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            className={`relative overflow-hidden w-full font-orbitron py-4 rounded-md uppercase text-xs tracking-widest transition-all ${
              isFormComplete && !isSubmitting ? (isGLX ? 'bg-green-500 text-white' : isBST ? 'bg-blue-500 text-white' : 'bg-cyan-500 text-black') : 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
            }`}
            disabled={!isFormComplete || isSubmitting}
          >
            {isSubmitting && (
              <div className={`absolute top-0 left-0 h-full ${isGLX ? 'bg-green-400' : isBST ? 'bg-blue-400' : 'bg-cyan-400'}`} style={{ width: `${uploadProgress}%`, opacity: 0.4 }} />
            )}
            <span className="relative z-10 font-bold">{isSubmitting ? `Uploading ${uploadProgress}%` : 'Submit'}</span>
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 backdrop-blur-md">
          <div className={`w-full max-w-sm bg-[#0a0a0a] border ${isGLX ? 'border-green-500 shadow-green-500/20' : 'border-blue-500 shadow-blue-500/20'} p-8 rounded-xl text-center space-y-6 shadow-2xl`}>
            <div className={`text-5xl mb-4 ${isGLX ? 'text-green-500' : 'text-blue-500'}`}>✓</div>
            <h2 className="font-orbitron text-xl text-white uppercase tracking-widest">Sent</h2>
            <div className="flex gap-4">
              <button onClick={() => window.location.reload()} className={`flex-1 py-3 rounded font-orbitron text-[10px] uppercase ${isGLX ? 'bg-green-500' : 'bg-blue-500'} text-white`}>New</button>
              <button onClick={() => window.close()} className="flex-1 py-3 rounded font-orbitron text-[10px] uppercase border border-zinc-700 text-zinc-400">Exit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;