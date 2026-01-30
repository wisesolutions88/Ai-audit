
import React from 'react';
import { APIEndpoint } from '../types';
import { Link as LinkIcon, Lock, Unlock, AlertCircle, Server, Zap, ShieldAlert, ShieldX, Globe } from 'lucide-react';

interface EndpointMapProps {
  endpoints: APIEndpoint[];
}

const EndpointMap: React.FC<EndpointMapProps> = ({ endpoints }) => {
  if (endpoints.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center">
          <Server className="w-3 h-3 mr-2" /> API Surface Map ({endpoints.length})
        </h4>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {endpoints.map((ep, idx) => (
          <div key={idx} className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 space-y-4 group hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 overflow-hidden">
                <div className={`w-14 h-9 flex items-center justify-center rounded-xl text-[10px] font-black border ${
                  ep.method === 'GET' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  ep.method === 'POST' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  'bg-purple-500/10 text-purple-400 border-purple-500/20'
                }`}>
                  {ep.method}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-mono text-white group-hover:text-indigo-400 transition-colors truncate">{ep.path}</span>
                  <span className="text-[10px] text-gray-500 truncate">{ep.description}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-[10px] font-black ${ep.hasAuth ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {ep.hasAuth ? <Lock className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                  <span>{ep.hasAuth ? 'AUTH' : 'NO AUTH'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
               <div className={`flex flex-col items-center justify-center py-2 rounded-xl border text-[9px] font-bold ${ep.abuseControls.rateLimited ? 'bg-gray-800/50 text-gray-400 border-gray-800' : 'bg-red-500/5 text-red-500 border-red-500/10'}`}>
                 <span>RATE LIMIT</span>
                 <span className="opacity-50">{ep.abuseControls.rateLimited ? 'YES' : 'MISSING'}</span>
               </div>
               
               <div className={`flex flex-col items-center justify-center py-2 rounded-xl border text-[9px] font-bold ${ep.abuseControls.paginated ? 'bg-gray-800/50 text-gray-400 border-gray-800' : 'bg-yellow-500/5 text-yellow-500 border-yellow-500/10'}`}>
                 <span>PAGING</span>
                 <span className="opacity-50">{ep.abuseControls.paginated ? 'YES' : 'NONE'}</span>
               </div>

               <div className={`flex flex-col items-center justify-center py-2 rounded-xl border text-[9px] font-bold ${!ep.abuseControls.idorRisk ? 'bg-gray-800/50 text-gray-400 border-gray-800' : 'bg-orange-500/5 text-orange-500 border-orange-500/20'}`}>
                 <span>IDOR</span>
                 <span className="opacity-50">{ep.abuseControls.idorRisk ? 'HIGH' : 'LOW'}</span>
               </div>

               <div className={`flex flex-col items-center justify-center py-2 rounded-xl border text-[9px] font-bold ${!ep.abuseControls.injectionRisk ? 'bg-gray-800/50 text-gray-400 border-gray-800' : 'bg-red-600/10 text-red-500 border-red-600/20 animate-pulse'}`}>
                 <span>INJECTION</span>
                 <span className="opacity-50">{ep.abuseControls.injectionRisk ? 'ALERT' : 'SAFE'}</span>
               </div>

               <div className={`flex flex-col items-center justify-center py-2 rounded-xl border text-[9px] font-bold ${!ep.abuseControls.ssrfRisk ? 'bg-gray-800/50 text-gray-400 border-gray-800' : 'bg-purple-600/10 text-purple-400 border-purple-600/20'}`}>
                 <span>SSRF</span>
                 <span className="opacity-50">{ep.abuseControls.ssrfRisk ? 'ALERT' : 'SAFE'}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EndpointMap;
