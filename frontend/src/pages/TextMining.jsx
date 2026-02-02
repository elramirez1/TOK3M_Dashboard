import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

const TextMining = ({ data, isFetching }) => {
  const svgRef = useRef();
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      setIsDrawing(false);
      return;
    }

    setIsDrawing(true);
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove();

    const width = 900;
    const height = 500;
    const colors = ["#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#93C5FD"];

    const words = data.map(d => ({
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
  }, [data]);

  return (
    <div className="space-y-6 relative">
      {/* OVERLAY DE CARGA: Se activa cuando isFetching (servidor) o isDrawing (D3) son true */}
      {(isFetching || isDrawing) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0B0F19]/70 backdrop-blur-md rounded-[2.5rem] transition-all duration-300">
          <div className="flex flex-col items-center bg-[#111827] border border-blue-500/30 p-8 rounded-3xl shadow-2xl">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white font-black text-xs uppercase tracking-[0.3em] animate-pulse">
              {isFetching ? "Obteniendo datos..." : "Dibujando Nube..."}
            </p>
          </div>
        </div>
      )}

      {/* CONTENEDOR DE LA NUBE */}
      <div className="bg-[#111827] border border-gray-800 p-8 rounded-[2.5rem] shadow-2xl">
        <h3 className="text-[14px] font-black uppercase tracking-[0.4em] text-blue-500 italic mb-6">
          CONCEPTUAL WORD CLOUD
        </h3>
        <div className="bg-[#0B0F19]/50 rounded-[2.5rem] border border-gray-800/50 min-h-[500px] flex items-center justify-center overflow-hidden">
          {data && data.length > 0 ? (
            <svg ref={svgRef} className="w-full h-full"></svg>
          ) : (
            <p className="text-gray-600 text-[10px] font-black uppercase italic">Sin datos disponibles para los filtros aplicados</p>
          )}
        </div>
      </div>

      {/* LOS CUADROS HERMOSOS DE ABAJO (TOP 10) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {data && data.length > 0 ? (
          data.slice(0, 10).map((item, i) => (
            <div key={i} className="bg-[#111827] border border-gray-800 p-4 rounded-2xl flex flex-col items-center group hover:border-blue-500/50 transition-all">
              <span className="text-blue-400 font-black text-xl group-hover:scale-110 transition-transform">
                {parseInt(item.count || item.conteo).toLocaleString()}
              </span>
              <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest text-center mt-1">
                {item.word || item.palabra}
              </span>
            </div>
          ))
        ) : (
          [...Array(5)].map((_, i) => (
            <div key={i} className="bg-[#111827]/50 border border-gray-800/50 p-4 rounded-2xl h-24 animate-pulse"></div>
          ))
        )}
      </div>
    </div>
  );
};

export default TextMining;
