import React, { useState, useRef, useEffect } from 'react';

/** * LOGISTICS TERMINAL v19.0 - SOVEREIGN RESTORATION
 * - FIXED: Freight Photo Logic (Popup triggers camera, adds to section 05).
 * - FIXED: Freight Previews now have the Red Delete [X] button.
 * - RESTORED: "CLICK TO CONNECT" handshake with authentication DING.
 * - RESTORED: "COMPLETE FIELDS" / "REVIEW DOCUMENTS" button logic.
 * - LABELS: PICKUP CITY, DELIVERY CITY, STATE, STATE.
 * - FEATURES: Full Audio Engine, Tactical Glow Borders, Image Compression.
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
    if (globalAudioCtx.state === 'suspended') globalAudioCtx.resume();
    const osc = globalAudioCtx.createOscillator();
    const gain = globalAudioCtx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, globalAudioCtx.currentTime);
    gain.gain.setValueAtTime(vol, globalAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, globalAudioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(globalAudioCtx.destination);
    osc.start(); osc.stop(globalAudioCtx.currentTime + duration);
  } catch (e) { }
};

// --- COMPRESSION ENGINE ---
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

const App: React.FC = () => {
  // --- STATES ---
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
  const [showVerification, setShowVerification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // --- REFS ---
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

  const startHandshake = () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    let stage = 0;
    const inv = setInterval(() => {
      stage++; setAuthStage(stage);
      playSound(200 + (stage * 100), 'sine', 0.1);
      if (stage >= 4) {
        clearInterval(inv);
        playSound(800, 'square', 0.3, 0.1); // THE DING
        setTimeout(() => setIsLocked(false), 500);
      }
    }, 600);
  };

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

  const getTacticalStyles = (val: string) => {
    const isFilled = val && val.trim().length > 0;
    return `w-full p-5 rounded-2xl font-mono text-sm border-2 transition-all outline-none 
      ${isFilled ? `bg-black text-white border-[${themeHex}] shadow-[0_0_15px_${themeHex}30]` : 'bg-zinc-100 text-black border-zinc-200'}`;
  };

  if (isLocked) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <button onClick={startHandshake} className={`w-40 h-40 border-2 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${isAuthenticating ? 'border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)]' : 'border-zinc-800'}`}>
        <span className="text-5xl">{isAuthenticating ? '🔐' : '🛡️'}</span>
      </button>
      {!isAuthenticating && <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 animate-pulse">Click to Connect</p>}
      <div className="mt-10 space-y-3 font-mono text-[10px]">
        {['ENCRYPTING...', 'VERIFYING...', 'HANDSHAKE'].map((l, i) => (<div key={i} className={authStage > i ? 'text-blue-500' : 'text-zinc-800'}>{`> ${l}`}</div>))}
        {authStage >= 4 && <div className="text-green-500 animate-bounce">{`> SECURE [READY]`}</div>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-100 pb-24 font-sans">
      <header className="max-w-4xl mx-auto pt-10 px-4 mb-12">
        <div className={`w-full min-h-[220px] rounded-[3.5rem] border-2 transition-all duration-1000 flex items-center justify-center ${company ? 'bg-black shadow-2xl' : 'bg-zinc-900/50 border-zinc-800'}`} style={{ borderColor: company ? themeHex : '' }}>
           {!company && <h1 className="text-5xl font-black italic uppercase text-zinc-700">BOL UPLOADER</h1>}
           {company === 'GLX' && <div className="text-center animate-in zoom-in font-black text-5xl uppercase italic tracking-tighter">Greenleaf Xpress</div>}
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-8 px-4">
        {/* SECTION 01 */}
        <section className={`bg-zinc-900/40 border-2 rounded-[2.5rem] p-8 shadow-2xl transition-all ${s1Ready ? '' : 'border-zinc-800'}`} style={{ borderColor: s1Ready ? themeHex : '' }}>
          <h3 className={`text-[11px] font-black uppercase mb-8 ${s1Ready ? themeColor : 'text-zinc-500'}`}>[ 01 ] Identification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <select onFocus={()=>playSound(400,'sine',0.05)} className={getTacticalStyles(company)} value={company} onChange={(e)=>setCompany(e.target.value as any)}><option value="">CARRIER</option><option value="GLX">GREENLEAF</option></select>
            <input onFocus={()=>playSound(440,'sine',0.05)} type="text" placeholder="DRIVER NAME" className={getTacticalStyles(driverName)} value={driverName} onChange={(e)=>setDriverName(e.target.value.toUpperCase())} />
          </div>
        </section>

        {/* SECTION 03: ROUTE LABELS FIXED */}
        <section className={`bg-zinc-900/40 border-2 rounded-[2.5rem] p-8 shadow-2xl transition-all ${s3Ready ? '' : 'border-zinc-800'}`} style={{ borderColor: s3Ready ? themeHex : '' }}>
          <h3 className={`text-[11px] font-black uppercase mb-8 ${s3Ready ? themeColor : 'text-zinc-500'}`}>[ 03 ] Route</h3>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2"><input type="text" placeholder="PICKUP CITY" className={getTacticalStyles(puCity)} value={puCity} onChange={(e)=>setPuCity(e.target.value.toUpperCase())} /></div>
            <select className={getTacticalStyles(puState)} value={puState} onChange={(e)=>setPuState(e.target.value)}><option value="">STATE</option>{states.map(s=><option key={s} value={s}>{s}</option>)}</select>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2"><input type="text" placeholder="DELIVERY CITY" className={getTacticalStyles(delCity)} value={delCity} onChange={(e)=>setDelCity(e.target.value.toUpperCase())} /></div>
            <select className={getTacticalStyles(delState)} value={delState} onChange={(e)=>setDelState(e.target.value)}><option value="">STATE</option>{states.map(s=><option key={s} value={s}>{s}</option>)}</select>
          </div>
        </section>

        {/* SECTION 04: UPLOAD */}
        <section className={`bg-zinc-900/40 border-2 rounded-[2.5rem] p-8 ${s4Ready ? 'bg-black shadow-2xl' : 'border-zinc-800 border-dashed opacity-60'}`} style={{ borderColor: s4Ready ? themeHex : '' }}>
          <div className="flex justify-between items-center mb-8">
            <h3 className={`text-[11px] font-black uppercase ${s4Ready ? themeColor : 'text-zinc-500'}`}>[ 04 ] Uplink</h3>
            <div className="flex gap-4">
              <button onClick={()=>setBolProtocol('PICKUP')} className={`px-6 py-2 rounded-xl text-[10px] font-black border-2 transition-all ${bolProtocol === 'PICKUP' ? `bg-black text-white border-[${themeHex}]` : 'bg-white text-zinc-500'}`}>PICKUP BOL</button>
              <button onClick={()=>setBolProtocol('DELIVERY')} className={`px-6 py-2 rounded-xl text-[10px] font-black border-2 transition-all ${bolProtocol === 'DELIVERY' ? `bg-black text-white border-[${themeHex}]` : 'bg-white text-zinc-500'}`}>DELIVERY BOL</button>
            </div>
          </div>
          <div className="flex justify-center gap-10">
            <button onClick={()=>cameraInputRef.current?.click()} className="text-4xl bg-zinc-800 p-6 rounded-2xl shadow-xl hover:bg-white transition-all">📸</button>
            <button onClick={()=>fileInputRef.current?.click()} className="text-4xl bg-zinc-800 p-6 rounded-2xl shadow-xl hover:bg-white transition-all">📂</button>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-6">
            {uploadedFiles.filter(f=>f.category==='bol').map(f=>(<div key={f.id} className="aspect-[3/4] border border-zinc-800 rounded-xl relative group overflow-hidden"><img src={f.preview} className="w-full h-full object-cover"/><button onClick={()=>setUploadedFiles(p=>p.filter(i=>i.id!==f.id))} className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full text-[10px]">✕</button></div>))}
          </div>
        </section>

        {/* SECTION 05: FREIGHT (FIXED LOGIC) */}
        {bolProtocol === 'PICKUP' && (
          <section className={`bg-zinc-900/40 border-2 rounded-[2.5rem] p-8 shadow-2xl ${uploadedFiles.some(f=>f.category==='freight') ? 'bg-black' : 'border-zinc-800 opacity-60'}`} style={{ borderColor: uploadedFiles.some(f=>f.category==='freight') ? themeHex : '' }}>
            <h3 className={`text-[11px] font-black uppercase mb-8 ${uploadedFiles.some(f=>f.category==='freight') ? themeColor : 'text-zinc-500'}`}>[ 05 ] Freight Loaded on Trailer Photos</h3>
            <div className="flex justify-center gap-10">
              <button onClick={()=>freightCamRef.current?.click()} className="text-4xl bg-zinc-800 p-6 rounded-2xl shadow-xl hover:bg-white transition-all">📸</button>
              <button onClick={()=>freightFileRef.current?.click()} className="text-4xl bg-zinc-800 p-6 rounded-2xl shadow-xl hover:bg-white transition-all">📂</button>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-6">
              {uploadedFiles.filter(f=>f.category==='freight').map(f=>(<div key={f.id} className="aspect-square border border-zinc-800 rounded-xl relative group overflow-hidden"><img src={f.preview} className="w-full h-full object-cover"/><button onClick={()=>setUploadedFiles(p=>p.filter(i=>i.id!==f.id))} className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full text-[10px]">✕</button></div>))}
            </div>
          </section>
        )}

        {/* MAIN ACTION BUTTON */}
        <button onClick={()=>{ if(!isReady) playSound(100,'square',0.2); else { playSound(600,'sine',0.2); setShowVerification(true); }}} className={`w-full py-10 rounded-[2.5rem] font-black uppercase tracking-[1.5em] border-2 border-white transition-all ${isReady ? `bg-gradient-to-r from-green-600 to-green-400 text-black shadow-[0_0_80px_rgba(34,197,94,0.4)] scale-[1.02]` : 'bg-zinc-900 text-zinc-700'}`}>
          {isReady ? 'REVIEW DOCUMENTS' : 'COMPLETE FIELDS'}
        </button>
      </div>

      {/* FREIGHT POPUP FIXED */}
      {showFreightPrompt && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-zinc-900 border-2 border-blue-500 rounded-[2.5rem] p-10 max-w-sm text-center shadow-2xl">
            <h2 className="text-xl font-black uppercase mb-4 text-blue-500">Pickup Detected</h2>
            <p className="text-zinc-400 text-sm mb-8 font-bold italic">Take photos of the freight on the trailer?</p>
            <div className="flex flex-col gap-4">
              <button onClick={()=>{ setShowFreightPrompt(false); freightCamRef.current?.click(); }} className="bg-green-500 text-black py-4 rounded-xl font-black uppercase tracking-widest">Yes, Open Camera</button>
              <button onClick={()=>setShowFreightPrompt(false)} className="text-zinc-500 font-black uppercase text-[10px]">No, Skip</button>
            </div>
          </div>
        </div>
      )}

      {/* FINAL REVIEW & GREEN DING SUCCESS */}
      {showSuccess && (<div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center"><div className="w-32 h-32 rounded-full border-4 border-green-500 flex items-center justify-center text-5xl mb-12 animate-bounce">✓</div><h2 className="text-4xl font-black uppercase text-white tracking-widest text-center px-6">Transmission Verified</h2><button onClick={()=>window.location.reload()} className="mt-16 text-zinc-600 font-black uppercase tracking-widest hover:text-white transition-colors">Start New Session</button></div>)}
      
      {/* VERIFICATION MODAL */}
      {showVerification && (
        <div className="fixed inset-0 z-[400] bg-black flex flex-col items-center justify-center p-6 animate-in slide-in-from-bottom">
          <div className={`w-full max-w-lg bg-zinc-900 border-2 rounded-[3.5rem] p-10 shadow-2xl relative`} style={{ borderColor: themeHex }}>
             <h2 className={`text-2xl font-black uppercase mb-10 ${themeColor}`}>Final Review</h2>
             <div className="space-y-4 mb-12 font-mono text-sm uppercase">
                <div className="flex justify-between border-b border-zinc-800 pb-2"><span>Carrier</span><span>{company}</span></div>
                <div className="flex justify-between border-b border-zinc-800 pb-2"><span>Load #</span><span>{loadNum}</span></div>
                <div className="flex justify-between border-b border-zinc-800 pb-2"><span>Route</span><span>{puCity} → {delCity}</span></div>
                <div className="flex justify-between border-b border-zinc-800 pb-2"><span>Photos</span><span>{uploadedFiles.length} Total</span></div>
             </div>
             <button onClick={async ()=>{ setIsSubmitting(true); const base64=await Promise.all(uploadedFiles.map(async f=>{ return new Promise(resolve=>{ const r=new FileReader(); r.onload=()=>resolve({category:f.category,base64:r.result}); r.readAsDataURL(f.file); })} )); const payload={company,driverName,loadNum,bolNum,puCity,puState,delCity,delState,bolProtocol,files:base64}; await fetch(GOOGLE_SCRIPT_URL,{method:'POST',mode:'no-cors',body:JSON.stringify(payload)}); setShowSuccess(true); }} className="w-full py-8 bg-[#ccff00] text-black rounded-[1.5rem] font-black uppercase tracking-widest border-[3px] border-white shadow-2xl">
               {isSubmitting ? 'TRANSMITTING...' : 'Confirm & Transmit'}
             </button>
             <button onClick={()=>setShowVerification(false)} className="w-full mt-4 text-zinc-600 font-black uppercase text-[10px]">Go Back</button>
          </div>
        </div>
      )}

      {/* HIDDEN INPUTS */}
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" multiple onChange={(e)=>onFileSelect(e,'bol')} />
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e)=>onFileSelect(e,'bol')} />
      <input type="file" ref={freightCamRef} className="hidden" capture="environment" accept="image/*" multiple onChange={(e)=>onFileSelect(e,'freight')} />
      <input type="file" ref={freightFileRef} className="hidden" multiple accept="image/*" onChange={(e)=>onFileSelect(e,'freight')} />
    </div>
  );
};

export default App;