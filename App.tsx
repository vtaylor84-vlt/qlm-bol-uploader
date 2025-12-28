import React, { useState, useRef, useEffect, useMemo } from 'react';

/**
 * LOGISTICS TERMINAL v5.1 - APEX PRODUCTION (FIXED)
 * Fix: Resolved Unterminated Regex / JSX nesting error at line 196.
 * Features: High-Contrast Field Swapping, Tactical Modules, Chrome Branding.
 */

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
  category: 'bol' | 'freight';
}

// --- BRAND ASSETS ---

const BSTLogo = () => (
  <div className="flex flex-col items-center justify-center p-6 bg-zinc-950 rounded-[2rem] border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
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

const GreenleafLogo = () => (
  <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000">
    <svg width="320" height="180" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
      <path d="M150 130L50 200H350L250 130H150Z" fill="#222" stroke="#333" strokeWidth="2"/>
      <path d="M200 135V150M200 165V185M200 195V200" stroke="white" strokeWidth="4" strokeDasharray="8 8" opacity="0.6"/>
      <path d="M200 20C200 20 130 50 130 100C130 140 200 150 200 150C200 150 270 140 270 100C270 50 200 20 200 20Z" fill="#15803d" />
      <path d="M200 25V145M200 50L160 80M200 80L150 115M200 60L240 90" stroke="#052e16" strokeWidth="3" strokeLinecap="round"/>
    </svg>
    <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic -mt-6">Greenleaf Xpress</h2>
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

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const themeHex = isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#6366f1';
  const themeColor = isGLX ? 'text-green-500' : isBST ? 'text-blue-500' : 'text-indigo-500';
  const themeBg = isGLX ? 'bg-green-500' : isBST ? 'bg-blue-600' : 'bg-cyan-500';

  const isReady = useMemo(() => {
    return company && driverName && (loadNum || bolNum) && puCity && puState && delCity && delState && bolProtocol && uploadedFiles.some(f => f.category === 'bol');
  }, [company, driverName, loadNum, bolNum, puCity, puState, delCity, delState, bolProtocol, uploadedFiles]);

  const getInputStyles = (value: string) => {
    const isFilled = value.trim().length > 0;
    return `w-full p-5 rounded-2xl font-mono text-sm transition-all duration-500 border-2 outline-none
      ${isFilled 
        ? `bg-black text-white shadow-[0_0_15px_${themeHex}40] border-[${themeHex}]` 
        : 'bg-white text-zinc-900 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800'}`;
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>, category: 'bol' | 'freight') => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9),
        category
      }));
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#020202] flex items-center justify-center p-6">
        <button onClick={() => setIsLocked(false)} className="group flex flex-col items-center gap-6">
          <div className="w-40 h-40 rounded-full border-4 border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:border-blue-500 transition-all duration-700">
            <span className="text-6xl animate-pulse">🛡️</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">ESTABLISH SECURE UPLINK</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#020202] transition-colors duration-700 pb-20">
      <header className="max-w-4xl mx-auto pt-10 px-4 mb-12">
        <div className={`w-full min-h-[200px] rounded-[3rem] border-2 flex items-center justify-center transition-all duration-1000 ${
          isGLX ? 'bg-white border-green-600 shadow-xl' : isBST ? 'bg-zinc-950 border-blue-600 shadow-2xl' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
        }`}>
          {!company && <h1 className="text-4xl font-black italic tracking-tighter text-zinc-900 dark:text-white uppercase">BOL Terminal</h1>}
          {isGLX && <GreenleafLogo />}
          {isBST && <BSTLogo />}
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-6 px-4">
        <section className="bg-white dark:bg-zinc-950/50 border-2 border-zinc-100 dark:border-zinc-900 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className={`text-[11px] font-black uppercase tracking-[0.4em] mb-8 ${themeColor}`}>[ 01 ] Company & Driver</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <select className={getInputStyles(company)} value={company} onChange={(e) => setCompany(e.target.value as any)}>
              <option value="">SELECT CARRIER</option>
              <option value="GLX">GREENLEAF XPRESS</option>
              <option value="BST">BST EXPEDITE INC</option>
            </select>
            <input type="text" placeholder="ENTER DRIVER NAME" className={getInputStyles(driverName)} value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>
        </section>

        <section className="bg-white dark:bg-zinc-950/50 border-2 border-zinc-100 dark:border-zinc-900 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className={`text-[11px] font-black uppercase tracking-[0.4em] mb-8 ${themeColor}`}>[ 02 ] Load Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input type="text" placeholder="ENTER LOAD #" className={getInputStyles(loadNum)} value={loadNum} onChange={(e) => setLoadNum(e.target.value.toUpperCase())} />
            <input type="text" placeholder="ENTER BOL #" className={getInputStyles(bolNum)} value={bolNum} onChange={(e) => setBolNum(e.target.value.toUpperCase())} />
          </div>
        </section>

        <section className="bg-white dark:bg-zinc-950/50 border-2 border-zinc-100 dark:border-zinc-900 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className={`text-[11px] font-black uppercase tracking-[0.4em] mb-8 ${themeColor}`}>[ 03 ] Route Details</h3>
          <div className="grid grid-cols-2 gap-6">
            <input type="text" placeholder="PICKUP CITY" className={getInputStyles(puCity)} value={puCity} onChange={(e) => setPuCity(e.target.value)} />
            <select className={getInputStyles(puState)} value={puState} onChange={(e) => setPuState(e.target.value)}>
              <option value="">STATE</option>{states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="text" placeholder="DELIVERY CITY" className={getInputStyles(delCity)} value={delCity} onChange={(e) => setDelCity(e.target.value)} />
            <select className={getInputStyles(delState)} value={delState} onChange={(e) => setDelState(e.target.value)}>
              <option value="">STATE</option>{states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </section>

        <section className={`rounded-[2.5rem] p-8 border-2 transition-all duration-700 ${bolProtocol ? 'bg-zinc-950 border-zinc-800' : 'bg-white dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-900 border-dashed'}`}>
          <div className="flex justify-between items-center mb-10">
            <h3 className={`text-[11px] font-black uppercase tracking-[0.4em] ${themeColor}`}>[ 04 ] Scan BOL / Paperwork</h3>
            <div className="flex gap-2">
              <button onClick={() => setBolProtocol('PICKUP')} className={`px-6 py-2 text-[10px] font-black rounded-lg border-2 ${bolProtocol === 'PICKUP' ? `${themeBg} border-white text-white` : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'}`}>PICKUP</button>
              <button onClick={() => setBolProtocol('DELIVERY')} className={`px-6 py-2 text-[10px] font-black rounded-lg border-2 ${bolProtocol === 'DELIVERY' ? `${themeBg} border-white text-white` : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'}`}>DELIVERY</button>
            </div>
          </div>
          <div className="flex justify-center py-6">
            <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-3xl border border-zinc-200 dark:border-zinc-700 hover:scale-105 transition-all">📸</div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Camera</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {uploadedFiles.map(f => (
              <div key={f.id} className="aspect-[3/4] rounded-2xl overflow-hidden relative border-2 border-zinc-800 bg-black">
                <img src={f.preview} className="w-full h-full object-cover" alt="Scan" />
                <button onClick={() => setUploadedFiles(p => p.filter(i => i.id !== f.id))} className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs">✕</button>
              </div>
            ))}
          </div>
        </section>

        <button onClick={() => { setIsSubmitting(true); setTimeout(() => setShowSuccess(true), 2500); }} disabled={!isReady} 
          className={`w-full py-8 rounded-[2rem] font-black uppercase tracking-[1em] transition-all duration-500 ${isReady ? `${themeBg} text-white shadow-2xl scale-[1.02]` : 'bg-zinc-200 dark:bg-zinc-900 text-zinc-400 opacity-50'}`}>
          {isSubmitting ? 'Verifying...' : 'Submit Paperwork'}
        </button>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center p-6 animate-in fade-in">
          <div className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center text-5xl mb-8 animate-bounce">✅</div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-widest">Verified</h2>
          <button onClick={() => window.location.reload()} className="mt-10 px-10 py-4 border border-zinc-800 rounded-full text-zinc-500 uppercase text-xs font-black">New Session</button>
        </div>
      )}
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" multiple onChange={(e) => onFileSelect(e, 'bol')} />
    </div>
  );
};

export default App;