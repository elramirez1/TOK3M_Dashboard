import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#8B5CF6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F2937] border border-gray-700 p-4 rounded-xl shadow-2xl">
        <p className="text-gray-400 text-[10px] font-black uppercase mb-1">{label || payload[0].payload.NOMBRE_EJECUTIVO || payload[0].payload.EMPRESA || payload[0].name}</p>
        <p className="text-white text-2xl font-black">{Number(payload[0].value).toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

const Ppm = ({ data = {} }) => {
  // Aseguramos que existan arrays para evitar errores de .map
  const evolucion = (data.evolucion || []).map(d => ({ FECHA: d.FECHA, PPM: Number(d.PPM || 0) }));
  const por_ejecutivo = (data.por_ejecutivo || []).map(e => ({ NOMBRE_EJECUTIVO: e.NOMBRE_EJECUTIVO, PPM: Number(e.PPM || 0) }));
  const por_empresa = (data.por_empresa || []).map(em => ({ EMPRESA: em.EMPRESA, PPM: Number(em.PPM || 0) }));
  const segmentos = (data.segmentos || []).map(s => ({ name: s.segmento, value: Number(s.cantidad) }));
  const promedioGeneral = Number(data.stats?.ppm_avg || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* EVOLUCION */}
      <div className="bg-[#111827] p-10 rounded-[2.5rem] border border-gray-800 shadow-xl relative">
        <div className="flex justify-between items-start mb-8">
          <h3 className="text-2xl font-black text-pink-500 uppercase italic tracking-tighter">Tendencia PPM</h3>
          <div className="text-right">
            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Promedio Selección</p>
            <p className="text-4xl font-mono font-black text-pink-500 tracking-tighter">{promedioGeneral.toFixed(2)}</p>
          </div>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolucion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="FECHA" stroke="#4B5563" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#4B5563" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="PPM" stroke="#EC4899" strokeWidth={4} fillOpacity={0.1} fill="#EC4899" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[900px]">
        {/* RANKING EJECUTIVOS */}
        <div className="bg-[#111827] p-10 rounded-[2.5rem] border border-gray-800 flex flex-col shadow-xl overflow-hidden">
          <h3 className="text-2xl font-black text-emerald-400 mb-8 uppercase italic tracking-tighter">Ranking Ejecutivos</h3>
          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
            <ResponsiveContainer width="100%" height={Math.max(800, por_ejecutivo.length * 55)}>
              <BarChart data={por_ejecutivo} layout="vertical" margin={{ left: 60, right: 20 }}>
                <YAxis dataKey="NOMBRE_EJECUTIVO" type="category" width={140} axisLine={false} tickLine={false} stroke="#9CA3AF" fontSize={9} fontWeight="bold" />
                <XAxis type="number" hide />
                <Tooltip cursor={{fill: '#1F2937'}} content={<CustomTooltip />} />
                <Bar dataKey="PPM" fill="#10B981" radius={[0, 10, 10, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-8 h-full">
          {/* DISTRIBUCION TORTA */}
          <div className="bg-[#111827] p-10 rounded-[2.5rem] border border-gray-800 flex-1 shadow-xl flex flex-col relative">
            <h3 className="text-xl font-black text-blue-400 mb-2 uppercase italic tracking-tighter">Segmentación Velocidad</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={segmentos} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius="55%" outerRadius="95%" paddingAngle={4}>
                    {segmentos.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '9px', fontWeight: '900', paddingTop: '10px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GESTIONES POR EMPRESA */}
          <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-gray-800 flex-1 shadow-xl flex flex-col overflow-hidden">
            <h3 className="text-xl font-black text-purple-400 mb-4 uppercase italic tracking-tighter">Promedio por Empresa</h3>
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              <ResponsiveContainer width="100%" height={Math.max(300, por_empresa.length * 35)}>
                <BarChart data={por_empresa} layout="vertical">
                  <YAxis dataKey="EMPRESA" type="category" stroke="#9CA3AF" fontSize={9} width={100} axisLine={false} tickLine={false} />
                  <XAxis type="number" hide />
                  <Tooltip cursor={{fill: '#1F2937'}} content={<CustomTooltip />} />
                  <Bar dataKey="PPM" fill="#8B5CF6" radius={[0, 10, 10, 0]} barSize={12} />
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
