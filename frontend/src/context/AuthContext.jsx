import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [loading, setLoading] = useState(!!localStorage.getItem('access'));

  useEffect(() => {
    if (!localStorage.getItem('access')) return;
    api.get('/auth/me/')
      .then((r) => { setUser(r.data); localStorage.setItem('user', JSON.stringify(r.data)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = (d) => {
    localStorage.setItem('access', d.access);
    localStorage.setItem('refresh', d.refresh);
    localStorage.setItem('user', JSON.stringify(d.user));
    setUser(d.user);
    return d.user;
  };
  const login = async (email, password) => save((await api.post('/auth/login/', { email, password })).data);
  const register = async (payload) => save((await api.post('/auth/register/', payload)).data);
  const logout = () => { localStorage.clear(); setUser(null); };
  const updateUser = (u) => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); };

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </Ctx.Provider>
  );
}
