import React, { useState, useMemo } from 'react';

const Cubo = ({ data }) => {
  const [filaPrincipal, setFilaPrincipal] = useState("ejecutivo");
  const [metricasActivas, setMetricasActivas] = useState(["cal_nota_final", "tiene_riesgo", "nivel_emocion", "tiene_motivo"]);

  const categorias = {
    Calidad: ["cal_saludo", "cal_titular", "cal_familiar", "cal_presentacion", "cal_cordialidad", "cal_recado", "cal_empex", "cal_encargo", "cal_grabado", "cal_informacion", "cal_motivo", "cal_oferta", "cal_canales", "cal_copa", "cal_dudas", "cal_cierre", "cal_nota_final"],
    Riesgo: ["risk_insulto", "risk_reclamo", "risk_incumplimiento", "risk_equivocado", "risk_ya_pago", "tiene_riesgo"],
    Motivos: ["mot_cesante", "mot_sobreendeudado", "mot_enfermedad", "mot_desconoce", "mot_siniestro", "mot_fuera_pais", "mot_olvido", "mot_fallecido", "mot_catastrofe", "mot_no_quiere", "tiene_motivo"],
    Emoción: ["emo_tristeza", "emo_miedo", "emo_enojo", "emo_alivio", "emo_preocupacion", "nivel_emocion"],
    Productividad: ["ppm"]
  };

  // --- LÓGICA DE EXPORTACIÓN (Solo Excel) ---
  const exportarExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const datosExcel = datosAgrupados.map(f => {
        const item = { [filaPrincipal.toUpperCase()]: f.label, "GESTIONES": f.gestiones };
        metricasActivas.forEach(m => { 
          item[m.toUpperCase()] = typeof f[m] === 'number' ? f[m].toFixed(2) : f[m]; 
        });
        return item;
      });
      const ws = XLSX.utils.json_to_sheet(datosExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Cubo");
      XLSX.writeFile(wb, `TOK3M_${filaPrincipal}.xlsx`);
    } catch (error) {
      console.error("Error al exportar Excel:", error);
    }
  };

  // 1. Lógica de agrupación
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

  // 2. Lógica de rangos
  const rangos = useMemo(() => {
    const res = {};
    metricasActivas.forEach(m => {
      const valores = datosAgrupados.map(d => d[m]);
      res[m] = { min: Math.min(...valores), max: Math.max(...valores) };
    });
    return res;
  }, [datosAgrupados, metricasActivas]);

  // 3. Lógica de color Excel
  const getHeatmapColor = (valor, metrica) => {
    const { min, max } = rangos[metrica];
    if (max === min) return {};
    let ratio = (valor - min) / (max - min);
    const esRiesgo = metrica.includes('risk') || metrica.includes('riesgo');
    if (esRiesgo) ratio = 1 - ratio;
    const r = ratio < 0.5 ? 255 : Math.floor(255 * (1 - ratio) * 2);
    const g = ratio > 0.5 ? 255 : Math.floor(255 * ratio * 2);
    return {
      backgroundColor: `rgba(${r}, ${g}, 0, 0.15)`,
      color: `rgb(${Math.min(r + 50, 255)}, ${Math.min(g + 150, 255)}, 100)`,
      borderLeft: `3px solid rgba(${r}, ${g}, 0, 0.5)`
    };
  };

  if (!data || data.length === 0) return <div className="p-20 text-center text-gray-500 uppercase font-black">Cargando datos maestros...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-gray-800 pb-4">
            <div className="flex items-center gap-4 overflow-x-auto">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Ver por:</span>
              {["ejecutivo", "empresa", "fecha_id", "contacto"].map(op => (
                <button key={op} onClick={() => setFilaPrincipal(op)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${filaPrincipal === op ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-[#0B0F19] border-gray-800 text-gray-500'}`}>{op.replace('_id', '')}</button>
              ))}
            </div>
            {/* Solo dejamos el botón de Excel */}
            <button onClick={exportarExcel} className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-600/50 px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg shadow-emerald-900/20">
              📊 Exportar Excel
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {Object.entries(categorias).map(([cat, vars]) => (
              <div key={cat} className="space-y-2">
                <h4 className="text-[9px] font-black text-gray-500 uppercase border-l-2 border-emerald-500 pl-2">{cat}</h4>
                <div className="flex flex-col gap-1">
                  {vars.map(v => (
                    <button key={v} onClick={() => setMetricasActivas(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])} className={`text-left px-2 py-1 rounded text-[9px] font-bold border transition-colors ${metricasActivas.includes(v) ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-transparent border-transparent text-gray-600 hover:bg-gray-800'}`}>
                      {v.split('_').pop()}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
                    <td key={m} className="px-6 py-3 text-[11px] font-bold" style={getHeatmapColor(fila[m], m)}>
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