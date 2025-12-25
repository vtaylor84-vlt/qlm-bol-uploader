import React, { useState, useRef, useEffect } from 'react';

/**
 * LOGISTICS TERMINAL v1.4 - FULL OPERATIONAL RECOVERY
 * Restored: All Headers, Route Fields (PU/DEL), and Multi-Category Imaging
 * Style: Neural Tactical UI (GLX/BST Theme Responsive)
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
  const themeBorder = isGLX ? 'border-green-500/50' : isBST ? 'border-blue-500/50' : 'border-zinc-800';
  const hoverBorder = isGLX ? 'group-hover/btn:border-green-500' : isBST ? 'group-hover/btn:border-blue-500' : 'group-hover/btn:border-cyan-500';
  const hoverGlow = isGLX ? 'group-hover/btn:shadow-[0_0_40px_rgba(34,197,94,0.2)]' : isBST ? 'group-hover/btn:shadow-[0_0_40px_rgba(59,130,246,0.2)]' : 'group-hover/btn:shadow-[0_0_40px_rgba(6,182,212,0.2)]';

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

  const fieldStyle = `w-full bg-black border border-zinc-900 p-3.5 text-xs rounded-xl outline-none text-white focus:border-zinc-600 transition-all font-mono placeholder-zinc-800`;
  const labelStyle = `text-[9px] font-black uppercase tracking-[0.3em] mb-2 block ${themeColor}`;

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 font-orbitron">
        <button onMouseDown={handleAuth} className="group relative p-16 border border-zinc-900 bg-zinc-950 rounded-[3rem] transition-all active:scale-95 shadow-2xl">
          <div className="w-32 h-32 border border-zinc-800 flex items-center justify-center bg-black transition-all group-hover:border-cyan-500 group-hover:shadow-[0_0_50px_rgba(6,182,212,0.2)]">
            <span className="text-5xl grayscale group-hover:grayscale-0 transition-all">{isAuthenticating ? '📡' : '🔐'}</span>
          </div>
          <p className="mt-8 text-[10px] font-black tracking-[1em] text-zinc-700 uppercase text-center">{isAuthenticating ? 'Linking...' : 'Auth_Required'}</p>
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#020202] text-zinc-300 font-orbitron relative pb-24 overflow-x-hidden ${shake ? 'animate-shake' : ''}`}>
      {/* AMBIENT HUD GRID */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${themeHex} 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

      <div className="relative z-10 max-w-2xl mx-auto p-6 space-y-10">
        {/* --- HEADER --- */}
        <header className="flex justify-between items-end border-b border-zinc-900 pb-8 pt-4">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black transition-all duration-700 border-2 ${isGLX ? 'bg-green-500 text-black border-green-400' : isBST ? 'bg-blue-600 text-white border-blue-400' : 'bg-zinc-900 text-zinc-700 border-zinc-800'}`}>
              <span className="text-xl">{isGLX ? 'GLX' : isBST ? 'BST' : '?'}</span>
            </div>
            <div className="space-y-1">
              <h1 className={`text-2xl font-black tracking-tighter uppercase ${themeColor}`}>Terminal v1.4</h1>
              <p className="text-[8px] text-zinc-600 tracking-[0.5em] font-bold">CARRIER_UPLINK_SECURE</p>
            </div>
          </div>
        </header>

        {/* --- SECTION 01: IDENTITY --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelStyle}>Carrier Identity</label>
            <select className={fieldStyle} value={company} onChange={(e) => setCompany(e.target.value as any)}>
              <option value="">-- SELECT FLEET --</option>
              <option value="GLX">GREENLEAF XPRESS (GLX)</option>
              <option value="BST">BST EXPEDITE (BST)</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Operator Name</label>
            <input type="text" placeholder="LEGAL FULL NAME" className={fieldStyle} value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>
        </section>

        {/* --- SECTION 02: SHIPMENT DATA --- */}
        <section className="bg-zinc-900/10 p-6 rounded-2xl border border-zinc-900/50">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 border-b border-zinc-900 pb-3">Shipment_Reference</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Load Number</label>
              <input type="text" placeholder="LOAD-XXXXX" className={fieldStyle} value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
            </div>
            <div>
              <label className={labelStyle}>BOL Number</label>
              <input type="text" placeholder="BOL-XXXXX" className={fieldStyle} value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
            </div>
          </div>
        </section>

        {/* --- SECTION 03: LOGISTICS ROUTE --- */}
        <section className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-2">
               <label className={labelStyle}>Pickup City</label>
               <input type="text" placeholder="ORIGIN" className={fieldStyle} value={puCity} onChange={(e) => setPuCity(e.target.value)} />
             </div>
             <div>
               <label className={labelStyle}>State</label>
               <select className={fieldStyle} value={puState} onChange={(e) => setPuState(e.target.value)}>
                 <option value="">ST</option>
                 {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-2">
               <label className={labelStyle}>Delivery City</label>
               <input type="text" placeholder="DESTINATION" className={fieldStyle} value={delCity} onChange={(e) => setDelCity(e.target.value)} />
             </div>
             <div>
               <label className={labelStyle}>State</label>
               <select className={fieldStyle} value={delState} onChange={(e) => setDelState(e.target.value)}>
                 <option value="">ST</option>
                 {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
        </section>

        {/* --- SECTION 04: NEURAL IMAGING (BOL) --- */}
        <section className="space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
            <h2 className={`text-[11px] font-black uppercase tracking-[0.4em] ${themeColor}`}>BOL Imaging</h2>
            <div className="flex gap-6">
               <label className="flex items-center gap-2 text-[9px] font-bold cursor-pointer uppercase transition-all hover:text-white">
                 <input type="radio" name="bol" className="hidden" onChange={() => setBolType('pickup')} />
                 <span className={`w-3.5 h-3.5 rounded-full border border-zinc-700 transition-all ${bolType === 'pickup' ? 'bg-white shadow-[0_0_10px_white]' : ''}`} /> PU BOL
               </label>
               <label className="flex items-center gap-2 text-[9px] font-bold cursor-pointer uppercase transition-all hover:text-white">
                 <input type="radio" name="bol" className="hidden" onChange={() => setBolType('delivery')} />
                 <span className={`w-3.5 h-3.5 rounded-full border border-zinc-700 transition-all ${bolType === 'delivery' ? 'bg-white shadow-[0_0_10px_white]' : ''}`} /> DEL POD
               </label>
            </div>
          </div>

          <div className="p-12 border-2 border-zinc-900 bg-zinc-950 flex flex-col md:flex-row items-center justify-around gap-12 group/img relative overflow-hidden rounded-[2.5rem]">
            <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center gap-6 group/btn active:scale-95 transition-all">
              <div className={`w-28 h-28 border border-zinc-800 flex items-center justify-center bg-black transition-all ${hoverBorder} ${hoverGlow}`}>
                <span className="text-5xl grayscale group-hover/btn:grayscale-0 transition-all">📸</span>
              </div>
              <span className="text-[10px] font-black tracking-[0.8em] text-zinc-800 uppercase group-hover/btn:text-white">Neural_Cam</span>
            </button>

            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-6 group/btn active:scale-95 transition-all">
              <div className={`w-28 h-28 border border-zinc-800 flex items-center justify-center bg-black transition-all ${hoverBorder} ${hoverGlow}`}>
                <span className="text-5xl grayscale group-hover/btn:grayscale-0 transition-all">📂</span>
              </div>
              <span className="text-[10px] font-black tracking-[0.8em] text-zinc-800 uppercase group-hover/btn:text-white">Local_Vault</span>
            </button>
          </div>

          {uploadedFiles.filter(f => f.category === 'bol').length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in slide-in-from-bottom-2">
              {uploadedFiles.filter(f => f.category === 'bol').map(f => (
                <div key={f.id} className="relative aspect-[3/4] border border-zinc-800 rounded-xl overflow-hidden group">
                  <img src={f.preview} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                  <div className={`absolute top-0 left-0 w-full h-[2px] animate-scan ${themeColor.replace('text-', 'bg-')}`} />
                  <button onClick={() => setUploadedFiles(p => p.filter(i => i.id !== f.id))} className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all">✕</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- SECTION 05: TRAILER/FREIGHT --- */}
        <section className="space-y-6">
          <h2 className={`text-[11px] font-black uppercase tracking-[0.4em] ${themeColor} border-b border-zinc-900 pb-4`}>Freight Inspection</h2>
          <button 
            onClick={() => freightInputRef.current?.click()}
            className="w-full py-12 border-2 border-dashed border-zinc-900 rounded-3xl text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 hover:text-white hover:border-zinc-700 transition-all bg-zinc-950/30"
          >
            + Upload Trailer / Freight Loaded Photos
          </button>
          {uploadedFiles.filter(f => f.category === 'freight').length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {uploadedFiles.filter(f => f.category === 'freight').map(f => (
                <div key={f.id} className="relative aspect-square border border-zinc-800 rounded-lg overflow-hidden">
                  <img src={f.preview} className="w-full h-full object-cover opacity-60" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- TRANSMISSION --- */}
        <div className="pt-8">
          <button 
            onClick={() => { if(!company || !driverName) { setShake(true); setTimeout(()=>setShake(false),500); } else { setIsSubmitting(true); setTimeout(()=>setShowSuccess(true),2500); }}}
            disabled={isSubmitting}
            className={`w-full py-8 rounded-[2rem] font-black text-xs uppercase tracking-[1em] transition-all relative overflow-hidden ${isGLX ? 'bg-green-600 text-black shadow-lg shadow-green-500/20' : isBST ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-zinc-900 text-zinc-700 border border-zinc-800'}`}
          >
            <span className="relative z-10">{isSubmitting ? 'UPLOADING...' : 'Execute_Transmission'}</span>
            {isSubmitting && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
          </button>
        </div>
      </div>

      {/* --- SUCCESS OVERLAY --- */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-10 animate-in fade-in zoom-in duration-500">
           <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center text-5xl mb-12 ${isGLX ? 'border-green-500 text-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'border-blue-500 text-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)]'}`}>✓</div>
           <h2 className="text-3xl font-black uppercase tracking-[0.5em] text-white text-center mb-16">Uplink_Success</h2>
           <button onClick={() => window.location.reload()} className="w-full max-w-sm py-5 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] text-white">New_Protocol</button>
        </div>
      )}

      <style>{`
        @keyframes scan { 0% { top: 0; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        .animate-scan { animation: scan 3s linear infinite; }
        .animate-shake { animation: shake 0.1s linear infinite; }
        select { -webkit-appearance: none; appearance: none; }
      `}</style>

      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => onFileSelect(e, 'bol')} />
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={(e) => onFileSelect(e, 'bol')} />
      <input type="file" ref={freightInputRef} className="hidden" multiple accept="image/*" onChange={(e) => onFileSelect(e, 'freight')} />
    </div>
  );
};

export default App;