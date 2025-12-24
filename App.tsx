import React, { useState, useRef } from 'react';

const App = () => {
  const [company, setCompany] = useState('');
  const [driverName, setDriverName] = useState('');
  
  // Create a reference to the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
    'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  // Function to trigger the file input
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const isReady = company !== '' && driverName.trim() !== '';

  return (
    <div className="app-container space-y-6">
      <h1 className="font-orbitron text-2xl text-center cyan-glow tracking-tighter mb-4">BOL / PHOTO UPLOAD</h1>
      
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-lg p-5 shadow-2xl space-y-6">
        <div className="text-center h-12 flex items-center justify-center border-b border-zinc-800 pb-4 text-zinc-600 italic text-xs">
           Select a company to view logo
        </div>

        {/* Company & Driver Section */}
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

        {/* Load Data Section */}
        <div className="space-y-4 pt-2">
          <h2 className="font-orbitron text-sm cyan-glow border-b border-zinc-800 pb-1">Load Data</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-[10px] cyan-glow mb-1">Load #</label>
              <input type="text" placeholder="Enter Load ID or Load #" className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none" />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] cyan-glow mb-1">BOL #</label>
              <input type="text" placeholder="Enter BOL #" className="bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col">
              <label className="text-[10px] cyan-glow mb-1">Pickup City/State</label>
              <div className="flex gap-2">
                <input type="text" placeholder="PU City" className="flex-1 bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm" />
                <select className="w-32 bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm cursor-pointer">
                  <option value="">Select State</option>
                  {states.map(s => <option key={`p-${s}`} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] cyan-glow mb-1">Delivery City/State</label>
              <div className="flex gap-2">
                <input type="text" placeholder="Del City" className="flex-1 bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm" />
                <select className="w-32 bg-[#111] border border-zinc-700 p-2 rounded text-white text-sm cursor-pointer">
                  <option value="">Select State</option>
                  {states.map(s => <option key={`d-${s}`} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Uploads Section */}
        <div className="space-y-4 pt-4">
          <h2 className="font-orbitron text-sm cyan-glow border-b border-zinc-800 pb-1">Documents & Freight</h2>
          
          {/* Hidden Input Field that actually handles the files */}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            multiple 
            accept="image/*,application/pdf"
          />

          <div className="bg-[#111] border border-zinc-800 p-4 rounded-md space-y-4 shadow-inner">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-white uppercase">BOL / POD Uploads</span>
              <div className="flex gap-3 text-[10px] text-zinc-400">
                <label className="flex items-center cursor-pointer"><input type="radio" name="b" className="mr-1 accent-cyan-400"/> Pickup</label>
                <label className="flex items-center cursor-pointer"><input type="radio" name="b" className="mr-1 accent-cyan-400"/> Delivery</label>
              </div>
            </div>
            
            {/* These buttons now trigger the handleUploadClick function */}
            <div className="border border-dashed border-zinc-700 p-6 rounded text-center">
              <p className="text-white text-xs font-bold mb-3 uppercase">Tap to open camera or upload files</p>
              <div className="flex justify-center gap-6 text-[11px] text-zinc-400 font-bold">
                <button 
                  type="button" 
                  onClick={handleUploadClick}
                  className="hover:text-cyan-400 flex items-center gap-2"
                >
                  📁 Select Files
                </button>
                <button 
                  type="button" 
                  onClick={handleUploadClick}
                  className="hover:text-cyan-400 flex items-center gap-2"
                >
                  📷 Use Camera
                </button>
              </div>
            </div>
          </div>
        </div>

        <button 
          className={`w-full font-orbitron py-4 rounded-md uppercase text-xs tracking-widest transition-all duration-300 ${
            isReady 
            ? 'bg-[#00ffff] text-black shadow-[0_0_20px_rgba(0,255,255,0.4)] cursor-pointer' 
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
          disabled={!isReady}
        >
          {isReady ? 'Submit Documentation' : 'Complete Required Fields'}
        </button>
      </div>
    </div>
  );
};

export default App;