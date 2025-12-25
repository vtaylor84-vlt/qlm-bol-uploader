import React, { useState, useRef } from 'react';

const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

const haptic = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {}
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

  const gradient = company === 'GLX' ? 'from-emerald-500 to-teal-600' : company === 'BST' ? 'from-indigo-500 to-purple-600' : 'from-gray-600 to-gray-800';

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

  if (!showForm) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="z-10 text-center space-y-32 px-8">
          <div>
            <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400">
              AURORA NEXUS
            </h1>
            <p className="text-3xl mt-12 uppercase tracking-widest text-gray-400">
              Secure Logistics Terminal
            </p>
            <p className="text-xl mt-8 text-gray-500">
              Initializing biometric verification and device authentication...
            </p>
          </div>
          <div className="space-y-16">
            <p className="text-3xl uppercase tracking-widest text-gray-400">Select Fleet Authority</p>
            <div className="flex justify-center gap-24 flex-col md:flex-row">
              <button onClick={() => { haptic(); setCompany('GLX'); setShowForm(true); }} className="px-32 py-20 text-6xl font-black uppercase rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl hover:scale-105 transition-all">
                GLX
              </button>
              <button onClick={() => { haptic(); setCompany('BST'); setShowForm(true); }} className="px-32 py-20 text-6xl font-black uppercase rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl hover:scale-105 transition-all">
                BST
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-20">
          <h1 className={`text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>
            BOL UPLOAD TERMINAL
          </h1>
          <p className="text-3xl mt-12 uppercase tracking-widest">
            Fleet: {company} • Driver: {driverName || 'Enter Name'}
          </p>
          <button onClick={() => setShowForm(false)} className="mt-12 px-16 py-8 bg-gray-800 rounded-2xl text-2xl uppercase tracking-widest hover:bg-gray-700 transition-all">
            Change Fleet
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-16">
            <div className={`space-y-8 ${driverName ? completedGlow : ''}`}>
              <label className="text-3xl uppercase tracking-widest">Driver Name</label>
              <input onFocus={haptic} value={driverName} onChange={e => setDriverName(e.target.value)} placeholder="Full Legal Name" className="w-full bg-gray-800/50 border border-gray-700 px-12 py-10 text-3xl rounded-2xl focus:border-white/40 focus:shadow-2xl transition-all" />
            </div>

            <div className={`space-y-8 ${puCity && puState ? completedGlow : ''}`}>
              <label className="text-3xl uppercase tracking-widest">Pickup Location</label>
              <div className="flex gap-8">
                <input onFocus={haptic} value={puCity} onChange={e => setPuCity(e.target.value)} placeholder="City" className="flex-1 bg-gray-800/50 border border-gray-700 px-12 py-10 text-3xl rounded-2xl focus:border-white/40 focus:shadow-2xl transition-all" />
                <select onFocus={haptic} onChange={e => haptic()} value={puState} className="w-64 bg-gray-800/50 border border-gray-700 px-12 py-10 text-3xl rounded-2xl focus:border-white/40 focus:shadow-2xl transition-all">
                  <option>State</option>
                  {states.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className={`space-y-8 ${delCity && delState ? completedGlow : ''}`}>
              <label className="text-3xl uppercase tracking-widest">Delivery Location</label>
              <div className="flex gap-8">
                <input onFocus={haptic} value={delCity} onChange={e => setDelCity(e.target.value)} placeholder="City" className="flex-1 bg-gray-800/50 border border-gray-700 px-12 py-10 text-3xl rounded-2xl focus:border-white/40 focus:shadow-2xl transition-all" />
                <select onFocus={haptic} onChange={e => haptic()} value={delState} className="w-64 bg-gray-800/50 border border-gray-700 px-12 py-10 text-3xl rounded-2xl focus:border-white/40 focus:shadow-2xl transition-all">
                  <option>State</option>
                  {states.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className={`space-y-8 ${bolType ? completedGlow : ''}`}>
              <label className="text-3xl uppercase tracking-widest">BOL Type</label>
              <div className="grid grid-cols-2 gap-12">
                <button onClick={() => haptic()} className={`py-16 text-4xl uppercase rounded-3xl transition-all ${bolType === 'pickup' ? `bg-gradient-to-r ${gradient} text-white shadow-2xl` : 'bg-gray-800/50 border border-gray-700'}`}>
                  Pickup BOL
                </button>
                <button onClick={() => haptic()} className={`py-16 text-4xl uppercase rounded-3xl transition-all ${bolType === 'delivery' ? `bg-gradient-to-r ${gradient} text-white shadow-2xl` : 'bg-gray-800/50 border border-gray-700'}`}>
                  Delivery POD
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-16">
            <div className={`space-y-8 ${files.length ? completedGlow : ''}`}>
              <h3 className="text-4xl uppercase tracking-widest">Document Capture</h3>
              <div className="flex justify-center gap-32">
                <button onClick={() => camRef.current?.click()} className="group">
                  <div className={`w-48 h-48 rounded-full bg-gradient-to-br ${gradient} p-4 shadow-2xl group-hover:scale-110 transition-all duration-500`}>
                    <div className="w-full h-full bg-black/60 rounded-full flex items-center justify-center text-white text-8xl font-black">
                      📷
                    </div>
                  </div>
                  <p className="mt-12 text-3xl uppercase tracking-widest">Camera</p>
                </button>
                <button onClick={() => fileRef.current?.click()} className="group">
                  <div className={`w-48 h-48 rounded-full bg-gradient-to-br ${gradient} p-4 shadow-2xl group-hover:scale-110 transition-all duration-500`}>
                    <div className="w-full h-full bg-black/60 rounded-full flex items-center justify-center text-white text-8xl font-black">
                      📁
                    </div>
                  </div>
                  <p className="mt-12 text-3xl uppercase tracking-widest">Gallery</p>
                </button>
              </div>
              {files.length > 0 && <p className="text-center text-2xl mt-12">{files.length} document{files.length > 1 ? 's' : ''} selected</p>}
            </div>

            <button onClick={transmit} disabled={!valid || transmitting} className={`w-full py-24 text-6xl font-black uppercase tracking-widest rounded-3xl shadow-2xl transition-all duration-500 ${valid && !transmitting ? `bg-gradient-to-r ${gradient} text-white hover:scale-105` : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'}`}>
              {transmitting ? 'TRANSMITTING...' : 'EXECUTE UPLOAD'}
            </button>
          </div>
        </div>
      </div>

      {complete && (
        <div className="fixed inset-0 z-50 bg-gray-950 flex items-center justify-center">
          <div className="text-center space-y-32">
            <div className={`text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r ${gradient} animate-pulse`}>
              UPLOAD COMPLETE
            </div>
            <button onClick={() => location.reload()} className={`px-48 py-24 bg-gradient-to-r ${gradient} text-white text-6xl uppercase tracking-widest shadow-2xl`}>
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