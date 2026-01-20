import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84cc16', '#6366f1', '#f43f5e'];

const Calidad = ({ data }) => {
  return (
    <div className="bg-[#111827] p-10 rounded-[2.5rem] border-2 border-gray-800 shadow-2xl">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-2xl font-black text-emerald-400 uppercase italic">Cumplimiento de Protocolo (%)</h3>
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Metas: 50% | 75% | 90%</div>
      </div>
      
      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 60, left: 0, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis 
              dataKey="item" 
              stroke="#9CA3AF" 
              interval={0} 
              angle={-45} 
              textAnchor="end" 
              fontSize={10} 
              fontWeight="900"
              tick={{ dy: 10 }}
            />
            <YAxis stroke="#4B5563" domain={[0, 100]} fontSize={12} />
            <Tooltip 
              cursor={{fill: '#1F2937'}} 
              contentStyle={{backgroundColor: '#0B0F19', border: '1px solid #333', borderRadius: '12px'}}
            />
            <Bar dataKey="promedio" radius={[6, 6, 0, 0]} barSize={35}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
            
            {/* Líneas de Referencia */}
            <ReferenceLine y={90} stroke="#10B981" strokeDasharray="3 3" label={{ position: 'right', value: 'Exc. 90%', fill: '#10B981', fontSize: 11, fontWeight: 'bold' }} />
            <ReferenceLine y={75} stroke="#F59E0B" strokeDasharray="5 5" label={{ position: 'right', value: 'Meta 75%', fill: '#F59E0B', fontSize: 11, fontWeight: 'bold' }} />
            <ReferenceLine y={50} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Crítico 50%', fill: '#EF4444', fontSize: 11, fontWeight: 'bold' }} />
            
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Calidad;
