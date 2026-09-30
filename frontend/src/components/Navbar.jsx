import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react';
import Logo from './Logo';
import { NAV } from '../lib/config';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const ref = useRef(null);
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => { setOpen(false); setMenu(false); }, [loc.pathname]);
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setMenu(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const linkCls = ({ isActive }) =>
    `border-b-2 py-2 text-[13px] font-medium transition-colors ${isActive ? 'border-ember text-ember' : 'border-transparent text-ink hover:text-ember'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={linkCls}>{label}</NavLink>
          ))}
          {user ? (
            <div className="relative" ref={ref}>
              <button onClick={() => setMenu(!menu)} aria-expanded={menu} className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 text-sm hover:border-ember">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ember text-xs font-semibold text-white">{user.name?.[0]?.toUpperCase()}</span>
                <span className="max-w-[90px] truncate">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 text-sm shadow-card">
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 hover:bg-mist"><User className="h-4 w-4" /> Profile</Link>
                  {isAdmin && <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 hover:bg-mist"><LayoutDashboard className="h-4 w-4" /> Admin panel</Link>}
                  <button onClick={() => { logout(); nav('/'); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-mist"><LogOut className="h-4 w-4" /> Log out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-[13px] font-medium hover:text-ember">Log in</Link>
              <Link to="/register" className="btn-primary btn-sm">Sign up</Link>
            </div>
          )}
        </nav>

        <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-100 bg-white px-4 pb-5 pt-2 lg:hidden" aria-label="Mobile">
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `block rounded-lg px-3 py-3 text-sm font-medium ${isActive ? 'bg-ember-50 text-ember' : ''}`}>{label}</NavLink>
          ))}
          <div className="mt-3 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
            {user ? (
              <>
                <Link to="/profile" className="btn-outline btn-sm">Profile</Link>
                {isAdmin && <Link to="/admin" className="btn-outline btn-sm">Admin panel</Link>}
                <button onClick={() => { logout(); nav('/'); }} className="btn-dark btn-sm">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline btn-sm">Log in</Link>
                <Link to="/register" className="btn-primary btn-sm">Sign up</Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
