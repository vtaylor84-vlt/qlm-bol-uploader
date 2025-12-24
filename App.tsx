import React, { useState, useRef } from 'react';

const App = () => {
  // Form State Management
  const [company, setCompany] = useState('');
  const [driverName, setDriverName] = useState('');
  const [loadNum, setLoadNum] = useState('');
  const [puCity, setPuCity] = useState('');
  const [puState, setPuState] = useState('');
  const [delCity, setDelCity] = useState('');
  const [delState, setDelState] = useState('');
  
  const bolInputRef = useRef<HTMLInputElement>(null);
  const freightInputRef = useRef<HTMLInputElement>(null);

  const companyLogos: Record<string, string> = {
    'GLX': 'https://quantum-logistics.com/wp-content/uploads/2023/logo-white.png', 
    'BST': 'https://bstlogistics.com/wp-content/uploads/2021/04/BST-Logo-White.png',
  };

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
    'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  // 🛡️ Strict Validation Logic: All these must be true for the button to appear
  const isFormComplete = 
    company !== '' && 
    driverName.trim() !== '' && 
    loadNum.trim() !== '' && 
    puCity.trim() !== '' && 
    puState !== '' && 
    delCity.trim() !== '' && 
    delState !== '';

  return (
    <div className="app-container space-y-6">
      <h1 className="font-orbitron text-2xl text-center cyan-glow tracking-tighter mb-4">BOL / PHOTO UPLOAD</h1>
      
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-lg p-5 shadow-2xl space-y-6">
        
        <div className="flex justify-center h-16 items-center border-b border-zinc-800 pb-4">
          {company && companyLogos[company] ? (
            <img src={companyLogos[company]} alt="Logo" className="max-h-full object-contain" />
          ) : (
            <div className="text-zinc-600 italic text-xs">Select a company to view logo</div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-[10px] cyan-glow mb-1">Company<span className="required-asterisk">*</span></label>
            <select 
              className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none focus:border-cyan-500" 
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            >
              <option value="">Select a Company...</option>
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

        <div className="space-y-4 pt-2">
          <h2 className="font-orbitron text-sm cyan-glow border-b border-zinc-800 pb-1">Load Data</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-[10px] cyan-glow mb-1">Load #<span className="required-asterisk">*</span></label>
              <input 
                type="text" 
                placeholder="Enter Load ID or Load #" 
                className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none focus:border-cyan-500" 
                value={loadNum}
                onChange={(e) => setLoadNum(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] cyan-glow mb-1">BOL #</label>
              <input type="text" placeholder="Enter BOL #" className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none" />
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

        <div className="space-y-4 pt-4">
          <h2 className="font-orbitron text-sm cyan-glow border-b border-zinc-800 pb-1">Documents & Freight</h2>
          
          <input type="file" ref={bolInputRef} className="hidden" multiple accept="image/*,application/pdf" />
          <div className="bg-[#111] border border-zinc-800 p-4 rounded-md space-y-4 shadow-inner">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-white uppercase">BOL / POD Uploads</span>
              <div className="flex gap-3 text-[10px] text-zinc-400">
                <label className="flex items-center cursor-pointer"><input type="radio" name="b" className="mr-1 accent-cyan-400"/> Pickup</label>
                <label className="flex items-center cursor-pointer"><input type="radio" name="b" className="mr-1 accent-cyan-400"/> Delivery</label>
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

        {/* 🚀 Submission Button: Only glows and works when isFormComplete is true */}
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