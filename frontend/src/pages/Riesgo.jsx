import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#EF4444', '#F59E0B', '#F87171', '#FB923C', '#DC2626', '#FACC15', '#B91C1C'];

// Componente personalizado para el Tooltip para asegurar legibilidad
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F2937] border border-gray-700 p-4 rounded-xl shadow-2xl">
        <p className="text-gray-400 text-[10px] font-black uppercase mb-1">{label}</p>
        <p className="text-white text-2xl font-black">
          {Number(payload[0].value).toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

const Riesgo = ({ data, evolucion }) => {
  if (!data || data.length === 0) return <div className="text-center p-20 text-gray-500 font-black tracking-widest uppercase">Cargando Monitor de Riesgo...</div>;

  const variablesRiesgo = data.filter(d => d.item !== 'FINAL');
  const datoFinal = data.find(d => d.item === 'FINAL') || { promedio: 0 };
  const totalRiesgoGlobal = Number(datoFinal.promedio).toFixed(2);

  return (
    <div className="space-y-10 pb-20">
      {/* 1. GRÁFICO GRANDE: BARRAS IMPONENTES */}
      <div className="bg-[#111827] p-10 rounded-[2.5rem] border-2 border-gray-800 shadow-2xl relative">
        <div className="absolute top-6 right-10 text-right">
          <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">Tasa de Riesgo Global</div>
          <div className="text-6xl font-black text-white drop-shadow-lg">{totalRiesgoGlobal}%</div>
        </div>
        <h3 className="text-2xl font-black text-red-500 uppercase italic mb-12 tracking-tighter">Incidencia Crítica (% sobre Total)</h3>
        
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={variablesRiesgo} margin={{ bottom: 60, right: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="item" stroke="#9CA3AF" interval={0} angle={-45} textAnchor="end" fontSize={12} fontWeight="900" />
              <YAxis stroke="#4B5563" tickFormatter={(v) => `${v}%`} width={80} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#1F2937', opacity: 0.4}} />
              
              {/* Barras anchas (barSize={100}) para que se vean potentes */}
              <Bar dataKey="promedio" radius={[10, 10, 0, 0]} barSize={100}>
                {variablesRiesgo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. GRID DE MINI GRÁFICOS: EVOLUCIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {variablesRiesgo.map((variable, index) => (
          <div key={variable.item} className="bg-[#111827] p-6 rounded-[2.5rem] border border-gray-800 shadow-xl group hover:border-red-500/50 transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{variable.item}</span>
              <span className="text-xl font-black" style={{ color: COLORS[index % COLORS.length] }}>{variable.promedio}%</span>
            </div>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolucion}>
                  <defs>
                    <linearGradient id={`grad-risk-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  {/* Tooltip activado en los pequeños */}
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey={variable.item} stroke={COLORS[index % COLORS.length]} fill={`url(#grad-risk-${index})`} strokeWidth={4} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}

        {/* 3. TENDENCIA GLOBAL */}
        <div className="md:col-span-3 bg-[#111827] p-8 rounded-[2.5rem] border-2 border-red-500/30 shadow-2xl mt-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-white font-black text-xl italic uppercase tracking-tighter">Tendencia de Exposición al Riesgo</h4>
              <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Promedio de todas las variables en el tiempo</p>
            </div>
            <div className="text-5xl font-black text-white">{totalRiesgoGlobal}%</div>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolucion}>
                <defs>
                  <linearGradient id="gradFinalRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="FINAL" stroke="#EF4444" fill="url(#gradFinalRisk)" strokeWidth={6} dot={{ r: 4, fill: '#EF4444' }} activeDot={{ r: 8 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Riesgo;
