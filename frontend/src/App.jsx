import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import ExcelFilter from './components/ExcelFilter';
import Resumen from './pages/Resumen';
import Calidad from './pages/Calidad';
import Riesgo from './pages/Riesgo';
import Motivos from './pages/Motivos';
import Emocional from './pages/Emocional';
import Ppm from './pages/Ppm';
import TextMining from './pages/TextMining'; 
import Cubo from './pages/Cubo'; 
import Login from './components/Login';
import logo from './assets/logo.jpg';

// Detectamos la URL del servidor dinámicamente
const SERVER_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000/api'
  : 'https://considerate-charm-production-d8f6.up.railway.app/api';
  
const api = axios.create({ baseURL: SERVER_URL });

const Heatmap = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const years = [2026, 2025, 2024];

  const { days, dayLabels } = useMemo(() => {
    const arr = [];
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
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
          <div className="flex ml-12 mb-3 justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
            {months.map(m => <span key={m} className="flex-1 text-center">{m}</span>)}
          </div>

          <div className="flex items-start gap-4">
            <div className="grid grid-rows-7 h-[140px] text-[9px] font-black text-gray-700 uppercase italic py-1">
              {dayLabels.map(label => (
                <span key={label} className="flex items-center">{label}</span>
              ))}
            </div>

            <div className="grid grid-flow-col grid-rows-7 gap-1.5 flex-1 h-[140px]">
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
  const [token, setToken] = useState('fake-jwt-token');
  const [view, setView] = useState('menu');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [palabraKPI, setPalabraKPI] = useState("Cargando..."); 
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
  const [datosTextMining, setDatosTextMining] = useState([]); 
  const [datosCubo, setDatosCubo] = useState([]); 
  const [fechaInicio, setFechaInicio] = useState('');   
  const [fechaFin, setFechaFin] = useState('');
  const [empsSel, setEmpsSel] = useState([]);
  const [ejesSel, setEjesSel] = useState([]);
  const [contSel, setContSel] = useState([]);

  const resetFiltros = () => {
    setFechaInicio('');
    setFechaFin('');
    setEmpsSel([]);
    setEjesSel([]);
    setContSel([]);
  };

  const modulos = [
    { id: 'resumen', icon: '🌐', name: 'Resumen General', color: 'blue' },
    { id: 'calidad', icon: '📊', name: 'Protocolo de Calidad', color: 'emerald' },
    { id: 'riesgo', icon: '⚠️', name: 'Monitor de Riesgo', color: 'red' },
    { id: 'emocional', icon: '🧠', name: 'Análisis Emocional', color: 'purple' },
    { id: 'pago', icon: '💸', name: 'Motivos de No Pago', color: 'orange' },
    { id: 'ppm', icon: '⏱️', name: 'Análisis PPM', color: 'pink' },
    { id: 'textmining', icon: '🔤', name: 'Text Mining', color: 'yellow' },
    { id: 'cubo', icon: '🧊', name: 'Cubo Flexible', color: 'indigo' }
  ];

  const fetchMenuData = async () => {
    if (!token) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    api.get('/heatmap', config)
      .then(res => setHeatmapData(res.data))
      .catch(e => console.error("Error Heatmap:", e));

    api.get('/textmining/data', config)
      .then(res => {
        if (res.data && res.data.length > 0) {
          setPalabraKPI(res.data[0].word || res.data[0].palabra);
        } else {
          setPalabraKPI("N/A");
        }
      })
      .catch(e => {
        console.error("Error Word KPI:", e);
        setPalabraKPI("Error");
      });
  };

  const fetchData = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const params = { inicio: fechaInicio, fin: fechaFin, empresas: empsSel.join(','), ejecutivos: ejesSel.join(','), contactos: contSel.join(',') };

    try {
      const [resS, resR] = await Promise.all([
        api.get('/stats', { params, ...config }), 
        api.get('/resumen/graficos', { params, ...config })
      ]);
      setStats(resS.data); 
      setGraficos(resR.data);
      
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
      } else if (view === 'textmining') {
        const resTM = await api.get('/textmining/data', { params, ...config });
        setDatosTextMining(resTM.data);
      } else if (view === 'cubo') {
        const resCB = await api.get('/cubo/data', { params, ...config }); // <-- Asegúrate que diga /cubo/data
        setDatosCubo(resCB.data);
      }
    } catch (err) { 
      console.error(err); 
    } finally {
      setCargando(false);
    }
  }, [token, view, fechaInicio, fechaFin, empsSel, ejesSel, contSel, listas.empresas.length]);

  useEffect(() => { 
    fetchData(); 
    if(view === 'menu') fetchMenuData(); 
  }, [fetchData, view]);

  if (!token) return <Login onLogin={() => setToken(localStorage.getItem('token'))} />;

  return (
  <div className="min-h-screen bg-[#0B0F19] text-white p-4 md:p-8 overflow-x-hidden">
    {/* HEADER UNIFICADO Y RESPONSIVO */}
    <header className="mb-6 md:mb-10 flex justify-between items-center border-b border-gray-800 pb-6 relative">
      <img 
        src={logo} 
        onClick={() => {setView('menu'); setMenuAbierto(false);}} 
        className="h-12 md:h-16 cursor-pointer object-contain" 
        alt="Logo" 
      />

      {/* BOTÓN HAMBURGUESA (Visible solo en móvil) */}
      <button 
        onClick={() => setMenuAbierto(!menuAbierto)}
        className="md:hidden p-2 text-blue-500 border border-blue-500/30 rounded-xl bg-blue-500/5 active:scale-95 transition-all"
      >
        <span className="text-2xl">{menuAbierto ? '✕' : '☰'}</span>
      </button>

      {/* NAVEGACIÓN: Se adapta según el dispositivo */}
      <nav className={`
        ${menuAbierto ? 'flex' : 'hidden'} 
        absolute top-20 left-0 w-full bg-[#111827]/f95 backdrop-blur-xl z-[100] flex-col p-6 border border-gray-800 rounded-3xl gap-6 shadow-2xl
        md:static md:flex md:flex-row md:w-auto md:bg-transparent md:border-none md:p-0 md:items-center md:gap-4 md:shadow-none
      `}>
        {view !== 'menu' && (
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3 justify-center">
            {modulos.map((m) => (
              <button 
                key={m.id} 
                onClick={() => {setView(m.id); setMenuAbierto(false);}} 
                className={`w-10 h-10 flex items-center justify-center rounded-xl text-lg transition-all ${view === m.id ? `bg-${m.color}-500/20 border border-${m.color}-500/40 opacity-100 shadow-lg shadow-${m.color}-500/10` : 'opacity-30 hover:opacity-100 grayscale hover:grayscale-0'}`}
              >
                {m.icon}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          {view !== 'menu' && (
            <button onClick={() => {setView('menu'); setMenuAbierto(false);}} className="bg-emerald-900/20 text-emerald-500 px-6 py-3 md:py-2 rounded-xl text-[10px] font-black border border-emerald-500/50 uppercase tracking-widest">
              MENÚ
            </button>
          )}
          <button onClick={() => {localStorage.clear(); window.location.reload();}} className="bg-red-900/20 text-red-500 px-6 py-3 md:py-2 rounded-xl text-[10px] font-black border border-red-500/50 uppercase tracking-widest">
            SALIR
          </button>
        </div>
      </nav>
    </header>

    {/* CONTENIDO PRINCIPAL */}
    <main className="max-w-7xl mx-auto">
      {view === 'menu' ? (
        <div className="space-y-8">
          {/* CONTENEDOR DE HEATMAP CON SCROLL HORIZONTAL (Evita que el móvil se caliente al no forzar el re-render del ancho) */}
          <div className="bg-[#111827] border border-gray-800 rounded-[2rem] p-4 md:p-8 shadow-2xl overflow-hidden">
             <div className="overflow-x-auto custom-scrollbar">
                <div className="min-w-[850px]">
                   <Heatmap data={heatmapData} />
                </div>
             </div>
             <p className="text-[10px] text-gray-600 mt-4 md:hidden italic text-center">← Desliza para ver el historial completo →</p>
          </div>

          {/* GRID DE MÓDULOS RESPONSIVO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {modulos.map(m => {
              // ... Tu lógica de skeleton y render de tarjetas igual que antes ...
              // TIP: Asegúrate de usar p-6 en móvil y p-10 en escritorio
              return (
                <div 
                  key={m.id} 
                  onClick={() => setView(m.id)} 
                  className={`p-6 md:p-10 bg-[#111827] border border-gray-800 rounded-[2rem] md:rounded-[2.5rem] hover:border-${m.color}-500 cursor-pointer group transition-all shadow-xl`}
                >
                  <div className="flex justify-between items-start mb-6 md:mb-8">
                    <div className="text-5xl md:text-6xl group-hover:scale-110 transition-transform">{m.icon}</div>
                    <div className={`text-3xl md:text-4xl font-black text-${m.color}-500 break-words`}>
                       {m.id === 'resumen' ? Number(stats.total_llamadas).toLocaleString() : 
                        m.id === 'calidad' ? stats.promedio_calidad :
                        m.id === 'riesgo' ? stats.porcentaje_riesgo :
                        m.id === 'emocional' ? stats.promedio_emocion :
                        m.id === 'pago' ? stats.porcentaje_motivo :
                        m.id === 'ppm' ? Number(stats.promedio_ppm || 0).toFixed(1) :
                        m.id === 'textmining' ? palabraKPI.toUpperCase() : "DATA"}
                    </div>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black uppercase text-gray-400 group-hover:text-white italic tracking-tighter">{m.name}</h2>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VISTAS DE MÓDULOS Y FILTROS */
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row flex-wrap items-center gap-4 bg-[#111827] p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-800 shadow-2xl">
            <div className="flex w-full md:w-auto gap-2">
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="flex-1 bg-[#0B0F19] h-12 px-3 border border-gray-700 rounded-xl text-[10px] font-bold [color-scheme:dark]" />
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="flex-1 bg-[#0B0F19] h-12 px-3 border border-gray-700 rounded-xl text-[10px] font-bold [color-scheme:dark]" />
            </div>
            {/* ... Resto de componentes ExcelFilter (Ellos deben ser responsivos internamente) ... */}
            <button onClick={resetFiltros} className="w-full md:w-auto bg-blue-900/20 text-blue-400 h-12 px-6 rounded-xl text-[10px] font-black border border-blue-500/30">🔄 RESETEAR</button>
          </div>
          
          {/* RENDERIZADO DE PÁGINAS */}
          <div className="w-full overflow-hidden">
             {view === 'resumen' && <Resumen graficos={graficos} />}
             {view === 'calidad' && <Calidad data={datosCalidad} evolucion={datosEvolucion} />}
             {view === 'riesgo' && <Riesgo data={datosRiesgo} evolucion={datosEvolucion} />}
             {view === 'pago' && <Motivos data={datosMotivos} evolucion={datosEvolucion} />}
             {view === 'emocional' && <Emocional data={datosEmocion} evolucion={datosEvolucion} />}
             {view === 'ppm' && <Ppm data={datosPpm} evolucion={datosEvolucionPpm} />}
             {view === 'textmining' && <TextMining data={datosTextMining} isFetching={cargando} />}
             {view === 'cubo' && <Cubo data={datosCubo} />}
          </div>
        </div>
      )}
    </main>
  </div>
);
}

export default App;