
import React from 'react';
import { Checkpoint } from '../types';
import { CheckCircle2, XCircle, AlertCircle, ListChecks } from 'lucide-react';

interface SecurityChecklistProps {
  checkpoints: Checkpoint[];
}

const SecurityChecklist: React.FC<SecurityChecklistProps> = ({ checkpoints }) => {
  if (!checkpoints || checkpoints.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <ListChecks className="w-5 h-5 text-indigo-400" />
        <h3 className="text-xl font-black text-white uppercase tracking-tight">Ship-Ready Checkpoints</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checkpoints.map((cp) => (
          <div key={cp.id} className={`p-4 rounded-2xl border transition-all ${
            cp.status === 'PASS' ? 'bg-green-500/5 border-green-500/10' :
            cp.status === 'FAIL' ? 'bg-red-500/5 border-red-500/10' :
            'bg-yellow-500/5 border-yellow-500/10'
          }`}>
            <div className="flex items-start space-x-3">
              <div className="mt-0.5">
                {cp.status === 'PASS' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {cp.status === 'FAIL' && <XCircle className="w-4 h-4 text-red-500" />}
                {cp.status === 'WARN' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black text-gray-500">#{cp.id}</span>
                  <h5 className={`text-xs font-bold ${
                    cp.status === 'PASS' ? 'text-green-200' :
                    cp.status === 'FAIL' ? 'text-red-200' :
                    'text-yellow-200'
                  }`}>{cp.title}</h5>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">{cp.summary}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityChecklist;
