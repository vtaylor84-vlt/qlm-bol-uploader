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

  const hasReferenceNum = loadNum.trim() !== '' || bolNum.trim() !== '';
  const hasUploads = uploadedFiles.length > 0;
  const isFormComplete = company !== '' && driverName.trim() !== '' && hasReferenceNum && 
                         puCity.trim() !== '' && puState !== '' && delCity.trim() !== '' && 
                         delState !== '' && bolType !== '' && hasUploads;

  // 🎨 Branding Helpers
  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  
  const getHeaderColor = () => {
    if (isGLX) return 'text-green-500 shadow-green-500/50';
    if (isBST) return 'text-red-600 shadow-red-600/50';
    return 'text-[#00ffff]';
  };

  const getBorderColor = () => {
    if (isGLX) return 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]';
    if (isBST) return 'border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]';
    return 'border-zinc-800 shadow-2xl';
  };

  const getHoverBorder = () => {
    if (isGLX) return 'hover:border-green-500';
    if (isBST) return 'hover:border-red-600';
    return 'hover:border-cyan-500';
  };

  // ✅ Success Field Logic (Green border after completion)
  const fieldSuccess = "focus:border-cyan-500 border-zinc-700";
  const getFieldStatus = (val: string) => val.trim() !== '' ? 'border-green-500/50' : 'border-zinc-700';

  return (
    <div className="app-container space-y-6 pb-20">
      <h1 className={`font-orbitron text-2xl text-center tracking-tighter mb-4 transition-colors duration-500 ${getHeaderColor()}`}>BOL / PHOTO UPLOAD</h1>
      
      <div className={`bg-[#0a0a0a] border rounded-lg p-5 transition-all duration-700 space-y-8 ${getBorderColor()}`}>
        
        {/* Company & Driver Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className={`text-[10px] mb-1 uppercase font-bold ${getHeaderColor()}`}>Company*</label>
            <select className={`bg-[#111] border p-2 rounded text-white text-sm outline-none transition-colors ${company !== '' ? 'border-green-500/50' : 'border-zinc-700'}`} value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="">Select Company...</option>
              <option value="GLX">Greenleaf Xpress</option>
              <option value="BST">BST Expedite</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className={`text-[10px] mb-1 uppercase font-bold ${getHeaderColor()}`}>Driver Name*</label>
            <input type="text" placeholder="Enter name" className={`bg-[#111] border p-2 rounded text-white text-sm outline-none transition-colors ${getFieldStatus(driverName)}`} value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>
        </div>

        {/* Load Data Section */}
        <div className="space-y-4 pt-2">
          <h2 className={`font-orbitron text-sm border-b border-zinc-800 pb-1 uppercase tracking-widest ${getHeaderColor()}`}>Load Data</h2>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Load #" className={`bg-[#111] border p-2 rounded text-white text-sm outline-none transition-colors ${getFieldStatus(loadNum)}`} value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
            <input type="text" placeholder="BOL #" className={`bg-[#111] border p-2 rounded text-white text-sm outline-none transition-colors ${getFieldStatus(bolNum)}`} value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex gap-2">
              <input type="text" placeholder="PU City" className={`flex-1 bg-[#111] border p-2 rounded text-white text-sm transition-colors ${getFieldStatus(puCity)}`} value={puCity} onChange={(e) => setPuCity(e.target.value)} />
              <select className={`w-32 bg-[#111] border p-2 rounded text-white text-sm transition-colors ${puState !== '' ? 'border-green-500/50' : 'border-zinc-700'}`} value={puState} onChange={(e) => setPuState(e.target.value)}>
                <option value="">ST</option>
                {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Del City" className={`flex-1 bg-[#111] border p-2 rounded text-white text-sm transition-colors ${getFieldStatus(delCity)}`} value={delCity} onChange={(e) => setDelCity(e.target.value)} />
              <select className={`w-32 bg-[#111] border p-2 rounded text-white text-sm transition-colors ${delState !== '' ? 'border-green-500/50' : 'border-zinc-700'}`} value={delState} onChange={(e) => setDelState(e.target.value)}>
                <option value="">ST</option>
                {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="space-y-4 pt-4">
          <h2 className={`font-orbitron text-sm border-b border-zinc-800 pb-1 uppercase tracking-widest ${getHeaderColor()}`}>Documents & Freight</h2>
          <div className="bg-[#111] border border-zinc-800 p-4 rounded-md space-y-4 shadow-inner">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-white uppercase">BOL / POD Uploads*</span>
              <div className="flex gap-3 text-[10px] text-zinc-400">
                <label className="flex items-center cursor-pointer"><input type="radio" name="bolType" className={`mr-1 ${isGLX ? 'accent-green-500' : isBST ? 'accent-red-600' : 'accent-cyan-400'}`} onChange={() => setBolType('pickup')}/> Pickup</label>
                <label className="flex items-center cursor-pointer"><input type="radio" name="bolType" className={`mr-1 ${isGLX ? 'accent-green-500' : isBST ? 'accent-red-600' : 'accent-cyan-400'}`} onChange={() => setBolType('delivery')}/> Delivery</label>
              </div>
            </div>

            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,application/pdf" onChange={handleFileChange} />
            <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={handleFileChange} />

            <div className={`border border-dashed border-zinc-700 p-6 rounded text-center cursor-pointer transition-all ${getHoverBorder()}`} onClick={() => fileInputRef.current?.click()}>
              <p className="text-white text-[10px] font-bold uppercase mb-1">Tap to open camera or upload files</p>
              <p className="text-[9px] text-zinc-500 mb-4 italic">Drag & drop is also supported (Max PDF/Image)</p>
              <div className="flex justify-center gap-6 text-[11px] text-zinc-400 font-bold uppercase">
                <button type="button" className={`flex items-center gap-1 ${isGLX ? 'hover:text-green-500' : isBST ? 'hover:text-red-600' : 'hover:text-cyan-400'}`} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>📁 Select Files</button>
                <button type="button" className={`flex items-center gap-1 ${isGLX ? 'hover:text-green-500' : isBST ? 'hover:text-red-600' : 'hover:text-cyan-400'}`} onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}>📷 Use Camera</button>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
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

        {/* Dynamic Action Button */}
        <button 
          className={`w-full font-orbitron py-4 rounded-md uppercase text-xs tracking-widest transition-all duration-300 ${
            isFormComplete 
            ? (isGLX ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' : isBST ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-[#00ffff] text-black shadow-[0_0_20px_rgba(0,255,255,0.4)]') 
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
          disabled={!isFormComplete}
        >
          {isFormComplete ? 'Submit Documentation' : 'Complete All Fields & Upload'}
        </button>
      </div>
    </div>
  );
};
export default App;