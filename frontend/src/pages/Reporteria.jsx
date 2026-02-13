// ARGUMENTO DE DIAGNÓSTICO: Interfaz de usuario con selectores independientes para reportes locales.
// Esto separa la lógica de filtros globales de la ejecución en hardware propio.

<div className="bg-slate-50 p-6 rounded-xl border-2 border-orange-500 shadow-inner">
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
      <Cpu size={28} />
    </div>
    <div>
      <h2 className="text-xl font-black text-slate-800">GENERADOR DE INFORMES PESADOS</h2>
      <p className="text-sm text-slate-500 font-medium">Procesamiento directo en hardware local</p>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Fecha del Reporte</label>
      <input 
        type="number" 
        placeholder="YYYYMMDD"
        value={fechaReporte}
        onChange={(e) => setFechaReporte(e.target.value)}
        className="w-full p-3 bg-white border-2 border-slate-200 rounded-lg focus:border-orange-500 outline-none transition-all font-mono text-lg"
      />
    </div>

    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Seleccionar Empresa</label>
      <select 
        value={empresaReporte}
        onChange={(e) => setEmpresaReporte(e.target.value)}
        className="w-full p-3 bg-white border-2 border-slate-200 rounded-lg focus:border-orange-500 outline-none transition-all font-bold text-slate-700"
      >
        <option value="TODAS">🚀 Todas las empresas</option>
        <option value="EMP1">Empresa 1</option>
        <option value="EMP2">Empresa 2</option>
      </select>
    </div>
  </div>

  <button 
    onClick={lanzarProcesoLocal}
    disabled={cargando}
    className={`w-full py-5 rounded-xl font-black text-white text-lg transform active:scale-95 transition-all shadow-lg ${
      cargando 
        ? 'bg-slate-400 cursor-not-allowed' 
        : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600'
    }`}
  >
    {cargando ? (
      <span className="flex items-center justify-center gap-2">
        <span className="animate-spin">⌛</span> PROCESANDO EN MACBOOK...
      </span>
    ) : "🚀 LANZAR PROCESO DE GENERACIÓN"}
  </button>
</div>

// Al final del archivo Reporteria.jsx
export default Reporteria;