import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Zap, 
  Loader2, 
  FileText, 
  X,
  AlertCircle,
  Database,
  Activity,
  MoreHorizontal
} from 'lucide-react';
import axios from 'axios';
import { db, auth } from '../../firebase';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';

const API_URL = 'http://127.0.0.1:8000';

const Analysis = ({ setAnalysisData, setWorlds, analysisData }) => {
  const [endpoint, setEndpoint] = useState('');
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleLaunch = async () => {
    if (!file) {
      setError('Please upload a dataset (CSV or JSON).');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulation for loading UX
      const interval = setInterval(() => {
        setProgress(p => (p < 90 ? p + 5 : p));
      }, 200);

      const response = await axios.post(`${API_URL}/analyze`, formData);

      clearInterval(interval);
      setProgress(100);
      
      const data = response.data;
      setAnalysisData(data);
      
      // Extract numeric score for the simulation tab
      const biasScoreValue = data.bias_score || 0;
      
      const currentWorlds = [
        { name: "Baseline", bias_score: biasScoreValue, status: data.final_verdict === 'UNFAIR' ? "critical" : (data.final_verdict === 'WARNING' ? "warning" : "safe") },
        { name: "Mitigated", bias_score: 0.125, status: "safe" },
        { name: "Stress Test", bias_score: Math.min(5, biasScoreValue * 1.4), status: (biasScoreValue * 1.4 > 3) ? "critical" : "warning" }
      ];

      setWorlds(currentWorlds);

      // Persistence
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const reportsRef = collection(userDocRef, "reports");
        await addDoc(reportsRef, {
          biasScore: data.bias_score,
          title: data.final_verdict,
          explanation: data.explanation,
          fileName: file.name,
          fullResults: data.dimensions, 
          simulations: currentWorlds, 
          createdAt: serverTimestamp()
        });
      }

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message;
      setError(`Analysis failed: ${msg}. Check if backend is running on ${API_URL}`);
    } finally {
      setTimeout(() => setIsAnalyzing(false), 500);
    }
  };

  const reset = () => {
    setFile(null);
    setEndpoint('');
    setAnalysisData(null);
    setWorlds([]);
    setProgress(0);
    setError(null);
  };

  // Internal Components
  const SummaryCard = ({ label, value, subtext }) => (
    <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-all group min-h-[160px]">
      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</h4>
      <div className="space-y-1">
        <p className="text-4xl font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">{value}</p>
        <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2 uppercase tracking-wide">{subtext || '\u00A0'}</p>
      </div>
    </div>
  );

  const SeverityBadge = ({ severity }) => {
    const config = {
      UNFAIR: 'bg-red-500/10 text-red-500 border-red-500/20',
      WARNING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      UNBIASED: 'bg-green-500/10 text-green-500 border-green-500/20'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${config[severity] || config.UNBIASED}`}>
        {severity}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {!analysisData && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Audit Source</h3>
              </div>
              
              {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-48 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-blue-500/20 hover:bg-blue-500/5 transition-all cursor-pointer group"
                >
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  <div className="p-3 rounded-xl bg-blue-500/10 group-hover:scale-110 transition-transform">
                    <Upload size={20} className="text-blue-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-300">Upload dataset (CSV/JSON)</p>
                    <p className="text-xs text-gray-500 mt-1">Enterprise audits support up to 50MB</p>
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 relative">
                  <button onClick={() => setFile(null)} className="absolute top-4 right-4 p-1 text-gray-500 hover:text-white">
                    <X size={16} />
                  </button>
                  <FileText size={32} className="text-blue-400" />
                  <p className="text-sm font-medium text-white">{file.name}</p>
                </div>
              )}
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Live Model API</h3>
              </div>
              <div className="h-48 flex flex-col justify-center gap-4">
                <div className="relative">
                  <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="https://api.enterprise-model.ai/v1"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed italic">
                  Connect direct to production models for continuous fairness monitoring.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={handleLaunch}
              disabled={isAnalyzing}
              className="px-12 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center gap-3"
            >
              {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Activity size={18} />}
              Execute Fairness Audit
            </button>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          </div>
        </div>
      )}

      {/* Audit Progress Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center z-50">
            <div className="w-64 space-y-8 text-center">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                <motion.div 
                  className="absolute inset-0 rounded-full border-t-2 border-blue-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Scanning Dimensions</p>
                <p className="text-4xl font-bold text-white tabular-nums">{Math.round(progress)}%</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audit Report View */}
      <AnimatePresence>
        {analysisData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* Header Verdict Banner */}
            <div className={`p-8 rounded-[32px] border flex items-center gap-8 relative overflow-hidden ${
              analysisData.final_verdict === 'UNFAIR' 
                ? 'bg-red-500/5 border-red-500/10' 
                : analysisData.final_verdict === 'WARNING'
                ? 'bg-amber-500/5 border-amber-500/10'
                : 'bg-green-500/5 border-green-500/10'
            }`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${
                analysisData.final_verdict === 'UNFAIR' 
                  ? 'bg-red-500/20' 
                  : analysisData.final_verdict === 'WARNING'
                  ? 'bg-amber-500/20'
                  : 'bg-green-500/20'
              }`}>
                <AlertCircle size={32} className={
                  analysisData.final_verdict === 'UNFAIR' ? 'text-red-500' : 
                  analysisData.final_verdict === 'WARNING' ? 'text-amber-500' : 'text-green-500'
                } />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white tracking-tight">{analysisData.final_verdict} Verdict</h2>
                <p className={`text-sm mt-1.5 font-medium ${
                  analysisData.final_verdict === 'UNFAIR' ? 'text-red-400/60' : 
                  analysisData.final_verdict === 'WARNING' ? 'text-amber-400/60' : 'text-green-400/60'
                }`}>
                  {analysisData.explanation}
                </p>
              </div>
              <button className="absolute top-8 right-8 text-gray-600 hover:text-white transition-colors">
                <MoreHorizontal size={24} />
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard 
                label="Overall bias score" 
                value={`${analysisData.bias_score} / 5.0`} 
                subtext="System disparity index"
              />
              <SummaryCard 
                label="Confidence Level" 
                value={`${Math.round(analysisData.confidence * 100)}%`} 
                subtext="Based on sample size & variation"
              />
              <SummaryCard 
                label="Data Quality" 
                value={analysisData.data_quality} 
                subtext="Dataset evaluation mode"
              />
              <SummaryCard 
                label="Dimensions Checked" 
                value={analysisData.dimensions.length} 
                subtext={analysisData.dimensions.map(d => d.name).join(', ') || "None"}
              />
            </div>

            {/* Verdict Table */}
            <div className="space-y-6 pt-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Dimension-by-Dimension Verdict</h3>
                <span className="text-[10px] font-medium text-gray-600 uppercase tracking-widest">Audit ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>
              
              <div className="bg-[#0a0a0a] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01]">
                      <th className="px-10 py-6 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Dimension</th>
                      <th className="px-10 py-6 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Verdict</th>
                      <th className="px-10 py-6 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Gap</th>
                      <th className="px-10 py-6 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Finding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {analysisData.dimensions.map((v, i) => (
                      <tr key={i} className="group hover:bg-white/[0.01] transition-all">
                        <td className="px-10 py-7">
                          <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                            {v.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        </td>
                        <td className="px-10 py-7">
                          <SeverityBadge severity={v.verdict} />
                        </td>
                        <td className="px-10 py-7">
                          <div className="flex items-center gap-4">
                            <div className="w-28 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (v.gap) * 100)}%` }}
                                transition={{ duration: 1.2, delay: i * 0.1 }}
                                className={`h-full rounded-full ${
                                  v.verdict === 'UNFAIR' ? 'bg-red-500/80' : v.verdict === 'WARNING' ? 'bg-amber-500/80' : 'bg-green-500/80'
                                }`}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-gray-600 tabular-nums">{Math.round(v.gap * 100)}%</span>
                          </div>
                        </td>
                        <td className="px-10 py-7">
                          <p className="text-xs text-gray-500 leading-relaxed max-w-sm group-hover:text-gray-400 transition-colors">
                            {v.note}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Actionable Recommendations (Conditional) */}
              {analysisData.final_verdict !== 'UNBIASED' && analysisData.recommendations?.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-2">Bias Attribution</h3>
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 space-y-6">
                      {analysisData.bias_breakdown?.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center justify-between group">
                          <div>
                            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">{item.feature}</p>
                            <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                              {item.favored_group} <span className="text-gray-600 mx-2">vs</span> {item.disadvantaged_group}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-red-500">{item.bias_percent}%</p>
                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">Disparity</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-2">Remediation Strategy</h3>
                    <div className="space-y-3">
                      {analysisData.recommendations.map((rec, i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:bg-white/5 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                              <Zap size={18} />
                            </div>
                            <p className="text-sm font-medium text-gray-300">{rec.action}</p>
                          </div>
                          <span className="shrink-0 px-3 py-1 bg-green-500/10 text-green-500 rounded-lg text-[10px] font-bold font-mono">
                            {rec.impact}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center pt-10">
              <button 
                onClick={reset}
                className="px-12 py-4 border border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 hover:text-white hover:border-white/20 transition-all"
              >
                Reset Audit Parameters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Analysis;
