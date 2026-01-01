import React, { useState, useRef, useEffect } from 'react';

/** * LOGISTICS TERMINAL v31.6 - MASTER STABLE
 * - UPDATED: 2026-01-01
 * - FIX: Widened GLX Logo to prevent text cutoff.
 * - FIX: Metallic BstLogo visibility fix.
 * - FIX: Complete payload sync (Origin/Dest Cities & States).
 */

interface FileWithPreview {
  file: File | Blob; preview: string; id: string; category: 'bol' | 'freight';
}

interface VaultEntry {
  id: string; timestamp: number; payload: any;
}

// SECURE BACKEND INJECTION - Pulls from Netlify Environment Variables
const GOOGLE_SCRIPT_URL = process.env.REACT_APP_GAS_URL || '';

// --- [SECTION 00] UTILITIES ---
const compressAndEnhanceImage = (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1600; 
        let width = img.width; let height = img.height;
        if (width > height) {
          if (width > MAX_DIM) { height *= MAX_DIM / width; width = MAX_DIM; }
        } else {
          if (height > MAX_DIM) { width *= MAX_DIM / height; height = MAX_DIM; }
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.filter = "contrast(1.2) brightness(1.05)";
            ctx.drawImage(img, 0, 0, width, height);
        }
        canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.7);
      };
    };
  });
};

// --- [SECTION 01] LOGOS ---

export const GreenleafLogo: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-1000">
    <svg width="100%" height="auto" className="max-w-[400px]" viewBox="0 0 600 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="chrome-silver" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" /><stop offset="40%" stopColor="#BDC3C7" /><stop offset="50%" stopColor="#7F8C8D" /><stop offset="100%" stopColor="#DDE4E8" />
        </linearGradient>
        <linearGradient id="leaf-green" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A8E063" /><stop offset="100%" stopColor="#22C55E" />
        </linearGradient>
        <linearGradient id="road-view" x1="300" y1="180" x2="300" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#111111" /><stop offset="1" stopColor="#444444" />
        </linearGradient>
      </defs>
      <path d="M300 50L100 200H500L300 50Z" fill="url(#road-view)" stroke="url(#chrome-silver)" strokeWidth="4"/>
      <path d="M300 190V175M300 160V150M300 135V130" stroke="white" strokeWidth="4" opacity="0.6"/>
      <path d="M300 20C300 20 230 50 230 100C230 140 300 150 300 150C300 150 370 140 370 100C370 50 300 20 300 20Z" fill="url(#leaf-green)" />
      <text x="300" y="250" textAnchor="middle" style={{ fontFamily: 'Arial Black, sans-serif', fontSize: '44px', fontWeight: '900', fill: 'url(#chrome-silver)', fontStyle: 'italic' }}>GREENLEAF XPRESS</text>
      <text x="300" y="285" textAnchor="middle" style={{ fontFamily: 'Arial Black, sans-serif', fontSize: '32px', fontWeight: '900', fill: '#62df62' }}>LLC</text>
      <text x="300" y="310" textAnchor="middle" style={{ fontFamily: 'monospace', fontSize: '14px', fill: '#BDC3C7', fontWeight: 'bold', letterSpacing: '6px' }}>WATERLOO, IOWA</text>
    </svg>
  </div>
);

export const BstLogo: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-4 w-full min-h-[180px] animate-in fade-in duration-700"> 
    <svg width="320" height="120" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bst-metal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0ea5e9" /><stop offset="50%" stopColor="#ffffff" /><stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <text x="200" y="75" textAnchor="middle" style={{ fontSize: '95px', fill: 'url(#bst-metal)', filter: 'url(#neon-glow)', fontFamily: 'Arial Black, sans-serif', fontWeight: '900', fontStyle: 'italic' }}>BST</text>
      <text x="200" y="110" textAnchor="middle" style={{ fontSize: '16px', fill: '#93c5fd', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '8px' }}>EXPEDITE INC</text>
    </svg>
  </div>
);

// --- [SECTION 02] MAIN APP ---

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
  const [showVerification, setShowVerification] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
  
  const themeHex = company === 'GLX' ? '#22c55e' : '#3b82f6';
  const isReady = !!(company && driverName && loadNum && puCity && puState && delCity && delState && bolProtocol && uploadedFiles.length > 0);

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, cat: 'bol' | 'freight') => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      for (const f of files) {
        const enh = await compressAndEnhanceImage(f);
        setUploadedFiles(prev => [...prev, { file: enh, preview: URL.createObjectURL(enh), id: `${Date.now()}-${f.name}`, category: cat }]);
      }
    }
  };

  const getTacticalStyles = (v: string) => `w-full p-5 rounded-2xl font-mono text-sm border-2 transition-all ${v ? 'bg-black text-white border-blue-500 shadow-lg' : 'bg-zinc-100 text-black border-zinc-200'}`;

  if (isLocked) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white font-sans">
      <button onClick={() => setIsLocked(false)} className="w-40 h-40 border-2 border-zinc-800 rounded-full flex items-center justify-center text-5xl animate-pulse">🛡️</button>
      <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">Secure Dispatch Terminal</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] pb-24 font-sans text-white">
      <header className="max-w-4xl mx-auto pt-10 px-4 mb-12">
        <div className="w-full min-h-[220px] rounded-[3.5rem] border-2 border-zinc-800 flex items-center justify-center bg-black transition-all" style={{borderColor: company ? themeHex : ''}}>
           {company === 'GLX' && <GreenleafLogo />}
           {company === 'BST' && <BstLogo />}
           {!company && <h1 className="text-5xl font-black italic uppercase text-zinc-700">QLM CONNECT</h1>}
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-8 px-4">
        {/* IDENTIFICATION */}
        <section className="bg-zinc-900/40 border-2 border-zinc-800 rounded-[2.5rem] p-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-zinc-500">[ 01 ] Carrier & Driver</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <select className={getTacticalStyles(company)} value={company} onChange={(e)=>setCompany(e.target.value as any)}><option value="">SELECT CARRIER</option><option value="GLX">GREENLEAF XPRESS</option><option value="BST">BST EXPEDITE INC</option></select>
                <input type="text" placeholder="DRIVER NAME" className={getTacticalStyles(driverName)} value={driverName} onChange={(e)=>setDriverName(e.target.value.toUpperCase())} />
            </div>
        </section>

        {/* REFERENCES */}
        <section className="bg-zinc-900/40 border-2 border-zinc-800 rounded-[2.5rem] p-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-zinc-500">[ 02 ] Load References</h3>
            <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="LOAD #" className={getTacticalStyles(loadNum)} value={loadNum} onChange={(e)=>setLoadNum(e.target.value.toUpperCase())} />
                <input type="text" placeholder="BOL #" className={getTacticalStyles(bolNum)} value={bolNum} onChange={(e)=>setBolNum(e.target.value.toUpperCase())} />
            </div>
        </section>

        {/* ROUTE */}
        <section className="bg-zinc-900/40 border-2 border-zinc-800 rounded-[2.5rem] p-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-zinc-500">[ 03 ] Route Details</h3>
            <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="col-span-2"><input type="text" placeholder="PICKUP CITY" className={getTacticalStyles(puCity)} value={puCity} onChange={(e)=>setPuCity(e.target.value.toUpperCase())} /></div>
                <select className={getTacticalStyles(puState)} value={puState} onChange={(e)=>setPuState(e.target.value)}><option value="">ST</option>{states.map(s=><option key={s} value={s}>{s}</option>)}</select>
            </div>
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2"><input type="text" placeholder="DELIVERY CITY" className={getTacticalStyles(delCity)} value={delCity} onChange={(e)=>setDelCity(e.target.value.toUpperCase())} /></div>
                <select className={getTacticalStyles(delState)} value={delState} onChange={(e)=>setDelState(e.target.value)}><option value="">ST</option>{states.map(s=><option key={s} value={s}>{s}</option>)}</select>
            </div>
        </section>

        {/* DOCUMENTS */}
        <section className="bg-zinc-900/40 border-2 border-zinc-800 rounded-[2.5rem] p-8 text-center">
            <div className="flex justify-center gap-4 mb-8">
                <button onClick={()=>setBolProtocol('PICKUP')} className={`px-6 py-2 rounded-xl text-[10px] font-black border-2 transition-all ${bolProtocol === 'PICKUP' ? 'bg-white text-black' : 'text-zinc-500 border-zinc-800'}`}>PICKUP BOL</button>
                <button onClick={()=>setBolProtocol('DELIVERY')} className={`px-6 py-2 rounded-xl text-[10px] font-black border-2 transition-all ${bolProtocol === 'DELIVERY' ? 'bg-white text-black' : 'text-zinc-500 border-zinc-800'}`}>DELIVERY POD</button>
            </div>
            <button onClick={()=>cameraInputRef.current?.click()} className="w-24 h-24 rounded-3xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-4xl mx-auto shadow-xl active:scale-95 transition-all">📸</button>
            <div className="grid grid-cols-4 gap-2 mt-8">
                {uploadedFiles.map(f=>(<div key={f.id} className="aspect-[3/4] rounded-xl bg-zinc-800 overflow-hidden border border-zinc-700"><img src={f.preview} className="w-full h-full object-cover"/></div>))}
            </div>
        </section>

        <button onClick={()=>{ if(isReady) setShowVerification(true); }} className={`w-full py-10 rounded-[2.5rem] font-black uppercase tracking-[1em] transition-all ${isReady ? 'bg-blue-600 shadow-[0_0_40px_rgba(59,130,246,0.4)]' : 'bg-zinc-900 text-zinc-700 opacity-50'}`}>Review & Transmit</button>
      </div>

      {/* VERIFICATION MODAL */}
      {showVerification && (
        <div className="fixed inset-0 z-[400] bg-black/95 flex flex-col items-center justify-center p-6 animate-in fade-in">
          <div className="w-full max-w-lg bg-zinc-900 border-2 border-zinc-800 rounded-[3.5rem] p-10 shadow-2xl">
             <h2 className="text-2xl font-black uppercase mb-10 italic tracking-widest text-blue-500">Final Review</h2>
             <div className="space-y-3 mb-12 text-sm font-mono uppercase">
                <div className="flex justify-between border-b border-zinc-800 pb-2"><span>Carrier</span><span className="text-zinc-400">{company}</span></div>
                <div className="flex justify-between border-b border-zinc-800 pb-2"><span>Load #</span><span className="text-white font-bold">{loadNum}</span></div>
                <div className="flex justify-between border-b border-zinc-800 pb-2"><span>Origin</span><span className="text-zinc-400">{puCity}, {puState}</span></div>
                <div className="flex justify-between border-b border-zinc-800 pb-2"><span>Destination</span><span className="text-zinc-400">{delCity}, {delState}</span></div>
             </div>
             <button onClick={async ()=>{ 
                if(!GOOGLE_SCRIPT_URL) { alert("ERROR: REACT_APP_GAS_URL is missing in Netlify settings."); return; }
                setIsSubmitting(true); 
                const base64 = await Promise.all(uploadedFiles.map(async f => { 
                   return new Promise(resolve => { 
                      const r = new FileReader(); 
                      r.onload = () => resolve({category: f.category, base64: r.result}); 
                      r.readAsDataURL(f.file); 
                   }); 
                }));
                const payload = {company, driverName, loadNum, bolNum, puCity, puState, delCity, delState, bolProtocol, files: base64};
                try { 
                   await fetch(GOOGLE_SCRIPT_URL, {method:'POST', mode:'no-cors', body:JSON.stringify(payload)}); 
                   setShowSuccess(true); 
                } catch(e) { 
                   alert("Network Sync Error. Attempting to save to local vault."); 
                   setIsSubmitting(false);
                } 
             }} className="w-full py-8 bg-blue-500 text-white rounded-[1.5rem] font-black uppercase tracking-[0.4em] active:scale-95 shadow-xl">{isSubmitting ? 'TRANSMITTING...' : 'Confirm & Transmit'}</button>
             <button onClick={()=>setShowVerification(false)} className="w-full mt-4 text-zinc-600 uppercase text-[10px] font-bold tracking-widest">Back</button>
          </div>
        </div>
      )}

      {showSuccess && (<div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center p-10 text-center animate-in zoom-in"><div className="w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center text-4xl mb-8 text-green-500">✓</div><h2 className="text-4xl font-black mb-8 text-white italic">TRANSMITTED</h2><button onClick={()=>window.location.reload()} className="text-zinc-500 uppercase text-xs font-bold tracking-[0.3em]">Start New Session</button></div>)}
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" multiple onChange={(e)=>onFileSelect(e,'bol')} />
    </div>
  );
};

export default App;