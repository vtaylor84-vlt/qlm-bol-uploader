import React, { useState, useRef, useEffect } from 'react';

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

const App = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStage, setAuthStage] = useState(0);
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
  const [shake, setShake] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const freightInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    return () => uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
  }, [uploadedFiles]);

  const startAuthSequence = () => {
    setIsAuthenticating(true);
    const sequence = ["SYSTEM INITIALIZED", "SECURE PROTOCOL v6.0 ACTIVE", "SCANNING BIOMETRICS", "ACCESS LOGGED & ENCRYPTED"];
    let current = 0;
    const interval = setInterval(() => {
      if (current < sequence.length) {
        setAuthStage(current + 1);
        current++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsLocked(false), 500);
      }
    }, 600);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file), // ✅ FIXED: Ensures valid preview blob URL
        id: `${file.name}-${Date.now()}`
      }));
      setUploadedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const brandColor = isGLX ? 'text-green-500' : isBST ? 'text-blue-400' : 'text-cyan-400';
  const brandBg = isGLX ? 'bg-green-500/10' : isBST ? 'bg-blue-500/10' : 'bg-transparent';
  
  const labelStyle = `text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 ml-1 ${brandColor}`;
  const tacticalInput = `w-full bg-zinc-950/90 border border-zinc-800 p-3 text-xs rounded-lg outline-none transition-all duration-300 text-white placeholder-zinc-700 focus:border-zinc-500 appearance-none`;

  const handleSubmit = () => {
    const complete = company && driverName && (loadNum || bolNum) && puCity && puState && delCity && delState && bolType && uploadedFiles.length > 0;
    if (!complete) {
      setShake(true);
      setTimeout(() => setShake(false), 800);
      return;
    }
    setIsSubmitting(true);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 5;
      setUploadProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        audioRef.current?.play().catch(() => {});
        setTimeout(() => setShowSuccess(true), 500);
      }
    }, 100);
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 font-orbitron overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:30px_30px]"></div>
        <div className="z-10 flex flex-col md:flex-row items-center gap-12 max-w-2xl w-full">
          <div className="flex flex-col items-center space-y-6">
            <h1 className="text-white text-xl font-black tracking-[0.5em] uppercase">Auth-Shield</h1>
            <button onMouseDown={startAuthSequence} onTouchStart={startAuthSequence} className="relative w-32 h-32 rounded-full border-2 border-zinc-800 flex items-center justify-center transition-all">
               <svg className={`w-16 h-16 ${isAuthenticating ? 'text-cyan-500' : 'text-zinc-700'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
               {isAuthenticating && <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>}
            </button>
          </div>
          <div className="flex-1 w-full space-y-4 font-mono text-[9px] h-32 flex flex-col justify-center">
            {authStage >= 1 && <div className="text-cyan-500">{"> KERNEL INIT"}</div>}
            {authStage >= 2 && <div className="text-cyan-500">{"> PROXY_v6.0 READY"}</div>}
            {authStage >= 3 && <div className="text-cyan-500">{"> SCANNING_ID..."}</div>}
            {authStage >= 4 && <div className="text-green-500">{"> SESSION_AUTHORIZED"}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-20 relative font-orbitron overflow-hidden">
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${shake ? 'opacity-40 animate-pulse' : 'opacity-10'}`} 
           style={{ backgroundImage: `linear-gradient(${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px), linear-gradient(90deg, ${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 p-5 max-w-xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-zinc-900 pb-6">
          <div className="flex items-center gap-4">
            {/* ✅ RESTORED: Professional Brand Logos */}
            {isGLX ? (
              <div className="w-14 h-14 bg-green-500 rounded-lg flex flex-col items-center justify-center font-black text-black leading-none shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                <span className="text-lg">GLX</span>
                <span className="text-[6px] tracking-widest mt-1">LOGISTICS</span>
              </div>
            ) : isBST ? (
              <div className="w-14 h-14 bg-blue-500 rounded-lg flex flex-col items-center justify-center font-black text-white leading-none shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                <span className="text-lg">BST</span>
                <span className="text-[6px] tracking-widest mt-1">EXPEDITE</span>
              </div>
            ) : (
              <div className="w-14 h-14 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center font-black text-zinc-700">?</div>
            )}
            <div className="space-y-1">
               <h1 className={`text-xl font-black tracking-widest uppercase ${brandColor}`}>Terminal v6.0</h1>
               <p className="text-[7px] text-zinc-500 tracking-[0.4em]">SECURE DATA UPLINK</p>
            </div>
          </div>
        </header>

        {/* IDENTITY SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`flex flex-col p-3 rounded-xl border border-zinc-900 transition-all ${company ? brandBg : ''}`}>
            <label className={labelStyle}>Carrier Identity</label>
            <select className={tacticalInput} style={{ backgroundColor: '#000' }} value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="">SELECT FLEET...</option>
              <option value="GLX">GREENLEAF XPRESS (GLX)</option>
              <option value="BST">BST EXPEDITE (BST)</option>
            </select>
          </div>
          <div className={`flex flex-col p-3 rounded-xl border border-zinc-900 transition-all ${driverName ? brandBg : ''}`}>
            <label className={labelStyle}>Operator Name</label>
            <input type="text" placeholder="ENTER NAME" className={tacticalInput} value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>
        </div>

        {/* SHIPMENT DATA SECTION */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`flex flex-col p-3 rounded-xl border border-zinc-900 transition-all ${loadNum ? brandBg : ''}`}>
            <label className={labelStyle}>Load Reference</label>
            <input type="text" placeholder="LOAD #" className={tacticalInput} value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
          </div>
          <div className={`flex flex-col p-3 rounded-xl border border-zinc-900 transition-all ${bolNum ? brandBg : ''}`}>
            <label className={labelStyle}>BOL Reference</label>
            <input type="text" placeholder="BOL #" className={tacticalInput} value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
          </div>
        </div>

        {/* ✅ ENHANCED: Route Grid with "State" headers */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
             <div className={`col-span-2 flex flex-col p-3 rounded-xl border border-zinc-900 transition-all ${puCity ? brandBg : ''}`}>
               <label className={labelStyle}>Pickup City</label>
               <input type="text" placeholder="CITY" className={tacticalInput} value={puCity} onChange={(e) => setPuCity(e.target.value)} />
             </div>
             <div className={`flex flex-col p-3 rounded-xl border border-zinc-900 transition-all ${puState ? brandBg : ''}`}>
               <label className={labelStyle}>State</label>
               <select className={tacticalInput} style={{ backgroundColor: '#000' }} value={puState} onChange={(e) => setPuState(e.target.value)}>
                 <option value="">SELECT</option>
                 {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
             <div className={`col-span-2 flex flex-col p-3 rounded-xl border border-zinc-900 transition-all ${delCity ? brandBg : ''}`}>
               <label className={labelStyle}>Delivery City</label>
               <input type="text" placeholder="CITY" className={tacticalInput} value={delCity} onChange={(e) => setDelCity(e.target.value)} />
             </div>
             <div className={`flex flex-col p-3 rounded-xl border border-zinc-900 transition-all ${delState ? brandBg : ''}`}>
               <label className={labelStyle}>State</label>
               <select className={tacticalInput} style={{ backgroundColor: '#000' }} value={delState} onChange={(e) => setDelState(e.target.value)}>
                 <option value="">SELECT</option>
                 {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
        </div>

        {/* IMAGING MODULE */}
        <div className={`bg-zinc-950/40 border-2 border-dashed p-6 rounded-2xl text-center transition-all ${uploadedFiles.length > 0 ? (isGLX ? 'border-green-500/50' : 'border-blue-500/50') : 'border-zinc-800'}`}>
           <h2 className={`text-[10px] font-black uppercase tracking-widest mb-6 ${brandColor}`}>Imaging System</h2>
           
           {/* ✅ SHIFTED: Document Toggles right below header */}
           <div className="flex justify-center gap-6 text-[9px] text-zinc-500 font-bold uppercase border-b border-zinc-900 pb-5 mb-8">
              <label className={`flex items-center gap-2 cursor-pointer transition-all ${bolType === 'pickup' ? 'text-white' : ''}`}><input type="radio" name="bolType" className="accent-white" onChange={() => setBolType('pickup')}/> PU BOL</label>
              <label className={`flex items-center gap-2 cursor-pointer transition-all ${bolType === 'delivery' ? 'text-white' : ''}`}><input type="radio" name="bolType" className="accent-white" onChange={() => setBolType('delivery')}/> DEL POD</label>
           </div>

           <div className="flex justify-center gap-12 mb-8">
              <button onClick={() => fileInputRef.current?.click()} className={`${brandColor} text-[10px] font-black uppercase flex flex-col items-center gap-3`}><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg> Gallery</button>
              <button onClick={() => cameraInputRef.current?.click()} className={`${brandColor} text-[10px] font-black uppercase flex flex-col items-center gap-3`}><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg> Camera</button>
           </div>
           
           {uploadedFiles.length > 0 && (
             <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-6">
               {uploadedFiles.map(f => (
                 <div key={f.id} className="relative aspect-square rounded-xl border border-zinc-800 overflow-hidden group">
                   <img src={f.preview} className="w-full h-full object-cover" alt="doc" />
                   <div className={`absolute top-0 left-0 w-full h-[2px] animate-scan-limited ${isGLX ? 'bg-green-500' : 'bg-cyan-500 shadow-[0_0_10px_cyan]'}`}></div>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* ✅ CONSOLIDATED: Trailer Photo Module */}
        <div className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center"><h2 className={`text-[9px] font-black uppercase tracking-widest ${brandColor}`}>Trailer Visuals</h2><span className="text-[7px] text-zinc-600 uppercase">Optional</span></div>
          <button onClick={() => freightInputRef.current?.click()} className="w-full bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 flex flex-col items-center gap-3 hover:text-white transition-all">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"/></svg>
             Photos of freight loaded on the trailer
          </button>
          <input type="file" ref={freightInputRef} className="hidden" multiple accept="image/*,video/*" onChange={handleFile} />
        </div>

        <button onClick={handleSubmit} className={`w-full py-6 rounded-xl font-black text-xs uppercase tracking-[0.5em] transition-all relative overflow-hidden ${shake ? 'animate-shake bg-red-600' : isFormComplete ? (isGLX ? 'bg-green-600 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'bg-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.3)]') : 'bg-zinc-900 text-zinc-700'}`}>
          {isSubmitting && <div className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>}
          <span className="relative z-10">{isSubmitting ? 'TRANSMITTING...' : 'Execute Transmission'}</span>
        </button>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/98 z-50 flex flex-col items-center justify-center p-8 backdrop-blur-3xl animate-in zoom-in-95 duration-500">
           <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center text-4xl mb-8 ${isGLX ? 'border-green-500 text-green-500' : 'border-blue-500 text-blue-500'}`}>✓</div>
           <h2 className="text-2xl font-black uppercase tracking-[0.4em] mb-12 text-white">Verified</h2>
           <button onClick={() => window.location.reload()} className={`w-full max-w-xs py-4 border-2 text-[11px] font-black uppercase tracking-[0.3em] ${brandColor}`}>New Task</button>
        </div>
      )}

      <style>{`
        @keyframes scan-limited { 0% { top: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 60% { transform: translateX(8px); } }
        .animate-scan-limited { animation: scan-limited 2.5s linear 3; }
        .animate-shake { animation: shake 0.2s linear infinite; }
      `}</style>
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFile} />
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={handleFile} />
    </div>
  );
};

export default App;