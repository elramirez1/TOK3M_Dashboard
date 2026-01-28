import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#8B5CF6', '#A78BFA', '#EC4899', '#F472B6', '#6366F1', '#818CF8'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F2937] border border-gray-700 p-4 rounded-xl shadow-2xl">
        <p className="text-gray-400 text-[10px] font-black uppercase mb-1">{label}</p>
        <p className="text-white text-2xl font-black">{Number(payload[0].value).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const Emocional = ({ data, evolucion }) => {
  if (!data || data.length === 0 || (data.length === 1 && data[0].promedio === 0)) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-gray-500 border-2 border-dashed border-gray-800 rounded-[2.5rem] bg-[#111827]">
        <span className="text-6xl mb-4">🧠</span>
        <p className="font-black tracking-widest uppercase text-center">No hay datos emocionales disponibles</p>
        <p className="text-xs mt-2 text-gray-600">Verifica que las llamadas procesadas tengan score de sentimiento.</p>
      </div>
    );
  }

  const variablesEmocion = data.filter(d => d.item !== 'FINAL');
  const datoFinal = data.find(d => d.item === 'FINAL');
  const totalFinal = datoFinal ? datoFinal.promedio : 0;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* CARD PRINCIPAL: RANKING EMOCIONAL */}
      <div className="bg-[#111827] p-10 rounded-[2.5rem] border-2 border-gray-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-6 right-10 text-right z-10">
          <div className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-1">Score Sentimental Global</div>
          <div className="text-6xl font-black text-white drop-shadow-lg">{totalFinal}%</div>
        </div>
        
        <h3 className="text-2xl font-black text-purple-400 uppercase italic mb-12 flex items-center gap-3">
            <span className="w-8 h-1 bg-purple-500 block"></span> 
            Análisis de Sentimientos
        </h3>

        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={variablesEmocion} margin={{ bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="item" stroke="#9CA3AF" interval={0} angle={-45} textAnchor="end" fontSize={10} fontWeight="900" />
              <YAxis stroke="#4B5563" />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#1F2937', opacity: 0.4}} />
              <Bar dataKey="promedio" radius={[6, 6, 0, 0]} barSize={40}>
                {variablesEmocion.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRID DE MINI EVOLUCIONES POR EMOCIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {variablesEmocion.map((variable, index) => (
          <div key={variable.item} className="bg-[#111827] p-6 rounded-[2.5rem] border border-gray-800 shadow-xl hover:border-gray-600 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter truncate w-2/3">{variable.item}</span>
              <span className="text-xl font-black" style={{ color: COLORS[index % COLORS.length] }}>{variable.promedio}%</span>
            </div>
            <div className="h-[100px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolucion}>
                  <defs>
                    <linearGradient id={`grad-emo-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey={variable.item} stroke={COLORS[index % COLORS.length]} fill={`url(#grad-emo-${index})`} strokeWidth={3} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER: EVOLUCIÓN SCORE TOTAL */}
      <div className="bg-[#111827] p-8 rounded-[2.5rem] border-2 border-purple-500/30 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-white font-black text-xl italic uppercase">Evolución Sentimiento General</h4>
          <div className="text-5xl font-black text-white">{totalFinal}%</div>
        </div>
        <div className="h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolucion}>
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="FINAL" stroke="#A78BFA" fill="#8B5CF633" strokeWidth={5} dot={{ r: 4, fill: '#A78BFA' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Emocional;
