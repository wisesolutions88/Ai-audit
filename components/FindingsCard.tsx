
import React, { useState } from 'react';
import { Finding, Severity, Category } from '../types';
import { 
  ShieldAlert, 
  Fingerprint, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Ticket, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  XCircle, 
  Code,
  ExternalLink,
  ShieldQuestion,
  Lock,
  UserCheck,
  Package
} from 'lucide-react';

const icons = {
  [Category.SECURITY]: <ShieldAlert className="w-5 h-5 text-red-400" />,
  [Category.PRIVACY]: <Fingerprint className="w-5 h-5 text-purple-400" />,
  [Category.OPERATIONS]: <Activity className="w-5 h-5 text-blue-400" />,
  [Category.IDENTITY]: <UserCheck className="w-5 h-5 text-indigo-400" />,
  [Category.SUPPLY_CHAIN]: <Package className="w-5 h-5 text-orange-400" />,
  [Category.QUALITY]: <Code className="w-5 h-5 text-gray-400" />,
};

const severityStyles = {
  [Severity.LOW]: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  [Severity.MEDIUM]: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  [Severity.HIGH]: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  [Severity.CRITICAL]: "bg-red-500/10 text-red-400 border-red-500/20",
};

interface FindingsCardProps {
  finding: Finding;
}

const FindingsCard: React.FC<FindingsCardProps> = ({ finding }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExported, setIsExported] = useState(false);

  const handleExport = () => {
    setIsExported(true);
    setTimeout(() => setIsExported(false), 2000);
  };

  const likelihoodColor = finding.likelihood > 0.7 ? 'text-red-400' : finding.likelihood > 0.4 ? 'text-yellow-400' : 'text-gray-400';

  return (
    <div className={`border rounded-2xl transition-all duration-500 overflow-hidden ${isOpen ? 'bg-gray-900/60 border-gray-700 shadow-2xl' : 'bg-gray-800/20 border-gray-800 hover:border-gray-700'}`}>
      <div 
        className="p-5 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-5 flex-1 overflow-hidden">
          <div className="p-2.5 bg-gray-800 rounded-xl shadow-inner border border-gray-700/50">
            {icons[finding.category] || <ShieldQuestion className="w-5 h-5 text-gray-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-100 text-lg leading-tight truncate">{finding.title}</h3>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${severityStyles[finding.severity]}`}>
                {finding.severity}
              </span>
              {finding.category === Category.PRIVACY && (
                 <span className="text-[10px] font-black px-2 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-400 uppercase tracking-wider">
                  PII SENSITIVE
                </span>
              )}
              {finding.cve && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 uppercase tracking-wider">
                  {finding.cve}
                </span>
              )}
              <span className="text-[10px] text-gray-500 font-mono truncate max-w-[200px] hidden sm:block">
                {finding.evidence.file}:{finding.evidence.lineRange}
              </span>
              <div className="flex items-center space-x-1 px-2 py-0.5 bg-gray-950/50 rounded-full border border-gray-800">
                 <Zap className={`w-3 h-3 ${likelihoodColor} fill-current`} />
                 <span className={`text-[10px] font-black ${likelihoodColor} uppercase tracking-tight`}>
                  {Math.round(finding.likelihood * 100)}% LIKELIHOOD
                 </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4 pl-4 border-l border-gray-800/50 ml-4">
          <button 
            onClick={(e) => { e.stopPropagation(); handleExport(); }}
            className={`hidden md:flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all transform active:scale-95 ${
              isExported 
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10'
            }`}
          >
            {isExported ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Ticket Sync'd</span>
              </>
            ) : (
              <>
                <Ticket className="w-4 h-4" />
                <span>Sync Ticket</span>
              </>
            )}
          </button>
          <div className={`p-1.5 rounded-full transition-colors ${isOpen ? 'bg-gray-800 text-white' : 'text-gray-600'}`}>
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="px-6 pb-6 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
          
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
               <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center ${finding.category === Category.PRIVACY ? 'text-purple-400' : 'text-red-400'}`}>
                <ShieldAlert className="w-3 h-3 mr-2" /> {finding.category === Category.PRIVACY ? 'Privacy Exposure Narrative' : 'Exploit Narrative'}
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed italic relative pl-6">
                <span className={`absolute left-0 top-0 text-3xl leading-none font-serif opacity-20 ${finding.category === Category.PRIVACY ? 'text-purple-500' : 'text-red-500'}`}>"</span>
                {finding.exploitStory}
                <span className={`text-3xl leading-none font-serif align-bottom ml-1 opacity-20 ${finding.category === Category.PRIVACY ? 'text-purple-500' : 'text-red-500'}`}>"</span>
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Security Thought Process</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                {finding.thoughtProcess}
              </p>
            </div>
          </section>

          {finding.references && finding.references.length > 0 && (
            <section className="space-y-3">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center">
                <ShieldQuestion className="w-3 h-3 mr-2" /> Security Advisories
              </h4>
              <div className="flex flex-wrap gap-2">
                {finding.references.map((ref, idx) => (
                  <a 
                    key={idx} 
                    href={ref} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-[10px] text-gray-300 hover:bg-gray-800 hover:text-indigo-400 transition-all font-bold"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Reference {idx + 1}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center">
              <Code className="w-3 h-3 mr-2" /> Contextual Evidence
            </h4>
            <div className="bg-black/50 rounded-2xl p-5 border border-gray-800/80 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
              <div className="flex space-x-4 mb-2 opacity-30 select-none">
                <span className="text-gray-500 text-[10px]">{finding.evidence.file}</span>
                <span className="text-gray-500 text-[10px]">L:{finding.evidence.lineRange}</span>
              </div>
              <code className="text-indigo-200/90">{finding.evidence.snippet}</code>
            </div>
          </section>

          <section className={`border rounded-3xl p-6 lg:p-8 space-y-6 ${finding.category === Category.PRIVACY ? 'bg-purple-500/5 border-purple-500/10' : 'bg-indigo-500/5 border-indigo-500/10'}`}>
            <div className="flex items-center justify-between">
              <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] flex items-center ${finding.category === Category.PRIVACY ? 'text-purple-400' : 'text-indigo-400'}`}>
                <Zap className={`w-4 h-4 mr-2 fill-current`} /> Vibe-Approved Remediation
              </h4>
            </div>
            
            <p className="text-sm text-gray-300 font-medium leading-relaxed">{finding.fixGuidance.explanation}</p>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg w-fit">
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">At-Risk Pattern</span>
                </div>
                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 font-mono text-xs opacity-60">
                  <code className="text-red-200/70">{finding.evidence.snippet.split('\n')[0]}...</code>
                </div>
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                <div className="bg-gray-900 border border-gray-700 p-2 rounded-full shadow-xl">
                  <ArrowRight className="w-4 h-4 text-indigo-400 transform rotate-90 lg:rotate-0" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg w-fit">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Recommended Fix</span>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 font-mono text-xs shadow-2xl">
                  <code className="text-green-300">{finding.fixGuidance.alternative}</code>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default FindingsCard;
