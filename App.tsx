
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Rocket, ShieldCheck, Terminal, AlertTriangle, FileCode, Shield, Eye, Server, Zap, Code, Search, Cpu, Layers, Database, Globe, Lock, Activity, GitBranch, Volume2, History, Clock, Sparkles, ExternalLink, ChevronRight, ShieldAlert, Target, FileDown, ChevronDown, LogOut, Fingerprint, LayoutDashboard, ArrowLeft, Trash2, Key
} from 'lucide-react';
import { performVibeAudit, generateAudioBriefing } from './services/geminiService';
import { parseGithubUrl, fetchRepoContents } from './services/githubService';
import { secureStore, secureRetrieve } from './services/crypto';
import { AuditReport, AuditStatus, AppView } from './types';
import ShipScore from './components/ShipScore';
import FindingsCard from './components/FindingsCard';
import RiskRadar from './components/RiskRadar';
import EndpointMap from './components/EndpointMap';
import SecretScanner from './components/SecretScanner';
import VibeMetrics from './components/VibeMetrics';
import ThreatModelSection from './components/ThreatModelSection';
import InfraHardeningSection from './components/InfraHardeningSection';
import SecurityChecklist from './components/SecurityChecklist';
import AuthWall from './components/AuthWall';

const PillarIcon = ({ name, className }: { name: string, className?: string }) => {
  const icons: Record<string, any> = { Shield, Database, Cpu, Globe, Zap, Lock, Activity, Layers };
  const Icon = icons[name] || Layers;
  return <Icon className={className} />;
};

const decodeBase64 = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('HOME');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [code, setCode] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [inputMode, setInputMode] = useState<'PASTE' | 'GITHUB'>('PASTE');
  const [status, setStatus] = useState<AuditStatus>('IDLE');
  const [scanningMessage, setScanningMessage] = useState('Analyzing the vibes...');
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fullArchive, setFullArchive] = useState<AuditReport[]>([]);
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPermissionError, setIsPermissionError] = useState(false);
  
  const scanTimerRef = useRef<number | null>(null);
  const [scanSeconds, setScanSeconds] = useState(0);

  useEffect(() => {
    const session = localStorage.getItem('vibe_audit_session');
    if (session === 'authorized_gate_v1') {
      setIsAuthenticated(true);
    }

    const savedArchive = secureRetrieve('vibe_audit_full_archive_v2');
    if (savedArchive) {
      setFullArchive(savedArchive);
    }
  }, []);

  const saveToArchive = (newReport: AuditReport) => {
    const updated = [newReport, ...fullArchive].slice(0, 100);
    setFullArchive(updated);
    secureStore('vibe_audit_full_archive_v2', updated);
  };

  const deleteFromArchive = (timestamp: string) => {
    const updated = fullArchive.filter(r => r.timestamp !== timestamp);
    setFullArchive(updated);
    secureStore('vibe_audit_full_archive_v2', updated);
  };

  const handleFixPermissions = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setIsPermissionError(false);
      setStatus('IDLE');
      setError(null);
    }
  };

  const handleAudit = async () => {
    setStatus('SCANNING');
    setError(null);
    setIsPermissionError(false);
    setScanSeconds(0);
    
    scanTimerRef.current = window.setInterval(() => {
      setScanSeconds(s => s + 1);
    }, 1000);

    let projectName = inputMode === 'GITHUB' ? githubUrl.split('/').pop() || 'Repository' : 'Source Snippet';
    
    try {
      let codeToAudit = code;
      if (inputMode === 'GITHUB') {
        const repoInfo = parseGithubUrl(githubUrl);
        if (!repoInfo) throw new Error("Please enter a valid GitHub repository URL.");
        setScanningMessage(`Crawling codebase: ${repoInfo.owner}/${repoInfo.repo}...`);
        codeToAudit = await fetchRepoContents(repoInfo.owner, repoInfo.repo);
      }
      
      const result = await performVibeAudit(codeToAudit, (msg) => setScanningMessage(msg));
      const reportWithMeta = { 
        ...result, 
        projectName, 
        timestamp: new Date().toISOString() 
      };
      setReport(reportWithMeta);
      saveToArchive(reportWithMeta);
      setStatus('REPORTING');
      setView('DASHBOARD');
    } catch (err: any) {
      console.error("[App] Audit failed:", err);
      const errorMsg = err.message || JSON.stringify(err);
      if (errorMsg.includes('403') || errorMsg.includes('PERMISSION_DENIED') || errorMsg.includes('permission')) {
        setIsPermissionError(true);
        setError("Your API key lacks Gemini 3 Pro permissions. Use a paid project key for full deep-reasoning audits.");
      } else {
        setError(errorMsg);
      }
      setStatus('ERROR');
    } finally {
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    }
  };

  const playBriefing = async () => {
    if (!report || isBriefingLoading) return;
    setIsBriefingLoading(true);
    try {
      const audioBase64 = await generateAudioBriefing(report);
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(decodeBase64(audioBase64), audioCtx, 24000);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
    } catch (e: any) {
      console.error("Briefing failed", e);
    } finally {
      setIsBriefingLoading(false);
    }
  };

  const filteredArchive = useMemo(() => {
    if (!searchQuery) return fullArchive;
    return fullArchive.filter(r => 
      r.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.vibePersonality.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [fullArchive, searchQuery]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('vibe_audit_session');
    setView('HOME');
  };

  const renderHeader = () => (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => { setView('HOME'); setStatus('IDLE'); }}>
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Vibe<span className="text-indigo-500">Audit</span></h1>
        </div>
        
        <div className="flex items-center space-x-4">
           <button 
              onClick={() => setView(view === 'ARCHIVE' ? 'HOME' : 'ARCHIVE')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all"
           >
              {view === 'ARCHIVE' ? <ArrowLeft className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{view === 'ARCHIVE' ? 'Public Audit' : 'Secure Ledger'}</span>
           </button>

           {isAuthenticated && view === 'ARCHIVE' && (
             <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10">
                <LogOut className="w-5 h-5" />
             </button>
           )}
        </div>
      </div>
    </header>
  );

  const renderHome = () => (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 slide-in-from-bottom-4">
      <div className="text-center space-y-8">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full">
          <Zap className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Ship-Readiness Intelligence</span>
        </div>
        <h2 className="text-6xl md:text-7xl font-black text-white tracking-tight leading-[1]">
          Audit Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500">Project Vibes</span>
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          The expert agent for AI-driven security auditing. Detect leaks, map your surface, and fix your code before you ship.
        </p>
      </div>

      <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="flex bg-gray-950/50 p-1.5 border-b border-gray-800">
          <button onClick={() => setInputMode('PASTE')} className={`flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all ${inputMode === 'PASTE' ? 'bg-gray-800 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}>Snippet Scan</button>
          <button onClick={() => setInputMode('GITHUB')} className={`flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all ${inputMode === 'GITHUB' ? 'bg-gray-800 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}>GitHub Repo</button>
        </div>
        <div className="p-8">
          {inputMode === 'PASTE' ? (
            <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste your source code here..." className="w-full h-80 bg-black/30 border border-gray-800 rounded-3xl p-6 font-mono text-sm text-indigo-100 focus:outline-none focus:border-indigo-500/50 resize-none shadow-inner" />
          ) : (
            <div className="py-16 space-y-8 max-w-xl mx-auto text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-gray-700 shadow-2xl"><GitBranch className="w-10 h-10 text-indigo-500" /></div>
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-indigo-500" />
                <input type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/owner/repository" className="w-full bg-black/50 border border-gray-800 rounded-2xl py-5 pl-14 pr-6 text-lg text-white focus:outline-none focus:border-indigo-500 transition-all shadow-xl" />
              </div>
            </div>
          )}
        </div>
        <div className="p-6 bg-gray-800/30 flex justify-center border-t border-gray-800/50">
          <button disabled={(inputMode === 'PASTE' && !code.trim()) || (inputMode === 'GITHUB' && !githubUrl.trim())} onClick={handleAudit} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-12 py-5 rounded-2xl font-black flex items-center space-x-3 transition-all active:scale-95 text-lg">
            <Zap className="w-6 h-6 fill-white" />
            <span>GENERATE AUDIT REPORT</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderResult = () => report && (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-700">
      <div className="flex items-center justify-between no-print">
         <button onClick={() => { setStatus('IDLE'); setView('HOME'); }} className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors text-sm font-bold">
           <ArrowLeft className="w-4 h-4" />
           <span>Back to Submissions</span>
         </button>
         <button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shadow-lg">
           <FileDown className="w-4 h-4" />
           <span>Export PDF</span>
         </button>
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-5"><Layers className="w-64 h-64 text-indigo-500" /></div>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
            <div className="space-y-8">
              <div className="space-y-3">
                 <div className="flex items-center space-x-3 text-indigo-400 uppercase tracking-[0.3em] font-black text-xs"><Layers className="w-4 h-4" /><span>{report.projectName}</span></div>
                 <h3 className="text-4xl font-black text-white">{report.blueprint?.architectureType || 'Modular Application'}</h3>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">{report.summary}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               {(report.blueprint?.pillars || []).map((pillar, idx) => (
                  <div key={idx} className="bg-gray-800/40 border border-gray-700/50 rounded-3xl p-6 flex flex-col items-center text-center space-y-4">
                     <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-700"><PillarIcon name={pillar.icon} className="w-6 h-6 text-indigo-500" /></div>
                     <div className="space-y-2"><h5 className="font-bold text-white text-sm">{pillar.title}</h5><p className="text-[11px] text-gray-500 leading-tight">{pillar.description}</p></div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        <div className="lg:w-1/3 w-full space-y-8 lg:sticky lg:top-24">
          <div className="bg-gray-900/60 border border-gray-800 rounded-[2rem] p-10 shadow-2xl backdrop-blur-xl">
            <ShipScore score={report.score} />
            <div className="mt-8 flex flex-col items-center space-y-4 no-print">
               <div className="px-4 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-center">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{report.vibePersonality}</span>
               </div>
               <button onClick={playBriefing} disabled={isBriefingLoading} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg">
                  {isBriefingLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Volume2 className="w-4 h-4" />}
                  <span>Audio Briefing</span>
               </button>
            </div>
            <div className="mt-10 py-6 border-t border-gray-800/50 space-y-8">
               <RiskRadar data={report.breakdown} />
               <VibeMetrics metrics={report.metrics} />
            </div>
          </div>
        </div>

        <div className="lg:w-2/3 w-full space-y-12">
          {report.threatModel && <ThreatModelSection model={report.threatModel} />}
          <SecurityChecklist checkpoints={report.checkpoints} />
          <EndpointMap endpoints={report.endpoints} />
          <SecretScanner leaks={report.leaks} />
          <InfraHardeningSection checks={report.infraChecks} />
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center">
              <ShieldAlert className="w-3 h-3 mr-2" /> Remediation Tickets
            </h4>
            {report.findings?.map((finding) => (
              <FindingsCard key={finding.id} finding={finding} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col selection:bg-indigo-500/30">
      {renderHeader()}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        {status === 'SCANNING' ? (
          <div className="h-[70vh] flex flex-col items-center justify-center space-y-12">
            <div className="relative">
              <div className="w-40 h-40 border-8 border-indigo-600/10 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center"><Rocket className="w-12 h-12 text-indigo-500 animate-pulse" /></div>
            </div>
            <div className="text-center space-y-4 max-w-md">
              <h3 className="text-4xl font-black text-white tracking-tight">Audit in Progress</h3>
              <p className="text-gray-400 text-lg text-center animate-pulse">{scanningMessage}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Time elapsed: {scanSeconds}s</p>
            </div>
          </div>
        ) : status === 'ERROR' ? (
          <div className="max-w-md mx-auto py-32 text-center space-y-10">
            <div className="w-28 h-28 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-red-500 border border-red-500/20 shadow-2xl"><AlertTriangle className="w-14 h-14" /></div>
            <div className="space-y-4">
               <h3 className="text-4xl font-black text-white tracking-tight">{isPermissionError ? 'Permission Denied' : 'Audit Failure'}</h3>
               <p className="text-gray-400 text-lg leading-relaxed">{error}</p>
            </div>
            <div className="flex flex-col space-y-4">
               {isPermissionError && (
                 <button onClick={handleFixPermissions} className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-4 rounded-2xl font-black transition-all shadow-xl flex items-center justify-center space-x-2">
                   <Key className="w-5 h-5" />
                   <span>Select Valid API Key</span>
                 </button>
               )}
               <button onClick={() => setStatus('IDLE')} className="bg-gray-800 hover:bg-gray-700 text-white px-12 py-4 rounded-2xl font-black transition-all border border-gray-700">RETRY</button>
            </div>
          </div>
        ) : view === 'ARCHIVE' ? (
          isAuthenticated ? (
            <div className="space-y-12">
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-black text-white flex items-center"><LayoutDashboard className="w-8 h-8 mr-4 text-indigo-500" />Project Ledger</h2>
                <div className="relative group w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search projects..." className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArchive.map((entry, idx) => (
                  <div key={idx} className="bg-gray-900/40 border border-gray-800 rounded-[2rem] p-8 space-y-6 hover:border-gray-700 group cursor-pointer relative" onClick={() => { setReport(entry); setStatus('REPORTING'); setView('DASHBOARD'); }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-500 uppercase">{new Date(entry.timestamp || '').toLocaleDateString()}</span>
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl font-black text-xs border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">{entry.score}</div>
                    </div>
                    <h4 className="text-xl font-bold text-white truncate">{entry.projectName}</h4>
                    <button onClick={(e) => { e.stopPropagation(); deleteFromArchive(entry.timestamp || ''); }} className="absolute bottom-6 right-6 p-2 text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          ) : <AuthWall onAuthorized={() => { setIsAuthenticated(true); localStorage.setItem('vibe_audit_session', 'authorized_gate_v1'); }} />
        ) : status === 'REPORTING' ? (
          renderResult()
        ) : (
          renderHome()
        )}
      </main>

      <footer className="border-t border-gray-900 py-12 bg-gray-950 mt-20 no-print text-center text-gray-500 text-xs">
         <div className="flex items-center justify-center space-x-3 text-white font-black mb-4"><ShieldCheck className="w-5 h-5 text-indigo-500" /><span>Vibe Audit</span></div>
         <p className="uppercase tracking-[0.2em] opacity-50">© 2025 Secure Ship-Ready System</p>
      </footer>
    </div>
  );
};

export default App;
