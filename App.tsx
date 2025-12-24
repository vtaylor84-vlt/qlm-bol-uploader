import React, { useState, useRef, useEffect } from 'react';

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

const App = () => {
  // --- SESSION & UI STATE ---
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    // ✅ CLEANUP: Properly revoke object URLs to prevent memory leaks and display bugs
    return () => uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
  }, [uploadedFiles]);

  const startAuthSequence = () => {
    setIsAuthenticating(true);
    const sequence = ["SYSTEM INITIALIZED", "SECURE PROTOCOL v4.5 ACTIVE", "SCANNING BIOMETRICS", "ACCESS LOGGED & ENCRYPTED"];
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

  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const brandColor = isGLX ? 'text-green-500' : isBST ? 'text-blue-400' : 'text-cyan-400';
  const brandBg = isGLX ? 'bg-green-500/10' : isBST ? 'bg-blue-500/10' : 'bg-transparent';
  
  // ✅ EXPERT UI: Futuristic Data-Lock LED
  const StatusNode = ({ active }: { active: boolean }) => (
    <div className={`ml-auto w-1.5 h-1.5 rounded-full transition-all duration-700 ${active ? `${isGLX ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-blue-400 shadow-[0_0_10px_#60a5fa]'} scale-110` : 'bg-zinc-800 shadow-inner'}`}></div>
  );

  // ✅ HANDLER: Fixed image preview logic
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file), // ✅ Creates valid URL for <img>
        id: `${file.name}-${Date.now()}`
      }));
      setUploadedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const isFormComplete = company && driverName && (loadNum || bolNum) && puCity && puState && delCity && delState && bolType && uploadedFiles.length > 0;

  const handleSubmit = () => {
    if (!isFormComplete) {
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

  // ✅ EXPERT CSS: Tactical styling for inputs and black-background dropdowns
  const tacticalInput = `w-full bg-zinc-950/90 border border-zinc-800 p-3 text-xs rounded-lg outline-none transition-all duration-300 text-white placeholder-zinc-700 focus:border-zinc-500 appearance-none`;
  const labelStyle = `text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 ml-1 ${brandColor}`;

  if (isLocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 font-orbitron overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:30px_30px]"></div>
        <div className="z-10 flex flex-col md:flex-row items-center gap-12 max-w-2xl w-full">
          <div className="flex flex-col items-center space-y-6">
            <h1 className="text-white text-xl font-black tracking-[0.5em] uppercase">Auth-Shield</h1>
            <button onMouseDown={startAuthSequence} onTouchStart={startAuthSequence} className={`relative w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all ${isAuthenticating ? 'border-cyan-500 shadow-[0_0_50px_cyan] scale-105' : 'border-zinc-800 hover:border-zinc-700'}`}>
               <svg className={`w-16 h-16 ${isAuthenticating ? 'text-cyan-500' : 'text-zinc-700'} transition-colors duration-500`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
               {isAuthenticating && <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>}
            </button>
            <p className="text-zinc-600 text-[8px] uppercase tracking-widest text-center">Biometric Verification Required</p>
          </div>
          <div className="flex-1 w-full space-y-4">
            <div className={`transition-all duration-500 h-32 flex flex-col justify-center space-y-2 font-mono text-[9px] ${isAuthenticating ? 'opacity-100' : 'opacity-0'}`}>
              <div className={authStage >= 1 ? 'text-cyan-500' : 'text-zinc-800'}>{"> KERNEL INIT"}</div>
              <div className={authStage >= 2 ? 'text-cyan-500' : 'text-zinc-800'}>{"> PROXY_v4.5 READY"}</div>
              <div className={authStage >= 3 ? 'text-cyan-500' : 'text-zinc-800'}>{"> SCANNING_ID..."}</div>
              <div className={authStage >= 4 ? 'text-green-500' : 'text-zinc-800'}>{authStage >= 4 ? "> SESSION_AUTHORIZED" : "> AUTHENTICATING..."}</div>
            </div>
            <div className="bg-red-950/10 border border-red-900/50 p-4 rounded-xl border-l-4 border-l-red-600">
              <p className="text-zinc-500 text-[8px] font-bold uppercase tracking-widest leading-relaxed">
                <span className="text-red-600">WARNING:</span> UNAUTHORIZED DATA EXTRACTION IS LOGGED BY GEOLOCATION AND IP PROTOCOL.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#020202] text-white pb-20 relative font-orbitron overflow-hidden`}>
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${shake ? 'opacity-40 animate-pulse' : 'opacity-10'}`} 
           style={{ backgroundImage: `linear-gradient(${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px), linear-gradient(90deg, ${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 p-5 max-w-xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-zinc-900 pb-6">
          <div className="flex items-center gap-4">
            {isGLX ? <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center font-black text-black text-xl shadow-[0_0_15px_rgba(34,197,94,0.4)]">G</div> : 
             isBST ? <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center font-black text-white text-xl shadow-[0_0_15px_rgba(59,130,246,0.4)]">B</div> : 
             <div className="w-12 h-12 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-700">?</div>}
            <div className="space-y-1">
               <h1 className={`text-xl font-black tracking-widest uppercase ${brandColor}`}>Terminal v5.0</h1>
               <p className="text-[7px] text-zinc-500 tracking-[0.4em]">ENCRYPTED LOGISTICS UPLINK</p>
            </div>
          </div>
        </header>

        {/* SECTION 01: IDENTITY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`flex flex-col p-3 rounded-xl border border-zinc-900 transition-all ${company ? brandBg : ''}`}>
            <div className="flex items-center mb-1"><label className={labelStyle}>Carrier Identity</label><StatusNode active={!!company} /></div>
            <select className={tacticalInput} style={{ backgroundColor: '#000' }} value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="" style={{ color: '#555' }}>SELECT FLEET...</option>
              <option value="GLX">GREENLEAF XPRESS (GLX)</option>
              <option value="BST">BST EXPEDITE (BST)</option>
            </select>
          </div>
          <div className={`flex flex-col p-3 rounded-xl border border-zinc-900 transition-all ${driverName ? brandBg : ''}`}>
            <div className="flex items-center mb-1"><label className={labelStyle}>Operator Full Name</label><StatusNode active={!!driverName} /></div>
            <input type="text" placeholder="ENTER NAME" className={tacticalInput} value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>
        </div>

        {/* SECTION 02: SHIPMENT */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`flex flex-col p-3 rounded-xl border border-zinc-900 transition-all ${loadNum ? brandBg : ''}`}>
            <div className="flex items-center mb-1"><label className={labelStyle}>Load Ref #</label><StatusNode active={!!loadNum} /></div>
            <input type="text" placeholder="LOAD ID" className={tacticalInput} value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
          </div>
          <div className={`flex flex-col p-3 rounded-xl border border-zinc-900 transition-all ${bolNum ? brandBg : ''}`}>
            <div className="flex items-center mb-1"><label className={labelStyle}>BOL Ref #</label><StatusNode active={!!bolNum} /></div>
            <input type="text" placeholder="BOL ID" className={tacticalInput} value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
          </div>
        </div>

        {/* SECTION 03: ROUTE */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
             <div className={`col-span-2 flex flex-col p-3 rounded-xl border border-zinc-900 transition-all ${puCity ? brandBg : ''}`}>
               <div className="flex items-center mb-1"><label className={labelStyle}>Pickup City</label><StatusNode active={!!puCity} /></div>
               <input type="text" placeholder="CITY" className={tacticalInput} value={puCity} onChange={(e) => setPuCity(e.target.value)} />
             </div>
             <div className={`flex flex-col p-3 rounded-xl border border-zinc-900 transition-all ${puState ? brandBg : ''}`}>
               <div className="flex items-center mb-1"><label className={labelStyle}>ST</label><StatusNode active={!!puState} /></div>
               <select className={tacticalInput} style={{ backgroundColor: '#000' }} value={puState} onChange={(e) => setPuState(e.target.value)}>
                 <option value="">SELECT</option>
                 {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
             <div className={`col-span-2 flex flex-col p-3 rounded-xl border border-zinc-900 transition-all ${delCity ? brandBg : ''}`}>
               <div className="flex items-center mb-1"><label className={labelStyle}>Delivery City</label><StatusNode active={!!delCity} /></div>
               <input type="text" placeholder="CITY" className={tacticalInput} value={delCity} onChange={(e) => setDelCity(e.target.value)} />
             </div>
             <div className={`flex flex-col p-3 rounded-xl border border-zinc-900 transition-all ${delState ? brandBg : ''}`}>
               <div className="flex items-center mb-1"><label className={labelStyle}>ST</label><StatusNode active={!!delState} /></div>
               <select className={tacticalInput} style={{ backgroundColor: '#000' }} value={delState} onChange={(e) => setDelState(e.target.value)}>
                 <option value="">SELECT</option>
                 {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
        </div>

        {/* SECTION 04: IMAGING */}
        <div className={`bg-zinc-950/40 border-2 border-dashed p-6 rounded-2xl text-center transition-all ${uploadedFiles.length > 0 ? (isGLX ? 'border-green-500/50' : 'border-blue-500/50') : 'border-zinc-800'}`}>
           <h2 className={`text-[9px] font-black uppercase tracking-widest mb-6 ${brandColor}`}>Document Imaging System</h2>
           <div className="flex justify-center gap-12 mb-8">
              <button onClick={() => fileInputRef.current?.click()} className={`${brandColor} text-[10px] font-black uppercase flex flex-col items-center gap-3`}><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg> Gallery</button>
              <button onClick={() => cameraInputRef.current?.click()} className={`${brandColor} text-[10px] font-black uppercase flex flex-col items-center gap-3`}><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg> Camera</button>
           </div>
           
           <div className="flex justify-center gap-6 text-[9px] text-zinc-500 font-bold uppercase border-t border-zinc-900 pt-6 mb-4">
              <label className={`flex items-center gap-2 cursor-pointer transition-all ${bolType === 'pickup' ? 'text-white' : ''}`}><input type="radio" name="bolType" className="accent-white" onChange={() => setBolType('pickup')}/> PU BOL</label>
              <label className={`flex items-center gap-2 cursor-pointer transition-all ${bolType === 'delivery' ? 'text-white' : ''}`}><input type="radio" name="bolType" className="accent-white" onChange={() => setBolType('delivery')}/> DEL POD</label>
           </div>

           {uploadedFiles.length > 0 && (
             <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-6">
               {uploadedFiles.map(f => (
                 <div key={f.id} className="relative aspect-square rounded-xl border border-zinc-800 overflow-hidden group">
                   <img src={f.preview} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="doc" />
                   {/* ✅ SCANNER: Set to only pulse 3 times using animation-iteration-count */}
                   <div className={`absolute top-0 left-0 w-full h-[2px] animate-scan-limited ${isGLX ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-cyan-500 shadow-[0_0_10px_cyan]'}`}></div>
                   <button onClick={() => setUploadedFiles(prev => prev.filter(item => item.id !== f.id))} className="absolute top-1 right-1 bg-red-600 text-white text-[8px] p-1.5 rounded-full font-black z-30 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">✕</button>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* SECTION 05: LOAD ASSETS */}
        <div className={`bg-zinc-950/40 border border-zinc-900 p-6 rounded-2xl space-y-4`}>
          <div className="flex justify-between items-center"><h2 className={`text-[9px] font-black uppercase tracking-widest ${brandColor}`}>Cargo Asset Documentation</h2><span className="text-[7px] text-zinc-600 uppercase">Optional</span></div>
          <div className="grid grid-cols-2 gap-4">
             <button className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl text-[9px] font-black uppercase text-zinc-500 flex flex-col items-center gap-2 hover:text-white transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.172-1.172a4 4 0 015.656 0l1.172 1.172a4 4 0 010 5.656l-1.172 1.172a4 4 0 01-5.656 0L11 13.142"/></svg> Loaded Cargo</button>
             <button className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl text-[9px] font-black uppercase text-zinc-500 flex flex-col items-center gap-2 hover:text-white transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg> Asset Video</button>
          </div>
        </div>

        <button onClick={handleSubmit} className={`w-full py-6 rounded-xl font-black text-xs uppercase tracking-[0.5em] transition-all relative overflow-hidden ${shake ? 'animate-shake bg-red-600' : isFormComplete ? (isGLX ? 'bg-green-600 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'bg-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.3)]') : 'bg-zinc-900 text-zinc-700'}`}>
          {isSubmitting && <div className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>}
          <span className="relative z-10">{isSubmitting ? 'TRANSMITTING...' : 'Execute Transmission'}</span>
        </button>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/98 z-50 flex flex-col items-center justify-center p-8 backdrop-blur-3xl animate-in zoom-in-95 duration-500">
           <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center text-4xl mb-8 ${isGLX ? 'border-green-500 text-green-500' : 'border-blue-500 text-blue-500'}`}>✓</div>
           <h2 className="text-2xl font-black uppercase tracking-[0.4em] mb-12 text-white">Transmission Verified</h2>
           <button onClick={() => window.location.reload()} className={`w-full max-w-xs py-4 border-2 text-[11px] font-black uppercase tracking-[0.3em] ${brandColor} hover:bg-white/5`}>Initiate New Protocol</button>
        </div>
      )}

      <style>{`
        /* ✅ Limited Scan: Pulse 3 times then hide */
        @keyframes scan-limited { 
          0% { top: 0; opacity: 0; } 
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; } 
        }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 60% { transform: translateX(8px); } }
        
        .animate-scan-limited { 
          animation: scan-limited 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; 
          animation-iteration-count: 3;
        }
        .animate-shake { animation: shake 0.2s linear infinite; }
      `}</style>
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFile} />
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={handleFile} />
    </div>
  );
};

export default App;