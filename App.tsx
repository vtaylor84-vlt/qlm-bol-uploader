import React, { useState, useRef, useEffect } from 'react';

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

const App = () => {
  // --- SESSION STATE ---
  const [isLocked, setIsLocked] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStage, setAuthStage] = useState(0);
  
  // --- FORM DATA ---
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
  
  // --- UI FEEDBACK ---
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
  }, []);

  // ✅ AUTHENTICATION: Sequential Lock-Release
  const handleAuth = () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      setAuthStage(stage);
      if (stage >= 4) {
        clearInterval(interval);
        setTimeout(() => {
          setIsLocked(false);
          setIsAuthenticating(false);
        }, 800);
      }
    }, 500);
  };

  // ✅ IMAGE LOGIC: Reliable Preview Generation
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file), //
        id: `${file.name}-${Date.now()}`
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const brandColor = isGLX ? 'text-green-500' : isBST ? 'text-blue-400' : 'text-cyan-400';
  const brandBg = isGLX ? 'bg-green-500/10' : isBST ? 'bg-blue-500/10' : 'bg-transparent';
  const labelStyle = `text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 ml-1 ${brandColor}`;
  
  // Forced Black Dropdown Backgrounds
  const inputStyle = `w-full bg-black border border-zinc-800 p-3 text-xs rounded-lg outline-none transition-all duration-300 text-white placeholder-zinc-700 focus:border-zinc-500 appearance-none`;

  const triggerUplink = () => {
    const valid = company && driverName && (loadNum || bolNum) && puCity && puState && delCity && delState && bolType && uploadedFiles.length > 0;
    if (!valid) {
      setShake(true);
      setTimeout(() => setShake(false), 800);
      return;
    }
    setIsSubmitting(true);
    let p = 0;
    const timer = setInterval(() => {
      p += 5;
      setUploadProgress(p);
      if (p >= 100) {
        clearInterval(timer);
        audioRef.current?.play().catch(() => {});
        setTimeout(() => setShowSuccess(true), 500);
      }
    }, 100);
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 font-orbitron overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(#222_1px,transparent_1px),linear-gradient(90deg,#222_1px,transparent_1px)] bg-[size:30px_30px]"></div>
        <div className="z-10 flex flex-col md:flex-row items-center gap-12 max-w-2xl w-full p-10 border border-zinc-900 bg-zinc-950/80 rounded-3xl shadow-2xl backdrop-blur-lg">
          <div className="flex flex-col items-center space-y-6">
            <h1 className="text-white text-xl font-black tracking-[0.5em] uppercase">Auth-Shield</h1>
            <button onMouseDown={handleAuth} onTouchStart={handleAuth} className={`relative w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${isAuthenticating ? 'border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.4)] scale-105' : 'border-zinc-800 hover:border-zinc-700'}`}>
               <svg className={`w-16 h-16 ${isAuthenticating ? 'text-cyan-500' : 'text-zinc-700'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
               {isAuthenticating && <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>}
            </button>
            <p className={`text-[8px] uppercase tracking-[0.3em] font-bold ${isAuthenticating ? 'text-cyan-400' : 'text-zinc-600'}`}>{isAuthenticating ? 'SCANNING...' : 'HOLD TO AUTHENTICATE'}</p>
          </div>
          <div className="flex-1 w-full space-y-4 font-mono text-[10px] h-32 flex flex-col justify-center border-l border-zinc-900 pl-8">
            <div className={authStage >= 1 ? 'text-cyan-500' : 'text-zinc-900'}>{"> KERNEL INIT"}</div>
            <div className={authStage >= 2 ? 'text-cyan-500' : 'text-zinc-900'}>{"> PROXY_v8.0 READY"}</div>
            <div className={authStage >= 3 ? 'text-cyan-500' : 'text-zinc-900'}>{"> GEO_IP LOGGED"}</div>
            <div className={authStage >= 4 ? 'text-green-500 font-bold animate-pulse' : 'text-zinc-900'}>{authStage >= 4 ? "> ACCESS GRANTED" : "> AWAITING INPUT"}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-24 relative font-orbitron overflow-hidden">
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${shake ? 'opacity-40' : 'opacity-10'}`} 
           style={{ backgroundImage: `linear-gradient(${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px), linear-gradient(90deg, ${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 p-5 max-w-xl mx-auto space-y-10">
        <header className="flex justify-between items-center border-b border-zinc-900 pb-8">
          <div className="flex items-center gap-5">
            {isGLX ? (
              <div className="w-14 h-14 bg-green-500 rounded-xl flex flex-col items-center justify-center font-black text-black leading-none shadow-[0_0_25px_rgba(34,197,94,0.4)]"><span className="text-xl">GLX</span><span className="text-[6px] tracking-widest mt-1">LOGISTICS</span></div>
            ) : isBST ? (
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex flex-col items-center justify-center font-black text-white leading-none shadow-[0_0_25px_rgba(59,130,246,0.4)]"><span className="text-xl">BST</span><span className="text-[6px] tracking-widest mt-1">EXPEDITE</span></div>
            ) : (
              <div className="w-14 h-14 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center font-black text-zinc-700">?</div>
            )}
            <div className="space-y-1">
               <h1 className={`text-xl font-black tracking-widest uppercase ${brandColor} glowing-text`}>Terminal v8.0</h1>
               <p className="text-[7px] text-zinc-500 tracking-[0.4em]">SECURE DATA UPLINK CHANNEL</p>
            </div>
          </div>
        </header>

        {/* IDENTITY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`flex flex-col p-4 rounded-xl border border-zinc-900 transition-all ${company ? brandBg : ''}`}>
            <label className={labelStyle}>Carrier Identity</label>
            <select className={inputStyle} value={company} onChange={(e) => setCompany(e.target.value)} style={{ backgroundColor: 'black' }}>
              <option value="">SELECT FLEET...</option>
              <option value="GLX">GREENLEAF XPRESS (GLX)</option>
              <option value="BST">BST EXPEDITE (BST)</option>
            </select>
          </div>
          <div className={`flex flex-col p-4 rounded-xl border border-zinc-900 transition-all ${driverName ? brandBg : ''}`}>
            <label className={labelStyle}>Operator Name</label>
            <input type="text" placeholder="ENTER NAME" className={inputStyle} value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>
        </div>

        {/* SHIPMENT */}
        <div className="grid grid-cols-2 gap-6">
          <div className={`flex flex-col p-4 rounded-xl border border-zinc-900 transition-all ${loadNum ? brandBg : ''}`}>
            <label className={labelStyle}>Load Reference</label>
            <input type="text" placeholder="LOAD #" className={inputStyle} value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
          </div>
          <div className={`flex flex-col p-4 rounded-xl border border-zinc-900 transition-all ${bolNum ? brandBg : ''}`}>
            <label className={labelStyle}>BOL Reference</label>
            <input type="text" placeholder="BOL #" className={inputStyle} value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
          </div>
        </div>

        {/* ROUTE MODULES (Restored Headers & States) */}
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
             <div className={`col-span-2 flex flex-col p-4 rounded-xl border border-zinc-900 transition-all ${puCity ? brandBg : ''}`}>
               <label className={labelStyle}>Pickup City</label>
               <input type="text" placeholder="CITY" className={inputStyle} value={puCity} onChange={(e) => setPuCity(e.target.value)} />
             </div>
             <div className={`flex flex-col p-4 rounded-xl border border-zinc-900 transition-all ${puState ? brandBg : ''}`}>
               <label className={labelStyle}>State</label>
               <select className={inputStyle} value={puState} onChange={(e) => setPuState(e.target.value)} style={{ backgroundColor: 'black' }}>
                 <option value="">---</option>
                 {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
             <div className={`col-span-2 flex flex-col p-4 rounded-xl border border-zinc-900 transition-all ${delCity ? brandBg : ''}`}>
               <label className={labelStyle}>Delivery City</label>
               <input type="text" placeholder="CITY" className={inputStyle} value={delCity} onChange={(e) => setDelCity(e.target.value)} />
             </div>
             <div className={`flex flex-col p-4 rounded-xl border border-zinc-900 transition-all ${delState ? brandBg : ''}`}>
               <label className={labelStyle}>State</label>
               <select className={inputStyle} value={delState} onChange={(e) => setDelState(e.target.value)} style={{ backgroundColor: 'black' }}>
                 <option value="">---</option>
                 {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
        </div>

        {/* IMAGING MODULE */}
        <div className={`bg-zinc-950/40 border-2 border-dashed p-8 rounded-2xl text-center transition-all ${uploadedFiles.length > 0 ? (isGLX ? 'border-green-500/50' : 'border-blue-500/50') : 'border-zinc-800'}`}>
           <h2 className={`text-[10px] font-black uppercase tracking-widest mb-8 ${brandColor}`}>Imaging System</h2>
           <div className="flex justify-center gap-8 text-[9px] text-zinc-500 font-bold uppercase border-b border-zinc-900 pb-5 mb-10">
              <label className={`flex items-center gap-2 cursor-pointer ${bolType === 'pickup' ? 'text-white' : ''}`}><input type="radio" name="bolType" className="accent-white" onChange={() => setBolType('pickup')}/> PU BOL</label>
              <label className={`flex items-center gap-2 cursor-pointer ${bolType === 'delivery' ? 'text-white' : ''}`}><input type="radio" name="bolType" className="accent-white" onChange={() => setBolType('delivery')}/> DEL POD</label>
           </div>
           <div className="flex justify-center gap-12 mb-10">
              <button onClick={() => fileInputRef.current?.click()} className={`${brandColor} text-[10px] font-black uppercase flex flex-col items-center gap-3 hover:brightness-125`}><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg> Gallery</button>
              <button onClick={() => cameraInputRef.current?.click()} className={`${brandColor} text-[10px] font-black uppercase flex flex-col items-center gap-3 hover:brightness-125`}><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg> Camera</button>
           </div>
           {uploadedFiles.length > 0 && (
             <div className="grid grid-cols-3 gap-5 mt-10">
               {uploadedFiles.map(f => (
                 <div key={f.id} className="relative aspect-square rounded-2xl border border-zinc-800 overflow-hidden group shadow-lg">
                   <img src={f.preview} className="w-full h-full object-cover" alt="doc" />
                   <div className={`absolute top-0 left-0 w-full h-[2px] animate-scan-limited ${isGLX ? 'bg-green-500' : 'bg-cyan-500 shadow-[0_0_15px_cyan]'}`}></div>
                   <button onClick={() => setUploadedFiles(p => p.filter(it => it.id !== f.id))} className="absolute top-2 right-2 bg-red-600 text-white text-[10px] p-2 rounded-full z-30 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* TRAILER FREIGHT MODULE */}
        <div className="bg-zinc-950/40 border border-zinc-900 p-8 rounded-3xl space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-4"><h2 className={`text-[10px] font-black uppercase tracking-widest ${brandColor}`}>Trailer Visuals</h2><span className="text-[7px] text-zinc-600 uppercase">Optional Module</span></div>
          <button onClick={() => freightInputRef.current?.click()} className="w-full bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl text-[11px] font-black uppercase tracking-widest text-zinc-500 flex flex-col items-center gap-4 hover:text-white hover:bg-zinc-900 transition-all">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"/></svg>
             Photos of freight loaded on trailer
          </button>
        </div>

        <button onClick={triggerUplink} className={`w-full py-8 rounded-2xl font-black text-[11px] uppercase tracking-[0.6em] transition-all relative overflow-hidden ${shake ? 'animate-shake bg-red-600' : isFormComplete ? (isGLX ? 'bg-green-600 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'bg-blue-600 shadow-[0_0_50px_rgba(59,130,246,0.3)]') : 'bg-zinc-900 text-zinc-700 border border-zinc-800'}`}>
          {isSubmitting && <div className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>}
          <span className="relative z-10">{isSubmitting ? 'UPLOADING DATA...' : 'Execute Transmission'}</span>
        </button>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/98 z-50 flex flex-col items-center justify-center p-10 backdrop-blur-3xl animate-in zoom-in-95 duration-700">
           <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center text-5xl mb-10 ${isGLX ? 'border-green-500 text-green-500' : 'border-blue-500 text-blue-500'}`}>✓</div>
           <h2 className="text-3xl font-black uppercase tracking-[0.5em] mb-4 text-white text-center">Verified</h2>
           <p className="text-zinc-500 text-[10px] tracking-[0.4em] mb-12 uppercase">Archive synchronized with TMS</p>
           <button onClick={() => window.location.reload()} className={`w-full max-w-sm py-5 border-2 text-[12px] font-black uppercase tracking-[0.4em] ${brandColor} hover:bg-white/5`}>New Session</button>
        </div>
      )}

      <style>{`
        @keyframes scan-limited { 0% { top: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-10px); } 60% { transform: translateX(10px); } }
        .animate-scan-limited { animation: scan-limited 2.5s linear 3; }
        .animate-shake { animation: shake 0.2s linear infinite; }
        .glowing-text { text-shadow: 0 0 15px currentColor; }
      `}</style>
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={onFileSelect} />
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={onFileSelect} />
      <input type="file" ref={freightInputRef} className="hidden" multiple accept="image/*" onChange={onFileSelect} />
    </div>
  );
};

export default App;