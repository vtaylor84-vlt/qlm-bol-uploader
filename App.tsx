import React, { useState, useRef, useEffect } from 'react';

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

const App = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
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
  const [logs, setLogs] = useState<string[]>(['> SYSTEM INITIALIZED', '> SECURE PROTOCOL v4.0 ACTIVE']);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    return () => uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
  }, [uploadedFiles]);

  const addLog = (msg: string) => setLogs(prev => [...prev.slice(-3), `> ${msg.toUpperCase()}`]);

  const handleAuth = () => {
    setIsAuthenticating(true);
    addLog("SCANNING BIOMETRICS...");
    setTimeout(() => { setIsLocked(false); addLog("ACCESS GRANTED: IP LOGGED"); }, 1800);
  };

  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const brandColor = isGLX ? 'text-green-500 shadow-green-500/50' : isBST ? 'text-blue-400 shadow-blue-400/50' : 'text-cyan-400 shadow-cyan-500/50';
  const brandBorder = isGLX ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : isBST ? 'border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-zinc-800';

  const isFormComplete = company && driverName && (loadNum || bolNum) && puCity && puState && delCity && delState && bolType && uploadedFiles.length > 0;

  const handleSubmit = () => {
    if (!isFormComplete) {
      setShake(true);
      addLog("CRITICAL ERROR: DATA INCOMPLETE");
      setTimeout(() => setShake(false), 800);
      return;
    }
    setIsSubmitting(true);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 10;
      setUploadProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        audioRef.current?.play().catch(() => {});
        setTimeout(() => setShowSuccess(true), 500);
      }
    }, 150);
  };

  const labelStyle = `text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 ml-1 ${brandColor}`;
  const inputBase = `bg-zinc-950/90 border p-3 text-xs rounded-lg outline-none transition-all duration-300`;

  if (isLocked) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-orbitron overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:30px_30px]"></div>
        <div className="z-10 text-center space-y-10 w-full max-w-sm animate-in fade-in duration-1000">
          <div className="space-y-4">
             {/* Dynamic Logo Placeholder during Auth */}
             <div className="w-16 h-1 w-24 bg-zinc-800 mx-auto rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-cyan-500 animate-pulse"></div>
             </div>
             <h1 className="text-white text-2xl font-black tracking-[0.5em] uppercase">Security Portal</h1>
          </div>
          <button onMouseDown={handleAuth} onTouchStart={handleAuth} className={`w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all ${isAuthenticating ? 'border-cyan-500 shadow-[0_0_40px_cyan] scale-110' : 'border-zinc-800 hover:border-zinc-600'}`}>
             <span className="text-4xl">☝️</span>
             {isAuthenticating && <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>}
          </button>
          <div className="bg-zinc-950/50 border border-zinc-900 p-5 rounded-xl text-left border-l-4 border-l-red-600">
            <p className="text-zinc-500 text-[8px] font-bold uppercase tracking-widest leading-relaxed">
              <span className="text-red-600">LEGAL SEC-ID:</span> BY AUTHENTICATING, YOU CONSENT TO RECOGNITION OF YOUR <span className="text-white">IP ADDRESS, MAC ID, AND GEOLOCATION</span>. ACCESS IS LOGGED PER FED-SEC-902.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#020202] text-white pb-20 relative font-orbitron overflow-hidden`}>
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${shake ? 'opacity-40 animate-pulse' : 'opacity-10'}`} 
           style={{ backgroundImage: `linear-gradient(${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px), linear-gradient(90deg, ${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 p-5 max-w-2xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-zinc-900 pb-6">
          <div className="flex items-center gap-4">
            {/* ✅ DYNAMIC BRAND LOGOS */}
            {isGLX ? (
               <div className="w-12 h-12 bg-green-500 rounded flex items-center justify-center font-black text-black text-xl shadow-[0_0_20px_rgba(34,197,94,0.5)]">GLX</div>
            ) : isBST ? (
               <div className="w-12 h-12 bg-blue-500 rounded flex items-center justify-center font-black text-white text-xl shadow-[0_0_20px_rgba(59,130,246,0.5)]">BST</div>
            ) : (
               <div className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center font-black text-zinc-500 text-xl border border-zinc-700">?</div>
            )}
            <div className="space-y-1">
               <h1 className={`text-xl font-black tracking-widest uppercase ${brandColor} glowing-text`}>Terminal v4.0</h1>
               <p className="text-[7px] text-zinc-500 tracking-[0.4em]">SECURE LOGISTICS UPLINK CHANNEL</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-green-500 text-[9px] font-black animate-pulse tracking-widest">● LINK_STABLE</span>
          </div>
        </header>

        {/* SECTION 01: IDENTITY MODULE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className={labelStyle}>Step 01: Choose Fleet Profile</label>
            <select className={`${inputBase} ${shake && !company ? 'border-red-600' : 'border-zinc-800 focus:border-white'}`} value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="">SELECT CARRIER PROFILE...</option>
              <option value="GLX">GREENLEAF XPRESS (GLX)</option>
              <option value="BST">BST EXPEDITE (BST)</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>Step 02: Operator Full Name</label>
            <input type="text" placeholder="ENTER DRIVER NAME" className={`${inputBase} ${shake && !driverName ? 'border-red-600' : 'border-zinc-800 focus:border-white'}`} value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>
        </div>

        {/* SECTION 02: SHIPMENT REFERENCES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className={labelStyle}>Reference: Load Number</label>
            <input type="text" placeholder="ENTER LOAD ID" className={`${inputBase} ${shake && !loadNum && !bolNum ? 'border-red-600' : 'border-zinc-800 focus:border-white'}`} value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>Reference: BOL Number</label>
            <input type="text" placeholder="ENTER BOL ID" className={`${inputBase} ${shake && !loadNum && !bolNum ? 'border-red-600' : 'border-zinc-800 focus:border-white'}`} value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
          </div>
        </div>

        {/* SECTION 03: ROUTE SPECIFICATIONS (City & State) */}
        <div className="space-y-6">
          <h2 className={`text-[10px] font-black uppercase tracking-[0.3em] border-l-2 pl-3 ${brandColor}`}>Section 03: Route Navigation Specs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 flex flex-col">
                <label className={labelStyle}>Origin: Pickup City</label>
                <input type="text" placeholder="CITY" className={`${inputBase} ${shake && !puCity ? 'border-red-600' : 'border-zinc-800'}`} value={puCity} onChange={(e) => setPuCity(e.target.value)} />
              </div>
              <div className="flex flex-col">
                <label className={labelStyle}>ST</label>
                <select className={`${inputBase} ${shake && !puState ? 'border-red-600' : 'border-zinc-800'}`} value={puState} onChange={(e) => setPuState(e.target.value)}>
                  <option value="">---</option>
                  {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 flex flex-col">
                <label className={labelStyle}>Dest: Delivery City</label>
                <input type="text" placeholder="CITY" className={`${inputBase} ${shake && !delCity ? 'border-red-600' : 'border-zinc-800'}`} value={delCity} onChange={(e) => setDelCity(e.target.value)} />
              </div>
              <div className="flex flex-col">
                <label className={labelStyle}>ST</label>
                <select className={`${inputBase} ${shake && !delState ? 'border-red-600' : 'border-zinc-800'}`} value={delState} onChange={(e) => setDelState(e.target.value)}>
                  <option value="">---</option>
                  {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 04: IMAGING MODULE */}
        <div className={`bg-zinc-950/50 border-2 border-dashed p-8 rounded-2xl text-center transition-all ${brandBorder}`}>
           <h2 className={`text-[11px] font-black uppercase tracking-widest mb-6 block ${brandColor}`}>Section 04: Digital Imaging Uplink</h2>
           
           <div className="flex justify-center gap-10 text-[9px] text-zinc-500 font-bold uppercase border-b border-zinc-900 pb-5 mb-8">
              <label className={`flex items-center gap-2 cursor-pointer transition-all ${bolType === 'pickup' ? 'text-white scale-110' : 'opacity-40'}`}>
                <input type="radio" name="bolType" className="hidden" onChange={() => setBolType('pickup')}/> 📄 PICKUP BOL
              </label>
              <label className={`flex items-center gap-2 cursor-pointer transition-all ${bolType === 'delivery' ? 'text-white scale-110' : 'opacity-40'}`}>
                <input type="radio" name="bolType" className="hidden" onChange={() => setBolType('delivery')}/> 📄 DELIVERY POD
              </label>
           </div>

           <div className="flex justify-center gap-12 mb-8">
              <button onClick={() => fileInputRef.current?.click()} className={`${brandColor} text-[10px] font-black uppercase tracking-widest hover:brightness-125`}>📁 Browse Files</button>
              <button onClick={() => cameraInputRef.current?.click()} className={`${brandColor} text-[10px] font-black uppercase tracking-widest hover:brightness-125`}>📷 Scan Document</button>
           </div>
           
           {uploadedFiles.length > 0 && (
             <div className="grid grid-cols-4 gap-3 mt-4">
               {uploadedFiles.map(f => (
                 <div key={f.id} className="relative aspect-[3/4] rounded-lg border border-zinc-800 overflow-hidden group">
                   <img src={f.preview} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="doc" />
                   <div className={`absolute top-0 left-0 w-full h-[1px] animate-scan ${isGLX ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-cyan-500 shadow-[0_0_10px_cyan]'}`}></div>
                   <button onClick={() => setUploadedFiles(prev => prev.filter(item => item.id !== f.id))} className="absolute top-0 right-0 bg-red-600 text-[8px] p-1 px-1.5 font-black z-30">X</button>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* SECTION 05: FREIGHT/VIDEO MODULE (Restored) */}
        <div className={`bg-zinc-950/50 border border-zinc-900 p-6 rounded-2xl space-y-6`}>
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
             <h2 className={`text-[10px] font-black uppercase tracking-widest ${brandColor}`}>Freight & Media Vault</h2>
             <span className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest">Optional Forensics</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <button className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:border-zinc-600 transition-all flex flex-col items-center gap-2">
                <span className="text-xl">📦</span> Cargo Scan
             </button>
             <button className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:border-zinc-600 transition-all flex flex-col items-center gap-2">
                <span className="text-xl">📹</span> Load Video
             </button>
          </div>
        </div>

        {/* LOG CONSOLE */}
        <div className="bg-[#050505] border border-zinc-900 p-4 rounded-xl font-mono text-[8px] text-zinc-600 h-24 overflow-hidden shadow-inner border-l-2 border-l-zinc-700">
           {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>

        <button 
          onClick={handleSubmit}
          className={`w-full py-6 rounded-xl font-black text-xs uppercase tracking-[0.5em] transition-all relative overflow-hidden ${shake ? 'animate-shake bg-red-600' : isFormComplete ? (isGLX ? 'bg-green-600 shadow-[0_0_40px_rgba(34,197,94,0.3)]' : 'bg-blue-600 shadow-[0_0_40px_rgba(59,130,246,0.3)]') : 'bg-zinc-900 text-zinc-700'}`}
        >
          {isSubmitting && <div className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>}
          <span className="relative z-10">{isSubmitting ? `TRANSMITTING DATA... ${uploadProgress}%` : 'Execute Final Transmission'}</span>
        </button>
      </div>

      {/* SUCCESS DIALOG */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/98 z-50 flex flex-col items-center justify-center p-8 backdrop-blur-3xl animate-in fade-in duration-500">
           <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center text-4xl mb-8 ${isGLX ? 'border-green-500 text-green-500' : 'border-blue-500 text-blue-500'}`}>✓</div>
           <h2 className="text-2xl font-black uppercase tracking-[0.4em] mb-3 text-white">Transmission Success</h2>
           <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] mb-12 text-center max-w-xs leading-loose">Data Synchronized with Master Cloud Archive. Transmission Hash: {Math.random().toString(36).substring(7).toUpperCase()}</p>
           <button onClick={() => window.location.reload()} className={`w-full max-w-xs py-4 border-2 text-[11px] font-black uppercase tracking-[0.3em] ${brandColor} hover:bg-white/5`}>Initiate New Protocol</button>
        </div>
      )}

      <style>{`
        @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 60% { transform: translateX(8px); } }
        .animate-scan { animation: scan 2s linear infinite; }
        .animate-shake { animation: shake 0.2s linear infinite; }
        .glowing-text { text-shadow: 0 0 10px currentColor; }
      `}</style>
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => {
        if(e.target.files) setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!).map(file => ({ file, preview: URL.createObjectURL(file), id: Math.random().toString() }))])
      }} />
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={(e) => {
        if(e.target.files) setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!).map(file => ({ file, preview: URL.createObjectURL(file), id: Math.random().toString() }))])
      }} />
    </div>
  );
};

export default App;