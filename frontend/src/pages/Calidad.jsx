import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Calidad = ({ data }) => {
  return (
    <div className="bg-[#111827] p-10 rounded-[2.5rem] border-2 border-gray-800 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black text-emerald-400 uppercase italic">Cumplimiento de Protocolo (%)</h3>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Basado en selección actual</div>
      </div>
      
      <div className="h-[600px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 50, right: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={true} vertical={false} />
            <XAxis type="number" domain={[0, 100]} stroke="#4B5563" />
            <YAxis dataKey="item" type="category" stroke="#9CA3AF" width={150} fontSize={12} fontWeight="bold" />
            <Tooltip 
              cursor={{fill: '#1F2937'}} 
              contentStyle={{backgroundColor: '#0B0F19', border: '1px solid #333', borderRadius: '12px'}}
            />
            <Bar dataKey="promedio" radius={[0, 10, 10, 0]} barSize={30}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
            <ReferenceLine x={75} stroke="#F59E0B" strokeDasharray="5 5" label={{ position: 'top', value: 'Meta 75%', fill: '#F59E0B', fontSize: 10 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Calidad;
