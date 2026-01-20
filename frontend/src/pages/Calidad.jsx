import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, AreaChart, Area } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84cc16', '#6366f1', '#f43f5e', '#a855f7', '#14b8a6', '#f59e0b', '#d946ef', '#0ea5e9', '#f97316'];

const Calidad = ({ data, evolucion }) => {
  return (
    <div className="space-y-10 pb-20">
      <div className="bg-[#111827] p-10 rounded-[2.5rem] border-2 border-gray-800 shadow-2xl">
        <h3 className="text-2xl font-black text-emerald-400 uppercase italic mb-8">Cumplimiento General de Protocolo</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="item" stroke="#9CA3AF" interval={0} angle={-45} textAnchor="end" fontSize={10} fontWeight="900" />
              <YAxis stroke="#4B5563" domain={[0, 100]} />
              <Tooltip contentStyle={{backgroundColor: '#0B0F19', border: '1px solid #333', borderRadius: '12px'}} />
              <Bar dataKey="promedio" radius={[6, 6, 0, 0]} barSize={35}>
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
              <ReferenceLine y={90} stroke="#10B981" strokeDasharray="3 3" />
              <ReferenceLine y={75} stroke="#F59E0B" strokeDasharray="5 5" />
              <ReferenceLine y={50} stroke="#EF4444" strokeDasharray="3 3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {data && data.length > 0 && data.map((variable, index) => (
          <div key={variable.item} className="bg-[#111827] p-8 rounded-[2.5rem] border border-gray-800 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{variable.item}</span>
              <span className="text-2xl font-black" style={{ color: COLORS[index % COLORS.length] }}>{variable.promedio}%</span>
            </div>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolucion}>
                  <defs>
                    <linearGradient id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} horizontal={false} />
                  <Tooltip labelFormatter={(l) => `Fecha: ${l}`} contentStyle={{backgroundColor: '#0B0F19', border: '1px solid #333', borderRadius: '8px', fontSize: '10px'}} />
                  <Area type="monotone" dataKey={variable.item} stroke={COLORS[index % COLORS.length]} fill={`url(#grad-${index})`} strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calidad;
