import React from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F2937] border border-gray-700 p-3 md:p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-gray-400 text-[10px] font-black uppercase mb-1">{label || payload[0].name}</p>
        <p className="text-white text-xl md:text-2xl font-black">
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
  // Truncamos nombres largos en móvil para que no pisen el gráfico
  const displayName = name.length > 12 ? name.substring(0, 10) + '..' : name;
  return (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={-10} 
        y={4} 
        textAnchor="end" 
        fill="#9CA3AF" 
        className="text-[8px] md:text-[9px] font-bold"
      >
        {displayName}
      </text>
    </g>
  );
};

const Resumen = ({ graficos }) => {
  // --- NORMALIZACIÓN DE DATOS ---
  const por_dia = (graficos.por_dia || []).map(d => ({
    ...d,
    cantidad: Number(d.cantidad || d.total_gestiones || 0)
  }));

  const por_ejecutivo = (graficos.por_ejecutivo || []).map(e => ({
    ...e,
    cantidad: Number(e.cantidad || e.total_gestiones || 0)
  })).sort((a, b) => b.cantidad - a.cantidad);

  const por_contacto = (graficos.por_contacto || []).map(c => ({
    cantidad: Number(c.cantidad || c.total_gestiones || 0),
    nombre: (c.CODIGO_CONTACTO || c.codigo_contacto || "N/A").toUpperCase()
  })).sort((a, b) => b.cantidad - a.cantidad);
  
  const por_empresa = [...(graficos.por_empresa || [])]
    .map(em => ({ 
      ...em, 
      cantidad: Number(em.cantidad || em.total_gestiones || 0),
      nombre: em.EMPRESA || em.empresa || "OTRO"
    }))
    .sort((a, b) => b.cantidad - a.cantidad);
  
  const totalFiltrado = por_dia.reduce((acc, curr) => acc + curr.cantidad, 0);

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      
      {/* 1. CARGA DE TRABAJO DIARIA (GRÁFICO DE ÁREA) */}
      <div className="bg-[#111827] p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 md:mb-8 gap-4">
          <div>
            <h3 className="text-lg md:text-2xl font-black text-blue-400 uppercase italic tracking-tighter leading-none">
              Carga de Trabajo Diaria
            </h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Histórico de gestiones</p>
          </div>
          <div className="bg-[#0B0F19] p-3 md:p-4 rounded-2xl border border-gray-800/50 w-full md:w-auto">
            <p className="text-gray-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest">Total en Selección</p>
            <p className="text-2xl md:text-4xl font-mono font-black text-blue-500 tracking-tighter leading-none">
              {totalFiltrado.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="h-[250px] md:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={por_dia} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis 
                dataKey="FECHA" 
                stroke="#4B5563" 
                fontSize={9} 
                axisLine={false} 
                tickLine={false}
                minTickGap={30}
              />
              <YAxis stroke="#4B5563" fontSize={9} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="cantidad" 
                stroke="#3B82F6" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorQty)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. GRID INFERIOR (EJECUTIVOS + EMPRESAS/CONTACTO) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* RANKING EJECUTIVOS (SCROLLABLE) */}
        <div className="bg-[#111827] p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-800 flex flex-col shadow-xl overflow-hidden h-[500px] md:h-[800px]">
          <h3 className="text-lg md:text-2xl font-black text-emerald-400 mb-6 md:mb-8 uppercase italic tracking-tighter">
            Ranking Ejecutivos
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <ResponsiveContainer width="100%" height={Math.max(por_ejecutivo.length * 45, 400)}>
              <BarChart data={por_ejecutivo} layout="vertical" margin={{ left: 5, right: 30, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="NOMBRE_EJECUTIVO" 
                  type="category" 
                  width={100} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={<CustomYAxisTick />} 
                />
                <Tooltip cursor={{fill: '#1F2937'}} content={<CustomTooltip />} />
                <Bar 
                  dataKey="cantidad" 
                  fill="#10B981" 
                  radius={[0, 8, 8, 0]} 
                  barSize={20}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CONTENEDOR DERECHO (PIE + BARS) */}
        <div className="flex flex-col gap-6 md:gap-8">
          
          {/* DISTRIBUCIÓN CONTACTO (PIE CHART) */}
          <div className="bg-[#111827] p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-800 h-[380px] md:flex-1 shadow-xl flex flex-col relative overflow-hidden">
            <h3 className="text-lg md:text-xl font-black text-blue-400 mb-2 uppercase italic tracking-tighter">
              Distribución Contacto
            </h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={por_contacto} 
                    dataKey="cantidad" 
                    nameKey="nombre" 
                    cx="50%" 
                    cy="45%" 
                    innerRadius="45%" 
                    outerRadius="75%" 
                    paddingAngle={5}
                    stroke="none"
                  >
                    {por_contacto.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: '9px', 
                      fontWeight: '800', 
                      textTransform: 'uppercase',
                      paddingTop: '20px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GESTIONES POR EMPRESA (BAR CHART) */}
          <div className="bg-[#111827] p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-800 h-[380px] md:flex-1 shadow-xl flex flex-col overflow-hidden">
            <h3 className="text-lg md:text-xl font-black text-purple-400 mb-4 uppercase italic tracking-tighter">
              Gestiones por Empresa
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <ResponsiveContainer width="100%" height={Math.max(por_empresa.length * 35, 280)}>
                <BarChart data={por_empresa} layout="vertical" margin={{ left: 0, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="nombre" 
                    type="category" 
                    stroke="#9CA3AF" 
                    fontSize={8} 
                    width={80} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip cursor={{fill: '#1F2937'}} content={<CustomTooltip />} />
                  <Bar 
                    dataKey="cantidad" 
                    fill="#8B5CF6" 
                    radius={[0, 6, 6, 0]} 
                    barSize={12} 
                  />
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