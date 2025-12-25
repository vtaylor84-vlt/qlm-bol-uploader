import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * TITAN-FORGE v30.0 [NEURAL-AMBIENCE EDITION]
 * -----------------------------------------------------------
 * DESIGN: Chroma-Reactive Environmental HUD
 * ENGINE: React 18 / Web Audio API / Firebase Titan
 * UX: Persistent Neon Handshake / Priority Flow
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

// --- MULTI-CHANNEL ACOUSTIC ENGINE ---
const playSound = (type: 'SELECT' | 'LOCK' | 'UPLOAD' | 'SUCCESS') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    const sounds = {
      SELECT: { freq: 150, type: 'sine' as OscillatorType, dur: 0.2 },
      LOCK: { freq: 880, type: 'triangle' as OscillatorType, dur: 0.1 },
      UPLOAD: { freq: 1200, type: 'square' as OscillatorType, dur: 0.05 },
      SUCCESS: { freq: 440, type: 'sine' as OscillatorType, dur: 1.2 }
    };

    const s = sounds[type];
    osc.type = s.type;
    osc.frequency.setValueAtTime(s.freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s.dur);
    
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + s.dur);
  } catch (e) {}
};

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

  // BRAND LOGIC
  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const theme = isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#27272a';
  const themeGlow = isGLX ? 'rgba(34,197,94,0.3)' : isBST ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)';
  
  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  useEffect(() => {
    setTimeout(() => { setBooting(false); playSound('SUCCESS'); }, 2000);
  }, []);

  const handleIngest = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    playSound('UPLOAD');
    const assets = Array.from(e.target.files).map(f => ({
      id: crypto.randomUUID(), file: f, preview: URL.createObjectURL(f), progress: 0
    }));
    setPayload(p => [...p, ...assets]);
  };

  const transmit = async () => {
    if (payload.length === 0 || !driver) return;
    setSending(true);
    const uploads = payload.map(async (item) => {
      const sRef = storageRef(storage, `nebula_v30/${item.id}`);
      const task = uploadBytesResumable(sRef, item.file);
      return new Promise((res) => {
        task.on('state_changed', s => {
          const p = (s.bytesTransferred / s.totalBytes) * 100;
          setPayload(prev => prev.map(f => f.id === item.id ? { ...f, progress: p } : f));
        }, null, async () => res(await getDownloadURL(task.snapshot.ref)));
      });
    });
    const urls = await Promise.all(uploads);
    await addDoc(collection(db, "nebula_uplink"), { op: driver, fleet: company, route: `${pu.city} to ${del.city}`, bol, urls, ts: serverTimestamp() });
    setComplete(true);
  };

  // STYLE COMPOSERS
  const glowClass = (val: any) => val ? `shadow-[0_0_25px_${themeGlow}] border-${isGLX ? 'green' : isBST ? 'blue' : 'zinc'}-500` : 'border-zinc-800';

  if (booting) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-zinc-800 text-[10px] tracking-[2em] animate-pulse">BOOT_NEURAL_AMBIENCE</div>;

  return (
    <div className={`min-h-screen transition-colors duration-1000 bg-[#020202] text-zinc-400 font-orbitron p-4 md:p-12 relative overflow-x-hidden`} style={{ backgroundColor: company ? `${theme}05` : '#020202' } as any}>
      
      {/* ENVIRONMENTAL REACTIVE LAYER */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${company ? 'opacity-40' : 'opacity-10'}`} 
           style={{ background: `radial-gradient(circle at center, ${theme}11 0%, transparent 70%)` }} />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(${theme} 1px, transparent 1px), linear-gradient(90deg, ${theme} 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />

      <div className="max-w-[1500px] mx-auto relative z-10">
        <header className="flex flex-col lg:flex-row justify-between items-end border-b border-zinc-900 pb-12 mb-12 gap-8">
           <div className="flex items-center gap-12 group">
              <div className={`w-28 h-28 border-4 flex items-center justify-center text-5xl font-black transition-all duration-1000 bg-black ${glowClass(company)}`}>
                {company ? company[0] : 'Σ'}
              </div>
              <div className="space-y-3">
                <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">Nexus_v30</h1>
                <p className={`text-[10px] font-mono tracking-[1em] uppercase transition-colors duration-1000 ${company ? `text-${isGLX?'green':'blue'}-400` : 'text-zinc-700'}`}>
                  {company ? `${company}_CHANNEL_LOCKED` : 'Awaiting_Handshake'}
                </p>
              </div>
           </div>
        </header>

        <div className="grid grid-cols-12 gap-12">
          {/* MAIN COLUMN */}
          <main className="col-span-12 lg:col-span-8 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className={`p-8 bg-zinc-950/80 border transition-all duration-500 group ${glowClass(company)}`}>
                  <label className="text-[10px] font-black uppercase tracking-[1em] text-zinc-600 block mb-6 italic">// Fleet_Auth</label>
                  <select className="w-full bg-transparent border-none text-white text-xl outline-none font-black appearance-none cursor-pointer" 
                          style={{ colorScheme: 'dark' }} value={company} onChange={e => { playSound('SELECT'); setCompany(e.target.value as any); }}>
                    <option value="">VOID_SELECT</option>
                    <option value="GLX" className="text-green-500">GREENLEAF_XPRESS</option>
                    <option value="BST" className="text-blue-500">BST_EXPEDITE</option>
                  </select>
               </div>
               <div className={`p-8 bg-zinc-950/80 border transition-all duration-500 group ${glowClass(driver)}`}>
                  <label className="text-[10px] font-black uppercase tracking-[1em] text-zinc-600 block mb-6 italic">// Operator_ID</label>
                  <input type="text" placeholder="LEGAL_NAME" className="w-full bg-transparent border-none text-white text-xl outline-none font-black" 
                         value={driver} onBlur={() => driver && playSound('LOCK')} onChange={e => setDriver(e.target.value)} />
               </div>
            </div>

            <div className={`p-12 bg-zinc-950/40 border transition-all duration-700 relative overflow-hidden ${glowClass(pu.city && del.city)}`}>
               <h3 className="text-[11px] font-black text-zinc-700 tracking-[1.5em] uppercase mb-12 italic">// Routing_Network</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                  <div className="space-y-6">
                    <input type="text" placeholder="ORIGIN_CITY" className="w-full bg-black border border-zinc-900 p-6 text-sm text-white outline-none focus:border-white/20" 
                           value={pu.city} onBlur={() => pu.city && playSound('LOCK')} onChange={e => setPu({...pu, city: e.target.value})} />
                    <select className="w-full bg-black border border-zinc-900 p-4 text-white text-sm outline-none" style={{ colorScheme: 'dark' }} 
                            value={pu.st} onChange={e => setPu({...pu, st: e.target.value})}>
                        <option value="">STATE</option>{states.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-6">
                    <input type="text" placeholder="DEST_CITY" className="w-full bg-black border border-zinc-900 p-6 text-sm text-white outline-none focus:border-white/20" 
                           value={del.city} onBlur={() => del.city && playSound('LOCK')} onChange={e => setDel({...del, city: e.target.value})} />
                    <select className="w-full bg-black border border-zinc-900 p-4 text-white text-sm outline-none" style={{ colorScheme: 'dark' }} 
                            value={del.st} onChange={e => setDel({...del, st: e.target.value})}>
                        <option value="">STATE</option>{states.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
               </div>
            </div>
          </main>

          {/* SIDEBAR: PROTOCOL & UPLOAD (Priority Shifted) */}
          <aside className="col-span-12 lg:col-span-4 space-y-10">
             <div className={`bg-zinc-950 p-10 border transition-all duration-500 shadow-2xl ${glowClass(bol)}`}>
                <h3 className="text-[10px] font-black text-zinc-700 tracking-[1em] uppercase mb-10 italic">// Protocol_Select</h3>
                <div className="space-y-6">
                  {['pickup', 'delivery'].map(type => (
                    <label key={type} className={`flex items-center justify-between p-6 border border-zinc-900 cursor-pointer transition-all ${bol === type ? 'bg-zinc-900 border-white text-white shadow-2xl' : 'hover:bg-white/5 text-zinc-700'}`}>
                      <span className="text-[13px] font-black uppercase tracking-[1em]">{type}</span>
                      <input type="radio" className="hidden" name="m" onChange={() => { playSound('SELECT'); setBol(type as any); }} />
                      <div className={`w-4 h-4 rounded-full border border-zinc-800 ${bol === type ? 'bg-white shadow-[0_0_15px_white]' : ''}`} />
                    </label>
                  ))}
                </div>
             </div>

             <div className={`p-10 bg-zinc-950/20 border transition-all duration-500 backdrop-blur-3xl min-h-[300px] ${glowClass(payload.length > 0)}`}>
                <h4 className="text-[10px] font-black text-zinc-800 tracking-[1em] uppercase mb-10 italic">// Asset_Payload</h4>
                <div className="grid grid-cols-1 gap-6 mb-8">
                   <div className="flex gap-4">
                      <button onClick={() => (document.getElementById('c') as any).click()} className="flex-1 py-6 bg-zinc-900 border border-zinc-800 text-[9px] font-black tracking-widest hover:border-white transition-all uppercase">Open_Cam</button>
                      <button onClick={() => (document.getElementById('f') as any).click()} className="flex-1 py-6 bg-zinc-900 border border-zinc-800 text-[9px] font-black tracking-widest hover:border-white transition-all uppercase">Disk_Link</button>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   {payload.map(f => (
                     <div key={f.id} className="aspect-square border border-zinc-800 bg-black group overflow-hidden relative">
                        <img src={f.preview} className="w-full h-full object-cover opacity-30 group-hover:opacity-100 transition-opacity" />
                        <div className={`absolute bottom-0 left-0 h-1 transition-all ${isGLX ? 'bg-green-500' : isBST ? 'bg-blue-500' : 'bg-cyan-500'}`} style={{ width: `${f.progress}%` }} />
                        <button onClick={() => setPayload(p => p.filter(x => x.id !== f.id))} className="absolute top-2 right-2 p-2 bg-red-600/20 text-red-600 opacity-0 group-hover:opacity-100 transition-all font-black text-xs">✕</button>
                     </div>
                   ))}
                </div>
             </div>

             <button onClick={transmit} disabled={sending || payload.length === 0}
               className={`w-full py-20 text-[20px] font-black uppercase tracking-[2em] shadow-2xl transition-all relative overflow-hidden group ${payload.length > 0 ? 'bg-white text-black hover:invert active:scale-95' : 'bg-zinc-900 text-zinc-700 pointer-events-none'}`}>
               <span className="relative z-10">{sending ? 'TRANSMITTING' : 'EXECUTE'}</span>
               {sending && <div className="absolute inset-0 bg-zinc-800 transition-all" style={{ width: `${overallProgress}%` }} />}
             </button>
          </aside>
        </div>
      </div>

      {complete && (
        <div className="fixed inset-0 z-[1000] bg-black/99 flex flex-col items-center justify-center p-12 text-center">
           <div className={`w-44 h-44 rounded-full border-8 mb-12 flex items-center justify-center text-8xl shadow-[0_0_100px_currentcolor] animate-pulse`} style={{ borderColor: theme, color: theme }}>✓</div>
           <h2 className="text-white text-8xl font-black uppercase tracking-tighter mb-8 italic">Verified</h2>
           <p className="text-zinc-700 text-sm font-mono tracking-[0.5em] mb-16 uppercase">Data Link Terminated Successfully</p>
           <button onClick={() => location.reload()} className="w-64 py-6 border-4 border-zinc-900 text-zinc-600 text-xl font-black hover:text-white transition-all uppercase tracking-widest">Re-Sync</button>
        </div>
      )}

      <input type="file" id="f" className="hidden" multiple onChange={handleIngest} />
      <input type="file" id="c" className="hidden" capture="environment" onChange={handleIngest} />
      <style>{`select:focus { background-color: #09090b !important; }`}</style>
    </div>
  );
};

export default App;