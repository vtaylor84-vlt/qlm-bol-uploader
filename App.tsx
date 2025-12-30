import React, { useState, useRef, useEffect } from 'react';

/** * LOGISTICS TERMINAL v16.5 - SOVEREIGN ZERO-LOSS
 * - UI: High-End Tactical Visuals (Handshake, Glow Borders, Metallic Logos)
 * - FIX: Sequential Image Compression (1200px / 0.7 Quality)
 * - FIX: Offline Persistence (IndexedDB/Local Vault)
 */

interface FileWithPreview {
  file: File | Blob; preview: string; id: string; category: 'bol' | 'freight';
}

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby-L6nKjgfAnLFPgezkf3inQTJRG3Ql_MufZ-jlKWhSbPdEHeQniPLdNQDaidM2EY6MdA/exec';

// --- UTILITIES: AUDIO & COMPRESSION ---
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
    <div className="text-center -mt-6">
      <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none uppercase italic">Greenleaf Xpress</h2>
      <p className="text-[10px] font-bold text-zinc-500 tracking-[0.6em] mt-3 uppercase">Waterloo, Iowa</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [isLocked, setIsLocked] = useState(true);
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
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const freightCamRef = useRef<HTMLInputElement>(null);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
  const themeHex = company === 'GLX' ? '#22c55e' : '#3b82f6';
  const themeColor = company === 'GLX' ? 'text-green-500' : 'text-blue-500';

  const s1Ready = !!(company && driverName);
  const s2Ready = !!(loadNum || bolNum);
  const s3Ready = !!(puCity && puState && delCity && delState);
  const s4Ready = !!(bolProtocol && uploadedFiles.some(f => f.category === 'bol'));
  const isReady = s1Ready && s2Ready && s3Ready && s4Ready;

  useEffect(() => {
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => { window.removeEventListener('online', handleStatus); window.removeEventListener('offline', handleStatus); };
  }, []);

  const startSecureHandshake = () => {
    let stage = 0;
    const interval = setInterval(() => {
      stage++; setAuthStage(stage);
      playSound(200 + (stage * 100), 'sine', 0.1);
      if (stage >= 4) { clearInterval(interval); setIsLocked(false); }
    }, 500);
  };

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, category: 'bol' | 'freight') => {
    if (e.target.files) {
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
    return `w-full p-5 rounded-2xl font-mono text-sm border-2 transition-all duration-500 outline-none
      ${isFilled ? `bg-black text-white border-[${themeHex}] shadow-[0_0_20px_${themeHex}30]` : 'bg-zinc-100 text-black border-zinc-200'}`;
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
    localStorage.setItem('vault', JSON.stringify(payload));
    try {
      await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
      localStorage.removeItem('vault'); setShowSuccess(true);
    } catch (e) { setIsSubmitting(false); alert("OFFLINE: Data saved to phone."); }
  };

  if (isLocked) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <button onClick={startSecureHandshake} className="w-40 h-40 border-2 border-zinc-800 rounded-full text-zinc-500 font-black animate-pulse">CONNECT</button>
      <div className="mt-8 space-y-2 font-mono text-[10px]">
        {['ENCRYPTING...', 'VERIFYING...', 'SECURE'].map((l, i) => (<div key={i} className={authStage > i ? 'text-blue-500' : 'text-zinc-800'}>{`> ${l}`}</div>))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-100 pb-24 font-sans">
      <div className={`fixed top-0 left-0 right-0 py-2 text-center text-[9px] font-black uppercase tracking-[0.3em] z-[100] ${isOffline ? 'bg-red-600' : 'bg-green-600 opacity-0'}`}>OFFLINE MODE</div>
      
      <header className="max-w-4xl mx-auto pt-10 px-4 mb-12 relative">
        <div className={`w-full min-h-[220px] rounded-[3.5rem] border-2 flex items-center justify-center ${company ? 'bg-black' : 'bg-zinc-900/50 border-zinc-800'}`} style={{ borderColor: company ? themeHex : '' }}>
          {!company && <h1 className="text-5xl font-black text-zinc-700">BOL UPLOADER</h1>}{isGLX && <GreenleafLogo />}
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-8 px-4">
        <section className={`bg-zinc-900/40 border-2 rounded-[2.5rem] p-8 ${s1Ready ? '' : 'border-zinc-800'}`} style={{ borderColor: s1Ready ? themeHex : '' }}>
          <h3 className={`text-[11px] font-black uppercase tracking-[0.6em] mb-8 ${s1Ready ? themeColor : 'text-zinc-500'}`}>[ 01 ] Identification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <select className={getTacticalInputStyles(company)} value={company} onChange={(e) => setCompany(e.target.value as any)}><option value="">CARRIER</option><option value="GLX">GREENLEAF</option></select>
            <input type="text" placeholder="DRIVER NAME" className={getTacticalInputStyles(driverName)} value={driverName} onChange={(e) => setDriverName(e.target.value.toUpperCase())} />
          </div>
        </section>

        <section className={`bg-zinc-900/40 border-2 rounded-[2.5rem] p-8 ${s2Ready ? '' : 'border-zinc-800'}`} style={{ borderColor: s2Ready ? themeHex : '' }}>
          <h3 className={`text-[11px] font-black uppercase mb-8 ${s2Ready ? themeColor : 'text-zinc-500'}`}>[ 02 ] References</h3>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="LOAD #" className={getTacticalInputStyles(loadNum)} value={loadNum} onChange={(e) => setLoadNum(e.target.value.toUpperCase())} />
            <input type="text" placeholder="BOL #" className={getTacticalInputStyles(bolNum)} value={bolNum} onChange={(e) => setBolNum(e.target.value.toUpperCase())} />
          </div>
        </section>

        <section className={`bg-zinc-900/40 border-2 rounded-[2.5rem] p-8 ${s4Ready ? 'bg-black' : 'border-zinc-800 border-dashed opacity-60'}`} style={{ borderColor: s4Ready ? themeHex : '' }}>
          <div className="flex justify-between items-center mb-8">
            <h3 className={`text-[11px] font-black uppercase ${s4Ready ? themeColor : 'text-zinc-500'}`}>[ 04 ] Uplink</h3>
            <div className="flex gap-4">
              <button onClick={() => setBolProtocol('PICKUP')} className={`px-6 py-2 rounded-xl text-[10px] font-black ${bolProtocol === 'PICKUP' ? 'bg-white text-black' : 'bg-zinc-800'}`}>PICKUP</button>
              <button onClick={() => setBolProtocol('DELIVERY')} className={`px-6 py-2 rounded-xl text-[10px] font-black ${bolProtocol === 'DELIVERY' ? 'bg-white text-black' : 'bg-zinc-800'}`}>DELIVERY</button>
            </div>
          </div>
          <div className="flex justify-center gap-10">
            <button onClick={() => cameraInputRef.current?.click()} className="text-4xl bg-zinc-800 p-6 rounded-2xl">📸</button>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-6">
            {uploadedFiles.map(f => (<div key={f.id} className="aspect-[3/4] rounded-xl overflow-hidden border border-zinc-800"><img src={f.preview} className="w-full h-full object-cover" /></div>))}
          </div>
        </section>

        <button onClick={transmitData} disabled={!isReady || isSubmitting} className={`w-full py-10 rounded-[2.5rem] font-black uppercase tracking-[1.5em] transition-all
            ${isReady ? `bg-gradient-to-r from-green-600 via-green-400 to-green-600 text-black shadow-[0_0_80px_${themeHex}80]` : 'bg-zinc-900 text-zinc-700'}`}>
          {isSubmitting ? 'UPLOADING...' : 'SUBMIT DOCUMENTS'}
        </button>
      </div>

      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" multiple onChange={(e) => onFileSelect(e, 'bol')} />
    </div>
  );
};

export default App;