import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

const TextMining = ({ data }) => {
  const svgRef = useRef();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentData, setCurrentData] = useState([]);

  // Detectamos cuando la prop 'data' cambia (cuando el API responde)
  useEffect(() => {
    if (data && data !== currentData) {
      setIsUpdating(false); // La petición terminó
      setCurrentData(data);
    }
  }, [data]);

  useEffect(() => {
    if (!currentData || !Array.isArray(currentData) || currentData.length === 0) {
      setIsDrawing(false);
      return;
    }

    setIsDrawing(true);
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove();

    const width = 900;
    const height = 500;
    const colors = ["#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#93C5FD"];

    const words = currentData.map(d => ({
      text: String(d.word || d.palabra || ""),
      size: Math.max(12, Math.min(80, Math.log2(parseInt(d.count || d.conteo || 1)) * 7))
    })).filter(w => w.text.length > 0);

    const layout = cloud()
      .size([width, height])
      .words(words)
      .padding(3)
      .rotate(() => (~~(Math.random() * 2) * 90))
      .font("Inter, sans-serif")
      .fontSize(d => d.size)
      .on("end", (computedWords) => {
        const svg = svgElement
          .attr("width", "100%")
          .attr("height", height)
          .attr("viewBox", `0 0 ${width} ${height}`)
          .append("g")
          .attr("transform", `translate(${width / 2},${height / 2})`);

        svg.selectAll("text")
          .data(computedWords)
          .enter().append("text")
          .style("font-size", d => `${d.size}px`)
          .style("font-family", "Inter, sans-serif")
          .style("font-weight", "900")
          .style("fill", (d, i) => colors[i % colors.length])
          .attr("text-anchor", "middle")
          .attr("transform", d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
          .text(d => d.text)
          .style("opacity", 0.9);
        
        setIsDrawing(false);
      });

    layout.start();
  }, [currentData]);

  // Si no hay data inicial
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#111827] border border-gray-800 p-20 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Consultando base de datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="bg-[#111827] border border-gray-800 p-8 rounded-[2.5rem] shadow-2xl relative">
        
        {/* INDICADOR DE CARGA (Aparece sobre el gráfico cuando cambias filtros) */}
        {isDrawing && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#111827]/40 backdrop-blur-[2px] rounded-[2.5rem] transition-all">
            <div className="bg-[#0B0F19] border border-blue-500/30 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Actualizando Nube...</span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[14px] font-black uppercase tracking-[0.4em] text-blue-500 italic">
            WORD CLOUD ANALYSIS
          </h3>
          <div className="text-[9px] font-bold text-gray-500 uppercase">
            Top {currentData.length} conceptos
          </div>
        </div>

        <div className="bg-[#0B0F19]/50 rounded-[2.5rem] border border-gray-800/50 min-h-[500px] flex items-center justify-center relative overflow-hidden">
          <svg ref={svgRef} className="w-full h-full"></svg>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {currentData.slice(0, 10).map((item, i) => (
          <div key={i} className="bg-[#111827] border border-gray-800 p-4 rounded-2xl flex flex-col items-center group hover:border-blue-500/50 transition-all">
            <span className="text-blue-400 font-black text-xl group-hover:scale-110 transition-transform">
              {parseInt(item.count || item.conteo).toLocaleString()}
            </span>
            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest text-center mt-1">
              {item.word || item.palabra}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TextMining;
