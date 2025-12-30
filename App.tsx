import React, { useState, useRef, useEffect } from 'react';

/** * LOGISTICS TERMINAL v18.0 - MASTER RESTORATION
 * - RESTORED: Gallery & Camera buttons for all upload sections.
 * - RESTORED: Swap Button, Solar/Midnight Toggle, and BST Logo.
 * - RESTORED: Section completion glowing borders and tactical input boxes.
 * - FIX: Async Image Compression and Offline Vault Persistence.
 */

interface FileWithPreview {
  file: File | Blob; preview: string; id: string; category: 'bol' | 'freight';
}

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby-L6nKjgfAnLFPgezkf3inQTJRG3Ql_MufZ-jlKWhSbPdEHeQniPLdNQDaidM2EY6MdA/exec';

// --- AUDIO & HAPTIC ENGINE ---
let globalAudioCtx: AudioContext | null = null;
const playSound = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
  try {
    if (!globalAudioCtx) globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = globalAudioCtx.createOscillator();
    const gain = globalAudioCtx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, globalAudioCtx.currentTime);
    gain.gain.setValueAtTime(vol, globalAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, globalAudioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(globalAudioCtx.destination);
    osc.start(); osc.stop(globalAudioCtx.currentTime + duration);
  } catch (e) {}
};

// --- IMAGE COMPRESSION ---
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
        let width = img.width; let height = img.height;
        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        canvas.width = width; canvas.height = height;
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
    <svg width="320" height="180" viewBox="0 0 400 220" fill="none">
      <path d="M150 130L50 200H350L250 130H150Z" fill="url(#roadGradient)" stroke="#333" strokeWidth="2"/>
      <path d="M200 135V150M200 165V185M200 195V200" stroke="white" strokeWidth="4" strokeDasharray="8 8" opacity="0.6"/>
      <path d="M200 20C200 20 130 50 130 100C130 140 200 150 200 150C200 150 270 140 270 100C270 50 200 20 200 20Z" fill="#15803d" />
      <path d="M200 25V145M200 50L160 80M200 80L150 115M200 60L240 90M200 95L250 125" stroke="#052e16" strokeWidth="3" strokeLinecap="round"/>
      <defs><linearGradient id="roadGradient" x1="200" y1="130" x2="200" y2="200" gradientUnits="userSpaceOnUse"><stop stopColor="#444444"/><stop offset="1" stopColor="#111111"/></linearGradient></defs>
    </svg>
    <div className="text-center -mt-6"><h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none uppercase italic">Greenleaf Xpress</h2><p className="text-[10px] font-bold text-zinc-500 tracking-[0.6em] mt-3 uppercase">Waterloo, Iowa</p></div>
  </div>
);

const BSTLogo = () => (
  <div className="flex flex-col items-center justify-center p-6 animate-in zoom-in duration-1000">
    <svg width="320" height="120" viewBox="0 0 400 140">
      <defs><linearGradient id="bst-chrome" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#ffffff" /><stop offset="50%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1e3a8a" /></linearGradient><filter id="bst-neon"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      <text x="50%" y="85" textAnchor="middle" style={{ fontFamily: 'Arial Black, sans-serif', fontSize: '110px', fontWeight: '900', fill: 'url(#bst-chrome)', filter: 'url(#bst-neon)', fontStyle: 'italic', letterSpacing: '-5px' }}>BST</text><text x="50%" y="125" textAnchor="middle" style={{ fontFamily: 'monospace', fontSize: '16px', fill: '#60a5fa', fontWeight: 'bold', letterSpacing: '8px', textTransform: 'uppercase' }}>EXPEDITE INC</text>
    </svg>
  </div>
);

const App: React.FC = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [solarMode, setSolarMode] = useState(false);
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
  const [showFreightPrompt, setShowFreightPrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const freightCamRef = useRef<HTMLInputElement>(null);
  const freightFileRef = useRef<HTMLInputElement>(null);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
  const themeHex = company === 'GLX' ? '#22c55e' : '#3b82f6';
  const themeColor = company === 'GLX' ? 'text-green-500' : 'text-blue-500';

  const s1Ready = !!(company && driverName);
  const s2Ready = !!(loadNum || bolNum);
  const s3Ready = !!(puCity && puState && delCity && delState);
  const s4Ready = !!(bolProtocol && uploadedFiles.some(f => f.category === 'bol'));
  const isReady = s1Ready && s2Ready && s3Ready && s4Ready;

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, category: 'bol' | 'freight') => {
    if (e.target.files) {
      playSound(600, 'triangle', 0.1);
      const files = Array.from(e.target.files);
      for (const f of files) {
        const compressed = await compressImage(f);
        setUploadedFiles(prev => [...prev, { file: compressed, preview: URL.createObjectURL(compressed), id: Math.random().toString(36).substr(2, 9), category }]);
      }
      if (category === 'bol' && bolProtocol === 'PICKUP') setShowFreightPrompt(true);
    }
  };

  const getTacticalInputStyles = (value: string) => {
    const isFilled = value && value.trim().length > 0;
    if (solarMode) return `w-full p-5 rounded-2xl font-mono text-sm border-2 outline-none ${isFilled ? `bg-white border-[${themeHex}] shadow-lg` : 'bg-white border-zinc-200'}`;
    return `w-full p-5 rounded-2xl font-mono text-sm border-2 transition-all duration-500 outline-none
      ${isFilled ? `bg-black text-white border-[${themeHex}] shadow-[0_0_20px_${themeHex}30]` : 'bg-zinc-100 text-black border-zinc-200 focus:bg-white'}`;
  };

  const transmitData = async () => {
    setIsSubmitting(true);
    const base64Files = await Promise.all(uploadedFiles.map(async (f) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ category: f.category, base64: reader.result });
        reader.readAsDataURL(f.file);
      });
    }));
    const payload = { company, driverName, loadNum, bolNum, puCity, puState, delCity, delState, bolProtocol, files: base64Files };
    localStorage.setItem('load_vault', JSON.stringify(payload));
    try {
      await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
      localStorage.removeItem('load_vault'); setShowSuccess(true);
    } catch (e) { setIsSubmitting(false); alert("SIGNAL LOST: Load saved to phone memory."); }
  };

  if (isLocked) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <button onClick={() => { let stage=0; const inv=setInterval(()=>{ stage++; setAuthStage(stage); playSound(200+(stage*100),'sine',0.1); if(stage>=4){ clearInterval(inv); setIsLocked(false); }},500); }} className="w-40 h-40 border-2 border-zinc-800 rounded-full text-zinc-500 font-black animate-pulse shadow-2xl">CONNECT</button>
      <div className="mt-8 space-y-2 font-mono text-[10px]">
        {['ENCRYPTING...', 'VERIFYING...', 'UPLINKING...', 'SECURE'].map((l, i) => (<div key={i} className={authStage > i ? (i===3?'text-green-500':'text-blue-500') : 'text-zinc-800'}>{`> ${l}`}</div>))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${solarMode ? 'bg-white text-black' : 'bg-[#020202] text-zinc-100'} pb-24 font-sans`}>
      <header className="max-w-4xl mx-auto pt-10 px-4 mb-12 relative">
        <div className="flex justify-end mb-4"><button onClick={() => setSolarMode(!solarMode)} className="p-3 rounded-full border-2 font-black uppercase text-[9px] tracking-widest">{solarMode ? '🌙 Midnight' : '☀️ Solar'}</button></div>
        <div className={`w-full min-h-[220px] rounded-[3.5rem] border-2 transition-all duration-1000 flex items-center justify-center ${company ? 'bg-black shadow-2xl' : 'bg-zinc-900/50 border-zinc-800'}`} style={{ borderColor: company ? themeHex : '' }}>
          {!company && <h1 className="text-4xl font-black italic tracking-tighter uppercase text-zinc-700">QLM<span className="text-zinc-500">CONNECT</span></h1>}{company === 'GLX' && <GreenleafLogo />}{company === 'BST' && <BSTLogo />}
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-8 px-4">
        {/* [ 01 ] Identification */}
        <section className={`bg-zinc-900/40 border-2 rounded-[2.5rem] p-8 shadow-2xl ${solarMode ? 'bg-zinc-50 border-zinc-200' : 'border-zinc-800'}`} style={{ borderColor: s1Ready ? themeHex : '' }}>
          <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${s1Ready ? themeColor : 'text-zinc-500'}`}>[ 01 ] Identification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <select className={getTacticalInputStyles(company)} value={company} onChange={(e) => setCompany(e.target.value as any)}><option value="">CARRIER</option><option value="GLX">GREENLEAF</option><option value="BST">BST</option></select>
            <input type="text" placeholder="DRIVER NAME" className={getTacticalInputStyles(driverName)} value={driverName} onChange={(e) => setDriverName(e.target.value.toUpperCase())} />
          </div>
        </section>

        {/* [ 02 ] References */}
        <section className={`bg-zinc-900/40 border-2 rounded-[2.5rem] p-8 shadow-2xl ${solarMode ? 'bg-zinc-50 border-zinc-200' : 'border-zinc-800'}`} style={{ borderColor: s2Ready ? themeHex : '' }}>
          <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${s2Ready ? themeColor : 'text-zinc-500'}`}>[ 02 ] References</h3>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="LOAD #" className={getTacticalInputStyles(loadNum)} value={loadNum} onChange={(e) => setLoadNum(e.target.value.toUpperCase())} />
            <input type="text" placeholder="BOL #" className={getTacticalInputStyles(bolNum)} value={bolNum} onChange={(e) => setBolNum(e.target.value.toUpperCase())} />
          </div>
        </section>

        {/* [ 03 ] Route */}
        <section className={`bg-zinc-900/40 border-2 rounded-[2.5rem] p-8 shadow-2xl ${solarMode ? 'bg-zinc-50 border-zinc-200' : 'border-zinc-800'}`} style={{ borderColor: s3Ready ? themeHex : '' }}>
          <div className="flex justify-between items-center mb-8"><h3 className={`text-[11px] font-black uppercase tracking-[0.6em] ${s3Ready ? themeColor : 'text-zinc-500'}`}>[ 03 ] Route</h3><button onClick={() => { const tc=puCity; const ts=puState; setPuCity(delCity); setPuState(delState); setDelCity(tc); setDelState(ts); }} className="text-[10px] font-black border px-4 py-1 rounded-full uppercase transition-all hover:bg-white hover:text-black transition-all">⇅ Swap</button></div>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2"><input type="text" placeholder="PU CITY" className={getTacticalInputStyles(puCity)} value={puCity} onChange={(e) => setPuCity(e.target.value.toUpperCase())} /></div>
            <select className={getTacticalInputStyles(puState)} value={puState} onChange={(e) => setPuState(e.target.value)}><option value="">ST</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2"><input type="text" placeholder="DEL CITY" className={getTacticalInputStyles(delCity)} value={delCity} onChange={(e) => setDelCity(e.target.value.toUpperCase())} /></div>
            <select className={getTacticalInputStyles(delState)} value={delState} onChange={(e) => setDelState(e.target.value)}><option value="">ST</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select>
          </div>
        </section>

        {/* [ 04 ] Uplink */}
        <section className={`bg-zinc-900/40 border-2 rounded-[2.5rem] p-8 ${s4Ready ? 'bg-black shadow-2xl' : 'border-zinc-800 border-dashed opacity-60'}`} style={{ borderColor: s4Ready ? themeHex : '' }}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10">
            <h3 className={`text-[11px] font-black uppercase ${s4Ready ? themeColor : 'text-zinc-500'}`}>[ 04 ] Uplink</h3>
            <div className="flex gap-4">
              <button onClick={() => setBolProtocol('PICKUP')} className={`px-6 py-2 rounded-xl text-[10px] font-black ${bolProtocol === 'PICKUP' ? `bg-black text-white border-[${themeHex}]` : 'bg-white text-zinc-500'}`}>PICKUP BOL</button>
              <button onClick={() => setBolProtocol('DELIVERY')} className={`px-6 py-2 rounded-xl text-[10px] font-black ${bolProtocol === 'DELIVERY' ? `bg-black text-white border-[${themeHex}]` : 'bg-white text-zinc-500'}`}>DELIVERY BOL</button>
            </div>
          </div>
          <div className="flex justify-center gap-16 py-6 transition-all">
            <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center gap-4 group"><div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center text-4xl border border-zinc-700 shadow-xl group-active:scale-95">📸</div><span className="text-[10px] font-black uppercase text-zinc-500">Camera</span></button>
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-4 group"><div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center text-4xl border border-zinc-700 shadow-xl group-active:scale-95">📂</div><span className="text-[10px] font-black uppercase text-zinc-500">Gallery</span></button>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-6">
            {uploadedFiles.filter(f => f.category === 'bol').map(f => (<div key={f.id} className="aspect-[3/4] rounded-xl overflow-hidden border border-zinc-800 relative group animate-in zoom-in"><img src={f.preview} className="w-full h-full object-cover" /><button onClick={() => setUploadedFiles(p => p.filter(i => i.id !== f.id))} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-[10px]">✕</button></div>))}
          </div>
        </section>

        {/* [ 05 ] Freight Photos */}
        {bolProtocol === 'PICKUP' && (
          <section className={`bg-zinc-900/40 border-2 rounded-[2.5rem] p-8 shadow-2xl ${uploadedFiles.some(f => f.category === 'freight') ? 'bg-black' : 'border-zinc-800 border-dashed opacity-60'}`} style={{ borderColor: uploadedFiles.some(f => f.category === 'freight') ? themeHex : '' }}>
            <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${uploadedFiles.some(f => f.category === 'freight') ? themeColor : 'text-zinc-500'}`}>[ 05 ] Freight Loaded on Trailer Photos</h3>
            <div className="flex justify-center gap-16 py-6 transition-all">
              <button onClick={() => freightCamRef.current?.click()} className="flex flex-col items-center gap-4 group"><div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center text-4xl border border-zinc-700 shadow-xl group-active:scale-95">📸</div><span className="text-[10px] font-black uppercase text-zinc-500">Camera</span></button>
              <button onClick={() => freightFileRef.current?.click()} className="flex flex-col items-center gap-4 group"><div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center text-4xl border border-zinc-700 shadow-xl group-active:scale-95">📂</div><span className="text-[10px] font-black uppercase text-zinc-500">Gallery</span></button>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-6">
              {uploadedFiles.filter(f => f.category === 'freight').map(f => (<div key={f.id} className="aspect-square rounded-xl overflow-hidden border border-zinc-800 animate-in zoom-in"><img src={f.preview} className="w-full h-full object-cover" /></div>))}
            </div>
          </section>
        )}

        <button onClick={transmitData} disabled={!isReady || isSubmitting} className={`w-full py-10 rounded-[2.5rem] font-black uppercase tracking-[1.5em] transition-all duration-1000 border-2 border-white
            ${isReady ? `bg-gradient-to-r from-green-600 via-green-400 to-green-600 text-black shadow-[0_0_80px_${themeHex}80] scale-[1.02]` : 'bg-zinc-900 text-zinc-700 cursor-not-allowed'}`}>
          {isSubmitting ? 'UPLOADING DATA...' : 'SUBMIT DOCUMENTS'}
        </button>
      </div>

      {showFreightPrompt && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-zinc-900 border-2 rounded-[2.5rem] p-10 max-w-sm text-center shadow-2xl" style={{ borderColor: themeHex }}>
            <h2 className={`text-xl font-black uppercase mb-4 ${themeColor}`}>Pickup Detected</h2>
            <p className="text-zinc-400 text-sm mb-8 italic font-bold">Take photos of the freight loaded on the trailer?</p>
            <div className="flex flex-col gap-4">
              <button onClick={() => { setShowFreightPrompt(false); cameraInputRef.current?.click(); }} className="bg-green-500 text-black py-4 rounded-xl font-black uppercase tracking-widest shadow-xl">Open Camera</button>
              <button onClick={() => setShowFreightPrompt(false)} className="text-zinc-500 py-2 font-black uppercase text-[10px]">No, Skip</button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (<div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center p-10"><div className="w-32 h-32 rounded-full border-4 flex items-center justify-center text-5xl mb-12 animate-bounce" style={{ borderColor: themeHex }}>✓</div><h2 className="text-4xl font-black italic uppercase text-white tracking-widest text-center px-4 leading-tight">Verified & Transmitted</h2><button onClick={() => window.location.reload()} className="mt-16 text-zinc-600 uppercase text-xs font-black tracking-widest hover:text-white transition-colors">Terminate Session</button></div>)}
      
      {/* HIDDEN INPUTS */}
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" multiple onChange={(e) => onFileSelect(e, 'bol')} />
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => onFileSelect(e, 'bol')} />
      <input type="file" ref={freightCamRef} className="hidden" capture="environment" accept="image/*" multiple onChange={(e) => onFileSelect(e, 'freight')} />
      <input type="file" ref={freightFileRef} className="hidden" multiple accept="image/*" onChange={(e) => onFileSelect(e, 'freight')} />
    </div>
  );
};

export default App;