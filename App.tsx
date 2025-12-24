import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * LOGISTICS COMMAND TERMINAL v6.2 [SUPERIOR EDITION]
 * FOCUS: Tactile entry protocols & high-fidelity feedback loops.
 */

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
  timestamp: string;
}

const App: React.FC = () => {
  // --- SESSION STATE ---
  const [isLocked, setIsLocked] = useState(true);
  const [authStatus, setAuthStatus] = useState<'IDLE' | 'SCANNING' | 'VERIFYING' | 'GRANTED'>('IDLE');
  const [authProgress, setAuthProgress] = useState(0);
  
  // --- APP STATE ---
  const [company, setCompany] = useState<'GLX' | 'BST' | ''>('');
  const [driverName, setDriverName] = useState('');
  const [loadNum, setLoadNum] = useState('');
  const [bolNum, setBolNum] = useState('');
  const [puCity, setPuCity] = useState('');
  const [puState, setPuState] = useState('');
  const [delCity, setDelCity] = useState('');
  const [delState, setDelState] = useState('');
  const [bolType, setBolType] = useState<'pickup' | 'delivery' | ''>('');
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  // --- THEME ENGINE ---
  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const accentHex = isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#06b6d4';
  const accentTailwind = isGLX ? 'green-500' : isBST ? 'blue-500' : 'cyan-500';

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    return () => uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
  }, [uploadedFiles]);

  const handleAuth = () => {
    if (authStatus !== 'IDLE') return;
    
    setAuthStatus('SCANNING');
    audioRef.current?.play().catch(() => {});

    let p = 0;
    const interval = setInterval(() => {
      p += 4;
      setAuthProgress(p);
      if (p === 60) setAuthStatus('VERIFYING');
      if (p >= 100) {
        clearInterval(interval);
        setAuthStatus('GRANTED');
        setTimeout(() => setIsLocked(false), 500);
      }
    }, 30);
  };

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }));
      setUploadedFiles(prev => [...prev, ...filesArray]);
    }
  }, []);

  const isFormComplete = company && driverName && (loadNum || bolNum) && puCity && puState && delCity && delState && bolType && uploadedFiles.length > 0;

  const handleSubmit = () => {
    if (!isFormComplete) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    setIsSubmitting(true);
    let prog = 0;
    const timer = setInterval(() => {
      prog += Math.random() * 12;
      setUploadProgress(Math.min(prog, 100));
      if (prog >= 100) {
        clearInterval(timer);
        setTimeout(() => setShowSuccess(true), 600);
      }
    }, 150);
  };

  const inputClass = `w-full bg-black/60 border border-zinc-800/80 p-4 text-[11px] font-mono tracking-widest rounded-none outline-none focus:border-${accentTailwind} transition-all duration-300 placeholder-zinc-800 text-white backdrop-blur-md shadow-inner`;

  // --- AUTH SCREEN (THE GATE) ---
  if (isLocked) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 font-orbitron overflow-hidden relative">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#111_0%,_#000_70%)] opacity-100" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50" />
        
        <div className="z-10 w-full max-w-sm flex flex-col items-center gap-12">
          {/* Brand Header */}
          <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h2 className="text-cyan-500/40 text-[9px] tracking-[0.8em] uppercase font-black">Secure Data Uplink</h2>
            <h1 className="text-white text-5xl font-black tracking-tighter italic">V5.0</h1>
          </div>

          {/* THE IGNITION NODE (Clickable Entry) */}
          <div className="relative group">
            <div className={`absolute -inset-8 bg-cyan-500/10 blur-[60px] rounded-full transition-opacity duration-1000 ${authStatus !== 'IDLE' ? 'opacity-100' : 'opacity-40'}`} />
            
            <button 
              onClick={handleAuth}
              disabled={authStatus !== 'IDLE'}
              className={`relative w-48 h-48 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-700 active:scale-95 ${
                authStatus === 'IDLE' 
                  ? 'border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.1)] hover:shadow-[0_0_50px_rgba(6,182,212,0.3)] animate-pulse-subtle' 
                  : 'border-cyan-400 shadow-[0_0_60px_rgba(6,182,212,0.4)]'
              }`}
            >
              {/* Biometric SVG */}
              <svg className={`w-16 h-16 transition-colors duration-500 ${authStatus !== 'IDLE' ? 'text-cyan-400' : 'text-zinc-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09m10.839-12.218c1.744 2.772 2.753 6.054 2.753 9.571m-1.113-12.218A11.95 11.95 0 0012 2c-2.31 0-4.47.653-6.309 1.782m12.618 0c1.84 1.129 3.414 2.651 4.59 4.433m-17.208 0C2.906 6.433 4.48 4.911 6.32 3.782m12.618 0l.042.025M5.168 20.427A11.95 11.95 0 012 12c0-2.31.653-4.47 1.782-6.309m15.054 15.054A11.95 11.95 0 0022 12c0-2.31-.653-4.47-1.782-6.309m-11.41 12.618a5 5 0 117.072 0m-7.072 0a11.95 11.95 0 01-2.753-9.571m1.113-2.618A5 5 0 0119 12a11.95 11.95 0 01-2.753 9.571"/>
              </svg>
              
              <span className="mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500/60">
                {authStatus === 'IDLE' ? 'Initialize' : authStatus}
              </span>

              {/* Spinning Progress Ring */}
              {authStatus !== 'IDLE' && (
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle 
                    cx="96" cy="96" r="90" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="2" 
                  />
                  <circle 
                    cx="96" cy="96" r="90" fill="none" stroke="#06b6d4" strokeWidth="3"
                    strokeDasharray="565.48"
                    strokeDashoffset={565.48 - (565.48 * authProgress) / 100}
                    className="transition-all duration-100 ease-linear shadow-[0_0_10px_#06b6d4]"
                  />
                </svg>
              )}
            </button>
          </div>

          <p className="text-[8px] text-zinc-700 font-mono tracking-[0.4em] uppercase text-center max-w-[240px] leading-relaxed">
            Click to establish secure biometric handshake with logistics core.
          </p>
        </div>
      </div>
    );
  }

  // --- MAIN APP (THE TERMINAL) ---
  return (
    <div className={`min-h-screen bg-[#020202] text-zinc-300 font-orbitron overflow-x-hidden selection:bg-${accentTailwind} selection:text-black`}>
      {/* Dynamic Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute inset-0 opacity-[0.05] transition-colors duration-1000`} 
             style={{ backgroundImage: `linear-gradient(${accentHex} 1px, transparent 1px), linear-gradient(90deg, ${accentHex} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-5 md:p-12 space-y-12">
        {/* TOP HUD */}
        <header className="flex justify-between items-end border-b border-zinc-900 pb-10">
          <div className="flex items-center gap-6">
            <div className={`w-14 h-14 border transition-all duration-1000 flex items-center justify-center font-black text-xl shadow-2xl ${isGLX ? 'bg-green-500 text-black border-green-400' : isBST ? 'bg-blue-600 text-white border-blue-400' : 'bg-zinc-900 text-zinc-700 border-zinc-800'}`}>
              {isGLX ? 'G' : isBST ? 'B' : '?'}
            </div>
            <div className="space-y-1">
              <h2 className={`text-2xl font-black tracking-tighter uppercase italic leading-none ${accentTailwind}`}>Logistics_Uplink</h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" />
                <p className="text-[8px] text-zinc-600 tracking-[0.4em] font-mono">NODE_ACTIVE // {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
          <div className="hidden md:block text-right font-mono text-[9px] text-zinc-700 tracking-widest uppercase">
            ID: {crypto.randomUUID().split('-')[0]} // SEC_LEVEL: 4
          </div>
        </header>

        <main className={`grid grid-cols-1 lg:grid-cols-12 gap-12 transition-all ${shake ? 'animate-shake' : ''}`}>
          {/* COLUMN 1: MANIFEST */}
          <div className="lg:col-span-7 space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <span className={`h-px flex-1 bg-gradient-to-r from-${accentTailwind}/40 to-transparent`} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 italic">01 // Identity</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Fleet Selection</label>
                  <select className={inputClass} value={company} onChange={e => setCompany(e.target.value as any)}>
                    <option value="">[ SELECT FLEET ]</option>
                    <option value="GLX">GREENLEAF XPRESS (GLX)</option>
                    <option value="BST">BST EXPEDITE (BST)</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Operator ID</label>
                  <input type="text" placeholder="FULL_LEGAL_NAME" className={inputClass} value={driverName} onChange={e => setDriverName(e.target.value)} />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <span className={`h-px flex-1 bg-gradient-to-r from-${accentTailwind}/40 to-transparent`} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 italic">02 // Load_Ref</h3>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <input type="text" placeholder="LOAD_#" className={inputClass} value={loadNum} onChange={e => setLoadNum(e.target.value)} />
                <input type="text" placeholder="BOL_#" className={inputClass} value={bolNum} onChange={e => setBolNum(e.target.value)} />
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <span className={`h-px flex-1 bg-gradient-to-r from-${accentTailwind}/40 to-transparent`} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 italic">03 // Route_Map</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-2">
                  <input type="text" placeholder="PU_CITY" className={inputClass} value={puCity} onChange={e => setPuCity(e.target.value)} />
                  <select className={`${inputClass} w-28 text-center`} value={puState} onChange={e => setPuState(e.target.value)}>
                    <option value="">ST</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="DEL_CITY" className={inputClass} value={delCity} onChange={e => setDelCity(e.target.value)} />
                  <select className={`${inputClass} w-28 text-center`} value={delState} onChange={e => setDelState(e.target.value)}>
                    <option value="">ST</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </section>
          </div>

          {/* COLUMN 2: ASSETS */}
          <div className="lg:col-span-5 space-y-10">
            <section className="bg-zinc-950/80 border border-zinc-900 p-8 relative group overflow-hidden">
              <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-${accentTailwind} to-transparent opacity-20`} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-center text-zinc-600">Document_Scanner</h3>
              
              <div className="flex justify-center gap-8 mb-10">
                <button onClick={() => cameraInputRef.current?.click()} className="w-24 h-24 flex flex-col items-center justify-center gap-3 border border-zinc-800 hover:border-cyan-500 transition-colors bg-zinc-900/40">
                  <svg className="w-6 h-6 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
                  <span className="text-[7px] font-black tracking-widest uppercase">Scan</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="w-24 h-24 flex flex-col items-center justify-center gap-3 border border-zinc-800 hover:border-cyan-500 transition-colors bg-zinc-900/40">
                  <svg className="w-6 h-6 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                  <span className="text-[7px] font-black tracking-widest uppercase">Files</span>
                </button>
              </div>

              <div className="flex justify-center gap-6 text-[9px] font-black uppercase tracking-widest mb-10 border-y border-zinc-900/50 py-5">
                <label className={`cursor-pointer flex items-center gap-2 transition-all ${bolType === 'pickup' ? `text-${accentTailwind}` : 'text-zinc-600'}`}>
                  <input type="radio" className="hidden" name="b" onChange={() => setBolType('pickup')} />
                  <div className={`w-2 h-2 rounded-full border border-zinc-800 ${bolType === 'pickup' ? 'bg-current shadow-[0_0_8px_currentColor]' : ''}`} />
                  PU BOL
                </label>
                <label className={`cursor-pointer flex items-center gap-2 transition-all ${bolType === 'delivery' ? `text-${accentTailwind}` : 'text-zinc-600'}`}>
                  <input type="radio" className="hidden" name="b" onChange={() => setBolType('delivery')} />
                  <div className={`w-2 h-2 rounded-full border border-zinc-800 ${bolType === 'delivery' ? 'bg-current shadow-[0_0_8px_currentColor]' : ''}`} />
                  DEL POD
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scroll pr-2">
                {uploadedFiles.map(f => (
                  <div key={f.id} className="relative aspect-[3/4] border border-zinc-900 bg-black group overflow-hidden">
                    <img src={f.preview} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="doc" />
                    <div className={`absolute inset-0 border-2 border-${accentTailwind}/30 opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <button onClick={() => setUploadedFiles(prev => prev.filter(x => x.id !== f.id))} className="absolute top-2 right-2 w-5 h-5 bg-red-600 text-white text-[10px] flex items-center justify-center font-black">✕</button>
                    <div className="absolute bottom-1 left-2 text-[6px] font-mono text-cyan-400">{f.timestamp}</div>
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-4 pt-10">
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className={`w-full py-8 text-[11px] font-black uppercase tracking-[0.8em] transition-all relative overflow-hidden group ${
                  isFormComplete ? `bg-${accentTailwind} text-black shadow-2xl` : 'bg-zinc-900 text-zinc-700 pointer-events-none'
                }`}
              >
                {isSubmitting && <div className="absolute inset-0 bg-white/20 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />}
                <span className="relative z-10">{isSubmitting ? 'Transmitting...' : 'Initiate_Transmission'}</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
              <div className="flex justify-between font-mono text-[7px] text-zinc-700 tracking-[0.3em] uppercase px-1">
                <span>Buffer: 1024KB</span>
                <span>Signal: High</span>
                <span>Key: {crypto.randomUUID().split('-')[1].toUpperCase()}</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* SUCCESS OVERLAY */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] bg-black/98 flex flex-col items-center justify-center p-12 backdrop-blur-3xl animate-in fade-in duration-1000">
          <div className="w-full max-w-lg space-y-10 text-center">
            <div className={`w-24 h-24 rounded-full border-2 mx-auto flex items-center justify-center text-4xl mb-12 animate-pulse ${isGLX ? 'border-green-500 text-green-500' : 'border-blue-500 text-blue-500'}`}>✓</div>
            <h2 className="text-white text-3xl font-black uppercase tracking-[0.5em] italic">Link_Established</h2>
            <div className="space-y-2 text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] max-w-xs mx-auto">
              <p>Transmission_Confirmed</p>
              <p>Packet_Hash: 0x{Math.random().toString(16).substr(2, 8).toUpperCase()}</p>
            </div>
            <button onClick={() => window.location.reload()} className="w-full py-5 border border-zinc-800 text-white text-[10px] font-black uppercase tracking-[0.5em] hover:bg-white/5 transition-colors">Terminate_Session</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-subtle { 0%, 100% { opacity: 0.8; transform: scale(1); } 50% { opacity: 1; transform: scale(1.02); } }
        .animate-pulse-subtle { animation: pulse-subtle 4s ease-in-out infinite; }
        .animate-shake { animation: shake 0.2s linear 3; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }
        .custom-scroll::-webkit-scrollbar { width: 2px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #27272a; }
      `}</style>
      
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFile} />
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={handleFile} />
    </div>
  );
};

export default App;