import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#EF4444', '#F59E0B', '#F87171', '#FB923C', '#DC2626', '#FACC15', '#B91C1C'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F2937] border border-gray-700 p-3 md:p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-gray-400 text-[10px] font-black uppercase mb-1">{label}</p>
        <p className="text-white text-xl md:text-2xl font-black">
          {Number(payload[0].value).toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

const Riesgo = ({ data, evolucion }) => {
  if (!data || data.length === 0 || (data.length === 1 && data[0].promedio === 0)) {
    return (
      <div className="flex flex-col items-center justify-center p-10 md:p-20 text-gray-500 border-2 border-dashed border-red-900/30 rounded-[2rem] md:rounded-[2.5rem] bg-[#111827]">
        <span className="text-4xl md:text-6xl mb-4">🛡️</span>
        <p className="font-black tracking-widest uppercase text-center text-red-400/50 text-sm md:text-base">Sin alertas de riesgo detectadas</p>
        <p className="text-[10px] md:text-xs mt-2 text-center">La operación se encuentra dentro de los parámetros normales.</p>
      </div>
    );
  }

  const variablesRiesgo = data.filter(d => d.item !== 'FINAL');
  const datoFinal = data.find(d => d.item === 'FINAL') || { promedio: 0 };
  const totalRiesgoGlobal = Number(datoFinal.promedio).toFixed(2);

  return (
    <div className="space-y-6 md:space-y-10 pb-10 md:pb-20 animate-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. GRÁFICO PRINCIPAL DE INCIDENCIAS */}
      <div className="bg-[#111827] p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-gray-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4">
          <h3 className="text-lg md:text-2xl font-black text-red-500 uppercase italic tracking-tighter flex items-center gap-3">
            <span className="w-6 md:w-8 h-1 bg-red-500 block"></span>
            Incidencia Crítica
          </h3>
          <div className="bg-red-950/20 p-4 rounded-2xl border border-red-500/20 flex flex-col items-end w-full md:w-auto">
            <div className="text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">Tasa de Riesgo Global</div>
            <div className="text-4xl md:text-6xl font-black text-white drop-shadow-lg leading-none">{totalRiesgoGlobal}%</div>
          </div>
        </div>
        
        <div className="h-[300px] md:h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={variablesRiesgo} margin={{ bottom: 60, left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis 
                dataKey="item" 
                stroke="#9CA3AF" 
                interval={0} 
                angle={-45} 
                textAnchor="end" 
                fontSize={8} 
                fontWeight="900"
                height={80}
              />
              <YAxis stroke="#4B5563" tickFormatter={(v) => `${v}%`} fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#1F2937', opacity: 0.4}} />
              
              <Bar 
                dataKey="promedio" 
                radius={[4, 4, 0, 0]} 
                barSize={window.innerWidth < 768 ? 20 : 60}
              >
                {variablesRiesgo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. GRID DE EVOLUCIÓN TEMPORAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {variablesRiesgo.map((variable, index) => (
          <div key={variable.item} className="bg-[#111827] p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-800 shadow-xl group hover:border-red-500/50 transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-tighter truncate pr-2">{variable.item}</span>
              <span className="text-lg md:text-xl font-black" style={{ color: COLORS[index % COLORS.length] }}>{variable.promedio}%</span>
            </div>
            <div className="h-[100px] md:h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolucion}>
                  <defs>
                    <linearGradient id={`grad-risk-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey={variable.item} 
                    stroke={COLORS[index % COLORS.length]} 
                    fill={`url(#grad-risk-${index})`} 
                    strokeWidth={3} 
                    dot={false}
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* 3. TENDENCIA GLOBAL */}
      <div className="bg-[#111827] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-red-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h4 className="text-white font-black text-lg md:text-xl italic uppercase tracking-tighter">Tendencia de Exposición</h4>
            <p className="text-red-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Movimiento del promedio crítico</p>
          </div>
          <div className="text-3xl md:text-5xl font-black text-white bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20">
            {totalRiesgoGlobal}%
          </div>
        </div>
        <div className="h-[140px] md:h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolucion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                  type="monotone" 
                  dataKey="FINAL" 
                  stroke="#EF4444" 
                  fill="#EF444422" 
                  strokeWidth={4} 
                  dot={{ r: 3, fill: '#EF4444', strokeWidth: 2, stroke: '#111827' }} 
                  animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Riesgo;