import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, User, onAuthStateChanged, signOut } from "firebase/auth";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * AURORA NEXUS v16.0 [OVERLORD PROTOCOL]
 * -----------------------------------------------------------
 * DESIGN: Brutalist Futurism / Tactical Glass
 * SOUND: Sub-Harmonic Synthesis (80Hz - 1200Hz)
 * ENGINE: React 18 / Firebase Gen-4
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
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// --- TACTICAL HAPTIC CORE ---
const synthFeedback = (freq: number, type: OscillatorType = 'sine', duration = 0.3) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
};

// --- DYNAMIC COMPONENTS ---

const TacticalBorder = ({ active, color }: { active: boolean; color: string }) => (
  <div 
    className={`absolute inset-0 pointer-events-none transition-all duration-700 ${active ? 'opacity-100' : 'opacity-20'}`}
    style={{
      boxShadow: active ? `inset 0 0 20px ${color}33, 0 0 10px ${color}22` : 'none',
      border: `1px solid ${active ? color : '#333'}`
    }}
  >
    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: color }} />
    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: color }} />
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2" style={{ borderColor: color }} />
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: color }} />
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<'GLX' | 'BST' | ''>('');
  const [driverName, setDriverName] = useState('');
  const [puCity, setPuCity] = useState('');
  const [puState, setPuState] = useState('');
  const [delCity, setDelCity] = useState('');
  const [delState, setDelState] = useState('');
  const [bolType, setBolType] = useState<'pickup' | 'delivery' | ''>('');
  const [files, setFiles] = useState<any[]>([]);
  const [transmitting, setTransmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
  const themeColor = company === 'GLX' ? '#10b981' : company === 'BST' ? '#6366f1' : '#a855f7';

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const overallProgress = useMemo(() => 
    files.length ? Math.round(files.reduce((s, f) => s + (f.progress || 0), 0) / files.length) : 0, [files]);

  const handleAuth = async () => {
    synthFeedback(150, 'square');
    await signInWithPopup(auth, provider);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    synthFeedback(880, 'sine', 0.1);
    const newFiles = Array.from(e.target.files).map(f => ({
      id: crypto.randomUUID(),
      file: f,
      preview: URL.createObjectURL(f),
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const executeUplink = async () => {
    if (!user || files.length === 0) return;
    setTransmitting(true);
    synthFeedback(60, 'sawtooth', 0.5);

    const uploads = files.map(async (fileItem) => {
      const sRef = storageRef(storage, `nexus_v16/${user.uid}/${fileItem.id}`);
      const task = uploadBytesResumable(sRef, fileItem.file);
      return new Promise((res) => {
        task.on('state_changed', s => {
          const p = (s.bytesTransferred / s.totalBytes) * 100;
          setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, progress: p } : f));
        }, null, async () => res(await getDownloadURL(task.snapshot.ref)));
      });
    });

    const urls = await Promise.all(uploads);
    await addDoc(collection(db, "transmissions"), {
      operator: driverName, fleet: company, payload: urls, timestamp: serverTimestamp()
    });
    synthFeedback(1200, 'sine', 0.8);
    setComplete(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-12 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-150 grayscale" />
        <div className="z-10 text-center space-y-24 max-w-2xl">
          <div className="space-y-4">
            <h1 className="text-8xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">Aurora_Nexus</h1>
            <p className="text-zinc-600 text-[10px] tracking-[1.2em] font-mono uppercase">Global Logistics Handshake Initiated</p>
          </div>
          <button onClick={handleAuth} className="w-full py-12 border border-zinc-800 bg-white/5 hover:bg-white/10 hover:border-white transition-all duration-700 text-white font-black uppercase tracking-[0.6em] text-xs">
            Authenticate_Device
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 font-orbitron p-6 md:p-12 relative overflow-hidden">
      {/* BACKGROUND TELEMETRY LAYER */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${themeColor} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10 grid grid-cols-12 gap-12">
        
        {/* HEADER: TACTICAL HUD */}
        <header className="col-span-12 flex flex-col md:flex-row justify-between items-end border-b border-zinc-900 pb-12 mb-8">
          <div className="flex items-center gap-12">
            <div className="w-20 h-20 border-2 flex items-center justify-center text-3xl font-black transition-all duration-1000 bg-black shadow-2xl"
                 style={{ borderColor: themeColor, color: themeColor, boxShadow: `0 0 30px ${themeColor}33` }}>
              {company ? company[0] : '?'}
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Command_Terminal_v16</h1>
              <div className="flex gap-4 text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
                <span>Node: {user.uid.substring(0,8)}</span>
                <span className="text-green-500 animate-pulse">● System_Live</span>
              </div>
            </div>
          </div>
          <button onClick={() => signOut(auth)} className="px-6 py-3 border border-red-900/30 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Abort_Session</button>
        </header>

        {/* LEFT: TELEMETRY & INPUTS */}
        <main className="col-span-12 lg:col-span-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative p-8 bg-zinc-950/50 backdrop-blur-xl group">
              <TacticalBorder active={!!company} color={themeColor} />
              <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest block mb-4">Fleet_Select</label>
              <select className="w-full bg-black border-none text-white text-sm p-4 outline-none focus:ring-0 appearance-none" value={company} onChange={e => { synthFeedback(400); setCompany(e.target.value as any); }}>
                <option value="">AUTHORITY_PENDING</option>
                <option value="GLX">GREENLEAF_XPRESS</option>
                <option value="BST">BST_EXPEDITE</option>
              </select>
            </div>
            <div className="relative p-8 bg-zinc-950/50 backdrop-blur-xl group">
              <TacticalBorder active={!!driverName} color={themeColor} />
              <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest block mb-4">Operator_Sign</label>
              <input type="text" placeholder="LEGAL_NAME" className="w-full bg-black border-none text-white text-sm p-4 outline-none focus:ring-0" value={driverName} onChange={e => setDriverName(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="relative p-8 bg-zinc-950/50 backdrop-blur-xl">
                <TacticalBorder active={!!puCity} color={themeColor} />
                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest block mb-4">Origin_Vector</label>
                <div className="flex gap-4">
                  <input type="text" placeholder="CITY" className="flex-1 bg-black p-4 text-sm text-white border-none outline-none" value={puCity} onChange={e => setPuCity(e.target.value)} />
                  <select className="w-24 bg-black p-4 text-sm text-white border-none outline-none" value={puState} onChange={e => setPuState(e.target.value)}>
                    <option value="">ST</option>{states.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
             </div>
             <div className="relative p-8 bg-zinc-950/50 backdrop-blur-xl">
                <TacticalBorder active={!!delCity} color={themeColor} />
                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest block mb-4">Delivery_Vector</label>
                <div className="flex gap-4">
                  <input type="text" placeholder="CITY" className="flex-1 bg-black p-4 text-sm text-white border-none outline-none" value={delCity} onChange={e => setDelCity(e.target.value)} />
                  <select className="w-24 bg-black p-4 text-sm text-white border-none outline-none" value={delState} onChange={e => setDelState(e.target.value)}>
                    <option value="">ST</option>{states.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
             </div>
          </div>

          <div className="relative p-12 bg-zinc-950/80 backdrop-blur-3xl border border-zinc-900 group flex items-center justify-around">
             <button onClick={() => { synthFeedback(600); (window as any).cameraInput.click(); }} className="flex flex-col items-center gap-6 group/btn">
                <div className="w-24 h-24 border border-zinc-800 rounded-full flex items-center justify-center group-hover/btn:border-cyan-500 transition-all shadow-2xl">
                  <span className="text-4xl">📸</span>
                </div>
                <span className="text-[10px] font-black tracking-widest uppercase text-zinc-600 group-hover/btn:text-white">Optics_Scan</span>
             </button>
             <button onClick={() => { synthFeedback(600); (window as any).fileInput.click(); }} className="flex flex-col items-center gap-6 group/btn">
                <div className="w-24 h-24 border border-zinc-800 rounded-full flex items-center justify-center group-hover/btn:border-cyan-500 transition-all shadow-2xl">
                  <span className="text-4xl">📂</span>
                </div>
                <span className="text-[10px] font-black tracking-widest uppercase text-zinc-600 group-hover/btn:text-white">Local_Buffer</span>
             </button>
          </div>
        </main>

        {/* RIGHT: CONTROL PANEL */}
        <aside className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-zinc-950 p-8 border border-zinc-900 shadow-2xl relative overflow-hidden">
              <h3 className="text-[11px] font-black text-zinc-700 tracking-[0.5em] uppercase mb-12 italic">// Transmission_Mode</h3>
              <div className="space-y-6">
                {['pickup', 'delivery'].map(type => (
                  <label key={type} className={`flex items-center justify-between p-6 border border-zinc-900 cursor-pointer transition-all ${bolType === type ? 'bg-zinc-900 border-white text-white' : 'hover:bg-white/5 text-zinc-700'}`}>
                    <span className="text-[11px] font-black uppercase tracking-widest">{type}</span>
                    <input type="radio" className="hidden" name="m" onChange={() => { synthFeedback(300); setBolType(type as any); }} />
                    <div className={`w-3 h-3 rounded-full border border-zinc-800 ${bolType === type ? 'bg-white shadow-[0_0_10px_white]' : ''}`} />
                  </label>
                ))}
              </div>
           </div>

           <div className="p-8 border border-zinc-900 bg-zinc-950/20">
              <h4 className="text-[10px] font-black text-zinc-700 tracking-widest uppercase mb-8 italic">// Payload_Status</h4>
              <div className="grid grid-cols-2 gap-4">
                 {files.map(f => (
                   <div key={f.id} className="aspect-square bg-black border border-zinc-800 relative group overflow-hidden">
                      <img src={f.preview} className="w-full h-full object-cover opacity-30 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 h-1 bg-cyan-500 transition-all" style={{ width: `${f.progress}%` }} />
                   </div>
                 ))}
                 {files.length === 0 && <div className="col-span-2 py-12 text-center text-zinc-900 uppercase font-black tracking-widest text-[9px]">Null_Buffer</div>}
              </div>
           </div>

           <button 
             onClick={executeUplink} 
             disabled={transmitting || files.length === 0}
             className={`w-full py-12 text-[12px] font-black uppercase tracking-[1em] transition-all relative overflow-hidden ${files.length > 0 ? 'bg-white text-black hover:invert' : 'bg-zinc-900 text-zinc-700 pointer-events-none'}`}
           >
              {transmitting ? `TRANSMITTING_${overallProgress}%` : 'Execute_Uplink'}
           </button>
        </aside>
      </div>

      {/* OVERLAY: TRANSMISSION VERIFIED */}
      {complete && (
        <div className="fixed inset-0 z-[500] bg-black/99 flex flex-col items-center justify-center p-12 animate-in fade-in duration-1000">
          <div className="max-w-xl w-full text-center space-y-20">
            <div className="w-32 h-32 rounded-full border-4 border-white mx-auto flex items-center justify-center text-6xl shadow-[0_0_100px_white]">✓</div>
            <h2 className="text-white text-6xl font-black italic tracking-tighter uppercase underline decoration-zinc-900 underline-offset-[20px]">Uplink_Complete</h2>
            <button onClick={() => window.location.reload()} className="w-full py-6 border-2 border-zinc-800 text-white text-[12px] font-black uppercase tracking-[0.8em] hover:bg-white hover:text-black transition-all">TERMINATE_SESSION</button>
          </div>
        </div>
      )}

      <input type="file" id="fileInput" className="hidden" multiple onChange={handleFileUpload} />
      <input type="file" id="cameraInput" className="hidden" capture="environment" onChange={handleFileUpload} />
    </div>
  );
};

export default App;