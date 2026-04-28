import React from 'react';
import { ShieldCheck, AlertCircle, Clock, Zap } from 'lucide-react';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell 
} from 'recharts';

const Overview = ({ analysisData }) => {
  // If no data, show empty state or defaults
  const hasData = !!analysisData;
  
  const barData = hasData && analysisData.group_comparison ? 
    Object.entries(analysisData.group_comparison).map(([name, value]) => ({ 
      name, 
      bias: (1 - value) * 100, 
      parity: value * 100 
    })) : [
      { name: 'Group A', bias: 12, parity: 88 },
      { name: 'Group B', bias: 45, parity: 55 },
      { name: 'Group C', bias: 28, parity: 72 },
      { name: 'Group D', bias: 15, parity: 85 },
    ];

  const pieData = [
    { name: 'Race', value: 400 },
    { name: 'Gender', value: 300 },
    { name: 'Age', value: 300 },
    { name: 'Location', value: 200 },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];

  return (
    <div className="space-y-10">
      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Overall Bias Score" 
          value={hasData ? analysisData.bias_score : "4.2"} 
          label={hasData ? (analysisData.bias_score > 0.5 ? "Critical Risk" : "Low Risk") : "Baseline"} 
          trend={hasData ? (analysisData.bias_score > 0.5 ? "+14%" : "-12%") : "-12%"} 
          icon={<ShieldCheck className={hasData && analysisData.bias_score > 0.5 ? "text-red-400" : "text-green-400"} />} 
        />
        <SummaryCard 
          title="Identified Conflicts" 
          value={hasData ? (analysisData.bias_score > 0.5 ? "24" : "12") : "12"} 
          label="Causal Proxies" 
          trend={hasData ? "+8" : "+2"} 
          icon={<AlertCircle className="text-yellow-400" />} 
        />
        <SummaryCard 
          title="Scan Runtime" 
          value="124ms" 
          label="Top 5% Performance" 
          trend="-4ms" 
          icon={<Clock className="text-blue-400" />} 
        />
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Group Disparity Comparison</h3>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">
              {hasData ? "Real-time Metrics" : "Sample Data"}
            </span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="parity" name="Approval Rate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bias" name="Disparity Gap" fill="#1e293b" radius={[4, 4, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Bias Weight Distribution</h3>
            {!hasData && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                <Zap size={12} /> Sync Required
              </div>
            )}
          </div>
          <div className="h-[300px] w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </RePieChart>
            </ResponsiveContainer>
            <div className="space-y-2 pr-8">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  {d.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const SummaryCard = ({ title, value, label, trend, icon }) => (
  <div className="glass-card">
    <div className="flex justify-between items-start mb-4">
      <p className="text-sm text-gray-400 font-medium">{title}</p>
      {icon}
    </div>
    <div className="flex items-baseline gap-3">
      <h4 className="text-3xl font-bold">{value}</h4>
      <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-red-400' : 'text-blue-400'}`}>{trend}</span>
    </div>
    <p className="text-xs text-gray-500 mt-1">{label}</p>
  </div>
);

export default Overview;
