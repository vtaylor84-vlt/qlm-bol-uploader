import React, { useState, useRef, useEffect } from 'react';

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

const App = () => {
  // --- FORM STATE ---
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
  const [isNightMode, setIsNightMode] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    return () => uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
  }, [uploadedFiles]);

  // --- LOGIC HANDLERS ---
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

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the entire form?")) {
      setCompany('');
      setDriverName('');
      setLoadNum('');
      setBolNum('');
      setPuCity('');
      setPuState('');
      setDelCity('');
      setDelState('');
      setBolType('');
      uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
      setUploadedFiles([]);
    }
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

  // --- STYLING HELPERS ---
  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const brandColor = isGLX ? 'text-green-500 shadow-green-500/40' : isBST ? 'text-blue-400 shadow-blue-400/40' : 'text-[#00ffff]';
  const getFieldStatus = (val: string) => val.trim() !== '' ? (isBST ? 'border-blue-500/60' : 'border-green-500/60') : 'border-zinc-700';
  const SuccessCheck = ({ condition }: { condition: boolean }) => condition ? <span className="ml-2 animate-bounce inline-block">✓</span> : null;
  const isFormComplete = company !== '' && driverName.trim() !== '' && (loadNum !== '' || bolNum !== '') && puCity !== '' && puState !== '' && delCity !== '' && delState !== '' && bolType !== '' && uploadedFiles.length > 0;

  return (
    <div className={`min-h-screen transition-all duration-1000 pb-20 relative overflow-hidden ${isNightMode ? 'bg-black' : 'bg-zinc-100'}`}>
      
      {/* Dynamic Pulsing Grid Overlay */}
      <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${isSubmitting ? 'opacity-100' : 'opacity-10'}`} 
           style={{ backgroundImage: `linear-gradient(${isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#888'} 1px, transparent 1px), linear-gradient(90deg, ${isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#888'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 p-4 space-y-6 max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className={`font-orbitron text-xl tracking-tighter ${brandColor} uppercase transition-all glowing-text`}>BOL UPLOADER</h1>
          <button onClick={() => setIsNightMode(!isNightMode)} className={`p-2 rounded-full border ${isNightMode ? 'border-zinc-700 text-yellow-400' : 'border-zinc-300 text-indigo-600'}`}>
            {isNightMode ? '☀️ Day' : '🌙 Night'}
          </button>
        </div>
        
        <div className={`border rounded-lg p-5 transition-all duration-700 space-y-8 backdrop-blur-md ${isNightMode ? 'bg-[#0a0a0a]/90' : 'bg-white'} ${isGLX ? 'border-green-500 shadow-[0_0_25px_rgba(34,197,94,0.2)]' : isBST ? 'border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.2)]' : 'border-zinc-800'}`}>
          
          {/* SECTION: COMPANY & DRIVER */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className={`text-[10px] mb-1 uppercase font-bold tracking-widest flex items-center ${brandColor}`}>Company* <SuccessCheck condition={company !== ''} /></label>
              <select className={`p-2 rounded text-sm outline-none border ${isNightMode ? 'bg-[#111] text-white border-zinc-700' : 'bg-zinc-50 text-black border-zinc-300'} ${getFieldStatus(company)}`} value={company} onChange={(e) => setCompany(e.target.value)}>
                <option value="">Select Company...</option>
                <option value="GLX">Greenleaf Xpress</option>
                <option value="BST">BST Expedite</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className={`text-[10px] mb-1 uppercase font-bold tracking-widest flex items-center ${brandColor}`}>Driver Name* <SuccessCheck condition={driverName !== ''} /></label>
              <input type="text" placeholder="Name" className={`p-2 rounded text-sm outline-none border ${isNightMode ? 'bg-[#111] text-white border-zinc-700' : 'bg-zinc-50 text-black border-zinc-300'} ${getFieldStatus(driverName)}`} value={driverName} onChange={(e) => setDriverName(e.target.value)} />
            </div>
          </div>

          {/* SECTION: LOAD DATA */}
          <div className="space-y-4 pt-2">
            <h2 className={`font-orbitron text-lg border-b pb-1 uppercase tracking-widest font-black flex items-center ${brandColor} ${isNightMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
              Load Data <SuccessCheck condition={puCity !== '' && delCity !== ''} />
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className={`text-[10px] mb-1 uppercase font-bold tracking-widest flex items-center ${brandColor}`}>Load # <SuccessCheck condition={loadNum !== ''} /></label>
                <input type="text" placeholder="ID" className={`p-2 rounded text-sm border ${isNightMode ? 'bg-[#111] text-white border-zinc-700' : 'bg-zinc-50 text-black border-zinc-300'} ${getFieldStatus(loadNum)}`} value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
              </div>
              <div className="flex flex-col">
                <label className={`text-[10px] mb-1 uppercase font-bold tracking-widest flex items-center ${brandColor}`}>BOL # <SuccessCheck condition={bolNum !== ''} /></label>
                <input type="text" placeholder="BOL" className={`p-2 rounded text-sm border ${isNightMode ? 'bg-[#111] text-white border-zinc-700' : 'bg-zinc-50 text-black border-zinc-300'} ${getFieldStatus(bolNum)}`} value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
              </div>
            </div>

            <div className="flex flex-col">
              <label className={`text-[10px] mb-1 uppercase font-bold tracking-widest flex items-center ${brandColor}`}>Pickup City/State* <SuccessCheck condition={puCity !== '' && puState !== ''} /></label>
              <div className="flex gap-2">
                <input type="text" placeholder="City" className={`flex-1 p-2 rounded text-sm border ${isNightMode ? 'bg-[#111] text-white border-zinc-700' : 'bg-zinc-50 text-black border-zinc-300'} ${getFieldStatus(puCity)}`} value={puCity} onChange={(e) => setPuCity(e.target.value)} />
                <select className={`w-32 p-2 rounded text-sm border ${isNightMode ? 'bg-[#111] text-white border-zinc-700' : 'bg-zinc-50 text-black border-zinc-300'} ${getFieldStatus(puState)}`} value={puState} onChange={(e) => setPuState(e.target.value)}>
                  <option value="">Select State</option>
                  {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className={`text-[10px] mb-1 uppercase font-bold tracking-widest flex items-center ${brandColor}`}>Delivery City/State* <SuccessCheck condition={delCity !== '' && delState !== ''} /></label>
              <div className="flex gap-2">
                <input type="text" placeholder="City" className={`flex-1 p-2 rounded text-sm border ${isNightMode ? 'bg-[#111] text-white border-zinc-700' : 'bg-zinc-50 text-black border-zinc-300'} ${getFieldStatus(delCity)}`} value={delCity} onChange={(e) => setDelCity(e.target.value)} />
                <select className={`w-32 p-2 rounded text-sm border ${isNightMode ? 'bg-[#111] text-white border-zinc-700' : 'bg-zinc-50 text-black border-zinc-300'} ${getFieldStatus(delState)}`} value={delState} onChange={(e) => setDelState(e.target.value)}>
                  <option value="">Select State</option>
                  {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION: DOCUMENTS & FREIGHT */}
          <div className="space-y-4 pt-4">
            <h2 className={`font-orbitron text-lg border-b pb-1 uppercase tracking-widest font-black flex items-center ${brandColor} ${isNightMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
              Documents & Freight <SuccessCheck condition={uploadedFiles.length > 0} />
            </h2>
            <div className={`border-2 border-dashed p-6 rounded-md space-y-4 transition-all ${isNightMode ? 'bg-[#111] border-zinc-700' : 'bg-zinc-50 border-zinc-300'} ${isGLX ? 'border-green-500/30' : isBST ? 'border-blue-500/30' : ''}`}>
              <div className="flex justify-between items-center">
                <span className={`text-[11px] font-bold uppercase flex items-center ${brandColor}`}>BOL / POD Uploads* <SuccessCheck condition={bolType !== ''} /></span>
                <div className="flex gap-3 text-[10px] text-zinc-500 font-bold uppercase">
                  <label className="flex items-center cursor-pointer"><input type="radio" name="bolType" className="mr-1" onChange={() => setBolType('pickup')}/> PU</label>
                  <label className="flex items-center cursor-pointer"><input type="radio" name="bolType" className="mr-1" onChange={() => setBolType('delivery')}/> DEL</label>
                </div>
              </div>
              <div className="py-4 text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <p className={`text-white text-[10px] font-bold uppercase mb-4 ${isNightMode ? 'text-white' : 'text-zinc-600'}`}>Choose an upload method</p>
                <div className="flex justify-center gap-6 text-[11px] font-bold uppercase">
                  <button type="button" className={`${brandColor} hover:scale-105 transition-transform`} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>📁 Files</button>
                  <button type="button" className={`${brandColor} hover:scale-105 transition-transform`} onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}>📷 Camera</button>
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
              <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={handleFileChange} />
              
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-800">
                  {uploadedFiles.map((item) => (
                    <div key={item.id} className="relative aspect-square border border-zinc-700 rounded bg-zinc-900 overflow-hidden">
                      <img src={item.preview} className="w-full h-full object-cover" alt="preview" />
                      <button onClick={() => removeFile(item.id)} className="absolute top-0 right-0 bg-red-600 text-white text-[10px] p-1 px-2 rounded-bl">X</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-3">
            <button 
              onClick={handleSubmit}
              className={`relative overflow-hidden w-full font-orbitron py-4 rounded-md uppercase text-xs tracking-widest transition-all ${isFormComplete && !isSubmitting ? (isGLX ? 'bg-green-500 text-white' : isBST ? 'bg-blue-500 text-white' : 'bg-cyan-500 text-black') : 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'}`}
              disabled={!isFormComplete || isSubmitting}
            >
              {isSubmitting && (
                <div className={`absolute top-0 left-0 h-full ${isGLX ? 'bg-green-400' : isBST ? 'bg-blue-400' : 'bg-cyan-400'}`} style={{ width: `${uploadProgress}%`, opacity: 0.4 }} />
              )}
              <span className="relative z-10 font-bold">{isSubmitting ? `Uploading ${uploadProgress}%` : 'Submit Documentation'}</span>
            </button>

            {/* ✅ CLEAR FORM BUTTON */}
            <button 
              onClick={handleClear}
              className="w-full py-2 text-[10px] font-orbitron uppercase tracking-widest border border-zinc-800 text-zinc-600 hover:text-red-500 hover:border-red-500 transition-all"
            >
              Clear Entire Form
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS POP-UP */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className={`w-full max-w-sm bg-[#0a0a0a] border ${isGLX ? 'border-green-500' : 'border-blue-500'} p-8 rounded-xl text-center space-y-6 shadow-2xl animate-fade-in`}>
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