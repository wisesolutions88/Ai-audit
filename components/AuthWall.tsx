import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Unlock, Zap, Fingerprint, Terminal, AlertCircle } from 'lucide-react';

interface AuthWallProps {
  onAuthorized: () => void;
}

const AuthWall: React.FC<AuthWallProps> = ({ onAuthorized }) => {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // The secret is "vibe-ship"
  const MASTER_SECRET = 'vibe-ship';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(false);

    // Artificial delay for "Security Scan" feeling
    setTimeout(() => {
      if (passphrase.toLowerCase() === MASTER_SECRET) {
        onAuthorized();
      } else {
        setError(true);
        setIsVerifying(false);
        setPassphrase('');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      </div>

      <div className="max-w-md w-full relative z-10 space-y-10">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-600 rounded-[2.5rem] shadow-2xl shadow-indigo-600/20 relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
             {isVerifying ? (
                <Zap className="w-10 h-10 text-white animate-bounce" />
             ) : error ? (
                <AlertCircle className="w-10 h-10 text-white animate-shake" />
             ) : (
                <ShieldCheck className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
             )}
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tight">Vibe<span className="text-indigo-500">Audit</span></h1>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-[0.2em]">Secure Ship-Ready Gate</p>
          </div>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 p-8 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl space-y-8 relative overflow-hidden">
           {isVerifying && (
              <div className="absolute inset-0 bg-indigo-600/5 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
                 <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Scanning Clearance...</span>
              </div>
           )}

           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                    <Lock className="w-3 h-3 mr-2 text-indigo-500" /> Identity verification
                 </h2>
                 <Fingerprint className="w-4 h-4 text-gray-700" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                   <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-indigo-500 transition-colors" />
                   <input 
                      type="password"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Enter Master Passphrase"
                      className={`w-full bg-black/40 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-gray-800 focus:border-indigo-500'} rounded-2xl py-4 pl-12 pr-4 text-sm text-indigo-100 placeholder-gray-700 focus:outline-none transition-all shadow-inner`}
                      autoFocus
                   />
                </div>
                <button 
                   type="submit" 
                   disabled={!passphrase || isVerifying}
                   className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center space-x-2"
                >
                   <span>ACCESS DASHBOARD</span>
                   <Unlock className="w-4 h-4" />
                </button>
              </form>

              {error && (
                <p className="text-center text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">Access Denied. Signature mismatch.</p>
              )}
           </div>
        </div>

        <div className="text-center">
           <button 
              onClick={() => setShowHint(!showHint)} 
              className="text-[10px] font-black text-gray-600 hover:text-indigo-500 uppercase tracking-widest transition-colors"
           >
              {showHint ? 'Passphrase: vibe-ship' : 'Forgot Passphrase?'}
           </button>
        </div>

        <div className="flex items-center justify-center space-x-8 pt-4">
           <div className="flex flex-col items-center space-y-1">
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">TLS 1.3</span>
              <div className="w-8 h-1 bg-indigo-500/20 rounded-full"></div>
           </div>
           <div className="flex flex-col items-center space-y-1">
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">AES-256</span>
              <div className="w-8 h-1 bg-indigo-500/20 rounded-full"></div>
           </div>
           <div className="flex flex-col items-center space-y-1">
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">RSA 4096</span>
              <div className="w-8 h-1 bg-indigo-500/20 rounded-full"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuthWall;