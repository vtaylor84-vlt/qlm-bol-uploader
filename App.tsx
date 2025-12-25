import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * TITAN-FORGE v24.0 [TACTICAL ROUTE EDITION]
 * -----------------------------------------------------------
 * DESIGN: Obsidian Brutalism / High-Contrast UX
 * ENGINE: React 18 / Firebase Quantum-SDK
 * UX: Inverted Selection Matrix / Kinetic Route Mapping
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

// --- TACTICAL AUDIO CORE ---
const playRouteSync = (progress: number) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(100 + (progress * 5), ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
};

// --- ELITE UI ATOMS ---

const TacticalInput = ({ label, ...props }: any) => (
  <div className="space-y-3 group w-full">
    <div className="flex justify-between items-center px-1">
      <label className="text-[10px] font-black uppercase tracking-[0.8em] text-zinc-600 group-focus-within:text-cyan-400 transition-colors">
        {label}
      </label>
      <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 border border-zinc-800 group-focus-within:bg-cyan-500 group-focus-within:shadow-[0_0_8px_cyan]" />
    </div>
    <input 
      {...props}
      className="w-full bg-zinc-950/80 border border-zinc-800 p-5 text-sm font-mono text-white outline-none focus:border-cyan-500/50 focus:bg-zinc-900/20 transition-all"
    />
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
  const [sending, setSending] = useState(false);
  const [complete, setComplete] = useState(false);

  const theme = company === 'GLX' ? '#10b981' : company === 'BST' ? '#3b82f6' : '#6366f1';
  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  useEffect(() => {
    setTimeout(() => setBooting(false), 2000);
  }, []);

  const overallProgress = useMemo(() => 
    payload.length ? Math.round(payload.reduce((s, f) => s + (f.progress || 0), 0) / payload.length) : 0, [payload]);

  const onIngest = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const assets = Array.from(e.target.files).map(f => ({
      id: crypto.randomUUID(), file: f, preview: URL.createObjectURL(f), progress: 0
    }));
    setPayload(p => [...p, ...assets]);
  };

  const transmit = async () => {
    if (payload.length === 0 || !driver || !pu.city || !del.city) return;
    setSending(true);
    const uploads = payload.map(async (item) => {
      const sRef = storageRef(storage, `titan_v24/${item.id}`);
      const task = uploadBytesResumable(sRef, item.file);
      return new Promise((res) => {
        task.on('state_changed', s => {
          const p = (s.bytesTransferred / s.totalBytes) * 100;
          setPayload(prev => prev.map(f => f.id === item.id ? { ...f, progress: p } : f));
        }, null, async () => res(await getDownloadURL(task.snapshot.ref)));
      });
    });
    const urls = await Promise.all(uploads);
    await addDoc(collection(db, "titan_logistics"), {
      op: driver, fleet: company, load: loadId, route: `${pu.city}, ${pu.st} -> ${del.city}, ${del.st}`, bol, urls, ts: serverTimestamp()
    });
    setComplete(true);
  };

  if (booting) {
    return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-zinc-800 text-[10px] tracking-[1.5em] animate-pulse uppercase italic">Synchronizing_Neural_Node</div>;
  }

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 font-orbitron p-6 md:p-12 relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {/* HUD OVERLAY */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-0" style={{ backgroundImage: `radial-gradient(${theme} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      
      <div className="max-w-[1500px] mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-end border-b border-zinc-900 pb-12 mb-12 gap-8">
           <div className="flex items-center gap-12 group">
              <div className="w-24 h-24 border-2 flex items-center justify-center text-4xl font-black transition-all duration-700 bg-zinc-950"
                   style={{ borderColor: theme, color: theme, boxShadow: `0 0 40px ${theme}22` }}>
                {company ? company[0] : 'Σ'}
              </div>
              <div className="space-y-3">
                <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase">Titan_Forge_v24</h1>
                <p className="text-[10px] font-mono text-zinc-700 tracking-[0.8em] uppercase italic">Deployment_ID: {Math.random().toString(16).substring(2,10).toUpperCase()}</p>
              </div>
           </div>
           <button onClick={() => location.reload()} className="px-8 py-3 border border-zinc-800 text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] hover:text-white transition-all">Recalibrate</button>
        </header>

        <div className="grid grid-cols-12 gap-12">
          {/* MAIN INPUT MATRIX */}
          <main className="col-span-12 lg:col-span-8 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3 group">
                  <label className="text-[10px] font-black uppercase tracking-[0.8em] text-zinc-600">Fleet_Auth</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-zinc-950 border border-zinc-800 p-5 text-white text-sm outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer"
                      style={{ colorScheme: 'dark' }} // Native support for dark dropdowns
                      value={company} 
                      onChange={e => { playRouteSync(50); setCompany(e.target.value as any); }}
                    >
                      <option value="" className="bg-zinc-900">VOID_SELECT</option>
                      <option value="GLX" className="bg-zinc-900">GREENLEAF_XPRESS</option>
                      <option value="BST" className="bg-zinc-900">BST_TITAN_NODE</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-700 text-xs">▼</div>
                  </div>
               </div>
               <TacticalInput label="Operator_Signature" type="text" placeholder="LEGAL_NAME" value={driver} onChange={(e: any) => setDriver(e.target.value)} />
            </div>

            {/* KINETIC ROUTE MODULE */}
            <div className="bg-zinc-950/40 border border-zinc-900 p-12 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/5 to-transparent" />
               <h3 className="text-[11px] font-black text-zinc-700 tracking-[1em] uppercase mb-12 italic">// Routing_Vectors</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                  <div className="space-y-6">
                    <TacticalInput label="Origin_City" type="text" placeholder="PICKUP_LOCATION" value={pu.city} onChange={(e: any) => { setPu({...pu, city: e.target.value}); playRouteSync(10); }} />
                    <div className="relative space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-zinc-700 ml-1">ST_Code</label>
                       <select className="w-full bg-zinc-900 border border-zinc-800 p-4 text-white text-sm outline-none appearance-none" value={pu.st} onChange={e => setPu({...pu, st: e.target.value})}>
                          <option value="">SELECT</option>{states.map(s => <option key={s} className="bg-zinc-900">{s}</option>)}
                       </select>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <TacticalInput label="Terminus_City" type="text" placeholder="DELIVERY_LOCATION" value={del.city} onChange={(e: any) => { setDel({...del, city: e.target.value}); playRouteSync(90); }} />
                    <div className="relative space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-zinc-700 ml-1">ST_Code</label>
                       <select className="w-full bg-zinc-900 border border-zinc-800 p-4 text-white text-sm outline-none appearance-none" value={del.st} onChange={e => setDel({...del, st: e.target.value})}>
                          <option value="">SELECT</option>{states.map(s => <option key={s} className="bg-zinc-900">{s}</option>)}
                       </select>
                    </div>
                  </div>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-24 bg-zinc-800 hidden md:block opacity-20" />
               </div>
            </div>

            {/* IMAGING INTERFACE */}
            <div className="p-16 border-2 border-zinc-900 bg-zinc-950 flex flex-col md:flex-row items-center justify-around gap-16 group/img relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-1000" />
               <button onClick={() => (document.getElementById('c') as any).click()} className="flex flex-col items-center gap-6 group/btn active:scale-95 transition-all">
                  <div className="w-28 h-28 border border-zinc-800 flex items-center justify-center bg-black group-hover/btn:border-cyan-500 group-hover/btn:shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                    <span className="text-5xl grayscale group-hover/btn:grayscale-0 transition-all">📸</span>
                  </div>
                  <span className="text-[9px] font-black tracking-[0.5em] text-zinc-800 uppercase group-hover/btn:text-white">Neural_Cam</span>
               </button>
               <div className="h-20 w-px bg-zinc-900 hidden md:block" />
               <button onClick={() => (document.getElementById('f') as any).click()} className="flex flex-col items-center gap-6 group/btn active:scale-95 transition-all">
                  <div className="w-28 h-28 border border-zinc-800 flex items-center justify-center bg-black group-hover/btn:border-cyan-500 group-hover/btn:shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                    <span className="text-5xl grayscale group-hover/btn:grayscale-0 transition-all">📂</span>
                  </div>
                  <span className="text-[9px] font-black tracking-[0.5em] text-zinc-800 uppercase group-hover/btn:text-white">Local_Vault</span>
               </button>
            </div>
          </main>

          {/* SIDEBAR: TELEMETRY UPLINK */}
          <aside className="col-span-12 lg:col-span-4 space-y-10">
             <div className="bg-zinc-950 p-10 border border-zinc-900 relative shadow-2xl">
                <h3 className="text-[10px] font-black text-zinc-700 tracking-[0.8em] uppercase mb-10 italic">// Protocol</h3>
                <div className="space-y-6">
                  {['pickup', 'delivery'].map(type => (
                    <label key={type} className={`flex items-center justify-between p-6 border border-zinc-900 cursor-pointer transition-all ${bol === type ? 'bg-zinc-900 border-white text-white' : 'hover:bg-white/5 text-zinc-700'}`}>
                      <span className="text-[11px] font-black uppercase tracking-[0.6em]">{type}</span>
                      <input type="radio" className="hidden" name="mode" onChange={() => setBol(type as any)} />
                      <div className={`w-3 h-3 rounded-full border border-zinc-800 ${bol === type ? 'bg-white shadow-[0_0_15px_white]' : ''}`} />
                    </label>
                  ))}
                </div>
             </div>

             <div className="p-10 bg-zinc-950/20 border border-zinc-900 min-h-[300px] relative overflow-hidden backdrop-blur-3xl">
                <h4 className="text-[10px] font-black text-zinc-800 tracking-[0.6em] uppercase mb-10 italic">// Payload_Scan</h4>
                <div className="grid grid-cols-2 gap-6">
                   {payload.map(f => (
                     <div key={f.id} className="aspect-[3/4] border border-zinc-900 bg-black group overflow-hidden relative">
                        <img src={f.preview} className="w-full h-full object-cover opacity-30 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 h-1 bg-cyan-500 shadow-[0_0_10px_cyan] transition-all" style={{ width: `${f.progress}%` }} />
                        <button onClick={() => setPayload(p => p.filter(x => x.id !== f.id))} className="absolute top-2 right-2 p-2 bg-red-600/20 text-red-600 opacity-0 group-hover:opacity-100 transition-all font-black text-xs">✕</button>
                     </div>
                   ))}
                   {payload.length === 0 && <div className="col-span-2 py-24 text-center text-zinc-900 uppercase font-black tracking-[1.5em] text-[10px] animate-pulse">Waiting_For_Payload</div>}
                </div>
             </div>

             <button onClick={transmit} disabled={sending || payload.length === 0}
               className={`w-full py-16 text-[15px] font-black uppercase tracking-[1.5em] shadow-2xl transition-all relative overflow-hidden group ${payload.length > 0 ? 'bg-white text-black hover:bg-zinc-200 active:scale-95' : 'bg-zinc-900 text-zinc-700 pointer-events-none'}`}>
               <span className="relative z-10">{sending ? `SYNC_PACKETS_${overallProgress}%` : 'Execute_Uplink'}</span>
               {sending && <div className="absolute inset-0 bg-zinc-800 transition-all" style={{ width: `${overallProgress}%` }} />}
             </button>
          </aside>
        </div>
      </div>

      {/* FINAL VERIFICATION SEQUENCE */}
      {complete && (
        <div className="fixed inset-0 z-[1000] bg-black/99 flex flex-col items-center justify-center p-12 animate-in fade-in duration-1000">
           <div className="max-w-4xl w-full text-center space-y-24 relative">
              <div className="w-44 h-44 rounded-full border-8 border-white text-white mx-auto flex items-center justify-center text-8xl shadow-[0_0_150px_white] transition-all duration-1000">✓</div>
              <div className="space-y-8">
                 <h2 className="text-white text-8xl font-black italic tracking-tighter uppercase underline decoration-zinc-900 underline-offset-[28px] decoration-8">Transmitted</h2>
                 <p className="text-zinc-700 text-sm font-mono leading-relaxed uppercase tracking-[0.8em] max-w-2xl mx-auto">Neural handshake confirmed. Packet-loss 0%. Global logistics registry updated. You are authorized to disengage.</p>
              </div>
              <button onClick={() => location.reload()} className="w-full py-10 border-4 border-zinc-900 text-zinc-600 text-xl font-black uppercase tracking-[1.5em] hover:text-white transition-all relative z-10">DISENGAGE</button>
           </div>
        </div>
      )}

      <input type="file" id="f" className="hidden" multiple onChange={onIngest} />
      <input type="file" id="c" className="hidden" capture="environment" onChange={onIngest} />

      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #111; }
        select { -webkit-appearance: none; appearance: none; }
        select:focus { background-color: #09090b !important; }
      `}</style>
    </div>
  );
};

export default App;