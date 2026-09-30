import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Car, CalendarDays, Dumbbell, Sparkles, Utensils, Waves, Wifi } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFetch } from '../lib/api';
import { addDaysISO, fmtDate, money, todayISO } from '../lib/utils';
import { Img, SectionTitle, Spinner } from '../components/ui';
import RoomCard from '../components/RoomCard';
import AboutSection from '../components/AboutSection';
import ContactSection from '../components/ContactSection';

function BookingCard() {
  const nav = useNavigate();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (end <= start) return toast.error('Departure must be after arrival.');
    nav(`/rooms?start=${start}&end=${end}`);
  };
  const field = 'w-full rounded-none border border-white/50 bg-transparent px-3 py-2.5 text-sm text-white [color-scheme:dark] focus:border-ember focus:outline-none';
  return (
    <form onSubmit={submit} className="w-full max-w-sm border-l-4 border-ember bg-ink/80 p-7 backdrop-blur-sm">
      <h1 className="mb-6 text-2xl font-semibold text-white">Book a room online</h1>
      <label htmlFor="arr" className="mb-1.5 block text-sm text-white">Arrival</label>
      <input id="arr" type="date" required min={todayISO()} value={start}
        onChange={(e) => { setStart(e.target.value); if (end <= e.target.value) setEnd(addDaysISO(e.target.value, 1)); }} className={field} />
      <label htmlFor="dep" className="mb-1.5 mt-4 block text-sm text-white">Departure</label>
      <input id="dep" type="date" required min={start ? addDaysISO(start, 1) : todayISO()} value={end} onChange={(e) => setEnd(e.target.value)} className={field} />
      <button className="btn-primary mx-auto mt-7 flex w-40 py-3">Book now</button>
    </form>
  );
}

function Hero({ slides, minPrice }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);
  return (
    <section className="relative h-[600px] overflow-hidden bg-ink sm:h-[660px]">
      {slides.length ? (
        slides.map((s, k) => (
          <img key={s} src={s} alt="" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${k === i ? 'opacity-100' : 'opacity-0'}`} />
        ))
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-ember/70 via-ink to-ink" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/10 to-ink/30" />
      <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6">
        <BookingCard />
        <div className="ml-auto hidden self-end pb-16 text-right text-white lg:block">
          <p className="text-5xl font-bold leading-[1.1] drop-shadow">Stay above<br />the city.</p>
          {minPrice != null && <p className="mt-4 text-base text-white/90">Rooms from {money(minPrice)} a night.</p>}
        </div>
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, k) => (
            <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={`h-2 rounded-full transition-all ${k === i ? 'w-7 bg-ember' : 'w-2 bg-white/60'}`} />
          ))}
        </div>
      )}
    </section>
  );
}

const FACILITIES = [
  [Waves, 'Rooftop pool', 'Open until midnight'],
  [Wifi, 'Fast wifi', 'In every room'],
  [Utensils, 'Restaurant', 'Breakfast to late dinner'],
  [Sparkles, 'Spa', 'Book at the front desk'],
  [Dumbbell, 'Fitness room', 'Open 24 hours'],
  [Car, 'Airport pickup', 'On request'],
];

export default function Home() {
  const rooms = useFetch('/rooms/');
  const gallery = useFetch('/gallery/');
  const blog = useFetch('/blog/');

  const slides = useMemo(() => {
    const g = (gallery.data || []).map((x) => x.image);
    const r = (rooms.data || []).map((x) => x.image).filter(Boolean);
    return [...g, ...r].slice(0, 5);
  }, [gallery.data, rooms.data]);
  const minPrice = rooms.data?.length ? Math.min(...rooms.data.map((r) => Number(r.price))) : null;
  const aboutImgs = (gallery.data || []).slice(0, 3).map((g) => g.image);

  return (
    <>
      <Hero slides={slides} minPrice={minPrice} />
      <AboutSection images={aboutImgs} />

      <section className="bg-mist py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle title="Our room" text="Pick the room that fits your trip. Prices are per night and free cancellation is available before approval." />
          {rooms.loading ? <Spinner /> : (
            <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {(rooms.data || []).slice(0, 6).map((r) => <RoomCard key={r.id} room={r} />)}
            </div>
          )}
          <div className="mt-12 text-center">
            <Link to="/rooms" className="btn-primary px-8">See all rooms <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="mb-10 text-2xl font-semibold">Everything you need during your stay</h2>
        <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {FACILITIES.map(([Icon, t, s]) => (
            <li key={t} className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ember-50 text-ember"><Icon className="h-5 w-5" /></span>
              <div><p className="font-medium">{t}</p><p className="text-sm text-slate-500">{s}</p></div>
            </li>
          ))}
        </ul>
      </section>

      {gallery.data?.length > 0 && (
        <section className="bg-ink py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-bold text-white">Gallery</h2>
              <Link to="/gallery" className="text-sm text-slate-300 hover:text-ember">View all photos</Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              {gallery.data.slice(0, 8).map((g, k) => (
                <Img key={g.id} src={g.image} alt={g.caption || 'Hotel photo'} className={`w-full rounded-xl ${k === 0 || k === 5 ? 'h-64 md:row-span-2 md:h-full' : 'h-40 md:h-48'}`} />
              ))}
            </div>
          </div>
        </section>
      )}

      {blog.data?.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-bold">From the blog</h2>
            <Link to="/blog" className="text-sm text-slate-500 hover:text-ember">All posts</Link>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {blog.data.slice(0, 3).map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="group block">
                <Img src={p.image} alt="" className="aspect-[16/10] w-full rounded-2xl" />
                <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays className="h-3.5 w-3.5" />{fmtDate(p.created_at)}</p>
                <h3 className="mt-1 text-lg font-semibold group-hover:text-ember">{p.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="bg-mist"><ContactSection /></div>
    </>
  );
}
