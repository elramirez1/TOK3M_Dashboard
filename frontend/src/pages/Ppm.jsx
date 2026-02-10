import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#8B5CF6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataRow = payload[0].payload;
    const title = label || dataRow.NOMBRE_EJECUTIVO || dataRow.EMPRESA || dataRow.name || "Métrica";
    return (
      <div className="bg-[#1F2937] border border-gray-700 p-3 md:p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-gray-400 text-[10px] font-black uppercase mb-1 truncate max-w-[150px]">{title}</p>
        <p className="text-white text-xl md:text-2xl font-black">{Number(payload[0].value).toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

const Ppm = ({ data = {} }) => {
  // --- NORMALIZACIÓN DE DATOS ---
  const evolucion = (data.evolucion || []).map(d => ({ FECHA: d.FECHA, PPM: Number(d.PPM || 0) }));
  
  const por_ejecutivo = (data.por_ejecutivo || []).map(e => ({ 
    NOMBRE_EJECUTIVO: e.NOMBRE_EJECUTIVO, 
    PPM: Number(e.PPM || 0) 
  })).sort((a, b) => b.PPM - a.PPM);

  const por_empresa = (data.por_empresa || []).map(em => ({ 
    EMPRESA: em.EMPRESA, 
    PPM: Number(em.PPM || 0) 
  })).sort((a, b) => b.PPM - a.PPM);

  const segmentos = (data.segmentos || []).map(s => ({ 
    name: s.segmento, 
    value: Number(s.cantidad) 
  }));

  const promedioGeneral = Number(data.stats?.ppm_avg || 0);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* 1. TENDENCIA PPM (ÁREA) */}
      <div className="bg-[#111827] p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 md:mb-8 gap-4">
          <div>
            <h3 className="text-lg md:text-2xl font-black text-pink-500 uppercase italic tracking-tighter">Tendencia PPM</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Velocidad de habla promedio</p>
          </div>
          <div className="bg-[#0B0F19] p-4 rounded-2xl border border-gray-800/50 flex flex-col items-end w-full md:w-auto">
            <p className="text-gray-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest">Promedio Selección</p>
            <p className="text-3xl md:text-4xl font-mono font-black text-pink-500 tracking-tighter leading-none">
                {promedioGeneral.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="h-[250px] md:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolucion} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="FECHA" stroke="#4B5563" fontSize={9} axisLine={false} tickLine={false} minTickGap={20} />
              <YAxis stroke="#4B5563" fontSize={9} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="PPM" 
                stroke="#EC4899" 
                strokeWidth={3} 
                fillOpacity={0.1} 
                fill="#EC4899" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. GRID DE DETALLE (EJECUTIVOS Y SEGMENTOS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* RANKING EJECUTIVOS */}
        <div className="bg-[#111827] p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-800 flex flex-col shadow-xl overflow-hidden h-[500px] md:h-[800px]">
          <h3 className="text-lg md:text-2xl font-black text-emerald-400 mb-6 md:mb-8 uppercase italic tracking-tighter">Ranking Ejecutivos</h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <ResponsiveContainer width="100%" height={Math.max(por_ejecutivo.length * 45, 400)}>
              <BarChart data={por_ejecutivo} layout="vertical" margin={{ left: 0, right: 30 }}>
                <YAxis 
                    dataKey="NOMBRE_EJECUTIVO" 
                    type="category" 
                    width={90} 
                    axisLine={false} 
                    tickLine={false} 
                    stroke="#9CA3AF" 
                    fontSize={8} 
                    fontWeight="bold"
                    tickFormatter={(val) => val.length > 12 ? `${val.substring(0, 10)}...` : val}
                />
                <XAxis type="number" hide />
                <Tooltip cursor={{fill: '#1F2937'}} content={<CustomTooltip />} />
                <Bar dataKey="PPM" fill="#10B981" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:gap-8">
          {/* SEGMENTACIÓN VELOCIDAD (PIE) */}
          <div className="bg-[#111827] p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-800 h-[380px] md:flex-1 shadow-xl flex flex-col relative">
            <h3 className="text-lg md:text-xl font-black text-blue-400 mb-2 uppercase italic tracking-tighter">Segmentación Velocidad</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={segmentos} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="45%" 
                    innerRadius="45%" 
                    outerRadius="75%" 
                    paddingAngle={4}
                  >
                    {segmentos.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    wrapperStyle={{fontSize: '9px', fontWeight: '900', paddingTop: '15px'}} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PROMEDIO POR EMPRESA */}
          <div className="bg-[#111827] p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-800 h-[380px] md:flex-1 shadow-xl flex flex-col overflow-hidden">
            <h3 className="text-lg md:text-xl font-black text-purple-400 mb-4 uppercase italic tracking-tighter">Promedio por Empresa</h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <ResponsiveContainer width="100%" height={Math.max(por_empresa.length * 35, 280)}>
                <BarChart data={por_empresa} layout="vertical">
                  <YAxis 
                    dataKey="EMPRESA" 
                    type="category" 
                    stroke="#9CA3AF" 
                    fontSize={8} 
                    width={80} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <XAxis type="number" hide />
                  <Tooltip cursor={{fill: '#1F2937'}} content={<CustomTooltip />} />
                  <Bar dataKey="PPM" fill="#8B5CF6" radius={[0, 6, 6, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ppm;