import React, { useState, useRef } from 'react';

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

  // ✅ Updated Logo Mapping to match 'GLX' and 'BST' dropdown values
  const companyLogos: Record<string, string> = {
    'GLX': 'https://quantum-logistics.com/wp-content/uploads/2023/logo-white.png', 
    'BST': 'https://bstlogistics.com/wp-content/uploads/2021/04/BST-Logo-White.png',
  };

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
    'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

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
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const hasReferenceNum = loadNum.trim() !== '' || bolNum.trim() !== '';
  const hasUploads = uploadedFiles.length > 0;
  const isFormComplete = company !== '' && driverName.trim() !== '' && hasReferenceNum && 
                         puCity.trim() !== '' && puState !== '' && delCity.trim() !== '' && 
                         delState !== '' && bolType !== '' && hasUploads;

  return (
    <div className="app-container space-y-6 pb-10">
      <h1 className="font-orbitron text-2xl text-center cyan-glow tracking-tighter mb-4">BOL / PHOTO UPLOAD</h1>
      
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-lg p-5 shadow-2xl space-y-6">
        
        {/* ✅ Working Dynamic Logo Area */}
        <div className="flex justify-center h-20 items-center border-b border-zinc-800 pb-4">
          {company && companyLogos[company] ? (
            <img 
              src={companyLogos[company]} 
              alt={`${company} Logo`} 
              className="max-h-full object-contain transition-opacity duration-500 animate-pulse-once" 
            />
          ) : (
            <div className="text-zinc-600 italic text-xs">Select a company to view logo</div>
          )}
        </div>

        {/* Company & Driver Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-[10px] cyan-glow mb-1 uppercase">Company<span className="required-asterisk">*</span></label>
            <select 
              className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none focus:border-cyan-500" 
              value={company} 
              onChange={(e) => setCompany(e.target.value)}
            >
              <option value="">Select Company...</option>
              <option value="GLX">Greenleaf Xpress</option>
              <option value="BST">BST Expedite</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] cyan-glow mb-1 uppercase">Driver Name<span className="required-asterisk">*</span></label>
            <input 
              type="text" 
              placeholder="Enter your name" 
              className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none focus:border-cyan-500" 
              value={driverName} 
              onChange={(e) => setDriverName(e.target.value)} 
            />
          </div>
        </div>

        {/* Load Data Section */}
        <div className="space-y-4 pt-2">
          <h2 className="font-orbitron text-sm cyan-glow border-b border-zinc-800 pb-1 uppercase">Load Data</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-[10px] cyan-glow mb-1 uppercase">Load #</label>
              <input type="text" placeholder="Load ID" className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none" value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] cyan-glow mb-1 uppercase">BOL #</label>
              <input type="text" placeholder="BOL #" className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none" value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col">
              <label className="text-[10px] cyan-glow mb-1 uppercase">Pickup City/State<span className="required-asterisk">*</span></label>
              <div className="flex gap-2">
                <input type="text" placeholder="PU City" className="flex-1 bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm" value={puCity} onChange={(e) => setPuCity(e.target.value)} />
                <select className="w-32 bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm" value={puState} onChange={(e) => setPuState(e.target.value)}>
                  <option value="">Select State</option>
                  {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] cyan-glow mb-1 uppercase">Delivery City/State<span className="required-asterisk">*</span></label>
              <div className="flex gap-2">
                <input type="text" placeholder="Del City" className="flex-1 bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm" value={delCity} onChange={(e) => setDelCity(e.target.value)} />
                <select className="w-32 bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm" value={delState} onChange={(e) => setDelState(e.target.value)}>
                  <option value="">Select State</option>
                  {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="space-y-4 pt-4">
          <h2 className="font-orbitron text-sm cyan-glow border-b border-zinc-800 pb-1 uppercase">Documents & Freight</h2>
          <div className="bg-[#111] border border-zinc-800 p-4 rounded-md space-y-4 shadow-inner">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-white uppercase">BOL / POD Uploads<span className="required-asterisk">*</span></span>
              <div className="flex gap-3 text-[10px] text-zinc-400">
                <label className="flex items-center cursor-pointer"><input type="radio" name="bolType" className="mr-1 accent-cyan-400" onChange={() => setBolType('pickup')}/> Pickup</label>
                <label className="flex items-center cursor-pointer"><input type="radio" name="bolType" className="mr-1 accent-cyan-400" onChange={() => setBolType('delivery')}/> Delivery</label>
              </div>
            </div>

            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,application/pdf" onChange={handleFileChange} />
            <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={handleFileChange} />

            <div className="border border-dashed border-zinc-700 p-6 rounded text-center cursor-pointer hover:bg-zinc-900 transition" onClick={() => fileInputRef.current?.click()}>
              <p className="text-white text-xs font-bold uppercase mb-4">Tap to open camera or upload files</p>
              <div className="flex justify-center gap-6 text-[11px] text-zinc-400 font-bold">
                <button type="button" className="hover:text-cyan-400" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>📁 Select Files</button>
                <button type="button" className="hover:text-cyan-400" onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}>📷 Use Camera</button>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {uploadedFiles.map((item) => (
                  <div key={item.id} className="relative aspect-square border border-zinc-700 rounded overflow-hidden">
                    <img src={item.preview} className="w-full h-full object-cover" alt="preview" />
                    <button onClick={() => removeFile(item.id)} className="absolute top-0 right-0 bg-red-500 text-white text-[10px] p-1 px-2 rounded-bl shadow-lg">X</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button 
          className={`w-full font-orbitron py-4 rounded-md uppercase text-xs tracking-widest transition-all duration-300 ${
            isFormComplete ? 'bg-[#00ffff] text-black shadow-[0_0_20px_rgba(0,255,255,0.4)] cursor-pointer' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
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