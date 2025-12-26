import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

/**
 * LOGISTICS TERMINAL v2.3 - PERSISTENT INPUT ENGINE
 * Senior Level Fix: Memoized validation to prevent focus-theft re-renders.
 * Logic: Decoupled visual state from input buffer.
 * UI: High-Luminance "Lock-In" only occurs onBlur.
 */

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
  category: 'bol' | 'freight';
}

const App: React.FC = () => {
  // --- CORE STATE ---
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
  const [bolProtocol, setBolProtocol] = useState<'PICKUP' | 'DELIVERY' | ''>('');
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  
  // --- VALIDATION VISUALS (Separated to prevent focus loss) ---
  const [validatedFields, setValidatedFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const freightInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  // --- THEME ENGINE ---
  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const themeColor = isGLX ? 'text-green-500' : isBST ? 'text-blue-400' : 'text-cyan-400';
  const themeBg = isGLX ? 'bg-green-500' : isBST ? 'bg-blue-600' : 'bg-cyan-500';
  const themeShadow = isGLX ? 'shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'shadow-[0_0_20px_rgba(59,130,246,0.4)]';

  const isReady = useMemo(() => (
    company && driverName && loadNum && bolNum && puCity && puState && delCity && delState && bolProtocol && uploadedFiles.length > 0
  ), [company, driverName, loadNum, bolNum, puCity, puState, delCity, delState, bolProtocol, uploadedFiles]);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    audioRef.current.volume = 0.15;
  }, []);

  const triggerPulse = useCallback(() => {
    setPulseActive(true);
    audioRef.current?.play().catch(() => {}); 
    setTimeout(() => setPulseActive(false), 500);
  }, []);

  const handleFieldValidation = useCallback((fieldId: string, hasValue: boolean) => {
    setValidatedFields(prev => {
      const next = new Set(prev);
      if (hasValue) {
        if (!next.has(fieldId)) {
          next.add(fieldId);
          triggerPulse();
        }
      } else {
        next.delete(fieldId);
      }
      return next;
    });
  }, [triggerPulse]);

  const handleAuth = () => {
    setIsAuthenticating(true);
    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      setAuthStage(stage);
      if (stage >= 4) {
        clearInterval(interval);
        setTimeout(() => setIsLocked(false), 400);
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
      handleFieldValidation('imaging', true);
    }
  };

  // --- STYLES ---
  const getInputStyles = (fieldId: string) => {
    const isValid = validatedFields.has(fieldId);
    return `w-full p-3.5 text-xs rounded-xl outline-none font-mono transition-all duration-700 ${
      isValid 
        ? `${themeBg} text-black border-transparent ${themeShadow}` 
        : `bg-black border border-zinc-900 text-white focus:border-zinc-600`
    }`;
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 font-orbitron">
        <button onMouseDown={handleAuth} className="group relative p-16 border border-zinc-900 bg-zinc-950 rounded-[3rem] transition-all active:scale-95">
          <div className="w-32 h-32 border border-zinc-800 flex items-center justify-center bg-black transition-all group-hover:border-cyan-500">
            <span className="text-5xl">🔐</span>
          </div>
          <p className="mt-8 text-[10px] font-black tracking-[1em] text-zinc-700 uppercase text-center">Auth_Protocol</p>
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#020202] text-zinc-300 font-orbitron relative pb-24 overflow-x-hidden ${shake ? 'animate-shake' : ''}`}>
      
      {/* HUD GRID PULSE */}
      <div className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 ${pulseActive ? 'opacity-100' : 'opacity-[0.03]'}`}>
        <div className={`absolute inset-0 ${themeBg}`} />
        <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto p-6 space-y-12">
        <header className="flex justify-between items-end border-b border-zinc-900 pb-8 pt-4">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black border-2 transition-all duration-700 ${isGLX ? 'bg-green-500 text-black border-green-400 shadow-lg' : isBST ? 'bg-blue-600 text-white border-blue-400 shadow-lg' : 'bg-zinc-900 text-zinc-700 border-zinc-800'}`}>
              <span className="text-xl">{isGLX ? 'GLX' : isBST ? 'BST' : '?'}</span>
            </div>
            <div className="space-y-1">
              <h1 className={`text-2xl font-black tracking-tighter uppercase ${themeColor}`}>Terminal v2.3</h1>
              <p className="text-[8px] text-zinc-600 tracking-[0.5em] font-bold uppercase underline underline-offset-4 decoration-zinc-800">Operational_Uplink</p>
            </div>
          </div>
        </header>

        {/* --- IDENTITY --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={`text-[9px] font-black uppercase tracking-[0.3em] ${themeColor}`}>Carrier Identity</label>
            <select 
              className={getInputStyles('company')}
              value={company}
              onChange={(e) => {
                const val = e.target.value as any;
                setCompany(val);
                handleFieldValidation('company', !!val);
              }}
            >
              <option value="">-- SELECT CARRIER --</option>
              <option value="GLX">GREENLEAF XPRESS (GLX)</option>
              <option value="BST">BST EXPEDITE (BST)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className={`text-[9px] font-black uppercase tracking-[0.3em] ${themeColor}`}>Operator Name</label>
            <input 
              type="text" 
              placeholder="ENTER NAME" 
              className={getInputStyles('driverName')}
              value={driverName} 
              onChange={(e) => setDriverName(e.target.value)}
              onBlur={(e) => handleFieldValidation('driverName', !!e.target.value)}
            />
          </div>
        </section>

        {/* --- SHIPMENT DATA --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={`text-[9px] font-black uppercase tracking-[0.3em] ${themeColor}`}>REFERENCED LOAD #</label>
            <input type="text" placeholder="LOAD-XXXXX" className={getInputStyles('loadNum')} value={loadNum} onChange={(e) => setLoadNum(e.target.value)} onBlur={(e) => handleFieldValidation('loadNum', !!e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className={`text-[9px] font-black uppercase tracking-[0.3em] ${themeColor}`}>REFERENCED BOL #</label>
            <input type="text" placeholder="BOL-XXXXX" className={getInputStyles('bolNum')} value={bolNum} onChange={(e) => setBolNum(e.target.value)} onBlur={(e) => handleFieldValidation('bolNum', !!e.target.value)} />
          </div>
        </section>

        {/* --- LOGISTICS ROUTE --- */}
        <section className="space-y-8">
          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-2 space-y-2">
               <label className={`text-[9px] font-black uppercase tracking-[0.3em] ${themeColor}`}>ORIGIN: PICKUP CITY</label>
               <input type="text" placeholder="ENTER CITY" className={getInputStyles('puCity')} value={puCity} onChange={(e) => setPuCity(e.target.value)} onBlur={(e) => handleFieldValidation('puCity', !!e.target.value)} />
             </div>
             <div className="space-y-2">
               <label className={`text-[9px] font-black uppercase tracking-[0.3em] ${themeColor}`}>STATE</label>
               <select className={getInputStyles('puState')} value={puState} onChange={(e) => { setPuState(e.target.value); handleFieldValidation('puState', !!e.target.value); }}>
                  <option value="">--</option>
                  {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-2 space-y-2">
               <label className={`text-[9px] font-black uppercase tracking-[0.3em] ${themeColor}`}>DESTINATION: DELIVERY CITY</label>
               <input type="text" placeholder="ENTER CITY" className={getInputStyles('delCity')} value={delCity} onChange={(e) => setDelCity(e.target.value)} onBlur={(e) => handleFieldValidation('delCity', !!e.target.value)} />
             </div>
             <div className="space-y-2">
               <label className={`text-[9px] font-black uppercase tracking-[0.3em] ${themeColor}`}>STATE</label>
               <select className={getInputStyles('delState')} value={delState} onChange={(e) => { setDelState(e.target.value); handleFieldValidation('delState', !!e.target.value); }}>
                  <option value="">--</option>
                  {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
        </section>

        {/* --- BOL IMAGING --- */}
        <section className="space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
            <h2 className={`text-[11px] font-black uppercase tracking-[0.4em] ${themeColor}`}>Imaging Protocol</h2>
            <div className="flex gap-4">
                <button 
                  onClick={() => { setBolProtocol('PICKUP'); triggerPulse(); }}
                  className={`px-5 py-2 text-[9px] font-black uppercase tracking-widest border-2 transition-all rounded-lg ${bolProtocol === 'PICKUP' ? `${themeBg} text-black border-white shadow-lg` : 'border-zinc-900 text-zinc-600'}`}
                >
                  PICKUP BOL
                </button>
                <button 
                  onClick={() => { setBolProtocol('DELIVERY'); triggerPulse(); }}
                  className={`px-5 py-2 text-[9px] font-black uppercase tracking-widest border-2 transition-all rounded-lg ${bolProtocol === 'DELIVERY' ? `${themeBg} text-black border-white shadow-lg` : 'border-zinc-900 text-zinc-600'}`}
                >
                  DELIVERY BOL
                </button>
            </div>
          </div>

          <div className={`p-12 border-2 transition-all duration-1000 flex flex-col md:flex-row items-center justify-around gap-12 relative overflow-hidden rounded-[2.5rem] ${
            bolProtocol ? `${themeBg} border-white shadow-2xl` : 'border-zinc-900 bg-zinc-950 opacity-40'
          }`}>
            <button onClick={() => cameraInputRef.current?.click()} disabled={!bolProtocol} className="flex flex-col items-center gap-6 group active:scale-90 transition-all z-10">
              <div className={`w-32 h-32 border flex items-center justify-center bg-black transition-all ${bolProtocol ? 'border-white shadow-lg' : 'border-zinc-800'}`}>
                <span className={`text-6xl ${bolProtocol ? '' : 'grayscale'}`}>📸</span>
              </div>
              <span className={`text-[10px] font-black tracking-[0.8em] uppercase ${bolProtocol ? 'text-white' : 'text-zinc-800'}`}>CAMERA</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} disabled={!bolProtocol} className="flex flex-col items-center gap-6 group active:scale-90 transition-all z-10">
              <div className={`w-32 h-32 border flex items-center justify-center bg-black transition-all ${bolProtocol ? 'border-white shadow-lg' : 'border-zinc-800'}`}>
                <span className={`text-6xl ${bolProtocol ? '' : 'grayscale'}`}>📂</span>
              </div>
              <span className={`text-[10px] font-black tracking-[0.8em] uppercase ${bolProtocol ? 'text-white' : 'text-zinc-800'}`}>GALLERY</span>
            </button>
          </div>
        </section>

        {/* --- TRANSMISSION --- */}
        <div className="pt-8">
          <button 
            onClick={() => { if(!isReady) { setShake(true); setTimeout(()=>setShake(false),500); } else { setIsSubmitting(true); setTimeout(()=>setShowSuccess(true),2500); }}}
            disabled={isSubmitting}
            className={`w-full py-9 rounded-[2.5rem] font-black text-xs uppercase tracking-[1.5em] transition-all duration-700 relative overflow-hidden shadow-2xl ${
              isReady 
                ? `${isGLX ? 'bg-green-500 text-black shadow-green-500/40' : 'bg-blue-600 text-white shadow-blue-500/40'}` 
                : 'bg-zinc-900 text-zinc-700 border border-zinc-800 cursor-not-allowed opacity-60'
            }`}
          >
            <span className="relative z-10">
              {isSubmitting ? 'UPLOADING...' : isReady ? 'SUBMIT DOCUMENTS' : 'Complete Required Fields'}
            </span>
          </button>
        </div>
      </div>

      {/* --- SUCCESS OVERLAY --- */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-10 animate-in fade-in">
           <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center text-6xl mb-12 animate-bounce ${themeColor} shadow-[0_0_60px_currentColor]`}>✓</div>
           <h2 className="text-4xl font-black uppercase tracking-[0.5em] text-white text-center">Uplink_Complete</h2>
           <button onClick={() => window.location.reload()} className="w-full max-w-sm py-6 border border-zinc-800 rounded-2xl text-[11px] font-black uppercase tracking-[0.5em] text-white mt-12">New_Protocol</button>
        </div>
      )}

      <style>{`
        @keyframes scan { 0% { top: -10%; opacity: 0; } 50% { opacity: 1; } 100% { top: 110%; opacity: 0; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        .animate-scan { animation: scan 4s ease-in-out infinite; }
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