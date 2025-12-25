import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * AURORA NEXUS v27.0 [2026 SINGULARITY PRIME]
 * -----------------------------------------------------------
 * DESIGN: Multi-Layer Holographic Glass / Quantum Plasma Depth
 * SOUND: Evolving Multi-Harmonic Resonance (Theme-Adaptive)
 * ENGINE: Dual Canvas Warp + Reflection Field + Firebase Prime
 * FEATURES: Glassmorphism panels, quantum dissolve, glitch reveals
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

// --- EVOLVING MULTI-HARMONIC RESONANCE ---
const playQuantumResonance = (base: number, harmonics = 5, themeShift = 0) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    for (let i = 1; i <= harmonics; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i % 2 === 0 ? 'sine' : 'sawtooth';
      osc.frequency.value = base * i + themeShift;
      gain.gain.value = 0.15 / i;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5 + i * 0.05);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.03);
      osc.stop(ctx.currentTime + 0.6 + i * 0.05);
    }
  } catch (e) {}
};

// --- SINGULARITY DISSOLVE PARTICLES ---
const quantumDissolve = (color: string) => {
  const container = document.createElement('div');
  container.className = 'fixed inset-0 pointer-events-none z-50';
  document.body.appendChild(container);
  for (let i = 0; i < 80; i++) {
    const p = document.createElement('div');
    p.style.position = 'absolute';
    p.style.width = `${Math.random() * 8 + 3}px`;
    p.style.height = p.style.width;
    p.style.background = color;
    p.style.borderRadius = '50%';
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${Math.random() * 100}%`;
    p.style.boxShadow = `0 0 30px ${color}`;
    p.style.opacity = '0';
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 600 + 300;
    p.animate([
      { opacity: 0, transform: 'scale(0)' },
      { opacity: 1, transform: 'scale(1.5)' },
      { opacity: 0, transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)` }
    ], { duration: 1500, easing: 'ease-out' }).onfinish = () => p.remove();
    container.appendChild(p);
  }
  setTimeout(() => container.remove(), 2000);
};

// --- DUAL-LAYER HOLOGRAPHIC FIELD ---
const HolographicField = ({ accent }: { accent: string }) => {
  const fgRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fg = fgRef.current?.getContext('2d');
    const bg = bgRef.current?.getContext('2d');
    if (!fg || !bg) return;

    const resize = () => {
      if (fgRef.current && bgRef.current) {
        fgRef.current.width = window.innerWidth;
        fgRef.current.height = window.innerHeight;
        bgRef.current.width = window.innerWidth;
        bgRef.current.height = window.innerHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    const animate = () => {
      fg.fillStyle = 'rgba(0,0,0,0.03)';
      fg.fillRect(0, 0, fg.canvas.width, fg.canvas.height);
      bg.fillStyle = 'rgba(0,0,0,0.02)';
      bg.fillRect(0, 0, bg.canvas.width, bg.canvas.height);

      // Background slow waves
      bg.strokeStyle = accent + '20';
      bg.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        bg.beginPath();
        bg.moveTo(0, bg.canvas.height / 2);
        for (let x = 0; x < bg.canvas.width; x += 30) {
          bg.lineTo(x, bg.canvas.height / 2 + Math.sin(time / 2 + x / 100 + i) * 150);
        }
        bg.stroke();
      }

      // Foreground fast pulses
      fg.strokeStyle = accent + '60';
      fg.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        fg.beginPath();
        fg.moveTo(0, fg.canvas.height / 2);
        for (let x = 0; x < fg.canvas.width; x += 20) {
          fg.lineTo(x, fg.canvas.height / 2 + Math.cos(time * 2 + x / 50 + i) * 80);
        }
        fg.stroke();
      }

      time += 0.03;
      requestAnimationFrame(animate);
    };
    animate();

    return () => window.removeEventListener('resize', resize);
  }, [accent]);

  return (
    <>
      <canvas ref={bgRef} className="fixed inset-0 pointer-events-none z-0 opacity-30" />
      <canvas ref={fgRef} className="fixed inset-0 pointer-events-none z-0 opacity-50" />
    </>
  );
};

const App: React.FC = () => {
  const [booting, setBooting] = useState(true);
  const [company, setCompany] = useState<'GLX' | 'BST' | ''>('');
  const [driver, setDriver] = useState('');
  const [loadId, setLoadId] = useState('');
  const [pu, setPu] = useState({ city: '', st: '' });
  const [del, setDel] = useState({ city: '', st: '' });
  const [bol, setBol] = useState<'pickup' | 'delivery' | ''>('');
  const [assets, setAssets] = useState<{ id: string; file: File; preview: string; progress: number }[]>([]);
  const [transmitting, setTransmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
  const accent = company === 'GLX' ? '#10b981' : company === 'BST' ? '#a855f7' : '#06b6d4';
  const themeShift = company === 'GLX' ? 0 : company === 'BST' ? 200 : 100;

  const avgProgress = useMemo(() => assets.length ? Math.round(assets.reduce((s, a) => s + a.progress, 0) / assets.length) : 0, [assets]);

  useEffect(() => {
    setTimeout(() => {
      setBooting(false);
      playQuantumResonance(120, 8, themeShift);
    }, 3200);
  }, [themeShift]);

  const ingest = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    playQuantumResonance(1400, 6, themeShift);
    const newAssets = Array.from(e.target.files).map(f => ({
      id: crypto.randomUUID(),
      file: f,
      preview: URL.createObjectURL(f),
      progress: 0
    }));
    setAssets(p => [...p, ...newAssets]);
  }, [themeShift]);

  const dissolve = useCallback((id: string) => {
    playQuantumResonance(80, 4, themeShift);
    quantumDissolve(accent);
    setAssets(p => p.filter(a => a.id !== id));
  }, [accent, themeShift]);

  const executeSingularity = async () => {
    if (assets.length === 0) return;
    setTransmitting(true);
    playQuantumResonance(50, 10, themeShift);

    const uploads = assets.map(async (item) => {
      const sRef = storageRef(storage, `prime_v27/${item.id}`);
      const task = uploadBytesResumable(sRef, item.file);
      return new Promise<string>((res) => {
        task.on('state_changed', s => {
          const p = (s.bytesTransferred / s.totalBytes) * 100;
          setAssets(prev => prev.map(a => a.id === item.id ? { ...a, progress: p } : a));
          if (p % 15 === 0) playQuantumResonance(500 + p * 5, 3, themeShift);
        }, () => {}, async () => res(await getDownloadURL(task.snapshot.ref)));
      });
    });

    const urls = await Promise.all(uploads);
    await addDoc(collection(db, "singularity_prime_2026"), {
      driver, company, loadId, route: `${pu.city}, ${pu.st} → ${del.city}, ${del.st}`, bol, assets: urls, timestamp: serverTimestamp()
    });

    playQuantumResonance(2200, 12, themeShift);
    setComplete(true);
  };

  if (booting) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-20">
          <div className="w-64 h-64 rounded-full border-8 border-zinc-800 animate-spin" style={{ borderTopColor: accent }} />
          <h1 className="text-6xl font-black text-white tracking-tighter">2026_SINGULARITY_PRIME</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-orbitron relative overflow-hidden" style={{ '--accent': accent } as any}>
      <HolographicField accent={accent} />
      <div className="fixed inset-0 pointer-events-none opacity-30 bg-gradient-to-br from-[var(--accent)]/20 via-transparent to-purple-900/20" />

      <div className="max-w-7xl mx-auto p-12 relative z-10">
        <header className="text-center mb-32">
          <h1 className="text-9xl font-black text-white uppercase tracking-tighter glitch-2026" data-text="AURORA_NEXUS_v27">AURORA_NEXUS_v27</h1>
          <p className="text-2xl text-zinc-500 tracking-[2em] mt-12">2026 // PRIME_SINGULARITY</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <main className="lg:col-span-8 space-y-20">
            {/* Glass Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="p-12 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl group hover:border-[var(--accent)] transition-all">
                <label className="text-lg uppercase tracking-widest text-zinc-400 mb-8 block">FLEET_CORE</label>
                <select className="w-full bg-transparent text-4xl text-white outline-none" value={company} onChange={e => { playQuantumResonance(700, 5, 0); setCompany(e.target.value as any); }}>
                  <option value="">VOID</option>
                  <option value="GLX">GLX_PRIME</option>
                  <option value="BST">BST_SINGULARITY</option>
                </select>
              </div>
              <div className="p-12 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl">
                <label className="text-lg uppercase tracking-widest text-zinc-400 mb-8 block">OPERATOR</label>
                <input className="w-full bg-transparent text-4xl text-white outline-none" placeholder="ID" value={driver} onChange={e => setDriver(e.target.value)} />
              </div>
              <div className="p-12 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl">
                <label className="text-lg uppercase tracking-widest text-zinc-400 mb-8 block">LOAD</label>
                <input className="w-full bg-transparent text-4xl text-white outline-none" placeholder="REF" value={loadId} onChange={e => setLoadId(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-16">
              <div className="p-20 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl">
                <h3 className="text-2xl uppercase tracking-widest mb-12">ORIGIN</h3>
                <input className="w-full bg-transparent border-b-4 border-white/30 text-3xl pb-8 mb-12 focus:border-[var(--accent)]" placeholder="CITY" value={pu.city} onChange={e => setPu({...pu, city: e.target.value})} />
                <select className="w-full bg-transparent text-3xl" value={pu.st} onChange={e => setPu({...pu, st: e.target.value})}>
                  <option>ST</option>{states.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="p-20 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl">
                <h3 className="text-2xl uppercase tracking-widest mb-12">DESTINATION</h3>
                <input className="w-full bg-transparent border-b-4 border-white/30 text-3xl pb-8 mb-12 focus:border-[var(--accent)]" placeholder="CITY" value={del.city} onChange={e => setDel({...del, city: e.target.value})} />
                <select className="w-full bg-transparent text-3xl" value={del.st} onChange={e => setDel({...del, st: e.target.value})}>
                  <option>ST</option>{states.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="p-32 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl text-center">
              <div className="flex justify-center gap-48">
                <button onClick={() => document.getElementById('cam')?.click()} className="group">
                  <div className="w-56 h-56 bg-white/5 rounded-full border-8 border-white/20 flex items-center justify-center group-hover:border-[var(--accent)] group-hover:shadow-[0_0_120px_var(--accent)50]">
                    <span className="text-10xl">📷</span>
                  </div>
                  <p className="mt-12 text-2xl uppercase tracking-widest group-hover:text-[var(--accent)]">SCAN</p>
                </button>
                <button onClick={() => document.getElementById('file')?.click()} className="group">
                  <div className="w-56 h-56 bg-white/5 rounded-full border-8 border-white/20 flex items-center justify-center group-hover:border-[var(--accent)] group-hover:shadow-[0_0_120px_var(--accent)50]">
                    <span className="text-10xl">📁</span>
                  </div>
                  <p className="mt-12 text-2xl uppercase tracking-widest group-hover:text-[var(--accent)]">INGEST</p>
                </button>
              </div>
            </div>
          </main>

          <aside className="lg:col-span-4 space-y-20">
            <div className="space-y-12">
              {(['pickup', 'delivery'] as const).map(t => (
                <button key={t} onClick={() => setBol(t)} className={`w-full py-16 text-4xl uppercase border-8 rounded-3xl ${bol === t ? 'border-[var(--accent)] bg-[var(--accent)]/20 shadow-2xl' : 'border-white/20'}`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-10 min-h-[500px]">
              {assets.map(a => (
                <div key={a.id} className="relative group rounded-3xl overflow-hidden border-4 border-white/10">
                  <img src={a.preview} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all" />
                  <div className="absolute bottom-0 left-0 h-6 w-full bg-[var(--accent)] shadow-[0_0_30px_var(--accent)]" style={{ width: `${a.progress}%` }} />
                  <button onClick={() => dissolve(a.id)} className="absolute top-6 right-6 bg-black/70 px-8 py-4 text-white opacity-0 group-hover:opacity-100 text-2xl uppercase">DISSOLVE</button>
                </div>
              ))}
            </div>

            <button onClick={executeSingularity} disabled={transmitting || assets.length === 0} className="w-full py-32 text-6xl font-black uppercase bg-white/10 backdrop-blur-xl border-8 border-white/30 hover:border-[var(--accent)] hover:bg-[var(--accent)]/20 hover:text-white disabled:opacity-50">
              {transmitting ? `PRIME_${avgProgress}%` : 'EXECUTE_SINGULARITY'}
            </button>
          </aside>
        </div>
      </div>

      {complete && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-32">
          <div className="text-center space-y-40">
            <div className="text-[30rem] leading-none" style={{ color: accent }}>✓</div>
            <h2 className="text-10xl font-black text-white uppercase tracking-tighter">2026_ACHIEVED</h2>
            <button onClick={() => location.reload()} className="px-48 py-24 border-12 border-white text-5xl text-white hover:bg-white hover:text-black uppercase tracking-[1em]">
              RETURN
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .glitch-2026 {
          position: relative;
          animation: glitch-pulse 4s infinite;
        }
        .glitch-2026::before, .glitch-2026::after {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          opacity: 0.8;
        }
        .glitch-2026::before {
          animation: glitch-1 3s infinite;
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
          transform: translate(-2px, -2px);
          color: #00ffff;
        }
        .glitch-2026::after {
          animation: glitch-2 2s infinite;
          clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
          transform: translate(2px, 2px);
          color: #ff00ff;
        }
        @keyframes glitch-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.9; } }
        @keyframes glitch-1 { 0% { clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%); } 100% { clip-path: polygon(0 30%, 100% 30%, 100% 70%, 0 70%); } }
        @keyframes glitch-2 { 0% { clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%); } 100% { clip-path: polygon(0 40%, 100% 40%, 100% 80%, 0 80%); } }
      `}</style>

      <input type="file" id="file" className="hidden" multiple accept="image/*" onChange={ingest} />
      <input type="file" id="cam" className="hidden" capture="environment" accept="image/*" onChange={ingest} />
    </div>
  );
};

export default App;