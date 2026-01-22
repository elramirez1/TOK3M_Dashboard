import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, AreaChart, Area } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84cc16', '#6366f1', '#f43f5e', '#a855f7', '#14b8a6', '#f59e0b', '#d946ef', '#0ea5e9', '#f97316'];

const Calidad = ({ data, evolucion }) => {
  if (!data || data.length === 0) return <div className="text-center p-20 text-gray-500 font-black tracking-widest">CARGANDO PROTOCOLO...</div>;

  const variablesProtocolo = data.filter(d => d.item !== 'FINAL');
  const datoFinal = data.find(d => d.item === 'FINAL');
  const totalFinal = datoFinal ? datoFinal.promedio : 0;

  return (
    <div className="space-y-10 pb-20">
      <div className="bg-[#111827] p-10 rounded-[2.5rem] border-2 border-gray-800 shadow-2xl relative">
        <div className="absolute top-6 right-10 text-right">
          <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Resultado Final Global</div>
          <div className="text-6xl font-black text-white drop-shadow-lg">{totalFinal}%</div>
        </div>

        <h3 className="text-2xl font-black text-emerald-400 uppercase italic mb-12">Cumplimiento de Protocolo</h3>
        
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={variablesProtocolo} margin={{ bottom: 60, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="item" stroke="#9CA3AF" interval={0} angle={-45} textAnchor="end" fontSize={10} fontWeight="900" />
              <YAxis stroke="#4B5563" domain={[0, 100]} />
              <Tooltip contentStyle={{backgroundColor: '#0B0F19', border: '1px solid #333', borderRadius: '12px'}} />
              
              <ReferenceLine y={90} stroke="#10B981" strokeDasharray="3 3" label={{ position: 'left', value: '90%', fill: '#10B981', fontSize: 11, fontWeight: 'bold' }} />
              <ReferenceLine y={75} stroke="#F59E0B" strokeDasharray="5 5" label={{ position: 'left', value: '75%', fill: '#F59E0B', fontSize: 11, fontWeight: 'bold' }} />
              <ReferenceLine y={50} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'left', value: '50%', fill: '#EF4444', fontSize: 11, fontWeight: 'bold' }} />

              <Bar dataKey="promedio" radius={[6, 6, 0, 0]} barSize={30}>
                {variablesProtocolo.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {variablesProtocolo.map((variable, index) => (
          <div key={variable.item} className="bg-[#111827] p-6 rounded-[2.5rem] border border-gray-800 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{variable.item}</span>
              <span className="text-xl font-black" style={{ color: COLORS[index % COLORS.length] }}>{variable.promedio}%</span>
            </div>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolucion}>
                  <defs>
                    <linearGradient id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey={variable.item} stroke={COLORS[index % COLORS.length]} fill={`url(#grad-${index})`} strokeWidth={3} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
        
        <div className="md:col-span-2 bg-[#111827] p-8 rounded-[2.5rem] border-2 border-emerald-500/30 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-white font-black text-xl italic uppercase">Evolución Promedio Final</h4>
              <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Tendencia Global del Protocolo</p>
            </div>
            <div className="text-5xl font-black text-white">{totalFinal}%</div>
          </div>
          <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolucion}>
                <defs>
                  <linearGradient id="gradFinal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <Area type="monotone" dataKey="FINAL" stroke="#34d399" fill="url(#gradFinal)" strokeWidth={5} dot={true} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calidad;
