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

  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  
  const getBrandColorClass = () => {
    if (isGLX) return 'text-green-500 shadow-green-500/40';
    if (isBST) return 'text-blue-400 shadow-blue-400/40';
    return 'text-[#00ffff]';
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

  const inputStyle = "bg-[#111] border p-2 rounded text-white text-sm outline-none transition-all font-normal";

  return (
    <div className="app-container space-y-6 pb-20">
      <h1 className={`font-orbitron text-2xl text-center tracking-tighter mb-4 transition-colors duration-500 ${getBrandColorClass()} uppercase glowing-text`}>BOL / PHOTO UPLOAD</h1>
      
      <div className={`bg-[#0a0a0a] border rounded-lg p-5 transition-all duration-700 space-y-8 ${isGLX ? 'border-green-500 shadow-[0_0_25px_rgba(34,197,94,0.2)]' : isBST ? 'border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.2)]' : 'border-zinc-800 shadow-2xl'}`}>
        
        {/* Company & Driver */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className={`text-[10px] mb-1 uppercase font-bold tracking-widest flex items-center ${getBrandColorClass()}`}>Company* <SuccessCheck condition={company !== ''} /></label>
            <select className={`${inputStyle} ${getFieldStatus(company)}`} value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="">Select Company...</option>
              <option value="GLX">Greenleaf Xpress</option>
              <option value="BST">BST Expedite</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className={`text-[10px] mb-1 uppercase font-bold tracking-widest flex items-center ${getBrandColorClass()}`}>Driver Name* <SuccessCheck condition={driverName !== ''} /></label>
            <input type="text" placeholder="Enter name" className={`${inputStyle} ${getFieldStatus(driverName)}`} value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>
        </div>

        {/* Load Data */}
        <div className="space-y-4 pt-2">
          <h2 className={`font-orbitron text-lg border-b border-zinc-800 pb-1 uppercase tracking-[0.2em] font-black flex items-center ${getBrandColorClass()}`}>Load Data</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className={`text-[10px] mb-1 uppercase font-bold tracking-widest ${getBrandColorClass()}`}>Load #</label>
              <input type="text" placeholder="Load ID" className={`${inputStyle} ${getFieldStatus(loadNum)}`} value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
            </div>
            <div className="flex flex-col">
              <label className={`text-[10px] mb-1 uppercase font-bold tracking-widest ${getBrandColorClass()}`}>BOL #</label>
              <input type="text" placeholder="BOL #" className={`${inputStyle} ${getFieldStatus(bolNum)}`} value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col">
              <label className={`text-[10px] uppercase font-bold tracking-widest ${getBrandColorClass()}`}>Pickup City/State*</label>
              <div className="flex gap-2 mt-1">
                <input type="text" placeholder="PU City" className={`${inputStyle} flex-1 ${getFieldStatus(puCity)}`} value={puCity} onChange={(e) => setPuCity(e.target.value)} />
                <select className={`${inputStyle} w-32 ${getFieldStatus(puState)}`} value={puState} onChange={(e) => setPuState(e.target.value)}>
                  <option value="">Select State</option>
                  {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col">
              <label className={`text-[10px] uppercase font-bold tracking-widest ${getBrandColorClass()}`}>Delivery City/State*</label>
              <div className="flex gap-2 mt-1">
                <input type="text" placeholder="Del City" className={`${inputStyle} flex-1 ${getFieldStatus(delCity)}`} value={delCity} onChange={(e) => setDelCity(e.target.value)} />
                <select className={`${inputStyle} w-32 ${getFieldStatus(delState)}`} value={delState} onChange={(e) => setDelState(e.target.value)}>
                  <option value="">Select State</option>
                  {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="space-y-4 pt-4">
          <h2 className={`font-orbitron text-lg border-b border-zinc-800 pb-1 uppercase tracking-[0.2em] font-black ${getBrandColorClass()}`}>Documents & Freight</h2>
          
          <div className={`bg-[#111] border-2 border-dashed p-6 rounded-md space-y-4 transition-all ${isGLX ? 'border-green-500/30 shadow-[inset_0_0_15px_rgba(34,197,94,0.1)]' : isBST ? 'border-blue-500/30 shadow-[inset_0_0_15px_rgba(59,130,246,0.1)]' : 'border-zinc-800'}`}>
            <div className="flex justify-between items-center">
              <span className={`text-[11px] font-bold uppercase ${getBrandColorClass()}`}>BOL / POD Uploads*</span>
              <div className="flex gap-3 text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
                <label className="flex items-center cursor-pointer"><input type="radio" name="bolType" className="mr-1" onChange={() => setBolType('pickup')}/> Pickup</label>
                <label className="flex items-center cursor-pointer"><input type="radio" name="bolType" className="mr-1" onChange={() => setBolType('delivery')}/> Delivery</label>
              </div>
            </div>

            <div className="py-4 text-center">
              <p className="text-white text-[10px] font-bold uppercase mb-1">Upload Documentation</p>
              <p className={`text-[9px] mb-6 italic font-bold ${isGLX ? 'text-green-500/70' : isBST ? 'text-blue-400/70' : 'text-zinc-500'}`}>
                Tip: Press and hold a photo to select multiple files
              </p>
              
              <div className="flex justify-center gap-6 text-[11px] text-zinc-400 font-bold uppercase">
                <button type="button" className={`flex items-center gap-1 ${isGLX ? 'hover:text-green-500' : isBST ? 'hover:text-blue-400' : 'hover:text-cyan-400'}`} onClick={() => fileInputRef.current?.click()}>📁 Select Files</button>
                <button type="button" className={`flex items-center gap-1 ${isGLX ? 'hover:text-green-500' : isBST ? 'hover:text-blue-400' : 'hover:text-cyan-400'}`} onClick={() => cameraInputRef.current?.click()}>📷 Use Camera</button>
              </div>
            </div>

            {/* ✅ UPDATED: Strict accept attribute to bypass camera prompt */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" 
              onChange={handleFileChange} 
            />
            <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={handleFileChange} />

            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-800">
                {uploadedFiles.map((item) => (
                  <div key={item.id} className="relative aspect-square border border-zinc-700 rounded overflow-hidden">
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
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className={`w-full max-w-sm bg-[#0a0a0a] border ${isGLX ? 'border-green-500 shadow-green-500/20' : 'border-blue-500 shadow-blue-500/20'} p-8 rounded-xl text-center space-y-6 shadow-2xl`}>
            <div className={`text-5xl mb-4 ${isGLX ? 'text-green-500' : 'text-blue-500'}`}>✓</div>
            <h2 className="font-orbitron text-xl text-white uppercase tracking-widest">Submission Sent</h2>
            <button onClick={() => window.location.reload()} className={`w-full py-3 rounded font-orbitron text-[10px] uppercase tracking-widest ${isGLX ? 'bg-green-500' : isBST ? 'bg-blue-500'} text-white`}>New Upload</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;