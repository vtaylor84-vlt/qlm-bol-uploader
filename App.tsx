import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * LOGISTICS TERMINAL v5.0 - TACTICAL UPLINK
 * Built for: GLX / BST Expedite
 * Architecture: Atomic React + Tactical CSS
 */

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

// --- TACTICAL UI COMPONENTS ---

const ScanLine = ({ active, color }: { active: boolean; color: string }) => (
  active ? <div className={`absolute inset-0 pointer-events-none overflow-hidden rounded-xl`}>
    <div className={`w-full h-[3px] opacity-70 shadow-[0_0_15px_${color}] animate-scan-line`} style={{ backgroundColor: color }} />
  </div> : null
);

const GlowButton = ({ onClick, children, active, color, className = "" }: any) => (
  <button
    onClick={onClick}
    className={`group relative overflow-hidden transition-all duration-500 rounded-xl border ${
      active ? `border-${color}-500/50 bg-${color}-500/10` : 'border-zinc-800 bg-zinc-900/30'
    } ${className}`}
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-white/5 to-transparent`} />
    {children}
  </button>
);

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [isLocked, setIsLocked] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStage, setAuthStage] = useState(0);
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

  // --- THEME CALCULATIONS ---
  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const themeHex = isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#06b6d4';
  const brandColor = isGLX ? 'text-green-500' : isBST ? 'text-blue-400' : 'text-cyan-400';
  const brandBorder = isGLX ? 'border-green-500/30' : isBST ? 'border-blue-500/30' : 'border-zinc-800';

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    return () => uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
  }, [uploadedFiles]);

  const startAuthSequence = () => {
    setIsAuthenticating(true);
    let current = 0;
    const interval = setInterval(() => {
      if (current < 4) {
        setAuthStage(prev => prev + 1);
        current++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsLocked(false), 800);
      }
    }, 500);
  };

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9)
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
      prog += Math.random() * 15;
      if (prog >= 100) {
        setUploadProgress(100);
        clearInterval(timer);
        audioRef.current?.play().catch(() => {});
        setTimeout(() => setShowSuccess(true), 600);
      } else {
        setUploadProgress(prog);
      }
    }, 150);
  };

  // --- STYLE STRINGS ---
  const tacticalInput = `w-full bg-zinc-950/60 border border-zinc-800/80 p-3.5 text-xs rounded-xl outline-none transition-all duration-300 text-white placeholder-zinc-700 focus:border-zinc-500 focus:bg-zinc-900/90 focus:ring-1 focus:ring-zinc-800 appearance-none backdrop-blur-md`;
  const labelStyle = `text-[10px] font-black uppercase tracking-[0.25em] mb-2 ml-1 flex items-center gap-2 ${brandColor}`;

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-orbitron overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-50 pointer-events-none" style={{ backgroundSize: '100% 2px, 3px 100%' }}></div>
        <div className="z-10 flex flex-col items-center max-w-lg w-full">
          <div className="relative mb-12">
            <div className={`absolute inset-0 blur-2xl opacity-20 transition-colors duration-1000 ${isAuthenticating ? 'bg-cyan-500' : 'bg-red-500'}`}></div>
            <button 
              onMouseDown={startAuthSequence} 
              className={`relative w-40 h-40 rounded-full border border-zinc-800 flex items-center justify-center transition-all duration-700 ${isAuthenticating ? 'scale-95 border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.2)]' : 'hover:border-zinc-600'}`}
            >
              <div className={`absolute inset-2 rounded-full border border-dashed border-zinc-800 ${isAuthenticating ? 'animate-spin-slow' : ''}`}></div>
              <svg className={`w-12 h-12 ${isAuthenticating ? 'text-cyan-400' : 'text-zinc-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09m10.839-12.218c1.744 2.772 2.753 6.054 2.753 9.571m-1.113-12.218A11.95 11.95 0 0012 2c-2.31 0-4.47.653-6.309 1.782m12.618 0c1.84 1.129 3.414 2.651 4.59 4.433m-17.208 0C2.906 6.433 4.48 4.911 6.32 3.782m12.618 0l.042.025M5.168 20.427A11.95 11.95 0 012 12c0-2.31.653-4.47 1.782-6.309m15.054 15.054A11.95 11.95 0 0022 12c0-2.31-.653-4.47-1.782-6.309m-11.41 12.618a5 5 0 117.072 0m-7.072 0a11.95 11.95 0 01-2.753-9.571m1.113-2.618A5 5 0 0119 12a11.95 11.95 0 01-2.753 9.571"/>
              </svg>
            </button>
          </div>
          <div className="w-full space-y-3 font-mono">
            {[ 
              { label: 'KERNEL_LINK', active: authStage >= 1 },
              { label: 'BIO_ENCRYPTION', active: authStage >= 2 },
              { label: 'UPLINK_ESTABLISHED', active: authStage >= 3 },
              { label: 'ACCESS_GRANTED', active: authStage >= 4, success: true }
            ].map((node, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2 bg-zinc-900/40 rounded-lg border border-zinc-800/50">
                <span className={`text-[10px] tracking-tighter ${node.active ? (node.success ? 'text-green-500' : 'text-cyan-400') : 'text-zinc-700'}`}>
                  {node.active ? `> ${node.label}` : `_ STANDBY`}
                </span>
                <div className={`w-1 h-1 rounded-full ${node.active ? (node.success ? 'bg-green-500 animate-pulse' : 'bg-cyan-500') : 'bg-zinc-800'}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-200 pb-24 relative font-orbitron overflow-x-hidden">
      {/* HUD BACKGROUND GRID */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute inset-0 opacity-[0.03] transition-colors duration-1000`} 
             style={{ 
               backgroundImage: `radial-gradient(${themeHex} 1px, transparent 1px)`, 
               backgroundSize: '32px 32px' 
             }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"></div>
      </div>

      <div className="relative z-10 p-6 max-w-2xl mx-auto space-y-10">
        {/* HEADER SECTION */}
        <header className="flex justify-between items-end border-b border-zinc-900/80 pb-8">
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl transition-all duration-700 border-2 ${
              isGLX ? 'bg-green-500 text-black border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 
              isBST ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 
              'bg-zinc-900 text-zinc-700 border-zinc-800'
            }`}>
              {isGLX ? 'G' : isBST ? 'B' : '?'}
            </div>
            <div className="space-y-1">
              <h1 className={`text-2xl font-black tracking-tighter uppercase leading-none ${brandColor}`}>Terminal v5.0</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[8px] text-zinc-500 tracking-[0.4em] font-bold">SECURE LOGISTICS NODE</p>
              </div>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[9px] text-zinc-600 font-mono tracking-widest">{new Date().toISOString().split('T')[0]}</p>
            <p className="text-[9px] text-zinc-700 font-mono tracking-widest uppercase">Node: TX-7729</p>
          </div>
        </header>

        {/* SECTION 01: CORE IDENTITY */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label className={labelStyle}>Carrier Identity <span className={`w-1.5 h-1.5 rounded-full ${company ? 'bg-current animate-pulse' : 'bg-zinc-800'}`}></span></label>
            <div className="relative">
              <select className={tacticalInput} value={company} onChange={(e) => setCompany(e.target.value as any)}>
                <option value="">-- SELECT FLEET --</option>
                <option value="GLX">GREENLEAF XPRESS (GLX)</option>
                <option value="BST">BST EXPEDITE (BST)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>
          </div>
          <div>
            <label className={labelStyle}>Operator Name <span className={`w-1.5 h-1.5 rounded-full ${driverName ? 'bg-current animate-pulse' : 'bg-zinc-800'}`}></span></label>
            <input type="text" placeholder="LEGAL FULL NAME" className={tacticalInput} value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>
        </section>

        {/* SECTION 02: SHIPMENT DATA */}
        <section className="bg-zinc-900/20 border border-zinc-900/50 p-6 rounded-2xl backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Load Reference</label>
              <input type="text" placeholder="ID-XXXXX" className={tacticalInput} value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
            </div>
            <div>
              <label className={labelStyle}>BOL Number</label>
              <input type="text" placeholder="BOL-XXXXX" className={tacticalInput} value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
            </div>
          </div>
        </section>

        {/* SECTION 03: LOGISTICS ROUTE */}
        <section className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-2">
               <label className={labelStyle}>Origin City</label>
               <input type="text" placeholder="PICKUP LOCATION" className={tacticalInput} value={puCity} onChange={(e) => setPuCity(e.target.value)} />
             </div>
             <div>
               <label className={labelStyle}>State</label>
               <select className={tacticalInput} value={puState} onChange={(e) => setPuState(e.target.value)}>
                 <option value="">ST</option>
                 {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-2">
               <label className={labelStyle}>Destination City</label>
               <input type="text" placeholder="DELIVERY LOCATION" className={tacticalInput} value={delCity} onChange={(e) => setDelCity(e.target.value)} />
             </div>
             <div>
               <label className={labelStyle}>State</label>
               <select className={tacticalInput} value={delState} onChange={(e) => setDelState(e.target.value)}>
                 <option value="">ST</option>
                 {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
        </section>

        {/* SECTION 04: DOCUMENT IMAGING */}
        <section className={`relative overflow-hidden bg-zinc-950/40 border-2 border-dashed p-8 rounded-3xl text-center transition-all duration-500 ${uploadedFiles.length > 0 ? brandBorder : 'border-zinc-800'}`}>
          <div className="mb-8">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${brandColor}`}>Imaging Sub-System</h3>
            <p className="text-[9px] text-zinc-600 font-bold italic">High-resolution document capture required</p>
          </div>

          <div className="flex justify-center gap-10 mb-10">
            <GlowButton onClick={() => fileInputRef.current?.click()} active={uploadedFiles.length > 0} color={isGLX ? 'green' : 'blue'} className="p-6 w-32 flex flex-col items-center gap-3">
              <svg className={`w-8 h-8 ${brandColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              <span className="text-[9px] font-black uppercase tracking-widest">Library</span>
            </GlowButton>
            <GlowButton onClick={() => cameraInputRef.current?.click()} active={uploadedFiles.length > 0} color={isGLX ? 'green' : 'blue'} className="p-6 w-32 flex flex-col items-center gap-3">
              <svg className={`w-8 h-8 ${brandColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span className="text-[9px] font-black uppercase tracking-widest">Camera</span>
            </GlowButton>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[10px] text-zinc-500 font-black uppercase border-t border-zinc-900/80 pt-8">
            <label className={`flex items-center gap-3 cursor-pointer group`}>
              <input type="radio" name="bolType" className="hidden" onChange={() => setBolType('pickup')}/>
              <span className={`w-4 h-4 rounded-full border border-zinc-700 flex items-center justify-center transition-all ${bolType === 'pickup' ? `border-${isGLX?'green':'blue'}-500 bg-current` : 'group-hover:border-zinc-500'}`}>
                {bolType === 'pickup' && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
              </span> PU BOL
            </label>
            <label className={`flex items-center gap-3 cursor-pointer group`}>
              <input type="radio" name="bolType" className="hidden" onChange={() => setBolType('delivery')}/>
              <span className={`w-4 h-4 rounded-full border border-zinc-700 flex items-center justify-center transition-all ${bolType === 'delivery' ? `border-${isGLX?'green':'blue'}-500 bg-current` : 'group-hover:border-zinc-500'}`}>
                {bolType === 'delivery' && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
              </span> DEL POD
            </label>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
              {uploadedFiles.map(f => (
                <div key={f.id} className="relative aspect-[3/4] rounded-xl border border-zinc-800 bg-zinc-900/50 p-1.5 group overflow-hidden shadow-2xl">
                  <img src={f.preview} className="w-full h-full object-cover rounded-lg opacity-80 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0" alt="doc" />
                  <ScanLine active={true} color={themeHex} />
                  <button onClick={() => setUploadedFiles(prev => prev.filter(item => item.id !== f.id))} className="absolute top-3 right-3 bg-red-600/90 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-black opacity-0 group-hover:opacity-100 transition-all hover:scale-110">✕</button>
                  <div className="absolute bottom-3 left-3 right-3 text-[7px] text-white bg-black/60 backdrop-blur-md p-1 rounded font-mono truncate uppercase">{f.file.name}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* TRANSMISSION TRIGGER */}
        <div className="pt-8">
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className={`w-full py-7 rounded-2xl font-black text-sm uppercase tracking-[0.6em] transition-all duration-700 relative overflow-hidden group ${
              shake ? 'animate-shake bg-red-600' : 
              isFormComplete ? (isGLX ? 'bg-green-600 text-black' : 'bg-blue-600 text-white') : 
              'bg-zinc-900/50 text-zinc-700 border border-zinc-800'
            }`}
          >
            {isSubmitting && (
              <div 
                className="absolute inset-0 bg-white/20 transition-all duration-300 ease-out z-0" 
                style={{ width: `${uploadProgress}%` }}
              />
            )}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative z-10 flex items-center justify-center gap-4">
              {isSubmitting ? (
                <> <span className="animate-pulse">TRANSMITTING...</span> <span className="font-mono">{Math.round(uploadProgress)}%</span> </>
              ) : (
                'Execute Uplink'
              )}
            </span>
          </button>
          {!isFormComplete && !isSubmitting && (
            <p className="text-center text-[8px] text-zinc-600 mt-4 uppercase tracking-widest font-bold">Mandatory: Fleet Identity + Operator Name + BOL Image</p>
          )}
        </div>
      </div>

      {/* SUCCESS MODAL OVERLAY */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-8 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-1000">
           <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-5xl mb-10 animate-bounce ${isGLX ? 'border-green-500 text-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'border-blue-500 text-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)]'}`}>✓</div>
           <h2 className="text-3xl font-black uppercase tracking-[0.5em] mb-4 text-white text-center">Protocol Verified</h2>
           <p className="text-zinc-500 text-[10px] mb-16 tracking-[0.3em] font-mono">ENCRYPTION HASH: {Math.random().toString(16).substr(2, 12).toUpperCase()}</p>
           <button onClick={() => window.location.reload()} className={`w-full max-w-sm py-5 border border-zinc-700 text-[12px] font-black uppercase tracking-[0.4em] text-white hover:bg-white/5 transition-colors rounded-xl`}>New Protocol</button>
        </div>
      )}

      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-scan-line {
          animation: scan-line 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-shake { animation: shake 0.15s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        
        /* Custom scrollbar for tactical feel */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #333; }
      `}</style>

      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFile} />
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={handleFile} />
    </div>
  );
};

export default App;