import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, CalendarCheck, ChevronDown, ExternalLink, Hotel, Images, LayoutDashboard, LogOut, Menu, MessageSquare, Newspaper, X } from 'lucide-react';
import { LogoMark } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../lib/api';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [roomsOpen, setRoomsOpen] = useState(true);
  const ref = useRef(null);
  const stats = useFetch('/admin/stats/');
  const c = stats.data?.cards;

  useEffect(() => { setOpen(false); setMenu(false); window.scrollTo(0, 0); }, [loc.pathname, loc.search]);
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setMenu(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  // sidebar badges refresh jab page change ho
  useEffect(() => { stats.reload(); }, [loc.pathname]); // eslint-disable-line

  const item = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-ember/15 text-ember' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`;
  const Badge = ({ n }) => n > 0 && <span className="ml-auto rounded-full bg-ember px-2 py-0.5 text-[11px] font-semibold text-white">{n}</span>;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-edge px-5">
        <LogoMark className="h-7 w-5" />
        <span className="text-xl font-bold text-white"Hilton></span>
        <span className="ml-1 rounded bg-ember/15 px-1.5 py-0.5 text-[11px] font-semibold text-ember">Admin</span>
      </div>
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-ember to-purple-500 font-semibold text-white">{user.name?.[0]?.toUpperCase()}</span>
        <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{user.name}</p><p className="text-xs text-slate-500">Administrator</p></div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Admin">
        <NavLink to="/admin" end className={item}><LayoutDashboard className="h-[18px] w-[18px]" />Dashboard</NavLink>
        <div>
          <button onClick={() => setRoomsOpen(!roomsOpen)} aria-expanded={roomsOpen}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${loc.pathname === '/admin/rooms' ? 'text-ember' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <Hotel className="h-[18px] w-[18px]" />Hotel rooms<ChevronDown className={`ml-auto h-4 w-4 transition-transform ${roomsOpen ? 'rotate-180' : ''}`} />
          </button>
          {roomsOpen && (
            <div className="ml-6 mt-1 space-y-1 border-l border-edge pl-3 text-sm">
              <Link to="/admin/rooms?new=1" className="block rounded-md px-3 py-2 text-slate-400 hover:text-white">Add room</Link>
              <Link to="/admin/rooms" className="block rounded-md px-3 py-2 text-slate-400 hover:text-white">View rooms</Link>
            </div>
          )}
        </div>
        <NavLink to="/admin/bookings" className={item}><CalendarCheck className="h-[18px] w-[18px]" />Bookings<Badge n={c?.pending_bookings} /></NavLink>
        <NavLink to="/admin/gallery" className={item}><Images className="h-[18px] w-[18px]" />Gallery</NavLink>
        <NavLink to="/admin/messages" className={item}><MessageSquare className="h-[18px] w-[18px]" />Messages<Badge n={c?.unread_messages} /></NavLink>
        <NavLink to="/admin/blog" className={item}><Newspaper className="h-[18px] w-[18px]" />Blog</NavLink>
      </nav>
      <div className="border-t border-edge p-3">
        <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white"><ExternalLink className="h-[18px] w-[18px]" />View website</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-night text-slate-200">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-edge bg-panel lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-panel">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-4 text-slate-400" aria-label="Close menu"><X /></button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-edge bg-panel/95 px-4 backdrop-blur sm:px-6">
          <button className="rounded-lg p-2 text-slate-300 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu /></button>
          <div className="ml-auto flex items-center gap-4">
            <Link to="/admin/bookings" className="relative rounded-lg p-2 text-slate-400 hover:text-white" aria-label="Pending bookings">
              <Bell className="h-5 w-5" />
              {c?.pending_bookings > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 text-[10px] font-semibold text-white">{c.pending_bookings}</span>}
            </Link>
            <div className="relative" ref={ref}>
              <button onClick={() => setMenu(!menu)} aria-expanded={menu} className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-ink">
                admin <ChevronDown className="h-4 w-4" />
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-edge bg-panel py-1 text-sm shadow-xl">
                  <Link to="/" className="block px-4 py-2.5 hover:bg-white/5">View website</Link>
                  <button onClick={() => { logout(); nav('/login'); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-white/5"><LogOut className="h-4 w-4" />Log out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
