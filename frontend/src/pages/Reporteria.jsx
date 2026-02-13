import React, { useState } from 'react';
import axios from 'axios';
import { Cpu, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

const Reporteria = () => {
    // ARGUMENTO DE DIAGNÓSTICO: Estados locales independientes para el proceso pesado
    // Esto evita que los filtros globales del dashboard interfieran con el obrero local.
    const [fechaReporte, setFechaReporte] = useState("20250102");
    const [empresaReporte, setEmpresaReporte] = useState("TODAS");
    const [cargando, setCargando] = useState(false);
    const [reporteUrl, setReporteUrl] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    const lanzarProcesoLocal = async () => {
        setCargando(true);
        setReporteUrl(null);
        try {
            // DIAGNÓSTICO: Envío de parámetros específicos al backend de Railway
            const response = await axios.post(`${API_URL}/descargar-reporte`, {
                fecha: fechaReporte,
                empresa: empresaReporte
            }, { 
                responseType: 'blob' // Importante para recibir el HTML como archivo
            });

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/html' }));
            setReporteUrl(url);
        } catch (error) {
            console.error("Error en el proceso local:", error);
            alert("No se pudo conectar con el servidor local. Verifica que Ngrok y el script Python estén corriendo.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            {/* Título de la Sección */}
            <div className="border-b pb-4">
                <h1 className="text-3xl font-black text-slate-800">MÓDULO DE REPORTERÍA</h1>
                <p className="text-slate-500">Gestión de informes de calidad y analítica avanzada.</p>
            </div>

            {/* MÓDULO GENERADOR (EL OBRERO) */}
            <div className="bg-white p-6 rounded-2xl border-2 border-orange-500 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                        <Cpu size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                            Generador de Informes Pesados (Hardware Local)
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            Los filtros seleccionados aquí son independientes del dashboard general.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 uppercase ml-1">Fecha del Reporte (YYYYMMDD)</label>
                        <input 
                            type="text" 
                            value={fechaReporte}
                            onChange={(e) => setFechaReporte(e.target.value)}
                            className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 outline-none transition-all font-mono text-lg shadow-sm"
                            placeholder="Ej: 20250102"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 uppercase ml-1">Filtro de Empresa</label>
                        <select 
                            value={empresaReporte}
                            onChange={(e) => setEmpresaReporte(e.target.value)}
                            className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 outline-none transition-all font-bold text-slate-700 shadow-sm appearance-none"
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
                    className={`w-full py-5 rounded-2xl font-black text-white text-xl transform active:scale-[0.98] transition-all shadow-lg ${
                        cargando 
                            ? 'bg-slate-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 hover:shadow-orange-200'
                    }`}
                >
                    {cargando ? (
                        <span className="flex items-center justify-center gap-3">
                            <span className="animate-spin text-2xl">⏳</span> PROCESANDO EN HARDWARE LOCAL...
                        </span>
                    ) : "🚀 LANZAR PROCESO DE GENERACIÓN"}
                </button>
            </div>

            {/* VISUALIZADOR DE REPORTE (IFRAME) */}
            {reporteUrl && (
                <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
                        <span className="font-bold flex items-center gap-2 text-sm">
                            <FileText size={18} className="text-orange-400" />
                            VISTA PREVIA DEL INFORME GENERADO
                        </span>
                        <a 
                            href={reporteUrl} 
                            download={`Informe_${fechaReporte}.html`}
                            className="bg-orange-500 hover:bg-orange-600 px-4 py-1 rounded-lg text-xs font-black transition-colors"
                        >
                            DESCARGAR HTML
                        </a>
                    </div>
                    <iframe 
                        src={reporteUrl} 
                        className="w-full h-[800px] border-none"
                        title="Reporte Generado"
                    />
                </div>
            )}
        </div>
    );
};

export default Reporteria;