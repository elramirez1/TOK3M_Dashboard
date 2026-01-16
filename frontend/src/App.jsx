import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

function App() {
  const [view, setView] = useState('menu');
  const [stats, setStats] = useState({ total_llamadas: 0 });
  const [graficos, setGraficos] = useState({ por_dia: [], por_empresa: [], por_contacto: [] });

  useEffect(() => {
    async function fetchData() {
      try {
        const resStats = await axios.get('http://127.0.0.1:8000/api/stats');
        const resGraficos = await axios.get('http://127.0.0.1:8000/api/resumen/graficos');
        setStats(resStats.data);
        setGraficos(resGraficos.data);
      } catch (err) { console.error(err); }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8 font-sans">
      <header className="mb-8 border-b border-gray-800 pb-6 flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => setView('menu')}>
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent italic">TOK3M</h1>
          <p className="text-gray-500 text-xs tracking-[0.3em] uppercase mt-1">Intelligence Dashboard</p>
        </div>
        {view !== 'menu' && (
          <button onClick={() => setView('menu')} className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all border border-blue-600/30">
            ← VOLVER AL MENÚ
          </button>
        )}
      </header>

      {view === 'menu' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: 'resumen', name: 'Resumen General', icon: '🌐', value: stats.total_llamadas.toLocaleString() },
            { id: 'calidad', name: 'Protocolo de Calidad', icon: '📊', value: '---' },
            { id: 'riesgo', name: 'Monitor de Riesgo', icon: '⚠️', value: '---' },
            { id: 'emocional', name: 'Análisis Emocional', icon: '🧠', value: '---' },
            { id: 'pago', name: 'Motivos de No Pago', icon: '💸', value: '---' },
            { id: 'ppm', name: 'Análisis PPM', icon: '⏱️', value: '---' },
          ].map((mod) => (
            <div key={mod.id} onClick={() => mod.id === 'resumen' && setView('resumen')} className="p-6 bg-[#111827] border border-gray-800 rounded-2xl hover:border-blue-500 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">{mod.icon}</div>
                <div className="text-2xl font-mono font-bold text-blue-400">{mod.value}</div>
              </div>
              <h2 className="text-xl font-bold uppercase tracking-tight">{mod.name}</h2>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800">
            <h3 className="text-sm font-bold text-blue-400 mb-6 uppercase tracking-widest">Tendencia Diaria</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graficos.por_dia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="FECHA" stroke="#4B5563" fontSize={10} />
                  <YAxis stroke="#4B5563" fontSize={10} />
                  <Tooltip contentStyle={{backgroundColor: '#111827', border: '1px solid #374151', color: '#fff'}} itemStyle={{color: '#fff'}} />
                  <Area type="monotone" dataKey="cantidad" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800">
              <h3 className="text-xs font-bold text-purple-400 mb-6 uppercase tracking-widest">Distribución por Empresa</h3>
              <div className="h-[450px] overflow-y-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={graficos.por_empresa} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="EMPRESA" type="category" stroke="#9CA3AF" fontSize={10} width={120} />
                    <Tooltip cursor={{fill: '#1F2937'}} contentStyle={{backgroundColor: '#111827', border: '1px solid #374151', color: '#fff'}} itemStyle={{color: '#fff'}} />
                    <Bar dataKey="cantidad" fill="#8B5CF6" radius={[0, 5, 5, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800">
              <h3 className="text-xs font-bold text-emerald-400 mb-6 uppercase tracking-widest">Código de Contacto</h3>
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={graficos.por_contacto}
                      dataKey="cantidad"
                      nameKey="CODIGO_CONTACTO"
                      cx="50%"
                      cy="45%"
                      innerRadius={80}
                      outerRadius={150}
                      paddingAngle={5}
                    >
                      {graficos.por_contacto.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff'}} itemStyle={{color: '#fff'}} />
                    <Legend verticalAlign="bottom" wrapperStyle={{paddingTop: '20px', fontSize: '12px'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
