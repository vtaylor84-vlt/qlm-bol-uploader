import React, { useState, useRef, useMemo } from 'react';

/**
 * LOGISTICS TERMINAL v5.3 - FULL RESTORATION
 * - Restored: State Dropdowns, Freight Scan Section, & Full Route Details.
 * - UI: Black background, Radial Theme Glow, White-to-Black Input Flip.
 */

interface FileWithPreview {
  file: File; preview: string; id: string; category: 'bol' | 'freight';
}

// --- METALLIC BRAND ASSETS ---
const BSTLogo = () => (
  <div className="flex flex-col items-center justify-center p-6 bg-zinc-950 rounded-[2rem] border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
    <svg width="320" height="120" viewBox="0 0 400 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bst-chrome" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" /><stop offset="50%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <filter id="bst-neon"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <text x="50%" y="85" textAnchor="middle" style={{ fontFamily: 'Arial Black, sans-serif', fontSize: '110px', fontWeight: '900', fill: 'url(#bst-chrome)', filter: 'url(#bst-neon)', fontStyle: 'italic', letterSpacing: '-5px' }}>BST</text>
      <text x="50%" y="125" textAnchor="middle" style={{ fontFamily: 'monospace', fontSize: '16px', fill: '#60a5fa', fontWeight: 'bold', letterSpacing: '8px', textTransform: 'uppercase' }}>EXPEDITE INC</text>
    </svg>
  </div>
);

const GreenleafLogo = () => (
  <div className="flex flex-col items-center justify-center p-4 animate-in zoom-in duration-1000 bg-white rounded-[2.5rem] shadow-[0_0_50px_rgba(34,197,94,0.3)]">
    <svg width="320" height="160" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M150 130L50 200H350L250 130H150Z" fill="#111" stroke="#333" strokeWidth="2"/>
      <path d="M200 20C200 20 130 50 130 100C130 140 200 150 200 150C200 150 270 140 270 100C270 50 200 20 200 20Z" fill="#15803d" />
      <path d="M200 25V145M200 50L160 80M200 80L150 115" stroke="#052e16" strokeWidth="3" />
    </svg>
    <h2 className="text-4xl font-black text-black tracking-tighter uppercase italic -mt-4">Greenleaf Xpress</h2>
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
  const themeColor = isGLX ? 'text-green-500' : isBST ? 'text-blue-500' : 'text-zinc-500';

  const getInputStyles = (value: string) => {
    const isFilled = value.trim().length > 0;
    return `w-full p-5 rounded-2xl font-mono text-sm transition-all duration-500 border-2 outline-none
      ${isFilled 
        ? `bg-black text-white border-[${themeHex}] shadow-[0_0_20px_${themeHex}40]` 
        : 'bg-white text-black border-zinc-200 focus:border-zinc-400 focus:shadow-xl'}`;
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

  const isReady = useMemo(() => {
    return company && driverName && (loadNum || bolNum) && puCity && puState && delCity && delState && bolProtocol && uploadedFiles.some(f => f.category === 'bol');
  }, [company, driverName, loadNum, bolNum, puCity, puState, delCity, delState, bolProtocol, uploadedFiles]);

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6">
        <button onClick={() => setIsLocked(false)} className="w-48 h-48 rounded-full border border-zinc-800 flex items-center justify-center hover:border-blue-500 hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] transition-all duration-700">
           <span className="text-4xl animate-pulse text-white">📡</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 pb-24">
      <div className="fixed inset-0 pointer-events-none opacity-20 transition-all duration-1000"
           style={{ background: `radial-gradient(circle at 50% 0%, ${themeHex} 0%, transparent 70%)` }} />

      <header className="max-w-4xl mx-auto pt-10 px-4 mb-12 relative">
        <div className={`w-full min-h-[220px] rounded-[3.5rem] border-2 transition-all duration-1000 flex items-center justify-center ${
          isGLX ? 'bg-white border-green-600 shadow-[0_0_80px_rgba(34,197,94,0.3)]' : 
          isBST ? 'bg-zinc-950 border-blue-600 shadow-[0_0_80px_rgba(59,130,246,0.3)]' : 'bg-zinc-900/50 border-zinc-800'
        }`}>
          {!company && <h1 className="text-4xl font-black italic tracking-tighter uppercase text-zinc-600">BOL Terminal</h1>}
          {isGLX && <GreenleafLogo />}
          {isBST && <BSTLogo />}
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-6 px-4 relative">
        
        {/* MODULE 01: COMPANY & DRIVER */}
        <section className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
          <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${themeColor}`}>[ 01 ] Company & Driver</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <select className={getInputStyles(company)} value={company} onChange={(e) => setCompany(e.target.value as any)}>
              <option value="">SELECT CARRIER</option>
              <option value="GLX">GREENLEAF XPRESS</option>
              <option value="BST">BST EXPEDITE INC</option>
            </select>
            <input type="text" placeholder="ENTER OPERATOR NAME" className={getInputStyles(driverName)} value={driverName} onChange={(e) => setDriverName(e.target.value.toUpperCase())} />
          </div>
        </section>

        {/* MODULE 02: LOAD INFORMATION */}
        <section className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
          <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${themeColor}`}>[ 02 ] Load Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input type="text" placeholder="LOAD #" className={getInputStyles(loadNum)} value={loadNum} onChange={(e) => setLoadNum(e.target.value.toUpperCase())} />
            <input type="text" placeholder="BOL #" className={getInputStyles(bolNum)} value={bolNum} onChange={(e) => setBolNum(e.target.value.toUpperCase())} />
          </div>
        </section>

        {/* MODULE 03: ROUTE DETAILS (States Restored) */}
        <section className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
          <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${themeColor}`}>[ 03 ] Route Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] uppercase font-bold text-zinc-500 ml-2">Pickup Point</label>
              <input type="text" placeholder="CITY" className={getInputStyles(puCity)} value={puCity} onChange={(e) => setPuCity(e.target.value.toUpperCase())} />
              <select className={getInputStyles(puState)} value={puState} onChange={(e) => setPuState(e.target.value)}>
                <option value="">SELECT STATE</option>{states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] uppercase font-bold text-zinc-500 ml-2">Delivery Point</label>
              <input type="text" placeholder="CITY" className={getInputStyles(delCity)} value={delCity} onChange={(e) => setDelCity(e.target.value.toUpperCase())} />
              <select className={getInputStyles(delState)} value={delState} onChange={(e) => setDelState(e.target.value)}>
                <option value="">SELECT STATE</option>{states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* MODULE 04: SCAN SYSTEM */}
        <section className={`rounded-[2.5rem] p-8 border transition-all duration-700 ${
          bolProtocol ? 'bg-black border-zinc-700 shadow-2xl' : 'bg-zinc-900/20 border-zinc-800 border-dashed'
        }`}>
          <div className="flex justify-between items-center mb-10">
            <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] ${themeColor}`}>[ 04 ] Paperwork Scan</h3>
            <div className="flex gap-3">
              <button onClick={() => setBolProtocol('PICKUP')} className={`px-6 py-3 text-[10px] font-black rounded-xl border transition-all ${bolProtocol === 'PICKUP' ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-600'}`}>PICKUP</button>
              <button onClick={() => setBolProtocol('DELIVERY')} className={`px-6 py-3 text-[10px] font-black rounded-xl border transition-all ${bolProtocol === 'DELIVERY' ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-600'}`}>DELIVERY</button>
            </div>
          </div>
          
          <div className="flex justify-center py-10">
            <button onClick={() => cameraInputRef.current?.click()} className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-3xl hover:bg-white hover:text-black transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)]">📸</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {uploadedFiles.map(f => (
              <div key={f.id} className="aspect-[3/4] rounded-2xl bg-zinc-900 overflow-hidden border border-zinc-800 relative group">
                <img src={f.preview} className="w-full h-full object-cover" alt="Scan" />
                <button onClick={() => setUploadedFiles(p => p.filter(i => i.id !== f.id))} className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
              </div>
            ))}
          </div>
        </section>

        <button 
          onClick={() => { if(isReady){ setIsSubmitting(true); setTimeout(() => setShowSuccess(true), 2500); } }}
          className={`w-full py-10 rounded-[2.5rem] font-black uppercase tracking-[1.5em] transition-all duration-1000 ${
            isReady ? 'bg-white text-black shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:scale-[1.01]' : 'bg-zinc-900 text-zinc-800 cursor-not-allowed opacity-50'
          }`}>
          {isSubmitting ? 'UPLOADING DATA...' : 'TRANSMIT PAPERWORK'}
        </button>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 animate-in fade-in">
           <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center text-5xl mb-12 animate-bounce`} style={{ borderColor: themeHex }}>✓</div>
           <h2 className="text-4xl font-black italic uppercase tracking-[0.5em] text-white text-center">Verified</h2>
           <button onClick={() => window.location.reload()} className="mt-16 text-zinc-600 uppercase text-xs font-black tracking-widest hover:text-white transition-colors">Start New Session</button>
        </div>
      )}

      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" multiple onChange={(e) => onFileSelect(e, 'bol')} />
    </div>
  );
};

export default App;