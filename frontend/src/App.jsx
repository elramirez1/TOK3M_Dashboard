import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExcelFilter from './components/ExcelFilter';
import Resumen from './pages/Resumen';
import Calidad from './pages/Calidad';
import logo from './assets/logo.jpg';

function App() {
  const [view, setView] = useState('menu');
  const [stats, setStats] = useState({ total_llamadas: 0, promedio_calidad: '0.0%' });
  const [graficos, setGraficos] = useState({ por_dia: [], por_empresa: [], por_contacto: [], por_ejecutivo: [] });
  const [datosCalidad, setDatosCalidad] = useState([]);
  const [listas, setListas] = useState({ codigos: [], empresas: [], ejecutivos: [] });
  
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [codsSel, setCodsSel] = useState([]);
  const [empsSel, setEmpsSel] = useState([]);
  const [ejesSel, setEjesSel] = useState([]);

  const fetchData = async () => {
    try {
      // 1. Cargar contadores del menú
      const resS = await axios.get('http://127.0.0.1:8000/api/stats');
      setStats(resS.data);

      // 2. Parámetros para módulos
      const p = new URLSearchParams();
      if (fechaInicio) p.append('inicio', fechaInicio);
      if (fechaFin) p.append('fin', fechaFin);
      codsSel.forEach(v => p.append('codigos', v));
      empsSel.forEach(v => p.append('empresas', v));
      ejesSel.forEach(v => p.append('ejecutivos', v));

      // 3. Cargar Resumen
      const resR = await axios.get(`http://127.0.0.1:8000/api/resumen/graficos?${p.toString()}`);
      setGraficos(resR.data);
      
      // Inicializar listas de filtros una sola vez
      if (listas.codigos.length === 0) {
        setListas({
          codigos: [...new Set(resR.data.por_contacto.map(x => x.CODIGO_CONTACTO))],
          empresas: [...new Set(resR.data.por_empresa.map(x => x.EMPRESA))].sort(),
          ejecutivos: [...new Set(resR.data.por_ejecutivo.map(x => x.NOMBRE_EJECUTIVO))].sort()
        });
      }

      // 4. Cargar Calidad si la vista está activa
      if (view === 'calidad') {
        const resC = await axios.get(`http://127.0.0.1:8000/api/calidad/cumplimiento?${p.toString()}`);
        setDatosCalidad(resC.data);
      }
    } catch (err) { console.error("Error cargando datos:", err); }
  };

  useEffect(() => { fetchData(); }, [view, fechaInicio, fechaFin, codsSel, empsSel, ejesSel]);

  const toggleFilter = (val, type) => {
    if (type === 'cod') setCodsSel(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
    else if (type === 'emp') setEmpsSel(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
    else setEjesSel(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  const modules = [
    { id: 'resumen', name: 'Resumen General', icon: '🌐', value: stats.total_llamadas.toLocaleString() },
    { id: 'calidad', name: 'Protocolo de Calidad', icon: '📊', value: stats.promedio_calidad },
    { id: 'riesgo', name: 'Monitor de Riesgo', icon: '⚠️', value: '---' },
    { id: 'emocional', name: 'Análisis Emocional', icon: '🧠', value: '---' },
    { id: 'pago', name: 'Motivos de No Pago', icon: '💸', value: '---' },
    { id: 'ppm', name: 'Análisis PPM', icon: '⏱️', value: '---' }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8 font-sans">
      <header className="mb-10 flex justify-between items-center border-b border-gray-800/50 pb-6">
        <img src={logo} onClick={() => setView('menu')} alt="Logo" className="h-20 cursor-pointer rounded-xl" />
        {view !== 'menu' && (
          <button onClick={() => setView('menu')} className="bg-[#111827] px-8 py-4 rounded-2xl text-[12px] font-black border-2 border-gray-700 hover:border-blue-500">
            ← Menú Principal
          </button>
        )}
      </header>

      {view === 'menu' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map(mod => (
            <div key={mod.id} onClick={() => (mod.id === 'resumen' || mod.id === 'calidad') && setView(mod.id)} className="p-10 bg-[#111827] border border-gray-800 rounded-[2.5rem] hover:border-blue-500/50 transition-all cursor-pointer group">
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
          <div className="flex flex-wrap items-end gap-6 bg-[#111827] p-8 rounded-[2.5rem] border-2 border-gray-800 shadow-2xl relative z-[50]">
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="bg-transparent px-4 py-3.5 border border-gray-700 rounded-xl text-white" />
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="bg-transparent px-4 py-3.5 border border-gray-700 rounded-xl text-white" />
            <ExcelFilter label="Empresa" options={listas.empresas} selected={empsSel} onToggle={v => toggleFilter(v, 'emp')} onClear={() => setEmpsSel([])} />
            <ExcelFilter label="Contacto" options={listas.codigos} selected={codsSel} onToggle={v => toggleFilter(v, 'cod')} onClear={() => setCodsSel([])} />
            <ExcelFilter label="Ejecutivo" options={listas.ejecutivos} selected={ejesSel} onToggle={v => toggleFilter(v, 'eje')} onClear={() => setEjesSel([])} />
            <button onClick={() => {setFechaInicio(''); setFechaFin(''); setCodsSel([]); setEmpsSel([]); setEjesSel([]);}} className="ml-auto bg-gray-800 px-10 py-4 rounded-2xl text-[12px] font-black border-2 border-gray-700">RESET</button>
          </div>
          {view === 'resumen' && <Resumen graficos={graficos} />}
          {view === 'calidad' && <Calidad data={datosCalidad} />}
        </div>
      )}
    </div>
  );
}

export default App;
