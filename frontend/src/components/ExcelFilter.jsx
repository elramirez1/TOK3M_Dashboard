import React, { useState } from 'react';

const ExcelFilter = ({ label, options, selected, onToggle, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtramos las opciones basadas en lo que el usuario escribe
  const filteredOptions = options.filter(opt => 
    opt.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-6 h-12 rounded-2xl text-[10px] font-black border transition-all cursor-pointer flex items-center gap-2 ${
            selected.length > 0 
            ? 'bg-blue-600 border-blue-400 text-white' 
            : 'bg-[#0B0F19] border-gray-700 text-gray-400 hover:border-gray-500'
          }`}
        >
          {label} {selected.length > 0 && `(${selected.length})`}
          <span className="text-[8px] opacity-50">{isOpen ? '▲' : '▼'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 bg-[#1F2937] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
          {/* CABECERA CON BOTÓN LIMPIAR */}
          <div className="p-3 border-b border-gray-700 flex justify-between items-center bg-[#111827]">
            <span className="text-[9px] font-black text-gray-500 uppercase px-2 tracking-tighter">{label}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="text-[9px] font-black text-red-400 hover:text-red-300 px-2 cursor-pointer transition-colors"
            >
              LIMPIAR SELECCIÓN
            </button>
          </div>

          {/* BARRA DE BÚSQUEDA TIPO EXCEL */}
          <div className="p-2 bg-[#111827] border-b border-gray-700">
            <input
              type="text"
              placeholder={`Buscar ${label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />
          </div>

          {/* LISTA DE OPCIONES FILTRADAS */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar bg-[#1F2937]">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <label
                  key={opt}
                  className="flex items-center px-4 py-3 hover:bg-gray-700 transition-colors cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(opt)}
                    onChange={() => onToggle(opt)}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-all ${
                    selected.includes(opt) ? 'bg-blue-500 border-blue-400' : 'border-gray-600 group-hover:border-gray-400'
                  }`}>
                    {selected.includes(opt) && <span className="text-[10px] text-white">✓</span>}
                  </div>
                  <span className={`text-[11px] font-bold ${selected.includes(opt) ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                    {opt}
                  </span>
                </label>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500 text-[10px] font-bold uppercase italic">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Overlay para cerrar al hacer clic fuera */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => { setIsOpen(false); setSearchTerm(''); }}
        ></div>
      )}
    </div>
  );
};

export default ExcelFilter;
