import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#F59E0B', '#FBBF24', '#D97706', '#B45309', '#78350F', '#FACC15', '#EAB308'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F2937] border border-gray-700 p-4 rounded-xl shadow-2xl">
        <p className="text-gray-400 text-[10px] font-black uppercase mb-1">{label}</p>
        <p className="text-white text-2xl font-black">{Number(payload[0].value).toFixed(2)}%</p>
      </div>
    );
  }
  return null;
};

const Motivo = ({ data, evolucion }) => {
  // Validación para cuando no hay datos de motivos detectados
  if (!data || data.length === 0 || (data.length === 1 && data[0].promedio === 0)) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-gray-500 border-2 border-dashed border-amber-900/30 rounded-[2.5rem] bg-[#111827]">
        <span className="text-6xl mb-4">💸</span>
        <p className="font-black tracking-widest uppercase text-center text-amber-500/50">Sin motivos de no pago registrados</p>
        <p className="text-xs mt-2">No se han detectado categorías de incumplimiento en las llamadas filtradas.</p>
      </div>
    );
  }

  // Filtrar el ítem FINAL si existe, para mostrar solo los motivos en las barras
  const variablesMotivo = data.filter(d => d.item !== 'FINAL');
  const datoFinal = data.find(d => d.item === 'FINAL') || { promedio: 0 };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* CARD PRINCIPAL: RANKING DE MOTIVOS */}
      <div className="bg-[#111827] p-10 rounded-[2.5rem] border-2 border-gray-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-6 right-10 text-right z-10">
          <div className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-1">Presencia en Llamadas</div>
          <div className="text-6xl font-black text-white drop-shadow-lg">{Number(datoFinal.promedio).toFixed(1)}%</div>
        </div>
        
        <h3 className="text-2xl font-black text-amber-400 uppercase italic mb-12 flex items-center gap-3">
            <span className="w-8 h-1 bg-amber-500 block"></span> 
            Motivos de No Pago
        </h3>

        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={variablesMotivo} margin={{ bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis 
                dataKey="item" 
                stroke="#9CA3AF" 
                interval={0} 
                angle={-45} 
                textAnchor="end" 
                fontSize={10} 
                fontWeight="900" 
              />
              <YAxis stroke="#4B5563" tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#1F2937', opacity: 0.4}} />
              <Bar dataKey="promedio" radius={[6, 6, 0, 0]} barSize={40}>
                {variablesMotivo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRID DE MINI EVOLUCIONES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {variablesMotivo.map((variable, index) => (
          <div key={variable.item} className="bg-[#111827] p-6 rounded-[2.5rem] border border-gray-800 shadow-xl hover:border-amber-500/40 transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter truncate w-3/4">{variable.item}</span>
              <span className="text-xl font-black text-amber-500">{variable.promedio}%</span>
            </div>
            <div className="h-[100px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolucion}>
                  <defs>
                    <linearGradient id={`grad-mot-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey={variable.item} 
                    stroke="#F59E0B" 
                    fill={`url(#grad-mot-${index})`} 
                    strokeWidth={3} 
                    dot={false} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Motivo;
