
import React from 'react';
import { SecretLeak, Severity } from '../types';
import { ShieldAlert, Key, Terminal, ArrowRight } from 'lucide-react';

interface SecretScannerProps {
  leaks: SecretLeak[];
}

const severityStyles = {
  [Severity.LOW]: "text-blue-400",
  [Severity.MEDIUM]: "text-yellow-400",
  [Severity.HIGH]: "text-orange-400",
  [Severity.CRITICAL]: "text-red-400 animate-pulse",
};

const SecretScanner: React.FC<SecretScannerProps> = ({ leaks }) => {
  if (leaks.length === 0) {
    return (
      <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6 text-center">
        <p className="text-xs font-bold text-green-400 uppercase tracking-widest">No Hardcoded Secrets Detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] flex items-center">
        <Key className="w-3 h-3 mr-2" /> Entropy Leak Detection ({leaks.length})
      </h4>
      <div className="space-y-3">
        {leaks.map((leak, idx) => (
          <div key={idx} className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className={`w-4 h-4 ${severityStyles[leak.severity]}`} />
                <span className="text-xs font-black text-gray-200 uppercase tracking-wider">{leak.keyType}</span>
              </div>
              <span className="text-[10px] font-mono text-gray-500">{leak.file}</span>
            </div>
            <div className="bg-black/40 rounded-lg p-3 font-mono text-[10px] text-red-200/60 overflow-x-auto whitespace-pre border border-red-500/10">
              {leak.snippet}
            </div>
            <div className="flex items-start space-x-2 bg-black/20 p-2 rounded-lg border border-gray-800">
              <Terminal className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-indigo-300 leading-normal">{leak.remediation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecretScanner;
