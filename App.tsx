import React, { useState, useRef } from 'react';

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

const App = () => {
  // Form State
  const [company, setCompany] = useState('');
  const [driverName, setDriverName] = useState('');
  const [loadNum, setLoadNum] = useState('');
  const [bolNum, setBolNum] = useState('');
  const [puCity, setPuCity] = useState('');
  const [puState, setPuState] = useState('');
  const [delCity, setDelCity] = useState('');
  const [delState, setDelState] = useState('');
  const [bolType, setBolType] = useState('');
  
  // File Management State
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const bolInputRef = useRef<HTMLInputElement>(null);

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
    'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  // Handle File Upload & Duplicate Prevention
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newFiles: FileWithPreview[] = [];

      filesArray.forEach((file) => {
        // Check for duplicates by name and size
        const isDuplicate = uploadedFiles.some(
          (f) => f.file.name === file.name && f.file.size === file.size
        );

        if (!isDuplicate) {
          newFiles.push({
            file,
            preview: URL.createObjectURL(file),
            id: `${file.name}-${Date.now()}`
          });
        }
      });

      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
    // Reset input value so the same file can be picked again if deleted
    if (bolInputRef.current) bolInputRef.current.value = '';
  };

  // Remove File Function
  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      // Clean up memory
      const removed = prev.find(f => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  // 🛡️ Validation Logic
  const hasReferenceNum = loadNum.trim() !== '' || bolNum.trim() !== '';
  const hasUploads = uploadedFiles.length > 0;

  const isFormComplete = 
    company !== '' && 
    driverName.trim() !== '' && 
    hasReferenceNum && 
    puCity.trim() !== '' && 
    puState !== '' && 
    delCity.trim() !== '' && 
    delState !== '' &&
    bolType !== '' &&
    hasUploads;

  return (
    <div className="app-container space-y-6 pb-10">
      <h1 className="font-orbitron text-2xl text-center cyan-glow tracking-tighter mb-4">BOL / PHOTO UPLOAD</h1>
      
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-lg p-5 shadow-2xl space-y-6">
        
        {/* Company & Driver Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-[10px] cyan-glow mb-1">Company<span className="required-asterisk">*</span></label>
            <select className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none" value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="">Select...</option>
              <option value="GLX">Greenleaf Xpress</option>
              <option value="BST">BST Expedite</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] cyan-glow mb-1">Driver Name<span className="required-asterisk">*</span></label>
            <input type="text" placeholder="Enter name" className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>
        </div>

        {/* Load Data Section */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-1">
            <h2 className="font-orbitron text-sm cyan-glow">Load Data</h2>
            <span className="text-[9px] text-zinc-500 italic">Enter Load # or BOL #*</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Load #" className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none" value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
            <input type="text" placeholder="BOL #" className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none" value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex gap-2">
              <input type="text" placeholder="PU City" className="flex-1 bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm" value={puCity} onChange={(e) => setPuCity(e.target.value)} />
              <select className="w-24 bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm" value={puState} onChange={(e) => setPuState(e.target.value)}>
                <option value="">ST</option>
                {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Del City" className="flex-1 bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm" value={delCity} onChange={(e) => setDelCity(e.target.value)} />
              <select className="w-24 bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm" value={delState} onChange={(e) => setDelState(e.target.value)}>
                <option value="">ST</option>
                {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Uploads Section */}
        <div className="space-y-4 pt-4">
          <h2 className="font-orbitron text-sm cyan-glow border-b border-zinc-800 pb-1">Documents<span className="required-asterisk">*</span></h2>
          
          <div className="bg-[#111] border border-zinc-800 p-4 rounded-md space-y-4">
            <div className="flex justify-between items-center text-[10px] text-zinc-400">
              <label className="flex items-center cursor-pointer"><input type="radio" name="bolType" className="mr-1 accent-cyan-400" onChange={() => setBolType('pickup')}/> Pickup</label>
              <label className="flex items-center cursor-pointer"><input type="radio" name="bolType" className="mr-1 accent-cyan-400" onChange={() => setBolType('delivery')}/> Delivery</label>
            </div>

            <input type="file" ref={bolInputRef} className="hidden" multiple accept="image/*,application/pdf" onChange={handleFileChange} />
            
            <div className="border border-dashed border-zinc-700 p-6 rounded text-center cursor-pointer hover:bg-zinc-900 transition" onClick={() => bolInputRef.current?.click()}>
              <p className="text-white text-xs font-bold uppercase">Tap to open camera or upload files</p>
            </div>

            {/* Preview Gallery */}
            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {uploadedFiles.map((item) => (
                  <div key={item.id} className="relative group aspect-square border border-zinc-700 rounded overflow-hidden">
                    <img src={item.preview} className="w-full h-full object-cover" alt="preview" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                      className="absolute top-0 right-0 bg-red-500 text-white text-[10px] p-1 px-2 rounded-bl shadow-lg"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button 
          className={`w-full font-orbitron py-4 rounded-md uppercase text-xs tracking-widest transition-all ${
            isFormComplete ? 'bg-[#00ffff] text-black shadow-[0_0_20px_rgba(0,255,255,0.4)]' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
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