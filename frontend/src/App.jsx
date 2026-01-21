import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExcelFilter from './components/ExcelFilter';
import Resumen from './pages/Resumen';
import Calidad from './pages/Calidad';
import Login from './components/Login';
import logo from './assets/logo.jpg';

const api = axios.create({ baseURL: 'http://127.0.0.1:8000/api' });

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  // SIEMPRE inicia en 'menu' al cargar/recargar
  const [view, setView] = useState('menu');
  const [stats, setStats] = useState({ total_llamadas: 0, promedio_calidad: '0.0%' });
  const [graficos, setGraficos] = useState({ por_dia: [], por_empresa: [], por_contacto: [], por_ejecutivo: [] });
  const [datosCalidad, setDatosCalidad] = useState([]);
  const [evolucionCalidad, setEvolucionCalidad] = useState([]);
  const [listas, setListas] = useState({ codigos: [], empresas: [], ejecutivos: [] });
  
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [codsSel, setCodsSel] = useState([]);
  const [empsSel, setEmpsSel] = useState([]);
  const [ejesSel, setEjesSel] = useState([]);
  const [loading, setLoading] = useState(false);

  const logout = () => { localStorage.clear(); setToken(null); };

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const p = new URLSearchParams();
    if (fechaInicio) p.append('inicio', fechaInicio);
    if (fechaFin) p.append('fin', fechaFin);
    empsSel.forEach(v => p.append('empresas', v));
    codsSel.forEach(v => p.append('codigos', v));
    ejesSel.forEach(v => p.append('ejecutivos', v));

    try {
      // Peticiones básicas
      const [resS, resR] = await Promise.all([
        api.get('/stats', config),
        api.get(`/resumen/graficos?${p.toString()}`, config)
      ]);
      
      setStats(resS.data);
      setGraficos(resR.data);

      if (listas.codigos.length === 0) {
        setListas({
          codigos: [...new Set(resR.data.por_contacto.map(x => x.CODIGO_CONTACTO))],
          empresas: [...new Set(resR.data.por_empresa.map(x => x.EMPRESA))].sort(),
          ejecutivos: [...new Set(resR.data.por_ejecutivo.map(x => x.NOMBRE_EJECUTIVO))].sort()
        });
      }

      // Solo carga calidad si es estrictamente necesario
      if (view === 'calidad') {
        const [resC, resE] = await Promise.all([
          api.get(`/calidad/cumplimiento?${p.toString()}`, config),
          api.get(`/calidad/evolucion?${p.toString()}`, config)
        ]);
        setDatosCalidad(resC.data);
        setEvolucionCalidad(resE.data);
      }
    } catch (err) { if (err.response?.status === 401) logout(); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 200);
    return () => clearTimeout(timer);
  }, [token, view, fechaInicio, fechaFin, codsSel, empsSel, ejesSel]);

  if (!token) return <Login onLogin={() => setToken(localStorage.getItem('token'))} />;

  const modules = [
    { id: 'resumen', name: 'Resumen General', icon: '🌐', value: stats.total_llamadas.toLocaleString() },
    { id: 'calidad', name: 'Protocolo de Calidad', icon: '📊', value: stats.promedio_calidad },
    { id: 'riesgo', name: 'Monitor de Riesgo', icon: '⚠️', value: '---' },
    { id: 'emocional', name: 'Análisis Emocional', icon: '🧠', value: '---' },
    { id: 'pago', name: 'Motivos de No Pago', icon: '💸', value: '---' },
    { id: 'ppm', name: 'Análisis PPM', icon: '⏱️', value: '---' }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-4 md:p-8">
      <header className="mb-10 flex justify-between items-center border-b border-gray-800 pb-6">
        <img src={logo} onClick={() => setView('menu')} className="h-16 cursor-pointer" alt="Logo" />
        <div className="flex items-center gap-4">
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>}
          {view !== 'menu' && <button onClick={() => setView('menu')} className="bg-gray-800 px-6 py-2 rounded-xl text-xs font-bold">MENÚ</button>}
          <button onClick={logout} className="bg-red-900/20 text-red-500 px-6 py-2 rounded-xl text-xs font-bold border border-red-500/50">SALIR</button>
        </div>
      </header>

      {view === 'menu' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map(mod => (
            <div key={mod.id} onClick={() => (mod.id === 'resumen' || mod.id === 'calidad') && setView(mod.id)} 
                 className="p-10 bg-[#111827] border border-gray-800 rounded-[2.5rem] hover:border-blue-500 cursor-pointer group transition-all shadow-xl">
              <div className="flex justify-between items-start mb-8">
                <div className="text-6xl grayscale group-hover:grayscale-0">{mod.icon}</div>
                <div className="text-4xl font-black text-blue-500">{mod.value}</div>
              </div>
              <h2 className="text-2xl font-black uppercase text-gray-400 group-hover:text-white">{mod.name}</h2>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col lg:flex-row gap-4 bg-[#111827] p-6 rounded-[2rem] border border-gray-800 shadow-2xl items-end">
            <div className="grid grid-cols-2 gap-4">
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="bg-[#0B0F19] p-3 border border-gray-700 rounded-xl text-xs text-white" />
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="bg-[#0B0F19] p-3 border border-gray-700 rounded-xl text-xs text-white" />
            </div>
            <ExcelFilter label="Empresa" options={listas.empresas} selected={empsSel} onToggle={v => setEmpsSel(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])} onClear={() => setEmpsSel([])} />
            <ExcelFilter label="Contacto" options={listas.codigos} selected={codsSel} onToggle={v => setCodsSel(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])} onClear={() => setCodsSel([])} />
            <ExcelFilter label="Ejecutivo" options={listas.ejecutivos} selected={ejesSel} onToggle={v => setEjesSel(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])} onClear={() => setEjesSel([])} />
            <button onClick={() => {setFechaInicio(''); setFechaFin(''); setCodsSel([]); setEmpsSel([]); setEjesSel([]);}} className="bg-gray-800 px-8 py-3 rounded-xl text-[10px] font-black border border-gray-700">RESET</button>
          </div>
          {view === 'resumen' && <Resumen graficos={graficos} />}
          {view === 'calidad' && <Calidad data={datosCalidad} evolucion={evolucionCalidad} />}
        </div>
      )}
    </div>
  );
}

export default App;
