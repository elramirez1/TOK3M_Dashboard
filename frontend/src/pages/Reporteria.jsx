// ARGUMENTO DE DIAGNÓSTICO: Módulo de reportes pesados con selectores independientes 
// para evitar conflictos con filtros globales y envío de parámetros al obrero local.

const [fechaReporte, setFechaReporte] = useState("20250102");
const [empresaReporte, setEmpresaReporte] = useState("TODAS");
const [cargando, setCargando] = useState(false);

const lanzarProcesoLocal = async () => {
  setCargando(true);
  try {
    const response = await axios.post(`${API_URL}/descargar-reporte`, {
      fecha: fechaReporte,
      empresa: empresaReporte
    }, { responseType: 'blob' });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    setReporteUrl(url); // Esto cargará el HTML generado en tu PC dentro del iframe
  } catch (error) {
    console.error("Error en el proceso local:", error);
    alert("Error al conectar con el obrero local. Revisa Ngrok y el script Python.");
  } finally {
    setCargando(false);
  }
};

// ... dentro del return JSX ...

<div className="bg-white p-6 rounded-xl shadow-lg border-2 border-orange-500">
  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
    <Cpu size={24} className="text-orange-500" />
    GENERADOR DE INFORMES PESADOS (LOCAL)
  </h2>
  
  <p className="text-sm text-gray-600 mb-6">
    Este proceso se ejecuta en tu hardware. Los filtros generales de la App han sido 
    <b> deshabilitados</b> para esta operación.
  </p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    <div>
      <label className="block text-xs font-bold mb-1">FECHA DEL REPORTE (YYYYMMDD)</label>
      <input 
        type="number" 
        value={fechaReporte}
        onChange={(e) => setFechaReporte(e.target.value)}
        className="w-full p-2 border rounded bg-gray-50 font-mono"
      />
    </div>
    <div>
      <label className="block text-xs font-bold mb-1">EMPRESA / FILTRO</label>
      <select 
        value={empresaReporte}
        onChange={(e) => setEmpresaReporte(e.target.value)}
        className="w-full p-2 border rounded bg-gray-50"
      >
        <option value="TODAS">Todas las Empresas</option>
        <option value="EMP1">Empresa 1</option>
        <option value="EMP2">Empresa 2</option>
      </select>
    </div>
  </div>

  <button 
    onClick={lanzarProcesoLocal}
    disabled={cargando}
    className={`w-full py-4 rounded-lg font-black text-white transition-all ${
      cargando ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700 shadow-md'
    }`}
  >
    {cargando ? "⌛ PROCESANDO EN HARDWARE LOCAL..." : "🚀 LANZAR PROCESO"}
  </button>
</div>