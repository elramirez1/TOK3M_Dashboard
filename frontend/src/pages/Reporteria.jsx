// pages/Reporteria.jsx
import React, { useState } from 'react';

const Reporteria = ({ api, fechaInicio, empsSel, contSel }) => {
  const [cargando, setCargando] = useState(false);
  const [htmlContent, setHtmlContent] = useState(null);

  const generarInforme = async () => {
    if (!fechaInicio || empsSel.length === 0) {
      alert("Por favor selecciona al menos una Fecha y una Empresa");
      return;
    }
    
    setCargando(true);
    try {
      // ARGUMENTO DE DIAGNÓSTICO: Petición de stream de datos binarios.
      // Se utiliza blob para manejar el archivo HTML de 15MB sin colapsar el navegador.
      const response = await api.post('/descargar-reporte', {
        fecha: fechaInicio.replace(/-/g, ''), // Formato YYYYMMDD
        empresa: empsSel[0], // Enviamos la primera seleccionada
        contacto: contSel[0] || 'TODOS'
      }, { responseType: 'blob' });

      const url = URL.createObjectURL(new Blob([response.data], { type: 'text/html' }));
      setHtmlContent(url);
    } catch (err) {
      alert("Error: El PC local está offline o el proceso falló.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] p-8 rounded-[2rem] border border-gray-800 shadow-2xl flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Generador de Informes Pesados</h2>
          <p className="text-gray-400 text-sm mt-1">Este proceso se ejecuta directamente en tu hardware local.</p>
        </div>
        <button 
          onClick={generarInforme}
          disabled={cargando}
          className={`px-8 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all ${cargando ? 'bg-gray-800 text-gray-500' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20'}`}
        >
          {cargando ? '⌛ PROCESANDO EN PC...' : '🚀 LANZAR PROCESO'}
        </button>
      </div>

      {htmlContent && (
        <div className="bg-white rounded-[2rem] overflow-hidden border-4 border-gray-800 h-[800px] relative shadow-2xl">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <a href={htmlContent} download="informe_tok3m.html" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs">Descargar HTML</a>
            <button onClick={() => setHtmlContent(null)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xs">Cerrar</button>
          </div>
          <iframe src={htmlContent} className="w-full h-full border-none" title="Reporte Tok3m" />
        </div>
      )}
    </div>
  );
};

export default Reporteria;