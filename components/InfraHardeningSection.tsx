
import React from 'react';
import { InfraCheck } from '../types';
import { ShieldCheck, AlertTriangle, XCircle, Cloud } from 'lucide-react';

interface InfraHardeningSectionProps {
  checks: InfraCheck[];
}

const InfraHardeningSection: React.FC<InfraHardeningSectionProps> = ({ checks }) => {
  if (checks.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center">
        <Cloud className="w-3 h-3 mr-2" /> Infrastructure Hardening
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checks.map((check, i) => (
          <div key={i} className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 flex items-start space-x-4">
            <div className="mt-1">
              {check.status === 'PASS' && <ShieldCheck className="w-5 h-5 text-green-500" />}
              {check.status === 'WARN' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
              {check.status === 'FAIL' && <XCircle className="w-5 h-5 text-red-500" />}
            </div>
            <div className="space-y-1">
              <h5 className="text-sm font-bold text-white">{check.title}</h5>
              <p className="text-[11px] text-gray-500 leading-relaxed">{check.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfraHardeningSection;
