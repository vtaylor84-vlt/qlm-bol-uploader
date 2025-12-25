import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * AURORA NEXUS v17.0 [NON-AUTH COMMAND DECK]
 * -----------------------------------------------------------
 * DESIGN: Brutalist Industrial / Tactical Obsidian
 * SOUND: Sub-Harmonic Session Handshake
 * ENGINE: Firebase Gen-4 Storage & Firestore
 */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

// --- TACTICAL HAPTIC CORE ---
const playHaptic = (freq: number, type: OscillatorType = 'sine', vol = 0.1) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
};

// --- ELITE UI FRAGMENTS ---

const CornerBracket = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const styles = {
    tl: "top-0 left-0 border-t-2 border-l-2",
    tr: "top-0 right-0 border-t-2 border-r-2",
    bl: "bottom-0 left-0 border-b-2 border-l-2",
    br: "bottom-0 right-0 border-b-2 border-r-2",
  };
  return <div className={`absolute w-4 h-4 border-zinc-700 ${styles[position]} pointer-events-none group-focus-within:border-cyan-500 transition-colors duration-500`} />;
};

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [company, setCompany] = useState<'GLX' | 'BST' | ''>('');
  const [driverName, setDriverName] = useState('');
  const [loadRef, setLoadRef] = useState('');
  const [puCity, setPuCity] = useState('');
  const [puState, setPuState] = useState('');
  const [delCity, setDelCity] = useState('');
  const [delState, setDelState] = useState('');
  const [bolType, setBolType] = useState<'pickup' | 'delivery' | ''>('');
  const [files, setFiles] = useState<any[]>([]);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
  const accent = company === 'GLX' ? '#10b981' : company === 'BST' ? '#6366f1' : '#06b6d4';

  // --- BOOT SEQUENCE ---
  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 100) {
        setBootProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          setIsBooting(false);
          playHaptic(120, 'sine', 0.2);
        }, 500);
      } else {
        setBootProgress(p);
        if (Math.random() > 0.7) playHaptic(1000, 'square', 0.02);
      }
    }, 100);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    playHaptic(800, 'sine');
    const newAssets = Array.from(e.target.files).map(f => ({
      id: crypto.randomUUID(),
      file: f,
      preview: URL.createObjectURL(f),
      progress: 0
    }));
    setFiles(prev => [...prev, ...newAssets]);
  };

  const executeUplink = async () => {
    if (files.length === 0) return;
    setIsTransmitting(true);
    playHaptic(60, 'sawtooth', 0.3);

    const uploads = files.map(async (fileItem) => {
      const sRef = storageRef(storage, `uplink_v17/${fileItem.id}`);
      const task = uploadBytesResumable(sRef, fileItem.file);
      return new Promise((res) => {
        task.on('state_changed', s => {
          const p = (s.bytesTransferred / s.totalBytes) * 100;
          setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, progress: p } : f));
        }, null, async () => res(await getDownloadURL(task.snapshot.ref)));
      });
    });

    const urls = await Promise.all(uploads);
    await addDoc(collection(db, "transmissions_v17"), {
      driver: driverName,
      fleet: company,
      load: loadRef,
      route: `${puCity} to ${delCity}`,
      bol: bolType,
      assets: urls,
      timestamp: serverTimestamp()
    });
    setComplete(true);
  };

  if (isBooting) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-12 font-mono relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="w-full max-w-sm space-y-6 relative z-10">
          <div className="flex justify-between text-[10px] text-zinc-500 tracking-[0.3em]">
            <span>SYSTEM_INIT</span>
            <span>{Math.round(bootProgress)}%</span>
          </div>
          <div className="h-1 bg-zinc-900 w-full overflow-hidden border border-zinc-800">
            <div className="h-full bg-cyan-500 transition-all duration-100" style={{ width: `${bootProgress}%` }} />
          </div>
          <div className="text-[8px] text-zinc-700 uppercase tracking-widest text-center animate-pulse">
            Establishing Secure Satellite Handshake...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-orbitron p-4 md:p-10 relative overflow-hidden selection:bg-cyan-500 selection:text-black">
      {/* TACTICAL OVERLAY */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0 bg-[linear-gradient(45deg,transparent_48%,white_49%,white_51%,transparent_52%)] bg-[size:60px_60px]" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-900 pb-10 mb-12 gap-8">
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 border-2 flex items-center justify-center text-3xl font-black bg-zinc-950 transition-all duration-700"
                 style={{ borderColor: accent, color: accent, boxShadow: `0 0 20px ${accent}33` }}>
              {company ? company[0] : 'Ø'}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Command_Terminal_v17</h1>
              <p className="text-[9px] tracking-[0.6em] font-mono text-zinc-600 mt-2">SECURE_ID: {Math.random().toString(36).substring(7).toUpperCase()} // SESSION_ACTIVE</p>
            </div>
          </div>
          <button onClick={() => location.reload()} className="px-6 py-3 border border-zinc-800 text-zinc-500 text-[10px] font-black tracking-widest hover:border-white hover:text-white transition-all">Reset_Node</button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* PRIMARY FORM */}
          <main className="lg:col-span-8 space-y-10">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative p-6 bg-zinc-900/30 backdrop-blur-3xl group">
                <CornerBracket position="tl" /><CornerBracket position="br" />
                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] block mb-4">Fleet_Select</label>
                <select className="w-full bg-transparent border-none text-white text-sm outline-none appearance-none cursor-pointer" value={company} onChange={e => setCompany(e.target.value as any)}>
                  <option value="">NULL_SELECT</option>
                  <option value="GLX">GREENLEAF_XPRESS</option>
                  <option value="BST">BST_EXPEDITE</option>
                </select>
              </div>
              <div className="relative p-6 bg-zinc-900/30 backdrop-blur-3xl group">
                <CornerBracket position="tl" /><CornerBracket position="br" />
                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] block mb-4">Operator_Sign</label>
                <input type="text" placeholder="FULL_NAME" className="w-full bg-transparent border-none text-white text-sm outline-none" value={driverName} onChange={e => setDriverName(e.target.value)} />
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative p-6 bg-zinc-900/30 backdrop-blur-3xl">
                <CornerBracket position="tl" /><CornerBracket position="br" />
                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] block mb-4">Pickup_Origin</label>
                <div className="flex gap-4">
                  <input type="text" placeholder="CITY" className="flex-1 bg-transparent text-sm text-white border-none outline-none" value={puCity} onChange={e => setPuCity(e.target.value)} />
                  <select className="w-20 bg-transparent text-sm text-white border-none outline-none" value={puState} onChange={e => setPuState(e.target.value)}>
                    <option value="">ST</option>{states.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="relative p-6 bg-zinc-900/30 backdrop-blur-3xl">
                <CornerBracket position="tl" /><CornerBracket position="br" />
                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] block mb-4">Delivery_Dest</label>
                <div className="flex gap-4">
                  <input type="text" placeholder="CITY" className="flex-1 bg-transparent text-sm text-white border-none outline-none" value={delCity} onChange={e => setDelCity(e.target.value)} />
                  <select className="w-20 bg-transparent text-sm text-white border-none outline-none" value={delState} onChange={e => setDelState(e.target.value)}>
                    <option value="">ST</option>{states.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </section>

            <section className="p-12 border border-zinc-900 bg-zinc-950/50 flex flex-col items-center justify-center gap-12 group relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-[10px] font-black tracking-[1em] text-zinc-800 uppercase italic">Imaging_Array</h3>
              <div className="flex gap-20 relative z-10">
                <button onClick={() => (document.getElementById('cam') as any).click()} className="flex flex-col items-center gap-4 group/btn transition-transform active:scale-95">
                  <div className="w-24 h-24 border border-zinc-800 rounded-full flex items-center justify-center bg-zinc-900/20 group-hover/btn:border-cyan-500/50 transition-all shadow-2xl">
                    <span className="text-3xl">📷</span>
                  </div>
                  <span className="text-[9px] font-black tracking-widest text-zinc-700">CAMERA</span>
                </button>
                <button onClick={() => (document.getElementById('file') as any).click()} className="flex flex-col items-center gap-4 group/btn transition-transform active:scale-95">
                  <div className="w-24 h-24 border border-zinc-800 rounded-full flex items-center justify-center bg-zinc-900/20 group-hover/btn:border-cyan-500/50 transition-all shadow-2xl">
                    <span className="text-3xl">📁</span>
                  </div>
                  <span className="text-[9px] font-black tracking-widest text-zinc-700">GALLERY</span>
                </button>
              </div>
            </section>
          </main>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 space-y-10">
            <div className="bg-zinc-950 p-8 border border-zinc-900 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 opacity-20" />
              <h3 className="text-[11px] font-black uppercase text-zinc-700 tracking-[0.5em] mb-10 italic">// Protocol</h3>
              <div className="space-y-4">
                {['pickup', 'delivery'].map(type => (
                  <label key={type} className={`flex items-center justify-between p-5 border border-zinc-900 cursor-pointer transition-all ${bolType === type ? 'bg-zinc-900 border-zinc-500 text-white' : 'hover:bg-white/5 text-zinc-700'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>
                    <input type="radio" className="hidden" name="m" onChange={() => setBolType(type as any)} />
                    <div className={`w-3 h-3 rounded-full border border-zinc-800 ${bolType === type ? 'bg-cyan-500 shadow-[0_0_10px_cyan]' : ''}`} />
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-zinc-950 p-8 border border-zinc-900 min-h-[240px]">
              <h3 className="text-[10px] font-black text-zinc-700 tracking-[0.5em] uppercase mb-8 italic">// Cargo_Preview</h3>
              <div className="grid grid-cols-2 gap-4">
                {files.map(f => (
                  <div key={f.id} className="aspect-square border border-zinc-900 relative group overflow-hidden bg-black">
                    <img src={f.preview} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 h-1 bg-cyan-500 transition-all" style={{ width: `${f.progress}%` }} />
                  </div>
                ))}
                {files.length === 0 && <div className="col-span-2 py-10 text-center text-zinc-900 font-black tracking-widest text-[9px]">NO_DATA</div>}
              </div>
            </div>

            <button 
              onClick={executeUplink} 
              disabled={isTransmitting || files.length === 0}
              className={`w-full py-10 text-[12px] font-black uppercase tracking-[1em] transition-all relative overflow-hidden shadow-2xl ${files.length > 0 ? 'bg-white text-black hover:bg-cyan-500' : 'bg-zinc-900 text-zinc-700 opacity-50 pointer-events-none'}`}
            >
              {isTransmitting ? `TRANSMITTING_${overallProgress}%` : 'EXECUTE_UPLINK'}
            </button>
          </aside>
        </div>
      </div>

      {complete && (
        <div className="fixed inset-0 z-[500] bg-black/98 flex flex-col items-center justify-center p-12 animate-in fade-in duration-1000">
          <div className="max-w-xl w-full text-center space-y-16">
            <div className="w-32 h-32 rounded-full border-4 border-cyan-500 text-cyan-500 mx-auto flex items-center justify-center text-6xl shadow-[0_0_100px_cyan]">✓</div>
            <h2 className="text-white text-5xl font-black italic tracking-tighter uppercase underline decoration-zinc-900 underline-offset-[20px]">Transmission_Complete</h2>
            <button onClick={() => location.reload()} className="w-full py-6 border border-zinc-800 text-zinc-500 text-[12px] font-black uppercase tracking-[0.8em] hover:text-white transition-all">TERMINATE_SESSION</button>
          </div>
        </div>
      )}

      <input type="file" id="file" className="hidden" multiple accept="image/*" onChange={handleFileUpload} />
      <input type="file" id="cam" className="hidden" capture="environment" accept="image/*" onChange={handleFileUpload} />
    </div>
  );
};

export default App;