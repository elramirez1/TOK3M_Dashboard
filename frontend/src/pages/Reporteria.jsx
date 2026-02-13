import React, { useState } from 'react';
import axios from 'axios';
import { Cpu, FileText, Monitor, Download, RefreshCw } from 'lucide-react';

const Reporteria = () => {
    // ARGUMENTO DE DIAGNÓSTICO: Estados para controlar la generación y visualización 
    // del informe HTML generado localmente.
    const [fechaReporte, setFechaReporte] = useState("20250102");
    const [empresaReporte, setEmpresaReporte] = useState("TODAS");
    const [cargando, setCargando] = useState(false);
    const [reporteUrl, setReporteUrl] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    const visualizarInformeExistente = async () => {
        setCargando(true);
        setReporteUrl(null);
        try {
            // DIAGNÓSTICO: Petición al servidor para obtener el blob del HTML 
            // que ya reside en la carpeta del obrero local.
            const response = await axios.post(`${API_URL}/descargar-reporte`, {
                fecha: fechaReporte,
                empresa: empresaReporte
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/html' }));
            setReporteUrl(url);
        } catch (error) {
            console.error("Error al cargar el informe:", error);
            alert("⚠️ No se pudo conectar con el hardware local. Revisa Ngrok.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
            {/* Cabecera */}
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">SISTEMA DE REPORTERÍA</h1>
                    <p className="text-slate-500 font-medium">Visualización de informes generados en hardware MacBook Air.</p>
                </div>
                <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-xs font-bold">
                    <Monitor size={16} /> LOCAL WORKER ACTIVE
                </div>
            </div>

            {/* Panel de Control */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Cpu size={20} className="text-orange-500" /> PARÁMETROS DE CARGA
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha del informe</label>
                            <input 
                                type="text" 
                                value={fechaReporte}
                                onChange={(e) => setFechaReporte(e.target.value)}
                                className="w-full mt-1 p-3 bg-slate-50 border rounded-xl font-mono text-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa / Filtro</label>
                            <select 
                                value={empresaReporte}
                                onChange={(e) => setEmpresaReporte(e.target.value)}
                                className="w-full mt-1 p-3 bg-slate-50 border rounded-xl font-bold text-slate-600 outline-none"
                            >
                                <option value="TODAS">TODAS LAS EMPRESAS</option>
                                <option value="EMP1">EMPRESA 1</option>
                                <option value="EMP2">EMPRESA 2</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={visualizarInformeExistente}
                        disabled={cargando}
                        className={`w-full py-4 rounded-xl font-black text-white transition-all flex items-center justify-center gap-2 ${
                            cargando ? 'bg-slate-300' : 'bg-slate-900 hover:bg-orange-600 shadow-lg'
                        }`}
                    >
                        {cargando ? <RefreshCw className="animate-spin" /> : <RefreshCw />} 
                        {cargando ? "CARGANDO..." : "CARGAR INFORME ACTUAL"}
                    </button>
                </div>

                {/* Visor de HTML */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
                    <div className="bg-slate-100 p-4 border-b flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
                            <FileText size={16} /> VISTA PREVIA DEL DOCUMENTO
                        </span>
                        {reporteUrl && (
                            <a href={reporteUrl} download="reporte.html" className="text-orange-600 hover:underline text-xs font-bold flex items-center gap-1">
                                <Download size={14} /> DESCARGAR
                            </a>
                        )}
                    </div>
                    
                    <div className="flex-grow bg-slate-200 flex items-center justify-center">
                        {reporteUrl ? (
                            <iframe src={reporteUrl} className="w-full h-full bg-white" title="Informe Local" />
                        ) : (
                            <div className="text-center p-10">
                                <div className="bg-white p-6 rounded-full inline-block mb-4 shadow-sm">
                                    <FileText size={48} className="text-slate-300" />
                                </div>
                                <p className="text-slate-400 font-medium">Haz clic en "Cargar Informe Actual" para visualizar el HTML de tu carpeta local.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reporteria;