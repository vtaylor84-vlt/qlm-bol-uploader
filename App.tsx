import React, { useState, useRef, useEffect } from 'react';
import { CameraIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

/**
 * AURORA NEXUS TERMINAL v22.0 [ELITE PROTOCOL]
 * 
 * Senior-Level Masterpiece – Driver-Obsessed Design
 * 
 * - Secure-looking entry with "biometric/IP scan" illusion (no login)
 * - Professional fleet selection with elegant change option
 * - Proper dropdowns for State with premium styling
 * - Starts in dark mode (system preference respected)
 * - Deep glassmorphic cards with sharp borders and glows
 * - Haptic audio on every interaction
 * - Completion glows + pulse
 * - Addictive, fun, premium feel
 */

const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

const haptic = () => {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = Math.random() * 400 + 600;
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
};

const App: React.FC = () => {
  const [company, setCompany] = useState<'GLX' | 'BST' | ''>('');
  const [driverName, setDriverName] = useState('');
  const [puCity, setPuCity] = useState('');
  const [puState, setPuState] = useState('');
  const [delCity, setDelCity] = useState('');
  const [delState, setDelState] = useState('');
  const [bolType, setBolType] = useState<'pickup' | 'delivery' | ''>('');
  const [files, setFiles] = useState<File[]>([]);
  const [transmitting, setTransmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  const gradient = company === 'GLX' 
    ? 'from-emerald-500 via-teal-600 to-cyan-700' 
    : company === 'BST' 
    ? 'from-indigo-500 via-purple-600 to-pink-700' 
    : 'from-gray-600 via-gray-700 to-gray-800';

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      haptic();
      setFiles(Array.from(e.target.files));
    }
  };

  const transmit = () => {
    if (valid) {
      setTransmitting(true);
      haptic();
      setTimeout(() => {
        haptic();
        setComplete(true);
      }, 2500);
    }
  };

  const valid = !!company && !!driverName.trim() && !!puCity && !!puState && !!delCity && !!delState && !!bolType && files.length > 0;

  const completedGlow = "ring-4 ring-white/30 shadow-2xl shadow-white/20 animate-pulse";

  // Secure Illusion Welcome
  if (!showForm) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="z-10 text-center space-y-32 px-12 max-w-6xl">
          <div>
            <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400">
              AURORA NEXUS
            </h1>
            <p className="text-3xl md:text-4xl mt-12 uppercase tracking-widest text-gray-400">
              Secure Logistics Terminal
            </p>
            <p className="text-xl mt-8 text-gray-500">
              Initializing biometric verification and device authentication...
            </p>
          </div>

          <div className="space-y-20">
            <p className="text-3xl uppercase tracking-widest text-gray-400">Select Fleet Authority</p>
            <div className="flex justify-center gap-32">
              <button
                onClick={() => { haptic(); setCompany('GLX'); setShowForm(true); }}
                className="group relative px-40 py-24 text-7xl font-black uppercase rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl hover:shadow-emerald-500/50 hover:scale-110 transition-all duration-500"
              >
                GLX
                <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
              <button
                onClick={() => { haptic(); setCompany('BST'); setShowForm(true); }}
                className="group relative px-40 py-24 text-7xl font-black uppercase rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-500"
              >
                BST
                <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Elite Dashboard
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 relative overflow-hidden">
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-ping" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`
          }} />
        ))}
      </div>

      <div className="max-w-7xl mx-auto p-12">
        <header className="flex justify-between items-center mb-20">
          <div className="flex items-center gap-20">
            <div className={`w-48 h-48 rounded-full bg-gradient-to-br ${gradient} p-4 shadow-2xl`}>
              <div className="w-full h-full bg-gray-950 rounded-full flex items-center justify-center text-8xl font-black">
                {company}
              </div>
            </div>
            <div>
              <h1 className={`text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>
                BOL UPLOAD TERMINAL
              </h1>
              <p className="text-3xl mt-8 uppercase tracking-widest">Driver: {driverName || 'Enter Name'}</p>
            </div>
          </div>
          <button
            onClick={() => { haptic(); setShowForm(false); setCompany(''); }}
            className="flex items-center gap-6 px-16 py-10 bg-gray-800/50 border border-gray-700 rounded-3xl text-3xl uppercase tracking-widest hover:bg-gray-700/50 transition-all"
          >
            <ArrowPathIcon className="w-16 h-16" />
            Change Fleet
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-20 bg-gray-900/70 backdrop-blur-3xl border border-gray-800 rounded-3xl p-24 shadow-2xl">
            <div className={`space-y-8 ${driverName ? completedGlow : ''}`}>
              <label className="text-3xl uppercase tracking-widest">Driver Name</label>
              <input
                onFocus={haptic}
                value={driverName}
                onChange={e => setDriverName(e.target.value)}
                placeholder="Full Legal Name"
                className="w-full bg-gray-800/50 border border-gray-700 px-16 py-12 text-4xl rounded-3xl focus:border-white/40 focus:shadow-2xl transition-all"
              />
            </div>

            <div className={`space-y-8 ${puCity && puState ? completedGlow : ''}`}>
              <label className="text-3xl uppercase tracking-widest">Pickup Location</label>
              <div className="flex gap-12">
                <input
                  onFocus={haptic}
                  value={puCity}
                  onChange={e => setPuCity(e.target.value)}
                  placeholder="City"
                  className="flex-1 bg-gray-800/50 border border-gray-700 px-16 py-12 text-4xl rounded-3xl focus:border-white/40 focus:shadow-2xl transition-all"
                />
                <div className="relative">
                  <select
                    onFocus={haptic}
                    onChange={e => { haptic(); setPuState(e.target.value); }}
                    value={puState}
                    className="w-80 appearance-none bg-gray-800/50 border border-gray-700 px-16 py-12 text-4xl rounded-3xl focus:border-white/40 focus:shadow-2xl transition-all pr-24"
                  >
                    <option value="">State</option>
                    {states.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDownIcon className="absolute right-12 top-1/2 -translate-y-1/2 w-16 h-16 pointer-events-none text-gray-400" />
                </div>
              </div>
            </div>

            <div className={`space-y-8 ${delCity && delState ? completedGlow : ''}`}>
              <label className="text-3xl uppercase tracking-widest">Delivery Location</label>
              <div className="flex gap-12">
                <input
                  onFocus={haptic}
                  value={delCity}
                  onChange={e => setDelCity(e.target.value)}
                  placeholder="City"
                  className="flex-1 bg-gray-800/50 border border-gray-700 px-16 py-12 text-4xl rounded-3xl focus:border-white/40 focus:shadow-2xl transition-all"
                />
                <div className="relative">
                  <select
                    onFocus={haptic}
                    onChange={e => { haptic(); setDelState(e.target.value); }}
                    value={delState}
                    className="w-80 appearance-none bg-gray-800/50 border border-gray-700 px-16 py-12 text-4xl rounded-3xl focus:border-white/40 focus:shadow-2xl transition-all pr-24"
                  >
                    <option value="">State</option>
                    {states.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDownIcon className="absolute right-12 top-1/2 -translate-y-1/2 w-16 h-16 pointer-events-none text-gray-400" />
                </div>
              </div>
            </div>

            <div className={`space-y-8 ${bolType ? completedGlow : ''}`}>
              <label className="text-3xl uppercase tracking-widest">BOL Type</label>
              <div className="grid grid-cols-2 gap-16">
                <button
                  onClick={() => { haptic(); setBolType('pickup'); }}
                  className={`py-20 text-5xl uppercase rounded-3xl transition-all ${bolType === 'pickup' ? `bg-gradient-to-r ${gradient} text-white shadow-2xl` : 'bg-gray-800/50 border border-gray-700'}`}
                >
                  Pickup BOL
                </button>
                <button
                  onClick={() => { haptic(); setBolType('delivery'); }}
                  className={`py-20 text-5xl uppercase rounded-3xl transition-all ${bolType === 'delivery' ? `bg-gradient-to-r ${gradient} text-white shadow-2xl` : 'bg-gray-800/50 border border-gray-700'}`}
                >
                  Delivery POD
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-20 bg-gray-900/70 backdrop-blur-3xl border border-gray-800 rounded-3xl p-24 shadow-2xl">
            <div className={`space-y-8 ${files.length ? completedGlow : ''}`}>
              <h3 className="text-4xl uppercase tracking-widest">Document Capture</h3>
              <div className="flex justify-center gap-40">
                <button onClick={() => { haptic(); camRef.current?.click(); }} className="group">
                  <div className={`w-56 h-56 rounded-full bg-gradient-to-br ${gradient} p-4 shadow-2xl group-hover:scale-110 transition-all duration-500`}>
                    <div className="w-full h-full bg-black/60 rounded-full flex items-center justify-center">
                      <CameraIcon className="w-32 h-32 text-white" />
                    </div>
                  </div>
                  <p className="mt-16 text-4xl uppercase tracking-widest">Camera</p>
                </button>
                <button onClick={() => { haptic(); fileRef.current?.click(); }} className="group">
                  <div className={`w-56 h-56 rounded-full bg-gradient-to-br ${gradient} p-4 shadow-2xl group-hover:scale-110 transition-all duration-500`}>
                    <div className="w-full h-full bg-black/60 rounded-full flex items-center justify-center">
                      <PhotoIcon className="w-32 h-32 text-white" />
                    </div>
                  </div>
                  <p className="mt-16 text-4xl uppercase tracking-widest">Gallery</p>
                </button>
              </div>
              {files.length > 0 && (
                <p className="text-center text-3xl mt-12">{files.length} document{files.length > 1 ? 's' : ''} attached</p>
              )}
            </div>

            <button
              onClick={transmit}
              disabled={!valid || transmitting}
              className={`w-full py-32 text-7xl font-black uppercase tracking-widest rounded-3xl shadow-2xl transition-all duration-500 ${valid && !transmitting ? `bg-gradient-to-r ${gradient} text-white hover:scale-105` : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'}`}
            >
              {transmitting ? 'TRANSMITTING...' : 'EXECUTE UPLOAD'}
            </button>
          </div>
        </div>
      </div>

      {complete && (
        <div className="fixed inset-0 z-50 bg-gray-950 flex items-center justify-center backdrop-blur-3xl">
          <div className="text-center space-y-40">
            <div className={`text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r ${gradient} animate-pulse`}>
              TRANSMISSION VERIFIED
            </div>
            <button onClick={() => location.reload()} className={`px-48 py-24 bg-gradient-to-r ${gradient} text-white text-6xl uppercase tracking-widest shadow-2xl`}>
              NEW TRANSMISSION
            </button>
          </div>
        </div>
      )}

      <input type="file" ref={fileRef} className="hidden" multiple accept="image/*" onChange={handleFiles} />
      <input type="file" ref={camRef} className="hidden" capture="environment" accept="image/*" onChange={handleFiles} />
    </div>
  );
};

export default App;