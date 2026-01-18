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
        className={`flex items-center justify-between min-w-[160px] bg-[#0B0F19] border ${selected.length > 0 ? 'border-blue-500 text-blue-400' : 'border-gray-700 text-gray-300'} px-4 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase`}
      >
        <span className="truncate">{selected.length > 0 ? `${label} (${selected.length})` : label}</span>
        <span className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-[100] mt-2 w-72 bg-[#111827] border border-gray-700 rounded-2xl p-4 shadow-2xl">
          <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
            <span className="text-[9px] uppercase font-black text-gray-500">Opciones</span>
            <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="text-[9px] text-blue-400 hover:text-white uppercase font-bold">Limpiar</button>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {options.map(opt => (
              <label key={opt} className="flex items-center gap-3 p-2.5 hover:bg-gray-800/50 rounded-xl cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selected.includes(opt)} 
                  onChange={() => onToggle(opt)} 
                  className="w-4 h-4 rounded border-gray-700 bg-black text-blue-600 focus:ring-0" 
                />
                <span className={`text-[11px] font-medium ${selected.includes(opt) ? 'text-white' : 'text-gray-400'}`}>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelFilter;
