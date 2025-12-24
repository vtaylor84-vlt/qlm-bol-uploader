import React, { useState, useRef } from 'react';

const App = () => {
  // Form State Management
  const [company, setCompany] = useState('');
  const [driverName, setDriverName] = useState('');
  const [loadNum, setLoadNum] = useState('');
  const [bolNum, setBolNum] = useState('');
  const [puCity, setPuCity] = useState('');
  const [puState, setPuState] = useState('');
  const [delCity, setDelCity] = useState('');
  const [delState, setDelState] = useState('');
  const [bolType, setBolType] = useState('');
  
  const bolInputRef = useRef<HTMLInputElement>(null);

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
    'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  // 🛡️ Logic: Required either Load# OR BOL# (OR both)
  const hasReferenceNum = loadNum.trim() !== '' || bolNum.trim() !== '';

  // 🛡️ Final Validation Logic
  const isFormComplete = 
    company !== '' && 
    driverName.trim() !== '' && 
    hasReferenceNum && 
    puCity.trim() !== '' && 
    puState !== '' && 
    delCity.trim() !== '' && 
    delState !== '' &&
    bolType !== '';

  return (
    <div className="app-container space-y-6">
      <h1 className="font-orbitron text-2xl text-center cyan-glow tracking-tighter mb-4">BOL / PHOTO UPLOAD</h1>
      
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-lg p-5 shadow-2xl space-y-6">
        
        {/* Company & Driver Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-[10px] cyan-glow mb-1">Company<span className="required-asterisk">*</span></label>
            <select 
              className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none focus:border-cyan-500" 
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            >
              <option value="">Select Company...</option>
              <option value="GLX">Greenleaf Xpress</option>
              <option value="BST">BST Expedite</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] cyan-glow mb-1">Driver Name<span className="required-asterisk">*</span></label>
            <input 
              type="text" 
              placeholder="Enter your name" 
              className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none focus:border-cyan-500" 
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
            />
          </div>
        </div>

        {/* Load Data Section */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-1">
            <h2 className="font-orbitron text-sm cyan-glow">Load Data</h2>
            <span className="text-[9px] text-zinc-500 italic">Enter Load # or BOL #*</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-[10px] cyan-glow mb-1">Load #</label>
              <input 
                type="text" 
                placeholder="Enter Load #" 
                className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none focus:border-cyan-500" 
                value={loadNum}
                onChange={(e) => setLoadNum(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] cyan-glow mb-1">BOL #</label>
              <input 
                type="text" 
                placeholder="Enter BOL #" 
                className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none focus:border-cyan-500" 
                value={bolNum}
                onChange={(e) => setBolNum(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col">
              <label className="text-[10px] cyan-glow mb-1">Pickup City/State<span className="required-asterisk">*</span></label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="PU City" 
                  className="flex-1 bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none focus:border-cyan-500" 
                  value={puCity}
                  onChange={(e) => setPuCity(e.target.value)}
                />
                <select 
                  className="w-32 bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none focus:border-cyan-500"
                  value={puState}
                  onChange={(e) => setPuState(e.target.value)}
                >
                  <option value="">Select State</option>
                  {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] cyan-glow mb-1">Delivery City/State<span className="required-asterisk">*</span></label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Del City" 
                  className="flex-1 bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none focus:border-cyan-500" 
                  value={delCity}
                  onChange={(e) => setDelCity(e.target.value)}
                />
                <select 
                  className="w-32 bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none focus:border-cyan-500"
                  value={delState}
                  onChange={(e) => setDelState(e.target.value)}
                >
                  <option value="">Select State</option>
                  {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="space-y-4 pt-4">
          <h2 className="font-orbitron text-sm cyan-glow border-b border-zinc-800 pb-1">Documents & Freight</h2>
          
          <input type="file" ref={bolInputRef} className="hidden" multiple accept="image/*,application/pdf" />
          <div className="bg-[#111] border border-zinc-800 p-4 rounded-md space-y-4 shadow-inner">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-white uppercase">BOL / POD Uploads<span className="required-asterisk">*</span></span>
              <div className="flex gap-3 text-[10px] text-zinc-400">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    name="bolType" 
                    className="mr-1 accent-cyan-400"
                    onChange={() => setBolType('pickup')}
                  /> Pickup
                </label>
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    name="bolType" 
                    className="mr-1 accent-cyan-400"
                    onChange={() => setBolType('delivery')}
                  /> Delivery
                </label>
              </div>
            </div>
            <div className="border border-dashed border-zinc-700 p-6 rounded text-center cursor-pointer" onClick={() => bolInputRef.current?.click()}>
              <p className="text-white text-xs font-bold mb-3 uppercase">Tap to open camera or upload files</p>
              <div className="flex justify-center gap-6 text-[11px] text-zinc-400 font-bold">
                <button type="button" className="hover:text-cyan-400">📁 Select Files</button>
                <button type="button" className="hover:text-cyan-400">📷 Use Camera</button>
              </div>
            </div>
          </div>
        </div>

        <button 
          className={`w-full font-orbitron py-4 rounded-md uppercase text-xs tracking-widest transition-all duration-300 ${
            isFormComplete 
            ? 'bg-[#00ffff] text-black shadow-[0_0_20px_rgba(0,255,255,0.4)] cursor-pointer' 
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
          disabled={!isFormComplete}
        >
          {isFormComplete ? 'Submit Documentation' : 'Complete Required Fields'}
        </button>
      </div>
    </div>
  );
};

export default App;