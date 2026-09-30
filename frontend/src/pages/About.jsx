import { Link } from 'react-router-dom';
import { Car, Dumbbell, Sparkles, Utensils, Waves, Wifi } from 'lucide-react';
import { useFetch } from '../lib/api';
import AboutSection from '../components/AboutSection';

const ITEMS = [
  [Waves, 'Rooftop pool', 'Swim with the skyline behind you.'],
  [Wifi, 'Fast wifi', 'Work or stream from any room.'],
  [Utensils, 'Restaurant', 'Breakfast, lunch and dinner on the ground floor.'],
  [Sparkles, 'Spa', 'Massages and treatments by appointment.'],
  [Dumbbell, 'Fitness room', 'Open around the clock.'],
  [Car, 'Airport pickup', 'Tell us your flight and we will be there.'],
];

export default function About() {
  const gallery = useFetch('/gallery/');
  const imgs = (gallery.data || []).slice(0, 3).map((g) => g.image);
  return (
    <>
      <div className="bg-ink py-16 text-center text-white">
        <h1 className="section-title text-4xl">About us</h1>
        <p className="mt-5 text-sm text-slate-300">A quiet room, a big window and a short walk to everything.</p>
      </div>
      <AboutSection images={imgs} full />
      <section className="bg-mist py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold">What is on site</h2>
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {ITEMS.map(([Icon, t, s]) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-ember shadow-card"><Icon className="h-5 w-5" /></span>
                <div><p className="font-medium">{t}</p><p className="mt-1 text-sm text-slate-500">{s}</p></div>
              </li>
            ))}
          </ul>
          <div className="mt-14 text-center"><Link to="/rooms" className="btn-primary px-8">Find a room</Link></div>
        </div>
      </section>
    </>
  );
}
