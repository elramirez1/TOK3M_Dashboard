// ARGUMENTO DE DIAGNÓSTICO: Implementación de SERVER_URL dinámica para permitir autenticación en entornos locales y remotos (Railway).

import React, { useState } from 'react';
import axios from 'axios';

// Detectamos la URL del servidor dinámicamente igual que en App.jsx
const SERVER_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000/api'
  : 'https://considerate-charm-production-d8f6.up.railway.app/api';

const Login = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiamos errores previos
    
    try {
      // CAMBIO CLAVE: Usamos la constante SERVER_URL en lugar de localhost
      const res = await axios.post(`${SERVER_URL}/auth/login`, { 
        username: user, 
        password: pass 
      });

      // Guardamos en localStorage para persistencia
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', res.data.username);
      
      // Llamamos a la función onLogin que pasamos desde App.jsx
      // Le pasamos los datos para que App.jsx actualice su estado de token
      onLogin(res.data); 
      
    } catch (err) {
      console.error("Error en login:", err);
      setError('Credenciales inválidas o servidor no disponible');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] p-6">
      <div className="w-full max-w-md bg-[#111827] p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl">
        <h2 className="text-3xl font-black text-white mb-2 text-center uppercase italic">TOK3M</h2>
        <p className="text-gray-500 text-center text-xs mb-8 uppercase tracking-widest">Panel de Control de Calidad</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-gray-400 text-[10px] font-black uppercase ml-2">Usuario</label>
            <input 
              type="text" 
              value={user} 
              onChange={e => setUser(e.target.value)} 
              className="w-full bg-[#0B0F19] border border-gray-700 p-4 rounded-2xl text-white focus:border-blue-500 outline-none" 
              placeholder="admin"
              required 
            />
          </div>
          <div>
            <label className="text-gray-400 text-[10px] font-black uppercase ml-2">Contraseña</label>
            <input 
              type="password" 
              value={pass} 
              onChange={e => setPass(e.target.value)} 
              className="w-full bg-[#0B0F19] border border-gray-700 p-4 rounded-2xl text-white focus:border-blue-500 outline-none" 
              placeholder="••••••••"
              required 
            />
          </div>
          {error && <p className="text-red-500 text-xs font-bold text-center bg-red-500/10 py-2 rounded-lg">{error}</p>}
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all uppercase italic tracking-widest shadow-lg shadow-blue-500/20 active:scale-95"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;