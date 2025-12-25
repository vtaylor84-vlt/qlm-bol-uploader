import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * EXO-SKELETON v26.0 [ULTIMATE COMMAND]
 * -----------------------------------------------------------
 * DESIGN: Structural Brutalism / Depth-Mapped Glass
 * SOUND: Sub-Harmonic FM Synthesis (40Hz - 2400Hz)
 * ENGINE: Procedural SVG Filters / Firebase Hyper-Drive
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

// --- TACTICAL AUDIO CORE (WAVE INTERFERENCE) ---
const playTacticalResonance = (freq: number, type: OscillatorType = 'sine', duration = 0.4) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
};

// --- ELITE COMPONENT FRAGMENTS ---

const FrameBracket = ({ color }: { color: string }) => (
  <div className="absolute inset-0 pointer-events-none opacity-50 group-focus-within:opacity-100 transition-all duration-500">
    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4" style={{ borderColor: color }} />
    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4" style={{ borderColor: color }} />
    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4" style={{ borderColor: color }} />
    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4" style={{ borderColor: color }} />
  </div>
);

const App: React.FC = () => {
  const [booting, setBooting] = useState(true);
  const [company, setCompany] = useState<'GLX' | 'BST' | ''>('');
  const [driver, setDriver] = useState('');
  const [loadId, setLoadId] = useState('');
  const [pu, setPu] = useState({ city: '', st: '' });
  const [del, setDel] = useState({ city: '', st: '' });
  const [bol, setBol] = useState<'pickup' | 'delivery' | ''>('');
  const [payload, setPayload] = useState<any[]>([]);
  const [uplinkActive, setUplinkActive] = useState(false);
  const [complete, setComplete] = useState(false);

  const theme = company === 'GLX' ? '#10b981' : company === 'BST' ? '#3b82f6' : '#6366f1';
  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  useEffect(() => {
    setTimeout(() => {
      setBooting(false);
      playTacticalResonance(80, 'sine', 1.2);
    }, 2800);
  }, []);

  const handleIngest = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    playTacticalResonance(880, 'square', 0.1);
    const newAssets = Array.from(e.target.files).map(f => ({
      id: crypto.randomUUID(), file: f, preview: URL.createObjectURL(f), progress: 0
    }));
    setPayload(p => [...p, ...newAssets]);
  };

  const transmit = async () => {
    if (payload.length === 0 || !driver || !pu.city) return;
    setUplinkActive(true);
    playTacticalResonance(40, 'sawtooth', 1.5);

    const uploads = payload.map(async (item) => {
      const sRef = storageRef(storage, `exo_v26/${item.id}`);
      const task = uploadBytesResumable(sRef, item.file);
      return new Promise((res) => {
        task.on('state_changed', s => {
          const p = (s.bytesTransferred / s.totalBytes) * 100;
          setPayload(prev => prev.map(f => f.id === item.id ? { ...f, progress: p } : f));
          if (p % 20 === 0) playTacticalResonance(440 + p, 'sine', 0.1);
        }, null, async () => res(await getDownloadURL(task.snapshot.ref)));
      });
    });

    const urls = await Promise.all(uploads);
    await addDoc(collection(db, "exo_transmissions"), {
      op: driver, fleet: company, load: loadId, route: `${pu.city}, ${pu.st} to ${del.city}, ${del.st}`, bol, urls, ts: serverTimestamp()
    });
    setComplete(true);
    playTacticalResonance(120, 'sine', 2.0);
  };

  if (booting) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-12">
        <div className="w-48 h-48 border-4 border-zinc-900 border-t-cyan-500 rounded-full animate-spin flex items-center justify-center">
          <div className="w-32 h-32 border-4 border-zinc-900 border-b-purple-500 rounded-full animate-reverse-spin" />
        </div>
        <h2 className="mt-12 text-white font-black text-xl tracking-[1em] animate-pulse">EXO_LINKING</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010101] text-zinc-400 font-orbitron p-4 md:p-12 relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {/* HIGH-DENSITY HUD OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] bg-[linear-gradient(90deg,#fff_1px,transparent_1px),linear-gradient(#fff_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      <div className="max-w-[1600px] mx-auto relative z-10">
        
        {/* HEADER: COMMAND ARCHITECTURE */}
        <header className="flex flex-col lg:flex-row justify-between items-end border-b-4 border-zinc-900 pb-12 mb-16 gap-10">
          <div className="flex items-center gap-16 group">
             <div className="w-32 h-32 border-4 flex items-center justify-center text-6xl font-black transition-all duration-1000 bg-zinc-950 shadow-2xl relative"
                  style={{ borderColor: theme, color: theme, boxShadow: `0 0 60px ${theme}33` }}>
               <div className="absolute inset-2 border border-dashed opacity-20 animate-spin-slow" style={{ borderColor: theme }} />
               {company ? company[0] : 'Σ'}
             </div>
             <div className="space-y-4">
               <h1 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">Exo_Skeleton_v26</h1>
               <div className="flex gap-10 text-[10px] font-mono text-zinc-700 tracking-[0.6em] uppercase italic">
                 <span>Latency: 12ms</span>
                 <span className="text-cyan-500 animate-pulse">Link: Established</span>
               </div>
             </div>
          </div>
          <button onClick={() => location.reload()} className="px-12 py-5 border-2 border-zinc-800 text-zinc-500 text-sm font-black uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all duration-700">Purge_Silo</button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* MAIN MODULE */}
          <main className="lg:col-span-8 space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="relative p-12 bg-zinc-950/80 border-2 border-zinc-900 group">
                  <FrameBracket color={theme} />
                  <label className="text-[12px] font-black uppercase text-zinc-700 tracking-[0.8em] block mb-10 italic">// Fleet_Authority</label>
                  <select 
                    className="w-full bg-zinc-900 border-2 border-zinc-800 p-6 text-white text-2xl font-black outline-none appearance-none focus:border-cyan-500 cursor-pointer"
                    style={{ colorScheme: 'dark' }}
                    value={company} 
                    onChange={e => { playTacticalResonance(330, 'sine'); setCompany(e.target.value as any); }}
                  >
                    <option value="">VOID_SELECT</option>
                    <option value="GLX">GLX_COMMAND</option>
                    <option value="BST">BST_OVERMIND</option>
                  </select>
               </div>
               <div className="relative p-12 bg-zinc-950/80 border-2 border-zinc-900 group">
                  <FrameBracket color={theme} />
                  <label className="text-[12px] font-black uppercase text-zinc-700 tracking-[0.8em] block mb-10 italic">// Operator_Sig</label>
                  <input type="text" placeholder="LEGAL_NAME" className="w-full bg-transparent border-none text-white text-2xl font-black outline-none placeholder-zinc-900" value={driver} onChange={e => setDriver(e.target.value)} />
               </div>
            </div>

            {/* ROUTE MODULE */}
            <div className="p-16 border-2 border-zinc-900 bg-zinc-950 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none" />
               <h3 className="text-xs font-black text-zinc-700 tracking-[1.2em] uppercase mb-12 italic">// Routing_Vectors</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                  <div className="space-y-8">
                    <div className="relative group">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-800 mb-2 block ml-1">Origin_City</label>
                       <input type="text" placeholder="PICKUP_COORD" className="w-full bg-zinc-900/50 border border-zinc-800 p-6 text-lg text-white outline-none focus:border-cyan-500 transition-all" value={pu.city} onChange={e => setPu({...pu, city: e.target.value})} />
                    </div>
                    <div className="relative group">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-800 mb-2 block ml-1">ST_Code</label>
                       <select className="w-full bg-zinc-900 border border-zinc-800 p-6 text-white text-lg outline-none appearance-none" value={pu.st} onChange={e => setPu({...pu, st: e.target.value})}>
                          <option value="">--</option>{states.map(s => <option key={s} className="bg-zinc-950">{s}</option>)}
                       </select>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div className="relative group">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-800 mb-2 block ml-1">Terminus_City</label>
                       <input type="text" placeholder="DELIVERY_COORD" className="w-full bg-zinc-900/50 border border-zinc-800 p-6 text-lg text-white outline-none focus:border-cyan-500 transition-all" value={del.city} onChange={e => setDel({...del, city: e.target.value})} />
                    </div>
                    <div className="relative group">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-800 mb-2 block ml-1">ST_Code</label>
                       <select className="w-full bg-zinc-900 border border-zinc-800 p-6 text-white text-lg outline-none appearance-none" value={del.st} onChange={e => setDel({...del, st: e.target.value})}>
                          <option value="">--</option>{states.map(s => <option key={s} className="bg-zinc-950">{s}</option>)}
                       </select>
                    </div>
                  </div>
                  {/* CENTRAL VECTOR LINE */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-32 bg-zinc-900 hidden md:block opacity-20" />
               </div>
            </div>

            {/* IMAGING HUB */}
            <div className="p-20 border-4 border-dashed border-zinc-900 bg-zinc-950/20 flex flex-col md:flex-row items-center justify-around gap-20 group/img relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-1000" />
               <button onClick={() => (document.getElementById('c') as any).click()} className="flex flex-col items-center gap-8 group/btn active:scale-90 transition-all">
                  <div className="w-40 h-40 border-4 border-zinc-800 rounded-3xl flex items-center justify-center bg-black group-hover/btn:border-cyan-500 group-hover/btn:shadow-[0_0_80px_rgba(6,182,212,0.3)] transition-all">
                    <span className="text-7xl group-hover/btn:scale-125 transition-transform">📷</span>
                  </div>
                  <span className="text-[12px] font-black tracking-[0.8em] text-zinc-800 uppercase group-hover/btn:text-white">Neural_Cam</span>
               </button>
               <button onClick={() => (document.getElementById('f') as any).click()} className="flex flex-col items-center gap-8 group/btn active:scale-90 transition-all">
                  <div className="w-40 h-40 border-4 border-zinc-800 rounded-3xl flex items-center justify-center bg-black group-hover/btn:border-cyan-500 group-hover/btn:shadow-[0_0_80px_rgba(6,182,212,0.3)] transition-all">
                    <span className="text-7xl group-hover/btn:scale-125 transition-transform">📂</span>
                  </div>
                  <span className="text-[12px] font-black tracking-[0.8em] text-zinc-800 uppercase group-hover/btn:text-white">Local_Vault</span>
               </button>
            </div>
          </main>

          {/* SIDEBAR: TELEMETRY UPLINK */}
          <aside className="col-span-12 lg:col-span-4 space-y-12">
             <div className="bg-zinc-950 p-12 border-2 border-zinc-900 relative shadow-2xl overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-[11px] font-black text-zinc-700 tracking-[1em] uppercase mb-12 italic">// Protocol_ID</h3>
                <div className="space-y-8">
                  {['pickup', 'delivery'].map(type => (
                    <label key={type} className={`flex items-center justify-between p-8 border-2 border-zinc-900 cursor-pointer transition-all ${bol === type ? 'bg-zinc-900 border-white text-white shadow-2xl' : 'hover:bg-white/5 text-zinc-800'}`}>
                      <span className="text-[13px] font-black uppercase tracking-[0.8em]">{type}</span>
                      <input type="radio" className="hidden" name="prot" onChange={() => setBol(type as any)} />
                      <div className={`w-5 h-5 rounded-full border-4 border-zinc-800 ${bol === type ? 'bg-white shadow-[0_0_20px_white]' : ''}`} />
                    </label>
                  ))}
                </div>
             </div>

             <div className="p-10 bg-zinc-950/20 border-2 border-zinc-900 min-h-[400px] relative overflow-hidden backdrop-blur-3xl">
                <h4 className="text-[10px] font-black text-zinc-700 tracking-[0.8em] uppercase mb-12 italic">// Bitstream_Preview</h4>
                <div className="grid grid-cols-2 gap-8">
                   {payload.map(f => (
                     <div key={f.id} className="aspect-[3/4] border-2 border-zinc-900 bg-black group overflow-hidden relative shadow-2xl">
                        <img src={f.preview} className="w-full h-full object-cover opacity-30 group-hover:opacity-100 transition-all duration-1000 grayscale hover:grayscale-0" />
                        <div className="absolute bottom-0 left-0 h-2 bg-cyan-500 shadow-[0_0_15px_cyan] transition-all" style={{ width: `${f.progress}%` }} />
                        <button onClick={() => setPayload(p => p.filter(x => x.id !== f.id))} className="absolute top-3 right-3 p-2 bg-red-600/20 text-red-600 opacity-0 group-hover:opacity-100 transition-all font-black text-xl">✕</button>
                     </div>
                   ))}
                   {payload.length === 0 && <div className="col-span-2 py-32 text-center text-zinc-900 uppercase font-black tracking-[2em] text-[12px] animate-pulse">NULL_PAYLOAD</div>}
                </div>
             </div>

             <button onClick={transmit} disabled={uplinkActive || payload.length === 0}
               className={`w-full py-24 text-[20px] font-black uppercase tracking-[2em] shadow-2xl transition-all relative overflow-hidden group ${payload.length > 0 ? 'bg-white text-black hover:bg-cyan-500 active:scale-95' : 'bg-zinc-900 text-zinc-700 pointer-events-none'}`}>
               <span className="relative z-10">{uplinkActive ? `SYNCING_${overallProgress}%` : 'EXECUTE'}</span>
               {uplinkActive && <div className="absolute inset-0 bg-zinc-800 transition-all" style={{ width: `${overallProgress}%` }} />}
             </button>
          </aside>
        </div>
      </div>

      {/* FINAL VERIFICATION OVERLAY */}
      {complete && (
        <div className="fixed inset-0 z-[1000] bg-black/99 flex flex-col items-center justify-center p-16 animate-in zoom-in-95 duration-1000">
           <div className="max-w-6xl w-full text-center space-y-32 relative">
              <div className="absolute -inset-80 bg-white/5 blur-[250px] rounded-full animate-pulse" />
              <div className="w-64 h-64 rounded-full border-8 border-white text-white mx-auto flex items-center justify-center text-9xl shadow-[0_0_200px_white] transition-all duration-1000 relative z-10">✓</div>
              <div className="space-y-12 relative z-10">
                 <h2 className="text-white text-[10rem] font-black italic tracking-tighter uppercase leading-none underline decoration-zinc-900 underline-offset-[40px] decoration-8">Transmitted</h2>
                 <p className="text-zinc-700 text-xl font-mono leading-relaxed uppercase tracking-[1em] max-w-4xl mx-auto font-black">Link secured. Packet reconciliation at 100%. Node disengaged.</p>
              </div>
              <button onClick={() => location.reload()} className="w-full py-16 border-8 border-zinc-900 text-zinc-600 text-4xl font-black uppercase tracking-[2em] hover:text-white transition-all relative z-10">TERMINATE</button>
           </div>
        </div>
      )}

      <input type="file" id="f" className="hidden" multiple onChange={handleIngest} />
      <input type="file" id="c" className="hidden" capture="environment" onChange={handleIngest} />

      <style>{`
        @keyframes reverse-spin { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        .animate-reverse-spin { animation: reverse-spin 2s linear infinite; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 20px; }
        select { -webkit-appearance: none; appearance: none; }
        select:focus { background-color: #09090b !important; }
      `}</style>
    </div>
  );
};

export default App;