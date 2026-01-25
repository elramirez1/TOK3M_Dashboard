import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F2937] border border-gray-700 p-4 rounded-xl shadow-2xl">
        <p className="text-gray-400 text-[10px] font-black uppercase mb-1">{label || payload[0].name}</p>
        <p className="text-white text-2xl font-black">
          {Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const CustomYAxisTick = (props) => {
  const { x, y, payload } = props;
  const name = payload.value || "";
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-10} y={4} textAnchor="end" fill="#9CA3AF" fontSize={9} fontWeight="bold">{name}</text>
    </g>
  );
};

const Resumen = ({ graficos }) => {
  // Aseguramos datos para cada gráfico
  const por_dia = (graficos.por_dia || []).map(d => ({
    ...d,
    cantidad: Number(d.cantidad || d.total_gestiones || 0)
  }));

  const por_ejecutivo = (graficos.por_ejecutivo || []).map(e => ({
    ...e,
    cantidad: Number(e.cantidad || e.total_gestiones || 0)
  }));

  // NORMALIZACIÓN PARA LA TORTA (Busca minúsculas o mayúsculas)
  const por_contacto = (graficos.por_contacto || []).map(c => ({
    cantidad: Number(c.cantidad || c.total_gestiones || 0),
    nombre: c.CODIGO_CONTACTO || c.codigo_contacto || "DESCONOCIDO"
  }));
  
  const por_empresa = [...(graficos.por_empresa || [])]
    .map(em => ({ ...em, cantidad: Number(em.cantidad || em.total_gestiones || 0) }))
    .sort((a, b) => b.cantidad - a.cantidad);
  
  const totalFiltrado = por_dia.reduce((acc, curr) => acc + curr.cantidad, 0);

  return (
    <div className="space-y-8">
      {/* TRABAJO DIARIO */}
      <div className="bg-[#111827] p-10 rounded-[2.5rem] border border-gray-800 shadow-xl relative">
        <div className="flex justify-between items-start mb-8">
          <h3 className="text-2xl font-black text-blue-400 uppercase italic tracking-tighter">Carga de Trabajo Diaria</h3>
          <div className="text-right">
            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Total Selección</p>
            <p className="text-4xl font-mono font-black text-blue-500 tracking-tighter">{totalFiltrado.toLocaleString()}</p>
          </div>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={por_dia}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="FECHA" stroke="#4B5563" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#4B5563" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cantidad" stroke="#3B82F6" strokeWidth={4} fillOpacity={0.1} fill="#3B82F6" />
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
                <YAxis dataKey="NOMBRE_EJECUTIVO" type="category" width={140} axisLine={false} tickLine={false} tick={<CustomYAxisTick />} />
                <XAxis type="number" hide />
                <Tooltip cursor={{fill: '#1F2937'}} content={<CustomTooltip />} />
                <Bar dataKey="cantidad" fill="#10B981" radius={[0, 10, 10, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-8 h-full">
          {/* DISTRIBUCION CONTACTO */}
          <div className="bg-[#111827] p-10 rounded-[2.5rem] border border-gray-800 flex-1 shadow-xl flex flex-col relative">
            <h3 className="text-xl font-black text-blue-400 mb-2 uppercase italic tracking-tighter">Distribución Contacto</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={por_contacto} 
                    dataKey="cantidad" 
                    nameKey="nombre" 
                    cx="50%" 
                    cy="45%" 
                    innerRadius="55%" 
                    outerRadius="95%" 
                    paddingAngle={4}
                  >
                    {por_contacto.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '9px', fontWeight: '900', paddingTop: '10px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GESTIONES POR EMPRESA */}
          <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-gray-800 flex-1 shadow-xl flex flex-col overflow-hidden">
            <h3 className="text-xl font-black text-purple-400 mb-4 uppercase italic tracking-tighter">Gestiones por Empresa</h3>
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              <ResponsiveContainer width="100%" height={Math.max(300, por_empresa.length * 35)}>
                <BarChart data={por_empresa} layout="vertical">
                  <YAxis dataKey="EMPRESA" type="category" stroke="#9CA3AF" fontSize={9} width={100} axisLine={false} tickLine={false} />
                  <XAxis type="number" hide />
                  <Tooltip cursor={{fill: '#1F2937'}} content={<CustomTooltip />} />
                  <Bar dataKey="cantidad" fill="#8B5CF6" radius={[0, 10, 10, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resumen;
