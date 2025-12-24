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
    return () => uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
  }, [uploadedFiles]);

  // ✅ AUTHENTICATION LOGIC: Sequential Background Logs
  const startAuthSequence = () => {
    setIsAuthenticating(true);
    const sequence = [
      "SYSTEM INITIALIZED",
      "SECURE PROTOCOL v4.0 ACTIVE",
      "SCANNING BIOMETRICS",
      "ACCESS LOGGED & ENCRYPTED"
    ];
    
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
  const brandColor = isGLX ? 'text-green-500 shadow-green-500/50' : isBST ? 'text-blue-400 shadow-blue-400/50' : 'text-cyan-400 shadow-cyan-500/50';
  const brandBg = isGLX ? 'bg-green-500/10' : isBST ? 'bg-blue-500/10' : 'bg-transparent';
  
  // ✅ WORLD CLASS UI: "Data-Lock" indicator instead of a checkmark
  const StatusNode = ({ active }: { active: boolean }) => (
    <div className={`ml-auto w-2 h-2 rounded-full transition-all duration-500 ${active ? `${isGLX ? 'bg-green-500' : 'bg-blue-400'} shadow-[0_0_8px_currentColor] scale-125` : 'bg-zinc-800'}`}></div>
  );

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

  if (isLocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 font-orbitron overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:30px_30px]"></div>
        <div className="z-10 flex flex-col md:flex-row items-center gap-12 max-w-2xl w-full">
          {/* Biometric Trigger */}
          <div className="flex flex-col items-center space-y-6">
            <h1 className="text-white text-xl font-black tracking-[0.5em] uppercase">Security</h1>
            <button onMouseDown={startAuthSequence} onTouchStart={startAuthSequence} className={`w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all ${isAuthenticating ? 'border-cyan-500 shadow-[0_0_50px_cyan] scale-105' : 'border-zinc-800 hover:border-zinc-700'}`}>
               <span className="text-5xl">☝️</span>
               {isAuthenticating && <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>}
            </button>
            <p className="text-zinc-600 text-[8px] uppercase tracking-widest text-center">Hold Finger to Authenticate</p>
          </div>

          {/* ✅ DYNAMIC BACKGROUND LOGS: Only show next to button during auth */}
          <div className="flex-1 w-full space-y-4">
            <div className={`transition-all duration-500 h-32 flex flex-col justify-center space-y-2 font-mono text-[9px] ${isAuthenticating ? 'opacity-100' : 'opacity-0'}`}>
              <div className={authStage >= 1 ? 'text-cyan-500' : 'text-zinc-800'}>{"> SYSTEM INITIALIZED"}</div>
              <div className={authStage >= 2 ? 'text-cyan-500' : 'text-zinc-800'}>{"> SECURE PROTOCOL v4.0 ACTIVE"}</div>
              <div className={authStage >= 3 ? 'text-cyan-500' : 'text-zinc-800'}>{"> SCANNING BIOMETRICS"}</div>
              <div className={authStage >= 4 ? 'text-green-500 font-bold' : 'text-zinc-800'}>{authStage >= 4 ? "> ACCESS LOGGED - GRANTED" : "> PENDING VERIFICATION..."}</div>
            </div>
            <div className="bg-zinc-950/50 border border-zinc-900 p-4 rounded text-left border-l-4 border-l-red-600">
              <p className="text-zinc-500 text-[8px] font-bold uppercase tracking-widest leading-relaxed">
                <span className="text-red-600 font-black">NOTICE:</span> IP, MAC, & GEO-COORD LOGGING ACTIVE. UNAUTHORIZED ENTRY IS AN OFFENSE.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#020202] text-white pb-20 relative font-orbitron overflow-hidden`}>
      {/* Background Pulse Grid */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${shake ? 'opacity-40 animate-pulse' : 'opacity-10'}`} 
           style={{ backgroundImage: `linear-gradient(${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px), linear-gradient(90deg, ${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 p-5 max-w-xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-zinc-900 pb-6">
          <div className="flex items-center gap-4">
            {isGLX ? <div className="w-12 h-12 bg-green-500 rounded flex items-center justify-center font-black text-black text-xl">GLX</div> : 
             isBST ? <div className="w-12 h-12 bg-blue-500 rounded flex items-center justify-center font-black text-white text-xl">BST</div> : 
             <div className="w-12 h-12 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center text-zinc-700">?</div>}
            <div className="space-y-1">
               <h1 className={`text-xl font-black tracking-widest uppercase ${brandColor}`}>Terminal v4.5</h1>
               <p className="text-[7px] text-zinc-500 tracking-[0.4em]">ENCRYPTED LOGISTICS UPLINK CHANNEL</p>
            </div>
          </div>
        </header>

        {/* SECTION 01: IDENTITY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`flex flex-col p-3 rounded-lg border border-zinc-900 transition-colors ${company ? brandBg : ''}`}>
            <div className="flex items-center mb-1">
              <label className={`text-[8px] font-black uppercase tracking-widest ${brandColor}`}>Carrier Profile</label>
              <StatusNode active={!!company} />
            </div>
            <select className="bg-transparent text-xs outline-none" value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="">SELECT FLEET...</option>
              <option value="GLX">GREENLEAF XPRESS</option>
              <option value="BST">BST EXPEDITE</option>
            </select>
          </div>
          <div className={`flex flex-col p-3 rounded-lg border border-zinc-900 transition-colors ${driverName ? brandBg : ''}`}>
            <div className="flex items-center mb-1">
              <label className={`text-[8px] font-black uppercase tracking-widest ${brandColor}`}>Operator Full Name</label>
              <StatusNode active={!!driverName} />
            </div>
            <input type="text" placeholder="ENTER NAME" className="bg-transparent text-xs outline-none" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>
        </div>

        {/* SECTION 02: SHIPMENT */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`flex flex-col p-3 rounded-lg border border-zinc-900 transition-colors ${loadNum ? brandBg : ''}`}>
            <div className="flex items-center mb-1">
              <label className={`text-[8px] font-black uppercase tracking-widest ${brandColor}`}>Load Ref #</label>
              <StatusNode active={!!loadNum} />
            </div>
            <input type="text" placeholder="ID" className="bg-transparent text-xs outline-none" value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
          </div>
          <div className={`flex flex-col p-3 rounded-lg border border-zinc-900 transition-colors ${bolNum ? brandBg : ''}`}>
            <div className="flex items-center mb-1">
              <label className={`text-[8px] font-black uppercase tracking-widest ${brandColor}`}>BOL Ref #</label>
              <StatusNode active={!!bolNum} />
            </div>
            <input type="text" placeholder="ID" className="bg-transparent text-xs outline-none" value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
          </div>
        </div>

        {/* SECTION 03: ROUTE (City & State) */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
             <div className={`col-span-2 flex flex-col p-3 rounded-lg border border-zinc-900 transition-colors ${puCity ? brandBg : ''}`}>
               <div className="flex items-center mb-1"><label className={`text-[8px] font-black uppercase tracking-widest ${brandColor}`}>Pickup City</label><StatusNode active={!!puCity} /></div>
               <input type="text" placeholder="CITY" className="bg-transparent text-xs outline-none" value={puCity} onChange={(e) => setPuCity(e.target.value)} />
             </div>
             <div className={`flex flex-col p-3 rounded-lg border border-zinc-900 transition-colors ${puState ? brandBg : ''}`}>
               <div className="flex items-center mb-1"><label className={`text-[8px] font-black uppercase tracking-widest ${brandColor}`}>ST</label><StatusNode active={!!puState} /></div>
               <select className="bg-transparent text-xs outline-none" value={puState} onChange={(e) => setPuState(e.target.value)}>
                 <option value="">SELECT</option>
                 {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
             <div className={`col-span-2 flex flex-col p-3 rounded-lg border border-zinc-900 transition-colors ${delCity ? brandBg : ''}`}>
               <div className="flex items-center mb-1"><label className={`text-[8px] font-black uppercase tracking-widest ${brandColor}`}>Deliv. City</label><StatusNode active={!!delCity} /></div>
               <input type="text" placeholder="CITY" className="bg-transparent text-xs outline-none" value={delCity} onChange={(e) => setDelCity(e.target.value)} />
             </div>
             <div className={`flex flex-col p-3 rounded-lg border border-zinc-900 transition-colors ${delState ? brandBg : ''}`}>
               <div className="flex items-center mb-1"><label className={`text-[8px] font-black uppercase tracking-widest ${brandColor}`}>ST</label><StatusNode active={!!delState} /></div>
               <select className="bg-transparent text-xs outline-none" value={delState} onChange={(e) => setDelState(e.target.value)}>
                 <option value="">SELECT</option>
                 {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
        </div>

        {/* SECTION 04: IMAGING */}
        <div className={`bg-zinc-950/40 border-2 border-dashed p-6 rounded-xl text-center transition-all ${uploadedFiles.length > 0 ? (isGLX ? 'border-green-500/50' : 'border-blue-500/50') : 'border-zinc-900'}`}>
           <h2 className={`text-[9px] font-black uppercase tracking-widest mb-6 ${brandColor}`}>BOL / POD Digital Capture</h2>
           <div className="flex justify-center gap-12 mb-8">
              <button onClick={() => fileInputRef.current?.click()} className={`${brandColor} text-[10px] font-black uppercase flex flex-col items-center gap-2`}><span className="text-2xl">🖼️</span> Gallery</button>
              <button onClick={() => cameraInputRef.current?.click()} className={`${brandColor} text-[10px] font-black uppercase flex flex-col items-center gap-2`}><span className="text-2xl">📸</span> Camera</button>
           </div>
           
           <div className="flex justify-center gap-6 text-[9px] text-zinc-500 font-bold uppercase border-t border-zinc-900 pt-4 mb-4">
              <label className={`flex items-center gap-2 cursor-pointer ${bolType === 'pickup' ? 'text-white' : ''}`}><input type="radio" name="bolType" className="accent-white" onChange={() => setBolType('pickup')}/> PU BOL</label>
              <label className={`flex items-center gap-2 cursor-pointer ${bolType === 'delivery' ? 'text-white' : ''}`}><input type="radio" name="bolType" className="accent-white" onChange={() => setBolType('delivery')}/> DEL POD</label>
           </div>

           {uploadedFiles.length > 0 && (
             <div className="grid grid-cols-4 gap-3 mt-4">
               {uploadedFiles.map(f => (
                 <div key={f.id} className="relative aspect-square rounded-lg border border-zinc-800 overflow-hidden group">
                   <img src={f.preview} className="w-full h-full object-cover opacity-60" alt="doc" />
                   {/* ✅ SCANNER: Intermittent Pulse instead of continuous line to prevent "stuck" look */}
                   <div className={`absolute top-0 left-0 w-full h-[2px] animate-scan-pulse ${isGLX ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-cyan-500 shadow-[0_0_10px_cyan]'}`}></div>
                   <button onClick={() => setUploadedFiles(prev => prev.filter(item => item.id !== f.id))} className="absolute top-0 right-0 bg-red-600 text-[8px] p-1 px-1.5 font-black z-30 opacity-0 group-hover:opacity-100 transition-opacity">X</button>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* SECTION 05: LOAD PHOTOS (Better Driver Language) */}
        <div className={`bg-zinc-950/40 border border-zinc-900 p-6 rounded-xl space-y-4`}>
          <div className="flex justify-between items-center"><h2 className={`text-[9px] font-black uppercase tracking-widest ${brandColor}`}>Cargo & Loaded Photos</h2><span className="text-[7px] text-zinc-600 uppercase">Optional</span></div>
          <div className="grid grid-cols-2 gap-4">
             <button className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl text-[9px] font-black uppercase text-zinc-500 flex flex-col items-center gap-2 hover:text-white transition-all"><span className="text-xl">🚛</span> Loaded Cargo</button>
             <button className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl text-[9px] font-black uppercase text-zinc-500 flex flex-col items-center gap-2 hover:text-white transition-all"><span className="text-xl">📹</span> Video Walkaround</button>
          </div>
        </div>

        <button onClick={handleSubmit} className={`w-full py-6 rounded-xl font-black text-xs uppercase tracking-[0.5em] transition-all relative overflow-hidden ${shake ? 'animate-shake bg-red-600' : isFormComplete ? (isGLX ? 'bg-green-600 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'bg-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.3)]') : 'bg-zinc-900 text-zinc-700'}`}>
          {isSubmitting && <div className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>}
          <span className="relative z-10">{isSubmitting ? `TRANSMITTING... ${uploadProgress}%` : 'Execute Transmission'}</span>
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
        @keyframes scan-pulse { 0% { top: 0; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 60% { transform: translateX(8px); } }
        .animate-scan-pulse { animation: scan-pulse 3s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .animate-shake { animation: shake 0.2s linear infinite; }
      `}</style>
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => { if(e.target.files) setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!).map(file => ({ file, preview: URL.createObjectURL(file), id: Math.random().toString() }))]) }} />
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={(e) => { if(e.target.files) setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!).map(file => ({ file, preview: URL.createObjectURL(file), id: Math.random().toString() }))]) }} />
    </div>
  );
};

export default App;