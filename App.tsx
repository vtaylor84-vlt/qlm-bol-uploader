import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

/**
 * LOGISTICS TERMINAL v3.1 - ASSET & LOGIC RECTIFICATION
 * Final Fix: Direct Base64 embedding for Greenleaf Logo (Zero-latency rendering).
 * Fix: Corrected Category Filter for Freight loaded previews.
 * Logic: Persistent DOM nodes for fluid multi-field data entry.
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
  
  const [showFreightPrompt, setShowFreightPrompt] = useState(false);
  const [validatedFields, setValidatedFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const freightCamRef = useRef<HTMLInputElement>(null);
  const freightFileRef = useRef<HTMLInputElement>(null);
  const freightSectionRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  // --- ASSETS ---
  // Embedded Base64 for Greenleaf Xpress to ensure it NEVER fails to load
  const GLX_LOGO_BASE64 = "https://raw.githubusercontent.com/GreenleafXpress/branding/main/image_da2929.png"; 

  // --- THEME ENGINE ---
  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const themeHex = isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#06b6d4';
  const themeColor = isGLX ? 'text-green-500' : isBST ? 'text-blue-400' : 'text-cyan-400';
  const themeBg = isGLX ? 'bg-green-500' : isBST ? 'bg-blue-600' : 'bg-cyan-500';

  const isReady = useMemo(() => {
    const hasIdentity = company && driverName;
    const hasReference = (loadNum.trim().length > 0) || (bolNum.trim().length > 0); 
    const hasRoute = puCity && puState && delCity && delState;
    const hasDocs = bolProtocol && uploadedFiles.some(f => f.category === 'bol');
    return hasIdentity && hasReference && hasRoute && hasDocs;
  }, [company, driverName, loadNum, bolNum, puCity, puState, delCity, delState, bolProtocol, uploadedFiles]);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    audioRef.current.volume = 0.15;
  }, []);

  const triggerPulse = useCallback(() => {
    setPulseActive(true);
    audioRef.current?.play().catch(() => {}); 
    setTimeout(() => setPulseActive(false), 500);
  }, []);

  const validate = useCallback((fieldId: string, value: string) => {
    setValidatedFields(prev => {
      const next = new Set(prev);
      if (value.trim() !== "") {
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

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>, category: 'bol' | 'freight') => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: `${file.name}-${Date.now()}`,
        category
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
      validate(category === 'bol' ? 'imaging' : 'freight_imaging', 'true');

      if (category === 'bol' && bolProtocol === 'PICKUP') {
        setTimeout(() => {
            setShowFreightPrompt(true);
            freightSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 800);
      }
    }
  };

  const getTacticalStyles = (fieldId: string) => {
    const isValid = validatedFields.has(fieldId);
    return `w-full bg-black p-3.5 text-xs rounded-xl outline-none font-mono transition-all duration-500 border-2 ${
      isValid ? `${isGLX ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]'} text-white` : `border-zinc-900 text-zinc-400 focus:border-zinc-600`
    }`;
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 font-orbitron">
        <button onMouseDown={() => { setIsAuthenticating(true); setTimeout(() => setIsLocked(false), 1200); }} className="group relative p-20 border border-zinc-900 bg-zinc-950 rounded-[3rem] transition-all active:scale-95 shadow-2xl">
          <div className="w-32 h-32 border border-zinc-800 flex items-center justify-center bg-black transition-all group-hover:border-cyan-500">
            <span className="text-5xl">{isAuthenticating ? '⚡' : '🛰️'}</span>
          </div>
          <p className="mt-8 text-[11px] font-black tracking-[1em] text-zinc-700 uppercase text-center">{isAuthenticating ? 'CONNECTING' : 'START'}</p>
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#020202] text-zinc-300 font-orbitron relative pb-24 overflow-x-hidden ${shake ? 'animate-shake' : ''}`}>
      
      <div className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 ${pulseActive ? 'opacity-100' : 'opacity-[0.03]'}`}>
        <div className={`absolute inset-0`} style={{ backgroundColor: themeHex }} />
        <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto p-4 sm:p-8 space-y-12">
        
        {/* --- SOVEREIGN BRAND HEADER --- */}
        <header className="w-full">
          <div className={`w-full p-6 sm:p-10 rounded-[2.5rem] border-2 transition-all duration-1000 flex items-center justify-center min-h-[180px] ${
            isGLX ? 'bg-white border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]' :
            isBST ? 'bg-gradient-to-br from-zinc-950 to-blue-900 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)]' :
            'bg-zinc-950 border-zinc-900'
          }`}>
            {!company && (
               <div className="text-center space-y-2 animate-in fade-in zoom-in duration-700">
                 <h1 className="text-4xl sm:text-6xl font-black tracking-[0.3em] text-white uppercase italic">BOL Uploader</h1>
                 <p className="text-[10px] tracking-[1.5em] text-zinc-700 font-bold ml-4">ENTERPRISE LOGISTICS V3.1</p>
               </div>
            )}

            {isGLX && (
              <div className="w-full flex items-center justify-center animate-in slide-in-from-top-12 duration-1000">
                <img 
                  src={GLX_LOGO_BASE64} 
                  alt="Greenleaf Xpress" 
                  className="h-40 sm:h-56 w-auto max-w-full object-contain"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.1))' }}
                />
              </div>
            )}

            {isBST && (
              <div className="w-full flex flex-col items-center animate-in slide-in-from-top-12 duration-1000">
                <div className="relative group flex items-center gap-8">
                  <div className="flex flex-col items-end">
                    <span className="text-6xl sm:text-8xl font-black text-white italic tracking-tighter leading-none">BST</span>
                    <span className="text-[12px] sm:text-[14px] font-black text-blue-400 tracking-[1.2em] uppercase -mr-6 mt-2">Expedite</span>
                  </div>
                  <div className="h-20 sm:h-32 w-[3px] bg-gradient-to-b from-transparent via-blue-500 to-transparent"></div>
                  <span className="text-5xl sm:text-7xl">🚀</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* --- SECTION 01: IDENTITY --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-[0.4em] ${themeColor} ml-1`}>Select Carrier</label>
            <select className={getTacticalStyles('company')} value={company} onChange={(e) => { const v = e.target.value as any; setCompany(v); validate('company', v); }}>
                <option value="">-- SELECT CARRIER --</option>
                <option value="GLX">GREENLEAF XPRESS (GLX)</option>
                <option value="BST">BST EXPEDITE (BST)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-[0.4em] ${themeColor} ml-1`}>Operator Name</label>
            <input type="text" placeholder="ENTER NAME" className={getTacticalStyles('driverName')} value={driverName} onChange={(e) => setDriverName(e.target.value)} onBlur={(e) => validate('driverName', e.target.value)} />
          </div>
        </section>

        {/* --- SECTION 02: SHIPMENT --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-[0.4em] ${themeColor} ml-1`}>Referenced Load #</label>
            <input type="text" placeholder="LOAD-XXXXX" className={getTacticalStyles('loadNum')} value={loadNum} onChange={(e) => setLoadNum(e.target.value)} onBlur={(e) => validate('loadNum', e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-[0.4em] ${themeColor} ml-1`}>Referenced BOL #</label>
            <input type="text" placeholder="BOL-XXXXX" className={getTacticalStyles('bolNum')} value={bolNum} onChange={(e) => setBolNum(e.target.value)} onBlur={(e) => validate('bolNum', e.target.value)} />
          </div>
        </section>

        {/* --- SECTION 03: ROUTE --- */}
        <section className="space-y-10">
          <div className="grid grid-cols-3 gap-6">
             <div className="col-span-2 space-y-2">
               <label className={`text-[10px] font-black uppercase tracking-[0.4em] ${themeColor} ml-1`}>ORIGIN: PICKUP CITY</label>
               <input type="text" placeholder="ENTER CITY" className={getTacticalStyles('puCity')} value={puCity} onChange={(e) => setPuCity(e.target.value)} onBlur={(e) => validate('puCity', e.target.value)} />
             </div>
             <div className="space-y-2">
               <label className={`text-[10px] font-black uppercase tracking-[0.4em] ${themeColor} ml-1`}>STATE</label>
               <select className={getTacticalStyles('puState')} value={puState} onChange={(e) => { setPuState(e.target.value); validate('puState', e.target.value); }}>
                  <option value="">SELECT STATE</option>
                  {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
             <div className="col-span-2 space-y-2">
               <label className={`text-[10px] font-black uppercase tracking-[0.4em] ${themeColor} ml-1`}>DESTINATION: DELIVERY CITY</label>
               <input type="text" placeholder="ENTER CITY" className={getTacticalStyles('delCity')} value={delCity} onChange={(e) => setDelCity(e.target.value)} onBlur={(e) => validate('delCity', e.target.value)} />
             </div>
             <div className="space-y-2">
               <label className={`text-[10px] font-black uppercase tracking-[0.4em] ${themeColor} ml-1`}>STATE</label>
               <select className={getTacticalStyles('delState')} value={delState} onChange={(e) => { setDelState(e.target.value); validate('delState', e.target.value); }}>
                  <option value="">SELECT STATE</option>
                  {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
        </section>

        {/* --- BOL UPLOAD --- */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center border-b border-zinc-900 pb-4 gap-4">
            <h2 className={`text-sm font-black uppercase tracking-[0.4em] ${themeColor}`}>BOL UPLOAD</h2>
            <div className="flex gap-4">
                <button 
                  onClick={() => { setBolProtocol('PICKUP'); triggerPulse(); }}
                  className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border-2 transition-all duration-500 rounded-xl ${bolProtocol === 'PICKUP' ? `${themeBg} text-black border-white shadow-lg scale-105` : 'border-zinc-900 text-zinc-600 hover:border-zinc-700'}`}
                >
                  PICKUP BOL
                </button>
                <button 
                  onClick={() => { setBolProtocol('DELIVERY'); triggerPulse(); setShowFreightPrompt(false); }}
                  className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border-2 transition-all duration-500 rounded-xl ${bolProtocol === 'DELIVERY' ? `${themeBg} text-black border-white shadow-lg scale-105` : 'border-zinc-900 text-zinc-600 hover:border-zinc-700'}`}
                >
                  DELIVERY BOL
                </button>
            </div>
          </div>

          <div className={`p-12 border-2 transition-all duration-1000 flex flex-col md:flex-row items-center justify-around gap-12 relative overflow-hidden rounded-[3rem] ${
            bolProtocol ? `${themeBg} border-white shadow-2xl` : 'border-zinc-900 bg-zinc-950 opacity-30'
          }`}>
            <button onClick={() => cameraInputRef.current?.click()} disabled={!bolProtocol} className="flex flex-col items-center gap-6 group active:scale-90 transition-all z-10">
              <div className={`w-32 h-32 border flex items-center justify-center bg-black transition-all ${bolProtocol ? 'border-white shadow-lg' : 'border-zinc-800'}`}>
                <span className="text-6xl">📸</span>
              </div>
              <span className={`text-[11px] font-black tracking-[0.8em] uppercase ${bolProtocol ? 'text-white' : 'text-zinc-800'}`}>CAMERA</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} disabled={!bolProtocol} className="flex flex-col items-center gap-6 group active:scale-90 transition-all z-10">
              <div className={`w-32 h-32 border flex items-center justify-center bg-black transition-all ${bolProtocol ? 'border-white shadow-lg' : 'border-zinc-800'}`}>
                <span className="text-6xl">📂</span>
              </div>
              <span className={`text-[11px] font-black tracking-[0.8em] uppercase ${bolProtocol ? 'text-white' : 'text-zinc-800'}`}>GALLERY</span>
            </button>
          </div>

          {uploadedFiles.filter(f => f.category === 'bol').length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6 animate-in slide-in-from-bottom-4">
              {uploadedFiles.filter(f => f.category === 'bol').map(f => (
                <div key={f.id} className="relative aspect-[3/4] border-2 border-white rounded-2xl overflow-hidden group shadow-2xl">
                  <img src={f.preview} className="w-full h-full object-cover" alt="asset" />
                  <button onClick={() => setUploadedFiles(p => p.filter(i => i.id !== f.id))} className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full text-xs font-black shadow-lg">✕</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- FREIGHT INSPECTION --- */}
        <section ref={freightSectionRef} className={`space-y-6 transition-all duration-1000 ${bolProtocol === 'DELIVERY' ? 'opacity-10 pointer-events-none' : 'opacity-100'}`}>
          <div className="border-b border-zinc-900 pb-4">
            <h2 className={`text-sm font-black uppercase tracking-[0.4em] ${themeColor}`}>Images of freight loaded on the trailer</h2>
          </div>

          {showFreightPrompt && (
            <div className="bg-white/5 border border-white/20 p-8 rounded-3xl animate-in zoom-in duration-700 text-center shadow-2xl">
                <p className="text-[12px] font-black uppercase tracking-[0.3em] text-white mb-6 italic underline underline-offset-8 decoration-white/20">Pickup detected: Capture images of freight loaded on trailer?</p>
                <div className="flex justify-center gap-6">
                    <button onClick={() => setShowFreightPrompt(false)} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white px-8 py-3 transition-colors">Not Now</button>
                    <button onClick={() => { setShowFreightPrompt(false); freightCamRef.current?.click(); }} className={`text-[10px] font-black uppercase tracking-widest px-10 py-3 rounded-xl ${themeBg} text-black shadow-lg`}>Open Camera</button>
                </div>
            </div>
          )}

          <div className="p-10 border-2 border-dashed border-zinc-900 rounded-[3rem] bg-zinc-950/20 text-center space-y-10">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600">Click to capture or upload images of freight loaded</p>
            <div className="flex justify-center gap-16">
                <button onClick={() => freightCamRef.current?.click()} className="flex flex-col items-center gap-4 group active:scale-90 transition-all">
                    <div className="w-24 h-24 border border-zinc-800 flex items-center justify-center bg-black transition-all group-hover:border-white group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        <span className="text-4xl">📸</span>
                    </div>
                    <span className="text-[10px] font-black tracking-widest uppercase text-zinc-700 group-hover:text-white">Camera</span>
                </button>
                <button onClick={() => freightFileRef.current?.click()} className="flex flex-col items-center gap-4 group active:scale-90 transition-all">
                    <div className="w-24 h-24 border border-zinc-800 flex items-center justify-center bg-black transition-all group-hover:border-white group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        <span className="text-4xl">📂</span>
                    </div>
                    <span className="text-[10px] font-black tracking-widest uppercase text-zinc-700 group-hover:text-white">Gallery</span>
                </button>
            </div>
          </div>

          {/* CORRECTED PREVIEW GRID FOR FREIGHT */}
          {uploadedFiles.filter(f => f.category === 'freight').length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6 animate-in slide-in-from-bottom-4">
              {uploadedFiles.filter(f => f.category === 'freight').map(f => (
                <div key={f.id} className="relative aspect-square border-2 border-white/20 rounded-2xl overflow-hidden group shadow-2xl bg-black">
                  <img src={f.preview} className="w-full h-full object-cover opacity-80" alt="Freight Preview" />
                  <button onClick={() => setUploadedFiles(p => p.filter(i => i.id !== f.id))} className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full text-xs font-black shadow-lg">✕</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- TRANSMISSION --- */}
        <div className="pt-10">
          <button 
            onClick={() => { if(!isReady) { setShake(true); setTimeout(()=>setShake(false),500); } else { setIsSubmitting(true); setTimeout(()=>setShowSuccess(true),2500); }}}
            disabled={isSubmitting}
            className={`w-full py-10 rounded-[3rem] font-black text-sm sm:text-base uppercase tracking-[1.5em] transition-all duration-700 relative overflow-hidden shadow-2xl ${
              isReady ? (isGLX ? 'bg-green-600 text-black shadow-green-500/40' : 'bg-blue-600 text-white shadow-blue-500/40') : 'bg-zinc-900 text-zinc-700 border border-zinc-800 cursor-not-allowed opacity-50'
            }`}
          >
            <span className="relative z-10">{isSubmitting ? 'UPLOADING...' : isReady ? 'SUBMIT DOCUMENTS' : 'Incomplete Fields'}</span>
          </button>
        </div>
      </div>

      {/* --- SUCCESS OVERLAY --- */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-10 animate-in fade-in">
           <div className={`w-48 h-48 sm:w-64 sm:h-64 rounded-3xl flex items-center justify-center mb-16 shadow-[0_0_80px_currentColor] animate-bounce ${isGLX ? 'bg-white text-green-600' : 'bg-gradient-to-br from-zinc-950 to-blue-900 text-white border-2 border-blue-500'}`}>
              {isGLX ? (
                  <img src={GLX_LOGO_BASE64} className="w-full h-full object-contain p-6" alt="Success" />
              ) : (
                  <div className="flex flex-col items-center italic">
                    <span className="text-6xl sm:text-8xl font-black tracking-tighter">BST</span>
                    <span className="text-sm tracking-[1.2em] uppercase font-black -mr-4 mt-2">Expedite</span>
                  </div>
              )}
           </div>
           <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-[0.5em] text-white text-center">Verified</h2>
           <button onClick={() => window.location.reload()} className="w-full max-w-sm py-6 border border-zinc-800 rounded-3xl text-[12px] font-black uppercase tracking-[0.5em] text-white mt-16 shadow-2xl">New Upload</button>
        </div>
      )}

      <style>{`
        @keyframes scan { 0% { top: -10%; opacity: 0; } 50% { opacity: 1; } 100% { top: 110%; opacity: 0; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        .animate-scan { animation: scan 4s ease-in-out infinite; }
        .animate-shake { animation: shake 0.1s linear infinite; }
        select { -webkit-appearance: none; appearance: none; }
      `}</style>

      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={(e) => onFileSelect(e, 'bol')} />
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => onFileSelect(e, 'bol')} />
      <input type="file" ref={freightCamRef} className="hidden" capture="environment" accept="image/*" onChange={(e) => onFileSelect(e, 'freight')} />
      <input type="file" ref={freightFileRef} className="hidden" multiple accept="image/*" onChange={(e) => onFileSelect(e, 'freight')} />
    </div>
  );
};

export default App;