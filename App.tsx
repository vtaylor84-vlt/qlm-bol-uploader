import React, { useState, useRef, useEffect } from 'react';

/**
 * QLMCONNECT TERMINAL v3.5 - STABLE PRODUCTION
 * VISUAL UPGRADE ONLY: Pulsing Handshake | Green Verifiers | Original Data Payload
 */

interface FileWithPreview {
  file: File; preview: string; id: string; category: 'bol' | 'freight';
}

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby-L6nKjgfAnLFPgezkf3inQTJRG3Ql_MufZ-jlKWhSbPdEHeQniPLdNQDaidM2EY6MdA/exec';

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
  } catch (e) { }
};

const triggerHaptic = (ms: number | number[] = 10) => {
  if ('vibrate' in navigator) navigator.vibrate(ms);
};

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
        let width = img.width; let height = img.height;
        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.8);
      };
    };
  });
};

const GreenleafLogo = () => (
  <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000 p-4">
    <svg width="320" height="180" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M150 130L50 200H350L250 130H150Z" fill="url(#roadGradient)" stroke="#333" strokeWidth="2"/><path d="M200 135V150M200 165V185M200 195V200" stroke="white" strokeWidth="4" strokeDasharray="8 8" opacity="0.6"/><path d="M200 20C200 20 130 50 130 100C130 140 200 150 200 150C200 150 270 140 270 100C270 50 200 20 200 20Z" fill="#15803d" /><path d="M200 25V145M200 50L160 80M200 80L150 115M200 60L240 90M200 95L250 125" stroke="#052e16" strokeWidth="3" strokeLinecap="round"/><defs><linearGradient id="roadGradient" x1="200" y1="130" x2="200" y2="200" gradientUnits="userSpaceOnUse"><stop stopColor="#444444"/><stop offset="1" stopColor="#111111"/></linearGradient></defs>
    </svg>
    <div className="text-center -mt-6"><h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none uppercase italic">Greenleaf Xpress</h2><p className="text-[10px] font-bold text-zinc-500 tracking-[0.6em] mt-3 uppercase">Waterloo, Iowa</p></div>
  </div>
);

const BSTLogo = () => (
  <div className="flex flex-col items-center justify-center p-6 animate-in zoom-in duration-1000">
    <svg width="320" height="120" viewBox="0 0 400 140" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="bst-chrome" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#ffffff" /><stop offset="50%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1e3a8a" /></linearGradient><filter id="bst-neon"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      <text x="50%" y="85" textAnchor="middle" style={{ fontFamily: 'Arial Black, sans-serif', fontSize: '110px', fontWeight: '900', fill: 'url(#bst-chrome)', filter: 'url(#bst-neon)', fontStyle: 'italic', letterSpacing: '-5px' }}>BST</text><text x="50%" y="125" textAnchor="middle" style={{ fontFamily: 'monospace', fontSize: '16px', fill: '#60a5fa', fontWeight: 'bold', letterSpacing: '8px', textTransform: 'uppercase' }}>EXPEDITE INC</text>
    </svg>
  </div>
);

const App: React.FC = () => {
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
  const [showVerification, setShowVerification] = useState(false);
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

  const isReady = !!(company && driverName && (loadNum || bolNum) && puCity && puState && delCity && delState && bolProtocol && uploadedFiles.some(f => f.category === 'bol'));

  useEffect(() => {
    return () => uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
  }, [uploadedFiles]);

  const startSecureHandshake = () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    triggerHaptic(50);
    let stage = 0;
    const interval = setInterval(() => {
      stage++; setAuthStage(stage);
      playSound(200 + (stage * 100), 'sine', 0.1);
      if (stage >= 4) { clearInterval(interval); playSound(800, 'square', 0.2, 0.05); setTimeout(() => setIsLocked(false), 800); }
    }, 700);
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
    setter(val.toUpperCase()); playSound(150, 'sine', 0.04, 0.03);
  };

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, category: 'bol' | 'freight') => {
    if (e.target.files) {
      playSound(600, 'triangle', 0.1); triggerHaptic(30);
      const newFiles: FileWithPreview[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const compressed = await compressImage(e.target.files[i]);
        newFiles.push({ file: new File([compressed], e.target.files[i].name), preview: URL.createObjectURL(compressed), id: Math.random().toString(36).substr(2, 9), category });
      }
      setUploadedFiles(prev => [...prev, ...newFiles]);
      if (category === 'bol' && bolProtocol === 'PICKUP') setTimeout(() => setShowFreightPrompt(true), 600);
    }
  };

  const transmitData = async () => {
    setIsSubmitting(true);
    try {
      const filePromises = uploadedFiles.map(async (f) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ category: f.category, base64: reader.result });
          reader.readAsDataURL(f.file);
        });
      });
      const base64Files = await Promise.all(filePromises);
      const payload = { company, driverName, loadNum, bolNum, puCity, puState, delCity, delState, files: base64Files };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });

      playSound(800, 'sine', 0.5); triggerHaptic(200); setShowVerification(false); setShowSuccess(true);
    } catch (error) {
      setShake(true); alert("CONNECTION ERROR: Please try again."); setIsSubmitting(false);
    }
  };

  const getInputStyle = (hasValue: boolean) => {
    if (solarMode) return hasValue ? `bg-white text-black border-[${themeHex}] shadow-[0_0_15px_${themeHex}40]` : 'bg-white text-black border-zinc-200';
    return hasValue ? `bg-black text-white border-[${themeHex}] shadow-[0_0_20px_${themeHex}40]` : 'bg-zinc-100 text-black border-zinc-200';
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]" />
        <div className="w-full max-w-md bg-zinc-950/50 p-10 border border-zinc-900 rounded-[3rem] shadow-2xl flex flex-col items-center gap-10">
          <button onClick={startSecureHandshake} className={`relative group w-40 h-40 border-2 rounded-full flex items-center justify-center transition-all duration-1000 ${isAuthenticating ? 'border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)]' : 'border-zinc-800 hover:border-zinc-400'}`}>
            <span className={`text-6xl ${isAuthenticating ? 'animate-pulse' : ''}`}>{isAuthenticating ? '🔐' : '🛡️'}</span>
            {!isAuthenticating && (
               <div className="absolute -bottom-14 w-full text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 animate-pulse">Click to Connect</p>
               </div>
            )}
          </button>
          <div className="w-full space-y-4 font-mono">
            {['ENCRYPTING...', 'VERIFYING...', 'UPLINKING...', 'SECURE'].map((label, i) => (
              <div key={i} className={`text-[10px] flex justify-between tracking-widest ${authStage > i ? (i === 3 ? 'text-green-500' : 'text-blue-400') : 'text-zinc-800'}`}>
                <span>{`> ${label}`}</span>
                <span>{authStage > i ? '[OK]' : '[--]'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${solarMode ? 'bg-white text-black' : 'bg-[#020202] text-zinc-100'} pb-24 font-sans ${shake ? 'animate-shake' : ''}`}>
      {!solarMode && <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-[100] bg-[length:100%_4px,3px_100%]" />}
      <div className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000" style={{ boxShadow: `inset 0 0 100px ${themeHex}${solarMode ? '15' : '30'}` }} />
      <header className="max-w-4xl mx-auto pt-10 px-4 mb-12 relative z-10">
        <div className="flex justify-end mb-4"><button onClick={() => {setSolarMode(!solarMode); triggerHaptic(15); playSound(solarMode ? 300 : 900, 'sine', 0.2);}} className={`p-3 rounded-full border-2 font-black uppercase text-[9px] tracking-widest ${solarMode ? 'border-black bg-zinc-100' : 'border-zinc-800 bg-black'}`}>{solarMode ? '🌙 Midnight' : '☀️ Solar'}</button></div>
        <div className={`w-full min-h-[220px] rounded-[3.5rem] border-2 transition-all duration-1000 flex items-center justify-center ${company ? 'bg-black shadow-2xl' : 'bg-zinc-900/50 border-zinc-800'}`} style={{ borderColor: company ? themeHex : '' }}>{!company && <h1 className="text-4xl font-black italic tracking-tighter uppercase text-zinc-700">QLM<span className="text-zinc-500">CONNECT</span></h1>}{company === 'GLX' && <GreenleafLogo />}{company === 'BST' && <BSTLogo />}</div>
      </header>
      <div className="max-w-4xl mx-auto space-y-8 px-4 relative z-10">
        <section className={`bg-zinc-900/40 border-2 rounded-[2.5rem] p-8 shadow-2xl ${solarMode ? 'bg-zinc-50 border-zinc-200' : ''}`} style={{ borderColor: company ? themeHex : '#27272a' }}>
          <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${company ? themeColor : 'text-zinc-500'}`}>[ 01 ] Identification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <select className={`w-full p-5 rounded-2xl font-mono text-sm border-2 outline-none ${getInputStyle(!!company)}`} value={company} onChange={(e) => { setCompany(e.target.value as any); triggerHaptic(10); }}><option value="">SELECT CARRIER</option><option value="GLX">GREENLEAF XPRESS</option><option value="BST">BST EXPEDITE INC</option></select>
            <input type="text" placeholder="DRIVER NAME" className={`w-full p-5 rounded-2xl font-mono text-sm border-2 outline-none ${getInputStyle(!!driverName)}`} value={driverName} onChange={(e) => handleInputChange(setDriverName, e.target.value)} />
          </div>
        </section>
        <section className={`bg-zinc-900/40 border-2 rounded-[2.5rem] p-8 shadow-2xl ${solarMode ? 'bg-zinc-50 border-zinc-200' : ''}`} style={{ borderColor: (loadNum || bolNum) ? themeHex : '#27272a' }}>
          <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${(loadNum || bolNum) ? themeColor : 'text-zinc-500'}`}>[ 02 ] References</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input type="text" placeholder="LOAD #" className={`w-full p-5 rounded-2xl font-mono text-sm border-2 outline-none ${getInputStyle(!!loadNum)}`} value={loadNum} onChange={(e) => handleInputChange(setLoadNum, e.target.value)} />
            <input type="text" placeholder="BOL #" className={`w-full p-5 rounded-2xl font-mono text-sm border-2 outline-none ${getInputStyle(!!bolNum)}`} value={bolNum} onChange={(e) => handleInputChange(setBolNum, e.target.value)} />
          </div>
        </section>
        <section className={`bg-zinc-900/40 border-2 rounded-[2.5rem] p-8 shadow-2xl ${solarMode ? 'bg-zinc-50 border-zinc-200' : ''}`} style={{ borderColor: (puCity && delCity) ? themeHex : '#27272a' }}>
          <div className="flex justify-between items-center mb-8"><h3 className={`text-[11px] font-black uppercase tracking-[0.6em] ${(puCity && delCity) ? themeColor : 'text-zinc-500'}`}>[ 03 ] Route</h3><button onClick={() => { const tc=puCity; const ts=puState; setPuCity(delCity); setPuState(delState); setDelCity(tc); setDelState(ts); triggerHaptic(20); }} className="text-[10px] font-black border px-4 py-1 rounded-full uppercase transition-all hover:bg-white hover:text-black">⇅ Swap</button></div>
          <div className="grid grid-cols-3 gap-6 mb-6"><input type="text" placeholder="PICKUP CITY" className={`col-span-2 p-5 rounded-2xl border-2 outline-none ${getInputStyle(!!puCity)}`} value={puCity} onChange={(e) => handleInputChange(setPuCity, e.target.value)} /><select className={`p-5 rounded-2xl border-2 outline-none ${getInputStyle(!!puState)}`} value={puState} onChange={(e) => setPuState(e.target.value)}><option value="">STATE</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div className="grid grid-cols-3 gap-6"><input type="text" placeholder="DELIVERY CITY" className={`col-span-2 p-5 rounded-2xl border-2 outline-none ${getInputStyle(!!delCity)}`} value={delCity} onChange={(e) => handleInputChange(setDelCity, e.target.value)} /><select className={`p-5 rounded-2xl border-2 outline-none ${getInputStyle(!!delState)}`} value={delState} onChange={(e) => setDelState(e.target.value)}><option value="">STATE</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        </section>
        <section className={`rounded-[2.5rem] p-8 border-2 transition-all ${bolProtocol ? (solarMode ? 'bg-zinc-100' : 'bg-black') : 'opacity-40 border-dashed'}`} style={{ borderColor: bolProtocol ? themeHex : '#27272a', backgroundColor: bolProtocol ? `${themeHex}${solarMode ? '10' : '20'}` : '' }}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10"><h3 className={`text-[11px] font-black uppercase tracking-[0.6em] ${bolProtocol ? themeColor : 'text-zinc-500'}`}>[ 04 ] Uplink</h3><div className="flex gap-4"><button onClick={() => {setBolProtocol('PICKUP'); triggerHaptic(10);}} className={`px-8 py-3 text-[10px] font-black rounded-xl border-2 transition-all ${bolProtocol === 'PICKUP' ? `bg-black text-white border-[${themeHex}] shadow-lg` : 'bg-white text-zinc-500 border-zinc-200'}`}>PICKUP BOL</button><button onClick={() => {setBolProtocol('DELIVERY'); triggerHaptic(10);}} className={`px-8 py-3 text-[10px] font-black rounded-xl border-2 transition-all ${bolProtocol === 'DELIVERY' ? `bg-black text-white border-[${themeHex}] shadow-lg` : 'bg-white text-zinc-500 border-zinc-200'}`}>DELIVERY BOL</button></div></div>
          <div className={`flex justify-center gap-16 py-6 transition-all ${bolProtocol ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}><button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center gap-4 group"><div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border ${solarMode ? 'bg-white border-zinc-300' : 'bg-zinc-800 border-zinc-700'} group-active:scale-95`}>📸</div><span className="text-[10px] font-black uppercase text-zinc-500">Camera</span></button><button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-4 group"><div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border ${solarMode ? 'bg-white border-zinc-300' : 'bg-zinc-800 border-zinc-700'} group-active:scale-95`}>📂</div><span className="text-[10px] font-black uppercase text-zinc-500">Gallery</span></button></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">{uploadedFiles.filter(f => f.category === 'bol').map(f => (<div key={f.id} className="aspect-[3/4] rounded-2xl bg-zinc-900 overflow-hidden relative border border-zinc-800 animate-in zoom-in"><img src={f.preview} className="w-full h-full object-cover" /><button onClick={() => setUploadedFiles(p => p.filter(i => i.id !== f.id))} className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow-xl transition-all active:scale-90">✕</button></div>))}</div>
        </section>
        {bolProtocol === 'PICKUP' && (
          <section className={`transition-all rounded-[2.5rem] p-8 border-2 ${uploadedFiles.some(f => f.category === 'freight') ? (solarMode ? 'bg-zinc-100' : 'bg-black') : 'opacity-40 border-dashed'}`} style={{ borderColor: uploadedFiles.some(f => f.category === 'freight') ? themeHex : '#27272a', backgroundColor: uploadedFiles.some(f => f.category === 'freight') ? `${themeHex}${solarMode ? '10' : '20'}` : '' }}>
            <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${uploadedFiles.some(f => f.category === 'freight') ? themeColor : 'text-zinc-500'}`}>[ 05 ] Freight Photos</h3>
            <div className="flex justify-center gap-16 py-6 transition-all duration-500">
              <button onClick={() => freightCamRef.current?.click()} className="flex flex-col items-center gap-4 group"><div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border transition-all ${solarMode ? 'bg-white border-zinc-300' : 'bg-zinc-800 border-zinc-700'} group-active:scale-95`}>📸</div><span className="text-[10px] font-black text-zinc-500 uppercase">Camera</span></button>
              <button onClick={() => freightFileRef.current?.click()} className="flex flex-col items-center gap-4 group"><div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border transition-all ${solarMode ? 'bg-white border-zinc-300' : 'bg-zinc-800 border-zinc-700'} group-active:scale-95`}>📂</div><span className="text-[10px] font-black text-zinc-500 uppercase">Gallery</span></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">{uploadedFiles.filter(f => f.category === 'freight').map(f => (<div key={f.id} className="aspect-square rounded-2xl bg-zinc-900 overflow-hidden relative border border-zinc-800 animate-in zoom-in"><img src={f.preview} className="w-full h-full object-cover opacity-70 group-hover:opacity-100" /><button onClick={() => setUploadedFiles(p => p.filter(i => i.id !== f.id))} className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs">✕</button></div>))}</div>
          </section>
        )}
        <button onClick={() => { if(!isReady) { playSound(100, 'square', 0.3); triggerHaptic(100); setShake(true); setTimeout(() => setShake(false), 500); } else { playSound(600, 'sine', 0.3); triggerHaptic([30, 100]); setShowVerification(true); } }} className={`w-full py-10 rounded-[2.5rem] font-black uppercase tracking-[1.5em] transition-all duration-1000 border-[3px] border-white ${isReady ? `bg-gradient-to-r ${company === 'GLX' ? 'from-green-600 via-green-400 to-green-600' : 'from-blue-600 via-blue-400 to-blue-600'} text-black shadow-2xl scale-[1.02]` : 'bg-zinc-900 text-zinc-700 opacity-50 cursor-not-allowed'}`}><span className="relative z-10">{isReady ? 'REVIEW DOCUMENTS' : 'COMPLETE FIELDS'}</span></button>
      </div>
      {showVerification && (<div className="fixed inset-0 z-[400] bg-black flex flex-col items-center justify-center p-6 animate-in slide-in-from-bottom duration-500"><div className="w-full max-w-lg bg-zinc-900 border-2 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden" style={{ borderColor: themeHex }}><h2 className={`text-2xl font-black italic uppercase tracking-widest mb-10 ${themeColor}`}>Final Review</h2><div className="space-y-6 mb-12 font-mono text-sm text-white">
        <div className="flex justify-between border-b border-zinc-800 pb-2"><span>Carrier</span><span>{company === 'GLX' ? 'GREENLEAF XPRESS' : 'BST EXPEDITE'}</span></div>
        <div className="flex justify-between border-b border-zinc-800 pb-2"><span>Load #</span><span>{loadNum || 'N/A'}</span></div>
        <div className="flex justify-between border-b border-zinc-800 pb-2"><span>BOL #</span><span>{bolNum || 'N/A'}</span></div>
        <div className="flex justify-between border-b border-zinc-800 pb-2"><span>Origin</span><span>{puCity}, {puState}</span></div>
        <div className="flex justify-between border-b border-zinc-800 pb-2"><span>Dest.</span><span>{delCity}, {delState}</span></div>
        <div className="flex justify-between border-b border-zinc-800 pb-2"><span>Photos</span><span>{uploadedFiles.length} Total</span></div>
        </div><div className="flex flex-col gap-4"><button onClick={transmitData} disabled={isSubmitting} className={`w-full py-8 rounded-[1.5rem] text-black font-black uppercase tracking-[0.4em] transition-all border-[3px] border-white shadow-2xl bg-gradient-to-r ${company === 'GLX' ? 'from-green-400 to-green-600' : 'from-blue-400 to-blue-600'}`}>{isSubmitting ? 'TRANSMITTING...' : 'Confirm & Transmit'}</button><button onClick={() => setShowVerification(false)} className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-2 hover:text-white transition-colors">Back to Edit</button></div></div></div>)}
      {showFreightPrompt && (<div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in"><div className="bg-zinc-900 border-2 rounded-[2.5rem] p-10 max-w-sm text-center shadow-2xl" style={{ borderColor: themeHex }}><div className="text-5xl mb-6">📦</div><h2 className={`text-xl font-black uppercase tracking-tighter mb-4 ${themeColor}`}>Pickup Detected</h2><p className="text-zinc-400 text-sm font-bold uppercase tracking-widest italic mb-8 italic">Take photos of the freight on trailer?</p><div className="flex flex-col gap-4"><button onClick={() => { setShowFreightPrompt(false); freightCamRef.current?.click(); }} className={`${company === 'GLX' ? 'bg-green-500' : 'bg-blue-600'} text-black py-4 rounded-xl font-black uppercase tracking-widest shadow-xl`}>Open Camera</button><button onClick={() => setShowFreightPrompt(false)} className="text-zinc-500 py-2 font-black uppercase tracking-widest text-[10px]">No, Skip</button></div></div></div>)}
      {showSuccess && (<div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center animate-in fade-in"><div className="w-32 h-32 rounded-full border-4 flex items-center justify-center text-5xl mb-12 animate-bounce" style={{ borderColor: themeHex }}>✓</div><h2 className="text-4xl font-black italic uppercase text-white tracking-widest text-center px-4">Uplink Verified</h2><button onClick={() => window.location.reload()} className="mt-16 text-zinc-600 uppercase text-xs font-black tracking-widest hover:text-white">Terminate Session</button></div>)}
      <style>{`@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }.animate-shake { animation: shake 0.1s linear infinite; }`}</style>
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" multiple onChange={(e) => onFileSelect(e, 'bol')} /><input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => onFileSelect(e, 'bol')} /><input type="file" ref={freightCamRef} className="hidden" capture="environment" accept="image/*" multiple onChange={(e) => onFileSelect(e, 'freight')} /><input type="file" ref={freightFileRef} className="hidden" multiple accept="image/*" onChange={(e) => onFileSelect(e, 'freight')} />
    </div>
  );
};

export default App;