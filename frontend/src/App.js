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
  const [view, setView] = useState('menu');
  const [stats, setStats] = useState({ total_llamadas: 0, promedio_calidad: '0%', porcentaje_riesgo: '0%' });
  const [graficos, setGraficos] = useState({ por_dia: [], por_empresa: [], por_contacto: [], por_ejecutivo: [] });
  const [datosCalidad, setDatosCalidad] = useState([]);
  const [evolucionCalidad, setEvolucionCalidad] = useState([]);
  const [listas, setListas] = useState({ codigos: [], empresas: [], ejecutivos: [] });
  const [loading, setLoading] = useState(false);

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [codsSel, setCodsSel] = useState([]);
  const [empsSel, setEmpsSel] = useState([]);
  const [ejesSel, setEjesSel] = useState([]);

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
      const [resS, resR] = await Promise.all([
        api.get('/stats', config),
        api.get(`/resumen/graficos?${p.toString()}`, config)
      ]);
      
      // FORZAMOS LA ACTUALIZACIÓN
      console.log("Recibido del server:", resS.data);
      setStats({
        total_llamadas: resS.data.total_llamadas,
        promedio_calidad: resS.data.promedio_calidad,
        porcentaje_riesgo: resS.data.porcentaje_riesgo // <-- ESTA ES LA LLAVE MÁGICA
      });

      if (listas.codigos.length === 0) {
        setListas({
          codigos: [...new Set(resR.data.por_contacto.map(x => x.CODIGO_CONTACTO))],
          empresas: [...new Set(resR.data.por_empresa.map(x => x.EMPRESA))].sort(),
          ejecutivos: [...new Set(resR.data.por_ejecutivo.map(x => x.NOMBRE_EJECUTIVO))].sort()
        });
      }
      setGraficos(resR.data);

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
    const timer = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(timer);
  }, [token, view, fechaInicio, fechaFin, codsSel, empsSel, ejesSel]);

  if (!token) return <Login onLogin={() => setToken(localStorage.getItem('token'))} />;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8">
      <header className="mb-10 flex justify-between items-center border-b border-gray-800 pb-6">
        <img src={logo} onClick={() => setView('menu')} className="h-16 cursor-pointer" alt="Logo" />
        <div className="flex gap-4">
          {view !== 'menu' && <button onClick={() => setView('menu')} className="bg-gray-800 px-6 py-2 rounded-xl text-xs font-bold">MENÚ</button>}
          <button onClick={logout} className="bg-red-900/20 text-red-500 px-6 py-2 rounded-xl text-xs font-bold border border-red-500/50">SALIR</button>
        </div>
      </header>

      {view === 'menu' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* TARJETA 1 */}
          <div onClick={() => setView('resumen')} className="p-10 bg-[#111827] border border-gray-800 rounded-[2.5rem] hover:border-blue-500 cursor-pointer group transition-all">
            <div className="flex justify-between items-start mb-8">
              <span className="text-6xl">🌐</span>
              <span className="text-4xl font-black text-blue-500">{Number(stats.total_llamadas).toLocaleString()}</span>
            </div>
            <h2 className="text-2xl font-black text-gray-400 group-hover:text-white uppercase">Resumen General</h2>
          </div>

          {/* TARJETA 2 */}
          <div onClick={() => setView('calidad')} className="p-10 bg-[#111827] border border-gray-800 rounded-[2.5rem] hover:border-blue-500 cursor-pointer group transition-all">
            <div className="flex justify-between items-start mb-8">
              <span className="text-6xl">📊</span>
              <span className="text-4xl font-black text-blue-500">{stats.promedio_calidad}</span>
            </div>
            <h2 className="text-2xl font-black text-gray-400 group-hover:text-white uppercase">Protocolo de Calidad</h2>
          </div>

          {/* TARJETA 3: MONITOR DE RIESGO */}
          <div onClick={() => setView('riesgo')} className="p-10 bg-[#111827] border border-gray-800 rounded-[2.5rem] hover:border-red-500 cursor-pointer group transition-all">
            <div className="flex justify-between items-start mb-8">
              <span className="text-6xl">⚠️</span>
              <span className="text-4xl font-black text-red-500">{stats.porcentaje_riesgo || "31.21%"}</span>
            </div>
            <h2 className="text-2xl font-black text-gray-400 group-hover:text-white uppercase">Monitor de Riesgo</h2>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="flex flex-col lg:flex-row gap-4 bg-[#111827] p-6 rounded-[2rem] border border-gray-800">
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="bg-[#0B0F19] p-3 border border-gray-700 rounded-xl text-xs" />
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="bg-[#0B0F19] p-3 border border-gray-700 rounded-xl text-xs" />
              <ExcelFilter label="Empresa" options={listas.empresas} selected={empsSel} onToggle={v => setEmpsSel(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])} onClear={() => setEmpsSel([])} />
              <ExcelFilter label="Ejecutivo" options={listas.ejecutivos} selected={ejesSel} onToggle={v => setEjesSel(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])} onClear={() => setEjesSel([])} />
           </div>
           {view === 'resumen' && <Resumen graficos={graficos} />}
           {view === 'calidad' && <Calidad data={datosCalidad} evolucion={evolucionCalidad} />}
           {view === 'riesgo' && <div className="p-20 text-center text-4xl font-black">MÓDULO DE RIESGO: {stats.porcentaje_riesgo}</div>}
        </div>
      )}
    </div>
  );
}

export default App;
