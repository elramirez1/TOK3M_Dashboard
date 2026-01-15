import React from 'react';

const modules = [
  { id: 1, name: 'Protocolo de Calidad', icon: '📊', desc: 'Cumplimiento de scripts y KPIs.' },
  { id: 2, name: 'Monitor de Riesgo', icon: '⚠️', desc: 'Detección de insultos y alertas.' },
  { id: 3, name: 'Análisis Emocional', icon: '🧠', desc: 'Sentimientos y psicología.' },
  { id: 4, name: 'Motivos de No Pago', icon: '💸', desc: 'Inteligencia de cobranza.' },
  { id: 5, name: 'Análisis PPM', icon: '⏱️', desc: 'Velocidad y fluidez de habla.' },
  { id: 6, name: 'Resumen General', icon: '🌐', desc: 'Vista global operativa.' },
];

function App() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8 font-sans">
      {/* Header */}
      <header className="mb-12 border-b border-gray-800 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            TOK3M DASHBOARD
          </h1>
          <p className="text-gray-400 mt-2">Analítica avanzada de conversaciones con IA</p>
        </div>
        <div className="bg-blue-600 p-2 rounded-lg font-bold">TOK3M</div>
      </header>

      {/* Grid de Módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <div 
            key={mod.id}
            className="group p-6 bg-[#111827] border border-gray-800 rounded-2xl hover:border-blue-500 transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
          >
            <div className="text-4xl mb-4">{mod.icon}</div>
            <h2 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{mod.name}</h2>
            <p className="text-gray-400 mt-2 text-sm">{mod.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
