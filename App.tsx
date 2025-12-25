import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * LOGISTICS TERMINAL v1.3 - NEURAL UPLINK
 * Design Spec: High-Fidelity Tactical Buttons & Grid Interaction
 * Features: Fleet-responsive styling, Neural_Cam & Local_Vault motifs
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  // --- THEME ENGINE ---
  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const themeHex = isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#06b6d4';
  const themeColor = isGLX ? 'text-green-500' : isBST ? 'text-blue-400' : 'text-cyan-400';
  const themeGlow = isGLX ? 'group-hover/btn:shadow-[0_0_40px_rgba(34,197,94,0.2)]' : isBST ? 'group-hover/btn:shadow-[0_0_40px_rgba(59,130,246,0.2)]' : 'group-hover/btn:shadow-[0_0_40px_rgba(6,182,212,0.2)]';
  const themeBorder = isGLX ? 'group-hover/btn:border-green-500' : isBST ? 'group-hover/btn:border-blue-500' : 'group-hover/btn:border-cyan-500';

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
    }, 400);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: `${file.name}-${Date.now()}`,
        category: 'bol' as const
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const inputStyle = `w-full bg-black border border-zinc-900 p-4 text-xs rounded-lg outline-none text-white focus:border-zinc-600 transition-all font-mono`;

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 font-orbitron">
        <button onMouseDown={handleAuth} className="group relative p-12 border border-zinc-900 bg-zinc-950 rounded-3xl transition-all active:scale-95">
          <div className={`w-32 h-32 border border-zinc-800 flex items-center justify-center bg-black transition-all group-hover:border-cyan-500 group-hover:shadow-[0_0_50px_rgba(6,182,212,0.2)]`}>
            <span className="text-5xl grayscale group-hover:grayscale-0 transition-all">{isAuthenticating ? '📡' : '🔐'}</span>
          </div>
          <p className="mt-8 text-[10px] font-black tracking-[1em] text-zinc-700 uppercase group-hover:text-cyan-400 text-center">
            {isAuthenticating ? `Booting_Stage_${authStage}` : 'Hold_To_Decrypt'}
          </p>
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#020202] text-zinc-300 font-orbitron relative pb-20 ${shake ? 'animate-shake' : ''}`}>
      {/* HUD BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${themeHex} 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto p-6 space-y-8">
        {/* HEADER */}
        <header className="flex justify-between items-center border-b border-zinc-900 pb-8 pt-4">
          <div className="flex items-center gap-6">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl transition-all duration-700 ${isGLX ? 'bg-green-500 text-black' : isBST ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-700'}`}>
              {isGLX ? 'GLX' : isBST ? 'BST' : '?'}
            </div>
            <div>
              <h1 className={`text-xl font-black tracking-tighter uppercase ${themeColor}`}>Terminal v1.3</h1>
              <p className="text-[7px] text-zinc-600 tracking-[0.5em] font-bold">SECURE LOGISTICS HUB</p>
            </div>
          </div>
        </header>

        {/* CORE INPUTS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={`text-[9px] font-black uppercase tracking-widest ${themeColor}`}>Carrier Identity</label>
            <select className={inputStyle} value={company} onChange={(e) => setCompany(e.target.value as any)}>
              <option value="">-- SELECT FLEET --</option>
              <option value="GLX">GREENLEAF XPRESS</option>
              <option value="BST">BST EXPEDITE</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className={`text-[9px] font-black uppercase tracking-widest ${themeColor}`}>Operator Name</label>
            <input type="text" placeholder="FULL NAME" className={inputStyle} value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>
        </section>

        {/* LOGISTICS DATA */}
        <section className="grid grid-cols-2 gap-4">
           <input type="text" placeholder="LOAD #" className={inputStyle} value={loadNum} onChange={(e) => setLoadNum(e.target.value)} />
           <input type="text" placeholder="BOL #" className={inputStyle} value={bolNum} onChange={(e) => setBolNum(e.target.value)} />
        </section>

        {/* NEURAL IMAGING SYSTEM (Requested UI) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className={`text-[10px] font-black uppercase tracking-[0.4em] ${themeColor}`}>Imaging_Subsystem</h2>
            <div className="flex gap-4">
               <label className="flex items-center gap-2 text-[9px] font-bold cursor-pointer uppercase">
                 <input type="radio" name="bol" className="hidden" onChange={() => setBolType('pickup')} />
                 <span className={`w-3 h-3 rounded-full border border-zinc-700 ${bolType === 'pickup' ? 'bg-white' : ''}`} /> PU
               </label>
               <label className="flex items-center gap-2 text-[9px] font-bold cursor-pointer uppercase">
                 <input type="radio" name="bol" className="hidden" onChange={() => setBolType('delivery')} />
                 <span className={`w-3 h-3 rounded-full border border-zinc-700 ${bolType === 'delivery' ? 'bg-white' : ''}`} /> DEL
               </label>
            </div>
          </div>

          <div className="p-10 border-2 border-zinc-900 bg-zinc-950 flex flex-col md:flex-row items-center justify-around gap-12 group/img relative overflow-hidden rounded-3xl">
            {/* BACKGROUND DECOR */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(90deg,#fff_1px,transparent_1px),linear-gradient(#fff_1px,transparent_1px)] bg-[size:20px_20px]" />
            
            <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center gap-6 group/btn active:scale-95 transition-all">
              <div className={`w-28 h-28 border border-zinc-800 flex items-center justify-center bg-black transition-all ${themeBorder} ${themeGlow}`}>
                <span className="text-5xl grayscale group-hover/btn:grayscale-0 transition-all">📸</span>
              </div>
              <span className="text-[11px] font-black tracking-[1em] text-zinc-800 uppercase group-hover/btn:text-white transition-colors">Neural_Cam</span>
            </button>

            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-6 group/btn active:scale-95 transition-all">
              <div className={`w-28 h-28 border border-zinc-800 flex items-center justify-center bg-black transition-all ${themeBorder} ${themeGlow}`}>
                <span className="text-5xl grayscale group-hover/btn:grayscale-0 transition-all">📂</span>
              </div>
              <span className="text-[11px] font-black tracking-[1em] text-zinc-800 uppercase group-hover/btn:text-white transition-colors">Local_Vault</span>
            </button>
          </div>

          {/* PREVIEW GRID */}
          {uploadedFiles.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4">
              {uploadedFiles.map(f => (
                <div key={f.id} className="relative aspect-[3/4] border border-zinc-800 rounded-xl overflow-hidden group bg-black">
                  <img src={f.preview} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all grayscale group-hover:grayscale-0" alt="BOL" />
                  <div className={`absolute inset-x-0 top-0 h-[2px] animate-scan ${isGLX ? 'bg-green-500' : 'bg-blue-500'}`} />
                  <button onClick={() => setUploadedFiles(p => p.filter(i => i.id !== f.id))} className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SUBMIT BUTTON */}
        <button 
          onClick={() => { if(!driverName || uploadedFiles.length === 0) { setShake(true); setTimeout(() => setShake(false), 500); } else { setIsSubmitting(true); setTimeout(() => setShowSuccess(true), 2000); }}}
          className={`w-full py-8 rounded-2xl font-black text-xs uppercase tracking-[0.8em] transition-all relative overflow-hidden ${
            isGLX ? 'bg-green-600 text-black shadow-[0_0_30px_rgba(34,197,94,0.2)]' :
            isBST ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.2)]' :
            'bg-zinc-900 text-zinc-700 border border-zinc-800'
          }`}
        >
          <span className="relative z-10">{isSubmitting ? 'TRANSMITTING...' : 'Execute_Uplink'}</span>
          {isSubmitting && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
        </button>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-10 animate-in fade-in">
           <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-4xl mb-8 animate-bounce ${isGLX ? 'border-green-500 text-green-500' : 'border-blue-500 text-blue-500'}`}>✓</div>
           <h2 className="text-2xl font-black uppercase tracking-[0.5em] text-center mb-12">Protocol_Verified</h2>
           <button onClick={() => window.location.reload()} className="w-full max-w-sm py-5 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] text-white">New_Session</button>
        </div>
      )}

      <style>{`
        @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        .animate-scan { animation: scan 3s linear infinite; }
        .animate-shake { animation: shake 0.1s linear infinite; }
      `}</style>

      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={onFileSelect} />
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={onFileSelect} />
    </div>
  );
};

export default App;