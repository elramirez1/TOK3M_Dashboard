import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExcelFilter from './components/ExcelFilter';
import Resumen from './pages/Resumen';
import logo from './assets/logo.jpg';

function App() {
  const [view, setView] = useState('menu');
  const [stats, setStats] = useState({ total_llamadas: 0 });
  const [graficos, setGraficos] = useState({ 
    por_dia: [], 
    por_empresa: [], 
    por_contacto: [], 
    por_ejecutivo: [] 
  });
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [codsSel, setCodsSel] = useState([]);
  const [empsSel, setEmpsSel] = useState([]);
  const [listas, setListas] = useState({ codigos: [], empresas: [] });

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('inicio', fechaInicio);
      if (fechaFin) params.append('fin', fechaFin);
      codsSel.forEach(val => params.append('codigos', val));
      empsSel.forEach(val => params.append('empresas', val));
      
      const res = await axios.get(`http://127.0.0.1:8000/api/resumen/graficos?${params.toString()}`);
      setGraficos(res.data);
      
      if (listas.codigos.length === 0) {
        setListas({
          codigos: [...new Set(res.data.por_contacto.map(x => x.CODIGO_CONTACTO))],
          empresas: [...new Set(res.data.por_empresa.map(x => x.EMPRESA))].sort()
        });
      }
      const resS = await axios.get('http://127.0.0.1:8000/api/stats');
      setStats(resS.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [fechaInicio, fechaFin, codsSel, empsSel]);

  const toggleFilter = (val, type) => {
    if (type === 'cod') setCodsSel(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
    else setEmpsSel(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  const modules = [
    { id: 'resumen', name: 'Resumen General', icon: '🌐', value: stats.total_llamadas.toLocaleString() },
    { id: 'calidad', name: 'Protocolo de Calidad', icon: '📊', value: '---' },
    { id: 'riesgo', name: 'Monitor de Riesgo', icon: '⚠️', value: '---' },
    { id: 'emocional', name: 'Análisis Emocional', icon: '🧠', value: '---' },
    { id: 'pago', name: 'Motivos de No Pago', icon: '💸', value: '---' },
    { id: 'ppm', name: 'Análisis PPM', icon: '⏱️', value: '---' }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8 font-sans">
      <header className="mb-10 flex justify-between items-center border-b border-gray-800/50 pb-6">
        <div onClick={() => setView('menu')} className="cursor-pointer group transition-transform hover:scale-105">
          <img src={logo} alt="TOKEM Logo" className="h-20 w-auto rounded-xl object-contain shadow-2xl shadow-blue-500/10" />
        </div>
        {view !== 'menu' && (
          <button onClick={() => setView('menu')} className="bg-[#111827] px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-800 transition-all hover:border-blue-500 hover:text-blue-400">← Menú</button>
        )}
      </header>

      {view === 'menu' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map(mod => (
            <div key={mod.id} onClick={() => mod.id === 'resumen' && setView('resumen')} className="p-10 bg-[#111827] border border-gray-800 rounded-[2.5rem] hover:border-blue-500/50 transition-all cursor-pointer group shadow-lg">
              <div className="flex justify-between items-start mb-8">
                <div className="text-6xl grayscale group-hover:grayscale-0 transition-all">{mod.icon}</div>
                <div className="text-4xl font-mono font-black text-blue-500 tracking-tighter">{mod.value}</div>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-gray-400 group-hover:text-white">{mod.name}</h2>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center gap-6 bg-[#111827] p-5 rounded-[2rem] border border-gray-800 shadow-2xl relative z-[50]">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black text-gray-500 uppercase">Fecha</span>
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="bg-black border border-gray-800 p-2 rounded-xl text-[10px] w-36 text-white focus:border-blue-500 outline-none" />
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="bg-black border border-gray-800 p-2 rounded-xl text-[10px] w-36 text-white focus:border-blue-500 outline-none" />
            </div>
            <div className="flex items-center gap-4">
              <ExcelFilter label="Empresa" options={listas.empresas} selected={empsSel} onToggle={v => toggleFilter(v, 'emp')} onClear={() => setEmpsSel([])} />
              <ExcelFilter label="Contacto" options={listas.codigos} selected={codsSel} onToggle={v => toggleFilter(v, 'cod')} onClear={() => setCodsSel([])} />
            </div>
            <button onClick={() => {setFechaInicio(''); setFechaFin(''); setCodsSel([]); setEmpsSel([]);}} className="ml-auto bg-gray-800 hover:bg-red-900/30 text-gray-400 hover:text-red-500 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border border-gray-700">↺ Reset</button>
          </div>

          {view === 'resumen' && <Resumen graficos={graficos} />}
        </div>
      )}
    </div>
  );
}

export default App;
