// ARGUMENTO DE DIAGNÓSTICO: Sustitución de branding textual por identidad visual corporativa.
// Se implementa la importación de assets estáticos para mejorar la experiencia de usuario (UX).

import React, { useState } from 'react';
import axios from 'axios';
import logo from '../assets/logo.jpg'; // Asegúrate de que la ruta sea correcta según tu estructura

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Usamos la URL de tu API de Railway o localhost
      const serverUrl = window.location.hostname === 'localhost' 
        ? 'http://127.0.0.1:8000/api' 
        : 'https://considerate-charm-production-d8f6.up.railway.app/api';

      const res = await axios.post(`${serverUrl}/auth/login`, { username, password });
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111827] border border-gray-800 rounded-[2.5rem] p-10 shadow-2xl">
        
        {/* SUSTITUCIÓN DE TEXTO POR LOGO */}
        <div className="flex flex-col items-center mb-10">
          <img 
            src={logo} 
            alt="Logo Corporativo" 
            className="h-20 md:h-24 object-contain mb-4"
          />
          <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 mb-2 block">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0B0F19] border border-gray-700 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none transition-all"
              placeholder="Ej: admin"
              required
            />
          </div>

          <div className="relative">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 mb-2 block">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0B0F19] border border-gray-700 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-500 text-[11px] font-bold p-4 rounded-xl text-center animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-xs"
          >
            {loading ? 'Validando...' : 'Entrar al Sistema'}
          </button>
        </form>
        
        <p className="text-center mt-8 text-[9px] text-gray-600 font-bold uppercase tracking-[0.3em]">
          Powered by TOK3M Security
        </p>
      </div>
    </div>
  );
};

export default Login;