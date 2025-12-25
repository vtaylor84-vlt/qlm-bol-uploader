import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * LOGISTICS TERMINAL v1.2 - TACTICAL UPLINK (PREMIUM GRADE)
 * Author: Senior Expert Design & Dev
 * Implementation: Atomic React + Tailwind High-Fidelity
 */

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
  category: 'bol' | 'freight';
}

// --- TACTICAL UI SUB-COMPONENTS ---

const ScanLine = ({ active, color }: { active: boolean; color: string }) => (
  active ? (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      <div 
        className="w-full h-[2px] opacity-60 animate-scan-line" 
        style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }} 
      />
    </div>
  ) : null
);

const TacticalLabel = ({ children, active, color }: { children: React.ReactNode; active: boolean; color: string }) => (
  <label className={`text-[10px] font-black uppercase tracking-[0.25em] mb-2 ml-1 flex items-center gap-2 transition-colors duration-500 ${active ? color : 'text-zinc-600'}`}>
    {children}
    <span className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${active ? `bg-current shadow-[0_0_8px_currentColor] animate-pulse` : 'bg-zinc-800'}`} />
  </label>
);

const App: React.FC = () => {
  // --- STATE SYSTEM ---
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
  const freightInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  // --- THEME ENGINE ---
  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const themeHex = isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#52525b';
  const themeColor = isGLX ? 'text-green-500' : isBST ? 'text-blue-400' : 'text-zinc-500';
  const themeBg = isGLX ? 'bg-green-500/5' : isBST ? 'bg-blue-500/5' : 'bg-transparent';
  const themeBorder = isGLX ? 'border-green-500/30' : isBST ? 'border-blue-500/30' : 'border-zinc-800';

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  // --- LOGIC HANDLERS ---
  const handleAuth = () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      setAuthStage(stage);
      if (stage >= 4) {
        clearInterval(interval);
        setTimeout(() => setIsLocked(false), 600);
      }
    }, 450);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>, category: 'bol' | 'freight') => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: `${file.name}-${Date.now()}`,
        category
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleTransmission = () => {
    if (!company || !driverName || uploadedFiles.length === 0) {
      setShake(true);
      setTimeout(() => setShake(false), 800);
      return;
    }

    setIsSubmitting(true);
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 10;
      if (prog >= 100) {
        setUploadProgress(100);
        clearInterval(interval);
        audioRef.current?.play().catch(() => {});
        setTimeout(() => setShowSuccess(true), 800);
      } else {
        setUploadProgress(prog);
      }
    }, 150);
  };

  const inputStyle = `w-full bg-black border border-zinc-800 p-4 text-xs rounded-xl outline-none text-white transition-all duration-300 placeholder-zinc-800 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-800 appearance-none`;

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 font-orbitron overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#111_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />
        <div className="relative z-10 w-full max-w-md p-10 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] shadow-2xl text-center">
          <div className="mb-10 relative inline-block">
             <div className={`absolute inset-0 blur-3xl transition-colors duration-1000 ${isAuthenticating ? 'bg-cyan-500/20' : 'bg-red-500/10'}`} />
             <button 
                onMouseDown={handleAuth} 
                onTouchStart={handleAuth}
                className={`relative w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${isAuthenticating ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)] scale-95' : 'border-zinc-800 hover:border-zinc-700'}`}
             >
                <span className={`text-4xl transition-transform duration-500 ${isAuthenticating ? 'scale-110' : ''}`}>☝️</span>
                {isAuthenticating && <div className="absolute inset-0 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />}
             </button>
          </div>
          <h1 className="text-white text-lg font-black tracking-[0.4em] uppercase mb-8">System Access</h1>
          <div className="space-y-3 font-mono">
            {['ENCRYPT_LINK', 'GEO_VERIFY', 'UPLINK_SECURE', 'AUTHORIZED'].map((step, i) => (
              <div key={step} className={`text-[9px] flex justify-between items-center px-4 py-2 rounded-lg border transition-colors ${authStage > i ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5' : 'border-zinc-900 text-zinc-700'}`}>
                <span>{`> ${step}`}</span>
                <span className={authStage > i ? 'animate-pulse' : ''}>{authStage > i ? '[OK]' : '[--]'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#020202] text-zinc-300 font-orbitron relative transition-colors duration-1000 pb-20 overflow-x-hidden ${shake ? 'animate-shake' : ''}`}>
      {/* HUD BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${themeHex} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto p-6 space-y-8">
        {/* HEADER SECTION */}
        <header className="flex justify-between items-center border-b border-zinc-900 pb-8 pt-4">
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black leading-none transition-all duration-700 border-2 ${
              isGLX ? 'bg-green-500 text-black border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]' :
              isBST ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]' :
              'bg-zinc-900 text-zinc-700 border-zinc-800'
            }`}>
              <span className="text-xl">{isGLX ? 'GLX' : isBST ? 'BST' : '?'}</span>
            </div>
            <div>
              <h1 className={`text-xl font-black tracking-tighter uppercase ${themeColor}`}>Terminal v1.2</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-[7px] text-zinc-600 tracking-[0.5em] font-bold">ENCRYPTED UPLINK</p>
              </div>
            </div>
          </div>
          <div className="text-right font-mono hidden xs:block">
            <p className="text-[9px] text-zinc-600 uppercase tracking-widest">{new Date().toLocaleDateString()}</p>
            <p className="text-[9px] text-zinc-700 uppercase tracking-widest">Node: TX-UPLINK</p>
          </div>
        </header>

        {/* CORE IDENTITY MODULE */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-1 rounded-2xl transition-all duration-500 ${company ? themeBg : ''}`}>
            <TacticalLabel active={!!company} color={themeColor}>Carrier Identity</TacticalLabel>
            <select className={inputStyle} value={company} onChange={(e) => setCompany(e.target.value as any)}>
              <option value="">-- SELECT FLEET --</option>
              <option value="GLX">GREENLEAF XPRESS (GLX)</option>
              <option value="BST">BST EXPEDITE (BST)</option>
            </select>
          </div>
          <div className={`p-1 rounded-2xl transition-all duration-500 ${driverName ? themeBg : ''}`}>
            <TacticalLabel active={!!driverName} color={themeColor}>Operator Name</TacticalLabel>
            <input type="text" placeholder="LEGAL FULL NAME" className={inputStyle} value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>
        </section>

        {/* SHIPMENT DATA MODULE */}
        <section className="grid grid-cols-2 gap-6 bg-zinc-900/10 p-4 rounded-2xl border border-zinc-900/50">
          <div>
            <TacticalLabel active={!!loadNum} color={themeColor}>Load Reference</TacticalLabel>
            <input type="text" placeholder="LOAD #" className={inputStyle} value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
          </div>
          <div>
            <TacticalLabel active={!!bolNum} color={themeColor}>BOL Reference</TacticalLabel>
            <input type="text" placeholder="BOL #" className={inputStyle} value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
          </div>
        </section>

        {/* ROUTE MODULE */}
        <section className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-2">
               <TacticalLabel active={!!puCity} color={themeColor}>Origin City</TacticalLabel>
               <input type="text" placeholder="CITY" className={inputStyle} value={puCity} onChange={(e) => setPuCity(e.target.value)} />
             </div>
             <div>
               <TacticalLabel active={!!puState} color={themeColor}>State</TacticalLabel>
               <select className={inputStyle} value={puState} onChange={(e) => setPuState(e.target.value)}>
                 <option value="">ST</option>
                 {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-2">
               <TacticalLabel active={!!delCity} color={themeColor}>Destination City</TacticalLabel>
               <input type="text" placeholder="CITY" className={inputStyle} value={delCity} onChange={(e) => setDelCity(e.target.value)} />
             </div>
             <div>
               <TacticalLabel active={!!delState} color={themeColor}>State</TacticalLabel>
               <select className={inputStyle} value={delState} onChange={(e) => setDelState(e.target.value)}>
                 <option value="">ST</option>
                 {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
        </section>

        {/* DOCUMENT IMAGING SUBSYSTEM */}
        <section className={`relative overflow-hidden bg-zinc-950/40 border-2 border-dashed p-8 rounded-[2rem] transition-all duration-700 ${uploadedFiles.length > 0 ? themeBorder : 'border-zinc-900'}`}>
          <div className="text-center mb-8">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-2 ${themeColor}`}>Imaging Sub-System</h3>
            <p className="text-[8px] text-zinc-600 font-bold uppercase italic">High-Res Capture Required</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mb-10">
            <label className={`flex items-center gap-3 cursor-pointer group text-[10px] font-black uppercase tracking-widest ${bolType === 'pickup' ? 'text-white' : 'text-zinc-600'}`}>
              <input type="radio" name="bolType" className="hidden" onChange={() => setBolType('pickup')}/>
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${bolType === 'pickup' ? themeBorder : 'border-zinc-800'}`}>
                {bolType === 'pickup' && <div className={`w-2 h-2 rounded-full ${isGLX ? 'bg-green-500' : 'bg-blue-500'}`} />}
              </span> PU BOL
            </label>
            <label className={`flex items-center gap-3 cursor-pointer group text-[10px] font-black uppercase tracking-widest ${bolType === 'delivery' ? 'text-white' : 'text-zinc-600'}`}>
              <input type="radio" name="bolType" className="hidden" onChange={() => setBolType('delivery')}/>
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${bolType === 'delivery' ? themeBorder : 'border-zinc-800'}`}>
                {bolType === 'delivery' && <div className={`w-2 h-2 rounded-full ${isGLX ? 'bg-green-500' : 'bg-blue-500'}`} />}
              </span> DEL POD
            </label>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-10">
            <button onClick={() => fileInputRef.current?.click()} className={`flex flex-col items-center gap-3 p-6 rounded-2xl border border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all ${themeColor}`}>
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
               <span className="text-[9px] font-black uppercase tracking-widest">Library</span>
            </button>
            <button onClick={() => cameraInputRef.current?.click()} className={`flex flex-col items-center gap-3 p-6 rounded-2xl border border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all ${themeColor}`}>
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
               <span className="text-[9px] font-black uppercase tracking-widest">Camera</span>
            </button>
          </div>

          {uploadedFiles.filter(f => f.category === 'bol').length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {uploadedFiles.filter(f => f.category === 'bol').map(f => (
                <div key={f.id} className="relative aspect-[3/4] rounded-xl border border-zinc-800 overflow-hidden group">
                  <img src={f.preview} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt="BOL" />
                  <ScanLine active={true} color={themeHex} />
                  <button onClick={() => setUploadedFiles(prev => prev.filter(i => i.id !== f.id))} className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* TRAILER/FREIGHT MODULE */}
        <section className="bg-zinc-950/20 border border-zinc-900 p-8 rounded-[2rem] text-center">
           <TacticalLabel active={uploadedFiles.some(f => f.category === 'freight')} color={themeColor}>Freight Inspection</TacticalLabel>
           <button 
              onClick={() => freightInputRef.current?.click()}
              className="w-full p-10 border border-zinc-800 border-dashed rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-white hover:border-zinc-600 transition-all"
           >
              Upload Trailer/Freight Photos
           </button>
           {uploadedFiles.filter(f => f.category === 'freight').length > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-8">
              {uploadedFiles.filter(f => f.category === 'freight').map(f => (
                <div key={f.id} className="relative aspect-square rounded-lg border border-zinc-800 overflow-hidden bg-black">
                  <img src={f.preview} className="w-full h-full object-cover opacity-50" alt="Freight" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* TRANSMISSION TRIGGER */}
        <div className="pt-10">
          <button 
            onClick={handleTransmission}
            disabled={isSubmitting}
            className={`group relative w-full py-8 rounded-3xl font-black text-xs uppercase tracking-[0.8em] transition-all duration-700 overflow-hidden ${
              isSubmitting ? 'bg-zinc-900' :
              company ? (isGLX ? 'bg-green-600 text-black shadow-[0_0_40px_rgba(34,197,94,0.2)]' : 'bg-blue-600 text-white shadow-[0_0_40px_rgba(59,130,246,0.2)]') :
              'bg-zinc-900 text-zinc-700 border border-zinc-800'
            }`}
          >
            {isSubmitting && (
              <div className="absolute inset-0 bg-white/10 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            )}
            <span className="relative z-10">
              {isSubmitting ? `TRANS-LOG: ${Math.round(uploadProgress)}%` : 'Execute Transmission'}
            </span>
          </button>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-10 animate-in fade-in duration-700">
           <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center text-5xl mb-12 animate-bounce ${isGLX ? 'border-green-500 text-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'border-blue-500 text-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)]'}`}>
             ✓
           </div>
           <h2 className="text-3xl font-black uppercase tracking-[0.5em] text-white mb-4">Uplink Success</h2>
           <p className="text-zinc-500 font-mono text-[10px] tracking-[0.2em] mb-12">REF_HASH: {Math.random().toString(16).substring(2, 12).toUpperCase()}</p>
           <button onClick={() => window.location.reload()} className="w-full max-w-sm py-5 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] text-white hover:bg-white/5 transition-all">New Protocol</button>
        </div>
      )}

      {/* STYLES & INPUTS */}
      <style>{`
        @keyframes scan-line { 0% { transform: translateY(-100%); } 100% { transform: translateY(500%); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        .animate-scan-line { animation: scan-line 3s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .animate-shake { animation: shake 0.1s ease-in-out infinite; }
        select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-position: right 1rem center; background-repeat: no-repeat; background-size: 1rem; }
      `}</style>
      
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => onFileSelect(e, 'bol')} />
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={(e) => onFileSelect(e, 'bol')} />
      <input type="file" ref={freightInputRef} className="hidden" multiple accept="image/*" onChange={(e) => onFileSelect(e, 'freight')} />
    </div>
  );
};

export default App;