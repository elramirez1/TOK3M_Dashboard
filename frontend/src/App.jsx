import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import ExcelFilter from './components/ExcelFilter';
import Resumen from './pages/Resumen';
import Calidad from './pages/Calidad';
import Riesgo from './pages/Riesgo';
import Motivos from './pages/Motivos';
import Emocional from './pages/Emocional';
import Ppm from './pages/Ppm';
import TextMining from './pages/TextMining'; // <--- AGREGADO 1
import Login from './components/Login';
import logo from './assets/logo.jpg';

const api = axios.create({ baseURL: 'http://127.0.0.1:8000/api' });

const Heatmap = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const years = [2026, 2025, 2024];

  // Generar días y calcular el offset del primer día de la semana
  const { days, dayLabels } = useMemo(() => {
    const arr = [];
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    
    // Calcular qué día de la semana es el 1 de enero (0=Dom, 1=Lun... 6=Sab)
    // Para que coincida con tu orden solicitado (Sab, Dom, Lun, Mar, Mie, Jue, Vie)
    const customOrder = [6, 0, 1, 2, 3, 4, 5]; 
    const labels = ['Sab', 'Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie'];

    let current = new Date(startDate);
    while (current <= endDate) {
      arr.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return { days: arr, dayLabels: labels };
  }, [selectedYear]);

  const maxVal = useMemo(() => {
    const values = Object.values(data);
    return values.length > 0 ? Math.max(...values) : 1;
  }, [data]);

  const getIntensity = (date) => {
    const val = data[date] || 0;
    if (val === 0) return 'bg-gray-800/20';
    const percent = val / maxVal;
    if (percent < 0.25) return 'bg-blue-900/40';
    if (percent < 0.50) return 'bg-blue-700/60';
    if (percent < 0.75) return 'bg-blue-500/80';
    return 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]';
  };

  return (
    <div className="bg-[#111827] border border-gray-800 p-8 rounded-[2.5rem] mb-8 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-[14px] font-black uppercase tracking-[0.4em] text-blue-500 italic">
          MAPA DE ACTIVIDAD ANUAL
        </h3>
        <div className="flex gap-2 items-center bg-[#0B0F19] px-4 py-2 rounded-xl border border-gray-800">
          <span className="text-[8px] font-black text-gray-600 uppercase">Menos</span>
          {[0.1, 0.4, 0.7, 1].map((p, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${p === 0.1 ? 'bg-blue-900/40' : p === 0.4 ? 'bg-blue-700/60' : p === 0.7 ? 'bg-blue-500/80' : 'bg-blue-400'}`}></div>
          ))}
          <span className="text-[8px] font-black text-gray-600 uppercase">Más</span>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="flex-1 flex flex-col">
          {/* Meses alineados */}
          <div className="flex ml-12 mb-3 justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
            {months.map(m => <span key={m} className="flex-1 text-center">{m}</span>)}
          </div>

          <div className="flex items-start gap-4">
            {/* Eje Y: Fijo pero sincronizado con la grilla mediante CSS grid-rows-7 */}
            <div className="grid grid-rows-7 h-[140px] text-[9px] font-black text-gray-700 uppercase italic py-1">
              {dayLabels.map(label => (
                <span key={label} className="flex items-center">{label}</span>
              ))}
            </div>

            {/* Grilla: grid-flow-col asegura que se llene por columnas (semanas) */}
            <div className="grid grid-flow-col grid-rows-7 gap-1.5 flex-1 h-[140px]">
              {/* Espacios vacíos para alinear el primer día del año con su día de la semana correcto */}
              {Array.from({ length: (new Date(selectedYear, 0, 1).getDay() + 1) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} className="w-full h-full bg-transparent" />
              ))}
              
              {days.map(date => {
                const count = data[date] || 0;
                const d = new Date(date + 'T12:00:00');
                const infoText = `${d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} \nCasos: ${count}`;
                return (
                  <div 
                    key={date}
                    title={infoText}
                    className={`w-full h-full rounded-sm transition-all hover:scale-[1.8] hover:z-50 hover:brightness-125 cursor-pointer ${getIntensity(date)}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Selector de Años */}
        <div className="flex flex-col gap-2 border-l border-gray-800 pl-6">
          {years.map(y => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`text-[11px] font-black px-4 py-2 rounded-lg transition-all ${selectedYear === y ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [view, setView] = useState('menu');
  const [stats, setStats] = useState({ total_llamadas: 0, promedio_calidad: '0.0%', porcentaje_riesgo: '0.00%', porcentaje_motivo: '0.00%', promedio_emocion: '0.0%', promedio_ppm: 0 });
  const [heatmapData, setHeatmapData] = useState({});
  const [graficos, setGraficos] = useState({ por_dia: [], por_empresa: [], por_contacto: [], por_ejecutivo: [] });
  const [listas, setListas] = useState({ empresas: [], ejecutivos: [], contactos: [] });
  const [datosCalidad, setDatosCalidad] = useState([]);
  const [datosEvolucion, setDatosEvolucion] = useState([]);
  const [datosRiesgo, setDatosRiesgo] = useState([]);
  const [datosMotivos, setDatosMotivos] = useState([]);
  const [datosEmocion, setDatosEmocion] = useState([]);
  const [datosPpm, setDatosPpm] = useState({ stats: {} });
  const [datosEvolucionPpm, setDatosEvolucionPpm] = useState([]);
  const [datosTextMining, setDatosTextMining] = useState([]); // <--- AGREGADO 2
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [empsSel, setEmpsSel] = useState([]);
  const [ejesSel, setEjesSel] = useState([]);
  const [contSel, setContSel] = useState([]);

  const resetFiltros = () => { setFechaInicio(''); setFechaFin(''); setEmpsSel([]); setEjesSel([]); setContSel([]); };

  const modulos = [
    { id: 'resumen', icon: '🌐', name: 'Resumen General', color: 'blue' },
    { id: 'calidad', icon: '📊', name: 'Protocolo de Calidad', color: 'emerald' },
    { id: 'riesgo', icon: '⚠️', name: 'Monitor de Riesgo', color: 'red' },
    { id: 'emocional', icon: '🧠', name: 'Análisis Emocional', color: 'purple' },
    { id: 'pago', icon: '💸', name: 'Motivos de No Pago', color: 'orange' },
    { id: 'ppm', icon: '⏱️', name: 'Análisis PPM', color: 'pink' },
    { id: 'textmining', icon: '🔤', name: 'Text Mining', color: 'yellow' } // <--- AGREGADO 3
  ];

  const fetchHeatmap = async () => {
    if (!token) return;
    try {
      const res = await api.get('/heatmap', { headers: { Authorization: `Bearer ${token}` } });
      setHeatmapData(res.data);
    } catch (e) { console.error("Error Heatmap:", e); }
  };

  const fetchData = useCallback(async () => {
    if (!token) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const params = { inicio: fechaInicio, fin: fechaFin, empresas: empsSel.join(','), ejecutivos: ejesSel.join(','), contactos: contSel.join(',') };

    try {
      const [resS, resR] = await Promise.all([
        api.get('/stats', { params, ...config }), 
        api.get('/resumen/graficos', { params, ...config })
      ]);
      setStats(resS.data); setGraficos(resR.data);
      if (listas.empresas.length === 0) {
        setListas({
          empresas: [...new Set(resR.data.por_empresa?.map(x => x.EMPRESA))].sort(),
          ejecutivos: [...new Set(resR.data.por_ejecutivo?.map(x => x.NOMBRE_EJECUTIVO))].sort(),
          contactos: [...new Set(resR.data.por_contacto?.map(x => x.CODIGO_CONTACTO || x.codigo_contacto))].filter(Boolean).sort()
        });
      }
      if (view === 'calidad') {
        const [resC, resE] = await Promise.all([api.get('/calidad/cumplimiento', { params, ...config }), api.get('/calidad/evolucion', { params, ...config })]);
        setDatosCalidad(resC.data); setDatosEvolucion(resE.data);
      } else if (view === 'riesgo') {
        const [resC, resE] = await Promise.all([api.get('/riesgo/cumplimiento', { params, ...config }), api.get('/riesgo/evolucion', { params, ...config })]);
        setDatosRiesgo(resC.data); setDatosEvolucion(resE.data);
      } else if (view === 'pago') {
        const [resM, resE] = await Promise.all([api.get('/motivos/cumplimiento', { params, ...config }), api.get('/motivos/evolucion', { params, ...config })]);
        setDatosMotivos(resM.data); setDatosEvolucion(resE.data);
      } else if (view === 'emocional') {
        const [resEm, resEv] = await Promise.all([api.get('/emocion/cumplimiento', { params, ...config }), api.get('/emocion/evolucion', { params, ...config })]);
        setDatosEmocion(resEm.data); setDatosEvolucion(resEv.data);
      } else if (view === 'ppm') {
        const resP = await api.get('/ppm/data', { params, ...config });
        setDatosPpm(resP.data); setDatosEvolucionPpm(resP.data.evolucion || []);
      } else if (view === 'textmining') { // <--- AGREGADO 4
        const resTM = await api.get('/textmining/data', { params, ...config });
        setDatosTextMining(resTM.data);
      }
    } catch (err) { console.error(err); }
  }, [token, view, fechaInicio, fechaFin, empsSel, ejesSel, contSel, listas.empresas.length]);

  useEffect(() => { fetchData(); if(view === 'menu') fetchHeatmap(); }, [fetchData, view]);

  if (!token) return <Login onLogin={() => setToken(localStorage.getItem('token'))} />;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8">
      <header className="mb-10 flex justify-between items-center border-b border-gray-800 pb-6">
        <img src={logo} onClick={() => setView('menu')} className="h-16 cursor-pointer" alt="Logo" />
        <div className="flex items-center gap-4">
          {view !== 'menu' && (
            <div className="flex items-center gap-3 mr-2">
              {modulos.map((m) => (
                <div key={m.id} className="group relative flex flex-col items-center">
                  <button onClick={() => setView(m.id)} className={`w-10 h-10 flex items-center justify-center rounded-xl text-lg transition-all cursor-pointer hover:scale-125 ${view === m.id ? `bg-${m.color}-500/20 border border-${m.color}-500/40 opacity-100 shadow-lg shadow-${m.color}-500/10` : 'opacity-30 hover:opacity-100 grayscale hover:grayscale-0'}`}>
                    {m.icon}
                  </button>
                  <div className="absolute top-12 scale-0 group-hover:scale-100 transition-all duration-200 z-50">
                    <div className="bg-gray-800 text-[10px] font-black uppercase text-white px-3 py-1.5 rounded-lg border border-gray-700 shadow-2xl whitespace-nowrap italic tracking-widest">{m.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {view !== 'menu' && <button onClick={() => setView('menu')} className="bg-emerald-900/20 text-emerald-500 px-6 py-2 rounded-xl text-xs font-black border border-emerald-500/50 cursor-pointer hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-widest">MENÚ</button>}
          <button onClick={() => {localStorage.clear(); window.location.reload();}} className="bg-red-900/20 text-red-500 px-6 py-2 rounded-xl text-xs font-black border border-red-500/50 cursor-pointer hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest">SALIR</button>
        </div>
      </header>

      {view === 'menu' ? (
        <div className="max-w-7xl mx-auto">
          <Heatmap data={heatmapData} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modulos.map(m => {
              let val = "";
              if(m.id === 'resumen') val = Number(stats.total_llamadas).toLocaleString();
              if(m.id === 'calidad') val = stats.promedio_calidad;
              if(m.id === 'riesgo') val = stats.porcentaje_riesgo;
              if(m.id === 'emocional') val = stats.promedio_emocion;
              if(m.id === 'pago') val = stats.porcentaje_motivo;
              if(m.id === 'ppm') val = Number(stats.promedio_ppm || 0).toFixed(1);
              if(m.id === 'textmining') val = "NGRAM"; // <--- AGREGADO 5
              return (
                <div key={m.id} onClick={() => setView(m.id)} className={`p-10 bg-[#111827] border border-gray-800 rounded-[2.5rem] hover:border-${m.color}-500 cursor-pointer group transition-all shadow-xl`}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="text-6xl group-hover:scale-110 transition-transform">{m.icon}</div>
                    <div className={`text-4xl font-black text-${m.color}-500`}>{val}</div>
                  </div>
                  <h2 className="text-2xl font-black uppercase text-gray-400 group-hover:text-white italic tracking-tighter">{m.name}</h2>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4 bg-[#111827] p-6 rounded-[2rem] border border-gray-800 shadow-2xl h-fit">
            <div className="flex items-center gap-4">
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="bg-[#0B0F19] h-12 px-4 border border-gray-700 rounded-xl text-xs font-bold [color-scheme:dark]" />
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="bg-[#0B0F19] h-12 px-4 border border-gray-700 rounded-xl text-xs font-bold [color-scheme:dark]" />
            </div>
            <ExcelFilter label="Empresa" options={listas.empresas} selected={empsSel} onToggle={v => setEmpsSel(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])} onClear={() => setEmpsSel([])} />
            <ExcelFilter label="Ejecutivo" options={listas.ejecutivos} selected={ejesSel} onToggle={v => setEjesSel(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])} onClear={() => setEjesSel([])} />
            <ExcelFilter label="Contacto" options={listas.contactos} selected={contSel} onToggle={v => setContSel(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])} onClear={() => setContSel([])} />
            <button onClick={resetFiltros} className="bg-blue-900/20 text-blue-400 h-12 px-6 rounded-2xl text-[10px] font-black border border-blue-500/30">🔄 RESETEAR</button>
          </div>
          {view === 'resumen' && <Resumen graficos={graficos} />}
          {view === 'calidad' && <Calidad data={datosCalidad} evolucion={datosEvolucion} />}
          {view === 'riesgo' && <Riesgo data={datosRiesgo} evolucion={datosEvolucion} />}
          {view === 'pago' && <Motivos data={datosMotivos} evolucion={datosEvolucion} />}
          {view === 'emocional' && <Emocional data={datosEmocion} evolucion={datosEvolucion} />}
          {view === 'ppm' && <Ppm data={datosPpm} evolucion={datosEvolucionPpm} />}
          {view === 'textmining' && <TextMining data={datosTextMining} />} {/* <--- AGREGADO 6 */}
        </div>
      )}
    </div>
  );
}
export default App;