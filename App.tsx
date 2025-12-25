import React, { useState, useRef, useEffect } from 'react';

const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

const haptic = () => {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 800;
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
      }, 2000);
    }
  };

  const valid = !!company && !!driverName.trim() && !!puCity && !!puState && !!delCity && !!delState && !!bolType && files.length > 0;

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
              Initializing device authentication...
            </p>
          </div>
          <div className="space-y-16">
            <p className="text-3xl uppercase tracking-widest text-gray-400">Select Fleet</p>
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
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-16">
        <header className="text-center">
          <h1 className={`text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>
            BOL UPLOAD
          </h1>
          <p className="text-2xl mt-8">Fleet: {company} • Driver: {driverName || 'Enter Name'}</p>
          <button onClick={() => setShowForm(false)} className="mt-8 px-12 py-4 bg-gray-800 rounded-xl">
            Change Fleet
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Form fields with glow on complete – same as previous */}
          {/* ... (keep the full form from last version) */}
        </div>
      </div>
    </div>
  );
};

export default App;