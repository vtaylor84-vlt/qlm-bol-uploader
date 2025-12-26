import React, { useState, useRef, useEffect, useMemo } from 'react';

/**
 * LOGISTICS TERMINAL v2.0 - KINETIC ENGAGEMENT
 * Logic: Field-Level Validation Flares (Visual Rewards)
 * UI: Tactical Protocol Buttons (PICKUP / DELIVERY)
 * UX: Contextual Intelligence Button (Morphing Submit)
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
  const [bolProtocol, setBolProtocol] = useState<'PICKUP' | 'DELIVERY' | ''>('');
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  // --- KINETIC FEEDBACK ---
  const [pulseActive, setPulseActive] = useState(false);
  const [lastValidated, setLastValidated] = useState<string | null>(null);

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

  // --- VALIDATION INTELLIGENCE ---
  const isReady = useMemo(() => (
    company && driverName && loadNum && bolNum && puCity && puState && delCity && delState && bolProtocol && uploadedFiles.length > 0
  ), [company, driverName, loadNum, bolNum, puCity, puState, delCity, delState, bolProtocol, uploadedFiles]);

  const triggerPulse = (fieldName?: string) => {
    setPulseActive(true);
    setLastValidated(fieldName || null);
    audioRef.current?.play().catch(() => {}); 
    setTimeout(() => {
        setPulseActive(false);
        setLastValidated(null);
    }, 600);
  };

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
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
      triggerPulse('imaging');
    }
  };

  // --- UI COMPONENTS ---
  const TacticalInput = ({ label, value, onChange, placeholder, fieldId }: any) => (
    <div className="relative group">
      <label className={`text-[9px] font-black uppercase tracking-[0.3em] ${themeColor} mb-2 block transition-all group-focus-within:translate-x-1`}>
        {label}
      </label>
      <div className="relative">
        <input 
          type="text" 
          placeholder={placeholder} 
          className={`w-full bg-black border ${value ? 'border-zinc-700' : 'border-zinc-900'} p-3.5 text-xs rounded-xl outline-none text-white focus:border-zinc-500 transition-all font-mono placeholder-zinc-800`}
          value={value} 
          onChange={onChange}
          onBlur={() => value && triggerPulse(fieldId)}
        />
        {value && (
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 animate-in zoom-in duration-300 ${themeColor}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  const TacticalSelect = ({ label, value, onChange, options, placeholder, fieldId }: any) => (
    <div className="relative group/select">
      <label className={`text-[9px] font-black uppercase tracking-[0.3em] ${themeColor} mb-2 block`}>
        {label}
      </label>
      <div className="relative">
        <select 
          className={`w-full bg-black border ${value ? 'border-zinc-700' : 'border-zinc-900'} p-3.5 pr-10 text-xs rounded-xl outline-none text-white focus:border-zinc-600 transition-all font-mono appearance-none`}
          value={value}
          onChange={(e) => { onChange(e); triggerPulse(fieldId); }}
        >
          <option value="">{placeholder}</option>
          {options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center gap-0.5 opacity-40 group-focus-within/select:opacity-100 transition-all">
          <svg className={`w-2.5 h-2.5 ${themeColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeWidth="3" d="M5 15l7-7 7 7" /></svg>
          <svg className={`w-2.5 h-2.5 ${themeColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeWidth="3" d="M5 9l7 7 7-7" /></svg>
        </div>
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 font-orbitron">
        <button onMouseDown={handleAuth} className="group relative p-16 border border-zinc-900 bg-zinc-950 rounded-[3rem] transition-all active:scale-95 shadow-2xl overflow-hidden">
          <div className="w-32 h-32 border border-zinc-800 flex items-center justify-center bg-black transition-all group-hover:border-cyan-500 group-hover:shadow-[0_0_50px_rgba(6,182,212,0.2)]">
            <span className="text-5xl grayscale group-hover:grayscale-0 transition-all">🔐</span>
          </div>
          <p className="mt-8 text-[10px] font-black tracking-[1em] text-zinc-700 uppercase text-center">Initialize_Uplink</p>
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#020202] text-zinc-300 font-orbitron relative pb-24 overflow-x-hidden transition-all duration-500 ${shake ? 'animate-shake' : ''}`}>
      
      {/* KINETIC PULSE OVERLAY */}
      <div className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 ${pulseActive ? 'opacity-100' : 'opacity-[0.03]'}`}>
        <div className={`absolute inset-0 ${themeBg}`} />
        <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto p-6 space-y-12">
        {/* --- HEADER --- */}
        <header className="flex justify-between items-end border-b border-zinc-900 pb-8 pt-4">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black border-2 transition-all duration-700 ${isGLX ? 'bg-green-500 text-black border-green-400' : isBST ? 'bg-blue-600 text-white border-blue-400' : 'bg-zinc-900 text-zinc-700 border-zinc-800'}`}>
              <span className="text-xl">{isGLX ? 'GLX' : isBST ? 'BST' : '?'}</span>
            </div>
            <div className="space-y-1">
              <h1 className={`text-2xl font-black tracking-tighter uppercase ${themeColor}`}>Terminal v2.0</h1>
              <p className="text-[8px] text-zinc-600 tracking-[0.5em] font-bold uppercase">Field_Intelligence_Active</p>
            </div>
          </div>
        </header>

        {/* --- IDENTITY --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TacticalSelect 
            label="Carrier Identity" 
            value={company} 
            onChange={(e: any) => setCompany(e.target.value)} 
            options={['GLX', 'BST']} 
            placeholder="-- SELECT CARRIER --" 
            fieldId="company"
          />
          <TacticalInput 
            label="Operator Name" 
            value={driverName} 
            onChange={(e: any) => setDriverName(e.target.value)} 
            placeholder="ENTER NAME" 
            fieldId="name"
          />
        </section>

        {/* --- SHIPMENT DATA --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TacticalInput 
            label="REFERENCED LOAD #" 
            value={loadNum} 
            onChange={(e: any) => setLoadNum(e.target.value)} 
            placeholder="LOAD-XXXXX" 
            fieldId="load"
          />
          <TacticalInput 
            label="REFERENCED BOL #" 
            value={bolNum} 
            onChange={(e: any) => setBolNum(e.target.value)} 
            placeholder="BOL-XXXXX" 
            fieldId="bol"
          />
        </section>

        {/* --- LOGISTICS ROUTE --- */}
        <section className="space-y-8">
          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-2">
               <TacticalInput label="ORIGIN: PICKUP CITY" value={puCity} onChange={(e: any) => setPuCity(e.target.value)} placeholder="ENTER CITY" fieldId="pucity" />
             </div>
             <div className="pt-5">
               <TacticalSelect value={puState} onChange={(e: any) => setPuState(e.target.value)} options={states} placeholder="SELECT STATE" fieldId="pustate" />
             </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-2">
               <TacticalInput label="DESTINATION: DELIVERY CITY" value={delCity} onChange={(e: any) => setDelCity(e.target.value)} placeholder="ENTER CITY" fieldId="delcity" />
             </div>
             <div className="pt-5">
               <TacticalSelect value={delState} onChange={(e: any) => setDelState(e.target.value)} options={states} placeholder="SELECT STATE" fieldId="delstate" />
             </div>
          </div>
        </section>

        {/* --- BOL IMAGING PROTOCOL --- */}
        <section className="space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
            <h2 className={`text-[11px] font-black uppercase tracking-[0.4em] ${themeColor}`}>Imaging Protocol</h2>
            <div className="flex gap-4">
                <button 
                  onClick={() => { setBolProtocol('PICKUP'); triggerPulse(); }}
                  className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border-2 transition-all rounded-lg ${bolProtocol === 'PICKUP' ? `${themeBg} text-black border-white shadow-[0_0_20px_white]` : 'border-zinc-900 text-zinc-600 hover:border-zinc-700'}`}
                >
                  PICKUP BOL
                </button>
                <button 
                  onClick={() => { setBolProtocol('DELIVERY'); triggerPulse(); }}
                  className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border-2 transition-all rounded-lg ${bolProtocol === 'DELIVERY' ? `${themeBg} text-black border-white shadow-[0_0_20px_white]` : 'border-zinc-900 text-zinc-600 hover:border-zinc-700'}`}
                >
                  DELIVERY BOL
                </button>
            </div>
          </div>

          <div className={`p-12 border-2 transition-all duration-1000 flex flex-col md:flex-row items-center justify-around gap-12 relative overflow-hidden rounded-[2.5rem] ${
            bolProtocol ? `${themeBg} border-white shadow-2xl` : 'border-zinc-900 bg-zinc-950 opacity-50'
          }`}>
            <button onClick={() => cameraInputRef.current?.click()} disabled={!bolProtocol} className="flex flex-col items-center gap-6 group/btn active:scale-90 transition-all z-10">
              <div className={`w-32 h-32 border flex items-center justify-center bg-black transition-all ${bolProtocol ? 'border-white shadow-[0_0_30px_white]' : 'border-zinc-800'}`}>
                <span className={`text-6xl ${bolProtocol ? '' : 'grayscale'}`}>📸</span>
              </div>
              <span className={`text-[10px] font-black tracking-[0.8em] uppercase ${bolProtocol ? 'text-white' : 'text-zinc-800'}`}>CAMERA</span>
            </button>

            <button onClick={() => fileInputRef.current?.click()} disabled={!bolProtocol} className="flex flex-col items-center gap-6 group/btn active:scale-90 transition-all z-10">
              <div className={`w-32 h-32 border flex items-center justify-center bg-black transition-all ${bolProtocol ? 'border-white shadow-[0_0_30px_white]' : 'border-zinc-800'}`}>
                <span className={`text-6xl ${bolProtocol ? '' : 'grayscale'}`}>📂</span>
              </div>
              <span className={`text-[10px] font-black tracking-[0.8em] uppercase ${bolProtocol ? 'text-white' : 'text-zinc-800'}`}>GALLERY</span>
            </button>
          </div>

          {uploadedFiles.filter(f => f.category === 'bol').length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-6 animate-in slide-in-from-bottom-6">
              {uploadedFiles.filter(f => f.category === 'bol').map(f => (
                <div key={f.id} className="relative aspect-[3/4] border-2 border-white rounded-2xl overflow-hidden group shadow-2xl">
                  <img src={f.preview} className="w-full h-full object-cover" alt="asset" />
                  <div className="absolute top-0 left-0 w-full h-[4px] animate-scan bg-white" />
                  <button onClick={() => setUploadedFiles(p => p.filter(i => i.id !== f.id))} className="absolute top-3 right-3 w-8 h-8 bg-red-600 text-white rounded-full text-xs font-black opacity-0 group-hover:opacity-100 transition-all">✕</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- FREIGHT --- */}
        <section className="space-y-6">
          <h2 className={`text-[11px] font-black uppercase tracking-[0.4em] ${themeColor} border-b border-zinc-900 pb-4`}>Freight Inspection</h2>
          <button onClick={() => freightInputRef.current?.click()} className="w-full py-16 border-2 border-dashed border-zinc-900 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.6em] text-zinc-700 hover:text-white transition-all bg-zinc-950/30">
            + Upload Trailer / Freight Assets
          </button>
        </section>

        {/* --- MORPHING TRANSMISSION BUTTON --- */}
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
            {isReady && !isSubmitting && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
          </button>
        </div>
      </div>

      {/* --- SUCCESS OVERLAY --- */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-10 animate-in fade-in">
           <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center text-6xl mb-12 animate-bounce ${themeColor} ${themeBorder} shadow-[0_0_60px_currentColor]`}>✓</div>
           <h2 className="text-4xl font-black uppercase tracking-[0.5em] text-white text-center mb-16 underline decoration-zinc-800 underline-offset-8">Packet_Sent</h2>
           <button onClick={() => window.location.reload()} className="w-full max-w-sm py-6 border border-zinc-800 rounded-2xl text-[11px] font-black uppercase tracking-[0.5em] text-white hover:bg-white/5 transition-all">New_Transmission</button>
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