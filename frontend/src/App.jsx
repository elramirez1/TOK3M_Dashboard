import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const ExcelFilter = ({ label, options, selected, onToggle, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between min-w-[160px] bg-[#0B0F19] border ${selected.length > 0 ? 'border-blue-500 text-blue-400' : 'border-gray-700 text-gray-300'} px-4 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all hover:border-gray-500`}
      >
        <span className="truncate uppercase">{selected.length > 0 ? `${label} (${selected.length})` : label}</span>
        <span className={`ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-[100] mt-2 w-72 bg-[#111827] border border-gray-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 animate-in fade-in zoom-in duration-150">
          <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
            <span className="text-[9px] uppercase font-black text-gray-500">Opciones</span>
            <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="text-[9px] text-blue-400 hover:text-white uppercase font-bold">Limpiar</button>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {options.map(opt => (
              <label key={opt} className="flex items-center gap-3 p-2.5 hover:bg-gray-800/50 rounded-xl cursor-pointer transition-colors group">
                <input 
                  type="checkbox" 
                  checked={selected.includes(opt)}
                  onChange={() => onToggle(opt)}
                  className="w-4 h-4 rounded border-gray-700 bg-black text-blue-600 focus:ring-0"
                />
                <span className={`text-[11px] font-medium transition-colors ${selected.includes(opt) ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                  {opt}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  const [view, setView] = useState('menu');
  const [stats, setStats] = useState({ total_llamadas: 0 });
  const [graficos, setGraficos] = useState({ por_dia: [], por_empresa: [], por_contacto: [] });
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [codsSel, setCodsSel] = useState([]);
  const [empsSel, setEmpsSel] = useState([]);
  const [listas, setListas] = useState({ codigos: [], empresas: [] });

  const fetchData = async (c = codsSel, e = empsSel, fIni = fechaInicio, fFin = fechaFin) => {
    try {
      const params = new URLSearchParams();
      if (fIni) params.append('inicio', fIni);
      if (fFin) params.append('fin', fFin);
      c.forEach(val => params.append('codigos', val));
      e.forEach(val => params.append('empresas', val));

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

  useEffect(() => { fetchData(); }, []);

  const toggleFilter = (val, type) => {
    let nuevos;
    if (type === 'cod') {
      nuevos = codsSel.includes(val) ? codsSel.filter(x => x !== val) : [...codsSel, val];
      setCodsSel(nuevos);
      fetchData(nuevos, empsSel, fechaInicio, fechaFin);
    } else {
      nuevos = empsSel.includes(val) ? empsSel.filter(x => x !== val) : [...empsSel, val];
      setEmpsSel(nuevos);
      fetchData(codsSel, nuevos, fechaInicio, fechaFin);
    }
  };

  const resetAll = () => {
    setFechaInicio(''); 
    setFechaFin(''); 
    setCodsSel([]); 
    setEmpsSel([]);
    fetchData([], [], '', '');
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
      <header className="mb-10 flex justify-between items-center border-b border-gray-800/50 pb-8">
        <div onClick={() => setView('menu')} className="cursor-pointer group">
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent italic tracking-tighter uppercase">TOK3M</h1>
          <p className="text-gray-600 text-[9px] tracking-[0.5em] uppercase font-bold mt-1">Intelligence Systems</p>
        </div>
        {view !== 'menu' && (
          <button onClick={() => setView('menu')} className="bg-[#111827] hover:bg-gray-800 px-6 py-2.5 rounded-2xl text-[10px] font-black tracking-widest border border-gray-800 transition-all uppercase">← Menú</button>
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
              <h2 className="text-2xl font-black uppercase tracking-tight text-gray-400 group-hover:text-white transition-colors">{mod.name}</h2>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center gap-6 bg-[#111827] p-5 rounded-[2rem] border border-gray-800 shadow-2xl relative z-[50]">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest border-r border-gray-800 pr-4">Rango Fecha</span>
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="bg-black border border-gray-800 p-2 rounded-xl text-[10px] font-bold outline-none focus:border-blue-500 w-36 text-white" />
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="bg-black border border-gray-800 p-2 rounded-xl text-[10px] font-bold outline-none focus:border-blue-500 w-36 text-white" />
            </div>

            <div className="h-8 w-px bg-gray-800"></div>

            <div className="flex items-center gap-4">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest border-r border-gray-800 pr-4">Filtros</span>
              <ExcelFilter label="Empresa" options={listas.empresas} selected={empsSel} onToggle={val => toggleFilter(val, 'emp')} onClear={() => {setEmpsSel([]); fetchData(codsSel, [], fechaInicio, fechaFin);}} />
              <ExcelFilter label="Contacto" options={listas.codigos} selected={codsSel} onToggle={val => toggleFilter(val, 'cod')} onClear={() => {setCodsSel([]); fetchData([], empsSel, fechaInicio, fechaFin);}} />
            </div>

            <div className="ml-auto flex gap-3">
              <button onClick={() => fetchData()} className="bg-blue-600 hover:bg-blue-500 px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">Aplicar</button>
              <button onClick={resetAll} className="bg-gray-800 hover:bg-red-900/40 text-gray-400 hover:text-red-400 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all">↺ Reset</button>
            </div>
          </div>
          
          <div className="bg-[#111827] p-10 rounded-[2.5rem] border border-gray-800 shadow-xl">
             <h3 className="text-[10px] font-black text-blue-400 mb-8 uppercase tracking-[0.3em]">Carga de Trabajo Diaria</h3>
             <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graficos.por_dia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="FECHA" stroke="#4B5563" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#4B5563" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{backgroundColor: '#0B0F19', border: '1px solid #1F2937', borderRadius: '15px', color: '#fff'}} itemStyle={{color: '#fff'}} />
                  <Area type="monotone" dataKey="cantidad" stroke="#3B82F6" strokeWidth={4} fill="url(#colorView)" fillOpacity={1} />
                  <defs>
                    <linearGradient id="colorView" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#111827] p-10 rounded-[2.5rem] border border-gray-800 h-[550px] flex flex-col shadow-xl">
               <h3 className="text-[10px] font-black text-purple-400 mb-8 uppercase tracking-[0.3em]">Gestiones por Empresa</h3>
               <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                <ResponsiveContainer width="100%" height={Math.max(400, graficos.por_empresa.length * 35)}>
                  <BarChart data={graficos.por_empresa} layout="vertical">
                    <YAxis dataKey="EMPRESA" type="category" stroke="#9CA3AF" fontSize={9} width={120} axisLine={false} tickLine={false} />
                    <XAxis type="number" hide />
                    <Tooltip cursor={{fill: '#1F2937'}} contentStyle={{backgroundColor: '#0B0F19', border: 'none', color: '#fff'}} itemStyle={{color: '#fff'}} />
                    <Bar dataKey="cantidad" fill="#8B5CF6" radius={[0, 10, 10, 0]} barSize={15} />
                  </BarChart>
                </ResponsiveContainer>
               </div>
            </div>
            <div className="bg-[#111827] p-10 rounded-[2.5rem] border border-gray-800 h-[550px] flex flex-col shadow-xl">
              <h3 className="text-[10px] font-black text-emerald-400 mb-8 uppercase tracking-[0.3em]">Distribución de Contacto</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={graficos.por_contacto} dataKey="cantidad" nameKey="CODIGO_CONTACTO" cx="50%" cy="50%" innerRadius={100} outerRadius={160} paddingAngle={8}>
                    {graficos.por_contacto.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor: '#0B0F19', border: '1px solid #1F2937', borderRadius: '15px', color: '#fff'}} itemStyle={{color: '#fff'}} />
                  <Legend verticalAlign="bottom" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: '900'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
