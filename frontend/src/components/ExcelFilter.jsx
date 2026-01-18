import React, { useState, useEffect, useRef } from 'react';

const ExcelFilter = ({ label, options, selected, onToggle, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`flex items-center justify-between min-w-[200px] bg-[#1F2937]/50 border-2 ${selected.length > 0 ? 'border-blue-500 text-blue-400' : 'border-gray-700 text-gray-200'} px-6 py-4 rounded-2xl text-[13px] font-black tracking-widest uppercase transition-all hover:bg-[#1F2937] hover:border-gray-500 shadow-lg`}
      >
        <span className="truncate">{selected.length > 0 ? `${label} (${selected.length})` : label}</span>
        <span className={`ml-3 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-400' : 'text-gray-500'}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className="absolute left-0 top-full z-[100] mt-3 w-80 bg-[#111827] border-2 border-gray-700 rounded-[2rem] p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-3">
            <span className="text-[11px] uppercase font-black text-gray-500 tracking-widest">Seleccionar {label}</span>
            <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="text-[10px] text-blue-400 hover:text-white uppercase font-black border border-blue-400/30 px-3 py-1 rounded-full transition-colors">Limpiar</button>
          </div>
          <div className="max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {options.map(opt => (
              <label key={opt} className={`flex items-center gap-4 p-3.5 rounded-xl cursor-pointer transition-all ${selected.includes(opt) ? 'bg-blue-500/10 border border-blue-500/30' : 'hover:bg-gray-800/50 border border-transparent'}`}>
                <input 
                  type="checkbox" 
                  checked={selected.includes(opt)} 
                  onChange={() => onToggle(opt)} 
                  className="w-5 h-5 rounded-lg border-2 border-gray-700 bg-black text-blue-600 focus:ring-0 transition-all" 
                />
                <span className={`text-[13px] font-bold ${selected.includes(opt) ? 'text-white' : 'text-gray-400'}`}>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelFilter;
