import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminUsuarios = ({ token, serverUrl }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoUser, setNuevoUser] = useState({ username: '', password: '', role: 'user' });

  const fetchUsers = async () => {
    const res = await axios.get(`${serverUrl}/users`, { headers: { Authorization: `Bearer ${token}` } });
    setUsuarios(res.data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const crearUsuario = async (e) => {
    e.preventDefault();
    await axios.post(`${serverUrl}/users`, nuevoUser, { headers: { Authorization: `Bearer ${token}` } });
    setNuevoUser({ username: '', password: '', role: 'user' });
    fetchUsers();
  };

  const eliminarUsuario = async (id) => {
    if(window.confirm("¿Eliminar acceso?")) {
      await axios.delete(`${serverUrl}/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-[#111827] p-8 rounded-[2rem] border border-gray-800 shadow-2xl">
        <h2 className="text-xl font-black uppercase italic text-blue-500 mb-6">Crear Nuevo Acceso</h2>
        <form onSubmit={crearUsuario} className="flex flex-wrap gap-4">
          <input type="text" placeholder="Usuario" className="bg-[#0B0F19] border border-gray-700 p-3 rounded-xl flex-1 outline-none focus:border-blue-500" value={nuevoUser.username} onChange={e => setNuevoUser({...nuevoUser, username: e.target.value})} required />
          <input type="password" placeholder="Contraseña" className="bg-[#0B0F19] border border-gray-700 p-3 rounded-xl flex-1 outline-none focus:border-blue-500" value={nuevoUser.password} onChange={e => setNuevoUser({...nuevoUser, password: e.target.value})} required />
          <select className="bg-[#0B0F19] border border-gray-700 p-3 rounded-xl outline-none" value={nuevoUser.role} onChange={e => setNuevoUser({...nuevoUser, role: e.target.value})}>
            <option value="user">Usuario Estándar</option>
            <option value="admin">Administrador</option>
          </select>
          <button type="submit" className="bg-blue-600 px-8 py-3 rounded-xl font-black uppercase italic hover:bg-blue-500 transition-all">Registrar</button>
        </form>
      </div>

      <div className="bg-[#111827] rounded-[2rem] border border-gray-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#0B0F19] text-[10px] font-black uppercase text-gray-500 tracking-widest">
            <tr>
              <th className="p-6">ID</th>
              <th className="p-6">Nombre de Usuario</th>
              <th className="p-6">Rol</th>
              <th className="p-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {usuarios.map(u => (
              <tr key={u.id} className="hover:bg-blue-500/5 transition-colors">
                <td className="p-6 text-gray-500 font-mono text-xs">{u.id}</td>
                <td className="p-6 font-bold">{u.username}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <button onClick={() => eliminarUsuario(u.id)} className="text-red-500 hover:text-red-400 font-black text-xs uppercase tracking-tighter">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsuarios;