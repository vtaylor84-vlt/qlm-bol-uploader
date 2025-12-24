import React, { useState } from 'react';

const App = () => {
  const [company, setCompany] = useState('');
  
  // Mapping company selection to logo URLs
  const companyLogos: Record<string, string> = {
    'QLM': 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Logitrans_Logo.png', // Replace with your actual QLM logo URL
    'BST': 'https://bstlogistics.com/wp-content/uploads/2021/04/BST-Logo-White.png',
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <h1 className="font-orbitron text-2xl font-black text-center tracking-widest text-white uppercase">
        BOL / PHOTO UPLOAD
      </h1>

      <div className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-6 shadow-2xl">
        {/* Dynamic Company Logo */}
        <div className="flex justify-center mb-6 h-16 items-center">
          {company && companyLogos[company] ? (
            <img src={companyLogos[company]} alt="Company Logo" className="max-h-full object-contain" />
          ) : (
            <div className="text-zinc-600 italic text-sm">Select a company to view logo</div>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-red-400 mb-1 uppercase">Company *</label>
            <select 
              className="w-full bg-[#111] border border-zinc-700 p-3 rounded text-white focus:border-cyan-400 outline-none"
              onChange={(e) => setCompany(e.target.value)}
            >
              <option value="">Select a Company...</option>
              <option value="QLM">QLM - Quantum Logistics</option>
              <option value="BST">BST Logistics</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-red-400 mb-1 uppercase">Driver's Name *</label>
            <input type="text" placeholder="Enter your name" className="w-full bg-[#111] border border-zinc-700 p-3 rounded text-white focus:border-cyan-400 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase">Load #</label>
              <input type="text" placeholder="Enter Load ID" className="w-full bg-[#111] border border-zinc-700 p-3 rounded text-white focus:border-cyan-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase">BOL #</label>
              <input type="text" placeholder="Enter BOL #" className="w-full bg-[#111] border border-zinc-700 p-3 rounded text-white focus:border-cyan-400 outline-none" />
            </div>
          </div>

          {/* Upload Buttons - Side by Side Layout */}
          <div className="pt-4">
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Upload BOL Image(s)</label>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-[#1a1a1a] border border-zinc-800 p-4 rounded-lg flex flex-col items-center justify-center hover:bg-zinc-800 transition">
                <span className="text-zinc-400 text-xs mt-1">Select Files</span>
              </button>
              <button className="bg-[#1a1a1a] border border-zinc-800 p-4 rounded-lg flex flex-col items-center justify-center hover:bg-zinc-800 transition">
                <span className="text-zinc-400 text-xs mt-1">Use Camera</span>
              </button>
            </div>
          </div>

          <button className="w-full bg-zinc-800 text-zinc-500 font-orbitron py-4 rounded-lg mt-6 uppercase tracking-tighter cursor-not-allowed">
            Complete Required Fields
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;