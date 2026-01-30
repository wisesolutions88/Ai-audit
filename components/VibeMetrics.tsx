
import React from 'react';
import { QualityMetrics } from '../types';
import { Activity, Gauge, Wrench, Zap } from 'lucide-react';

interface VibeMetricsProps {
  metrics: QualityMetrics;
}

const MetricBar = ({ label, value, icon: Icon, colorClass }: { label: string, value: number, icon: any, colorClass: string }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
      <span className={`text-[10px] font-black ${colorClass}`}>{value}%</span>
    </div>
    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
      <div 
        className={`h-full ${colorClass.replace('text-', 'bg-')} transition-all duration-1000 ease-out`} 
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const VibeMetrics: React.FC<VibeMetricsProps> = ({ metrics }) => {
  return (
    <div className="space-y-6">
      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center">
        <Gauge className="w-3 h-3 mr-2" /> Code Health Telemetry
      </h4>
      <div className="space-y-4">
        <MetricBar label="Maintainability" value={metrics.maintainability} icon={Wrench} colorClass="text-indigo-400" />
        <MetricBar label="Complexity" value={100 - metrics.complexity} icon={Activity} colorClass="text-purple-400" />
        <MetricBar label="Performance" value={metrics.performance} icon={Zap} colorClass="text-yellow-400" />
      </div>
    </div>
  );
};

export default VibeMetrics;
