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
    // Simulating upload delay
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 2000);
  };

  const hasReferenceNum = loadNum.trim() !== '' || bolNum.trim() !== '';
  const hasUploads = uploadedFiles.length > 0;
  const isFormComplete = company !== '' && driverName.trim() !== '' && hasReferenceNum && 
                         puCity.trim() !== '' && puState !== '' && delCity.trim() !== '' && 
                         delState !== '' && bolType !== '' && hasUploads;

  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  
  const getBrandColorClass = () => {
    if (isGLX) return 'text-green-500 shadow-green-500/40';
    if (isBST) return 'text-blue-400 shadow-blue-400/40';
    return 'text-[#00ffff]';
  };

  const SuccessCheck = ({ condition }: { condition: boolean }) => (
    condition ? <span className="ml-2 animate-bounce inline-block">✓</span> : null
  );

  return (
    <div className="app-container space-y-6 pb-20 relative">
      <h1 className={`font-orbitron text-2xl text-center tracking-tighter mb-4 ${getBrandColorClass()} uppercase glowing-text`}>BOL / PHOTO UPLOAD</h1>
      
      <div className={`bg-[#0a0a0a] border rounded-lg p-5 transition-all duration-700 space-y-8 ${isGLX ? 'border-green-500 shadow-[0_0_25px_rgba(34,197,94,0.2)]' : isBST ? 'border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.2)]' : 'border-zinc-800 shadow-2xl'}`}>
        
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className={`text-[10px] mb-1 uppercase font-bold tracking-widest flex items-center ${getBrandColorClass()}`}>Company* <SuccessCheck condition={company !== ''} /></label>
            <select className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none" value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="">Select Company...</option>
              <option value="GLX">Greenleaf Xpress</option>
              <option value="BST">BST Expedite</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className={`text-[10px] mb-1 uppercase font-bold tracking-widest flex items-center ${getBrandColorClass()}`}>Driver Name* <SuccessCheck condition={driverName.trim() !== ''} /></label>
            <input type="text" placeholder="Enter name" className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>
        </div>

        {/* Load Data Section */}
        <div className="space-y-4">
          <h2 className={`font-orbitron text-lg border-b border-zinc-800 pb-1 uppercase tracking-widest font-black flex items-center ${getBrandColorClass()}`}>Load Data <SuccessCheck condition={hasReferenceNum && puCity !== '' && delCity !== ''} /></h2>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Load #" className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none" value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
            <input type="text" placeholder="BOL #" className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none" value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4">
             <input type="text" placeholder="PU City" className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm" value={puCity} onChange={(e) => setPuCity(e.target.value)} />
             <input type="text" placeholder="Del City" className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm" value={delCity} onChange={(e) => setDelCity(e.target.value)} />
          </div>
        </div>

        {/* Documents Section */}
        <div className="space-y-4 pt-4">
          <h2 className={`font-orbitron text-lg border-b border-zinc-800 pb-1 uppercase tracking-widest font-black flex items-center ${getBrandColorClass()}`}>Documents <SuccessCheck condition={hasUploads} /></h2>
          <div className="bg-[#111] border border-zinc-800 p-4 rounded-md space-y-4 shadow-inner text-center">
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileChange} />
            <div className="border border-dashed border-zinc-700 p-6 rounded cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <p className="text-white text-[10px] font-bold uppercase">Tap to upload files</p>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {uploadedFiles.map((item) => (
                  <div key={item.id} className="relative aspect-square border border-zinc-700 rounded overflow-hidden">
                    <img src={item.preview} className="w-full h-full object-cover" alt="preview" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className={`w-full font-orbitron py-4 rounded-md uppercase text-xs tracking-widest transition-all ${isFormComplete && !isSubmitting ? (isGLX ? 'bg-green-500' : isBST ? 'bg-blue-500' : 'bg-[#00ffff]') : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
          disabled={!isFormComplete || isSubmitting}
        >
          {isSubmitting ? 'Uploading...' : isFormComplete ? 'Submit Documentation' : 'Complete All Fields'}
        </button>
      </div>

      {/* ✅ SUCCESS SUMMARY POP-UP */}
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
            <button 
              onClick={() => window.location.reload()} 
              className={`w-full py-3 rounded font-orbitron text-[10px] uppercase tracking-widest ${isGLX ? 'bg-green-500 shadow-green-500/30' : 'bg-blue-500 shadow-blue-500/30'} text-white shadow-lg`}
            >
              Start New Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;