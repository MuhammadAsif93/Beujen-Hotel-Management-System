import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg, useFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { fmtDate, money, todayISO } from '../lib/utils';
import { Confirm, Empty, Img, Spinner } from '../components/ui';

function Bookings() {
  const { data, loading, reload } = useFetch('/bookings/');
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const cancel = async () => {
    setBusy(true);
    try { await api.post(`/bookings/${target.id}/cancel/`); toast.success('Booking cancelled'); setTarget(null); reload(); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  if (loading) return <Spinner />;
  if (!data?.length) return <Empty title="No bookings yet" text="When you book a room it will show up here."><Link to="/rooms" className="btn-primary btn-sm">Browse rooms</Link></Empty>;
  return (
    <>
      <ul className="space-y-4">
        {data.map((b) => (
          <li key={b.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row">
            <Img src={b.room_image} alt="" className="h-32 w-full rounded-xl sm:w-48" />
            <div className="flex flex-1 flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{b.room_title}</h3>
                <StatusBadgeLight status={b.status} />
              </div>
              <p className="mt-1 text-sm text-slate-500">{fmtDate(b.start_date)} to {fmtDate(b.end_date)} · {b.nights} night{b.nights > 1 ? 's' : ''} · {b.guests} guest{b.guests > 1 ? 's' : ''}</p>
              <div className="mt-auto flex items-center justify-between pt-3">
                <p className="text-lg font-bold text-ember">{money(b.total_price)}</p>
                {['waiting', 'approved'].includes(b.status) && b.end_date >= todayISO() && (
                  <button onClick={() => setTarget(b)} className="text-sm font-medium text-red-600 hover:underline">Cancel booking</button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Confirm open={!!target} title="Cancel this booking?" text={`Your booking for ${target?.room_title} will be cancelled and the dates will open up for other guests.`} confirmText="Cancel booking" busy={busy} onConfirm={cancel} onCancel={() => setTarget(null)} />
    </>
  );
}

const LIGHT = { waiting: 'bg-amber-100 text-amber-800', approved: 'bg-emerald-100 text-emerald-800', rejected: 'bg-red-100 text-red-700', cancelled: 'bg-slate-100 text-slate-600' };
const StatusBadgeLight = ({ status }) => <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${LIGHT[status]}`}>{status}</span>;

function Details() {
  const { user, updateUser } = useAuth();
  const [f, setF] = useState({ name: user.name, phone: user.phone || '' });
  const [busy, setBusy] = useState(false);
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const { data } = await api.patch('/auth/me/', f); updateUser(data); toast.success('Profile updated'); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={save} className="max-w-md space-y-4">
      <div><label className="label" htmlFor="p-e">Email</label><input id="p-e" disabled className="input bg-slate-50" value={user.email} /></div>
      <div><label className="label" htmlFor="p-n">Name</label><input id="p-n" required className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
      <div><label className="label" htmlFor="p-p">Phone</label><input id="p-p" className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
      <button disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}

function Password() {
  const [f, setF] = useState({ old_password: '', new_password: '' });
  const [busy, setBusy] = useState(false);
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api.post('/auth/change-password/', f); toast.success('Password changed'); setF({ old_password: '', new_password: '' }); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={save} className="max-w-md space-y-4">
      <div><label className="label" htmlFor="pw-o">Current password</label><input id="pw-o" type="password" required className="input" value={f.old_password} onChange={(e) => setF({ ...f, old_password: e.target.value })} /></div>
      <div><label className="label" htmlFor="pw-n">New password</label><input id="pw-n" type="password" minLength={6} required className="input" value={f.new_password} onChange={(e) => setF({ ...f, new_password: e.target.value })} /></div>
      <button disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Change password'}</button>
    </form>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [tab, setTab] = useState('bookings');
  const tabs = [['bookings', 'My bookings'], ['details', 'Profile'], ['password', 'Password']];
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ember text-xl font-semibold text-white">{user.name?.[0]?.toUpperCase()}</span>
        <div><h1 className="text-2xl font-bold">{user.name}</h1><p className="text-sm text-slate-500">{user.email}</p></div>
      </div>
      <div className="mt-8 flex gap-6 border-b border-slate-200" role="tablist">
        {tabs.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium ${tab === k ? 'border-ember text-ember' : 'border-transparent text-slate-500 hover:text-ink'}`}>{l}</button>
        ))}
      </div>
      <div className="mt-8">{tab === 'bookings' ? <Bookings /> : tab === 'details' ? <Details /> : <Password />}</div>
    </div>
  );
}
