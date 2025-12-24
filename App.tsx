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
  const [showSuccess, setShowSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  useEffect(() => {
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
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 2000);
  };

  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  
  const getBrandColorClass = () => {
    if (isGLX) return 'text-green-500 shadow-green-500/40';
    if (isBST) return 'text-blue-400 shadow-blue-400/40';
    return 'text-[#00ffff] shadow-cyan-500/40';
  };

  const getFieldStatus = (val: string) => {
    if (val.trim() === '') return 'border-zinc-700';
    return isBST ? 'border-blue-500/60' : 'border-green-500/60';
  };

  const SuccessCheck = ({ condition }: { condition: boolean }) => (
    condition ? <span className="ml-2 animate-bounce inline-block">✓</span> : null
  );

  const isFormComplete = company !== '' && driverName.trim() !== '' && (loadNum !== '' || bolNum !== '') && 
                         puCity !== '' && puState !== '' && delCity !== '' && delState !== '' && 
                         bolType !== '' && uploadedFiles.length > 0;

  return (
    <div className="app-container space-y-6 pb-20">
      <h1 className={`font-orbitron text-2xl text-center tracking-tighter mb-4 ${getBrandColorClass()} uppercase glowing-text`}>BOL / PHOTO UPLOAD</h1>
      
      <div className={`bg-[#0a0a0a] border rounded-lg p-5 transition-all duration-700 space-y-8 ${isGLX ? 'border-green-500 shadow-[0_0_25px_rgba(34,197,94,0.2)]' : isBST ? 'border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.2)]' : 'border-zinc-800 shadow-2xl'}`}>
        
        {/* Company & Driver Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className={`text-[10px] mb-1 uppercase font-bold tracking-widest flex items-center ${getBrandColorClass()}`}>Company* <SuccessCheck condition={company !== ''} /></label>
            <select className={`bg-[#111] border p-2 rounded text-white text-sm outline-none transition-all ${getFieldStatus(company)}`} value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="">Select Company...</option>
              <option value="GLX">Greenleaf Xpress</option>
              <option value="BST">BST Expedite</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className={`text-[10px] mb-1 uppercase font-bold tracking-widest flex items-center ${getBrandColorClass()}`}>Driver Name* <SuccessCheck condition={driverName !== ''} /></label>
            <input type="text" placeholder="Enter name" className={`bg-[#111] border p-2 rounded text-white text-sm outline-none transition-all ${getFieldStatus(driverName)}`} value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>
        </div>

        {/* RESTORED: LOAD DATA HEADER */}
        <div className="space-y-4 pt-2">
          <h2 className={`font-orbitron text-lg border-b border-zinc-800 pb-1 uppercase tracking-[0.2em] font-black flex items-center ${getBrandColorClass()}`}>
            Load Data <SuccessCheck condition={puCity !== '' && delCity !== ''} />
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Load #" className={`bg-[#111] border p-2 rounded text-white text-sm outline-none ${getFieldStatus(loadNum)}`} value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
            <input type="text" placeholder="BOL #" className={`bg-[#111] border p-2 rounded text-white text-sm outline-none ${getFieldStatus(bolNum)}`} value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex gap-2">
              <input type="text" placeholder="PU City" className={`flex-1 bg-[#111] border p-2 rounded text-white text-sm ${getFieldStatus(puCity)}`} value={puCity} onChange={(e) => setPuCity(e.target.value)} />
              <select className={`w-32 bg-[#111] border p-2 rounded text-white text-sm ${getFieldStatus(puState)}`} value={puState} onChange={(e) => setPuState(e.target.value)}>
                <option value="">Select State</option>
                {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Del City" className={`flex-1 bg-[#111] border p-2 rounded text-white text-sm ${getFieldStatus(delCity)}`} value={delCity} onChange={(e) => setDelCity(e.target.value)} />
              <select className={`w-32 bg-[#111] border p-2 rounded text-white text-sm ${getFieldStatus(delState)}`} value={delState} onChange={(e) => setDelState(e.target.value)}>
                <option value="">Select State</option>
                {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* RESTORED: DOCUMENTS HEADER & STYLED UPLOAD BOX */}
        <div className="space-y-4 pt-4">
          <h2 className={`font-orbitron text-lg border-b border-zinc-800 pb-1 uppercase tracking-[0.2em] font-black flex items-center ${getBrandColorClass()}`}>
            Documents & Freight <SuccessCheck condition={uploadedFiles.length > 0 && bolType !== ''} />
          </h2>
          
          <div className={`bg-[#111] border-2 border-dashed p-6 rounded-md space-y-4 transition-all ${isGLX ? 'border-green-500/30 shadow-[inset_0_0_15px_rgba(34,197,94,0.1)]' : isBST ? 'border-blue-500/30 shadow-[inset_0_0_15px_rgba(59,130,246,0.1)]' : 'border-zinc-800'}`}>
            <div className="flex justify-between items-center">
              <span className={`text-[11px] font-bold uppercase flex items-center ${getBrandColorClass()}`}>BOL / POD Uploads* <SuccessCheck condition={bolType !== ''} /></span>
              <div className="flex gap-3 text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
                <label className="flex items-center cursor-pointer"><input type="radio" name="bolType" className={`mr-1 ${isGLX ? 'accent-green-500' : isBST ? 'accent-blue-400' : 'accent-cyan-400'}`} onChange={() => setBolType('pickup')}/> Pickup</label>
                <label className="flex items-center cursor-pointer"><input type="radio" name="bolType" className={`mr-1 ${isGLX ? 'accent-green-500' : isBST ? 'accent-blue-400' : 'accent-cyan-400'}`} onChange={() => setBolType('delivery')}/> Delivery</label>
              </div>
            </div>

            <div className="py-4 text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <p className="text-white text-[10px] font-bold uppercase mb-1 flex justify-center items-center gap-2">Tap to open camera or upload files <SuccessCheck condition={uploadedFiles.length > 0} /></p>
              <p className="text-[9px] text-zinc-500 mb-6 italic">Drag & drop is also supported (Max PDF/Image)</p>
              
              <div className="flex justify-center gap-6 text-[11px] text-zinc-400 font-bold uppercase">
                <button type="button" className={`flex items-center gap-1 ${isGLX ? 'hover:text-green-500' : isBST ? 'hover:text-blue-400' : 'hover:text-cyan-400'}`} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>📁 Select Files</button>
                <button type="button" className={`flex items-center gap-1 ${isGLX ? 'hover:text-green-500' : isBST ? 'hover:text-blue-400' : 'hover:text-cyan-400'}`} onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}>📷 Use Camera</button>
              </div>
            </div>

            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,application/pdf" onChange={handleFileChange} />
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

        <button 
          onClick={handleSubmit}
          className={`w-full font-orbitron py-4 rounded-md uppercase text-xs tracking-widest transition-all ${isFormComplete && !isSubmitting ? (isGLX ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : isBST ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-[#00ffff]') : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
          disabled={!isFormComplete || isSubmitting}
        >
          {isSubmitting ? 'Uploading...' : isFormComplete ? 'Submit Documentation' : 'Complete All Fields & Upload'}
        </button>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-sm bg-[#0a0a0a] border ${isGLX ? 'border-green-500 shadow-green-500/20' : 'border-blue-500 shadow-blue-500/20'} p-8 rounded-xl text-center space-y-6 shadow-2xl`}>
            <div className={`text-5xl mb-4 ${isGLX ? 'text-green-500' : 'text-blue-500'}`}>✓</div>
            <h2 className="font-orbitron text-xl text-white uppercase tracking-widest">Submission Sent</h2>
            <div className="bg-[#111] p-4 rounded text-left space-y-2 text-xs border border-zinc-800">
              <p className="text-zinc-400">Company: <span className="text-white font-bold">{company === 'GLX' ? 'Greenleaf Xpress' : 'BST Expedite'}</span></p>
              <p className="text-zinc-400">Load/BOL: <span className="text-white font-bold">{loadNum || bolNum}</span></p>
              <p className="text-zinc-400">Files Uploaded: <span className="text-white font-bold">{uploadedFiles.length}</span></p>
            </div>
            <button onClick={() => window.location.reload()} className={`w-full py-3 rounded font-orbitron text-[10px] uppercase tracking-widest ${isGLX ? 'bg-green-500' : 'bg-blue-500'} text-white`}>Start New Upload</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;