import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExcelFilter from './components/ExcelFilter';
import Resumen from './pages/Resumen';
import logo from './assets/logo.jpg';

function App() {
  const [view, setView] = useState('menu');
  const [stats, setStats] = useState({ total_llamadas: 0 });
  const [graficos, setGraficos] = useState({ por_dia: [], por_empresa: [], por_contacto: [], por_ejecutivo: [] });
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
    <div className="min-h-screen bg-[#0B0F19] text-white p-10 font-sans">
      <header className="mb-12 flex justify-between items-center border-b border-gray-800/50 pb-8">
        <div onClick={() => setView('menu')} className="cursor-pointer group transition-transform hover:scale-105">
          <img src={logo} alt="TOKEM Logo" className="h-24 w-auto rounded-2xl object-contain" />
        </div>
        {view !== 'menu' && (
          <button onClick={() => setView('menu')} className="bg-[#111827] px-8 py-4 rounded-[1.5rem] text-[12px] font-black uppercase tracking-[0.2em] border-2 border-gray-800 transition-all hover:border-blue-500 hover:text-blue-400 shadow-xl">← Regresar al Menú</button>
        )}
      </header>

      {view === 'menu' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-[1600px] mx-auto">
          {modules.map(mod => (
            <div key={mod.id} onClick={() => mod.id === 'resumen' && setView('resumen')} className="p-12 bg-[#111827] border-2 border-gray-800 rounded-[3rem] hover:border-blue-500 transition-all cursor-pointer group shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl group-hover:scale-110 group-hover:opacity-20 transition-all">{mod.icon}</div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div className="text-7xl grayscale group-hover:grayscale-0 transition-all">{mod.icon}</div>
                  <div className="text-5xl font-mono font-black text-blue-500 tracking-tighter">{mod.value}</div>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-gray-400 group-hover:text-white leading-tight">{mod.name}</h2>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-12 max-w-[1800px] mx-auto">
          {/* BARRA DE FILTROS POTENCIADA */}
          <div className="flex flex-wrap items-center gap-8 bg-[#111827] p-8 rounded-[2.5rem] border-2 border-gray-800 shadow-2xl relative z-[50]">
            
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Rango de Fecha</span>
                <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-gray-800">
                  <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="bg-transparent p-3 rounded-xl text-[13px] font-bold w-44 text-white focus:outline-none appearance-none cursor-pointer" />
                  <span className="text-gray-600 font-bold">→</span>
                  <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="bg-transparent p-3 rounded-xl text-[13px] font-bold w-44 text-white focus:outline-none appearance-none cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="h-12 w-[2px] bg-gray-800 hidden lg:block"></div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Filtros Avanzados</span>
              <div className="flex items-center gap-6">
                <ExcelFilter label="Empresa" options={listas.empresas} selected={empsSel} onToggle={v => toggleFilter(v, 'emp')} onClear={() => setEmpsSel([])} />
                <ExcelFilter label="Tipo de Contacto" options={listas.codigos} selected={codsSel} onToggle={v => toggleFilter(v, 'cod')} onClear={() => setCodsSel([])} />
              </div>
            </div>

            <button 
              onClick={() => {setFechaInicio(''); setFechaFin(''); setCodsSel([]); setEmpsSel([]);}} 
              className="ml-auto bg-gray-800 hover:bg-red-900/40 text-gray-400 hover:text-red-500 px-10 py-5 rounded-2xl text-[12px] font-black uppercase transition-all border-2 border-gray-700 shadow-lg active:scale-95"
            >
              Reiniciar Filtros
            </button>
          </div>

          {view === 'resumen' && <Resumen graficos={graficos} />}
        </div>
      )}
    </div>
  );
}

export default App;
