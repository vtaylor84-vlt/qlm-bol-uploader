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
  const [logs, setLogs] = useState<string[]>(['> SYSTEM INITIALIZED', '> ENCRYPTION READY']);
  
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
  const brandColor = isGLX ? 'text-green-500 shadow-green-500/50' : isBST ? 'text-blue-400 shadow-blue-400/40' : 'text-cyan-400 shadow-cyan-500/50';
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

  const labelStyle = `text-[9px] font-black uppercase tracking-[0.2em] mb-1 ml-1 ${brandColor}`;
  const inputBase = `bg-zinc-950/80 border p-2.5 text-xs rounded outline-none transition-all duration-300`;

  if (isLocked) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-orbitron overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:30px_30px]"></div>
        <div className="z-10 text-center space-y-10 w-full max-w-sm animate-in fade-in duration-1000">
          <h1 className="text-white text-2xl font-black tracking-[0.5em] uppercase">Security Portal</h1>
          <button onMouseDown={handleAuth} onTouchStart={handleAuth} className={`w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all ${isAuthenticating ? 'border-cyan-500 shadow-[0_0_40px_cyan] scale-110' : 'border-zinc-800 hover:border-zinc-600'}`}>
             <span className="text-4xl">☝️</span>
             {isAuthenticating && <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>}
          </button>
          <div className="bg-zinc-950/50 border border-zinc-900 p-4 rounded text-left">
            <p className="text-zinc-500 text-[8px] font-bold uppercase tracking-widest leading-relaxed">
              <span className="text-zinc-300">NOTICE:</span> BY AUTHENTICATING, YOU CONSENT TO THE LOGGING OF YOUR <span className="text-white">IP ADDRESS, MAC ID, AND GEOLOCATION DATA</span>. UNAUTHORIZED ACCESS IS PROHIBITED.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#020202] text-white pb-12 relative font-orbitron overflow-hidden`}>
      {/* Background Pulse Grid */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${shake ? 'opacity-40 animate-pulse' : 'opacity-10'}`} 
           style={{ backgroundImage: `linear-gradient(${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px), linear-gradient(90deg, ${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 p-4 max-w-xl mx-auto space-y-8">
        <header className="flex justify-between items-end border-b border-zinc-900 pb-4">
          <div className="space-y-1">
             <h1 className={`text-xl font-black tracking-widest uppercase ${brandColor} glowing-text`}>Terminal v3.5</h1>
             <p className="text-[7px] text-zinc-500 tracking-[0.4em]">ENCRYPTED LOGISTICS UPLINK</p>
          </div>
          <div className="text-right text-[9px] text-green-500 font-bold animate-pulse tracking-widest">● LINK_STABLE</div>
        </header>

        {/* SECTION 01: IDENTITY */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className={labelStyle}>Carrier Identity</label>
            <select className={`${inputBase} ${shake && !company ? 'border-red-600' : 'border-zinc-800 focus:border-white'}`} value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="">SELECT FLEET...</option>
              <option value="GLX">GREENLEAF XPRESS</option>
              <option value="BST">BST EXPEDITE</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>Operator Name</label>
            <input type="text" placeholder="ENTER NAME" className={`${inputBase} ${shake && !driverName ? 'border-red-600' : 'border-zinc-800 focus:border-white'}`} value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>
        </div>

        {/* SECTION 02: SHIPMENT DATA */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className={labelStyle}>Reference: Load #</label>
            <input type="text" placeholder="LOAD ID" className={`${inputBase} ${shake && !loadNum && !bolNum ? 'border-red-600' : 'border-zinc-800 focus:border-white'}`} value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>Reference: BOL #</label>
            <input type="text" placeholder="BOL ID" className={`${inputBase} ${shake && !loadNum && !bolNum ? 'border-red-600' : 'border-zinc-800 focus:border-white'}`} value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
          </div>
        </div>

        {/* SECTION 03: ROUTE SPECIFICATIONS (Restored & Enhanced) */}
        <div className="space-y-6">
          <h2 className={`text-[9px] font-black uppercase tracking-[0.3em] border-l-2 pl-2 ${brandColor}`}>Route Specifications</h2>
          <div className="space-y-4">
            {/* Pickup Grid */}
            <div className="grid grid-cols-3 gap-3 items-end">
              <div className="col-span-2 flex flex-col">
                <label className={labelStyle}>Origin: Pickup City</label>
                <input type="text" placeholder="ENTER CITY" className={`${inputBase} ${shake && !puCity ? 'border-red-600' : 'border-zinc-800 focus:border-white'}`} value={puCity} onChange={(e) => setPuCity(e.target.value)} />
              </div>
              <div className="flex flex-col">
                <label className={labelStyle}>State</label>
                <select className={`${inputBase} ${shake && !puState ? 'border-red-600' : 'border-zinc-800'}`} value={puState} onChange={(e) => setPuState(e.target.value)}>
                  <option value="">SELECT STATE</option>
                  {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Delivery Grid */}
            <div className="grid grid-cols-3 gap-3 items-end">
              <div className="col-span-2 flex flex-col">
                <label className={labelStyle}>Dest: Delivery City</label>
                <input type="text" placeholder="ENTER CITY" className={`${inputBase} ${shake && !delCity ? 'border-red-600' : 'border-zinc-800 focus:border-white'}`} value={delCity} onChange={(e) => setDelCity(e.target.value)} />
              </div>
              <div className="flex flex-col">
                <label className={labelStyle}>State</label>
                <select className={`${inputBase} ${shake && !delState ? 'border-red-600' : 'border-zinc-800'}`} value={delState} onChange={(e) => setDelState(e.target.value)}>
                  <option value="">SELECT STATE</option>
                  {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 04: IMAGING SYSTEM (Restored & Enhanced) */}
        <div className={`bg-zinc-950/40 border-2 border-dashed p-6 rounded-xl text-center transition-all ${brandBorder}`}>
           <h2 className={`text-[10px] font-black uppercase tracking-widest mb-4 block ${brandColor}`}>Digital Imaging System</h2>
           
           {/* ✅ Document Type Selectors (Restored under Header) */}
           <div className="flex justify-center gap-8 text-[9px] text-zinc-500 font-bold uppercase border-b border-zinc-900 pb-4 mb-6">
              <label className={`flex items-center gap-2 cursor-pointer transition-colors ${bolType === 'pickup' ? 'text-white' : ''}`}>
                <input type="radio" name="bolType" onChange={() => setBolType('pickup')}/> PICKUP BOL
              </label>
              <label className={`flex items-center gap-2 cursor-pointer transition-colors ${bolType === 'delivery' ? 'text-white' : ''}`}>
                <input type="radio" name="bolType" onChange={() => setBolType('delivery')}/> DELIVERY POD
              </label>
           </div>

           <div className="flex justify-center gap-10 mb-6">
              <button onClick={() => fileInputRef.current?.click()} className={`${brandColor} text-[10px] font-black uppercase tracking-widest hover:brightness-125`}>📁 Browse Gallery</button>
              <button onClick={() => cameraInputRef.current?.click()} className={`${brandColor} text-[10px] font-black uppercase tracking-widest hover:brightness-125`}>📷 Scan Camera</button>
           </div>
           
           {uploadedFiles.length > 0 && (
             <div className="grid grid-cols-4 gap-2 mt-2">
               {uploadedFiles.map(f => (
                 <div key={f.id} className="relative aspect-square rounded overflow-hidden border border-zinc-800 group">
                   <img src={f.preview} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="doc" />
                   <div className={`absolute top-0 left-0 w-full h-[1px] animate-scan ${isGLX ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-cyan-500 shadow-[0_0_10px_cyan]'}`}></div>
                   <button onClick={() => setUploadedFiles(prev => prev.filter(item => item.id !== f.id))} className="absolute top-0 right-0 bg-red-600 text-[8px] p-1 px-1.5 font-black z-30 opacity-0 group-hover:opacity-100 transition-opacity">X</button>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* ✅ ADDED: SECTION 05: FREIGHT & CARGO VISUALS */}
        <div className={`bg-zinc-950/40 border border-zinc-900 p-5 rounded-xl space-y-4`}>
          <div className="flex justify-between items-center">
             <h2 className={`text-[9px] font-black uppercase tracking-widest ${brandColor}`}>Freight & Media Module</h2>
             <span className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest">Optional Uploads</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <button className="bg-zinc-900 border border-zinc-800 p-3 rounded text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">📷 Cargo Photo</button>
             <button className="bg-zinc-900 border border-zinc-800 p-3 rounded text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">🎥 Load Video</button>
          </div>
        </div>

        {/* TERMINAL CONSOLE */}
        <div className="bg-[#050505] border border-zinc-900 p-3 rounded font-mono text-[8px] text-zinc-600 h-20 overflow-hidden shadow-inner">
           {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>

        <button 
          onClick={handleSubmit}
          className={`w-full py-5 rounded font-black text-xs uppercase tracking-[0.5em] transition-all relative overflow-hidden ${shake ? 'animate-shake bg-red-600' : isFormComplete ? (isGLX ? 'bg-green-600 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'bg-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.3)]') : 'bg-zinc-900 text-zinc-700'}`}
        >
          {isSubmitting && <div className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>}
          <span className="relative z-10">{isSubmitting ? `TRANSMITTING... ${uploadProgress}%` : 'Execute Transmission'}</span>
        </button>
      </div>

      {/* SUCCESS OVERLAY */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/98 z-50 flex flex-col items-center justify-center p-8 backdrop-blur-3xl animate-in zoom-in-95 duration-300">
           <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-3xl mb-6 ${isGLX ? 'border-green-500 text-green-500' : 'border-blue-500 text-blue-500'}`}>✓</div>
           <h2 className="text-xl font-black uppercase tracking-[0.3em] mb-2">Transmission Success</h2>
           <p className="text-zinc-500 text-[9px] uppercase tracking-widest mb-10 text-center">Cloud Archive Synced with Master Spreadsheet</p>
           <button onClick={() => window.location.reload()} className={`w-full max-w-xs py-3 border text-[10px] font-black uppercase tracking-widest ${brandColor} hover:bg-white/5`}>Initialize New Task</button>
        </div>
      )}

      <style>{`
        @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 60% { transform: translateX(6px); } }
        .animate-scan { animation: scan 2s linear infinite; }
        .animate-shake { animation: shake 0.2s linear infinite; }
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