import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, User, onAuthStateChanged, signOut } from "firebase/auth";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * QUANTUM_NEXUS TERMINAL v13.0 [TITAN-PROTOCOL]
 * -----------------------------------------------------------
 * ARCHITECTURE: Procedural UI / Firebase Gen-4
 * DESIGN: Industrial Military / Cyber-Tactical
 * SOUND: Ultra-Low Frequency Feedback (Simulated)
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

// --- TACTICAL AUDIO ENGINE ---
const playTacticalSound = (frequency: 'LOW' | 'HIGH' | 'SUCCESS') => {
  const context = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = context.createOscillator();
  const gain = context.createGain();
  
  osc.type = frequency === 'LOW' ? 'sine' : 'square';
  osc.frequency.setValueAtTime(frequency === 'LOW' ? 120 : frequency === 'SUCCESS' ? 880 : 1200, context.currentTime);
  
  gain.gain.setValueAtTime(0.1, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
  
  osc.connect(gain);
  gain.connect(context.destination);
  
  osc.start();
  osc.stop(context.currentTime + 0.2);
};

// --- PROCEDURAL UI COMPONENTS ---

const ScanlineOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,4px_100%]" />
);

const TelemetryGrid = ({ color }: { color: string }) => (
  <div className="fixed inset-0 z-0 opacity-10" style={{
    backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
    backgroundSize: '40px 40px'
  }} />
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isBooting, setIsBooting] = useState(false);
  const [company, setCompany] = useState<'GLX' | 'BST' | ''>('');
  const [driverName, setDriverName] = useState('');
  const [puCity, setPuCity] = useState('');
  const [puState, setPuState] = useState('');
  const [delCity, setDelCity] = useState('');
  const [delState, setDelState] = useState('');
  const [bolType, setBolType] = useState<'pickup' | 'delivery' | ''>('');
  const [payload, setPayload] = useState<any[]>([]);
  const [transmitting, setTransmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'SYSTEM' | 'GEOSPATIAL' | 'CARGO'>('SYSTEM');

  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  // --- THEME CALIBRATION ---
  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const themeColor = isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#06b6d4';
  const themeShadow = isGLX ? 'rgba(34,197,94,0.4)' : isBST ? 'rgba(59,130,246,0.4)' : 'rgba(6,182,212,0.4)';

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) playTacticalSound('SUCCESS');
    });
  }, []);

  const overallProgress = useMemo(() => 
    payload.length ? Math.round(payload.reduce((a, b) => a + (b.progress || 0), 0) / payload.length) : 0, [payload]);

  const mapFrame = useMemo(() => {
    if (!puCity || !delCity) return null;
    return `http://googleusercontent.com/maps.google.com/5{encodeURIComponent(puCity + ',' + puState)}&destination=${encodeURIComponent(delCity + ',' + delState)}&mode=driving&maptype=satellite`;
  }, [puCity, puState, delCity, delState]);

  const handleAuth = async () => {
    setIsBooting(true);
    playTacticalSound('LOW');
    try { await signInWithPopup(auth, provider); } catch (e) { console.error(e); }
    setIsBooting(false);
  };

  const handleAssetIngestion = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    playTacticalSound('HIGH');
    const newAssets = Array.from(e.target.files).map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      timestamp: new Date().toISOString()
    }));
    setPayload(p => [...p, ...newAssets]);
  };

  const initiateUplink = async () => {
    if (!user || payload.length === 0) return;
    setTransmitting(true);
    playTacticalSound('LOW');

    const uploads = payload.map(async (item) => {
      const sRef = storageRef(storage, `nexus_v13/${user.uid}/${item.id}`);
      const task = uploadBytesResumable(sRef, item.file);

      return new Promise((resolve) => {
        task.on('state_changed', 
          (s) => {
            const p = (s.bytesTransferred / s.totalBytes) * 100;
            setPayload(prev => prev.map(f => f.id === item.id ? { ...f, progress: p } : f));
          },
          null,
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            resolve(url);
          }
        );
      });
    });

    try {
      const urls = await Promise.all(uploads);
      await addDoc(collection(db, "uplinks_v13"), {
        operator: driverName,
        fleet: company,
        origin: puCity,
        dest: delCity,
        bol_type: bolType,
        assets: urls,
        uid: user.uid,
        timestamp: serverTimestamp()
      });
      playTacticalSound('SUCCESS');
      setSuccess(true);
    } catch (e) {
      setTransmitting(false);
    }
  };

  // --- INTERFACE COMPONENTS ---

  const TacticalInput = ({ label, ...props }: any) => (
    <div className="space-y-2 group">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 group-focus-within:text-cyan-400 transition-colors">
          {label}
        </label>
        <div className="h-1 w-1 bg-zinc-800 rounded-full group-focus-within:bg-cyan-400 group-focus-within:shadow-[0_0_5px_cyan]" />
      </div>
      <input 
        {...props}
        className="w-full bg-zinc-950/80 border border-zinc-900 p-5 text-sm font-mono text-white outline-none focus:border-cyan-500/50 focus:bg-zinc-900/40 transition-all backdrop-blur-3xl"
      />
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-10 font-orbitron">
        <ScanlineOverlay />
        <div className="w-full max-w-xl relative">
          <div className="absolute -inset-40 bg-cyan-500/5 blur-[120px] animate-pulse" />
          <div className="relative z-10 space-y-20">
            <div className="text-center space-y-4">
              <h1 className="text-7xl font-black italic tracking-tighter text-white">NEXUS_v13</h1>
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto" />
              <p className="text-zinc-600 text-[10px] tracking-[0.8em] uppercase font-bold">Tactical Deployment Node</p>
            </div>
            <button 
              onClick={handleAuth}
              className="w-full py-10 border border-zinc-800 bg-zinc-900/50 text-cyan-500 font-black text-xs tracking-[0.8em] hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all duration-700 shadow-2xl"
            >
              {isBooting ? 'CALIBRATING...' : 'ESTABLISH_NEURAL_LINK'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 font-orbitron overflow-x-hidden relative">
      <ScanlineOverlay />
      <TelemetryGrid color={themeColor} />
      
      <div className="max-w-[1700px] mx-auto p-6 md:p-12 relative z-10">
        
        {/* HUD: COMMAND STATUS */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-zinc-900/50 pb-12 mb-16 gap-10">
          <div className="flex items-center gap-12">
            <div className={`w-28 h-28 border-2 flex items-center justify-center text-5xl font-black transition-all duration-1000 bg-zinc-950 shadow-2xl ${isGLX ? 'border-green-500 text-green-500' : isBST ? 'border-blue-500 text-blue-500' : 'border-zinc-800 text-zinc-800'}`}>
              {company ? company[0] : 'X'}
            </div>
            <div className="space-y-3">
              <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Command_Node_v13</h1>
              <div className="flex items-center gap-5 text-[10px] tracking-[0.5em] font-mono text-zinc-600">
                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-ping" /> LINK_STABLE</span>
                <div className="w-px h-4 bg-zinc-800" />
                <span>OP: {user.displayName?.split(' ')[0].toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-zinc-950/80 p-6 border border-zinc-900 backdrop-blur-xl flex flex-col items-center">
               <span className="text-[8px] font-black uppercase tracking-widest text-zinc-700 mb-4">Signal_Bandwidth</span>
               <div className="flex gap-1.5">
                  {[1,2,3,4,5,6,7,8].map(i => <div key={i} className={`h-4 w-1 ${i < 7 ? `bg-${isGLX ? 'green' : isBST ? 'blue' : 'cyan'}-500 shadow-[0_0_8px_currentcolor]` : 'bg-zinc-900'}`} />)}
               </div>
            </div>
            <button onClick={() => signOut(auth)} className="px-8 py-4 border border-red-900/30 text-red-600 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-600 hover:text-white transition-all">Abort_Session</button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* ASIDE: REAL-TIME TELEMETRY */}
          <aside className="lg:col-span-3 space-y-8 bg-zinc-950/40 border border-zinc-900/50 p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-pulse" />
            <h3 className="text-[11px] font-black text-zinc-600 tracking-[0.6em] uppercase mb-12 italic">// System_Telemetry</h3>
            <div className="space-y-12">
              {[
                { label: 'FLEET_SYNC', active: !!company, status: company || 'OFFLINE' },
                { label: 'MAP_RENDER', active: !!puCity, status: puCity ? 'SYNCED' : 'IDLE' },
                { label: 'CARGO_UNIT', active: payload.length > 0, status: `${payload.length} UNITS` },
                { label: 'DATA_UPLINK', active: transmitting, status: `${overallProgress}%` }
              ].map((item, i) => (
                <div key={i} className="space-y-3 group/item">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-zinc-700 tracking-tighter group-hover/item:text-zinc-400 transition-colors">{item.label}</span>
                    <div className={`w-2 h-2 rounded-full transition-all duration-500 ${item.active ? 'bg-cyan-500 shadow-[0_0_10px_cyan]' : 'bg-zinc-900'}`} />
                  </div>
                  <div className={`text-[13px] font-black uppercase tracking-widest ${item.active ? 'text-white' : 'text-zinc-800'}`}>{item.status}</div>
                  <div className="h-px w-full bg-zinc-900 group-hover/item:bg-zinc-800 transition-all" />
                </div>
              ))}
            </div>
          </aside>

          {/* MAIN: INTERFACE CORE */}
          <main className="lg:col-span-6 space-y-10">
            <div className="flex gap-16 border-b border-zinc-900/80 pb-px overflow-x-auto">
              {['SYSTEM', 'GEOSPATIAL', 'CARGO'].map(tab => (
                <button key={tab} onClick={() => setActiveLayer(tab as any)}
                  className={`pb-8 text-[11px] font-black tracking-[0.6em] transition-all relative ${activeLayer === tab ? `text-${isGLX ? 'green' : isBST ? 'blue' : 'cyan'}-400` : 'text-zinc-800 hover:text-zinc-600'}`}>
                  {tab}
                  {activeLayer === tab && <div className={`absolute bottom-0 left-0 w-full h-1 bg-current shadow-[0_0_20px_currentcolor] animate-pulse`} />}
                </button>
              ))}
            </div>

            <div className="min-h-[650px] transition-all duration-1000 ease-in-out">
              {activeLayer === 'SYSTEM' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-700">
                  <div className="grid grid-cols-2 gap-10">
                    <TacticalInput label="Fleet_Identifier" select value={company} onChange={(e: any) => setCompany(e.target.value)}>
                      <option value="">SELECT_AUTHORITY</option>
                      <option value="GLX">GREENLEAF_XPRESS</option>
                      <option value="BST">BST_EXPEDITE</option>
                    </TacticalInput>
                    <TacticalInput label="Operator_ID" type="text" placeholder="AUTH_SIGNATURE" value={driverName} onChange={(e: any) => setDriverName(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black tracking-widest uppercase text-zinc-700 ml-1">Pickup_Origin</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="CITY" className="flex-1 bg-zinc-950 border border-zinc-900 p-5 text-sm outline-none text-white focus:border-cyan-500/50" value={puCity} onChange={e => setPuCity(e.target.value)} />
                        <select className="w-28 bg-zinc-950 border border-zinc-900 p-5 text-sm text-white outline-none" value={puState} onChange={e => setPuState(e.target.value)}>
                          <option value="">ST</option>{states.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black tracking-widest uppercase text-zinc-700 ml-1">Delivery_Dest</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="CITY" className="flex-1 bg-zinc-950 border border-zinc-900 p-5 text-sm outline-none text-white focus:border-cyan-500/50" value={delCity} onChange={e => setDelCity(e.target.value)} />
                        <select className="w-28 bg-zinc-950 border border-zinc-900 p-5 text-sm text-white outline-none" value={delState} onChange={e => setDelState(e.target.value)}>
                          <option value="">ST</option>{states.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-16 border border-zinc-900 bg-zinc-950/20 backdrop-blur-3xl flex flex-col items-center justify-center gap-12 group/imaging relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover/imaging:opacity-100 transition-opacity" />
                    <h3 className="text-[10px] font-black tracking-[0.8em] text-zinc-800 uppercase italic">Payload_Imaging_Subsystem</h3>
                    <div className="flex gap-24 relative z-10">
                      <button onClick={() => cameraInput.current?.click()} className="flex flex-col items-center gap-6 group/btn transition-transform active:scale-90">
                        <div className="w-28 h-28 border border-zinc-900 rounded-full flex items-center justify-center bg-zinc-900/30 group-hover/btn:border-cyan-500/50 group-hover/btn:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all">
                          <svg className="w-12 h-12 text-zinc-800 group-hover/btn:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="4"/></svg>
                        </div>
                        <span className="text-[9px] font-black tracking-[0.4em] uppercase text-zinc-700">Scan_Camera</span>
                      </button>
                      <button onClick={() => fileInput.current?.click()} className="flex flex-col items-center gap-6 group/btn transition-transform active:scale-90">
                        <div className="w-28 h-28 border border-zinc-900 rounded-full flex items-center justify-center bg-zinc-900/30 group-hover/btn:border-cyan-500/50 group-hover/btn:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all">
                          <svg className="w-12 h-12 text-zinc-800 group-hover/btn:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                        </div>
                        <span className="text-[9px] font-black tracking-[0.4em] uppercase text-zinc-700">Select_Disk</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeLayer === 'GEOSPATIAL' && (
                <div className="h-[650px] bg-zinc-950 border border-zinc-900 p-2 animate-in zoom-in-95 duration-1000 relative shadow-2xl">
                  <div className="absolute inset-0 z-10 pointer-events-none border-[40px] border-black/95 shadow-inner" />
                  {mapFrame ? (
                    <iframe className="w-full h-full grayscale invert opacity-40 contrast-150 saturate-200" src={mapFrame} frameBorder="0" loading="lazy" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[11px] uppercase tracking-[1.2em] text-zinc-900 font-black">Waiting_For_Vector_Data</div>
                  )}
                </div>
              )}

              {activeLayer === 'CARGO' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 animate-in slide-in-from-right-20 duration-700">
                  {payload.map(f => (
                    <div key={f.id} className="relative aspect-[3/4] border border-zinc-900 bg-black group overflow-hidden shadow-2xl">
                      <img src={f.preview} className="w-full h-full object-cover opacity-30 group-hover:opacity-100 transition-opacity duration-1000 saturate-0 hover:saturate-100" alt="cargo" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                      <div className="absolute bottom-3 left-4 text-[9px] font-mono text-cyan-500 uppercase tracking-tighter">{f.id.substring(0,8)}</div>
                      <div className={`absolute bottom-0 left-0 h-1 bg-cyan-500 shadow-[0_0_15px_cyan] transition-all duration-300`} style={{ width: `${f.progress}%` }} />
                      <button onClick={() => setPayload(prev => prev.filter(x => x.id !== f.id))} className="absolute top-3 right-4 p-2 bg-red-600/10 text-red-600 text-[10px] opacity-0 group-hover:opacity-100 transition-all font-black hover:bg-red-600 hover:text-white">✕</button>
                    </div>
                  ))}
                  {payload.length === 0 && <div className="col-span-full py-52 text-center border-2 border-dashed border-zinc-900 text-zinc-900 uppercase tracking-[1.5em] font-black">Null_Payload_Registry</div>}
                </div>
              )}
            </div>
          </main>

          {/* RIGHT: TRANSMISSION UPLINK */}
          <aside className="lg:col-span-3 space-y-12">
            <div className="bg-zinc-950 p-10 border border-zinc-900 shadow-2xl relative overflow-hidden group">
               <div className="absolute -inset-10 bg-gradient-to-br from-cyan-500/5 to-transparent rotate-12 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <h3 className="text-[11px] font-black uppercase text-zinc-700 tracking-[0.6em] italic mb-12 relative z-10">// Protocol_Type</h3>
              <div className="space-y-6 relative z-10">
                {['pickup', 'delivery'].map(type => (
                  <label key={type} className={`flex items-center justify-between p-6 border border-zinc-900 cursor-pointer transition-all ${bolType === type ? `bg-cyan-500/10 border-cyan-500/50 text-white shadow-[0_0_20px_rgba(6,182,212,0.1)]` : 'hover:bg-white/5 text-zinc-700'}`}>
                    <span className="text-[11px] font-black uppercase tracking-[0.4em]">{type}</span>
                    <input type="radio" className="hidden" name="prot_mode" onChange={() => setBolType(type as any)} />
                    <div className={`w-4 h-4 rounded-full border border-zinc-800 transition-all ${bolType === type ? `bg-cyan-500 shadow-[0_0_15px_cyan]` : ''}`} />
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-16">
              <button 
                onClick={initiateUplink} 
                disabled={transmitting || payload.length === 0 || !driverName}
                className={`w-full py-12 text-[13px] font-black uppercase tracking-[1em] transition-all relative overflow-hidden group ${payload.length > 0 ? `bg-${isGLX ? 'green' : isBST ? 'blue' : 'cyan'}-500 text-black shadow-2xl hover:scale-[1.04] active:scale-95` : 'bg-zinc-900 text-zinc-800 pointer-events-none opacity-40'}`}>
                <span className="relative z-10">{transmitting ? 'SENDING_BITSTREAM...' : 'Execute_Uplink'}</span>
                {transmitting && <div className="absolute inset-0 bg-white/20 transition-all duration-300" style={{ width: `${overallProgress}%` }} />}
              </button>
              <div className="flex justify-between text-[10px] font-mono text-zinc-800 uppercase px-1 tracking-[0.4em] font-black">
                <span>Buffer_Size: 4096KB</span>
                <span>Signal: {transmitting ? 'BURST' : 'IDLE'}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* FINAL_TRANSMISSION_VERIFIED_OVERLAY */}
      {success && (
        <div className="fixed inset-0 z-[500] bg-black/99 flex flex-col items-center justify-center p-12 font-orbitron animate-in fade-in duration-1000">
          <div className="max-w-xl w-full text-center space-y-20 relative">
            <div className={`w-44 h-44 rounded-full border-4 border-${isGLX ? 'green' : isBST ? 'blue' : 'cyan'}-500 text-${isGLX ? 'green' : isBST ? 'blue' : 'cyan'}-500 mx-auto flex items-center justify-center text-7xl animate-pulse shadow-[0_0_100px_currentcolor]`}>✓</div>
            <div className="space-y-8">
              <h2 className="text-white text-6xl font-black italic tracking-tighter uppercase underline decoration-zinc-900 underline-offset-[20px] decoration-8">Transmission_Complete</h2>
              <p className="text-zinc-700 text-[12px] font-mono leading-relaxed uppercase tracking-[0.5em] font-black max-w-lg mx-auto">Neural handshake established. Data packets verified by central logistics node. You are authorized to proceed to next coordinates.</p>
            </div>
            <button onClick={() => window.location.reload()} className="w-full py-8 border-2 border-zinc-900 text-zinc-500 text-[12px] font-black uppercase tracking-[0.8em] hover:bg-white/5 hover:text-white hover:border-white transition-all">Close_Secure_Handshake</button>
          </div>
        </div>
      )}

      <style>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #111; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #222; }
        select { -webkit-appearance: none; appearance: none; }
      `}</style>
      
      <input type="file" ref={fileInput} className="hidden" multiple accept="image/*" onChange={handleAssetIngestion} />
      <input type="file" ref={cameraInput} className="hidden" capture="environment" accept="image/*" onChange={handleAssetIngestion} />
    </div>
  );
};

export default App;