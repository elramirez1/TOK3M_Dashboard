import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExcelFilter from './components/ExcelFilter';
import Resumen from './pages/Resumen';
import Calidad from './pages/Calidad';
import Riesgo from './pages/Riesgo';
import Motivos from './pages/Motivos';
import Emocional from './pages/Emocional';
import Login from './components/Login';
import logo from './assets/logo.jpg';

const api = axios.create({ baseURL: 'http://127.0.0.1:8000/api' });

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [view, setView] = useState('menu');
  const [stats, setStats] = useState({ 
    total_llamadas: 0, 
    promedio_calidad: '0.0%', 
    porcentaje_riesgo: '0.00%', 
    porcentaje_motivo: '0.00%',
    promedio_emocion: '0.0'
  });
  
  const [graficos, setGraficos] = useState({ por_dia: [], por_empresa: [], por_contacto: [], por_ejecutivo: [] });
  const [listas, setListas] = useState({ empresas: [], ejecutivos: [], contactos: [] });
  
  const [datosCalidad, setDatosCalidad] = useState([]);
  const [datosEvolucion, setDatosEvolucion] = useState([]);
  const [datosRiesgo, setDatosRiesgo] = useState([]);
  const [datosMotivos, setDatosMotivos] = useState([]);
  const [datosEmocion, setDatosEmocion] = useState([]);
  
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [empsSel, setEmpsSel] = useState([]);
  const [ejesSel, setEjesSel] = useState([]);
  const [contSel, setContSel] = useState([]);

  const fetchData = async () => {
    if (!token) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const params = { 
      inicio: fechaInicio, 
      fin: fechaFin, 
      empresas: empsSel.join(','), 
      ejecutivos: ejesSel.join(','),
      contactos: contSel.join(',') 
    };

    try {
      const [resS, resR] = await Promise.all([
        api.get('/stats', { params, ...config }),
        api.get('/resumen/graficos', { params, ...config })
      ]);
      
      setStats(resS.data);

      const worker = new Worker(new URL("./workers/dataWorker.js", import.meta.url));
      worker.postMessage({ type: 'PROCESS_CHARTS', data: resR.data.por_ejecutivo });
      worker.onmessage = (e) => {
        setGraficos({ ...resR.data, por_ejecutivo: e.data.payload });
        if (listas.empresas.length === 0) {
          setListas({
            empresas: [...new Set(resR.data.por_empresa.map(x => x.EMPRESA))].sort(),
            ejecutivos: [...new Set(resR.data.por_ejecutivo.map(x => x.NOMBRE_EJECUTIVO))].sort(),
            contactos: [...new Set(resR.data.por_contacto.map(x => x.CODIGO_CONTACTO || x.codigo_contacto))].filter(Boolean).sort()
          });
        }
      };

      if (view === 'calidad') {
        const [resC, resE] = await Promise.all([
          api.get('/calidad/cumplimiento', { params, ...config }),
          api.get('/calidad/evolucion', { params, ...config })
        ]);
        setDatosCalidad(resC.data);
        setDatosEvolucion(resE.data);
      }
      
      if (view === 'riesgo') {
        const [resC, resE] = await Promise.all([
          api.get('/riesgo/cumplimiento', { params, ...config }),
          api.get('/riesgo/evolucion', { params, ...config })
        ]);
        setDatosRiesgo(resC.data);
        setDatosEvolucion(resE.data);
      }

      if (view === 'pago') {
        const [resM, resE] = await Promise.all([
          api.get('/motivos/cumplimiento', { params, ...config }),
          api.get('/motivos/evolucion', { params, ...config })
        ]);
        setDatosMotivos(resM.data);
        setDatosEvolucion(resE.data);
      }

      if (view === 'emocional') {
        const [resEm, resEv] = await Promise.all([
          api.get('/emocion/cumplimiento', { params, ...config }),
          api.get('/emocion/evolucion', { params, ...config })
        ]);
        setDatosEmocion(resEm.data);
        setDatosEvolucion(resEv.data);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [token, view, fechaInicio, fechaFin, empsSel, ejesSel, contSel]);

  const resetFiltros = () => {
    setFechaInicio(''); setFechaFin('');
    setEmpsSel([]); setEjesSel([]); setContSel([]);
  };

  if (!token) return <Login onLogin={() => setToken(localStorage.getItem('token'))} />;

  const tarjetas = [
    { id: 'resumen', name: 'Resumen General', icon: '🌐', value: Number(stats.total_llamadas).toLocaleString(), color: 'text-blue-500' },
    { id: 'calidad', name: 'Protocolo de Calidad', icon: '📊', value: stats.promedio_calidad, color: 'text-emerald-500' },
    { id: 'riesgo', name: 'Monitor de Riesgo', icon: '⚠️', value: stats.porcentaje_riesgo, color: 'text-red-500' },
    { id: 'emocional', name: 'Análisis Emocional', icon: '🧠', value: stats.promedio_emocion, color: 'text-purple-500' },
    { id: 'pago', name: 'Motivos de No Pago', icon: '💸', value: stats.porcentaje_motivo, color: 'text-orange-500' },
    { id: 'ppm', name: 'Análisis PPM', icon: '⏱️', value: '---', color: 'text-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8">
      <header className="mb-10 flex justify-between items-center border-b border-gray-800 pb-6">
        <img src={logo} onClick={() => setView('menu')} className="h-16 cursor-pointer" alt="Logo" />
        <button onClick={() => {localStorage.clear(); window.location.reload();}} className="bg-red-900/20 text-red-500 px-6 py-2 rounded-xl text-xs font-black border border-red-500/50">SALIR</button>
      </header>

      {view === 'menu' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tarjetas.map(t => (
            <div key={t.id} onClick={() => setView(t.id)} className="p-10 bg-[#111827] border border-gray-800 rounded-[2.5rem] hover:border-blue-500 cursor-pointer group transition-all shadow-xl">
              <div className="flex justify-between items-start mb-8">
                <div className="text-6xl group-hover:scale-110 transition-transform">{t.icon}</div>
                <div className={`text-4xl font-black ${t.color}`}>{t.value}</div>
              </div>
              <h2 className="text-2xl font-black uppercase text-gray-400 group-hover:text-white italic tracking-tighter">{t.name}</h2>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4 bg-[#111827] p-6 rounded-[2rem] border border-gray-800 shadow-2xl items-end">
            <div className="grid grid-cols-2 gap-4">
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="bg-[#0B0F19] p-3 border border-gray-700 rounded-xl text-xs font-bold text-white" />
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="bg-[#0B0F19] p-3 border border-gray-700 rounded-xl text-xs font-bold text-white" />
            </div>
            <ExcelFilter label="Empresa" options={listas.empresas} selected={empsSel} onToggle={v => setEmpsSel(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])} onClear={() => setEmpsSel([])} />
            <ExcelFilter label="Ejecutivo" options={listas.ejecutivos} selected={ejesSel} onToggle={v => setEjesSel(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])} onClear={() => setEjesSel([])} />
            <ExcelFilter label="Contacto" options={listas.contactos} selected={contSel} onToggle={v => setContSel(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])} onClear={() => setContSel([])} />
            
            <button onClick={resetFiltros} className="bg-blue-900/20 text-blue-400 px-6 py-4 rounded-2xl text-[10px] font-black border border-blue-500/30 hover:bg-blue-500/40 transition-all uppercase tracking-widest">🔄 Resetear Filtros</button>
            <button onClick={() => setView('menu')} className="bg-gray-800 px-8 py-3 rounded-xl text-[10px] font-black border border-gray-700 hover:bg-gray-700 ml-auto">VOLVER AL MENÚ</button>
          </div>
          {view === 'resumen' && <Resumen graficos={graficos} />}
          {view === 'calidad' && <Calidad data={datosCalidad} evolucion={datosEvolucion} />}
          {view === 'riesgo' && <Riesgo data={datosRiesgo} evolucion={datosEvolucion} />}
          {view === 'pago' && <Motivos data={datosMotivos} evolucion={datosEvolucion} />}
          {view === 'emocional' && <Emocional data={datosEmocion} evolucion={datosEvolucion} />}
        </div>
      )}
    </div>
  );
}

export default App;
