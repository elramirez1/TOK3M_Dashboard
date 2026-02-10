import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#F59E0B', '#F97316', '#EF4444', '#D946EF', '#8B5CF6', '#6366F1', '#3B82F6', '#06B6D4', '#10B981', '#84CC16'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F2937] border border-gray-700 p-3 md:p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-gray-400 text-[10px] font-black uppercase mb-1">{label}</p>
        <p className="text-white text-xl md:text-2xl font-black">{Number(payload[0].value).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const Motivos = ({ data, evolucion }) => {
  if (!data || data.length === 0 || (data.length === 1 && data[0].promedio === 0)) {
    return (
      <div className="flex flex-col items-center justify-center p-10 md:p-20 text-gray-500 border-2 border-dashed border-gray-800 rounded-[2rem] md:rounded-[2.5rem] bg-[#111827]">
        <span className="text-4xl md:text-6xl mb-4">🔍</span>
        <p className="font-black tracking-widest uppercase text-center text-sm md:text-base">No hay datos de motivos disponibles</p>
        <p className="text-[10px] md:text-xs mt-2 text-gray-600">Verifica los filtros seleccionados.</p>
      </div>
    );
  }

  const variablesMotivos = data.filter(d => d.item !== 'FINAL');
  const datoFinal = data.find(d => d.item === 'FINAL');
  const totalFinal = datoFinal ? datoFinal.promedio : 0;

  return (
    <div className="space-y-6 md:space-y-10 pb-10 md:pb-20 animate-in fade-in duration-700">
      
      {/* CARD PRINCIPAL: RANKING DE MOTIVOS */}
      <div className="bg-[#111827] p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-gray-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4">
          <h3 className="text-lg md:text-2xl font-black text-orange-400 uppercase italic flex items-center gap-3">
            <span className="w-6 md:w-8 h-1 bg-orange-400 block"></span> 
            Motivos de No Pago
          </h3>
          <div className="bg-orange-950/20 p-4 rounded-2xl border border-orange-500/20 flex flex-col items-end w-full md:w-auto">
            <div className="text-[9px] md:text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-1">Incidencia Total</div>
            <div className="text-4xl md:text-6xl font-black text-white drop-shadow-lg leading-none">{totalFinal}%</div>
          </div>
        </div>

        <div className="h-[300px] md:h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={variablesMotivos} margin={{ bottom: 60, left: -20, right: 10 }}>
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
              <YAxis stroke="#4B5563" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#1F2937', opacity: 0.4}} />
              <Bar 
                dataKey="promedio" 
                radius={[4, 4, 0, 0]} 
                barSize={window.innerWidth < 768 ? 20 : 35}
              >
                {variablesMotivos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRID DE MINI EVOLUCIONES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {variablesMotivos.map((variable, index) => (
          <div key={variable.item} className="bg-[#111827] p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-800 shadow-xl hover:border-orange-500/50 transition-all group">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-tighter truncate pr-2" title={variable.item}>
                {variable.item}
              </span>
              <span className="text-lg md:text-xl font-black" style={{ color: COLORS[index % COLORS.length] }}>
                {variable.promedio}%
              </span>
            </div>
            <div className="h-[80px] md:h-[100px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolucion}>
                  <defs>
                    <linearGradient id={`grad-mot-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey={variable.item} 
                    stroke={COLORS[index % COLORS.length]} 
                    fill={`url(#grad-mot-${index})`} 
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

      {/* FOOTER: EVOLUCIÓN INCIDENCIA GENERAL */}
      <div className="bg-[#111827] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-orange-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h4 className="text-white font-black text-lg md:text-xl italic uppercase">Evolución Incidencia General</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Tendencia de motivos detectados</p>
          </div>
          <div className="text-3xl md:text-5xl font-black text-white bg-orange-500/10 px-4 py-2 rounded-xl border border-orange-500/20">
            {totalFinal}%
          </div>
        </div>
        <div className="h-[120px] md:h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolucion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="FINAL" 
                stroke="#f97316" 
                fill="#f9731622" 
                strokeWidth={4} 
                dot={{ r: 3, fill: '#f97316', strokeWidth: 2, stroke: '#111827' }} 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Motivos;