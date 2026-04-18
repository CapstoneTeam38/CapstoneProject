import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const LineChartCard = ({ data = [] }) => {
  if (!data || data.length === 0) return null;

  // Formatting amountDistribution buckets for visualization
  const chartData = data.map(item => ({
    range: item.range === 'Other' ? '10k+' : `$${item.range}`,
    total: item.count,
    fraud: item.fraudCount
  }));

  return (
    <div className="glass-panel p-6 border-white/5 h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fraud Density by Amount</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Volume Distribution across price buckets</p>
        </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
            <XAxis 
              dataKey="range" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10 }}
              dy={10}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10 }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#f43f5e', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px' }}
              itemStyle={{ fontWeight: 'bold' }}
              cursor={{ fill: '#ffffff05' }}
            />
            <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
            
            <Bar 
              yAxisId="left"
              dataKey="total" 
              name="Total Volume"
              fill="url(#barGradient)" 
              stroke="#0ea5e950"
              radius={[4, 4, 0, 0]}
              barSize={40}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="fraud" 
              name="Fraud Anomalies"
              stroke="#f43f5e" 
              strokeWidth={3}
              dot={{ fill: '#f43f5e', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChartCard;
