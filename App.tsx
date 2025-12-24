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
  const [logs, setLogs] = useState<string[]>(['> KERNEL v2.5 BOOT...', '> SECURE UPLINK READY']);
  
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
    setTimeout(() => { setIsLocked(false); addLog("ACCESS GRANTED: WELCOME OPERATOR"); }, 1800);
  };

  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const brandColor = isGLX ? 'text-green-500 shadow-green-500/50' : isBST ? 'text-blue-400 shadow-blue-400/40' : 'text-cyan-400 shadow-cyan-500/50';
  const brandBorder = isGLX ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : isBST ? 'border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-zinc-800';

  const isFormComplete = company && driverName && (loadNum || bolNum) && puCity && puState && delCity && delState && bolType && uploadedFiles.length > 0;

  const handleSubmit = () => {
    if (!isFormComplete) {
      setShake(true);
      addLog("ERROR: DATA FIELDS INCOMPLETE");
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

  // Modern Tactical Field Components
  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ml-1 ${brandColor}`}>{children}</label>
  );

  const TechInput = (props: any) => (
    <input {...props} className={`bg-zinc-950/80 border p-2 text-xs rounded outline-none transition-all duration-300 ${shake && !props.value ? 'border-red-600 animate-pulse' : 'border-zinc-800 focus:border-white'}`} />
  );

  if (isLocked) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-orbitron overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:30px_30px]"></div>
        <div className="z-10 text-center space-y-10 w-full max-w-sm">
          <h1 className="text-white text-2xl font-black tracking-[0.5em] uppercase">Security Protocol</h1>
          <button onMouseDown={handleAuth} onTouchStart={handleAuth} className={`w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all ${isAuthenticating ? 'border-cyan-500 shadow-[0_0_40px_cyan] scale-110' : 'border-zinc-800'}`}>
             <span className="text-4xl">☝️</span>
             {isAuthenticating && <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>}
          </button>
          <p className="text-zinc-600 text-[9px] uppercase tracking-widest leading-relaxed">System Locked. Hold Biometric Pad to access Fleet Uplink Terminal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-12 relative font-orbitron overflow-hidden">
      {/* Tactical Background Grid */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${shake ? 'opacity-40 animate-pulse' : 'opacity-10'}`} 
           style={{ backgroundImage: `linear-gradient(${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px), linear-gradient(90deg, ${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 p-4 max-w-xl mx-auto space-y-8">
        <header className="flex justify-between items-end border-b border-zinc-900 pb-4">
          <div className="space-y-1">
             <h1 className={`text-xl font-black tracking-widest uppercase ${brandColor}`}>Terminal v2.5</h1>
             <p className="text-[7px] text-zinc-500 tracking-[0.4em]">ENCRYPTED LOAD DATA UPLINK CHANNEL</p>
          </div>
          <div className="text-right"><span className="text-green-500 text-[9px] animate-pulse">● ONLINE</span></div>
        </header>

        {/* SECTION 01: IDENTITY */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <FieldLabel>Carrier ID</FieldLabel>
            <select className={`bg-zinc-950/80 border p-2 text-xs rounded outline-none ${shake && !company ? 'border-red-600 animate-pulse' : 'border-zinc-800 focus:border-white'}`} value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="">SELECT...</option>
              <option value="GLX">GLX (GREENLEAF)</option>
              <option value="BST">BST (EXPEDITE)</option>
            </select>
          </div>
          <div className="flex flex-col">
            <FieldLabel>Operator Name</FieldLabel>
            <TechInput placeholder="FULL NAME" value={driverName} onChange={(e:any) => setDriverName(e.target.value)} />
          </div>
        </div>

        {/* SECTION 02: REFERENCE DATA */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <FieldLabel>Load Ref #</FieldLabel>
            <TechInput placeholder="LOAD ID" value={loadNum} onChange={(e:any) => setLoadNum(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <FieldLabel>BOL Ref #</FieldLabel>
            <TechInput placeholder="BOL ID" value={bolNum} onChange={(e:any) => setBolNum(e.target.value)} />
          </div>
        </div>

        {/* ✅ ADDED: SECTION 03: NAVIGATION MODULES (City & State) */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="col-span-2 flex flex-col">
              <FieldLabel>Origin: Pickup City</FieldLabel>
              <TechInput placeholder="CITY NAME" value={puCity} onChange={(e:any) => setPuCity(e.target.value)} />
            </div>
            <div className="flex flex-col">
              <FieldLabel>State</FieldLabel>
              <select className={`bg-zinc-950/80 border p-2 text-xs rounded outline-none ${shake && !puState ? 'border-red-600 animate-pulse' : 'border-zinc-800'}`} value={puState} onChange={(e) => setPuState(e.target.value)}>
                <option value=""></option>
                {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="col-span-2 flex flex-col">
              <FieldLabel>Dest: Delivery City</FieldLabel>
              <TechInput placeholder="CITY NAME" value={delCity} onChange={(e:any) => setDelCity(e.target.value)} />
            </div>
            <div className="flex flex-col">
              <FieldLabel>State</FieldLabel>
              <select className={`bg-zinc-950/80 border p-2 text-xs rounded outline-none ${shake && !delState ? 'border-red-600 animate-pulse' : 'border-zinc-800'}`} value={delState} onChange={(e) => setDelState(e.target.value)}>
                <option value=""></option>
                {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 04: IMAGING INTERFACE */}
        <div className={`bg-zinc-950/40 border-2 border-dashed p-6 rounded-xl text-center transition-all ${brandBorder}`}>
           <FieldLabel>Digital Imaging System</FieldLabel>
           <div className="flex justify-center gap-10 mt-4 mb-6">
              <button onClick={() => fileInputRef.current?.click()} className={`${brandColor} text-[10px] font-black uppercase tracking-widest`}>📁 Files</button>
              <button onClick={() => cameraInputRef.current?.click()} className={`${brandColor} text-[10px] font-black uppercase tracking-widest`}>📷 Camera</button>
           </div>
           
           <div className="flex justify-center gap-6 text-[9px] text-zinc-500 font-bold uppercase border-t border-zinc-900 pt-4">
              <label className="flex items-center gap-2"><input type="radio" name="bolType" onChange={() => setBolType('pickup')}/> PU BOL</label>
              <label className="flex items-center gap-2"><input type="radio" name="bolType" onChange={() => setBolType('delivery')}/> DEL POD</label>
           </div>

           {uploadedFiles.length > 0 && (
             <div className="grid grid-cols-4 gap-2 mt-6">
               {uploadedFiles.map(f => (
                 <div key={f.id} className="relative aspect-square rounded overflow-hidden border border-zinc-800">
                   <img src={f.preview} className="w-full h-full object-cover opacity-60" alt="doc" />
                   <div className={`absolute top-0 left-0 w-full h-[1px] animate-scan ${isGLX ? 'bg-green-500' : 'bg-cyan-500 shadow-[0_0_5px_cyan]'}`}></div>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* LOG CONSOLE */}
        <div className="bg-[#050505] border border-zinc-900 p-3 rounded font-mono text-[8px] text-zinc-600 h-20 overflow-hidden shadow-inner">
           {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>

        <button 
          onClick={handleSubmit}
          className={`w-full py-5 rounded font-black text-xs uppercase tracking-[0.5em] transition-all relative overflow-hidden ${shake ? 'animate-shake bg-red-600' : isFormComplete ? (isGLX ? 'bg-green-600' : 'bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.3)]') : 'bg-zinc-900 text-zinc-700'}`}
        >
          {isSubmitting && <div className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>}
          <span className="relative z-10">{isSubmitting ? `Transmitting... ${uploadProgress}%` : 'Execute Transmission'}</span>
        </button>
      </div>

      {/* SUCCESS DIALOG */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/98 z-50 flex items-center justify-center p-8 backdrop-blur-2xl">
           <div className={`border-2 p-10 rounded-2xl text-center space-y-6 max-w-sm ${isGLX ? 'border-green-500 shadow-green-500/20' : 'border-blue-500 shadow-blue-400/20'}`}>
              <div className={`text-4xl mb-4 ${isGLX ? 'text-green-500' : 'text-blue-500'}`}>✓</div>
              <h2 className="text-xl font-black uppercase tracking-widest text-white">Upload Verified</h2>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Master Spreadsheet Sync Successful</p>
              <button onClick={() => window.location.reload()} className={`w-full py-3 border text-[10px] font-black uppercase tracking-widest ${brandColor} hover:bg-white/5`}>Initiate New Task</button>
           </div>
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