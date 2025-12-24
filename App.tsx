import React, { useState } from 'react';

const App = () => {
  const [company, setCompany] = useState('');
  
  // High-resolution logo mapping
  const companyLogos: Record<string, string> = {
    'QLM': 'https://quantum-logistics.com/wp-content/uploads/2023/logo-white.png', 
    'BST': 'https://bstlogistics.com/wp-content/uploads/2021/04/BST-Logo-White.png',
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Professional Cyan Header */}
      <h1 className="font-orbitron text-3xl font-black text-center tracking-widest text-[#00ffff] uppercase glowing-text-cyan">
        BOL / PHOTO UPLOAD
      </h1>

      <div className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-6 shadow-2xl space-y-8">
        
        {/* Dynamic Logo Display Area */}
        <div className="flex justify-center h-20 items-center border-b border-zinc-800 pb-4">
          {company && companyLogos[company] ? (
            <img src={companyLogos[company]} alt="Company Logo" className="max-h-full object-contain" />
          ) : (
            <div className="text-zinc-600 italic text-sm">Select a company to view logo</div>
          )}
        </div>

        {/* Core Info Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm cyan-label mb-2">Company (REQUIRED)</label>
              <select 
                className="w-full bg-[#111] border border-zinc-700 p-3 rounded text-white focus:border-cyan-400 outline-none transition"
                onChange={(e) => setCompany(e.target.value)}
              >
                <option value="">Select a Company...</option>
                <option value="QLM">QLM - Quantum Logistics</option>
                <option value="BST">BST Logistics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm cyan-label mb-2">Driver Name (REQUIRED)</label>
              <input type="text" placeholder="e.g. John Doe" className="w-full bg-[#111] border border-zinc-700 p-3 rounded text-white focus:border-cyan-400 outline-none transition" />
            </div>
          </div>

          {/* Load Data Section - Restored Fields */}
          <div className="border-t border-zinc-800 pt-6">
            <h2 className="font-orbitron text-lg cyan-label mb-4">Load Data</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs cyan-label mb-1">Load #</label>
                <input type="text" placeholder="e.g. 123456" className="w-full bg-[#111] border border-zinc-700 p-3 rounded text-white outline-none" />
              </div>
              <div>
                <label className="block text-xs cyan-label mb-1">BOL #</label>
                <input type="text" placeholder="e.g. 7891011" className="w-full bg-[#111] border border-zinc-700 p-3 rounded text-white outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs cyan-label mb-1">Pickup City/State</label>
                <div className="flex space-x-2">
                  <input type="text" placeholder="City" className="w-1/2 bg-[#111] border border-zinc-700 p-2 rounded text-white outline-none" />
                  <input type="text" placeholder="ST" className="w-1/2 bg-[#111] border border-zinc-700 p-2 rounded text-white outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs cyan-label mb-1">Delivery City/State</label>
                <div className="flex space-x-2">
                  <input type="text" placeholder="City" className="w-1/2 bg-[#111] border border-zinc-700 p-2 rounded text-white outline-none" />
                  <input type="text" placeholder="ST" className="w-1/2 bg-[#111] border border-zinc-700 p-2 rounded text-white outline-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents & Freight Section - Mobile Card Layout */}
        <div className="space-y-6 pt-4">
          <h2 className="font-orbitron text-xl cyan-label border-b border-zinc-800 pb-2">Documents & Freight</h2>
          
          <div className="bg-[#111] border border-zinc-800 p-4 rounded-lg">
            <h3 className="text-white font-bold mb-3 uppercase tracking-tighter">BOL / POD Uploads</h3>
            <div className="flex space-x-6 mb-4 text-sm">
               <span className="cyan-label">BOL Type:</span>
               <label className="flex items-center text-white cursor-pointer"><input type="radio" name="bolType" className="mr-2 accent-cyan-400"/> Pick Up</label>
               <label className="flex items-center text-white cursor-pointer"><input type="radio" name="bolType" className="mr-2 accent-cyan-400"/> Delivery</label>
            </div>
            
            <div className="border-2 border-dashed border-zinc-700 p-8 rounded-lg text-center cursor-pointer hover:border-cyan-500 hover:bg-zinc-900 transition">
              <p className="text-white font-bold text-lg mb-2">Tap to open camera or upload files</p>
              <p className="text-zinc-500 text-xs mb-4">Drag & drop is also supported (Max PDF/Image)</p>
              <div className="flex justify-center space-x-8">
                <button className="flex items-center text-zinc-300 text-sm font-bold hover:text-cyan-400 transition"><span className="mr-2 text-lg">📁</span> Select Files</button>
                <button className="flex items-center text-zinc-300 text-sm font-bold hover:text-cyan-400 transition"><span className="mr-2 text-lg">📷</span> Use Camera</button>
              </div>
            </div>
          </div>

          {/* Final Submission Button */}
          <button className="w-full bg-zinc-800 text-zinc-500 font-orbitron py-5 rounded-lg uppercase tracking-widest text-lg shadow-inner cursor-not-allowed">
            Complete Required Fields
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;