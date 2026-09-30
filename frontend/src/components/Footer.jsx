import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../lib/api';
import { HOTEL, NAV } from '../lib/config';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/newsletter/', { email });
      toast.success(data.detail);
      setEmail('');
    } catch (err) {
      toast.error(errMsg(err));
    } finally { setBusy(false); }
  };

  const h = 'mb-5 inline-block border-b-2 border-ember pb-1 text-lg font-semibold text-white';
  return (
    <footer className="border-b-4 border-ember bg-ink text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <h3 className={h}>Contact us</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ember" />{HOTEL.address}</li>
            <li className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0 text-ember" />{HOTEL.phone}</li>
            <li className="flex items-center gap-3"><Mail className="h-4 w-4 shrink-0 text-ember" />{HOTEL.email}</li>
          </ul>
        </div>
        <div>
          <h3 className={h}>Menu links</h3>
          <ul className="space-y-2 text-sm">
            {NAV.map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:text-ember">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className={h}>Newsletter</h3>
          <form onSubmit={subscribe} className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
            <label htmlFor="nl" className="sr-only">Email address</label>
            <input id="nl" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email"
              className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-ember focus:outline-none" />
            <button disabled={busy} className="btn-primary shrink-0 rounded-lg">{busy ? 'Sending…' : 'Subscribe'}</button>
          </form>
          <div className="mt-6 flex gap-3">
            {[[Facebook, 'Facebook'], [Twitter, 'Twitter'], [Linkedin, 'LinkedIn'], [Youtube, 'YouTube']].map(([I, n]) => (
              <a key={n} href="#" aria-label={n} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-ember hover:text-white"><I className="h-4 w-4" /></a>
            ))}
          </div>
        </div>
      </div>
      <p className="border-t border-white/10 py-5 text-center text-xs text-slate-500">© {new Date().getFullYear()} {HOTEL.name} Hotel. All rights reserved.</p>
    </footer>
  );
}
