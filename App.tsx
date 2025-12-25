import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, User, onAuthStateChanged, signOut } from "firebase/auth";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * NEURAL-VOID TERMINAL v15.0 [ELITE-PROTOCOL]
 * -----------------------------------------------------------
 * DESIGN: High-Luminance Tactical / Vanta-Glass
 * TECH: Firebase Gen-4 / Procedural CSS Shaders
 * UX: Cognitive Information Density Optimization
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

// --- NEURAL HAPTIC ENGINE ---
const playNeuralPing = (freq = 150, type: OscillatorType = 'sine') => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
};

// --- ELITE UI COMPONENTS ---

const DataStream = () => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.05] overflow-hidden font-mono text-[8px] leading-tight text-cyan-500 select-none">
    {Array.from({ length: 20 }).map((_, i) => (
      <div key={i} className="whitespace-nowrap animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
        {Math.random().toString(16).repeat(10)}
      </div>
    ))}
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
  const [payload, setPayload] = useState<any[]>([]);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'CORE' | 'NAV' | 'ASSETS'>('CORE');

  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const themeColor = isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#a855f7';
  const themeGlow = isGLX ? 'rgba(34,197,94,0.5)' : isBST ? 'rgba(59,130,246,0.5)' : 'rgba(168,85,247,0.5)';

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const handleSignIn = async () => {
    playNeuralPing(200, 'square');
    await signInWithPopup(auth, provider);
  };

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    playNeuralPing(800);
    const newFiles = Array.from(e.target.files).map(f => ({
      id: crypto.randomUUID(),
      file: f,
      preview: URL.createObjectURL(f),
      progress: 0
    }));
    setPayload(p => [...p, ...newFiles]);
  };

  const initiateUplink = async () => {
    if (!user || payload.length === 0) return;
    setIsTransmitting(true);
    playNeuralPing(60, 'sawtooth');

    const uploads = payload.map(async (item) => {
      const sRef = storageRef(storage, `neural_void/${user.uid}/${item.id}`);
      const task = uploadBytesResumable(sRef, item.file);
      return new Promise((res) => {
        task.on('state_changed', s => {
          const p = (s.bytesTransferred / s.totalBytes) * 100;
          setPayload(prev => prev.map(f => f.id === item.id ? { ...f, progress: p } : f));
        }, null, async () => res(await getDownloadURL(task.snapshot.ref)));
      });
    });

    const urls = await Promise.all(uploads);
    await addDoc(collection(db, "neural_protocol"), {
      operator: driverName, fleet: company, images: urls, timestamp: serverTimestamp()
    });
    setComplete(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-12 font-orbitron overflow-hidden relative">
        <DataStream />
        <div className="relative z-10 w-full max-w-xl text-center space-y-16">
          <div className="relative inline-block">
            <h1 className="text-8xl font-black italic tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">NEURAL-VOID</h1>
            <div className="absolute -bottom-4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          </div>
          <button onClick={handleSignIn} className="w-full py-10 bg-white/5 border border-white/10 text-white font-black text-xs tracking-[1em] hover:bg-white/10 hover:border-purple-500 transition-all duration-700 backdrop-blur-3xl group">
            <span className="relative z-10 group-hover:text-purple-400 transition-colors">INITIALIZE_HANDSHAKE</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 font-orbitron overflow-hidden selection:bg-purple-500 selection:text-white">
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0 bg-[radial-gradient(circle_at_center,_#333_1px,transparent_1px)] bg-[size:30px_30px]" />
      
      <div className="max-w-[1600px] mx-auto p-10 relative z-10">
        <header className="flex justify-between items-end border-b border-zinc-900 pb-12 mb-12">
          <div className="flex items-center gap-12">
            <div className="w-24 h-24 border-2 flex items-center justify-center text-4xl font-black transition-all duration-1000 bg-black shadow-2xl" 
                 style={{ borderColor: themeColor, color: themeColor, boxShadow: `0 0 40px ${themeGlow}` }}>
              {company ? company[0] : 'V'}
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Command_Terminal_v15</h1>
              <p className="text-[10px] tracking-[0.5em] font-mono text-zinc-600">ENCRYPTED_UPLINK_AUTHORIZED // OP: {user.displayName?.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={() => signOut(auth)} className="px-8 py-4 border border-red-900/40 text-red-600 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-600 hover:text-white transition-all">TERMINATE_NODE</button>
        </header>

        <div className="grid grid-cols-12 gap-12 items-start">
          {/* Side Telemetry */}
          <aside className="col-span-3 bg-zinc-950/80 p-8 border border-zinc-900 backdrop-blur-3xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-transparent opacity-50" />
            <h3 className="text-[11px] font-black text-zinc-700 tracking-[0.6em] uppercase mb-12 italic">// Sensor_Telemetry</h3>
            <div className="space-y-12">
              {[
                { label: 'FLEET_SYNC', active: !!company, status: company || 'WAITING' },
                { label: 'NAV_GEOMETRY', active: !!puCity, status: puCity ? 'LOCKED' : 'IDLE' },
                { label: 'ASSET_LOAD', active: payload.length > 0, status: `${payload.length} UNITS` }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[9px] font-mono text-zinc-800 uppercase">
                    <span>{item.label}</span>
                    <span className={item.active ? 'text-white' : ''}>{item.status}</span>
                  </div>
                  <div className="h-px w-full bg-zinc-900" />
                </div>
              ))}
            </div>
          </aside>

          {/* Main Module */}
          <main className="col-span-6 space-y-10">
            <div className="flex gap-16 border-b border-zinc-900 pb-px">
              {['CORE', 'NAV', 'ASSETS'].map(tab => (
                <button key={tab} onClick={() => { playNeuralPing(400); setActiveLayer(tab as any); }}
                  className={`pb-8 text-xs font-black tracking-[0.8em] transition-all relative ${activeLayer === tab ? 'text-white' : 'text-zinc-800 hover:text-zinc-600'}`}>
                  {tab}
                  {activeLayer === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500 shadow-[0_0_20px_purple]" />}
                </button>
              ))}
            </div>

            <div className="min-h-[600px]">
              {activeLayer === 'CORE' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest">Fleet_Authority</label>
                      <select className="w-full bg-black border border-zinc-900 p-6 text-sm text-white focus:border-purple-500 transition-all outline-none" value={company} onChange={e => setCompany(e.target.value as any)}>
                        <option value="">SELECT_AUTHORITY</option>
                        <option value="GLX">GREENLEAF_XPRESS</option>
                        <option value="BST">BST_EXPEDITE</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest">Operator_Sign</label>
                      <input type="text" placeholder="LEGAL_NAME" className="w-full bg-black border border-zinc-900 p-6 text-sm text-white focus:border-purple-500 outline-none" value={driverName} onChange={e => setDriverName(e.target.value)} />
                    </div>
                  </div>

                  <div className="p-20 border-2 border-dashed border-zinc-900 bg-zinc-950/20 backdrop-blur-3xl flex items-center justify-around group transition-all hover:bg-zinc-900/10">
                    <button onClick={() => { playNeuralPing(1000); (window as any).cameraInput.click(); }} className="flex flex-col items-center gap-6 group">
                      <div className="w-32 h-32 border border-zinc-900 rounded-full flex items-center justify-center group-hover:border-purple-500 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all">
                        <svg className="w-12 h-12 text-zinc-800 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="4"/></svg>
                      </div>
                      <span className="text-[10px] font-black tracking-widest text-zinc-700">SCAN_LENS</span>
                    </button>
                    <button onClick={() => { playNeuralPing(1000); (window as any).fileInput.click(); }} className="flex flex-col items-center gap-6 group">
                      <div className="w-32 h-32 border border-zinc-900 rounded-full flex items-center justify-center group-hover:border-purple-500 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all">
                        <svg className="w-12 h-12 text-zinc-800 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                      </div>
                      <span className="text-[10px] font-black tracking-widest text-zinc-700">LOCAL_FILE</span>
                    </button>
                  </div>
                </div>
              )}
              {/* Other tabs follow same aesthetic */}
            </div>
          </main>

          {/* Right Action */}
          <aside className="col-span-3 space-y-12">
            <div className="bg-zinc-950 p-10 border border-zinc-900 space-y-10">
              <h3 className="text-[11px] font-black uppercase text-zinc-800 tracking-[0.6em] italic">// Uplink_Control</h3>
              <div className="space-y-6">
                {['pickup', 'delivery'].map(type => (
                  <label key={type} className={`flex items-center justify-between p-6 border border-zinc-900 cursor-pointer transition-all ${bolType === type ? 'bg-purple-500/10 border-purple-500' : 'hover:bg-white/5'}`}>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${bolType === type ? 'text-white' : 'text-zinc-800'}`}>{type}</span>
                    <input type="radio" className="hidden" name="mode" onChange={() => setBolType(type as any)} />
                    <div className={`w-3 h-3 rounded-full border border-zinc-900 ${bolType === type ? 'bg-purple-500 shadow-[0_0_10px_purple]' : ''}`} />
                  </label>
                ))}
              </div>
            </div>

            <button onClick={initiateUplink} disabled={isTransmitting || payload.length === 0}
              className="w-full py-12 text-[13px] font-black uppercase tracking-[1em] bg-purple-600 text-white shadow-[0_0_50px_rgba(168,85,247,0.4)] hover:bg-purple-500 transition-all disabled:opacity-20 disabled:pointer-events-none">
              {isTransmitting ? 'SENDING_DATA...' : 'Execute_Uplink'}
            </button>
          </aside>
        </div>
      </div>

      {complete && (
        <div className="fixed inset-0 z-[500] bg-black/99 flex flex-col items-center justify-center p-12 animate-in fade-in duration-1000">
          <div className="max-w-xl w-full text-center space-y-20">
            <div className="w-44 h-44 rounded-full border-4 border-purple-500 text-purple-500 mx-auto flex items-center justify-center text-7xl animate-pulse shadow-[0_0_100px_purple]">✓</div>
            <h2 className="text-white text-6xl font-black italic tracking-tighter uppercase underline decoration-zinc-900 underline-offset-[20px]">Transmission_Complete</h2>
            <button onClick={() => window.location.reload()} className="w-full py-8 border-2 border-zinc-900 text-zinc-500 text-[12px] font-black uppercase tracking-[0.8em] hover:bg-white/5 hover:text-white hover:border-white transition-all">Close_Handshake</button>
          </div>
        </div>
      )}

      <input type="file" id="fileInput" className="hidden" multiple onChange={onFileUpload} />
      <input type="file" id="cameraInput" className="hidden" capture="environment" onChange={onFileUpload} />
    </div>
  );
};

export default App;