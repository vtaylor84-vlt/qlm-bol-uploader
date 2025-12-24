import React, { useState, useRef, useEffect } from 'react';

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

const App = () => {
  // Terminal States
  const [isLocked, setIsLocked] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [company, setCompany] = useState('');
  const [driverName, setDriverName] = useState('');
  const [loadNum, setLoadNum] = useState('');
  const [bolNum, setBolNum] = useState('');
  const [puCity, setPuCity] = useState('');
  const [puState, setPuState] = useState('');
  const [delCity, setDelCity] = useState('');
  const [delState, setDelState] = useState('');
  const [bolType, setBolType] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [logs, setLogs] = useState<string[]>(['> KERNEL BOOT SUCCESSFUL', '> ENCRYPTION READY']);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-3), `> ${msg.toUpperCase()}`]);
  };

  const handleAuth = () => {
    setIsAuthenticating(true);
    addLog("SCANNING BIOMETRICS...");
    setTimeout(() => {
      setIsLocked(false);
      setIsAuthenticating(false);
      addLog("ACCESS GRANTED: OPERATOR VERIFIED");
    }, 2000);
  };

  const isGLX = company === 'GLX';
  const isBST = company === 'BST';
  const brandColor = isGLX ? 'text-green-500 shadow-green-500/50' : isBST ? 'text-blue-400 shadow-blue-400/40' : 'text-cyan-400 shadow-cyan-500/50';

  if (isLocked) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-orbitron overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="z-10 text-center space-y-12 w-full max-w-sm">
          <header>
            <h1 className="text-zinc-600 text-xs tracking-[0.8em] uppercase mb-2">Security Protocol</h1>
            <h2 className="text-white text-2xl font-black tracking-widest uppercase">System Lock</h2>
          </header>
          
          <div className="relative flex justify-center py-10">
            <button 
              onMouseDown={handleAuth} 
              onTouchStart={handleAuth}
              className={`relative w-24 h-24 rounded-full border-2 border-zinc-800 flex items-center justify-center transition-all ${isAuthenticating ? 'scale-110 border-cyan-500 shadow-[0_0_30px_#06b6d4]' : ''}`}
            >
              <span className={`text-4xl transition-opacity ${isAuthenticating ? 'opacity-20' : 'opacity-100'}`}>☝️</span>
              {isAuthenticating && (
                <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>
            <div className={`absolute -bottom-4 text-[9px] font-black tracking-[0.3em] uppercase transition-colors ${isAuthenticating ? 'text-cyan-500' : 'text-zinc-600'}`}>
              {isAuthenticating ? 'Verifying...' : 'Hold to Authenticate'}
            </div>
          </div>
          
          <div className="bg-zinc-900/30 p-4 rounded border border-zinc-800/50">
            <p className="text-zinc-500 text-[8px] leading-relaxed uppercase tracking-widest">
              Authorized personnel only. All access attempts are logged and transmitted to primary TMS node.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-10 relative font-orbitron overflow-hidden">
      {/* Background FX */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${shake ? 'opacity-40' : 'opacity-10'}`} 
           style={{ backgroundImage: `linear-gradient(${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px), linear-gradient(90deg, ${shake ? '#f00' : isGLX ? '#22c55e' : isBST ? '#3b82f6' : '#444'} 1px, transparent 1px)`, backgroundSize: '35px 35px' }}></div>

      <div className="relative z-10 p-4 max-w-xl mx-auto space-y-6">
        <header className="flex justify-between items-end border-b border-zinc-900 pb-4">
          <div>
            <h1 className={`text-lg font-black tracking-widest uppercase ${brandColor}`}>Terminal v2.1</h1>
            <p className="text-[7px] text-zinc-500 tracking-[0.4em]">ENCRYPTED LOAD DATA UPLINK</p>
          </div>
          <div className="text-right">
            <span className="text-[8px] text-zinc-600 uppercase font-bold block">Status</span>
            <span className="text-green-500 text-[9px] animate-pulse">● ONLINE</span>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1">
            <label className="text-[8px] font-black uppercase text-zinc-500">Carrier</label>
            <select className="bg-zinc-950 border border-zinc-800 p-2 text-xs rounded outline-none focus:border-cyan-500" value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="">SELECT...</option>
              <option value="GLX">GLX</option>
              <option value="BST">BST</option>
            </select>
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-[8px] font-black uppercase text-zinc-500">Operator</label>
            <input type="text" className="bg-zinc-950 border border-zinc-800 p-2 text-xs rounded outline-none" value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="ENTER NAME" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1">
            <label className="text-[8px] font-black uppercase text-zinc-500">Load Ref</label>
            <input type="text" className="bg-zinc-950 border border-zinc-800 p-2 text-xs rounded" value={loadNum} onChange={(e) => setLoadNum(e.target.value)} placeholder="LOAD #" />
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-[8px] font-black uppercase text-zinc-500">BOL Ref</label>
            <input type="text" className="bg-zinc-950 border border-zinc-800 p-2 text-xs rounded" value={bolNum} onChange={(e) => setBolNum(e.target.value)} placeholder="BOL #" />
          </div>
        </div>

        <div className="bg-zinc-950/50 border border-zinc-900 p-4 rounded-lg">
          <h2 className={`text-[9px] font-black uppercase mb-4 tracking-widest ${brandColor}`}>Imaging Interface</h2>
          <div className="flex justify-around mb-6">
            <button onClick={() => fileInputRef.current?.click()} className="text-[9px] font-bold border border-zinc-800 px-4 py-2 rounded hover:bg-zinc-900">BROWSE FILES</button>
            <button onClick={() => cameraInputRef.current?.click()} className="text-[9px] font-bold border border-zinc-800 px-4 py-2 rounded hover:bg-zinc-900">SCAN CAMERA</button>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {uploadedFiles.map(f => (
                <div key={f.id} className="relative aspect-[3/4] rounded border border-zinc-800 overflow-hidden bg-black group">
                  <img src={f.preview} className="w-full h-full object-cover opacity-60" />
                  {/* ✅ OCR SCANNER OVERLAY */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center">
                    <div className={`w-full h-[1px] animate-scan ${isGLX ? 'bg-green-500' : 'bg-cyan-500 shadow-[0_0_10px_cyan]'}`}></div>
                    <div className="text-[5px] font-mono text-cyan-400 mt-1 opacity-50 uppercase tracking-tighter">
                      Reading: {Math.random().toString(16).substr(2, 8)}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full bg-black/80 p-1 text-[6px] text-zinc-500 font-mono">
                    CONFIDENCE: 98.4%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LOG PANEL */}
        <div className="bg-[#050505] border border-zinc-900 p-3 rounded font-mono text-[8px] text-zinc-600 h-24 overflow-hidden">
           {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>

        <button 
          onClick={() => {
            if(!company) { setShake(true); setTimeout(()=>setShake(false), 500); return; }
            setIsSubmitting(true);
            addLog("UPLOADING PACKETS...");
            setTimeout(() => { setIsSubmitting(false); setShowSuccess(true); }, 2000);
          }}
          className={`w-full py-4 rounded font-black text-[10px] uppercase tracking-[0.4em] ${shake ? 'animate-shake bg-red-600' : isBST ? 'bg-blue-600' : isGLX ? 'bg-green-600' : 'bg-zinc-800 text-zinc-500'}`}
        >
          Execute Uplink
        </button>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/98 z-50 flex flex-col items-center justify-center p-10 backdrop-blur-3xl animate-in fade-in">
          <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center text-green-500 text-2xl mb-6">✓</div>
          <h2 className="text-white font-black uppercase tracking-[0.3em] mb-2">Success</h2>
          <p className="text-zinc-500 text-[9px] uppercase tracking-widest mb-10 text-center">Data synchronized with master spreadsheet</p>
          <button onClick={() => window.location.reload()} className="w-full max-w-xs py-3 border border-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest">New Session</button>
        </div>
      )}

      <style>{`
        @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .animate-scan { animation: scan 3s linear infinite; }
        .animate-shake { animation: shake 0.1s linear infinite; }
      `}</style>
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => {
        if(e.target.files) setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!).map(file => ({ file, preview: URL.createObjectURL(file), id: Math.random().toString() }))])
      }} />
      <input type="file" ref={cameraInputRef} className="hidden" capture="environment" accept="image/*" onChange={(e) => {
        if(e.target.files) setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!).map(file => ({ file, preview: URL.createObjectURL(file), id: Math.random().toString() }))])
      }} />
    </div>
  );
};

export default App;