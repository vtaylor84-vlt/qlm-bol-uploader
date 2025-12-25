import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * TITAN-FORGE v31.0 [ICON-STRIKE EDITION]
 * -----------------------------------------------------------
 * DESIGN: Adaptive Environmental HUD / Glass-Inlay Icons
 * SOUND: Sub-Harmonic Audio Feedback
 * ENGINE: React 18 / Firebase Titan / Web Audio API
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

// --- TACTICAL HAPTIC ENGINE ---
const playSound = (freq: number, type: OscillatorType = 'sine', vol = 0.1) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
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

  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const themeColor = isGLX ? '#10b981' : isBST ? '#3b82f6' : '#a855f7';
  const themeGlow = isGLX ? 'rgba(16,185,129,0.3)' : isBST ? 'rgba(59,130,246,0.3)' : 'rgba(168,85,247,0.3)';

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  useEffect(() => {
    setTimeout(() => setBooting(false), 2000);
  }, []);

  const handleIngest = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    playSound(1200, 'sine', 0.05);
    const files = Array.from(e.target.files).map(f => ({
      id: crypto.randomUUID(), file: f, preview: URL.createObjectURL(f), progress: 0
    }));
    setPayload(p => [...p, ...files]);
  };

  const transmit = async () => {
    if (payload.length === 0 || !driver) return;
    setSending(true);
    playSound(60, 'sawtooth', 0.2);
    const uploads = payload.map(async (item) => {
      const sRef = storageRef(storage, `nebula_v31/${item.id}`);
      const task = uploadBytesResumable(sRef, item.file);
      return new Promise((res) => {
        task.on('state_changed', s => {
          const p = (s.bytesTransferred / s.totalBytes) * 100;
          setPayload(prev => prev.map(f => f.id === item.id ? { ...f, progress: p } : f));
        }, null, async () => res(await getDownloadURL(task.snapshot.ref)));
      });
    });
    const urls = await Promise.all(uploads);
    await addDoc(collection(db, "nebula_logistics"), { op: driver, fleet: company, route: `${pu.city} to ${del.city}`, bol, urls, ts: serverTimestamp() });
    setComplete(true);
  };

  // UI HELPERS
  const activeGlow = (val: any) => val ? `border-${isGLX ? 'green' : isBST ? 'blue' : 'cyan'}-500 shadow-[0_0_20px_${themeGlow}]` : 'border-zinc-800';

  if (booting) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-zinc-800 text-[10px] tracking-[2em] animate-pulse">BOOTING_TITAN_v31</div>;

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 font-orbitron p-6 md:p-12 relative overflow-x-hidden transition-all duration-1000" style={{ backgroundColor: company ? `${themeColor}02` : '#020202' } as any}>
      
      {/* ATMOSPHERIC LAYER */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${company ? 'opacity-30' : 'opacity-10'}`} 
           style={{ background: `radial-gradient(circle at center, ${themeColor}11 0%, transparent 70%)` }} />
      
      <div className="max-w-[1600px] mx-auto relative z-10">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-end border-b border-zinc-900 pb-12 mb-16 gap-10">
           <div className="flex items-center gap-12 group">
              <div className={`w-28 h-28 border-4 flex items-center justify-center text-5xl font-black transition-all duration-1000 bg-black ${activeGlow(company)}`}>
                {company ? company[0] : 'Δ'}
              </div>
              <div className="space-y-3">
                <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase">Titan_Forge_v31</h1>
                <p className={`text-[10px] font-mono tracking-[1em] uppercase ${company ? `text-${isGLX?'green':'blue'}-400` : 'text-zinc-700'}`}>
                  {company ? `${company}_HANDSHAKE_STABLE` : 'Awaiting_Handshake'}
                </p>
              </div>
           </div>
           <button onClick={() => location.reload()} className="px-10 py-4 border border-zinc-900 text-zinc-600 text-xs font-black uppercase tracking-[0.5em] hover:text-white transition-all">Recalibrate</button>
        </header>

        <div className="grid grid-cols-12 gap-12">
          
          {/* LEFT: CORE DATA */}
          <main className="col-span-12 lg:col-span-8 space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className={`relative p-10 bg-zinc-950/80 border transition-all duration-500 group ${activeGlow(company)}`}>
                  <label className="text-[10px] font-black uppercase tracking-[1em] text-zinc-600 block mb-6 italic">// Fleet_Auth</label>
                  <select className="w-full bg-transparent border-none text-white text-xl outline-none font-black appearance-none cursor-pointer" 
                          style={{ colorScheme: 'dark' }} value={company} onChange={e => { playSound(300); setCompany(e.target.value as any); }}>
                    <option value="">VOID_SELECT</option>
                    <option value="GLX" className="text-green-500">GREENLEAF_XPRESS</option>
                    <option value="BST" className="text-blue-500">BST_EXPEDITE</option>
                  </select>
               </div>
               <div className={`relative p-10 bg-zinc-950/80 border transition-all duration-500 group ${activeGlow(driver)}`}>
                  <label className="text-[10px] font-black uppercase tracking-[1em] text-zinc-600 block mb-6 italic">// Operator_Sig</label>
                  <input type="text" placeholder="LEGAL_NAME" className="w-full bg-transparent border-none text-white text-xl outline-none font-black" 
                         value={driver} onBlur={() => driver && playSound(600)} onChange={e => setDriver(e.target.value)} />
               </div>
            </div>

            {/* ROUTE MODULE */}
            <div className={`p-12 border transition-all duration-700 bg-zinc-950/40 relative overflow-hidden ${activeGlow(pu.city && del.city)}`}>
               <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent" />
               <h3 className="text-[11px] font-black text-zinc-700 tracking-[1.5em] uppercase mb-12 italic">// Routing_Vectors</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <input type="text" placeholder="PICKUP_CITY" className="w-full bg-black border border-zinc-900 p-6 text-sm text-white outline-none focus:border-white/20" 
                           value={pu.city} onChange={e => setPu({...pu, city: e.target.value})} />
                    <select className="w-full bg-black border border-zinc-900 p-4 text-white text-sm outline-none" style={{ colorScheme: 'dark' }} 
                            value={pu.st} onChange={e => setPu({...pu, st: e.target.value})}>
                        <option value="">STATE</option>{states.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-6">
                    <input type="text" placeholder="DEST_CITY" className="w-full bg-black border border-zinc-900 p-6 text-sm text-white outline-none focus:border-white/20" 
                           value={del.city} onChange={e => setDel({...del, city: e.target.value})} />
                    <select className="w-full bg-black border border-zinc-900 p-4 text-white text-sm outline-none" style={{ colorScheme: 'dark' }} 
                            value={del.st} onChange={e => setDel({...del, st: e.target.value})}>
                        <option value="">STATE</option>{states.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
               </div>
            </div>
          </main>

          {/* SIDEBAR: PROTOCOL & ASSETS */}
          <aside className="col-span-12 lg:col-span-4 space-y-12">
             
             {/* PROTOCOL SELECTOR (NOW AT TOP) */}
             <div className={`bg-zinc-950 p-10 border transition-all duration-500 shadow-2xl ${activeGlow(bol)}`}>
                <h3 className="text-[10px] font-black text-zinc-700 tracking-[1em] uppercase mb-10 italic">// Protocol_Sync</h3>
                <div className="space-y-6">
                  {['pickup', 'delivery'].map(type => (
                    <label key={type} className={`flex items-center justify-between p-6 border border-zinc-900 cursor-pointer transition-all ${bol === type ? 'bg-zinc-900 border-white text-white shadow-2xl' : 'hover:bg-white/5 text-zinc-800'}`}>
                      <span className="text-[14px] font-black uppercase tracking-[0.5em]">{type}</span>
                      <input type="radio" className="hidden" name="prot" onChange={() => { playSound(440); setBol(type as any); }} />
                      <div className={`w-4 h-4 rounded-full border-4 border-zinc-800 ${bol === type ? 'bg-white shadow-[0_0_15px_white]' : ''}`} />
                    </label>
                  ))}
                </div>
             </div>

             {/* ASSET UPLOAD WITH ICONS */}
             <div className={`p-10 bg-zinc-950/20 border transition-all duration-500 backdrop-blur-3xl min-h-[400px] ${activeGlow(payload.length > 0)}`}>
                <h4 className="text-[11px] font-black text-zinc-700 tracking-[1em] uppercase mb-10 italic">// Asset_Payload</h4>
                
                <div className="grid grid-cols-2 gap-8 mb-10">
                   <button onClick={() => (document.getElementById('c') as any).click()} className="flex flex-col items-center gap-4 group/btn transition-transform active:scale-90">
                      <div className={`w-24 h-24 border-2 rounded-2xl flex items-center justify-center bg-black transition-all group-hover/btn:border-cyan-500 ${company ? 'border-zinc-700' : 'border-zinc-900'}`}>
                        <svg className="w-10 h-10 text-zinc-700 group-hover/btn:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3" /></svg>
                      </div>
                      <span className="text-[9px] font-black tracking-widest uppercase text-zinc-800 group-hover/btn:text-white">Neural_Cam</span>
                   </button>
                   <button onClick={() => (document.getElementById('f') as any).click()} className="flex flex-col items-center gap-4 group/btn transition-transform active:scale-90">
                      <div className={`w-24 h-24 border-2 rounded-2xl flex items-center justify-center bg-black transition-all group-hover/btn:border-cyan-500 ${company ? 'border-zinc-700' : 'border-zinc-900'}`}>
                        <svg className="w-10 h-10 text-zinc-700 group-hover/btn:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                      </div>
                      <span className="text-[9px] font-black tracking-widest uppercase text-zinc-800 group-hover/btn:text-white">Local_Vault</span>
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   {payload.map(f => (
                     <div key={f.id} className="aspect-[3/4] border border-zinc-800 bg-black group overflow-hidden relative shadow-inner">
                        <img src={f.preview} className="w-full h-full object-cover opacity-30 group-hover:opacity-100 transition-opacity" />
                        <div className={`absolute bottom-0 left-0 h-1 bg-cyan-500 shadow-[0_0_10px_cyan] transition-all`} style={{ width: `${f.progress}%` }} />
                        <button onClick={() => setPayload(p => p.filter(x => x.id !== f.id))} className="absolute top-2 right-2 p-2 bg-red-600/20 text-red-600 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                     </div>
                   ))}
                </div>
             </div>

             <button onClick={transmit} disabled={sending || payload.length === 0}
               className={`w-full py-20 text-[22px] font-black uppercase tracking-[1.5em] shadow-2xl transition-all relative overflow-hidden group ${payload.length > 0 ? 'bg-white text-black hover:invert' : 'bg-zinc-900 text-zinc-700 pointer-events-none'}`}>
               <span className="relative z-10">{sending ? 'TRANSMITTING' : 'EXECUTE'}</span>
               {sending && <div className="absolute inset-0 bg-zinc-800 transition-all" style={{ width: `${overallProgress}%` }} />}
             </button>
          </aside>
        </div>
      </div>

      {complete && (
        <div className="fixed inset-0 z-[1000] bg-black/99 flex flex-col items-center justify-center p-12 text-center">
           <div className={`w-52 h-52 rounded-full border-8 mb-16 flex items-center justify-center text-9xl shadow-[0_0_100px_currentcolor] animate-pulse`} style={{ borderColor: themeColor, color: themeColor }}>✓</div>
           <h2 className="text-white text-[10rem] font-black uppercase tracking-tighter leading-none mb-12">Verified</h2>
           <button onClick={() => location.reload()} className="w-96 py-8 border-4 border-zinc-900 text-zinc-600 text-2xl font-black hover:text-white transition-all uppercase tracking-[1em]">Terminate</button>
        </div>
      )}

      <input type="file" id="f" className="hidden" multiple onChange={handleIngest} />
      <input type="file" id="c" className="hidden" capture="environment" onChange={handleIngest} />
      <style>{`select:focus { background-color: #09090b !important; }`}</style>
    </div>
  );
};

export default App;