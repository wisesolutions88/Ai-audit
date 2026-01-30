
import React from 'react';
import { ThreatModel } from '../types';
import { Target, Map, ShieldAlert, Key } from 'lucide-react';

interface ThreatModelSectionProps {
  model: ThreatModel;
}

const ThreatModelSection: React.FC<ThreatModelSectionProps> = ({ model }) => {
  return (
    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-3xl p-8 space-y-8">
      <div className="flex items-center space-x-3">
        <Target className="w-5 h-5 text-indigo-400" />
        <h3 className="text-xl font-black text-white uppercase tracking-tight">Threat Landscape</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
            <Key className="w-3 h-3 mr-2" /> High-Value Assets
          </h4>
          <div className="flex flex-wrap gap-2">
            {model.assets.map((asset, i) => (
              <span key={i} className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold text-gray-300">
                {asset}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
            <Map className="w-3 h-3 mr-2" /> Entry Points
          </h4>
          <div className="flex flex-wrap gap-2">
            {model.entryPoints.map((entry, i) => (
              <span key={i} className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold text-indigo-300">
                {entry}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-indigo-500/10">
        <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center mb-4">
          <ShieldAlert className="w-3 h-3 mr-2" /> Top Abuse Scenarios
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {model.topAbuseCases.map((abuse, i) => (
            <div key={i} className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 text-sm text-gray-400 leading-relaxed italic">
              "An attacker might try to {abuse}..."
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThreatModelSection;
