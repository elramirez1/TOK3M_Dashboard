import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const CustomYAxisTick = (props) => {
  const { x, y, payload } = props;
  const name = payload.value || "";
  const words = name.split(' ');
  if (words.length > 2) {
    const line1 = words.slice(0, 2).join(' ');
    const line2 = words.slice(2).join(' ');
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={-10} y={0} textAnchor="end" fill="#9CA3AF" fontSize={8} fontWeight="bold">
          <tspan x="-10" dy="-0.2em">{line1}</tspan>
          <tspan x="-10" dy="1.2em">{line2}</tspan>
        </text>
      </g>
    );
  }
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-10} y={4} textAnchor="end" fill="#9CA3AF" fontSize={9} fontWeight="bold">{name}</text>
    </g>
  );
};

const Resumen = ({ graficos }) => {
  const por_dia = graficos.por_dia || [];
  const por_ejecutivo = graficos.por_ejecutivo || [];
  const por_contacto = graficos.por_contacto || [];
  const por_empresa = graficos.por_empresa || [];
  const totalFiltrado = por_dia.reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0);

  return (
    <div className="space-y-8">
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
              <Tooltip contentStyle={{backgroundColor: '#0B0F19', border: '1px solid #1F2937', borderRadius: '15px', color: '#fff'}} />
              <Area type="monotone" dataKey="cantidad" stroke="#3B82F6" strokeWidth={4} fillOpacity={0.1} fill="#3B82F6" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[900px]">
        <div className="bg-[#111827] p-10 rounded-[2.5rem] border border-gray-800 flex flex-col shadow-xl overflow-hidden">
          <h3 className="text-2xl font-black text-emerald-400 mb-8 uppercase italic tracking-tighter">Ranking Ejecutivos</h3>
          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
            <ResponsiveContainer width="100%" height={Math.max(800, por_ejecutivo.length * 55)}>
              <BarChart data={por_ejecutivo} layout="vertical" margin={{ left: 60, right: 20 }}>
                <YAxis dataKey="NOMBRE_EJECUTIVO" type="category" width={140} axisLine={false} tickLine={false} tick={<CustomYAxisTick />} />
                <XAxis type="number" hide />
                <Tooltip cursor={{fill: '#1F2937'}} contentStyle={{backgroundColor: '#0B0F19', border: 'none', color: '#fff'}} />
                <Bar dataKey="cantidad" fill="#10B981" radius={[0, 10, 10, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-8 h-full">
          <div className="bg-[#111827] p-10 rounded-[2.5rem] border border-gray-800 flex-1 shadow-xl flex flex-col relative">
            <h3 className="text-xl font-black text-blue-400 mb-2 uppercase italic tracking-tighter">Distribución Contacto</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={por_contacto} dataKey="cantidad" nameKey="CODIGO_CONTACTO" cx="50%" cy="45%" innerRadius="55%" outerRadius="95%" paddingAngle={4}>
                    {por_contacto.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '15px'}} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '9px', fontWeight: '900', paddingTop: '10px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-gray-800 flex-1 shadow-xl flex flex-col overflow-hidden">
            <h3 className="text-xl font-black text-purple-400 mb-4 uppercase italic tracking-tighter">Gestiones por Empresa</h3>
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              <ResponsiveContainer width="100%" height={Math.max(300, por_empresa.length * 35)}>
                <BarChart data={por_empresa} layout="vertical">
                  <YAxis dataKey="EMPRESA" type="category" stroke="#9CA3AF" fontSize={9} width={100} axisLine={false} tickLine={false} />
                  <XAxis type="number" hide />
                  <Tooltip cursor={{fill: '#1F2937'}} contentStyle={{backgroundColor: '#0B0F19', border: 'none', color: '#fff'}} />
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
