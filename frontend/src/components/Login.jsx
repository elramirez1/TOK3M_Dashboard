import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/auth/login', { username: user, password: pass });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', res.data.username);
      onLogin();
    } catch (err) {
      setError('Credenciales inválidas');
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
            <input type="text" value={user} onChange={e => setUser(e.target.value)} className="w-full bg-[#0B0F19] border border-gray-700 p-4 rounded-2xl text-white focus:border-blue-500 outline-none" required />
          </div>
          <div>
            <label className="text-gray-400 text-[10px] font-black uppercase ml-2">Contraseña</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full bg-[#0B0F19] border border-gray-700 p-4 rounded-2xl text-white focus:border-blue-500 outline-none" required />
          </div>
          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all uppercase italic tracking-widest">Ingresar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
