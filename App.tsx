import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * LOGISTICS TERMINAL v2.0 - MASTER GRADE
 * UX: Industrial Sensory HUD | Engine: Web Audio & Haptics
 * Performance: Client-side Image Compression (Zero-Cost)
 */

interface FileWithPreview {
  file: File; preview: string; id: string; category: 'bol' | 'freight';
}

// --- GLOBAL ENGINE INSTANCES ---
let globalAudioCtx: AudioContext | null = null;

const playSound = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
  try {
    if (!globalAudioCtx) globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (globalAudioCtx.state === 'suspended') globalAudioCtx.resume();
    const osc = globalAudioCtx.createOscillator();
    const gain = globalAudioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, globalAudioCtx.currentTime);
    gain.gain.setValueAtTime(vol, globalAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, globalAudioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(globalAudioCtx.destination);
    osc.start(); osc.stop(globalAudioCtx.currentTime + duration);
  } catch (e) { /* Silent fail */ }
};

const triggerHaptic = (ms: number = 10) => {
  if ('vibrate' in navigator) navigator.vibrate(ms);
};

// --- IMAGE COMPRESSION UTILITY (FREE STORAGE SAVER) ---
const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1600;
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
        canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.8);
      };
    };
  });
};

// --- BRAND ASSETS ---
const GreenleafLogo = () => (
  <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000 p-4">
    <svg width="280" height="160" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M150 130L50 200H350L250 130H150Z" fill="url(#roadGradient)" stroke="#333" strokeWidth="2"/>
      <path d="M200 135V150M200 165V185M200 195V200" stroke="white" strokeWidth="4" strokeDasharray="8 8" opacity="0.6"/>
      <path d="M200 20C200 20 130 50 130 100C130 140 200 150 200 150C200 150 270 140 270 100C270 50 200 20 200 20Z" fill="#15803d" />
      <path d="M200 25V145M200 50L160 80M200 80L150 115M200 60L240 90M200 95L250 125" stroke="#052e16" strokeWidth="3" strokeLinecap="round"/>
      <defs><linearGradient id="roadGradient" x1="200" y1="130" x2="200" y2="200" gradientUnits="userSpaceOnUse"><stop stopColor="#444444"/><stop offset="1" stopColor="#111111"/></linearGradient></defs>
    </svg>
    <div className="text-center -mt-6">
      <h2 className="text-4xl font-black text-white tracking-tight leading-none uppercase italic">Greenleaf Xpress</h2>
    </div>
  </div>
);

const BSTLogo = () => (
  <div className="flex flex-col items-center justify-center p-6 animate-in zoom-in duration-1000">
    <svg width="280" height="100" viewBox="0 0 400 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bst-chrome" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#ffffff" /><stop offset="50%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1e3a8a" /></linearGradient>
        <filter id="bst-neon"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <text x="50%" y="85" textAnchor="middle" style={{ fontFamily: 'Arial Black, sans-serif', fontSize: '110px', fontWeight: '900', fill: 'url(#bst-chrome)', filter: 'url(#bst-neon)', fontStyle: 'italic', letterSpacing: '-5px' }}>BST</text>
    </svg>
  </div>
);

const App: React.FC = () => {
  // --- STATES ---
  const [isLocked, setIsLocked] = useState(true);
  const [solarMode, setSolarMode] = useState(false);
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
  const [shake, setShake] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const freightCamRef = useRef<HTMLInputElement>(null);
  const freightFileRef = useRef<HTMLInputElement>(null);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  const themeHex = company === 'GLX' ? '#22c55e' : company === 'BST' ? '#3b82f6' : '#6366f1';
  const themeColor = company === 'GLX' ? 'text-green-500' : company === 'BST' ? 'text-blue-500' : 'text-zinc-600';

  const s1Ready = !!(company && driverName);
  const s2Ready = !!(loadNum || bolNum);
  const s3Ready = !!(puCity && puState && delCity && delState);
  const s4Ready = !!(bolProtocol && uploadedFiles.some(f => f.category === 'bol'));
  const isReady = s1Ready && s2Ready && s3Ready && s4Ready;

  // --- REQUISITE: MEMORY CLEANUP ---
  useEffect(() => {
    return () => uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
  }, [uploadedFiles]);

  const startSecureHandshake = () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    triggerHaptic(50);
    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      setAuthStage(stage);
      playSound(200 + (stage * 100), 'sine', 0.1);
      if (stage >= 4) {
        clearInterval(interval);
        playSound(800, 'square', 0.2, 0.05);
        setTimeout(() => setIsLocked(false), 800);
      }
    }, 600);
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
    setter(val.toUpperCase());
    playSound(150, 'sine', 0.04, 0.03); // MECHANICAL THUD
  };

  const swapLocations = () => {
    triggerHaptic(20);
    const tempCity = puCity; const tempState = puState;
    setPuCity(delCity); setPuState(delState);
    setDelCity(tempCity); setDelState(tempState);
    playSound(400, 'triangle', 0.1);
  };

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, category: 'bol' | 'freight') => {
    if (e.target.files) {
      playSound(600, 'triangle', 0.1);
      triggerHaptic(30);
      const newFiles: FileWithPreview[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const compressed = await compressImage(e.target.files[i]);
        newFiles.push({
          file: new File([compressed], e.target.files[i].name),
          preview: URL.createObjectURL(compressed),
          id: Math.random().toString(36).substr(2, 9),
          category
        });
      }
      setUploadedFiles(prev => [...prev, ...newFiles]);
      if (category === 'bol' && bolProtocol === 'PICKUP') setTimeout(() => setShowFreightPrompt(true), 600);
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]" />
        <div className="w-full max-w-md bg-zinc-950 p-10 border border-zinc-900 rounded-[3rem] shadow-2xl flex flex-col items-center gap-10 z-10">
          <button onClick={startSecureHandshake} className={`relative w-40 h-40 border-2 rounded-full flex items-center justify-center transition-all duration-1000 ${isAuthenticating ? 'border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)]' : 'border-zinc-800'}`}>
            <span className={`text-6xl ${isAuthenticating ? 'animate-pulse' : ''}`}>{isAuthenticating ? '🔐' : '🛡️'}</span>
          </button>
          <div className="w-full space-y-4 font-mono">
            {['LINKING...', 'ENCRYPTING...', 'UPLINKING...', 'SECURE'].map((label, i) => (
              <div key={i} className={`text-[10px] flex justify-between tracking-widest ${authStage > i ? 'text-blue-400' : 'text-zinc-800'}`}>
                <span>{`> ${label}`}</span><span>{authStage > i ? '[OK]' : '[--]'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${solarMode ? 'bg-white text-black' : 'bg-[#020202] text-zinc-100'} pb-24 font-sans ${shake ? 'animate-shake' : ''}`}>
      {/* SCANLINE HUD EFFECT */}
      {!solarMode && <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-[100] bg-[length:100%_4px,3px_100%]" />}
      
      {/* ACTIVE EDGE RADIATION */}
      <div className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000" style={{ boxShadow: `inset 0 0 100px ${themeHex}${solarMode ? '20' : '40'}` }} />

      <header className="max-w-4xl mx-auto pt-10 px-4 mb-12 relative z-10">
        <div className="flex justify-end mb-4">
          <button onClick={() => {setSolarMode(!solarMode); triggerHaptic(15); playSound(solarMode ? 300 : 900, 'sine', 0.2);}} className={`p-3 rounded-full border-2 ${solarMode ? 'border-black bg-zinc-100' : 'border-zinc-800 bg-black'}`}>
            {solarMode ? '🌙 Midnight' : '☀️ Solar'}
          </button>
        </div>
        <div className={`w-full min-h-[200px] rounded-[3.5rem] border-2 transition-all duration-1000 flex items-center justify-center ${company ? 'shadow-2xl' : 'bg-zinc-900/20 border-zinc-800'}`} style={{ borderColor: company ? themeHex : '', backgroundColor: solarMode && company ? '#f4f4f5' : (company ? 'black' : '') }}>
          {!company && <h1 className={`text-4xl font-black italic tracking-tighter uppercase ${solarMode ? 'text-black' : 'text-zinc-700'}`}>Terminal v2.0</h1>}
          {company === 'GLX' && <GreenleafLogo />}
          {company === 'BST' && <BSTLogo />}
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-8 px-4 relative z-10">
        {/* 01 ID */}
        <section className={`transition-all border-2 rounded-[2.5rem] p-8 ${solarMode ? 'bg-zinc-50' : 'bg-zinc-900/40'} ${s1Ready ? '' : 'opacity-60'}`} style={{ borderColor: s1Ready ? themeHex : (solarMode ? '#e4e4e7' : '#27272a') }}>
          <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${s1Ready ? themeColor : 'text-zinc-500'}`}>[ 01 ] Identification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <select 
              className={`w-full p-5 rounded-2xl font-mono text-sm border-2 outline-none transition-all ${solarMode ? 'bg-white text-black' : 'bg-black text-white'}`}
              style={{ borderColor: company ? themeHex : '#3f3f46' }}
              value={company} onChange={(e) => { setCompany(e.target.value as any); triggerHaptic(10); }}
            >
              <option value="">SELECT CARRIER</option><option value="GLX">GREENLEAF XPRESS</option><option value="BST">BST EXPEDITE INC</option>
            </select>
            <input 
              type="text" placeholder="DRIVER NAME" 
              className={`w-full p-5 rounded-2xl font-mono text-sm border-2 outline-none ${solarMode ? 'bg-white text-black' : 'bg-black text-white'}`}
              style={{ borderColor: driverName ? themeHex : '#3f3f46' }}
              value={driverName} onChange={(e) => handleInputChange(setDriverName, e.target.value)} 
            />
          </div>
        </section>

        {/* 02 REFS */}
        <section className={`transition-all border-2 rounded-[2.5rem] p-8 ${solarMode ? 'bg-zinc-50' : 'bg-zinc-900/40'} ${s2Ready ? '' : 'opacity-60'}`} style={{ borderColor: s2Ready ? themeHex : (solarMode ? '#e4e4e7' : '#27272a') }}>
          <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${s2Ready ? themeColor : 'text-zinc-500'}`}>[ 02 ] References</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input type="text" placeholder="LOAD #" className={`w-full p-5 rounded-2xl font-mono text-sm border-2 outline-none ${solarMode ? 'bg-white text-black' : 'bg-black text-white'}`} style={{ borderColor: loadNum ? themeHex : '#3f3f46' }} value={loadNum} onChange={(e) => handleInputChange(setLoadNum, e.target.value)} />
            <input type="text" placeholder="BOL #" className={`w-full p-5 rounded-2xl font-mono text-sm border-2 outline-none ${solarMode ? 'bg-white text-black' : 'bg-black text-white'}`} style={{ borderColor: bolNum ? themeHex : '#3f3f46' }} value={bolNum} onChange={(e) => handleInputChange(setBolNum, e.target.value)} />
          </div>
        </section>

        {/* 03 LOCATIONS */}
        <section className={`transition-all border-2 rounded-[2.5rem] p-8 ${solarMode ? 'bg-zinc-50' : 'bg-zinc-900/40'} ${s3Ready ? '' : 'opacity-60'}`} style={{ borderColor: s3Ready ? themeHex : (solarMode ? '#e4e4e7' : '#27272a') }}>
          <div className="flex justify-between items-center mb-8">
             <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] ${s3Ready ? themeColor : 'text-zinc-500'}`}>[ 03 ] Route</h3>
             <button onClick={swapLocations} className="text-[10px] font-black border px-4 py-1 rounded-full hover:bg-white hover:text-black transition-colors uppercase">⇅ Swap</button>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <input type="text" placeholder="PICKUP CITY" className="col-span-2 w-full p-5 rounded-2xl font-mono text-sm border-2 bg-transparent outline-none" style={{ borderColor: puCity ? themeHex : '#3f3f46' }} value={puCity} onChange={(e) => handleInputChange(setPuCity, e.target.value)} />
              <select className="w-full p-5 rounded-2xl font-mono text-sm border-2 bg-transparent outline-none" style={{ borderColor: puState ? themeHex : '#3f3f46' }} value={puState} onChange={(e) => setPuState(e.target.value)}><option value="">ST</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <input type="text" placeholder="DELIVERY CITY" className="col-span-2 w-full p-5 rounded-2xl font-mono text-sm border-2 bg-transparent outline-none" style={{ borderColor: delCity ? themeHex : '#3f3f46' }} value={delCity} onChange={(e) => handleInputChange(setDelCity, e.target.value)} />
              <select className="w-full p-5 rounded-2xl font-mono text-sm border-2 bg-transparent outline-none" style={{ borderColor: delState ? themeHex : '#3f3f46' }} value={delState} onChange={(e) => setDelState(e.target.value)}><option value="">ST</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select>
            </div>
          </div>
        </section>

        {/* 04 UPLINK */}
        <section className={`rounded-[2.5rem] p-8 border-2 transition-all ${s4Ready ? (solarMode ? 'bg-zinc-100' : 'bg-black') : 'opacity-40 border-dashed'}`} style={{ borderColor: s4Ready ? themeHex : '#3f3f46' }}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10">
            <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] ${s4Ready ? themeColor : 'text-zinc-500'}`}>[ 04 ] Documents</h3>
            <div className="flex gap-4">
              <button onClick={() => {setBolProtocol('PICKUP'); triggerHaptic(10);}} className={`px-8 py-3 text-[10px] font-black rounded-xl border-2 transition-all ${bolProtocol === 'PICKUP' ? 'bg-white text-black' : 'text-zinc-500 border-zinc-800'}`}>PICKUP</button>
              <button onClick={() => {setBolProtocol('DELIVERY'); triggerHaptic(10);}} className={`px-8 py-3 text-[10px] font-black rounded-xl border-2 transition-all ${bolProtocol === 'DELIVERY' ? 'bg-white text-black' : 'text-zinc-500 border-zinc-800'}`}>DELIVERY</button>
            </div>
          </div>
          <div className="flex justify-center gap-16 py-6">
            <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center gap-4 group"><div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border transition-all ${solarMode ? 'bg-white border-zinc-300' : 'bg-zinc-800 border-zinc-700'} group-active:scale-95`}>📸</div><span className="text-[10px] font-black uppercase text-zinc-500">Camera</span></button>
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-4 group"><div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border transition-all ${solarMode ? 'bg-white border-zinc-300' : 'bg-zinc-800 border-zinc-700'} group-active:scale-95`}>📂</div><span className="text-[10px] font-black uppercase text-zinc-500">Gallery</span></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {uploadedFiles.filter(f => f.category === 'bol').map(f => (
              <div key={f.id} className="aspect-[3/4] rounded-2xl bg-zinc-900 overflow-hidden relative group border-2 border-zinc-800"><img src={f.preview} className="w-full h-full object-cover" /><button onClick={() => setUploadedFiles(p => p.filter(i => i.id !== f.id))} className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow-xl">✕</button></div>
            ))}
          </div>
        </section>

        {/* 05 FREIGHT */}
        {bolProtocol === 'PICKUP' && (
          <section className={`border-2 transition-all rounded-[2.5rem] p-8 ${uploadedFiles.some(f => f.category === 'freight') ? (solarMode ? 'bg-zinc-100' : 'bg-black') : 'opacity-40 border-dashed'}`} style={{ borderColor: uploadedFiles.some(f => f.category === 'freight') ? themeHex : '#3f3f46' }}>
            <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${uploadedFiles.some(f => f.category === 'freight') ? themeColor : 'text-zinc-500'}`}>[ 05 ] Freight Photos</h3>
            <div className="flex justify-center gap-12 py-6">
              <button onClick={() => freightCamRef.current?.click()} className="flex flex-col items-center gap-4 group"><div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border transition-all ${solarMode ? 'bg-white border-zinc-300' : 'bg-zinc-800 border-zinc-700'}`}>📸</div><span className="text-[10px] font-black text-zinc-500 uppercase">Camera</span></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {uploadedFiles.filter(f => f.category === 'freight').map(f => (
                <div key={f.id} className="aspect-square rounded-2xl bg-zinc-900 overflow-hidden relative group border-2 border-zinc-800"><img src={f.preview} className="w-full h-full object-cover" /><button onClick={() => setUploadedFiles(p => p.filter(i => i.id !== f.id))} className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-xs">✕</button></div>
              ))}
            </div>
          </section>
        )}

        {/* SUBMIT */}
        <button 
          onClick={() => { 
            if(!isReady) { playSound(100, 'square', 0.3); triggerHaptic(100); setShake(true); setTimeout(() => setShake(false), 500); } 
            else { playSound(800, 'sine', 0.5); triggerHaptic(200); setIsSubmitting(true); setTimeout(() => setShowSuccess(true), 2500); } 
          }}
          className={`w-full py-10 rounded-[2.5rem] font-black uppercase tracking-[1.5em] transition-all duration-1000 relative overflow-hidden group
            ${isReady ? `bg-gradient-to-r ${company === 'GLX' ? 'from-green-600 via-green-400 to-green-600' : 'from-blue-600 via-blue-400 to-blue-600'} text-black shadow-2xl scale-[1.02]` : 'bg-zinc-900 text-zinc-700 opacity-50 cursor-not-allowed'}`}
          style={{ border: isReady ? `3px solid white` : '3px solid transparent' }}>
          {isReady && <div className="absolute inset-0 bg-white/30 animate-pulse mix-blend-overlay" />}
          <span className="relative z-10">{isSubmitting ? 'TRANSMITTING...' : isReady ? 'EXECUTE UPLOAD' : 'FIELDS INCOMPLETE'}</span>
        </button>
      </div>

      {/* POPUPS */}
      {showFreightPrompt && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-zinc-900 border-2 rounded-[2.5rem] p-10 max-w-sm text-center shadow-2xl" style={{ borderColor: themeHex }}>
            <div className="text-5xl mb-6">📦</div>
            <h2 className={`text-xl font-black uppercase mb-4 ${themeColor}`}>Pickup Detected</h2>
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest italic mb-8">Take photos of the freight on trailer?</p>
            <div className="flex flex-col gap-4">
              <button onClick={() => { setShowFreightPrompt(false); freightCamRef.current?.click(); }} className={`${company === 'GLX' ? 'bg-green-500' : 'bg-blue-600'} text-black py-4 rounded-xl font-black uppercase shadow-xl`}>Take Photos</button>
              <button onClick={() => setShowFreightPrompt(false)} className="text-zinc-500 py-2 font-black uppercase text-[10px]">Skip</button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center animate-in fade-in">
           <div className="w-32 h-32 rounded-full border-4 flex items-center justify-center text-5xl mb-12 animate-bounce" style={{ borderColor: themeHex }}>✓</div>
           <h2 className="text-4xl font-black italic uppercase text-white tracking-widest">Verified</h2>
           <button onClick={() => window.location.reload()} className="mt-16 text-zinc-600 uppercase text-xs font-black tracking-widest hover:text-white">Terminate Session</button>
        </div>
      )}

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        .animate-shake { animation: shake 0.1s linear infinite; }
      `}</style>

      {/* REQUISITE: HIDDEN INPUTS */}
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" multiple onChange={(e) => onFileSelect(e, 'bol')} />
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => onFileSelect(e, 'bol')} />
      <input type="file" ref={freightCamRef} className="hidden" capture="environment" accept="image/*" multiple onChange={(e) => onFileSelect(e, 'freight')} />
      <input type="file" ref={freightFileRef} className="hidden" multiple accept="image/*" onChange={(e) => onFileSelect(e, 'freight')} />
    </div>
  );
};

export default App;