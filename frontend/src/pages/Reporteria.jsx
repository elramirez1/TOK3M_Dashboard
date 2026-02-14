// ARGUMENTO DE DIAGNÓSTICO: Componente de visualización de reportes embebidos.
// Se optimiza la carga de blobs HTML y la integración con el puente local vía Nginx/Proxy.
// Se mantiene la independencia del estado local para no interferir con los filtros globales del dashboard.

import React, { useState } from 'react';
import axios from 'axios';
import { Cpu, FileText, Monitor, Download, RefreshCw, AlertTriangle } from 'lucide-react';

const Reporteria = () => {
    // ARGUMENTO DE DIAGNÓSTICO: Estados para controlar la visualización del informe HTML.
    const [fechaReporte, setFechaReporte] = useState("20250102");
    const [empresaReporte, setEmpresaReporte] = useState("TODAS");
    const [cargando, setCargando] = useState(false);
    const [reporteUrl, setReporteUrl] = useState(null);
    const [error, setError] = useState(null);

    // Priorizar la URL de Railway o el entorno configurado
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    const visualizarInformeExistente = async () => {
        setCargando(true);
        setReporteUrl(null);
        setError(null);
        try {
            // DIAGNÓSTICO: Petición al bridge del servidor para traer el archivo físico del hardware local.
            const response = await axios.post(`${API_URL}/descargar-reporte`, {
                fecha: fechaReporte,
                empresa: empresaReporte
            }, { 
                responseType: 'blob',
                timeout: 30000 // 30 segundos para descarga de archivos grandes
            });

            // Creamos un objeto URL a partir del Blob recibido del backend
            const blob = new Blob([response.data], { type: 'text/html' });
            const url = window.URL.createObjectURL(blob);
            setReporteUrl(url);
        } catch (error) {
            console.error("Error al cargar el informe:", error);
            setError("⚠️ No se pudo conectar con el hardware local. Verifica el estado del Proxy Nginx y que el Obrero Local esté corriendo.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
            {/* Cabecera */}
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Reportería de Calidad</h1>
                    <p className="text-slate-500 font-medium italic">Hardware: MacBook Air M-Series | Conexión: Secure Reverse Proxy</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase">
                        <Monitor size={14} /> Bridge Active
                    </div>
                </div>
            </div>

            {/* Panel de Control */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 uppercase tracking-tighter">
                        <Cpu size={20} className="text-orange-500" /> Control de Acceso Local
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha del informe (Formato YYYYMMDD)</label>
                            <input 
                                type="text" 
                                value={fechaReporte}
                                onChange={(e) => setFechaReporte(e.target.value)}
                                className="w-full mt-1 p-3 bg-slate-50 border rounded-xl font-mono text-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa / Cliente</label>
                            <select 
                                value={empresaReporte}
                                onChange={(e) => setEmpresaReporte(e.target.value)}
                                className="w-full mt-1 p-3 bg-slate-50 border rounded-xl font-bold text-slate-600 outline-none cursor-pointer"
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
                        className={`w-full py-4 rounded-xl font-black text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                            cargando ? 'bg-slate-300' : 'bg-slate-900 hover:bg-orange-600'
                        }`}
                    >
                        {cargando ? <RefreshCw className="animate-spin" /> : <RefreshCw />} 
                        {cargando ? "LOCALIZANDO ARCHIVO..." : "VISUALIZAR INFORME"}
                    </button>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600">
                            <AlertTriangle size={24} className="shrink-0" />
                            <p className="text-xs font-bold leading-tight">{error}</p>
                        </div>
                    )}
                </div>

                {/* Visor de HTML */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[700px] flex flex-col">
                    <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
                        <span className="text-[10px] font-black tracking-widest flex items-center gap-2 uppercase">
                            <FileText size={16} className="text-orange-400" /> Informe Embebido (Pre-generado)
                        </span>
                        {reporteUrl && (
                            <a 
                                href={reporteUrl} 
                                download={`reporte_${fechaReporte}.html`}
                                className="bg-orange-500 hover:bg-orange-400 text-white px-3 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition-colors"
                            >
                                <Download size={14} /> DESCARGAR HTML
                            </a>
                        )}
                    </div>
                    
                    <div className="flex-grow bg-slate-100 flex items-center justify-center relative">
                        {reporteUrl ? (
                            <iframe 
                                src={reporteUrl} 
                                className="w-full h-full border-none" 
                                title="Informe Local Embebido"
                                style={{ background: 'white' }}
                            />
                        ) : (
                            <div className="text-center p-12">
                                <div className="bg-white p-8 rounded-full inline-block mb-6 shadow-md border border-slate-200">
                                    <FileText size={64} className="text-slate-200" />
                                </div>
                                <h4 className="text-slate-900 font-black text-xl mb-2">ESPERANDO PETICIÓN</h4>
                                <p className="text-slate-400 font-medium max-w-sm mx-auto">
                                    Asegúrate de que el servidor local en tu Mac esté encendido para servir el reporte solicitado.
                                </p>
                            </div>
                        )}
                        {cargando && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                <RefreshCw className="animate-spin text-orange-500 mb-4" size={48} />
                                <span className="font-black text-slate-900 tracking-widest text-sm">RECUPERANDO DATOS LOCALES...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reporteria;