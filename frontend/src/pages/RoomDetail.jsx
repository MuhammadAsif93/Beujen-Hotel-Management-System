import { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Users, Wifi } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg, useFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { addDaysISO, fmtDate, money, nightsBetween, todayISO } from '../lib/utils';
import { ErrorBox, Img, Spinner, StarInput, Stars } from '../components/ui';

export default function RoomDetail() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const loc = useLocation();
  const { user } = useAuth();
  const room = useFetch(`/rooms/${id}/`);
  const avail = useFetch(`/rooms/${id}/availability/`);
  const reviews = useFetch(`/rooms/${id}/reviews/`);

  const [form, setForm] = useState({ name: '', email: '', phone: '', guests: 1, start_date: sp.get('start') || '', end_date: sp.get('end') || '' });
  const [alert, setAlert] = useState(null);
  const [busy, setBusy] = useState(false);
  const [rv, setRv] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.name, email: f.email || user.email, phone: f.phone || user.phone || '' }));
  }, [user]);

  if (room.loading) return <Spinner className="min-h-[60vh]" />;
  if (room.error) return <div className="py-24"><ErrorBox text="We could not find this room." /></div>;
  const r = room.data;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const nights = nightsBetween(form.start_date, form.end_date);
  const clash = nights > 0 && (avail.data || []).some((b) => form.start_date < b.end_date && form.end_date > b.start_date);

  const submit = async (e) => {
    e.preventDefault();
    setAlert(null);
    if (nights <= 0) return setAlert({ type: 'error', text: 'End date must be after the start date.' });
    if (clash) return setAlert({ type: 'error', text: 'Room is already booked please try different date' });
    setBusy(true);
    try {
      await api.post('/bookings/', { room: r.id, ...form, guests: Number(form.guests) });
      setAlert({ type: 'success', text: 'Room Booked Successfully' });
      toast.success('Room Booked Successfully');
      avail.reload();
    } catch (err) {
      setAlert({ type: 'error', text: errMsg(err) });
    } finally { setBusy(false); }
  };

  const postReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/rooms/${id}/reviews/`, rv);
      toast.success('Review saved');
      setRv({ rating: 5, comment: '' });
      reviews.reload(); room.reload();
    } catch (err) { toast.error(errMsg(err)); }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Link to="/rooms" className="text-sm text-slate-500 hover:text-ember">← All rooms</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div>
          <Img src={r.image} alt={r.title} className="aspect-[16/10] w-full rounded-2xl shadow-card" loading="eager" />
          <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-ember-50 px-3 py-1 text-xs font-semibold capitalize text-ember">{r.room_type}</span>
              <h1 className="mt-3 text-3xl font-bold">{r.title}</h1>
              {r.avg_rating && <p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><Stars value={r.avg_rating} />{r.avg_rating} · {r.review_count} review{r.review_count > 1 ? 's' : ''}</p>}
            </div>
            <p className="text-right"><span className="text-3xl font-bold text-ember">{money(r.price)}</span><span className="text-sm text-slate-500"> / night</span></p>
          </div>
          <p className="mt-6 leading-7 text-slate-600">{r.description}</p>
          <ul className="mt-6 flex flex-wrap gap-3 text-sm">
            <li className="flex items-center gap-2 rounded-full bg-mist px-4 py-2"><Users className="h-4 w-4 text-ember" />Up to {r.capacity} guests</li>
            {r.free_wifi && <li className="flex items-center gap-2 rounded-full bg-mist px-4 py-2"><Wifi className="h-4 w-4 text-ember" />Free wifi</li>}
            {r.amenities_list.map((a) => <li key={a} className="rounded-full bg-mist px-4 py-2">{a}</li>)}
          </ul>

          <section className="mt-14">
            <h2 className="text-xl font-semibold">Guest reviews</h2>
            {reviews.data?.length ? (
              <ul className="mt-5 space-y-5">
                {reviews.data.map((v) => (
                  <li key={v.id} className="border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-3"><span className="font-medium">{v.user_name}</span><Stars value={v.rating} size={14} /><span className="text-xs text-slate-400">{fmtDate(v.created_at)}</span></div>
                    {v.comment && <p className="mt-2 text-sm text-slate-600">{v.comment}</p>}
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-sm text-slate-500">No reviews yet. Be the first to share how your stay was.</p>}

            {user ? (
              <form onSubmit={postReview} className="mt-8 rounded-2xl bg-mist p-5">
                <p className="mb-2 text-sm font-medium">Rate this room</p>
                <StarInput value={rv.rating} onChange={(n) => setRv({ ...rv, rating: n })} />
                <label htmlFor="rv" className="sr-only">Comment</label>
                <textarea id="rv" rows={3} className="input mt-3 resize-none" placeholder="Tell others about your stay (optional)" value={rv.comment} onChange={(e) => setRv({ ...rv, comment: e.target.value })} />
                <button className="btn-dark btn-sm mt-3">Post review</button>
              </form>
            ) : <p className="mt-6 text-sm"><Link to="/login" state={{ from: loc.pathname }} className="text-ember underline">Log in</Link> to write a review.</p>}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="text-2xl font-semibold">Book room</h2>

            {alert && (
              <div role="alert" className={`mt-4 flex items-start gap-2 rounded-lg p-3 text-sm ${alert.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
                {alert.type === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                <div>{alert.text}{alert.type === 'success' && <Link to="/profile" className="mt-1 block font-medium underline">View my bookings</Link>}</div>
              </div>
            )}

            {!user ? (
              <div className="mt-5 text-sm text-slate-600">
                <p>Please log in to book this room.</p>
                <div className="mt-4 flex gap-3">
                  <Link to="/login" state={{ from: loc.pathname + loc.search }} className="btn-primary">Log in</Link>
                  <Link to="/register" state={{ from: loc.pathname + loc.search }} className="btn-outline">Sign up</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-4 space-y-3">
                <div><label className="label" htmlFor="b-n">Name</label><input id="b-n" required className="input" value={form.name} onChange={set('name')} /></div>
                <div><label className="label" htmlFor="b-e">Email</label><input id="b-e" type="email" required className="input" value={form.email} onChange={set('email')} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label" htmlFor="b-p">Phone</label><input id="b-p" required className="input" value={form.phone} onChange={set('phone')} /></div>
                  <div><label className="label" htmlFor="b-g">Guests</label><input id="b-g" type="number" min="1" max={r.capacity} required className="input" value={form.guests} onChange={set('guests')} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label" htmlFor="b-s">Start date</label><input id="b-s" type="date" required min={todayISO()} className="input" value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value, end_date: form.end_date <= e.target.value ? addDaysISO(e.target.value, 1) : form.end_date })} /></div>
                  <div><label className="label" htmlFor="b-d">End date</label><input id="b-d" type="date" required min={form.start_date ? addDaysISO(form.start_date, 1) : todayISO()} className="input" value={form.end_date} onChange={set('end_date')} /></div>
                </div>

                {nights > 0 && (
                  <div className={`rounded-lg p-3 text-sm ${clash ? 'bg-red-50 text-red-700' : 'bg-mist'}`}>
                    {clash ? 'These dates are already booked. Try different dates.' : (
                      <div className="flex justify-between"><span>{money(r.price)} × {nights} night{nights > 1 ? 's' : ''}</span><span className="font-semibold">{money(r.price * nights)}</span></div>
                    )}
                  </div>
                )}
                <button disabled={busy || clash} className="btn-primary w-full py-3">{busy ? 'Booking…' : 'Book room'}</button>
                <p className="text-center text-xs text-slate-400">Pay at the hotel. The hotel confirms your booking by email.</p>
              </form>
            )}

            {avail.data?.length > 0 && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-sm font-medium">Already booked</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-500">
                  {avail.data.map((b, i) => <li key={i}>{fmtDate(b.start_date)} to {fmtDate(b.end_date)}</li>)}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
