import React, { useState, useRef, useEffect } from 'react';

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

const App = () => {
  // --- STATE ---
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
  }, []);

  const handleAuth = () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      setAuthStage(stage);
      if (stage >= 4) {
        clearInterval(interval);
        setTimeout(() => setIsLocked(false), 500);
      }
    }, 450);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: `${file.name}-${Date.now()}`
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const themeColor = isGLX ? 'text-green-500' : isBST ? 'text-blue-400' : 'text-cyan-400';
  const brandBg = isGLX ? 'bg-green-500/10' : isBST ? 'bg-blue-500/10' : 'bg-transparent';
  const inputStyle = `w-full bg-black border border-zinc-800 p-3 text-xs rounded-lg outline-none text-white appearance-none focus:border-zinc-500`;

  return (
    <div className="min-h-screen bg-[#020202] text-white font-orbitron relative overflow-x-hidden">
      
      {/* 1. PERSISTENT BACKGROUND GRID */}
      <div className={`fixed inset-0 z-0 transition-opacity duration-1000 ${shake ? 'opacity-40 animate-pulse' : 'opacity-10'}`} 
           style={{ backgroundImage: `linear-gradient(${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px), linear-gradient(90deg, ${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      {/* 2. MAIN TERMINAL CONTENT (Always Mounted) */}
      <div className="relative z-10 p-5 max-w-xl mx-auto space-y-10 pb-24">
        <header className="flex justify-between items-center border-b border-zinc-900 pb-8 pt-4">
          <div className="flex items-center gap-5">
            {isGLX ? (
              <div className="w-14 h-14 bg-green-500 rounded-xl flex flex-col items-center justify-center font-black text-black leading-none shadow-[0_0_20px_rgba(34,197,94,0.4)]"><span className="text-xl">GLX</span><span className="text-[6px] tracking-widest mt-1 uppercase">Logistics</span></div>
            ) : isBST ? (
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex flex-col items-center justify-center font-black text-white leading-none shadow-[0_0_20px_rgba(59,130,246,0.4)]"><span className="text-xl">BST</span><span className="text-[6px] tracking-widest mt-1 uppercase">Expedite</span></div>
            ) : (
              <div className="w-14 h-14 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center font-black text-zinc-700">?</div>
            )}
            <div className="space-y-1">
               <h1 className={`text-xl font-black tracking-widest uppercase ${themeColor}`}>Terminal v3.8</h1>
               <p className="text-[7px] text-zinc-500 tracking-[0.4em]">SECURE LOGISTICS UPLINK</p>
            </div>
          </div>
        </header>

        {/* IDENTITY MODULE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`flex flex-col p-4 rounded-xl border border-zinc-900 ${company ? brandBg : ''}`}>
            <label className={`text-[9px] font-black uppercase mb-1.5 ml-1 ${themeColor}`}>Carrier Identity</label>
            <select className={inputStyle} style={{backgroundColor: 'black'}} value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="">SELECT FLEET...</option>
              <option value="GLX">GREENLEAF XPRESS (GLX)</option>
              <option value="BST">BST EXPEDITE (BST)</option>
            </select>
          </div>
          <div className={`flex flex-col p-4 rounded-xl border border-zinc-900 ${driverName ? brandBg : ''}`}>
            <label className={`text-[9px] font-black uppercase mb-1.5 ml-1 ${themeColor}`}>Operator Name</label>
            <input type="text" placeholder="ENTER NAME" className={inputStyle} value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>
        </div>

        {/* SHIPMENT MODULE */}
        <div className="grid grid-cols-2 gap-6">
          <div className={`flex flex-col p-4 rounded-xl border border-zinc-900 ${loadNum ? brandBg : ''}`}>
            <label className={`text-[9px] font-black uppercase mb-1.5 ml-1 ${themeColor}`}>Load Reference</label>
            <input type="text" placeholder="LOAD #" className={inputStyle} value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
          </div>
          <div className={`flex flex-col p-4 rounded-xl border border-zinc-900 ${bolNum ? brandBg : ''}`}>
            <label className={`text-[9px] font-black uppercase mb-1.5 ml-1 ${themeColor}`}>BOL Reference</label>
            <input type="text" placeholder="BOL #" className={inputStyle} value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
          </div>
        </div>

        {/* ROUTE MODULES */}
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
             <div className={`col-span-2 flex flex-col p-4 rounded-xl border border-zinc-900 ${puCity ? brandBg : ''}`}>
               <label className={`text-[9px] font-black uppercase mb-1.5 ml-1 ${themeColor}`}>Pickup City</label>
               <input type="text" placeholder="CITY" className={inputStyle} value={puCity} onChange={(e) => setPuCity(e.target.value)} />
             </div>
             <div className={`flex flex-col p-4 rounded-xl border border-zinc-900 ${puState ? brandBg : ''}`}>
               <label className={`text-[9px] font-black uppercase mb-1.5 ml-1 ${themeColor}`}>State</label>
               <select className={inputStyle} style={{backgroundColor: 'black'}} value={puState} onChange={(e) => setPuState(e.target.value)}>
                 <option value="">SELECT STATE</option>
                 {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
             <div className={`col-span-2 flex flex-col p-4 rounded-xl border border-zinc-900 ${delCity ? brandBg : ''}`}>
               <label className={`text-[9px] font-black uppercase mb-1.5 ml-1 ${themeColor}`}>Delivery City</label>
               <input type="text" placeholder="CITY" className={inputStyle} value={delCity} onChange={(e) => setDelCity(e.target.value)} />
             </div>
             <div className={`flex flex-col p-4 rounded-xl border border-zinc-900 ${delState ? brandBg : ''}`}>
               <label className={`text-[9px] font-black uppercase mb-1.5 ml-1 ${themeColor}`}>State</label>
               <select className={inputStyle} style={{backgroundColor: 'black'}} value={delState} onChange={(e) => setDelState(e.target.value)}>
                 <option value="">SELECT STATE</option>
                 {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
        </div>

        {/* IMAGING MODULE */}
        <div className={`bg-zinc-950/40 border-2 border-dashed p-8 rounded-2xl text-center transition-all ${uploadedFiles.length > 0 ? (isGLX ? 'border-green-500/50' : 'border-blue-500/50') : 'border-zinc-800'}`}>
           <h2 className={`text-[10px] font-black uppercase tracking-widest mb-8 ${themeColor}`}>Imaging System</h2>
           <div className="flex justify-center gap-8 text-[9px] text-zinc-500 font-bold uppercase border-b border-zinc-900 pb-5 mb-10">
              <label className={`flex items-center gap-2 cursor-pointer ${bolType === 'pickup' ? 'text-white' : ''}`}><input type="radio" name="bolType" className="accent-white" onChange={() => setBolType('pickup')}/> PU BOL</label>
              <label className={`flex items-center gap-2 cursor-pointer ${bolType === 'delivery' ? 'text-white' : ''}`}><input type="radio" name="bolType" className="accent-white" onChange={() => setBolType('delivery')}/> DEL POD</label>
           </div>
           <div className="flex justify-center gap-12 mb-10">
              <button onClick={() => fileInputRef.current?.click()} className={`${themeColor} text-[10px] font-black uppercase flex flex-col items-center gap-3`}>📁 Gallery</button>
              <button onClick={() => cameraInputRef.current?.click()} className={`${themeColor} text-[10px] font-black uppercase flex flex-col items-center gap-3`}>📷 Camera</button>
           </div>
           {uploadedFiles.length > 0 && (
             <div className="grid grid-cols-3 gap-5 mt-10">
               {uploadedFiles.map(f => (
                 <div key={f.id} className="relative aspect-square rounded-2xl border border-zinc-800 overflow-hidden group">
                   <img src={f.preview} className="w-full h-full object-cover" alt="doc" />
                   <div className="absolute top-0 left-0 w-full h-[2px] animate-scan-limited bg-cyan-500"></div>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* TRAILER MODULE */}
        <div className="bg-zinc-950/40 border border-zinc-900 p-8 rounded-3xl space-y-6 text-center">
          <h2 className={`text-[10px] font-black uppercase tracking-widest ${themeColor}`}>Trailer Photos</h2>
          <button onClick={() => freightInputRef.current?.click()} className="w-full bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
             Photos of freight loaded on trailer
          </button>
        </div>

        <button onClick={() => { if(!company) { setShake(true); setTimeout(()=>setShake(false), 800); } else { setIsSubmitting(true); setTimeout(()=>setShowSuccess(true), 2000); } }} 
          className={`w-full py-8 rounded-2xl font-black text-[11px] uppercase tracking-[0.6em] transition-all relative overflow-hidden ${shake ? 'animate-shake bg-red-600' : isGLX ? 'bg-green-600' : 'bg-blue-600'}`}>
          <span className="relative z-10">{isSubmitting ? 'UPLOADING...' : 'Execute Transmission'}</span>
        </button>
      </div>

      {/* 3. AUTH SHIELD OVERLAY (Highest Z-Index) */}
      {isLocked && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-6">
          <div className="z-10 flex flex-col md:flex-row items-center gap-12 max-w-2xl w-full p-10 border border-zinc-900 bg-zinc-950/80 rounded-3xl shadow-2xl backdrop-blur-lg">
            <div className="flex flex-col items-center space-y-6 text-center">
              <h1 className="text-white text-xl font-black tracking-[0.5em] uppercase">Auth-Shield</h1>
              <button onMouseDown={handleAuth} onTouchStart={handleAuth} className={`relative w-32 h-32 rounded-full border-2 border-zinc-800 flex items-center justify-center transition-all ${isAuthenticating ? 'border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.4)]' : ''}`}>
                 <span className="text-4xl text-zinc-700">☝️</span>
                 {isAuthenticating && <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>}
              </button>
              <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-zinc-600">HOLD TO START</p>
            </div>
            <div className="flex-1 w-full space-y-4 font-mono text-[10px] h-32 flex flex-col justify-center border-l border-zinc-900 pl-8 text-zinc-600">
              <div className={authStage >= 1 ? 'text-cyan-500' : ''}>{"> SYSTEM_BOOT"}</div>
              <div className={authStage >= 2 ? 'text-cyan-500' : ''}>{"> IP_GEO_LOGGED"}</div>
              <div className={authStage >= 3 ? 'text-cyan-500' : ''}>{"> SECURE_LINK"}</div>
              <div className={authStage >= 4 ? 'text-green-500 font-bold' : ''}>{authStage >= 4 ? "> ACCESS_AUTHORIZED" : "> STANDBY..."}</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/98 z-[200] flex flex-col items-center justify-center p-10 backdrop-blur-3xl">
           <div className={`w-24 h-24 rounded-full border-2 border-green-500 flex items-center justify-center text-5xl mb-10 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]`}>✓</div>
           <h2 className="text-3xl font-black uppercase tracking-[0.5em] mb-4 text-white text-center">Verified</h2>
           <button onClick={() => window.location.reload()} className={`w-full max-w-sm py-5 border-2 text-[12px] font-black uppercase tracking-[0.4em] ${themeColor}`}>New Session</button>
        </div>
      )}

      <style>{`
        @keyframes scan-limited { 0% { top: 0; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }
        .animate-scan-limited { animation: scan-limited 2.5s linear 3; }
        .animate-shake { animation: shake 0.2s linear infinite; }
      `}</style>
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={onFileSelect} />
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={onFileSelect} />
      <input type="file" ref={freightInputRef} className="hidden" multiple accept="image/*" onChange={onFileSelect} />
    </div>
  );
};

export default App;