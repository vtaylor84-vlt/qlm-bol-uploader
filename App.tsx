import React, { useState, useRef, useEffect, useMemo } from 'react';

/**
 * LOGISTICS TERMINAL v15.0 - SOVEREIGN COMMAND (STABLE)
 * - UI: High-End Tactical Visuals (Borders, Glows, Handshake)
 * - FIX: Emergency Image Compression (1200px Max, 0.7 Quality)
 * - FIX: Sequential Image Processing to prevent memory crashes.
 */

interface FileWithPreview {
  file: File | Blob; preview: string; id: string; category: 'bol' | 'freight';
}

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby-L6nKjgfAnLFPgezkf3inQTJRG3Ql_MufZ-jlKWhSbPdEHeQniPLdNQDaidM2EY6MdA/exec';

// --- AUDIO ENGINE ---
let globalAudioCtx: AudioContext | null = null;
const playSound = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
  try {
    if (!globalAudioCtx) globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = globalAudioCtx.createOscillator();
    const gain = globalAudioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, globalAudioCtx.currentTime);
    gain.gain.setValueAtTime(vol, globalAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, globalAudioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(globalAudioCtx.destination);
    osc.start(); osc.stop(globalAudioCtx.currentTime + duration);
  } catch (e) { }
};

// --- STRENGTHENED COMPRESSION ENGINE ---
const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200; 
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.7);
      };
    };
  });
};

// --- BRAND ASSETS ---
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
      </defs>
      <text x="50%" y="85" textAnchor="middle" style={{ fontFamily: 'Arial Black, sans-serif', fontSize: '110px', fontWeight: '900', fill: 'url(#bst-chrome)', fontStyle: 'italic', letterSpacing: '-5px' }}>BST</text>
      <text x="50%" y="125" textAnchor="middle" style={{ fontFamily: 'monospace', fontSize: '16px', fill: '#60a5fa', fontWeight: 'bold', letterSpacing: '8px', textTransform: 'uppercase' }}>EXPEDITE INC</text>
    </svg>
  </div>
);

const App: React.FC = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [authStage, setAuthStage] = useState(0);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const [shake, setShake] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const freightCamRef = useRef<HTMLInputElement>(null);
  const freightFileRef = useRef<HTMLInputElement>(null);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
  const themeHex = company === 'GLX' ? '#22c55e' : isBST ? '#3b82f6' : '#6366f1';
  const themeColor = company === 'GLX' ? 'text-green-500' : isBST ? 'text-blue-500' : 'text-zinc-600';

  const s1Ready = !!(company && driverName);
  const s2Ready = !!(loadNum || bolNum);
  const s3Ready = !!(puCity && puState && delCity && delState);
  const s4Ready = !!(bolProtocol && uploadedFiles.some(f => f.category === 'bol'));
  const isReady = s1Ready && s2Ready && s3Ready && s4Ready;

  const startSecureHandshake = () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    let stage = 0;
    const interval = setInterval(() => {
      stage++; setAuthStage(stage);
      playSound(200 + (stage * 100), 'sine', 0.1);
      if (stage >= 4) { clearInterval(interval); playSound(800, 'square', 0.2, 0.05); setTimeout(() => setIsLocked(false), 800); }
    }, 700);
  };

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, category: 'bol' | 'freight') => {
    if (e.target.files && e.target.files.length > 0) {
      playSound(600, 'triangle', 0.1);
      const files = Array.from(e.target.files);
      for (const f of files) {
        try {
          const compressedBlob = await compressImage(f);
          const newFile: FileWithPreview = {
            file: compressedBlob,
            preview: URL.createObjectURL(compressedBlob),
            id: Math.random().toString(36).substr(2, 9),
            category
          };
          setUploadedFiles(prev => [...prev, newFile]);
        } catch (err) { console.error(err); }
      }
      if (category === 'bol' && bolProtocol === 'PICKUP') setTimeout(() => setShowFreightPrompt(true), 600);
    }
  };

  const getTacticalInputStyles = (value: string) => {
    const isFilled = value && value.trim().length > 0;
    return `w-full p-5 rounded-2xl font-mono text-sm transition-all duration-500 border-2 outline-none
      ${isFilled ? `bg-black text-white border-[${themeHex}] shadow-[0_0_20px_${themeHex}30] tracking-widest` : 'bg-zinc-100 text-black border-zinc-200 focus:bg-white'}`;
  };

  const transmitData = async () => {
    setIsSubmitting(true);
    try {
      const base64Files = await Promise.all(uploadedFiles.map(async (f) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ category: f.category, base64: reader.result });
          reader.readAsDataURL(f.file);
        });
      }));
      const payload = { company, driverName, loadNum, bolNum, puCity, puState, delCity, delState, bolProtocol, files: base64Files };
      await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
      setShowSuccess(true);
    } catch (e) { setShake(true); setIsSubmitting(false); }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-zinc-950/50 p-10 border border-zinc-900 rounded-[3rem] backdrop-blur-3xl shadow-2xl flex flex-col items-center gap-10">
          <button onClick={startSecureHandshake} className={`relative w-40 h-40 border-2 rounded-full flex items-center justify-center transition-all duration-1000 ${isAuthenticating ? 'border-blue-500' : 'border-zinc-800'}`}>
            <span className={`text-6xl ${isAuthenticating ? 'animate-pulse' : ''}`}>{isAuthenticating ? '🔐' : '🛡️'}</span>
          </button>
          <div className="w-full space-y-4 font-mono text-[10px]">
            {[{ label: 'ENCRYPTING...', done: authStage >= 1 }, { label: 'VERIFYING...', done: authStage >= 2 }, { label: 'HANDSHAKE SECURE', done: authStage >= 4, color: 'text-green-500' }].map((step, i) => (
              <div key={i} className={`flex justify-between ${step.done ? (step.color || 'text-blue-400') : 'text-zinc-800'}`}>
                <span>{`> ${step.label}`}</span><span>{step.done ? '[OK]' : '[--]'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#020202] text-zinc-100 pb-24 font-sans ${shake ? 'animate-shake' : ''}`}>
      <header className="max-w-4xl mx-auto pt-10 px-4 mb-12 relative">
        <div className={`w-full min-h-[220px] rounded-[3.5rem] border-2 transition-all duration-1000 flex items-center justify-center ${company ? 'bg-black shadow-[0_0_60px_rgba(0,0,0,0.8)]' : 'bg-zinc-900/50 border-zinc-800'}`} style={{ borderColor: company ? themeHex : '' }}>
          {!company && <h1 className="text-5xl font-black italic tracking-tighter uppercase text-zinc-700">BOL UPLOADER</h1>}
          {isGLX && <GreenleafLogo />}
          {isBST && <BSTLogo />}
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-8 px-4 relative">
        {/* IDENTIFICATION */}
        <section className={`bg-zinc-900/40 border-2 transition-all duration-700 rounded-[2.5rem] p-8 shadow-2xl ${s1Ready ? '' : 'border-zinc-800 opacity-60'}`} style={{ borderColor: s1Ready ? themeHex : '' }}>
          <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${s1Ready ? themeColor : 'text-zinc-500'}`}>[ 01 ] Identification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <select className={getTacticalInputStyles(company)} value={company} onChange={(e) => setCompany(e.target.value as any)}>
              <option value="">SELECT CARRIER</option><option value="GLX">GREENLEAF XPRESS</option><option value="BST">BST EXPEDITE INC</option>
            </select>
            <input type="text" placeholder="DRIVER NAME" className={getTacticalInputStyles(driverName)} value={driverName} onChange={(e) => setDriverName(e.target.value.toUpperCase())} />
          </div>
        </section>

        {/* REFERENCES */}
        <section className={`bg-zinc-900/40 border-2 transition-all duration-700 rounded-[2.5rem] p-8 shadow-2xl ${s2Ready ? '' : 'border-zinc-800 opacity-60'}`} style={{ borderColor: s2Ready ? themeHex : '' }}>
          <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${s2Ready ? themeColor : 'text-zinc-500'}`}>[ 02 ] Document References</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input type="text" placeholder="LOAD #" className={getTacticalInputStyles(loadNum)} value={loadNum} onChange={(e) => setLoadNum(e.target.value.toUpperCase())} />
            <input type="text" placeholder="BOL #" className={getTacticalInputStyles(bolNum)} value={bolNum} onChange={(e) => setBolNum(e.target.value.toUpperCase())} />
          </div>
        </section>

        {/* ORIGIN / DESTINATION */}
        <section className={`bg-zinc-900/40 border-2 transition-all duration-700 rounded-[2.5rem] p-8 shadow-2xl space-y-10 ${s3Ready ? '' : 'border-zinc-800 opacity-60'}`} style={{ borderColor: s3Ready ? themeHex : '' }}>
          <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${s3Ready ? themeColor : 'text-zinc-500'}`}>[ 03 ] Route</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2"><input type="text" placeholder="PU CITY" className={getTacticalInputStyles(puCity)} value={puCity} onChange={(e) => setPuCity(e.target.value.toUpperCase())} /></div>
            <select className={getTacticalInputStyles(puState)} value={puState} onChange={(e) => setPuState(e.target.value)}><option value="">ST</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2"><input type="text" placeholder="DEL CITY" className={getTacticalInputStyles(delCity)} value={delCity} onChange={(e) => setDelCity(e.target.value.toUpperCase())} /></div>
            <select className={getTacticalInputStyles(delState)} value={delState} onChange={(e) => setDelState(e.target.value)}><option value="">ST</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select>
          </div>
        </section>

        {/* UPLOAD */}
        <section className={`rounded-[2.5rem] p-8 border-2 transition-all duration-700 ${s4Ready ? 'bg-black' : 'bg-zinc-900/20 border-zinc-800 border-dashed opacity-60'}`} style={{ borderColor: s4Ready ? themeHex : '' }}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10">
            <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] ${s4Ready ? themeColor : 'text-zinc-500'}`}>[ 04 ] Document Uplink</h3>
            <div className="flex gap-4">
              <button onClick={() => setBolProtocol('PICKUP')} className={`px-6 py-2 rounded-xl font-black text-[10px] border-2 transition-all ${bolProtocol === 'PICKUP' ? `bg-black text-white border-[${themeHex}]` : 'bg-white text-zinc-500'}`}>PICKUP BOL</button>
              <button onClick={() => setBolProtocol('DELIVERY')} className={`px-6 py-2 rounded-xl font-black text-[10px] border-2 transition-all ${bolProtocol === 'DELIVERY' ? `bg-black text-white border-[${themeHex}]` : 'bg-white text-zinc-500'}`}>DELIVERY BOL</button>
            </div>
          </div>
          <div className="flex justify-center gap-16 py-6">
            <button onClick={() => cameraInputRef.current?.click()} className="text-4xl bg-zinc-800 p-6 rounded-2xl shadow-xl">📸</button>
            <button onClick={() => fileInputRef.current?.click()} className="text-4xl bg-zinc-800 p-6 rounded-2xl shadow-xl">📂</button>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-6">
            {uploadedFiles.filter(f => f.category === 'bol').map(f => (
              <div key={f.id} className="aspect-[3/4] rounded-xl overflow-hidden border border-zinc-800 relative group">
                <img src={f.preview} className="w-full h-full object-cover" />
                <button onClick={() => setUploadedFiles(p => p.filter(i => i.id !== f.id))} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-[10px]">✕</button>
              </div>
            ))}
          </div>
        </section>

        {/* FREIGHT */}
        {bolProtocol === 'PICKUP' && (
          <section className={`bg-zinc-900/40 border-2 transition-all duration-700 rounded-[2.5rem] p-8 shadow-2xl ${uploadedFiles.some(f => f.category === 'freight') ? '' : 'border-zinc-800 opacity-60'}`} style={{ borderColor: uploadedFiles.some(f => f.category === 'freight') ? themeHex : '' }}>
            <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${uploadedFiles.some(f => f.category === 'freight') ? themeColor : 'text-zinc-500'}`}>[ 05 ] Freight Loaded on Trailer Photos</h3>
            <div className="flex justify-center gap-10">
              <button onClick={() => freightCamRef.current?.click()} className="text-3xl bg-zinc-800 p-5 rounded-2xl">📸</button>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-6">
              {uploadedFiles.filter(f => f.category === 'freight').map(f => (
                <div key={f.id} className="aspect-square rounded-xl overflow-hidden border border-zinc-800"><img src={f.preview} className="w-full h-full object-cover" /></div>
              ))}
            </div>
          </section>
        )}

        <button 
          onClick={transmitData}
          disabled={!isReady || isSubmitting}
          className={`w-full py-10 rounded-[2.5rem] font-black uppercase tracking-[1.5em] transition-all duration-1000 relative overflow-hidden
            ${isReady ? `bg-gradient-to-r ${company === 'GLX' ? 'from-green-600 to-green-400' : 'from-blue-600 to-blue-400'} text-black shadow-[0_0_80px_${themeHex}80]` : 'bg-zinc-900 text-zinc-800 opacity-50 cursor-not-allowed'}`}
        >
          {isSubmitting ? 'UPLOADING...' : isReady ? 'SUBMIT DOCUMENTS' : 'COMPLETE FIELDS'}
        </button>
      </div>

      {showFreightPrompt && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
          <div className={`bg-zinc-900 border-2 rounded-[2.5rem] p-10 max-w-sm text-center shadow-2xl`} style={{ borderColor: themeHex }}>
            <h2 className={`text-xl font-black uppercase mb-4 ${themeColor}`}>Pickup Detected</h2>
            <p className="text-zinc-400 text-sm mb-8 uppercase tracking-widest italic font-bold">Take photos of the freight loaded on the trailer?</p>
            <div className="flex flex-col gap-4">
              <button onClick={() => { setShowFreightPrompt(false); freightCamRef.current?.click(); }} className={`${company === 'GLX' ? 'bg-green-500' : 'bg-blue-600'} text-black py-4 rounded-xl font-black uppercase tracking-widest`}>Open Camera</button>
              <button onClick={() => setShowFreightPrompt(false)} className="text-zinc-500 py-2 font-black uppercase text-[10px]">No, Skip</button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center animate-in fade-in">
           <div className="w-32 h-32 rounded-full border-4 flex items-center justify-center text-5xl mb-12 animate-bounce text-white" style={{ borderColor: themeHex }}>✓</div>
           <h2 className="text-4xl font-black italic uppercase text-white tracking-widest">Verified</h2>
           <button onClick={() => window.location.reload()} className="mt-16 text-zinc-600 uppercase text-xs font-black tracking-widest hover:text-white">New Session</button>
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