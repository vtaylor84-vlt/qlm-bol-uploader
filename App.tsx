import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * NEURAL-VANTABLACK v28.0 [BEYOND SINGULARITY]
 * -----------------------------------------------------------
 * DESIGN: Refractive Brutalism / Obsidian-Core
 * SOUND: Neural-Circuit Waveforms (Simulated)
 * ENGINE: Procedural Canvas Ray-Tracing / Firebase Prime
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

// --- 2026 NEURAL HAPTIC SYNTHESIS ---
const playNeuralDischarge = (freq: number, harmonics = true) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const noise = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    if (harmonics) {
      noise.type = 'sawtooth';
      noise.frequency.setValueAtTime(freq / 2, ctx.currentTime);
      noise.connect(gain);
    }

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    if (harmonics) noise.start();
    osc.stop(ctx.currentTime + 0.3);
    if (harmonics) noise.stop(ctx.currentTime + 0.3);
  } catch (e) {}
};

// --- DYNAMIC UI ATOMS ---

const TacticalFrame = ({ active, color }: { active: boolean; color: string }) => (
  <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 ${active ? 'opacity-100' : 'opacity-20'}`}>
    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: color }} />
    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-l-2 rotate-180" style={{ borderColor: color }} />
    <div className={`absolute inset-0 border border-white/5 ${active ? 'bg-white/[0.02]' : ''}`} />
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
  const [assets, setAssets] = useState<any[]>([]);
  const [transmitting, setTransmitting] = useState(false);
  const [done, setDone] = useState(false);

  const theme = company === 'GLX' ? '#10b981' : company === 'BST' ? '#a855f7' : '#0ea5e9';
  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  useEffect(() => {
    setTimeout(() => { setBooting(false); playNeuralDischarge(60); }, 3000);
  }, []);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    playNeuralDischarge(1200, false);
    const files = Array.from(e.target.files).map(f => ({
      id: crypto.randomUUID(), file: f, preview: URL.createObjectURL(f), progress: 0
    }));
    setAssets(prev => [...prev, ...files]);
  };

  const uplink = async () => {
    if (assets.length === 0 || !driver) return;
    setTransmitting(true);
    playNeuralDischarge(40);

    const promises = assets.map(async (item) => {
      const sRef = storageRef(storage, `prime_v28/${item.id}`);
      const task = uploadBytesResumable(sRef, item.file);
      return new Promise((res) => {
        task.on('state_changed', s => {
          const p = (s.bytesTransferred / s.totalBytes) * 100;
          setAssets(prev => prev.map(a => a.id === item.id ? { ...a, progress: p } : a));
          if (p % 20 === 0) playNeuralDischarge(300 + p, false);
        }, null, async () => res(await getDownloadURL(task.snapshot.ref)));
      });
    });

    const urls = await Promise.all(promises);
    await addDoc(collection(db, "prime_logs"), {
      operator: driver, fleet: company, load: loadId, route: `${pu.city} to ${del.city}`, bol, urls, ts: serverTimestamp()
    });
    setDone(true);
  };

  if (booting) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-orbitron overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/40 via-black to-zinc-900/40" />
        <div className="relative text-center z-10 space-y-8">
           <h1 className="text-white text-4xl font-black tracking-[1.5em] animate-pulse">PRIME_BOOT</h1>
           <div className="w-64 h-[1px] bg-zinc-800 mx-auto overflow-hidden">
              <div className="h-full bg-cyan-500 animate-[loading_2s_infinite]" />
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-300 font-orbitron p-6 md:p-12 relative overflow-x-hidden selection:bg-white selection:text-black">
      {/* 2026 DEPTH GRID */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-0 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <div className="max-w-[1600px] mx-auto relative z-10">
        
        {/* HEADER: NEURAL HUB */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-zinc-900 pb-16 mb-16 gap-10">
           <div className="flex items-center gap-16 group">
              <div className="w-28 h-28 border-2 flex items-center justify-center text-5xl font-black transition-all duration-1000 bg-black relative overflow-hidden"
                   style={{ borderColor: theme, color: theme, boxShadow: `0 0 50px ${theme}33` }}>
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
                {company ? company[0] : 'Ψ'}
              </div>
              <div className="space-y-4">
                <h1 className="text-8xl font-black text-white italic tracking-tighter uppercase leading-none">Nexus_v28</h1>
                <div className="flex gap-8 text-[10px] font-mono text-zinc-700 tracking-[0.8em] uppercase">
                  <span>Latency: 4ms</span>
                  <span className="text-cyan-500 animate-ping">● Sync</span>
                </div>
              </div>
           </div>
           <button onClick={() => location.reload()} className="px-10 py-4 border border-zinc-800 text-zinc-600 text-xs font-black uppercase tracking-[0.5em] hover:text-white transition-all duration-500">Recalibrate_Node</button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* PRIMARY DECK */}
          <main className="lg:col-span-8 space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <div className="relative p-10 bg-zinc-950/80 group">
                  <TacticalFrame active={!!company} color={theme} />
                  <label className="text-[11px] font-black uppercase text-zinc-600 tracking-[0.6em] block mb-8 italic">Fleet_Auth</label>
                  <select 
                    className="w-full bg-black border-2 border-zinc-900 p-6 text-white text-lg font-black outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                    style={{ colorScheme: 'dark' }}
                    value={company} 
                    onChange={e => { playNeuralDischarge(400); setCompany(e.target.value as any); }}
                  >
                    <option value="">AWAITING</option>
                    <option value="GLX">GLX_PRIME</option>
                    <option value="BST">BST_SINGULARITY</option>
                  </select>
               </div>
               <div className="relative p-10 bg-zinc-950/80 group">
                  <TacticalFrame active={!!driver} color={theme} />
                  <label className="text-[11px] font-black uppercase text-zinc-600 tracking-[0.6em] block mb-8 italic">Operator</label>
                  <input type="text" placeholder="ID_SIGN" className="w-full bg-black border-2 border-zinc-900 p-6 text-white text-lg font-black outline-none focus:border-cyan-500 placeholder-zinc-900 transition-all" value={driver} onChange={e => setDriver(e.target.value)} />
               </div>
               <div className="relative p-10 bg-zinc-950/80 group">
                  <TacticalFrame active={!!loadId} color={theme} />
                  <label className="text-[11px] font-black uppercase text-zinc-600 tracking-[0.6em] block mb-8 italic">Manifest</label>
                  <input type="text" placeholder="REF_HASH" className="w-full bg-black border-2 border-zinc-900 p-6 text-white text-lg font-black outline-none focus:border-cyan-500 placeholder-zinc-900 transition-all" value={loadId} onChange={e => setLoadId(e.target.value)} />
               </div>
            </div>

            {/* VECTOR MODULE */}
            <div className="p-16 border border-zinc-900 bg-zinc-950 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent opacity-20" />
               <h3 className="text-xs font-black text-zinc-800 tracking-[1.5em] uppercase mb-12 italic">// Routing_Vector</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                  <div className="space-y-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-zinc-700 tracking-[0.5em] block ml-1 uppercase">Origin</label>
                       <div className="flex gap-4">
                          <input type="text" placeholder="CITY" className="flex-1 bg-black border border-zinc-900 p-6 text-sm text-white outline-none focus:border-cyan-500" value={pu.city} onChange={e => setPu({...pu, city: e.target.value})} />
                          <select className="w-24 bg-black border border-zinc-900 p-6 text-sm text-white outline-none" value={pu.st} onChange={e => setPu({...pu, st: e.target.value})}>
                            <option value="">--</option>{states.map(s => <option key={s} className="bg-zinc-950">{s}</option>)}
                          </select>
                       </div>
                    </div>
                  </div>
                  <div className="space-y-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-zinc-700 tracking-[0.5em] block ml-1 uppercase">Terminus</label>
                       <div className="flex gap-4">
                          <input type="text" placeholder="CITY" className="flex-1 bg-black border border-zinc-900 p-6 text-sm text-white outline-none focus:border-cyan-500" value={del.city} onChange={e => setDel({...del, city: e.target.value})} />
                          <select className="w-24 bg-black border border-zinc-900 p-6 text-sm text-white outline-none" value={del.st} onChange={e => setDel({...del, st: e.target.value})}>
                            <option value="">--</option>{states.map(s => <option key={s} className="bg-zinc-950">{s}</option>)}
                          </select>
                       </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* IMAGE CAPTURE HUB */}
            <div className="p-24 border border-zinc-900 bg-zinc-950/40 flex flex-col md:flex-row items-center justify-around gap-20 group relative overflow-hidden">
               <div className="absolute inset-0 bg-white/[0.01] animate-pulse" />
               <button onClick={() => (document.getElementById('c') as any).click()} className="flex flex-col items-center gap-10 group/btn transition-transform active:scale-95">
                  <div className="w-40 h-40 border border-zinc-800 rounded-full flex items-center justify-center bg-black group-hover/btn:border-cyan-500 group-hover/btn:shadow-[0_0_80px_rgba(6,182,212,0.2)] transition-all duration-700 relative overflow-hidden">
                    <span className="text-7xl grayscale group-hover/btn:grayscale-0 transition-all z-10">📷</span>
                    <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-1000" />
                  </div>
                  <span className="text-[12px] font-black tracking-[0.8em] text-zinc-700 uppercase group-hover/btn:text-white">Neural_Cam</span>
               </button>
               <button onClick={() => (document.getElementById('f') as any).click()} className="flex flex-col items-center gap-10 group/btn transition-transform active:scale-95">
                  <div className="w-40 h-40 border border-zinc-800 rounded-full flex items-center justify-center bg-black group-hover/btn:border-cyan-500 group-hover/btn:shadow-[0_0_80px_rgba(6,182,212,0.2)] transition-all duration-700 relative overflow-hidden">
                    <span className="text-7xl grayscale group-hover/btn:grayscale-0 transition-all z-10">📁</span>
                    <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-1000" />
                  </div>
                  <span className="text-[12px] font-black tracking-[0.8em] text-zinc-700 uppercase group-hover/btn:text-white">Vault_Entry</span>
               </button>
            </div>
          </main>

          {/* SIDEBAR: ACTION NODE */}
          <aside className="lg:col-span-4 space-y-16">
             <div className="bg-zinc-950 p-12 border border-zinc-900 shadow-2xl relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full bg-cyan-500 opacity-20" />
                <h3 className="text-[11px] font-black text-zinc-700 tracking-[0.8em] uppercase mb-12 italic">// Logic_Protocol</h3>
                <div className="space-y-10">
                  {['pickup', 'delivery'].map(type => (
                    <label key={type} className={`flex items-center justify-between p-10 border border-zinc-900 cursor-pointer transition-all ${bol === type ? 'bg-zinc-900 border-white text-white shadow-2xl' : 'hover:bg-white/5 text-zinc-800'}`}>
                      <span className="text-[16px] font-black uppercase tracking-[1em]">{type}</span>
                      <input type="radio" className="hidden" name="prot" onChange={() => setBol(type as any)} />
                      <div className={`w-6 h-6 rounded-full border border-zinc-800 ${bol === type ? 'bg-white shadow-[0_0_30px_white]' : ''}`} />
                    </label>
                  ))}
                </div>
             </div>

             <div className="p-12 border border-zinc-900 bg-zinc-950/40 backdrop-blur-3xl min-h-[400px] relative overflow-hidden">
                <h4 className="text-[11px] font-black text-zinc-700 tracking-[0.8em] uppercase mb-12 italic">// Buffer_Stream</h4>
                <div className="grid grid-cols-2 gap-10">
                   {assets.map(f => (
                     <div key={f.id} className="aspect-[3/4] border border-zinc-900 bg-black group overflow-hidden relative shadow-inner">
                        <img src={f.preview} className="w-full h-full object-cover opacity-20 group-hover:opacity-100 transition-all duration-1000 grayscale hover:grayscale-0" />
                        <div className="absolute bottom-0 left-0 h-1 bg-cyan-500 shadow-[0_0_20px_cyan] transition-all" style={{ width: `${f.progress}%` }} />
                        <button onClick={() => setAssets(p => p.filter(x => x.id !== f.id))} className="absolute top-4 right-4 p-3 bg-red-600/20 text-red-600 opacity-0 group-hover:opacity-100 transition-all font-black text-xl hover:bg-red-600 hover:text-white">✕</button>
                     </div>
                   ))}
                   {assets.length === 0 && <div className="col-span-2 py-40 text-center text-zinc-900 uppercase font-black tracking-[2em] text-[14px] animate-pulse italic">EMPTY_SILO</div>}
                </div>
             </div>

             <button onClick={uplink} disabled={transmitting || assets.length === 0}
               className={`w-full py-24 text-[24px] font-black uppercase tracking-[1.5em] shadow-2xl transition-all relative overflow-hidden group ${assets.length > 0 ? 'bg-white text-black hover:invert active:scale-95' : 'bg-zinc-900 text-zinc-700 pointer-events-none'}`}>
               <span className="relative z-10 tracking-[0.8em]">{transmitting ? 'TRANSMITTING' : 'EXECUTE'}</span>
               {transmitting && <div className="absolute inset-0 bg-zinc-800 transition-all" style={{ width: `${overallProgress}%` }} />}
             </button>
          </aside>
        </div>
      </div>

      {done && (
        <div className="fixed inset-0 z-[1000] bg-black/99 flex flex-col items-center justify-center p-16 animate-in fade-in duration-1000">
           <div className="max-w-6xl w-full text-center space-y-40 relative">
              <div className="absolute -inset-80 bg-cyan-500/5 blur-[300px] rounded-full animate-pulse" />
              <div className="w-80 h-80 rounded-full border-4 border-white text-white mx-auto flex items-center justify-center text-9xl shadow-[0_0_250px_white] transition-all duration-1000 relative z-10">✓</div>
              <div className="space-y-16 relative z-10">
                 <h2 className="text-white text-[12rem] font-black italic tracking-tighter uppercase leading-none underline decoration-zinc-900 underline-offset-[40px] decoration-8">Verified</h2>
                 <p className="text-zinc-700 text-2xl font-mono leading-relaxed uppercase tracking-[1em] max-w-4xl mx-auto font-black italic">Transmission Complete. You are authorized to proceed to next node.</p>
              </div>
              <button onClick={() => location.reload()} className="w-full py-16 border-8 border-zinc-900 text-zinc-600 text-5xl font-black uppercase tracking-[2em] hover:text-white transition-all relative z-10">TERMINATE</button>
           </div>
        </div>
      )}

      <input type="file" id="f" className="hidden" multiple onChange={onUpload} />
      <input type="file" id="c" className="hidden" capture="environment" onChange={onUpload} />

      <style>{`
        @keyframes loading { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #222; }
        select { -webkit-appearance: none; appearance: none; }
        select:focus { background-color: #09090b !important; }
      `}</style>
    </div>
  );
};

export default App;