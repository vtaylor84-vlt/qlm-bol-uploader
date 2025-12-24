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
  const [logs, setLogs] = useState<string[]>(['> KERNEL v3.0 BOOT...', '> SECURE UPLINK READY']);
  
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
    setTimeout(() => { 
      setIsLocked(false); 
      addLog("IP LOGGED: ACCESS GRANTED"); 
    }, 2000);
  };

  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const brandColor = isGLX ? 'text-green-500 shadow-green-500/50' : isBST ? 'text-blue-400 shadow-blue-400/40' : 'text-cyan-400 shadow-cyan-500/50';
  const brandBorder = isGLX ? 'border-green-500/30' : isBST ? 'border-blue-500/30' : 'border-zinc-800';

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

  if (isLocked) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-orbitron overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:30px_30px]"></div>
        <div className="z-10 text-center space-y-10 w-full max-w-sm">
          <header className="space-y-2">
            <h1 className="text-white text-2xl font-black tracking-[0.5em] uppercase">Security Portal</h1>
            <p className="text-red-500 text-[8px] tracking-[0.3em] font-bold">STRICT ACCESS CONTROL ACTIVE</p>
          </header>
          
          <button onMouseDown={handleAuth} onTouchStart={handleAuth} className={`w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all ${isAuthenticating ? 'border-cyan-500 shadow-[0_0_40px_cyan] scale-110' : 'border-zinc-800'}`}>
             <span className="text-4xl">☝️</span>
             {isAuthenticating && <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>}
          </button>
          
          <div className="bg-zinc-950/50 border border-zinc-900 p-4 rounded text-left space-y-2">
            <p className="text-zinc-500 text-[8px] font-bold uppercase tracking-widest leading-relaxed">
              <span className="text-zinc-300">NOTICE:</span> BY AUTHENTICATING, YOU CONSENT TO THE LOGGING OF YOUR <span className="text-white">IP ADDRESS, MAC ID, AND GEOLOCATION DATA</span> FOR LEGAL AUDIT PURPOSES. UNAUTHORIZED ACCESS IS PROHIBITED UNDER FED-SEC-902.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-12 relative font-orbitron overflow-hidden">
      {/* Background Pulse Grid */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${shake ? 'opacity-40 animate-pulse' : 'opacity-10'}`} 
           style={{ backgroundImage: `linear-gradient(${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px), linear-gradient(90deg, ${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 p-4 max-w-xl mx-auto space-y-8">
        <header className="flex justify-between items-end border-b border-zinc-900 pb-4">
          <div className="space-y-1">
             <h1 className={`text-xl font-black tracking-widest uppercase ${brandColor}`}>Terminal v3.0</h1>
             <p className="text-[7px] text-zinc-500 tracking-[0.4em]">SECURE LOGISTICS UPLINK</p>
          </div>
          <div className="text-right text-[9px] text-green-500 font-bold animate-pulse">● LINK STABLE</div>
        </header>

        {/* IDENTITY */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className={`text-[8px] font-black uppercase tracking-widest mb-1 ${brandColor}`}>Carrier Identity</label>
            <select className={`bg-zinc-950 border p-2 text-xs rounded outline-none transition-all ${shake && !company ? 'border-red-600' : 'border-zinc-800 focus:border-white'}`} value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="">SELECT...</option>
              <option value="GLX">GREENLEAF XPRESS</option>
              <option value="BST">BST EXPEDITE</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className={`text-[8px] font-black uppercase tracking-widest mb-1 ${brandColor}`}>Operator Full Name</label>
            <input type="text" placeholder="ENTER NAME" className={`bg-zinc-950 border p-2 text-xs rounded outline-none transition-all ${shake && !driverName ? 'border-red-600' : 'border-zinc-800 focus:border-white'}`} value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>
        </div>

        {/* SHIPMENT DATA */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className={`text-[8px] font-black uppercase tracking-widest mb-1 ${brandColor}`}>Load Ref #</label>
            <input type="text" placeholder="LOAD ID" className={`bg-zinc-950 border p-2 text-xs rounded outline-none ${shake && !loadNum && !bolNum ? 'border-red-600' : 'border-zinc-800 focus:border-white'}`} value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <label className={`text-[8px] font-black uppercase tracking-widest mb-1 ${brandColor}`}>BOL Ref #</label>
            <input type="text" placeholder="BOL ID" className={`bg-zinc-950 border p-2 text-xs rounded outline-none ${shake && !loadNum && !bolNum ? 'border-red-600' : 'border-zinc-800 focus:border-white'}`} value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
          </div>
        </div>

        {/* ✅ RESTORED: ROUTE SPECS GRID (City & State) */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="col-span-2 flex flex-col">
              <label className={`text-[8px] font-black uppercase tracking-widest mb-1 ${brandColor}`}>Origin: Pickup City</label>
              <input type="text" placeholder="CITY NAME" className={`bg-zinc-950 border p-2 text-xs rounded outline-none ${shake && !puCity ? 'border-red-600' : 'border-zinc-800 focus:border-white'}`} value={puCity} onChange={(e) => setPuCity(e.target.value)} />
            </div>
            <div className="flex flex-col">
              <label className={`text-[8px] font-black uppercase tracking-widest mb-1 ${brandColor}`}>ST</label>
              <select className={`bg-zinc-950 border p-2 text-xs rounded outline-none ${shake && !puState ? 'border-red-600' : 'border-zinc-800'}`} value={puState} onChange={(e) => setPuState(e.target.value)}>
                <option value=""></option>
                {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="col-span-2 flex flex-col">
              <label className={`text-[8px] font-black uppercase tracking-widest mb-1 ${brandColor}`}>Dest: Delivery City</label>
              <input type="text" placeholder="CITY NAME" className={`bg-zinc-950 border p-2 text-xs rounded outline-none ${shake && !delCity ? 'border-red-600' : 'border-zinc-800 focus:border-white'}`} value={delCity} onChange={(e) => setDelCity(e.target.value)} />
            </div>
            <div className="flex flex-col">
              <label className={`text-[8px] font-black uppercase tracking-widest mb-1 ${brandColor}`}>ST</label>
              <select className={`bg-zinc-950 border p-2 text-xs rounded outline-none ${shake && !delState ? 'border-red-600' : 'border-zinc-800'}`} value={delState} onChange={(e) => setDelState(e.target.value)}>
                <option value=""></option>
                {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* IMAGING MODULE */}
        <div className={`bg-zinc-950/40 border-2 border-dashed p-6 rounded-xl text-center transition-all ${brandBorder}`}>
           <label className={`text-[8px] font-black uppercase tracking-widest mb-4 block ${brandColor}`}>Digital Document Scan System</label>
           <div className="flex justify-center gap-10 mb-6">
              <button onClick={() => fileInputRef.current?.click()} className={`${brandColor} text-[10px] font-black uppercase tracking-widest`}>📁 Gallery</button>
              <button onClick={() => cameraInputRef.current?.click()} className={`${brandColor} text-[10px] font-black uppercase tracking-widest`}>📷 Camera</button>
           </div>
           
           <div className="flex justify-center gap-6 text-[9px] text-zinc-500 font-bold uppercase border-t border-zinc-900 pt-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="bolType" onChange={() => setBolType('pickup')}/> Pickup BOL</label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="bolType" onChange={() => setBolType('delivery')}/> Delivery POD</label>
           </div>

           {uploadedFiles.length > 0 && (
             <div className="grid grid-cols-4 gap-2 mt-2">
               {uploadedFiles.map(f => (
                 <div key={f.id} className="relative aspect-square rounded overflow-hidden border border-zinc-800">
                   <img src={f.preview} className="w-full h-full object-cover opacity-60" />
                   <div className={`absolute top-0 left-0 w-full h-[1px] animate-scan ${isGLX ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-cyan-500 shadow-[0_0_10px_cyan]'}`}></div>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* CONSOLE */}
        <div className="bg-[#050505] border border-zinc-900 p-3 rounded font-mono text-[8px] text-zinc-600 h-20 overflow-hidden shadow-inner">
           {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>

        <button 
          onClick={handleSubmit}
          className={`w-full py-5 rounded font-black text-xs uppercase tracking-[0.5em] transition-all relative overflow-hidden ${shake ? 'animate-shake bg-red-600' : isFormComplete ? (isGLX ? 'bg-green-600' :