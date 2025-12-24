import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * LOGISTICS COMMAND TERMINAL v6.0 [ELITE EDITION]
 * DESIGN SYSTEM: TACTICAL-NEUMORPHISM / DARK CORE
 * PERFORMANCE: ZERO-LATENCY INTERACTION
 */

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
  timestamp: string;
}

// --- ATOMIC TACTICAL COMPONENTS ---

const DataBit = ({ active }: { active: boolean }) => (
  <div className={`w-1 h-3 rounded-full transition-all duration-500 ${active ? 'bg-cyan-500 shadow-[0_0_8px_#06b6d4] scale-y-125' : 'bg-zinc-800 scale-y-75'}`} />
);

const CornerBracket = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const styles = {
    tl: "top-0 left-0 border-t-2 border-l-2",
    tr: "top-0 right-0 border-t-2 border-r-2",
    bl: "bottom-0 left-0 border-b-2 border-l-2",
    br: "bottom-0 right-0 border-b-2 border-r-2",
  };
  return <div className={`absolute w-3 h-3 border-zinc-800 ${styles[position]} pointer-events-none`} />;
};

const App: React.FC = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [authProgress, setAuthProgress] = useState(0);
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
  const accentHex = isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#52525b';
  const accentTailwind = isGLX ? 'green-500' : isBST ? 'blue-500' : 'zinc-500';

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
  }, []);

  const initiateUplink = () => {
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setAuthProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => setIsLocked(false), 400);
      }
    }, 20);
  };

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString()
      }));
      setUploadedFiles(prev => [...prev, ...filesArray]);
      audioRef.current?.play().catch(() => {});
    }
  }, []);

  const isFormComplete = company && driverName && (loadNum || bolNum) && puCity && puState && delCity && delState && bolType && uploadedFiles.length > 0;

  const executeTransmission = () => {
    if (!isFormComplete) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setIsSubmitting(true);
    let prog = 0;
    const timer = setInterval(() => {
      prog += Math.random() * 8;
      setUploadProgress(Math.min(prog, 100));
      if (prog >= 100) {
        clearInterval(timer);
        setTimeout(() => setShowSuccess(true), 800);
      }
    }, 100);
  };

  const inputClass = `w-full bg-black/40 border border-zinc-800 p-4 text-[11px] font-mono tracking-wider rounded-none outline-none focus:border-${accentTailwind} focus:ring-1 focus:ring-${accentTailwind}/20 transition-all duration-300 placeholder-zinc-800 text-white`;

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center font-orbitron p-6">
        <div className="w-full max-w-md space-y-8 relative">
          <div className="absolute -inset-20 bg-cyan-500/5 blur-[120px] rounded-full" />
          <div className="text-center space-y-2">
            <h2 className="text-zinc-600 text-[10px] tracking-[0.8em] uppercase font-black">Secure Entry Point</h2>
            <h1 className="text-white text-4xl font-black tracking-tighter">TERMINAL.06</h1>
          </div>
          <div className="relative p-1 bg-zinc-900 border border-zinc-800">
            <div className="h-1 bg-zinc-950 w-full overflow-hidden">
              <div className="h-full bg-cyan-500 transition-all duration-100" style={{ width: `${authProgress}%` }} />
            </div>
          </div>
          <button 
            onClick={initiateUplink}
            className="w-full py-6 border-2 border-cyan-500/30 text-cyan-500 font-black uppercase tracking-[0.5em] text-xs hover:bg-cyan-500/10 transition-all group"
          >
            <span className="group-hover:tracking-[0.7em] transition-all">Establish Link</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-orbitron selection:bg-cyan-500 selection:text-black">
      {/* SCANLINE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-12 relative">
        {/* HUD HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-900 pb-10">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 border-2 flex items-center justify-center text-2xl font-black transition-all duration-1000 ${isGLX ? 'border-green-500 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : isBST ? 'border-blue-500 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'border-zinc-800 text-zinc-800'}`}>
              {isGLX ? 'GLX' : isBST ? 'BST' : '??'}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">Command_Center v6.0</h1>
              <div className="flex items-center gap-3 text-[9px] font-mono text-zinc-600 tracking-widest uppercase mt-1">
                <span className="flex gap-1"><DataBit active={true}/><DataBit active={isFormComplete}/></span>
                LOGISTICS_UPLINK_READY // {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/30 p-4 border border-zinc-800/50 backdrop-blur-md hidden sm:block">
            <div className="text-[8px] text-zinc-500 uppercase tracking-tighter mb-1 font-mono">System Integrity</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className={`h-1 w-4 ${i < 6 ? 'bg-green-500/40' : 'bg-zinc-800'}`} />)}
            </div>
          </div>
        </header>

        <main className={`grid grid-cols-1 lg:grid-cols-12 gap-10 transition-transform duration-300 ${shake ? 'translate-x-2' : ''}`}>
          
          {/* LEFT COLUMN: PRIMARY DATA */}
          <div className="lg:col-span-7 space-y-8">
            <section className="relative p-6 bg-zinc-900/20 border border-zinc-900">
              <CornerBracket position="tl" /> <CornerBracket position="br" />
              <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-${accentTailwind}`}>01_Registry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Fleet Authority</label>
                  <select className={inputClass} value={company} onChange={e => setCompany(e.target.value as any)}>
                    <option value="">NULL_SELECT</option>
                    <option value="GLX">GREENLEAF XPRESS</option>
                    <option value="BST">BST EXPEDITE</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Operator Name</label>
                  <input type="text" placeholder="AUTH_NAME" className={inputClass} value={driverName} onChange={e => setDriverName(e.target.value)} />
                </div>
              </div>
            </section>

            <section className="relative p-6 bg-zinc-900/20 border border-zinc-900">
              <CornerBracket position="tl" /> <CornerBracket position="br" />
              <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-${accentTailwind}`}>02_Manifest</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Load Ref</label>
                  <input type="text" placeholder="L_ID" className={inputClass} value={loadNum} onChange={e => setLoadNum(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">BOL Ref</label>
                  <input type="text" placeholder="B_ID" className={inputClass} value={bolNum} onChange={e => setBolNum(e.target.value)} />
                </div>
              </div>
            </section>

            <section className="relative p-6 bg-zinc-900/20 border border-zinc-900">
              <CornerBracket position="tl" /> <CornerBracket position="br" />
              <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-${accentTailwind}`}>03_Routing</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <input type="text" placeholder="PICKUP_CITY" className={inputClass} value={puCity} onChange={e => setPuCity(e.target.value)} />
                  <select className={`${inputClass} w-32`} value={puState} onChange={e => setPuState(e.target.value)}>
                    <option value="">ST</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex gap-4">
                  <input type="text" placeholder="DELIVERY_CITY" className={inputClass} value={delCity} onChange={e => setDelCity(e.target.value)} />
                  <select className={`${inputClass} w-32`} value={delState} onChange={e => setDelState(e.target.value)}>
                    <option value="">ST</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: IMAGING & ACTIONS */}
          <div className="lg:col-span-5 space-y-8">
            <section className="relative bg-zinc-950 border-2 border-zinc-900 p-8 text-center group">
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-1000 pointer-events-none bg-${accentTailwind}`} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-zinc-500 italic">// Imaging_Subsystem</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center gap-3 p-6 border border-zinc-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all">
                  <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3" strokeWidth="1"/></svg>
                  <span className="text-[8px] font-bold tracking-[0.3em] uppercase">Capture</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-3 p-6 border border-zinc-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all">
                  <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                  <span className="text-[8px] font-bold tracking-[0.3em] uppercase">Library</span>
                </button>
              </div>

              <div className="flex justify-center gap-8 mb-8 border-y border-zinc-900/50 py-4">
                {['pickup', 'delivery'].map(type => (
                  <label key={type} className={`text-[9px] font-black uppercase tracking-widest cursor-pointer flex items-center gap-2 transition-colors ${bolType === type ? `text-${accentTailwind}` : 'text-zinc-600'}`}>
                    <input type="radio" className="hidden" name="bType" onChange={() => setBolType(type as any)} />
                    <div className={`w-2 h-2 rounded-full border border-current ${bolType === type ? 'bg-current shadow-[0_0_8px_currentColor]' : ''}`} />
                    {type === 'pickup' ? 'PU BOL' : 'DEL POD'}
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scroll">
                {uploadedFiles.map(f => (
                  <div key={f.id} className="relative aspect-square border border-zinc-800 bg-black overflow-hidden group">
                    <img src={f.preview} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity duration-700" alt="upload" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-1 left-1 text-[6px] font-mono text-cyan-400 uppercase">{f.timestamp}</div>
                    <button onClick={() => setUploadedFiles(prev => prev.filter(x => x.id !== f.id))} className="absolute top-1 right-1 text-[10px] text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-4 pt-10">
              <button 
                onClick={executeTransmission}
                disabled={isSubmitting}
                className={`w-full py-8 text-xs font-black uppercase tracking-[0.8em] transition-all relative overflow-hidden ${
                  isFormComplete ? `bg-${accentTailwind} text-black shadow-[0_0_40px_rgba(var(--color-rgb),0.3)]` : 'bg-zinc-900 text-zinc-700'
                }`}
                style={{ '--color-rgb': isGLX ? '34,197,94' : '59,130,246' } as any}
              >
                {isSubmitting && <div className="absolute bottom-0 left-0 h-1 bg-white transition-all duration-300" style={{ width: `${uploadProgress}%` }} />}
                <span className="relative z-10">{isSubmitting ? 'Transmitting_Data' : 'Execute_Uplink'}</span>
              </button>
              <p className="text-[7px] text-zinc-700 text-center uppercase tracking-[0.4em] font-mono">
                System_ID: {crypto.randomUUID().split('-')[0].toUpperCase()} // Latency: 24ms
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* SUCCESS MATRIX OVERLAY */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-10 font-mono animate-in fade-in duration-700">
          <div className="w-full max-w-lg space-y-6">
            <div className={`text-4xl font-black mb-8 ${isGLX ? 'text-green-500' : 'text-blue-500'}`}>
              {"> UPLINK_SUCCESSFUL"}
            </div>
            <div className="space-y-2 text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">
              <p>{"> Packaging Cargo_Assets..."} DONE</p>
              <p>{"> Encrypting AES-256..."} DONE</p>
              <p>{"> Dispatching to Central_Node..."} DONE</p>
              <p className="text-white mt-8">{"> Transmission_Hash: " + crypto.randomUUID()}</p>
            </div>
            <button onClick={() => window.location.reload()} className="mt-12 w-full py-4 border border-zinc-800 hover:border-white transition-all text-white text-[10px] font-black uppercase tracking-[0.5em]">
              Close_Session
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 2px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #27272a; }
        
        @keyframes scan {
          0% { background-position: 0 -100vh; }
          100% { background-position: 0 100vh; }
        }
        
        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233f3f46'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1em;
        }
      `}</style>
      
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFile} />
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={handleFile} />
    </div>
  );
};

export default App;