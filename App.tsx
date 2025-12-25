import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CameraIcon, PhotoIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

const haptic = (type: 'focus' | 'select' | 'add' | 'transmit' | 'success') => {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  const freq = type === 'success' ? 1300 : type === 'transmit' ? 220 : type === 'add' ? 950 : type === 'select' ? 700 : 550;
  osc.frequency.value = freq;
  osc.type = type === 'success' ? 'triangle' : 'sine';

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

  osc.start();
  osc.stop(ctx.currentTime + 0.3);
};

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [company, setCompany] = useState<'GLX' | 'BST' | ''>('');
  const [driverName, setDriverName] = useState('');
  const [puCity, setPuCity] = useState('');
  const [puState, setPuState] = useState('');
  const [delCity, setDelCity] = useState('');
  const [delState, setDelState] = useState('');
  const [bolType, setBolType] = useState<'pickup' | 'delivery' | ''>('');
  const [files, setFiles] = useState<File[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [transmitting, setTransmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-50';
  const text = darkMode ? 'text-gray-100' : 'text-gray-900';
  const cardBg = darkMode ? 'bg-gray-900/80' : 'bg-white/80';
  const inputBg = darkMode ? 'bg-gray-800/60' : 'bg-gray-100/60';
  const border = darkMode ? 'border-gray-700' : 'border-gray-300';

  const gradient = company === 'GLX' 
    ? 'from-emerald-500 via-teal-600 to-cyan-700' 
    : company === 'BST' 
    ? 'from-indigo-500 via-purple-600 to-pink-700' 
    : 'from-cyan-500 via-blue-600 to-purple-700';

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      haptic('add');
      setFiles(Array.from(e.target.files));
    }
  };

  const transmit = () => {
    if (valid) {
      setTransmitting(true);
      haptic('transmit');
      // Simulate upload
      setTimeout(() => {
        haptic('success');
        setComplete(true);
      }, 2000);
    }
  };

  const valid = !!company && !!driverName.trim() && !!puCity && !!puState && !!delCity && !!delState && !!bolType && files.length > 0;

  const completedGlow = "ring-8 ring-white/40 shadow-2xl animate-pulse";

  // Welcome Screen – Open Access
  if (!showForm) {
    return (
      <div className={`min-h-screen ${bg} ${text} flex items-center justify-center relative overflow-hidden transition-all duration-1000`}>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-purple-600/20 to-pink-600/20" />
        <div className="z-10 text-center space-y-32 px-12 max-w-6xl">
          <div>
            <h1 className={`text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>
              AURORA NEXUS
            </h1>
            <p className="text-4xl md:text-5xl mt-12 uppercase tracking-widest">Secure BOL Upload Terminal</p>
            <p className="text-2xl mt-8">Instant Access • No Login Required</p>
          </div>

          <div className="space-y-20">
            <p className="text-3xl uppercase tracking-widest">Select Your Fleet</p>
            <div className="flex justify-center gap-32">
              <button
                onClick={() => { haptic('select'); setCompany('GLX'); setShowForm(true); }}
                className="px-32 py-20 text-6xl font-black uppercase rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl hover:scale-110 transition-all duration-500"
              >
                GLX
              </button>
              <button
                onClick={() => { haptic('select'); setCompany('BST'); setShowForm(true); }}
                className="px-32 py-20 text-6xl font-black uppercase rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl hover:scale-110 transition-all duration-500"
              >
                BST
              </button>
            </div>
          </div>

          <button
            onClick={() => { haptic('toggle'); setDarkMode(!darkMode); }}
            className="fixed top-8 right-8 p-8 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
          >
            {darkMode ? <SunIcon className="w-12 h-12" /> : <MoonIcon className="w-12 h-12" />}
          </button>
        </div>
      </div>
    );
  }

  // Main Form Dashboard
  return (
    <div className={`min-h-screen ${bg} ${text} relative overflow-hidden`}>
      {/* Background particles */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-ping" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`
          }} />
        ))}
      </div>

      <div className="max-w-6xl mx-auto p-12">
        <header className="flex justify-between items-center mb-20">
          <div className="flex items-center gap-16">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${gradient} p-3 shadow-2xl`}>
              <div className={`w-full h-full ${cardBg} rounded-full flex items-center justify-center text-6xl font-black`}>
                {company}
              </div>
            </div>
            <div>
              <h1 className={`text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>
                BOL UPLOAD TERMINAL
              </h1>
              <p className="text-3xl mt-6 uppercase tracking-widest">Driver: {driverName || 'Enter Name'}</p>
            </div>
          </div>
          <button
            onClick={() => { haptic('toggle'); setDarkMode(!darkMode); }}
            className={`p-8 rounded-full ${cardBg} border ${border} shadow-2xl`}
          >
            {darkMode ? <SunIcon className="w-12 h-12" /> : <MoonIcon className="w-12 h-12" />}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className={`space-y-12 ${cardBg} p-16 rounded-3xl border ${border} backdrop-blur-xl`}>
            <div className={`space-y-8 ${driverName ? completedGlow : ''}`}>
              <label className="text-2xl uppercase tracking-widest">Driver Name</label>
              <input
                onFocus={() => haptic('focus')}
                value={driverName}
                onChange={e => setDriverName(e.target.value)}
                placeholder="Full Name"
                className={`w-full ${inputBg} border ${border} px-10 py-8 text-3xl rounded-2xl focus:border-white/50 focus:shadow-2xl transition-all`}
              />
            </div>

            <div className={`space-y-8 ${puCity && puState ? completedGlow : ''}`}>
              <label className="text-2xl uppercase tracking-widest">Pickup Location</label>
              <div className="flex gap-8">
                <input
                  onFocus={() => haptic('focus')}
                  value={puCity}
                  onChange={e => setPuCity(e.target.value)}
                  placeholder="City"
                  className={`flex-1 ${inputBg} border ${border} px-10 py-8 text-3xl rounded-2xl focus:border-white/50 focus:shadow-2xl transition-all`}
                />
                <select
                  onFocus={() => haptic('focus')}
                  onChange={e => { haptic('select'); setPuState(e.target.value); }}
                  value={puState}
                  className={`w-48 ${inputBg} border ${border} px-8 py-8 text-3xl rounded-2xl focus:border-white/50 focus:shadow-2xl transition-all`}
                >
                  <option>State</option>
                  {states.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className={`space-y-8 ${delCity && delState ? completedGlow : ''}`}>
              <label className="text-2xl uppercase tracking-widest">Delivery Location</label>
              <div className="flex gap-8">
                <input
                  onFocus={() => haptic('focus')}
                  value={delCity}
                  onChange={e => setDelCity(e.target.value)}
                  placeholder="City"
                  className={`flex-1 ${inputBg} border ${border} px-10 py-8 text-3xl rounded-2xl focus:border-white/50 focus:shadow-2xl transition-all`}
                />
                <select
                  onFocus={() => haptic('focus')}
                  onChange={e => { haptic('select'); setDelState(e.target.value); }}
                  value={delState}
                  className={`w-48 ${inputBg} border ${border} px-8 py-8 text-3xl rounded-2xl focus:border-white/50 focus:shadow-2xl transition-all`}
                >
                  <option>State</option>
                  {states.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className={`space-y-8 ${bolType ? completedGlow : ''}`}>
              <label className="text-2xl uppercase tracking-widest">BOL Type</label>
              <div className="grid grid-cols-2 gap-12">
                <button
                  onClick={() => { haptic('select'); setBolType('pickup'); }}
                  className={`py-12 text-3xl uppercase rounded-2xl transition-all ${bolType === 'pickup' ? `bg-gradient-to-r ${gradient} text-white shadow-2xl` : `${inputBg} border ${border}`}`}
                >
                  Pickup BOL
                </button>
                <button
                  onClick={() => { haptic('select'); setBolType('delivery'); }}
                  className={`py-12 text-3xl uppercase rounded-2xl transition-all ${bolType === 'delivery' ? `bg-gradient-to-r ${gradient} text-white shadow-2xl` : `${inputBg} border ${border}`}`}
                >
                  Delivery POD
                </button>
              </div>
            </div>
          </div>

          <div className={`space-y-12 ${cardBg} p-16 rounded-3xl border ${border} backdrop-blur-xl`}>
            <div className={`space-y-8 ${files.length ? completedGlow : ''}`}>
              <h3 className="text-3xl uppercase tracking-widest">Document Capture</h3>
              <div className="flex justify-center gap-20">
                <button onClick={() => { haptic('select'); camRef.current?.click(); }} className="group">
                  <div className={`w-40 h-40 rounded-full bg-gradient-to-br ${gradient} p-2 shadow-2xl group-hover:scale-110 transition-all duration-500`}>
                    <div className="w-full h-full bg-black/50 rounded-full flex items-center justify-center">
                      <CameraIcon className="w-24 h-24 text-white" />
                    </div>
                  </div>
                  <p className="mt-8 text-2xl uppercase tracking-widest">Camera</p>
                </button>
                <button onClick={() => { haptic('select'); fileRef.current?.click(); }} className="group">
                  <div className={`w-40 h-40 rounded-full bg-gradient-to-br ${gradient} p-2 shadow-2xl group-hover:scale-110 transition-all duration-500`}>
                    <div className="w-full h-full bg-black/50 rounded-full flex items-center justify-center">
                      <PhotoIcon className="w-24 h-24 text-white" />
                    </div>
                  </div>
                  <p className="mt-8 text-2xl uppercase tracking-widest">Gallery</p>
                </button>
              </div>
              {files.length > 0 && (
                <p className="text-center text-xl mt-8">{files.length} document{files.length > 1 ? 's' : ''} selected</p>
              )}
            </div>

            <button
              onClick={transmit}
              disabled={!valid || transmitting}
              className={`w-full py-20 text-5xl font-black uppercase tracking-widest rounded-3xl shadow-2xl transition-all duration-500 ${valid && !transmitting ? `bg-gradient-to-r ${gradient} text-white hover:scale-105` : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'}`}
            >
              {transmitting ? 'TRANSMITTING...' : 'EXECUTE UPLOAD'}
            </button>
          </div>
        </div>
      </div>

      {complete && (
        <div className={`fixed inset-0 z-50 ${bg} flex items-center justify-center backdrop-blur-3xl`}>
          <div className="text-center space-y-32">
            <div className={`text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r ${gradient} animate-pulse`}>
              UPLOAD COMPLETE
            </div>
            <button onClick={() => location.reload()} className={`px-40 py-20 bg-gradient-to-r ${gradient} text-white text-5xl uppercase tracking-widest shadow-2xl`}>
              NEW UPLOAD
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