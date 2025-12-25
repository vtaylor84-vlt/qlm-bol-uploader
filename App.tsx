import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, User, onAuthStateChanged, signOut } from "firebase/auth";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * NEXUS TERMINAL v11.0 [APEX-TACTICAL]
 * ---------------------------------------------------------
 * CORE: React 18 / Firebase Gen-3
 * UX: Industrial Cockpit Interface (ICI)
 * PERFORMANCE: Optimized Frame-Budgeting
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

// --- ATOMIC UI COMPONENTS ---

const TacticalLine = ({ vertical = false }) => (
  <div className={`${vertical ? 'w-px h-full' : 'h-px w-full'} bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50`} />
);

const HexNode = ({ active, color }: { active: boolean; color: string }) => (
  <div className={`w-3 h-3 rotate-45 border transition-all duration-500 ${active ? 'scale-110' : 'opacity-20'}`} 
       style={{ borderColor: color, backgroundColor: active ? color : 'transparent', boxShadow: active ? `0 0 10px ${color}` : 'none' }} />
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [company, setCompany] = useState<'GLX' | 'BST' | ''>('');
  const [driverName, setDriverName] = useState('');
  const [puCity, setPuCity] = useState('');
  const [puState, setPuState] = useState('');
  const [delCity, setDelCity] = useState('');
  const [delState, setDelState] = useState('');
  const [bolType, setBolType] = useState<'pickup' | 'delivery' | ''>('');
  const [files, setFiles] = useState<any[]>([]);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'SYS' | 'NAV' | 'DATA'>('SYS');

  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const themeHex = isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#06b6d4';
  const themeTailwind = isGLX ? 'green-500' : isBST ? 'blue-500' : 'cyan-500';

  useEffect(() => { return onAuthStateChanged(auth, setUser); }, []);

  const overallProgress = useMemo(() => 
    files.length ? Math.round(files.reduce((s, f) => s + (f.progress || 0), 0) / files.length) : 0, [files]);

  const mapSource = useMemo(() => {
    if (!puCity || !delCity) return null;
    return `https://www.google.com/maps/embed/v1/directions?key=YOUR_API_KEY&origin=${encodeURIComponent(puCity + ',' + puState)}&destination=${encodeURIComponent(delCity + ',' + delState)}&mode=driving&maptype=roadmap`;
  }, [puCity, puState, delCity, delState]);

  const handleAuth = async () => {
    setIsSyncing(true);
    try { await signInWithPopup(auth, provider); } catch (e) { console.error("AUTH_ERR", e); }
    setIsSyncing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newAssets = Array.from(e.target.files).map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
    setFiles(prev => [...prev, ...newAssets]);
  };

  const executeUplink = async () => {
    if (!user || files.length === 0) return;
    setIsTransmitting(true);

    const uploadPromises = files.map(async (fileItem) => {
      const sRef = storageRef(storage, `nexus_uplink/${user.uid}/${fileItem.id}`);
      const task = uploadBytesResumable(sRef, fileItem.file);

      return new Promise((resolve) => {
        task.on('state_changed', 
          (s) => {
            const p = (s.bytesTransferred / s.totalBytes) * 100;
            setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, progress: p } : f));
          },
          (err) => console.error(err),
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            resolve(url);
          }
        );
      });
    });

    try {
      const urls = await Promise.all(uploadPromises);
      await addDoc(collection(db, "uplinks"), {
        uid: user.uid,
        operator: driverName,
        fleet: company,
        route: { origin: `${puCity}, ${puState}`, dest: `${delCity}, ${delState}` },
        type: bolType,
        payload: urls,
        timestamp: serverTimestamp()
      });
      setSuccess(true);
    } catch (e) {
      setIsTransmitting(false);
    }
  };

  // --- UI FRAGMENTS ---

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 font-orbitron overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="z-10 w-full max-w-lg text-center">
          <div className="relative mb-20">
            <h1 className="text-8xl font-black text-white italic tracking-tighter opacity-10 select-none absolute -top-10 left-1/2 -translate-x-1/2">NEXUS</h1>
            <h1 className="text-5xl font-black text-white tracking-[0.4em] relative z-10">HANDSHAKE_REQUIRED</h1>
          </div>
          <button onClick={handleAuth} className="w-full py-8 border border-cyan-500/50 bg-cyan-500/5 text-cyan-400 font-black text-lg tracking-[0.5em] hover:bg-cyan-400 hover:text-black transition-all duration-700 relative overflow-hidden group">
            <span className="relative z-10">{isSyncing ? 'PROTOCOL_INIT...' : 'INITIATE_NEXUS_UPLINK'}</span>
            <div className="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 opacity-20" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-orbitron overflow-hidden relative selection:bg-cyan-500 selection:text-black">
      {/* BACKGROUND TELEMETRY LAYER */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="max-w-[1600px] mx-auto p-4 md:p-10 relative z-10">
        {/* HEADER: COMMAND HUD */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-zinc-900 pb-10 gap-8">
          <div className="flex items-center gap-10">
            <div className={`w-24 h-24 border-2 flex items-center justify-center text-4xl font-black transition-all duration-1000 ${isGLX ? 'border-green-500 text-green-500 shadow-[0_0_30px_#22c55e40]' : isBST ? 'border-blue-500 text-blue-500 shadow-[0_0_30px_#3b82f640]' : 'border-zinc-800 text-zinc-800'}`}>
              {company ? company.substring(0, 1) : 'Ø'}
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-white italic tracking-tighter">NEXUS_TERMINAL_v11</h1>
              <div className="flex items-center gap-4 text-[10px] tracking-[0.3em] font-mono">
                <span className="text-cyan-500 animate-pulse">● UPLINK_STABLE</span>
                <TacticalLine vertical />
                <span className="text-zinc-600 uppercase">Operator: {user.displayName}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-6 items-center">
             <div className="text-right hidden sm:block">
               <p className="text-[10px] text-zinc-600 font-mono tracking-widest">{new Date().toLocaleDateString()}</p>
               <p className="text-[10px] text-zinc-500 font-mono tracking-widest">NODE_ID: {user.uid.substring(0,8).toUpperCase()}</p>
             </div>
             <button onClick={() => signOut(auth)} className="px-6 py-4 border border-red-900/40 text-red-500 text-xs font-black tracking-widest hover:bg-red-500 hover:text-white transition-all">TERMINATE</button>
          </div>
        </header>

        {/* MAIN COCKPIT GRID */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: STATUS READOUT */}
          <aside className="lg:col-span-3 space-y-8 bg-zinc-950/80 p-6 border border-zinc-900 backdrop-blur-2xl">
            <h3 className="text-[10px] font-black text-zinc-500 tracking-[0.5em] uppercase mb-10 italic">// Telemetry_Stream</h3>
            <div className="space-y-12">
              {[
                { label: 'FLEET_SYNC', active: !!company, desc: company || 'IDLE' },
                { label: 'GEO_COORD', active: !!puCity, desc: puCity ? 'LOCKED' : 'WAITING' },
                { label: 'ASSET_MAP', active: files.length > 0, desc: `${files.length} UNITS` },
                { label: 'UPLINK_PCT', active: isTransmitting, desc: `${overallProgress}%` }
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-zinc-600 tracking-tighter">{item.label}</span>
                    <HexNode active={item.active} color={themeHex} />
                  </div>
                  <div className={`text-xs font-black uppercase tracking-widest ${item.active ? 'text-white' : 'text-zinc-800'}`}>{item.desc}</div>
                  <TacticalLine />
                </div>
              ))}
            </div>
          </aside>

          {/* CENTER: PRIMARY INTERFACE */}
          <main className="lg:col-span-6 space-y-10">
            <div className="flex gap-12 border-b border-zinc-900 pb-px">
              {['SYS', 'NAV', 'DATA'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab as any)}
                  className={`pb-6 text-sm font-black tracking-[0.5em] transition-all relative ${activeTab === tab ? `text-${themeTailwind}` : 'text-zinc-800 hover:text-zinc-600'}`}>
                  {tab}
                  {activeTab === tab && <div className={`absolute bottom-0 left-0 w-full h-1 bg-${themeTailwind} shadow-[0_0_20px_${themeHex}80]`} />}
                </button>
              ))}
            </div>

            <div className="min-h-[600px] transition-all duration-700">
              {activeTab === 'SYS' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Fleet_Authority</label>
                      <select className="w-full bg-zinc-950 border border-zinc-800 p-5 text-sm text-white focus:border-cyan-500 transition-all outline-none backdrop-blur-3xl" value={company} onChange={e => setCompany(e.target.value as any)}>
                        <option value="">-- SELECT --</option>
                        <option value="GLX">GREENLEAF XPRESS</option>
                        <option value="BST">BST EXPEDITE</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Operator_Sign</label>
                      <input type="text" placeholder="AUTH_NAME" className="w-full bg-zinc-950 border border-zinc-800 p-5 text-sm text-white focus:border-cyan-500 outline-none transition-all" value={driverName} onChange={e => setDriverName(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Pickup_Vector</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="CITY" className="flex-1 bg-zinc-950 border border-zinc-800 p-5 text-sm text-white outline-none" value={puCity} onChange={e => setPuCity(e.target.value)} />
                        <select className="w-24 bg-zinc-950 border border-zinc-800 p-5 text-sm outline-none text-white" value={puState} onChange={e => setPuState(e.target.value)}>
                          <option value="">ST</option>{states.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Delivery_Vector</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="CITY" className="flex-1 bg-zinc-950 border border-zinc-800 p-5 text-sm text-white outline-none" value={delCity} onChange={e => setDelCity(e.target.value)} />
                        <select className="w-24 bg-zinc-950 border border-zinc-800 p-5 text-sm outline-none text-white" value={delState} onChange={e => setDelState(e.target.value)}>
                          <option value="">ST</option>{states.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-12 border border-zinc-900 bg-zinc-950/50 flex flex-col items-center justify-center gap-10 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="text-xs font-black tracking-[0.8em] text-zinc-700 uppercase italic">Asset_Capture_Array</h3>
                    <div className="flex gap-16 relative z-10">
                      <button onClick={() => cameraInput.current?.click()} className="flex flex-col items-center gap-4 group/btn transition-transform active:scale-95">
                        <div className="w-24 h-24 border border-zinc-800 flex items-center justify-center bg-zinc-900/50 group-hover/btn:border-cyan-500 transition-all shadow-2xl">
                          <svg className="w-10 h-10 text-zinc-700 group-hover/btn:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
                        </div>
                        <span className="text-[9px] font-black tracking-widest">SCAN_CAM</span>
                      </button>
                      <button onClick={() => fileInput.current?.click()} className="flex flex-col items-center gap-4 group/btn transition-transform active:scale-95">
                        <div className="w-24 h-24 border border-zinc-800 flex items-center justify-center bg-zinc-900/50 group-hover/btn:border-cyan-500 transition-all shadow-2xl">
                          <svg className="w-10 h-10 text-zinc-700 group-hover/btn:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                        </div>
                        <span className="text-[9px] font-black tracking-widest">LOCAL_DISK</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'NAV' && (
                <div className="h-[600px] bg-zinc-950 border border-zinc-900 p-2 animate-in zoom-in-95 duration-500 relative">
                  <div className="absolute inset-0 z-10 pointer-events-none border-[30px] border-black/90 shadow-inner" />
                  {mapSource ? (
                    <iframe className="w-full h-full grayscale invert opacity-60 contrast-125" src={mapSource} frameBorder="0" loading="lazy" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[10px] uppercase tracking-[1em] text-zinc-800">No_Route_Coordinates</div>
                  )}
                </div>
              )}

              {activeTab === 'DATA' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-in slide-in-from-right-10 duration-500">
                  {files.map(f => (
                    <div key={f.id} className="relative aspect-square border border-zinc-900 bg-black group overflow-hidden">
                      <img src={f.preview} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-opacity duration-700" alt="payload" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-2 left-2 text-[8px] font-mono text-cyan-400">{f.timestamp}</div>
                      <div className={`absolute bottom-0 left-0 h-1 bg-${themeTailwind} transition-all duration-300`} style={{ width: `${f.progress}%` }} />
                      <button onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))} className="absolute top-2 right-2 p-2 bg-red-600/20 text-red-500 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-black">✕</button>
                    </div>
                  ))}
                  {files.length === 0 && <div className="col-span-full py-40 text-center border-2 border-dashed border-zinc-900 text-zinc-800 uppercase tracking-[1em] font-black">Null_Payload</div>}
                </div>
              )}
            </div>
          </main>

          {/* RIGHT: TRANSMISSION CONTROL */}
          <aside className="lg:col-span-3 space-y-10">
            <div className="bg-zinc-950 p-6 border border-zinc-900 space-y-8">
              <h3 className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.4em] italic">// Transmission_Mode</h3>
              <div className="space-y-4">
                {['pickup', 'delivery'].map(type => (
                  <label key={type} className={`flex items-center justify-between p-5 border border-zinc-900 cursor-pointer transition-all ${bolType === type ? `bg-${themeTailwind}/10 border-${themeTailwind} text-white` : 'hover:bg-white/5 text-zinc-700'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>
                    <input type="radio" className="hidden" name="mode" onChange={() => setBolType(type as any)} />
                    <div className={`w-3 h-3 rounded-full border border-zinc-800 ${bolType === type ? `bg-${themeTailwind} shadow-[0_0_10px_${themeHex}]` : ''}`} />
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-10">
              <button 
                onClick={executeUplink} 
                disabled={isTransmitting || files.length === 0}
                className={`w-full py-10 text-[11px] font-black uppercase tracking-[0.8em] transition-all relative overflow-hidden group ${files.length > 0 ? `bg-${themeTailwind} text-black shadow-2xl hover:scale-[1.03]` : 'bg-zinc-900 text-zinc-700 pointer-events-none'}`}>
                {isTransmitting ? 'SENDING_PACKETS...' : 'Execute_Uplink'}
                {isTransmitting && <div className="absolute inset-0 bg-white/20 transition-all duration-300" style={{ width: `${overallProgress}%` }} />}
              </button>
              <div className="flex justify-between text-[8px] font-mono text-zinc-700 uppercase px-1 tracking-widest">
                <span>Buffer: 2048KB</span>
                <span>Latency: 14MS</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* SUCCESS OVERLAY: GLOBAL INTERRUPT */}
      {success && (
        <div className="fixed inset-0 z-[200] bg-black/98 flex flex-col items-center justify-center p-10 font-orbitron animate-in fade-in duration-1000">
          <div className="max-w-md w-full text-center space-y-16">
            <div className={`w-32 h-32 rounded-full border-4 border-${themeTailwind} text-${themeTailwind} mx-auto flex items-center justify-center text-6xl animate-pulse shadow-[0_0_60px_${themeHex}]`}>✓</div>
            <div className="space-y-6">
              <h2 className="text-white text-5xl font-black italic tracking-tighter uppercase underline decoration-zinc-800 underline-offset-8 decoration-4">UPLINK_STABLE</h2>
              <p className="text-zinc-600 text-[10px] font-mono leading-relaxed uppercase tracking-[0.3em]">Transmission confirmed by dispatch core. Central node acknowledges receipt of all data packets.</p>
            </div>
            <button onClick={() => window.location.reload()} className="w-full py-6 border-2 border-zinc-800 text-white text-[10px] font-black uppercase tracking-[0.5em] hover:bg-white/5 transition-all">TERMINATE_SESSION</button>
          </div>
        </div>
      )}

      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #222; }
        ::-webkit-scrollbar-thumb:hover { background: #333; }
        select { -webkit-appearance: none; appearance: none; }
      `}</style>
      
      <input type="file" ref={fileInput} className="hidden" multiple accept="image/*" onChange={handleFileUpload} />
      <input type="file" ref={cameraInput} className="hidden" capture="environment" accept="image/*" onChange={handleFileUpload} />
    </div>
  );
};

export default App;