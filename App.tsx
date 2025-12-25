import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * AURORA NEXUS v23.0 [APEX-PREDATOR EDITION]
 * -----------------------------------------------------------
 * DESIGN: Structural Brutalism / Obsidian-Glass
 * SOUND: Bi-aural Frequency Modulation (80Hz - 2200Hz)
 * ENGINE: Procedural SVG Filter Pipes / Firebase Titan-Gen
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

// --- ELITE FREQUENCY MODULATION ENGINE ---
const playFMResonance = (carrier: number, mod: number, dur = 0.5) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const c = ctx.createOscillator();
    const m = ctx.createOscillator();
    const g = ctx.createGain();
    const mg = ctx.createGain();

    c.type = 'sine'; m.type = 'square';
    c.frequency.value = carrier;
    m.frequency.value = mod;
    mg.gain.value = carrier / 2;

    m.connect(mg); mg.connect(c.frequency);
    c.connect(g); g.connect(ctx.destination);

    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

    c.start(); m.start();
    c.stop(ctx.currentTime + dur); m.stop(ctx.currentTime + dur);
  } catch (e) {}
};

// --- DYNAMIC UI ATOMS ---

const PanelBracket = ({ color }: { color: string }) => (
  <div className="absolute inset-0 pointer-events-none opacity-40 group-focus-within:opacity-100 transition-opacity duration-500">
    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: color }} />
    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: color }} />
    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: color }} />
    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: color }} />
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
  const [verified, setVerified] = useState(false);

  const theme = company === 'GLX' ? '#10b981' : company === 'BST' ? '#3b82f6' : '#6366f1';
  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  useEffect(() => {
    setTimeout(() => { setBooting(false); playFMResonance(110, 55, 0.8); }, 2200);
  }, []);

  const onIngest = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    playFMResonance(880, 220, 0.2);
    const newAssets = Array.from(e.target.files).map(f => ({
      id: crypto.randomUUID(), file: f, preview: URL.createObjectURL(f), progress: 0
    }));
    setPayload(p => [...p, ...newAssets]);
  };

  const transmit = async () => {
    if (payload.length === 0 || !driver) return;
    setSending(true);
    playFMResonance(40, 20, 1.2);

    const uploads = payload.map(async (item) => {
      const sRef = storageRef(storage, `apex_v23/${item.id}`);
      const task = uploadBytesResumable(sRef, item.file);
      return new Promise((res) => {
        task.on('state_changed', s => {
          const p = (s.bytesTransferred / s.totalBytes) * 100;
          setPayload(prev => prev.map(f => f.id === item.id ? { ...f, progress: p } : f));
          if (Math.round(p) % 25 === 0) playFMResonance(400 + p, 100, 0.1);
        }, null, async () => res(await getDownloadURL(task.snapshot.ref)));
      });
    });

    const urls = await Promise.all(uploads);
    await addDoc(collection(db, "apex_transmissions"), {
      op: driver, fleet: company, load: loadId, route: `${pu.city} to ${del.city}`, bol: bol, urls, ts: serverTimestamp()
    });
    setVerified(true);
    playFMResonance(1400, 700, 1.0);
  };

  if (booting) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono">
        <div className="w-64 h-64 border-2 border-zinc-900 rounded-full flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/10 animate-pulse" />
          <h2 className="text-white text-xs tracking-[1em] animate-pulse">BOOTING</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 font-orbitron p-8 md:p-16 relative overflow-hidden">
      {/* PROCEDURAL BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_center,_#fff_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-transparent to-black" />
      </div>

      <div className="max-w-[1500px] mx-auto relative z-10">
        <header className="flex flex-col lg:flex-row justify-between items-end border-b-2 border-zinc-900 pb-12 mb-16 gap-10">
          <div className="flex items-center gap-12 group">
             <div className="w-28 h-28 border-2 border-zinc-800 flex items-center justify-center text-5xl font-black bg-zinc-950 transition-all duration-700"
                  style={{ borderColor: theme, color: theme, boxShadow: `0 0 40px ${theme}22` }}>
               {company ? company[0] : 'Δ'}
             </div>
             <div className="space-y-3">
               <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">Apex_Predator_v23</h1>
               <p className="text-[10px] font-mono text-zinc-600 tracking-[0.8em] uppercase">Tactical_Enforcement_Node</p>
             </div>
          </div>
          <div className="flex gap-6">
            <div className="px-8 py-4 bg-zinc-950 border border-zinc-900 text-[10px] font-mono uppercase tracking-widest">
              Uplink: <span className="text-green-500 animate-pulse italic">Active</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-12">
          
          <main className="col-span-12 lg:col-span-8 space-y-12">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="relative p-10 bg-zinc-950/40 border border-zinc-900 group">
                  <PanelBracket color={theme} />
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-[0.5em] block mb-8 italic">// Fleet_Auth</label>
                  <select className="w-full bg-transparent border-none text-white text-xl outline-none font-black appearance-none cursor-pointer" value={company} onChange={e => { playFMResonance(400, 200); setCompany(e.target.value as any); }}>
                    <option value="">AWAITING_INPUT</option>
                    <option value="GLX">GREENLEAF_CORE</option>
                    <option value="BST">BST_COMMAND</option>
                  </select>
               </div>
               <div className="relative p-10 bg-zinc-950/40 border border-zinc-900 group">
                  <PanelBracket color={theme} />
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-[0.5em] block mb-8 italic">// Operator_Sig</label>
                  <input type="text" placeholder="LEGAL_NAME" className="w-full bg-transparent border-none text-white text-xl outline-none font-black" value={driver} onChange={e => setDriver(e.target.value)} />
               </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-12 border border-zinc-900 bg-zinc-950/40 backdrop-blur-xl group relative">
                  <PanelBracket color={theme} />
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-[0.6em] block mb-8 italic">// Load_Registry</label>
                  <input type="text" placeholder="REF_CODE" className="w-full bg-transparent border-none text-white text-xl outline-none font-black" value={loadId} onChange={e => setLoadId(e.target.value)} />
               </div>
               <div className="p-12 border border-zinc-900 bg-zinc-950/40 backdrop-blur-xl group relative">
                  <PanelBracket color={theme} />
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-[0.6em] block mb-8 italic">// Bol_Protocol</label>
                  <div className="flex gap-4">
                    {['pickup', 'delivery'].map(t => (
                      <button key={t} onClick={() => { playFMResonance(440, 110); setBol(t as any); }} 
                        className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border transition-all ${bol === t ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-600 hover:border-zinc-500'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
               </div>
            </section>

            <div className="p-20 border-2 border-zinc-900 bg-zinc-950 flex flex-col items-center gap-12 group relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
               <h3 className="text-[11px] font-black tracking-[1em] text-zinc-800 uppercase italic">Imaging_Sensor_Array</h3>
               <div className="flex gap-20 relative z-10">
                  <button onClick={() => (document.getElementById('c') as any).click()} className="flex flex-col items-center gap-6 group/btn transition-all active:scale-95">
                     <div className="w-32 h-32 border border-zinc-800 flex items-center justify-center bg-black group-hover/btn:border-cyan-500 group-hover/btn:shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                        <span className="text-6xl group-hover/btn:scale-110 transition-transform">📷</span>
                     </div>
                     <span className="text-[10px] font-black tracking-[0.6em] uppercase text-zinc-700 group-hover/btn:text-white">Neural_Cam</span>
                  </button>
                  <button onClick={() => (document.getElementById('f') as any).click()} className="flex flex-col items-center gap-6 group/btn transition-all active:scale-95">
                     <div className="w-32 h-32 border border-zinc-800 flex items-center justify-center bg-black group-hover/btn:border-cyan-500 group-hover/btn:shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                        <span className="text-6xl group-hover/btn:scale-110 transition-transform">📂</span>
                     </div>
                     <span className="text-[10px] font-black tracking-[0.6em] uppercase text-zinc-700 group-hover/btn:text-white">Local_Vault</span>
                  </button>
               </div>
            </div>
          </main>

          <aside className="col-span-12 lg:col-span-4 space-y-10">
             <div className="bg-zinc-950 p-10 border border-zinc-900 min-h-[400px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none" />
                <h4 className="text-[10px] font-black text-zinc-700 tracking-[0.8em] uppercase mb-10 italic">// Payload_Telemetry</h4>
                <div className="grid grid-cols-2 gap-6">
                   {payload.map(f => (
                     <div key={f.id} className="aspect-[3/4] bg-black border border-zinc-800 relative group overflow-hidden">
                        <img src={f.preview} className="w-full h-full object-cover opacity-20 group-hover:opacity-100 transition-opacity duration-1000 saturate-0 hover:saturate-150" />
                        <div className="absolute bottom-0 left-0 h-1 bg-cyan-500 shadow-[0_0_15px_cyan] transition-all duration-300" style={{ width: `${f.progress}%` }} />
                        <button onClick={() => setPayload(p => p.filter(x => x.id !== f.id))} className="absolute top-2 right-2 p-2 text-red-600 opacity-0 group-hover:opacity-100 transition-all font-black hover:scale-110 text-xl">✕</button>
                     </div>
                   ))}
                   {payload.length === 0 && <div className="col-span-2 py-32 text-center text-zinc-900 uppercase font-black tracking-widest text-[11px] animate-pulse">NULL_PAYLOAD</div>}
                </div>
             </div>

             <button onClick={transmit} disabled={sending || payload.length === 0}
               className={`w-full py-20 text-[18px] font-black uppercase tracking-[1.5em] transition-all relative overflow-hidden shadow-2xl ${payload.length > 0 ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-zinc-800 pointer-events-none'}`}>
               <span className="relative z-10">{sending ? 'SYNCHRONIZING...' : 'EXECUTE_UPLINK'}</span>
               {sending && <div className="absolute inset-0 bg-zinc-800 animate-pulse" />}
             </button>
          </aside>
        </div>
      </div>

      {verified && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-16 animate-in fade-in duration-1000">
           <div className="max-w-4xl w-full text-center space-y-24 relative">
              <div className="absolute -inset-80 bg-white/5 blur-[200px] rounded-full" />
              <div className="w-64 h-64 border-8 border-white text-white mx-auto flex items-center justify-center text-9xl relative z-10 animate-pulse">✓</div>
              <div className="space-y-8 relative z-10">
                 <h2 className="text-white text-8xl font-black italic tracking-tighter uppercase underline decoration-zinc-900 underline-offset-[30px] decoration-8">Transmitted</h2>
                 <p className="text-zinc-700 text-sm font-mono leading-relaxed uppercase tracking-[0.8em] max-w-2xl mx-auto">Neural handshake confirmed. Global logistics registry updated. You are authorized to disengage.</p>
              </div>
              <button onClick={() => location.reload()} className="w-full py-12 border-4 border-zinc-900 text-zinc-600 text-xl font-black uppercase tracking-[1.5em] hover:text-white transition-all relative z-10">DISENGAGE</button>
           </div>
        </div>
      )}

      <input type="file" id="f" className="hidden" multiple onChange={onIngest} />
      <input type="file" id="c" className="hidden" capture="environment" onChange={onIngest} />
    </div>
  );
};

export default App;