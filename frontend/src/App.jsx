import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [stats, setStats] = useState({ total_llamadas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Llamada a nuestro Backend de Python
    axios.get('http://127.0.0.1:8000/api/stats')
      .then(response => {
        setStats(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al pedir datos:", error);
        setLoading(false);
      });
  }, []);

  const modules = [
    { id: 1, name: 'Resumen General', icon: '🌐', value: stats.total_llamadas.toLocaleString(), desc: 'Total de gestiones analizadas.' },
    { id: 2, name: 'Protocolo de Calidad', icon: '📊', value: '---', desc: 'Cumplimiento de scripts y KPIs.' },
    { id: 3, name: 'Monitor de Riesgo', icon: '⚠️', value: '---', desc: 'Detección de insultos y alertas.' },
    { id: 4, name: 'Análisis Emocional', icon: '🧠', value: '---', desc: 'Sentimientos y psicología.' },
    { id: 5, name: 'Motivos de No Pago', icon: '💸', value: '---', desc: 'Inteligencia de cobranza.' },
    { id: 6, name: 'Análisis PPM', icon: '⏱️', value: '---', desc: 'Velocidad y fluidez de habla.' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8 font-sans">
      <header className="mb-12 border-b border-gray-800 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent italic">
            TOK3M
          </h1>
          <p className="text-gray-400 mt-2 tracking-widest text-sm">ANALÍTICA DE CONVERSACIONES CON IA</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
          <span className="text-xs font-mono text-gray-500 uppercase">{loading ? 'Sincronizando...' : 'Sistema Online'}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <div 
            key={mod.id}
            className="group p-6 bg-[#111827] border border-gray-800 rounded-2xl hover:border-blue-500 transition-all cursor-pointer hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="text-4xl">{mod.icon}</div>
              <div className="text-2xl font-mono font-bold text-blue-400 group-hover:text-white transition-colors">
                {mod.value}
              </div>
            </div>
            <h2 className="text-xl font-bold group-hover:text-blue-400 transition-colors uppercase tracking-tight">{mod.name}</h2>
            <p className="text-gray-400 mt-2 text-sm leading-relaxed">{mod.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
