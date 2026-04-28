import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  XCircle, 
  TrendingDown, 
  TrendingUp,
  Zap,
  Globe
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const Simulation = ({ worlds = [], analysisData }) => {
  const [selectedWorld, setSelectedWorld] = useState(null);

  // Map world status to icons and colors
  const getStatusConfig = (status = '') => {
    const s = status.toLowerCase();
    switch (s) {
      case 'stable':
      case 'safe': 
        return { color: 'bg-green-500/20 text-green-400', icon: <Shield size={20} className="text-green-400" /> };
      case 'warning': 
        return { color: 'bg-yellow-500/20 text-yellow-400', icon: <AlertTriangle size={20} className="text-yellow-400" /> };
      case 'critical':
      case 'danger':
        return { color: 'bg-red-500/20 text-red-400', icon: <XCircle size={20} className="text-red-400" /> };
      default: return { color: 'bg-gray-500/20 text-gray-400', icon: <Shield size={20} /> };
    }
  };

  // Mock chart data generation based on bias score
  const generateChartData = (biasScore) => {
    const base = 75;
    const factor = biasScore * 50;
    return [
      { name: 'Group A', value: Math.min(98, base + (Math.random() * 5)) },
      { name: 'Group B', value: Math.max(12, base - factor + (Math.random() * 10)) },
      { name: 'Group C', value: Math.max(15, base - (factor * 0.7) + (Math.random() * 8)) },
      { name: 'Group D', value: Math.min(95, base + (Math.random() * 3)) },
    ];
  };

  return (
    <div className="space-y-6 min-h-[600px]">
      <AnimatePresence mode="wait">
        {!selectedWorld ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Multiverse Scenarios</h2>
                <p className="text-gray-500 text-sm mt-1">Parallel demographic simulations based on current model weights</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] bg-white/[0.03] px-4 py-2 rounded-full border border-white/5">
                <Globe size={14} className="text-blue-500 animate-pulse" /> 
                {worlds.length > 0 ? `${worlds.length} Parallel Dimensions Synced` : 'No Simulations'}
              </div>
            </div>

            {worlds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {worlds.map((world, idx) => {
                  const config = getStatusConfig(world.status);
                  return (
                    <WorldCard 
                      key={idx} 
                      world={world} 
                      config={config}
                      onClick={() => setSelectedWorld(world)} 
                    />
                  );
                })}
              </div>
            ) : (
              <div className="glass-card flex flex-col items-center justify-center p-24 text-center space-y-6 border border-dashed border-white/10 rounded-[32px] bg-[#050505]">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/5">
                  <Zap size={32} className="text-gray-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-300">Multiverse Offline</h3>
                  <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed">Please complete an analysis scan first to synchronize parallel demographic simulations.</p>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-10"
          >
            <button 
              onClick={() => setSelectedWorld(null)}
              className="flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-all group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              Back to Multiverse
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1">
                <div className="glass-card !p-10 rounded-[32px] bg-[#0a0a0a] border border-white/5 shadow-2xl h-full flex flex-col justify-between">
                  <div className="space-y-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white/[0.03] rounded-2xl flex items-center justify-center border border-white/5">
                        {getStatusConfig(selectedWorld.status).icon}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black tracking-tight">{selectedWorld.name}</h3>
                        <span className={`inline-block px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusConfig(selectedWorld.status).color}`}>
                          {selectedWorld.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Bias Score</p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-6xl font-black tracking-tighter text-white">
                          {typeof selectedWorld.bias_score === 'number' ? selectedWorld.bias_score.toFixed(3) : selectedWorld.bias_score}
                        </span>
                        {analysisData && (
                          <span className={`text-sm font-bold flex items-center gap-1 ${selectedWorld.bias_score <= analysisData.bias_score ? 'text-green-400' : 'text-red-400'}`}>
                            {selectedWorld.bias_score <= analysisData.bias_score ? <TrendingDown size={14} /> : <TrendingUp size={14} />} 
                            {(Math.abs(selectedWorld.bias_score - analysisData.bias_score)).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 pt-8 mt-10 border-t border-white/5">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-yellow-500/80">
                      <Zap size={14} /> Scenario Context
                    </h4>
                    <p className="text-sm text-gray-400 leading-relaxed font-medium italic">
                      {selectedWorld.description || `Simulated parallel world where causal weights for ${selectedWorld.name} are shifted by ${(selectedWorld.bias_score * 10).toFixed(1)}x to test demographic stability.`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div className="glass-card !p-10 rounded-[32px] bg-[#0a0a0a] border border-white/5 shadow-2xl">
                  <div className="flex justify-between items-center mb-10">
                    <h4 className="text-lg font-bold tracking-tight">Demographic Parity Analysis</h4>
                    <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" /> 
                      Positivity Rate
                    </div>
                  </div>
                  
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={generateChartData(selectedWorld.bias_score)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#444" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="#444" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} domain={[0, 100]} dx={-10} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                          contentStyle={{ backgroundColor: '#000', border: '1px solid #222', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                          itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                          {generateChartData(selectedWorld.bias_score).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.value < 40 ? '#ef4444' : entry.value < 70 ? '#f59e0b' : '#3b82f6'} fillOpacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card !p-10 rounded-[32px] bg-gradient-to-br from-blue-500/[0.03] to-transparent border border-blue-500/10 shadow-xl">
                  <h4 className="text-lg font-bold flex items-center gap-3 mb-5">
                    <Shield size={24} className="text-blue-400" /> Strategic Recommendation
                  </h4>
                  <p className="text-gray-300 leading-relaxed mb-10 font-medium italic">
                    {selectedWorld.bias_score > 0.4 ? 
                      "CRITICAL: High disparity detected in parallel simulation. Immediate suppression of group-proxies and adversarial debiasing layers recommended for this scenario." : 
                      "Model parity remains within acceptable limits. This simulation suggests the current weighting logic is resilient to demographic drift."}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button className="px-8 py-3 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors shadow-lg">Commit Weights</button>
                    <button className="px-8 py-3 bg-white/5 text-gray-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/5">Export Log</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WorldCard = ({ world, onClick, config }) => (
  <motion.div 
    whileHover={{ y: -8, scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className="glass-card p-8 rounded-[28px] border border-white/5 bg-[#0a0a0a] hover:bg-white/[0.02] cursor-pointer group shadow-xl transition-all"
    onClick={onClick}
  >
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 bg-white/[0.03] rounded-xl flex items-center justify-center group-hover:bg-blue-500/10 transition-colors border border-white/5">
        {config.icon}
      </div>
      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${config.color}`}>
        {world.status}
      </span>
    </div>
    <div className="space-y-3">
      <h4 className="font-bold text-xl tracking-tight text-white group-hover:text-blue-400 transition-colors">{world.name}</h4>
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 font-medium">
        {world.description || `Simulated outcome testing model resilience against shifted demographic weights.`}
      </p>
    </div>
    <div className="flex items-center justify-between pt-8 mt-4 border-t border-white/5">
      <div className="space-y-1">
        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Bias Score</p>
        <span className="text-lg font-black text-white">
          {typeof world.bias_score === 'number' ? world.bias_score.toFixed(3) : world.bias_score}
        </span>
      </div>
      <button className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 group-hover:gap-3 transition-all text-blue-500/80 group-hover:text-blue-400">
        Enter World <ChevronRight size={14} />
      </button>
    </div>
  </motion.div>
);

export default Simulation;
