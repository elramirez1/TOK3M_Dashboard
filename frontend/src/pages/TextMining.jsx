import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import axios from 'axios';

const TextMining = ({ data = [], isFetching }) => {
  const svgRef = useRef();
  const [isDrawing, setIsDrawing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [serverResult, setServerResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const auditResult = useMemo(() => {
    if (!searchTerm || !Array.isArray(data)) return null;
    const term = searchTerm.toLowerCase().trim();
    const localIdx = data.findIndex(item => (item.word || item.palabra || "").toLowerCase() === term);

    if (localIdx !== -1) {
      return { 
        word: (data[localIdx].word || data[localIdx].palabra).toUpperCase(), 
        count: data[localIdx].count || data[localIdx].conteo, 
        rank: localIdx + 1 
      };
    }
    return serverResult; 
  }, [searchTerm, data, serverResult]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.length > 2) {
        const term = searchTerm.toLowerCase().trim();
        const existsLocally = data?.some(i => (i.word || i.palabra || "").toLowerCase() === term);
        
        if (!existsLocally) {
          setIsSearching(true);
          try {
            const res = await axios.get(`http://127.0.0.1:8000/api/textmining/audit?word=${term}`);
            setServerResult(res.data && res.data.count > 0 ? res.data : "not_found");
          } catch (e) { 
            console.error("Error buscando en servidor:", e);
            setServerResult("not_found"); 
          } finally { setIsSearching(false); }
        }
      } else { setServerResult(null); }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, data]);

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
          .attr("width", "100%").attr("height", height)
          .attr("viewBox", `0 0 ${width} ${height}`)
          .append("g").attr("transform", `translate(${width / 2},${height / 2})`);
        svg.selectAll("text").data(computedWords).enter().append("text")
          .style("font-size", d => `${d.size}px`).style("font-family", "Inter, sans-serif")
          .style("font-weight", "900").style("fill", (d, i) => colors[i % colors.length])
          .attr("text-anchor", "middle").attr("transform", d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
          .text(d => d.text).style("opacity", 0.9);
        setIsDrawing(false);
      });
    layout.start();
  }, [data]);

  return (
    <div className="space-y-6 relative">
      <div className="bg-[#111827] border border-gray-800 p-6 rounded-[2.5rem] shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 w-full">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2 italic">Auditoría de Palabra</h3>
            <input
              type="text"
              placeholder="Buscar palabra en historial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <div className="md:w-[300px] flex items-center justify-around bg-[#0B0F19]/50 border border-gray-800 rounded-2xl p-4 min-h-[80px]">
            {isSearching ? <span className="text-[10px] animate-pulse text-blue-400 font-black tracking-widest">BUSCANDO...</span> :
             !auditResult || auditResult === "not_found" ? <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Sin resultados</span> :
             <>
               <div className="text-center">
                 <p className="text-3xl font-black text-blue-500">{Number(auditResult.count).toLocaleString()}</p>
                 <p className="text-[8px] text-gray-500 font-black uppercase">Menciones</p>
               </div>
               <div className="text-center">
                 <p className="text-3xl font-black text-white italic">#{auditResult.rank}</p>
                 <p className="text-[8px] text-gray-500 font-black uppercase">Ranking</p>
               </div>
             </>
            }
          </div>
        </div>
      </div>

      {(isFetching || isDrawing) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0B0F19]/70 backdrop-blur-md rounded-[2.5rem]">
          <div className="flex flex-col items-center bg-[#111827] border border-blue-500/30 p-8 rounded-3xl shadow-2xl">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white font-black text-xs uppercase tracking-[0.3em] animate-pulse">Procesando...</p>
          </div>
        </div>
      )}

      <div className="bg-[#111827] border border-gray-800 p-8 rounded-[2.5rem] shadow-2xl">
        <h3 className="text-[14px] font-black uppercase tracking-[0.4em] text-blue-500 italic mb-6">CONCEPTUAL WORD CLOUD</h3>
        <div className="bg-[#0B0F19]/50 rounded-[2.5rem] border border-gray-800/50 min-h-[500px] flex items-center justify-center overflow-hidden">
          {data && data.length > 0 ? <svg ref={svgRef} className="w-full h-full"></svg> : <p className="text-gray-600 text-[10px] font-black uppercase italic">Sin datos</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {data && data.length > 0 ? data.slice(0, 10).map((item, i) => (
          <div key={i} className="bg-[#111827] border border-gray-800 p-4 rounded-2xl flex flex-col items-center group hover:border-blue-500/50 transition-all">
            <span className="text-blue-400 font-black text-xl">{parseInt(item.count || item.conteo).toLocaleString()}</span>
            <span className="text-gray-500 text-[10px] font-black uppercase mt-1">{item.word || item.palabra}</span>
          </div>
        )) : [...Array(5)].map((_, i) => <div key={i} className="bg-[#111827]/50 border border-gray-800/50 p-4 rounded-2xl h-24 animate-pulse"></div>)}
      </div>
    </div>
  );
};

export default TextMining;
