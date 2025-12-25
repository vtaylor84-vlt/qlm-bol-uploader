import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * AURORA NEXUS v25.0 [SINGULARITY EDITION]
 * -----------------------------------------------------------
 * DESIGN: Holographic Plasma / Glitch-Reveal Brutalist
 * SOUND: Adaptive Multi-Resonance FM Synthesis
 * ENGINE: Canvas Holographic Field + Quantum Particles + Firebase
 * FEATURES: Glitch transitions, dissolve removal, evolving haptics
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

// --- ADAPTIVE MULTI-RESONANCE ENGINE ---
const playSingularityHaptic = (base: number, layers = 3, intensity = 0.2) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    for (let i = 0; i < layers; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = base + (i * 200);
      gain.gain.value = intensity / (i + 1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4 + i * 0.1);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + 0.5 + i * 0.1);
    }
  } catch (e) {}
};

// --- QUANTUM DISSOLVE PARTICLES ---
const dissolveAsset = (color: string) => {
  const container = document.createElement('div');
  container.className = 'fixed inset-0 pointer-events-none z-50';
  document.body.appendChild(container);
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.style.position = 'absolute';
    p.style.width = `${Math.random() * 6 + 2}px`;
    p.style.height = p.style.width;
    p.style.background = color;
    p.style.borderRadius = '50%';
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${Math.random() * 100}%`;
    p.style.opacity = '0';
    p.style.boxShadow = `0 0 20px ${color}`;
    p.animate([
      { opacity: 0, transform: 'scale(0)' },
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(0) translateY(-300px)' }
    ], { duration: 1200 + Math.random() * 800, easing: 'ease-out' }).onfinish = () => p.remove();
    container.appendChild(p);
  }
  setTimeout(() => container.remove(), 2000);
};

// --- HOLOGRAPHIC PLASMA FIELD ---
const HoloField = ({ accent }: { accent: string }) => {
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
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = accent + '30';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2 + Math.sin(time + i) * 100);
        for (let x = 0; x < canvas.width; x += 20) {
          ctx.lineTo(x, canvas.height / 2 + Math.sin(time + x / 50 + i) * 100);
        }
        ctx.stroke();
      }
      time += 0.02;
      requestAnimationFrame(animate);
    };
    animate();
  }, [accent]);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />;
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
  const [success, setSuccess] = useState(false);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
  const accent = company === 'GLX' ? '#10b981' : company === 'BST' ? '#8b5cf6' : '#f43f5e';

  const progressAvg = useMemo(() => assets.length ? Math.round(assets.reduce((a, f) => a + f.progress, 0) / assets.length) : 0, [assets]);

  useEffect(() => {
    setTimeout(() => {
      setBooting(false);
      playSingularityHaptic(200, 5, 0.3);
    }, 3000);
  }, []);

  const ingestFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    playSingularityHaptic(1200, 4);
    const newAssets = Array.from(e.target.files).map(f => ({
      id: crypto.randomUUID(),
      file: f,
      preview: URL.createObjectURL(f),
      progress: 0
    }));
    setAssets(prev => [...prev, ...newAssets]);
  }, []);

  const eraseAsset = useCallback((id: string) => {
    playSingularityHaptic(100, 3, 0.4);
    dissolveAsset(accent);
    setAssets(prev => prev.filter(a => a.id !== id));
  }, [accent]);

  const forgeLink = async () => {
    if (assets.length === 0) return;
    setTransmitting(true);
    playSingularityHaptic(60, 6, 0.4);

    const tasks = assets.map(async (item) => {
      const sRef = storageRef(storage, `singularity_v25/${item.id}`);
      const task = uploadBytesResumable(sRef, item.file);
      return new Promise<string>((resolve) => {
        task.on('state_changed', snap => {
          const p = (snap.bytesTransferred / snap.totalBytes) * 100;
          setAssets(prev => prev.map(a => a.id === item.id ? { ...a, progress: p } : a));
          playSingularityHaptic(400 + p * 4, 2, 0.1);
        }, () => {}, async () => resolve(await getDownloadURL(task.snapshot.ref)));
      });
    });

    const urls = await Promise.all(tasks);
    await addDoc(collection(db, "singularity_logs"), {
      driver, company, loadId, pu, del, bol, urls, timestamp: serverTimestamp()
    });

    playSingularityHaptic(2000, 8, 0.5);
    setSuccess(true);
  };

  if (booting) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-black text-6xl tracking-tighter animate-pulse">
        SINGULARITY_AWAKENING
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-orbitron overflow-hidden relative" style={{ '--accent': accent } as any}>
      <HoloField accent={accent} />
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-gradient-to-br from-[var(--accent)]/40 via-transparent to-purple-900/20" />

      <div className="max-w-7xl mx-auto p-12 relative z-10">
        {/* Header */}
        <header className="mb-24 text-center">
          <h1 className="text-9xl font-black text-white tracking-tighter uppercase glitch" data-text="SINGULARITY_v25">SINGULARITY_v25</h1>
          <p className="text-xl text-zinc-500 tracking-[1em] mt-8">QUANTUM_FORGE_ACTIVE</p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left: Inputs */}
          <div className="space-y-12">
            <select className="w-full bg-zinc-950/80 border border-zinc-800 p-8 text-3xl text-white" value={company} onChange={e => { playSingularityHaptic(600); setCompany(e.target.value as any); }}>
              <option value="">SELECT_FLEET</option>
              <option value="GLX">GLX_SINGULARITY</option>
              <option value="BST">BST_OVERMIND</option>
            </select>
            <input className="w-full bg-zinc-950/80 border border-zinc-800 p-8 text-3xl text-white placeholder-zinc-600" placeholder="DRIVER_ID" value={driver} onChange={e => setDriver(e.target.value)} />
            <input className="w-full bg-zinc-950/80 border border-zinc-800 p-8 text-3xl text-white placeholder-zinc-600" placeholder="LOAD_HASH" value={loadId} onChange={e => setLoadId(e.target.value)} />
          </div>

          {/* Center: Route + Capture */}
          <div className="space-y-16">
            <div className="bg-zinc-950/60 border border-zinc-800 p-16">
              <h3 className="text-2xl uppercase tracking-widest mb-12 text-zinc-500">ROUTE_MATRIX</h3>
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <input placeholder="PU_CITY" className="w-full bg-transparent border-b-4 border-zinc-700 text-2xl pb-6 focus:border-[var(--accent)]" value={pu.city} onChange={e => setPu({...pu, city: e.target.value})} />
                  <select className="w-full mt-8 text-2xl bg-transparent" value={pu.st} onChange={e => setPu({...pu, st: e.target.value})}>
                    <option>ST</option>{states.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <input placeholder="DEL_CITY" className="w-full bg-transparent border-b-4 border-zinc-700 text-2xl pb-6 focus:border-[var(--accent)]" value={del.city} onChange={e => setDel({...del, city: e.target.value})} />
                  <select className="w-full mt-8 text-2xl bg-transparent" value={del.st} onChange={e => setDel({...del, st: e.target.value})}>
                    <option>ST</option>{states.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-32">
              <button onClick={() => document.getElementById('cam')?.click()} className="text-center">
                <div className="w-48 h-48 bg-zinc-900 border-8 border-zinc-800 rounded-3xl flex items-center justify-center hover:border-[var(--accent)] hover:shadow-[0_0_100px_var(--accent)40]">
                  <span className="text-9xl">📷</span>
                </div>
                <p className="mt-8 text-xl uppercase tracking-widest">SCAN</p>
              </button>
              <button onClick={() => document.getElementById('file')?.click()} className="text-center">
                <div className="w-48 h-48 bg-zinc-900 border-8 border-zinc-800 rounded-3xl flex items-center justify-center hover:border-[var(--accent)] hover:shadow-[0_0_100px_var(--accent)40]">
                  <span className="text-9xl">📁</span>
                </div>
                <p className="mt-8 text-xl uppercase tracking-widest">INGEST</p>
              </button>
            </div>
          </div>

          {/* Right: Protocol + Assets + Forge */}
          <div className="space-y-16">
            <div className="space-y-8">
              {(['pickup', 'delivery'] as const).map(t => (
                <button key={t} onClick={() => setBol(t)} className={`w-full py-12 text-3xl uppercase border-4 ${bol === t ? 'border-[var(--accent)] bg-[var(--accent)]/20' : 'border-zinc-800'}`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-8 min-h-[400px]">
              {assets.map(a => (
                <div key={a.id} className="relative group">
                  <img src={a.preview} className="w-full h-full object-cover rounded-xl opacity-80 group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 h-4 w-full bg-[var(--accent)]" style={{ width: `${a.progress}%` }} />
                  <button onClick={() => eraseAsset(a.id)} className="absolute top-4 right-4 bg-red-900/80 px-6 py-3 text-white opacity-0 group-hover:opacity-100">DISSOLVE</button>
                </div>
              ))}
            </div>

            <button onClick={forgeLink} disabled={transmitting || assets.length === 0} className="w-full py-24 text-5xl font-black uppercase bg-white text-black hover:bg-[var(--accent)] hover:text-white disabled:bg-zinc-800 disabled:text-zinc-600">
              {transmitting ? `FORGING_${progressAvg}%` : 'FORGE_LINK'}
            </button>
          </div>
        </div>
      </div>

      {success && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <div className="text-center space-y-32">
            <div className="text-[20rem] text-[var(--accent)] animate-pulse">✓</div>
            <h2 className="text-9xl font-black text-white uppercase">SINGULARITY_ACHIEVED</h2>
            <button onClick={() => location.reload()} className="px-40 py-20 border-8 border-white text-4xl text-white hover:bg-white hover:text-black">
              RETURN_TO_REALITY
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .glitch {
          position: relative;
        }
        .glitch::before, .glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          clip: rect(0, 900px, 0, 0);
          animation: glitch-anim 3s infinite linear alternate-reverse;
        }
        .glitch::before {
          left: 2px; text-shadow: -2px 0 #ff00c1;
          animation: glitch-anim 2s infinite linear alternate-reverse;
        }
        .glitch::after {
          left: -2px; text-shadow: 2px 0 #00ffff;
        }
        @keyframes glitch-anim {
          0% { clip: rect(20px, 9999px, 50px, 0); }
          100% { clip: rect(100px, 9999px, 120px, 0); }
        }
      `}</style>

      <input type="file" id="file" className="hidden" multiple accept="image/*" onChange={ingestFiles} />
      <input type="file" id="cam" className="hidden" capture="environment" accept="image/*" onChange={ingestFiles} />
    </div>
  );
};

export default App;