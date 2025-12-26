import React, { useState, useRef, useEffect, useMemo } from 'react';

/**
 * LOGISTICS TERMINAL v1.6 - THE KINETIC UPLINK
 * UX Innovation: Chromatic Pulse Engine & Tactical Chevron Inlays
 * Logic: Sectional Observer for haptic-visual feedback
 */

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
  category: 'bol' | 'freight';
}

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

  // --- KINETIC FEEDBACK STATE ---
  const [pulseActive, setPulseActive] = useState(false);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const freightInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  // --- THEME ENGINE ---
  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const themeHex = isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#06b6d4';
  const themeColor = isGLX ? 'text-green-500' : isBST ? 'text-blue-400' : 'text-cyan-400';
  const themeBg = isGLX ? 'bg-green-500' : isBST ? 'bg-blue-600' : 'bg-cyan-500';

  // --- SECTION OBSERVER (The "Chromatic Pulse" Logic) ---
  const sectionStatus = useMemo(() => ({
    identity: !!(company && driverName),
    shipment: !!(loadNum && bolNum),
    route: !!(puCity && puState && delCity && delState),
    imaging: !!(bolType && uploadedFiles.length > 0)
  }), [company, driverName, loadNum, bolNum, puCity, puState, delCity, delState, bolType, uploadedFiles]);

  useEffect(() => {
    const newlyCompleted = Object.entries(sectionStatus)
      .filter(([_, isDone]) => isDone)
      .map(([name]) => name);

    if (newlyCompleted.length > completedSections.length) {
      triggerPulse();
      setCompletedSections(newlyCompleted);
    }
  }, [sectionStatus]);

  const triggerPulse = () => {
    setPulseActive(true);
    // Acoustic Signature: Low-frequency thump simulation
    audioRef.current?.play().catch(() => {}); 
    setTimeout(() => setPulseActive(false), 600);
  };

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audioRef.current.volume = 0.2;
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
    }, 400);
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

  // --- UI FRAGMENTS ---
  const TacticalSelect = ({ value, onChange, options, placeholder }: any) => (
    <div className="relative group/select">
      <select 
        className="w-full bg-black border border-zinc-900 p-3.5 pr-10 text-xs rounded-xl outline-none text-white focus:border-zinc-600 transition-all font-mono appearance-none"
        value={value}
        onChange={onChange}
      >
        <option value="">{placeholder}</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {/* Tactical Chevron Indicator */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center gap-0.5 opacity-40 group-focus-within/select:opacity-100 group-hover/select:opacity-100 transition-all">
        <svg className={`w-2.5 h-2.5 transition-transform duration-500 group-focus-within/select:rotate-180 ${themeColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="square" strokeWidth="3" d="M5 15l7-7 7 7" />
        </svg>
        <svg className={`w-2.5 h-2.5 transition-transform duration-500 group-focus-within/select:-rotate-180 ${themeColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="square" strokeWidth="3" d="M5 9l7 7 7-7" />
        </svg>
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 font-orbitron">
        <button onMouseDown={handleAuth} className="group relative p-16 border border-zinc-900 bg-zinc-950 rounded-[3rem] transition-all active:scale-95 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-32 h-32 border border-zinc-800 flex items-center justify-center bg-black transition-all group-hover:border-cyan-500 group-hover:shadow-[0_0_50px_rgba(6,182,212,0.2)] relative z-10">
            <span className="text-5xl grayscale group-hover:grayscale-0 transition-all">{isAuthenticating ? '📡' : '🔐'}</span>
          </div>
          <p className="mt-8 text-[10px] font-black tracking-[1em] text-zinc-700 uppercase text-center relative z-10">{isAuthenticating ? 'Decrypting...' : 'Auth_Secure'}</p>
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#020202] text-zinc-300 font-orbitron relative pb-24 overflow-x-hidden transition-all duration-500 ${shake ? 'animate-shake' : ''}`}>
      
      {/* CHROMATIC PULSE OVERLAY */}
      <div className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 ${pulseActive ? 'opacity-100' : 'opacity-[0.03]'}`}>
        <div className={`absolute inset-0 ${themeBg}`} />
        <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto p-6 space-y-12">
        {/* --- HEADER --- */}
        <header className="flex justify-between items-end border-b border-zinc-900 pb-8 pt-4">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black transition-all duration-700 border-2 ${isGLX ? 'bg-green-500 text-black border-green-400' : isBST ? 'bg-blue-600 text-white border-blue-400' : 'bg-zinc-900 text-zinc-700 border-zinc-800'}`}>
              <span className="text-xl">{isGLX ? 'GLX' : isBST ? 'BST' : '?'}</span>
            </div>
            <div className="space-y-1">
              <h1 className={`text-2xl font-black tracking-tighter uppercase ${themeColor}`}>Terminal v1.6</h1>
              <p className="text-[8px] text-zinc-600 tracking-[0.5em] font-bold uppercase">Sectional_Sync_Enabled</p>
            </div>
          </div>
        </header>

        {/* --- IDENTITY --- */}
        <section className={`transition-all duration-500 p-1 rounded-2xl ${sectionStatus.identity ? 'bg-zinc-900/20' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={`text-[9px] font-black uppercase tracking-[0.3em] ${themeColor}`}>Carrier Identity</label>
              <TacticalSelect 
                value={company} 
                onChange={(e: any) => setCompany(e.target.value)} 
                options={['GLX', 'BST']} 
                placeholder="-- SELECT CARRIER --" 
              />
            </div>
            <div className="space-y-2">
              <label className={`text-[9px] font-black uppercase tracking-[0.3em] ${themeColor}`}>Operator Name</label>
              <input type="text" placeholder="ENTER NAME" className="w-full bg-black border border-zinc-900 p-3.5 text-xs rounded-xl outline-none text-white focus:border-zinc-600 transition-all font-mono" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
            </div>
          </div>
        </section>

        {/* --- SHIPMENT DATA --- */}
        <section className="bg-zinc-950/50 p-6 rounded-3xl border border-zinc-900/50 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7z"/></svg>
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Shipment_Reference</h2>
          <div className="grid grid-cols-2 gap-6">
            <input type="text" placeholder="LOAD #" className="bg-black border border-zinc-900 p-3.5 text-xs rounded-xl outline-none text-white focus:border-zinc-600 transition-all font-mono" value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
            <input type="text" placeholder="BOL #" className="bg-black border border-zinc-900 p-3.5 text-xs rounded-xl outline-none text-white focus:border-zinc-600 transition-all font-mono" value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
          </div>
        </section>

        {/* --- LOGISTICS ROUTE --- */}
        <section className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-2">
               <label className={`text-[9px] font-black uppercase tracking-[0.3em] ${themeColor} mb-2 block`}>Pickup Origin</label>
               <input type="text" placeholder="CITY" className="w-full bg-black border border-zinc-900 p-3.5 text-xs rounded-xl outline-none text-white focus:border-zinc-600 transition-all font-mono" value={puCity} onChange={(e) => setPuCity(e.target.value)} />
             </div>
             <div className="pt-5">
               <TacticalSelect value={puState} onChange={(e: any) => setPuState(e.target.value)} options={states} placeholder="STATE" />
             </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-2">
               <label className={`text-[9px] font-black uppercase tracking-[0.3em] ${themeColor} mb-2 block`}>Delivery Destination</label>
               <input type="text" placeholder="CITY" className="w-full bg-black border border-zinc-900 p-3.5 text-xs rounded-xl outline-none text-white focus:border-zinc-600 transition-all font-mono" value={delCity} onChange={(e) => setDelCity(e.target.value)} />
             </div>
             <div className="pt-5">
               <TacticalSelect value={delState} onChange={(e: any) => setDelState(e.target.value)} options={states} placeholder="STATE" />
             </div>
          </div>
        </section>

        {/* --- NEURAL IMAGING (BOL) --- */}
        <section className="space-y-6">
          <div className={`flex justify-between items-center border-b pb-4 transition-colors duration-500 ${sectionStatus.imaging ? themeColor.replace('text-', 'border-').replace('500', '500/50') : 'border-zinc-900'}`}>
            <h2 className={`text-[11px] font-black uppercase tracking-[0.4em] ${themeColor}`}>Neural Imaging</h2>
            <div className="flex gap-6">
               <label className="flex items-center gap-3 text-[9px] font-bold cursor-pointer group uppercase">
                 <input type="radio" name="bol" className="hidden" onChange={() => setBolType('pickup')} />
                 <span className={`w-4 h-4 rounded-full border border-zinc-700 transition-all flex items-center justify-center ${bolType === 'pickup' ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'group-hover:border-zinc-500'}`}>
                    {bolType === 'pickup' && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                 </span> PU BOL
               </label>
               <label className="flex items-center gap-3 text-[9px] font-bold cursor-pointer group uppercase">
                 <input type="radio" name="bol" className="hidden" onChange={() => setBolType('delivery')} />
                 <span className={`w-4 h-4 rounded-full border border-zinc-700 transition-all flex items-center justify-center ${bolType === 'delivery' ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'group-hover:border-zinc-500'}`}>
                    {bolType === 'delivery' && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                 </span> DEL POD
               </label>
            </div>
          </div>

          <div className="p-12 border-2 border-zinc-900 bg-zinc-950 flex flex-col md:flex-row items-center justify-around gap-12 group/img relative overflow-hidden rounded-[2.5rem] shadow-inner">
            <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center gap-6 group/btn active:scale-95 transition-all relative z-10">
              <div className={`w-32 h-32 border border-zinc-800 flex items-center justify-center bg-black transition-all ${themeColor.replace('text-', 'group-hover/btn:border-')} ${isGLX ? 'group-hover/btn:shadow-[0_0_40px_rgba(34,197,94,0.15)]' : 'group-hover/btn:shadow-[0_0_40px_rgba(59,130,246,0.15)]'}`}>
                <span className="text-6xl grayscale group-hover/btn:grayscale-0 transition-all transform group-hover/btn:scale-110 duration-500">📸</span>
              </div>
              <span className="text-[10px] font-black tracking-[1em] text-zinc-800 uppercase group-hover/btn:text-white transition-colors">Neural_Cam</span>
            </button>

            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-6 group/btn active:scale-95 transition-all relative z-10">
              <div className={`w-32 h-32 border border-zinc-800 flex items-center justify-center bg-black transition-all ${themeColor.replace('text-', 'group-hover/btn:border-')} ${isGLX ? 'group-hover/btn:shadow-[0_0_40px_rgba(34,197,94,0.15)]' : 'group-hover/btn:shadow-[0_0_40px_rgba(59,130,246,0.15)]'}`}>
                <span className="text-6xl grayscale group-hover/btn:grayscale-0 transition-all transform group-hover/btn:scale-110 duration-500">📂</span>
              </div>
              <span className="text-[10px] font-black tracking-[1em] text-zinc-800 uppercase group-hover/btn:text-white transition-colors">Local_Vault</span>
            </button>
          </div>

          {uploadedFiles.filter(f => f.category === 'bol').length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-6 animate-in zoom-in-95 duration-500">
              {uploadedFiles.filter(f => f.category === 'bol').map(f => (
                <div key={f.id} className="relative aspect-[3/4] border border-zinc-800 rounded-2xl overflow-hidden group shadow-2xl">
                  <img src={f.preview} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt="BOL" />
                  <div className={`absolute top-0 left-0 w-full h-[3px] animate-scan ${themeBg}`} />
                  <button onClick={() => setUploadedFiles(p => p.filter(i => i.id !== f.id))} className="absolute top-3 right-3 w-7 h-7 bg-red-600/90 text-white rounded-full text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all hover:scale-110">✕</button>
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-black/60 backdrop-blur-sm text-[7px] text-zinc-400 font-mono truncate">{f.file.name}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- FREIGHT --- */}
        <section className="space-y-6">
          <h2 className={`text-[11px] font-black uppercase tracking-[0.4em] ${themeColor} border-b border-zinc-900 pb-4`}>Freight Inspection</h2>
          <button 
            onClick={() => freightInputRef.current?.click()}
            className="w-full py-16 border-2 border-dashed border-zinc-900 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.6em] text-zinc-700 hover:text-zinc-400 hover:border-zinc-700 transition-all bg-zinc-950/30 group/freight"
          >
            <span className="flex items-center justify-center gap-4">
               <span className="text-xl group-hover/freight:scale-125 transition-transform duration-500">🚛</span> 
               <span>Upload_Inspection_Assets</span>
            </span>
          </button>
        </section>

        {/* --- TRANSMISSION --- */}
        <div className="pt-8">
          <button 
            onClick={() => { if(!company || !driverName || uploadedFiles.length === 0) { setShake(true); setTimeout(()=>setShake(false),500); } else { setIsSubmitting(true); setTimeout(()=>setShowSuccess(true),2500); }}}
            disabled={isSubmitting}
            className={`w-full py-9 rounded-[2.5rem] font-black text-sm uppercase tracking-[1.2em] transition-all duration-700 relative overflow-hidden group ${isGLX ? 'bg-green-600 text-black shadow-lg shadow-green-500/20' : isBST ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-zinc-900 text-zinc-700 border border-zinc-800'}`}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-20" />
            <span className="relative z-10">{isSubmitting ? 'UPLOADING_ENCRYPTED_PACKET...' : 'Execute_Transmission'}</span>
            {isSubmitting && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
          </button>
        </div>
      </div>

      {/* --- SUCCESS OVERLAY --- */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-10 animate-in fade-in zoom-in duration-700">
           <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center text-6xl mb-12 animate-success-bounce ${isGLX ? 'border-green-500 text-green-500 shadow-[0_0_60px_rgba(34,197,94,0.4)]' : 'border-blue-500 text-blue-500 shadow-[0_0_60px_rgba(59,130,246,0.4)]'}`}>✓</div>
           <h2 className="text-4xl font-black uppercase tracking-[0.6em] text-white text-center mb-16">Verified</h2>
           <button onClick={() => window.location.reload()} className="w-full max-w-sm py-6 border border-zinc-800 rounded-2xl text-[11px] font-black uppercase tracking-[0.5em] text-white hover:bg-white/5 transition-all shadow-2xl">Initialize_New_Protocol</button>
        </div>
      )}

      <style>{`
        @keyframes scan { 0% { top: -10%; opacity: 0; } 50% { opacity: 1; } 100% { top: 110%; opacity: 0; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        @keyframes success-bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-30px);} 60% {transform: translateY(-15px);} }
        .animate-scan { animation: scan 4s ease-in-out infinite; }
        .animate-shake { animation: shake 0.1s linear infinite; }
        .animate-success-bounce { animation: success-bounce 2s ease infinite; }
        select { -webkit-appearance: none; appearance: none; }
      `}</style>

      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => onFileSelect(e, 'bol')} />
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={(e) => onFileSelect(e, 'bol')} />
      <input type="file" ref={freightInputRef} className="hidden" multiple accept="image/*" onChange={(e) => onFileSelect(e, 'freight')} />
    </div>
  );
};

export default App;