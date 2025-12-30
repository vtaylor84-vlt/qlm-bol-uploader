import React, { useState, useRef, useEffect, useMemo } from 'react';

/**
 * QLMCONNECT TERMINAL v4.1 - EMERGENCY PERFORMANCE BUILD
 * - FIX: Optimized Image compression for high-res mobile cameras.
 * - FIX: Prevents browser memory crashes during file selection.
 */

interface FileWithPreview {
  file: File | Blob;
  preview: string;
  id: string;
  category: 'bol' | 'freight';
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

// --- STRENGTHENED COMPRESSION SCRIPT ---
const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Professional Dispatch Standard: 1200px is plenty for BOL clarity
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
        
        // Lower quality to 0.7 (70%) to ensure it's lightweight
        canvas.toBlob((blob) => {
          resolve(blob || file);
        }, 'image/jpeg', 0.7);
      };
    };
  });
};

const GreenleafLogo = () => (
  <div className="flex flex-col items-center justify-center p-4">
    <svg width="320" height="180" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M150 130L50 200H350L250 130H150Z" fill="#222" stroke="#333" strokeWidth="2"/>
      <path d="M200 20C200 20 130 50 130 100C130 140 200 150 200 150C200 150 270 140 270 100C270 50 200 20 200 20Z" fill="#15803d" />
      <path d="M200 25V145M200 50L160 80M200 80L150 115" stroke="#052e16" strokeWidth="3" />
    </svg>
    <h2 className="text-4xl font-black text-white italic -mt-6 uppercase">Greenleaf Xpress</h2>
  </div>
);

const BSTLogo = () => (
  <div className="flex flex-col items-center justify-center p-6 bg-zinc-950 rounded-[2rem] border border-blue-500/30">
    <svg width="320" height="120" viewBox="0 0 400 140" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="bst-chrome" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#ffffff" /><stop offset="50%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1e3a8a" /></linearGradient></defs>
      <text x="50%" y="85" textAnchor="middle" style={{ fontFamily: 'Arial Black, sans-serif', fontSize: '110px', fontWeight: '900', fill: 'url(#bst-chrome)', fontStyle: 'italic', letterSpacing: '-5px' }}>BST</text>
    </svg>
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const freightCamRef = useRef<HTMLInputElement>(null);
  const freightFileRef = useRef<HTMLInputElement>(null);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
  const themeHex = company === 'GLX' ? '#22c55e' : '#3b82f6';
  const isReady = !!(company && driverName && (loadNum || bolNum) && puCity && puState && delCity && delState && bolProtocol && uploadedFiles.some(f => f.category === 'bol'));

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, category: 'bol' | 'freight') => {
    if (e.target.files && e.target.files.length > 0) {
      playSound(600, 'triangle', 0.1);
      const files = Array.from(e.target.files);
      
      for (const f of files) {
        try {
          // Process one at a time to keep memory usage low
          const compressedBlob = await compressImage(f);
          const newFile: FileWithPreview = {
            file: compressedBlob,
            preview: URL.createObjectURL(compressedBlob),
            id: Math.random().toString(36).substr(2, 9),
            category
          };
          setUploadedFiles(prev => [...prev, newFile]);
        } catch (err) {
          console.error("Compression error:", err);
        }
      }
    }
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
    } catch (e) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setIsSubmitting(false);
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <button onClick={() => setIsLocked(false)} className="w-32 h-32 rounded-full border border-zinc-800 text-white animate-pulse">CONNECT</button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#020202] text-white p-4 pb-24 ${shake ? 'animate-shake' : ''}`}>
      <header className="max-w-xl mx-auto mb-10 border-b border-zinc-900 pb-10">
        <div className="flex justify-center mb-6">
           {company === 'GLX' ? <GreenleafLogo /> : company === 'BST' ? <BSTLogo /> : <h1 className="text-4xl font-black italic text-zinc-800">BOL TERMINAL</h1>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select className="bg-zinc-900 p-4 rounded-xl border border-zinc-800" value={company} onChange={(e) => setCompany(e.target.value as any)}>
            <option value="">SELECT CARRIER</option>
            <option value="GLX">GREENLEAF XPRESS</option>
            <option value="BST">BST EXPEDITE INC</option>
          </select>
          <input type="text" placeholder="DRIVER NAME" className="bg-zinc-900 p-4 rounded-xl border border-zinc-800" value={driverName} onChange={(e) => setDriverName(e.target.value.toUpperCase())} />
        </div>
      </header>

      <div className="max-w-xl mx-auto space-y-10">
        {/* REFERENCES */}
        <section className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">[ 02 ] References</p>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="LOAD #" className="bg-zinc-900 p-4 rounded-xl" value={loadNum} onChange={(e) => setLoadNum(e.target.value.toUpperCase())} />
            <input type="text" placeholder="BOL #" className="bg-zinc-900 p-4 rounded-xl" value={bolNum} onChange={(e) => setBolNum(e.target.value.toUpperCase())} />
          </div>
        </section>

        {/* ROUTE */}
        <section className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">[ 03 ] Route</p>
          <div className="grid grid-cols-3 gap-2">
            <input type="text" placeholder="PU CITY" className="col-span-2 bg-zinc-900 p-4 rounded-xl" value={puCity} onChange={(e) => setPuCity(e.target.value.toUpperCase())} />
            <select className="bg-zinc-900 p-4 rounded-xl" value={puState} onChange={(e) => setPuState(e.target.value)}>
              <option value="">ST</option>{states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input type="text" placeholder="DEL CITY" className="col-span-2 bg-zinc-900 p-4 rounded-xl" value={delCity} onChange={(e) => setDelCity(e.target.value.toUpperCase())} />
            <select className="bg-zinc-900 p-4 rounded-xl" value={delState} onChange={(e) => setDelState(e.target.value)}>
              <option value="">ST</option>{states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </section>

        {/* UPLOAD */}
        <section className="bg-zinc-900/50 p-6 rounded-[2rem] border-2 border-dashed border-zinc-800">
           <div className="flex justify-between mb-8">
              <button onClick={() => setBolProtocol('PICKUP')} className={`px-6 py-2 rounded-lg font-black text-xs ${bolProtocol === 'PICKUP' ? 'bg-white text-black' : 'border border-zinc-800'}`}>PICKUP</button>
              <button onClick={() => setBolProtocol('DELIVERY')} className={`px-6 py-2 rounded-lg font-black text-xs ${bolProtocol === 'DELIVERY' ? 'bg-white text-black' : 'border border-zinc-800'}`}>DELIVERY</button>
           </div>
           <div className="flex justify-center gap-10">
              <button onClick={() => cameraInputRef.current?.click()} className="text-4xl bg-zinc-800 p-6 rounded-2xl">📸</button>
              <button onClick={() => fileInputRef.current?.click()} className="text-4xl bg-zinc-800 p-6 rounded-2xl">📂</button>
           </div>
           <div className="grid grid-cols-4 gap-2 mt-6">
              {uploadedFiles.filter(f => f.category === 'bol').map(f => (
                <div key={f.id} className="aspect-[3/4] rounded-lg overflow-hidden border border-zinc-800">
                  <img src={f.preview} className="w-full h-full object-cover" />
                </div>
              ))}
           </div>
        </section>

        <button 
          onClick={transmitData}
          disabled={!isReady || isSubmitting}
          className={`w-full py-10 rounded-[2.5rem] font-black tracking-widest uppercase transition-all
          ${isReady ? 'bg-green-500 text-black shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'bg-zinc-900 text-zinc-700'}`}
        >
          {isSubmitting ? 'TRANSMITTING...' : 'TRANSMIT DOCUMENTS'}
        </button>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-10">
           <div className="text-6xl mb-10">✅</div>
           <h2 className="text-3xl font-black italic uppercase">Transmission Verified</h2>
           <button onClick={() => window.location.reload()} className="mt-20 text-zinc-500 font-bold uppercase text-xs">New Session</button>
        </div>
      )}

      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
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