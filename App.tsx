import React, { useState, useRef, useEffect, useMemo } from 'react';

/**
 * LOGISTICS TERMINAL v8.0 - PERMANENT BLACK-OPS
 * - Removed: Light Mode (Force High-End Dark Terminal).
 * - Restored: Deep Black Backgrounds & High-Contrast Visuals.
 * - Restored: 3-Column Route UI & Original Greenleaf Logo.
 * - Feature: Dynamic Theme Glows (Blue for BST / Green for GLX).
 */

interface FileWithPreview {
  file: File; preview: string; id: string; category: 'bol' | 'freight';
}

// --- BRAND ASSETS ---
const GreenleafLogo = () => (
  <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000">
    <svg width="320" height="180" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
      <path d="M150 130L50 200H350L250 130H150Z" fill="url(#roadGradient)" stroke="#333" strokeWidth="2"/>
      <path d="M200 135V150M200 165V185M200 195V200" stroke="white" strokeWidth="4" strokeDasharray="8 8" opacity="0.6"/>
      <path d="M200 20C200 20 130 50 130 100C130 140 200 150 200 150C200 150 270 140 270 100C270 50 200 20 200 20Z" fill="#15803d" />
      <path d="M200 25V145M200 50L160 80M200 80L150 115M200 60L240 90M200 95L250 125" stroke="#052e16" strokeWidth="3" strokeLinecap="round"/>
      <defs>
        <linearGradient id="roadGradient" x1="200" y1="130" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#444444"/><stop offset="1" stopColor="#111111"/>
        </linearGradient>
      </defs>
    </svg>
    <div className="text-center -mt-6">
      <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none uppercase italic">Greenleaf Xpress</h2>
      <p className="text-xs font-bold text-zinc-400 tracking-[0.6em] mt-2 ml-2 uppercase">Waterloo, Iowa</p>
    </div>
  </div>
);

const BSTLogo = () => (
  <div className="flex flex-col items-center justify-center p-6 bg-black rounded-[2rem] border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
    <svg width="320" height="120" viewBox="0 0 400 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bst-chrome" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" /><stop offset="50%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
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
      ${isFilled 
        ? `bg-black text-white border-[${themeHex}] shadow-[0_0_20px_${themeHex}40] tracking-widest` 
        : 'bg-zinc-100 text-black border-zinc-200 focus:bg-white focus:border-zinc-400'}`;
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

  const isReady = useMemo(() => {
    return company && driverName && (loadNum || bolNum) && puCity && puState && delCity && delState && bolProtocol && uploadedFiles.some(f => f.category === 'bol');
  }, [company, driverName, loadNum, bolNum, puCity, puState, delCity, delState, bolProtocol, uploadedFiles]);

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6">
        <button onClick={() => setIsLocked(false)} className="w-48 h-48 rounded-full border border-zinc-900 flex items-center justify-center hover:border-blue-500 transition-all duration-700 shadow-[0_0_40px_rgba(59,130,246,0.1)]">
           <span className="text-4xl animate-pulse">📡</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-100 pb-24 font-sans selection:bg-blue-500">
      {/* Dynamic Background Pulse */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-300 z-50 ${pulseActive ? 'opacity-20' : 'opacity-0'}`} 
           style={{ backgroundColor: themeHex }} />

      <header className="max-w-4xl mx-auto pt-10 px-4 mb-12 relative">
        <div className={`w-full min-h-[220px] rounded-[3.5rem] border-2 transition-all duration-1000 flex items-center justify-center ${
          isGLX ? 'bg-white border-green-600 shadow-xl' : isBST ? 'bg-black border-blue-600 shadow-[0_0_80px_rgba(59,130,246,0.2)]' : 'bg-zinc-900/50 border-zinc-800'
        }`}>
          {!company && <h1 className="text-4xl font-black italic tracking-tighter uppercase text-zinc-700">Terminal Uplink</h1>}
          {isGLX && <GreenleafLogo />}
          {isBST && <BSTLogo />}
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-8 px-4 relative">
        {/* MODULE 01 */}
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
          <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${themeColor}`}>[ 01 ] Identification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <select className={getInputStyles(company)} value={company} onChange={(e) => { setCompany(e.target.value as any); triggerPulse(); }}>
              <option value="">SELECT CARRIER</option>
              <option value="GLX">GREENLEAF XPRESS</option>
              <option value="BST">BST EXPEDITE INC</option>
            </select>
            <input type="text" placeholder="OPERATOR NAME" className={getInputStyles(driverName)} value={driverName} onChange={(e) => handleInputChange(setDriverName, e.target.value)} />
          </div>
        </section>

        {/* MODULE 02 */}
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
          <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${themeColor}`}>[ 02 ] Document References</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input type="text" placeholder="ENTER LOAD #" className={getInputStyles(loadNum)} value={loadNum} onChange={(e) => handleInputChange(setLoadNum, e.target.value)} />
            <input type="text" placeholder="ENTER BOL #" className={getInputStyles(bolNum)} value={bolNum} onChange={(e) => handleInputChange(setBolNum, e.target.value)} />
          </div>
        </section>

        {/* MODULE 03: RESTORED 3-COLUMN UI */}
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl space-y-10">
          <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${themeColor}`}>[ 03 ] Origin / Destination</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2"><input type="text" placeholder="PICKUP CITY" className={getInputStyles(puCity)} value={puCity} onChange={(e) => handleInputChange(setPuCity, e.target.value)} /></div>
            <select className={getInputStyles(puState)} value={puState} onChange={(e) => {setPuState(e.target.value); triggerPulse();}}>
              <option value="">STATE</option>{states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2"><input type="text" placeholder="DELIVERY CITY" className={getInputStyles(delCity)} value={delCity} onChange={(e) => handleInputChange(setDelCity, e.target.value)} /></div>
            <select className={getInputStyles(delState)} value={delState} onChange={(e) => {setDelState(e.target.value); triggerPulse();}}>
              <option value="">STATE</option>{states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </section>

        {/* MODULE 04 */}
        <section className={`rounded-[2.5rem] p-8 border-2 transition-all duration-700 ${bolProtocol ? `bg-black border-[${themeHex}] shadow-2xl` : 'bg-zinc-900/20 border-zinc-800 border-dashed'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10">
            <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] ${themeColor}`}>[ 04 ] Document Uplink</h3>
            <div className="flex gap-4">
              <button onClick={() => {setBolProtocol('PICKUP'); triggerPulse();}} className={`px-8 py-3 text-[10px] font-black rounded-xl border-2 transition-all duration-500 ${bolProtocol === 'PICKUP' ? `bg-black text-white border-[${themeHex}] shadow-lg` : 'bg-white text-zinc-500 border-zinc-200'}`}>PICKUP BOL</button>
              <button onClick={() => {setBolProtocol('DELIVERY'); triggerPulse();}} className={`px-8 py-3 text-[10px] font-black rounded-xl border-2 transition-all duration-500 ${bolProtocol === 'DELIVERY' ? `bg-black text-white border-[${themeHex}] shadow-lg` : 'bg-white text-zinc-500 border-zinc-200'}`}>DELIVERY BOL</button>
            </div>
          </div>
          <div className="flex justify-center gap-16 py-6">
            <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center gap-4 group">
              <div className="w-24 h-24 rounded-2xl bg-zinc-800 flex items-center justify-center text-4xl border border-zinc-700 hover:bg-white transition-all">📸</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">Camera</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-4 group">
              <div className="w-24 h-24 rounded-2xl bg-zinc-800 flex items-center justify-center text-4xl border border-zinc-700 hover:bg-white transition-all">📂</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">Gallery</span>
            </button>
          </div>
          {/* BOL PREVIEWS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {uploadedFiles.filter(f => f.category === 'bol').map(f => (
              <div key={f.id} className="aspect-[3/4] rounded-2xl bg-zinc-900 overflow-hidden relative group border border-zinc-800 shadow-2xl">
                <img src={f.preview} className="w-full h-full object-cover" alt="BOL" />
                <button onClick={() => setUploadedFiles(p => p.filter(i => i.id !== f.id))} className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
              </div>
            ))}
          </div>
        </section>

        {/* MODULE 05: FREIGHT (Restored Entirely) */}
        {bolProtocol === 'PICKUP' && (
          <section ref={freightSectionRef} className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${themeColor}`}>[ 05 ] Freight on Trailer</h3>
            <div className="flex justify-center gap-16 py-6">
              <button onClick={() => freightCamRef.current?.click()} className="flex flex-col items-center gap-4 group">
                <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center text-3xl border border-zinc-700 hover:bg-white transition-all">📸</div>
                <span className="text-[10px] font-black text-zinc-500 uppercase">Camera</span>
              </button>
              <button onClick={() => freightFileRef.current?.click()} className="flex flex-col items-center gap-3 group">
                <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center text-3xl border border-zinc-700 hover:bg-white transition-all">📂</div>
                <span className="text-[10px] font-black text-zinc-500 uppercase">Gallery</span>
              </button>
            </div>
            {/* FREIGHT PREVIEWS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {uploadedFiles.filter(f => f.category === 'freight').map(f => (
                <div key={f.id} className="aspect-square rounded-2xl bg-zinc-900 overflow-hidden relative group border border-zinc-800">
                  <img src={f.preview} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                  <button onClick={() => setUploadedFiles(p => p.filter(i => i.id !== f.id))} className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                </div>
              ))}
            </div>
          </section>
        )}

        <button 
          onClick={() => { if(isReady){ setIsSubmitting(true); setTimeout(() => setShowSuccess(true), 2500); } }}
          disabled={!isReady}
          className={`w-full py-10 rounded-[2.5rem] font-black uppercase tracking-[1.2em] transition-all duration-1000 shadow-2xl relative overflow-hidden group
            ${isReady ? `bg-gradient-to-r ${isGLX ? 'from-green-600 to-green-400' : 'from-blue-600 to-blue-400'} text-white scale-[1.01]` : 'bg-zinc-900 text-zinc-700 opacity-50'}
          `}>
          <span className="relative z-10">{isSubmitting ? 'SECURE UPLOAD...' : isReady ? 'SUBMIT DOCUMENTS' : 'COMPLETE FIELDS'}</span>
        </button>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 animate-in fade-in">
           <div className="w-32 h-32 rounded-full border-4 flex items-center justify-center text-5xl mb-12 animate-bounce" style={{ borderColor: themeHex }}>✓</div>
           <h2 className="text-4xl font-black italic uppercase tracking-[0.5em] text-white">Verified</h2>
           <button onClick={() => window.location.reload()} className="mt-16 text-zinc-600 uppercase text-xs font-black tracking-widest">New Session</button>
        </div>
      )}

      {/* HIDDEN INPUTS */}
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" multiple onChange={(e) => onFileSelect(e, 'bol')} />
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => onFileSelect(e, 'bol')} />
      <input type="file" ref={freightCamRef} className="hidden" capture="environment" accept="image/*" multiple onChange={(e) => onFileSelect(e, 'freight')} />
      <input type="file" ref={freightFileRef} className="hidden" multiple accept="image/*" onChange={(e) => onFileSelect(e, 'freight')} />
    </div>
  );
};

export default App;