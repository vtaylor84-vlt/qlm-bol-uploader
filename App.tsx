import React, { useState, useRef, useEffect, useMemo } from 'react';

/**
 * LOGISTICS TERMINAL v10.0 - SOVEREIGN COMMAND
 * - Feature: Sections 01-05 with Reactive Borders (Glow on completion)
 * - Feature: Radiating Submit Button (Themed Gradient + Black Text)
 * - Feature: Full Freight Gallery/Camera Restoration
 * - Feature: Sensory Pulse & Uppercase Industry Standard
 */

interface FileWithPreview {
  file: File; preview: string; id: string; category: 'bol' | 'freight';
}

const GreenleafLogo = () => (
  <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000 p-4">
    <svg width="320" height="180" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M150 130L50 200H350L250 130H150Z" fill="url(#roadGradient)" stroke="#333" strokeWidth="2"/>
      <path d="M200 135V150M200 165V185M200 195V200" stroke="white" strokeWidth="4" strokeDasharray="8 8" opacity="0.6"/>
      <path d="M200 20C200 20 130 50 130 100C130 140 200 150 200 150C200 150 270 140 270 100C270 50 200 20 200 20Z" fill="#15803d" />
      <path d="M200 25V145M200 50L160 80M200 80L150 115M200 60L240 90M200 95L250 125" stroke="#052e16" strokeWidth="3" strokeLinecap="round"/>
      <defs><linearGradient id="roadGradient" x1="200" y1="130" x2="200" y2="200" gradientUnits="userSpaceOnUse"><stop stopColor="#444444"/><stop offset="1" stopColor="#111111"/></linearGradient></defs>
    </svg>
    <div className="text-center -mt-6">
      <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none uppercase italic">Greenleaf Xpress</h2>
      <p className="text-[10px] font-bold text-zinc-500 tracking-[0.6em] mt-3 uppercase">Waterloo, Iowa</p>
    </div>
  </div>
);

const BSTLogo = () => (
  <div className="flex flex-col items-center justify-center p-6 animate-in zoom-in duration-1000">
    <svg width="320" height="120" viewBox="0 0 400 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bst-chrome" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#ffffff" /><stop offset="50%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1e3a8a" /></linearGradient>
        <filter id="bst-neon"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <text x="50%" y="85" textAnchor="middle" style={{ fontFamily: 'Arial Black, sans-serif', fontSize: '110px', fontWeight: '900', fill: 'url(#bst-chrome)', filter: 'url(#bst-neon)', fontStyle: 'italic', letterSpacing: '-5px' }}>BST</text>
      <text x="50%" y="125" textAnchor="middle" style={{ fontFamily: 'monospace', fontSize: '16px', fill: '#60a5fa', fontWeight: 'bold', letterSpacing: '8px', textTransform: 'uppercase' }}>EXPEDITE INC</text>
    </svg>
  </div>
);

const App: React.FC = () => {
  const [isLocked, setIsLocked] = useState(true);
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const [shake, setShake] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const freightCamRef = useRef<HTMLInputElement>(null);
  const freightFileRef = useRef<HTMLInputElement>(null);
  const freightSectionRef = useRef<HTMLDivElement>(null);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const themeHex = isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#6366f1';
  const themeColor = isGLX ? 'text-green-500' : isBST ? 'text-blue-500' : 'text-zinc-600';

  // Section Completion States
  const s1Ready = !!(company && driverName);
  const s2Ready = !!(loadNum || bolNum);
  const s3Ready = !!(puCity && puState && delCity && delState);
  const s4Ready = !!(bolProtocol && uploadedFiles.some(f => f.category === 'bol'));
  const isReady = s1Ready && s2Ready && s3Ready && s4Ready;

  const triggerPulse = () => {
    setPulseActive(true);
    setTimeout(() => setPulseActive(false), 300);
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
    setter(val.toUpperCase());
    if (val.length === 1) triggerPulse();
  };

  const getInputStyles = (value: string) => {
    const isFilled = value && value.trim().length > 0;
    return `w-full p-5 rounded-2xl font-mono text-sm transition-all duration-500 border-2 outline-none
      ${isFilled ? `bg-black text-white border-[${themeHex}] shadow-[0_0_20px_${themeHex}40] tracking-widest` : 'bg-zinc-100 text-black border-zinc-200'}`;
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>, category: 'bol' | 'freight') => {
    if (e.target.files) {
      triggerPulse();
      const files = Array.from(e.target.files).map(file => ({
        file, preview: URL.createObjectURL(file), id: Math.random().toString(36).substr(2, 9), category
      }));
      setUploadedFiles(prev => [...prev, ...files]);
      if (category === 'bol' && bolProtocol === 'PICKUP') {
        setTimeout(() => { freightSectionRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 800);
      }
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <button onClick={() => setIsLocked(false)} className="w-48 h-48 rounded-full border border-zinc-900 flex items-center justify-center hover:border-blue-500 transition-all duration-700 shadow-2xl">
           <span className="text-4xl animate-pulse text-white">📡</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#020202] text-zinc-100 pb-24 font-sans ${shake ? 'animate-shake' : ''}`}>
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-300 z-50 ${pulseActive ? 'opacity-20' : 'opacity-0'}`} style={{ backgroundColor: themeHex }} />

      <header className="max-w-4xl mx-auto pt-10 px-4 mb-12 relative">
        <div className={`w-full min-h-[220px] rounded-[3.5rem] border-2 transition-all duration-1000 flex items-center justify-center ${company ? 'bg-black' : 'bg-zinc-900/50 border-zinc-800'}`} style={{ borderColor: company ? themeHex : '', boxShadow: company ? `0 0 60px ${themeHex}20` : '' }}>
          {!company && <h1 className="text-4xl font-black italic tracking-tighter uppercase text-zinc-700">Terminal Uplink</h1>}
          {isGLX && <GreenleafLogo />}
          {isBST && <BSTLogo />}
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-8 px-4 relative">
        {/* [ 01 ] IDENTIFICATION */}
        <section className={`bg-zinc-900/40 border-2 transition-all duration-700 rounded-[2.5rem] p-8 shadow-2xl ${s1Ready ? '' : 'border-zinc-800 opacity-60'}`} style={{ borderColor: s1Ready ? themeHex : '' }}>
          <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${s1Ready ? themeColor : 'text-zinc-500'}`}>[ 01 ] Identification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <select className={getInputStyles(company)} value={company} onChange={(e) => { setCompany(e.target.value as any); triggerPulse(); }}>
              <option value="">SELECT CARRIER</option>
              <option value="GLX">GREENLEAF XPRESS</option>
              <option value="BST">BST EXPEDITE INC</option>
            </select>
            <input type="text" placeholder="DRIVER NAME" className={getInputStyles(driverName)} value={driverName} onChange={(e) => handleInputChange(setDriverName, e.target.value)} />
          </div>
        </section>

        {/* [ 02 ] DOCUMENT REFERENCES */}
        <section className={`bg-zinc-900/40 border-2 transition-all duration-700 rounded-[2.5rem] p-8 shadow-2xl ${s2Ready ? '' : 'border-zinc-800 opacity-60'}`} style={{ borderColor: s2Ready ? themeHex : '' }}>
          <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${s2Ready ? themeColor : 'text-zinc-500'}`}>[ 02 ] Document References</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input type="text" placeholder="ENTER LOAD #" className={getInputStyles(loadNum)} value={loadNum} onChange={(e) => handleInputChange(setLoadNum, e.target.value)} />
            <input type="text" placeholder="ENTER BOL #" className={getInputStyles(bolNum)} value={bolNum} onChange={(e) => handleInputChange(setBolNum, e.target.value)} />
          </div>
        </section>

        {/* [ 03 ] ORIGIN / DESTINATION */}
        <section className={`bg-zinc-900/40 border-2 transition-all duration-700 rounded-[2.5rem] p-8 shadow-2xl space-y-10 ${s3Ready ? '' : 'border-zinc-800 opacity-60'}`} style={{ borderColor: s3Ready ? themeHex : '' }}>
          <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${s3Ready ? themeColor : 'text-zinc-500'}`}>[ 03 ] Origin / Destination</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2"><input type="text" placeholder="PICKUP CITY" className={getInputStyles(puCity)} value={puCity} onChange={(e) => handleInputChange(setPuCity, e.target.value)} /></div>
            <select className={getInputStyles(puState)} value={puState} onChange={(e) => {setPuState(e.target.value); triggerPulse();}}><option value="">STATE</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2"><input type="text" placeholder="DELIVERY CITY" className={getInputStyles(delCity)} value={delCity} onChange={(e) => handleInputChange(setDelCity, e.target.value)} /></div>
            <select className={getInputStyles(delState)} value={delState} onChange={(e) => {setDelState(e.target.value); triggerPulse();}}><option value="">STATE</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select>
          </div>
        </section>

        {/* [ 04 ] DOCUMENT UPLINK */}
        <section className={`rounded-[2.5rem] p-8 border-2 transition-all duration-700 ${s4Ready ? 'bg-black border-zinc-700' : 'bg-zinc-900/20 border-zinc-800 border-dashed opacity-60'}`} style={{ borderColor: s4Ready ? themeHex : '' }}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10">
            <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] ${s4Ready ? themeColor : 'text-zinc-500'}`}>[ 04 ] Document Uplink</h3>
            <div className="flex gap-4">
              <button onClick={() => {setBolProtocol('PICKUP'); triggerPulse();}} className={`px-6 py-3 text-[10px] font-black rounded-xl border-2 transition-all duration-500 ${bolProtocol === 'PICKUP' ? `bg-black text-white border-[${themeHex}] shadow-lg` : 'bg-white text-zinc-500'}`}>PICKUP BOL</button>
              <button onClick={() => {setBolProtocol('DELIVERY'); triggerPulse();}} className={`px-6 py-3 text-[10px] font-black rounded-xl border-2 transition-all duration-500 ${bolProtocol === 'DELIVERY' ? `bg-black text-white border-[${themeHex}] shadow-lg` : 'bg-white text-zinc-500'}`}>DELIVERY BOL</button>
            </div>
          </div>
          <div className="flex justify-center gap-16 py-6">
            <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center gap-4 group"><div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center text-4xl border border-zinc-700 group-hover:bg-white transition-all">📸</div><span className="text-[10px] font-black uppercase text-zinc-500">Camera</span></button>
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-4 group"><div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center text-4xl border border-zinc-700 group-hover:bg-white transition-all">📂</div><span className="text-[10px] font-black uppercase text-zinc-500">Gallery</span></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {uploadedFiles.filter(f => f.category === 'bol').map(f => (
              <div key={f.id} className="aspect-[3/4] rounded-2xl bg-zinc-900 overflow-hidden relative group border border-zinc-800"><img src={f.preview} className="w-full h-full object-cover" /><button onClick={() => setUploadedFiles(p => p.filter(i => i.id !== f.id))} className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">✕</button></div>
            ))}
          </div>
        </section>

        {/* [ 05 ] FREIGHT PICTURES (RESTORED) */}
        {bolProtocol === 'PICKUP' && (
          <section ref={freightSectionRef} className={`bg-zinc-900/40 border-2 transition-all duration-700 rounded-[2.5rem] p-8 shadow-2xl ${uploadedFiles.some(f => f.category === 'freight') ? '' : 'border-zinc-800 opacity-60'}`} style={{ borderColor: uploadedFiles.some(f => f.category === 'freight') ? themeHex : '' }}>
            <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${uploadedFiles.some(f => f.category === 'freight') ? themeColor : 'text-zinc-500'}`}>[ 05 ] Freight on Trailer</h3>
            <div className="flex justify-center gap-12 py-6">
              <button onClick={() => freightCamRef.current?.click()} className="flex flex-col items-center gap-4 group"><div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center text-4xl border border-zinc-700 group-hover:bg-white transition-all">📸</div><span className="text-[10px] font-black text-zinc-500">Camera</span></button>
              <button onClick={() => freightFileRef.current?.click()} className="flex flex-col items-center gap-4 group"><div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center text-4xl border border-zinc-700 group-hover:bg-white transition-all">📂</div><span className="text-[10px] font-black text-zinc-500">Gallery</span></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {uploadedFiles.filter(f => f.category === 'freight').map(f => (
                <div key={f.id} className="aspect-square rounded-2xl bg-zinc-900 overflow-hidden relative group border border-zinc-800 shadow-xl"><img src={f.preview} className="w-full h-full object-cover opacity-70 group-hover:opacity-100" /><button onClick={() => setUploadedFiles(p => p.filter(i => i.id !== f.id))} className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button></div>
              ))}
            </div>
          </section>
        )}

        {/* RADIATING CARRIER SUBMIT BUTTON */}
        <button 
          onClick={() => { if(!isReady) { setShake(true); setTimeout(() => setShake(false), 500); } else { setIsSubmitting(true); setTimeout(() => setShowSuccess(true), 2500); } }}
          className={`w-full py-10 rounded-[2.5rem] font-black uppercase tracking-[1.5em] transition-all duration-1000 relative overflow-hidden group
            ${isReady 
              ? `bg-gradient-to-r ${isGLX ? 'from-green-600 via-green-400 to-green-600' : 'from-blue-600 via-blue-400 to-blue-600'} text-black shadow-[0_0_60px_${themeHex}80]` 
              : 'bg-zinc-900 text-zinc-700 opacity-50 cursor-not-allowed'}`}
          style={{ border: isReady ? `3px solid white` : '3px solid transparent' }}>
          
          {isReady && (
            <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay" />
          )}
          
          <span className="relative z-10">{isSubmitting ? 'UPLOADING...' : isReady ? 'SUBMIT DOCUMENTS' : 'COMPLETE FIELDS'}</span>
        </button>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in">
           <div className="w-32 h-32 rounded-full border-4 flex items-center justify-center text-5xl mb-12 animate-bounce" style={{ borderColor: themeHex }}>✓</div>
           <h2 className="text-4xl font-black italic uppercase text-white">Verified</h2>
           <button onClick={() => window.location.reload()} className="mt-16 text-zinc-600 uppercase text-xs font-black tracking-widest hover:text-white">Terminate Session</button>
        </div>
      )}

      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        .animate-shake { animation: shake 0.1s linear infinite; }
      `}</style>

      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" multiple onChange={(e) => onFileSelect(e, 'bol')} />
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => onFileSelect(e, 'bol')} />
      <input type="file" ref={freightCamRef} className="hidden" capture="environment" accept="image/*" multiple onChange={(e) => onFileSelect(e, 'freight')} />
      <input type="file" ref={freightFileRef} className="hidden" multiple accept="image/*" onChange={(e) => onFileSelect(e, 'freight')} />
    </div>
  );
};

export default App;