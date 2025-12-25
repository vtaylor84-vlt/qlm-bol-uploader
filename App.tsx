import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * AURORA NEXUS v22.0 [QUANTUM-OVERLORD EDITION]
 * -----------------------------------------------------------
 * DESIGN: Adaptive Warp Plasma / Glitch-Neon Brutalist
 * SOUND: Multi-Layer Resonance FM Synthesis
 * ENGINE: Canvas Warp Field + Procedural Particles + Firebase Elite
 * FEATURES: Glitch bursts, asset explosion removal, quantum validation
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

// --- RESONANCE FM SYNTHESIS ENGINE ---
const playResonance = (baseFreq: number, modFreq = 300, depth = 400, duration = 0.4, volume = 0.18) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const carrier = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const modGain = ctx.createGain();
    const mainGain = ctx.createGain();

    carrier.type = 'sine';
    modulator.type = 'triangle';
    carrier.frequency.value = baseFreq;
    modulator.frequency.value = modFreq;
    modGain.gain.value = depth;

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(mainGain);
    mainGain.connect(ctx.destination);

    mainGain.gain.setValueAtTime(volume, ctx.currentTime);
    mainGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    carrier.start();
    modulator.start();
    carrier.stop(ctx.currentTime + duration);
    modulator.stop(ctx.currentTime + duration);
  } catch (e) {}
};

// --- PROCEDURAL PARTICLE EXPLOSION FOR ASSET REMOVAL ---
const explodeParticles = (color: string) => {
  const container = document.createElement('div');
  container.className = 'fixed inset-0 pointer-events-none z-50';
  document.body.appendChild(container);

  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.style.position = 'absolute';
    p.style.width = '4px';
    p.style.height = '4px';
    p.style.background = color;
    p.style.borderRadius = '50%';
    p.style.left = `${50 + (Math.random() - 0.5) * 20}%`;
    p.style.top = `${50 + (Math.random() - 0.5) * 20}%`;
    p.style.boxShadow = `0 0 15px ${color}`;

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 300 + 200;
    p.animate([
      { transform: 'scale(0)', opacity: 1 },
      { transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`, opacity: 0 }
    ], { duration: 800, easing: 'cubic-bezier(0,0,0.2,1)' }).onfinish = () => p.remove();

    container.appendChild(p);
  }
  setTimeout(() => container.remove(), 1000);
};

// --- CANVAS WARP DISTORTION FIELD ---
const WarpField = ({ accent }: { accent: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 0.07;

      for (let x = 0; x < canvas.width; x += 40) {
        for (let y = 0; y < canvas.height; y += 40) {
          const dist = Math.sin(time + x / 100) * 20;
          ctx.fillStyle = accent;
          ctx.fillRect(x + dist, y + Math.cos(time + y / 100) * 10, 2, canvas.height);
        }
      }
      time += 0.02;
      requestAnimationFrame(animate);
    };
    animate();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [accent]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [company, setCompany] = useState<'GLX' | 'BST' | ''>('');
  const [driverName, setDriverName] = useState('');
  const [loadRef, setLoadRef] = useState('');
  const [puCity, setPuCity] = useState('');
  const [puState, setPuState] = useState('');
  const [delCity, setDelCity] = useState('');
  const [delState, setDelState] = useState('');
  const [bolType, setBolType] = useState<'pickup' | 'delivery' | ''>('');
  const [files, setFiles] = useState<{ id: string; file: File; preview: string; progress: number }[]>([]);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  const accent = company === 'GLX' ? '#10b981' : company === 'BST' ? '#a78bfa' : '#f43f5e';

  const overallProgress = useMemo(() => 
    files.length ? Math.round(files.reduce((a, f) => a + f.progress, 0) / files.length) : 0, [files]);

  useEffect(() => {
    setTimeout(() => {
      setIsBooting(false);
      playResonance(160, 500, 800, 1.0, 0.3);
    }, 2800);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    playResonance(1000, 600, 500, 0.3);
    const newFiles = Array.from(e.target.files).map(f => ({
      id: crypto.randomUUID(),
      file: f,
      preview: URL.createObjectURL(f),
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    playResonance(80, 200, 300, 0.4);
    explodeParticles(accent);
    setFiles(prev => prev.filter(f => f.id !== id));
  }, [accent]);

  const executeUplink = async () => {
    if (files.length === 0 || !driverName || !company || !bolType) return;
    setIsTransmitting(true);
    playResonance(40, 800, 1000, 1.5, 0.35);

    const uploads = files.map(async (item) => {
      const sRef = storageRef(storage, `quantum_v22/${item.id}`);
      const task = uploadBytesResumable(sRef, item.file);
      return new Promise<string>((resolve) => {
        task.on('state_changed', snap => {
          const p = (snap.bytesTransferred / snap.totalBytes) * 100;
          setFiles(prev => prev.map(f => f.id === item.id ? { ...f, progress: p } : f));
          if (p % 12 === 0) playResonance(350 + p * 2, 150, 100, 0.15);
        }, () => {}, async () => resolve(await getDownloadURL(task.snapshot.ref)));
      });
    });

    const urls = await Promise.all(uploads);
    await addDoc(collection(db, "quantum_transmissions_v22"), {
      operator: driverName,
      fleet: company,
      loadRef,
      route: `${puCity}, ${puState} → ${delCity}, ${delState}`,
      bol: bolType,
      assets: urls,
      timestamp: serverTimestamp()
    });

    playResonance(1800, 300, 800, 1.2, 0.4);
    setComplete(true);
  };

  if (isBooting) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-cyan-900/30 to-black animate-pulse" />
        <div className="text-center space-y-16">
          <h1 className="text-6xl font-black text-white tracking-tighter">QUANTUM_OVERLORD_ONLINE</h1>
          <div className="w-[500px] h-2 bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" style={{ animation: 'warp 3s infinite' }} />
          </div>
          <p className="text-zinc-500 uppercase tracking-widest animate-pulse">Warping Reality Matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-orbitron relative overflow-hidden" style={{ '--accent': accent } as any}>
      <WarpField accent={accent} />
      <div className="fixed inset-0 pointer-events-none opacity-15 bg-gradient-to-tl from-[var(--accent)]/30 via-transparent to-rose-600/20" />

      <div className="max-w-7xl mx-auto p-8 md:p-20 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-24 border-b border-zinc-900 pb-16">
          <div className="flex items-center gap-16">
            <div className="w-32 h-32 border-4 rounded-2xl flex items-center justify-center text-6xl font-black animate-pulse shadow-2xl"
                 style={{ borderColor: accent, color: accent, boxShadow: `0 0 80px ${accent}80` }}>
              {company || 'Ω'}
            </div>
            <div>
              <h1 className="text-8xl font-black text-white uppercase tracking-tighter">Quantum_Nexus_v22</h1>
              <p className="text-sm text-zinc-600 tracking-[1em] mt-6">OVERLORD_LINK // REALITY_WARP_ACTIVE</p>
            </div>
          </div>
          <button onClick={() => location.reload()} className="px-16 py-8 border-2 border-zinc-800 text-zinc-500 hover:border-[var(--accent)] hover:text-[var(--accent)] text-lg font-black tracking-widest transition-all">
            PURGE_MATRIX
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <main className="lg:col-span-8 space-y-20">
            {/* Top Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { label: 'Fleet_Overlord', value: company, set: (v: any) => { playResonance(600); setCompany(v); }, options: ['', 'GLX', 'BST'], texts: ['VOID', 'GREENLEAF_QUANTUM', 'BST_OVERLORD'] },
                { label: 'Operator_Core', value: driverName, set: (v: string) => setDriverName(v), placeholder: 'QUANTUM_ID' },
                { label: 'Load_Quantum', value: loadRef, set: (v: string) => setLoadRef(v), placeholder: 'MATRIX_REF' }
              ].map((field, i) => (
                <div key={i} className="p-12 bg-zinc-950/60 backdrop-blur-2xl border border-zinc-800 hover:border-[var(--accent)] transition-all group">
                  <label className="text-xs uppercase tracking-[0.8em] text-zinc-600 mb-8 block">{field.label}</label>
                  {field.options ? (
                    <select className="w-full bg-transparent text-3xl text-white outline-none" value={field.value} onChange={e => field.set(e.target.value)}>
                      {field.options.map((opt, j) => <option key={opt} value={opt}>{field.texts?.[j] || opt}</option>)}
                    </select>
                  ) : (
                    <input type="text" className="w-full bg-transparent text-3xl text-white outline-none" placeholder={field.placeholder} value={field.value} onChange={e => field.set(e.target.value)} />
                  )}
                </div>
              ))}
            </div>

            {/* Routes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {[
                { label: 'Origin_Warp', city: puCity, setCity: setPuCity, state: puState, setState: setPuState },
                { label: 'Terminus_Node', city: delCity, setCity: setDelCity, state: delState, setState: setDelState }
              ].map((route, i) => (
                <div key={i} className="p-16 bg-zinc-950/50 backdrop-blur-xl border border-zinc-800">
                  <label className="text-xs uppercase tracking-[0.8em] text-zinc-600 mb-10 block">{route.label}</label>
                  <div className="flex gap-8">
                    <input type="text" placeholder="WARP_CITY" className="flex-1 bg-transparent text-2xl text-white border-b-2 border-zinc-700 focus:border-[var(--accent)] pb-6 outline-none transition-all" value={route.city} onChange={e => route.setCity(e.target.value)} />
                    <select className="bg-transparent text-2xl text-white" value={route.state} onChange={e => route.setState(e.target.value)}>
                      <option>ZONE</option>{states.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Capture Array */}
            <div className="p-32 bg-gradient-to-br from-zinc-950/80 to-black border-2 border-zinc-800 rounded-2xl text-center space-y-24">
              <h3 className="text-lg uppercase tracking-[1.5em] text-zinc-700">Reality_Capture_Matrix</h3>
              <div className="flex justify-center gap-40">
                {[
                  { label: 'Quantum_Scan', icon: '📸', id: 'cam' },
                  { label: 'Void_Archive', icon: '📁', id: 'file' }
                ].map((btn) => (
                  <button key={btn.id} onClick={() => { playResonance(1200, 400, 600, 0.4); (document.getElementById(btn.id) as any)?.click(); }} className="group">
                    <div className="w-48 h-48 rounded-3xl bg-zinc-900 border-4 border-zinc-800 flex items-center justify-center group-hover:border-[var(--accent)] group-hover:shadow-[0_0_100px_var(--accent)60] transition-all">
                      <span className="text-8xl group-hover:scale-125 transition-transform">{btn.icon}</span>
                    </div>
                    <p className="mt-10 text-sm tracking-widest text-zinc-600 group-hover:text-[var(--accent)] uppercase">{btn.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </main>

          <aside className="lg:col-span-4 space-y-20">
            {/* Protocol */}
            <div className="p-16 bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800">
              <h3 className="text-sm uppercase tracking-[1em] text-zinc-700 mb-16">// Quantum_Protocol</h3>
              <div className="space-y-10">
                {(['pickup', 'delivery'] as const).map(type => (
                  <button key={type} onClick={() => { playResonance(500, 200, 400); setBolType(type); }} className={`w-full p-10 border-2 ${bolType === type ? 'border-[var(--accent)] bg-[var(--accent)]/20 shadow-2xl' : 'border-zinc-800'} transition-all`}>
                    <div className="flex justify-between items-center">
                      <span className="text-lg uppercase tracking-widest">{type}_WARP</span>
                      <div className={`w-6 h-6 rounded-full border-4 ${bolType === type ? 'bg-[var(--accent)] border-[var(--accent)] shadow-[0_0_30px_var(--accent)]' : 'border-zinc-600'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Assets */}
            <div className="p-12 bg-zinc-950/70 backdrop-blur-xl border border-zinc-800 min-h-[400px]">
              <h4 className="text-sm uppercase tracking-[0.8em] text-zinc-700 mb-12">// Reality_Fragments</h4>
              <div className="grid grid-cols-2 gap-8">
                {files.map(file => (
                  <div key={file.id} className="relative group overflow-hidden rounded-2xl border-2 border-zinc-800">
                    <img src={file.preview} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-x-0 bottom-0 h-3 bg-[var(--accent)] shadow-[0_0_20px_var(--accent)]" style={{ width: `${file.progress}%` }} />
                    <button onClick={() => removeFile(file.id)} className="absolute top-4 right-4 bg-red-900/90 text-white px-4 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity font-black">ERASE</button>
                  </div>
                ))}
                {files.length === 0 && <p className="col-span-2 text-center py-32 text-zinc-800 uppercase tracking-widest text-lg animate-pulse">VOID_AWAITS</p>}
              </div>
            </div>

            {/* Uplink Button */}
            <button
              onClick={executeUplink}
              disabled={isTransmitting || files.length === 0}
              className="w-full py-24 text-2xl font-black uppercase tracking-[2em] bg-white text-black hover:bg-[var(--accent)] hover:text-white transition-all shadow-2xl disabled:bg-zinc-900 disabled:text-zinc-700"
            >
              {isTransmitting ? `WARP_${overallProgress}%` : 'FORGE_QUANTUM_LINK'}
            </button>
          </aside>
        </div>
      </div>

      {complete && (
        <div className="fixed inset-0 bg-black/98 z-50 flex items-center justify-center p-20">
          <div className="text-center space-y-32">
            <div className="w-80 h-80 rounded-full border-12 border-[var(--accent)] flex items-center justify-center text-[12rem] text-[var(--accent)] shadow-[0_0_300px_var(--accent)] animate-pulse">✓</div>
            <div>
              <h2 className="text-9xl font-black text-white uppercase tracking-tighter">REALITY_FORGED</h2>
              <p className="text-zinc-500 mt-12 uppercase tracking-widest text-xl">Quantum reconciliation complete across all dimensions</p>
            </div>
            <button onClick={() => location.reload()} className="px-32 py-16 border-4 border-zinc-800 text-zinc-400 hover:border-[var(--accent)] hover:text-[var(--accent)] text-2xl font-black uppercase tracking-[1.5em] transition-all">
              COLLAPSE_WAVEFUNCTION
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes warp { 0% { width: 0%; } 100% { width: 100%; } }
        .animate-warp { animation: warp 3s infinite alternate; }
      `}</style>

      <input type="file" id="file" className="hidden" multiple accept="image/*" onChange={handleFileUpload} />
      <input type="file" id="cam" className="hidden" capture="environment" accept="image/*" onChange={handleFileUpload} />
    </div>
  );
};

export default App;