import React, { useState, useMemo } from 'react';

const Cubo = ({ data }) => {
  const [filaPrincipal, setFilaPrincipal] = useState("ejecutivo");
  const [metricasActivas, setMetricasActivas] = useState(["cal_nota_final", "tiene_riesgo", "ppm"]);

  const categorias = {
    Calidad: ["cal_saludo", "cal_titular", "cal_familiar", "cal_presentacion", "cal_cordialidad", "cal_recado", "cal_empex", "cal_encargo", "cal_grabado", "cal_informacion", "cal_motivo", "cal_oferta", "cal_canales", "cal_copa", "cal_dudas", "cal_cierre", "cal_nota_final"],
    Riesgo: ["risk_insulto", "risk_reclamo", "risk_incumplimiento", "risk_equivocado", "risk_ya_pago", "tiene_riesgo"],
    Motivos: ["mot_cesante", "mot_sobreendeudado", "mot_enfermedad", "mot_desconoce", "mot_siniestro", "mot_fuera_pais", "mot_olvido", "mot_fallecido", "mot_catastrofe", "mot_no_quiere", "tiene_motivo"],
    Emoción: ["emo_tristeza", "emo_miedo", "emo_enojo", "emo_alivio", "emo_preocupacion", "nivel_emocion"],
    Productividad: ["ppm"]
  };

  // 1. Agrupación veloz de datos
  const datosAgrupados = useMemo(() => {
    if (!data || data.length === 0) return [];
    const mapa = new Map();
    data.forEach(curr => {
      const clave = curr[filaPrincipal] || "SIN DATO";
      if (!mapa.has(clave)) {
        const obj = { label: clave, gestiones: 0, cuenta: 0 };
        metricasActivas.forEach(m => obj[m] = 0);
        mapa.set(clave, obj);
      }
      const item = mapa.get(clave);
      item.gestiones += Number(curr.total_gestiones || 0);
      item.cuenta += 1;
      metricasActivas.forEach(m => item[m] += Number(curr[m] || 0));
    });
    return Array.from(mapa.values()).map(f => {
      metricasActivas.forEach(m => f[m] = f.cuenta > 0 ? f[m] / f.cuenta : 0);
      return f;
    });
  }, [data, filaPrincipal, metricasActivas]);

  // 2. Cálculo de límites para el Mapa de Calor (Max y Min por columna)
  const rangos = useMemo(() => {
    const res = {};
    metricasActivas.forEach(m => {
      const valores = datosAgrupados.map(d => d[m]);
      res[m] = { min: Math.min(...valores), max: Math.max(...valores) };
    });
    return res;
  }, [datosAgrupados, metricasActivas]);

  // 3. Función de Color Estilo Excel
  const getHeatmapColor = (valor, metrica) => {
    const { min, max } = rangos[metrica];
    if (max === min) return {};
    
    // Normalizar valor entre 0 y 1
    let ratio = (valor - min) / (max - min);
    
    // Invertir lógica para RIESGO (más es peor)
    const esRiesgo = metrica.includes('risk') || metrica.includes('riesgo');
    if (esRiesgo) ratio = 1 - ratio;

    // Colores: Rojo (0) -> Amarillo (0.5) -> Verde (1)
    const r = ratio < 0.5 ? 255 : Math.floor(255 * (1 - ratio) * 2);
    const g = ratio > 0.5 ? 255 : Math.floor(255 * ratio * 2);
    
    return {
      backgroundColor: `rgba(${r}, ${g}, 0, 0.15)`,
      color: `rgb(${Math.min(r + 50, 255)}, ${Math.min(g + 150, 255)}, 100)`,
      borderLeft: `3px solid rgba(${r}, ${g}, 0, 0.5)`
    };
  };

  const toggleMetrica = (m) => {
    setMetricasActivas(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  if (!data || data.length === 0) return <div className="p-20 text-center text-gray-500 uppercase font-black">Cargando datos maestros...</div>;

  return (
    <div className="space-y-6">
      {/* SELECTORES */}
      <div className="bg-[#111827] border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 overflow-x-auto pb-4">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest whitespace-nowrap">Ver por:</span>
            {["ejecutivo", "empresa", "fecha_id", "contacto"].map(op => (
              <button key={op} onClick={() => setFilaPrincipal(op)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${filaPrincipal === op ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-[#0B0F19] border-gray-800 text-gray-500'}`}>{op.replace('_id', '')}</button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {Object.entries(categorias).map(([cat, vars]) => (
              <div key={cat} className="space-y-2">
                <h4 className="text-[9px] font-black text-gray-500 uppercase border-l-2 border-emerald-500 pl-2">{cat}</h4>
                <div className="flex flex-col gap-1">
                  {vars.map(v => (
                    <button key={v} onClick={() => toggleMetrica(v)} className={`text-left px-2 py-1 rounded text-[9px] font-bold border transition-colors ${metricasActivas.includes(v) ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-transparent border-transparent text-gray-600 hover:bg-gray-800'}`}>
                      {v.split('_').pop()}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABLA DINÁMICA CON MAPA DE CALOR */}
      <div className="bg-[#111827] border border-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="overflow-auto max-h-[650px] relative">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-50">
              <tr className="bg-[#0B0F19]">
                <th className="px-8 py-5 text-[11px] font-black text-white uppercase border-b border-gray-800 sticky left-0 bg-[#0B0F19] z-50 border-r border-gray-800">{filaPrincipal}</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-500 border-b border-gray-800">Σ GESTIONES</th>
                {metricasActivas.map(m => (
                  <th key={m} className="px-6 py-5 text-[10px] font-black text-blue-400 border-b border-gray-800 uppercase whitespace-nowrap">Ø {m.replace(/_/g, ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/20">
              {datosAgrupados.map((fila, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-3 text-[11px] font-bold text-gray-400 uppercase sticky left-0 bg-[#111827] border-r border-gray-800 z-10 group-hover:text-white">
                    {fila.label}
                  </td>
                  <td className="px-6 py-3 text-[11px] font-black text-emerald-500/70 border-r border-gray-800/30">
                    {fila.gestiones.toLocaleString()}
                  </td>
                  {metricasActivas.map(m => (
                    <td 
                      key={m} 
                      className="px-6 py-3 text-[11px] font-bold transition-all"
                      style={getHeatmapColor(fila[m], m)}
                    >
                      {fila[m].toFixed(1)}{m === 'ppm' ? '' : '%'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Cubo;