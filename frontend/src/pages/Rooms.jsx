import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { useFetch } from '../lib/api';
import { addDaysISO, fmtDate, todayISO } from '../lib/utils';
import { Empty, ErrorBox, SectionTitle, Spinner } from '../components/ui';
import RoomCard from '../components/RoomCard';

const TYPES = [['', 'All'], ['regular', 'Regular'], ['premium', 'Premium'], ['deluxe', 'Deluxe']];

export default function Rooms() {
  const [sp, setSp] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const f = {
    room_type: sp.get('room_type') || '', max_price: sp.get('max_price') || '', guests: sp.get('guests') || '',
    wifi: sp.get('wifi') || '', ordering: sp.get('ordering') || '', start: sp.get('start') || '', end: sp.get('end') || '',
  };
  const set = (patch) => {
    const n = { ...f, ...patch };
    const p = {};
    Object.entries(n).forEach(([k, v]) => v && (p[k] = v));
    setSp(p, { replace: true });
  };

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => v && p.set(k, v));
    if (!(f.start && f.end)) { p.delete('start'); p.delete('end'); }
    return p.toString();
  }, [sp]); // eslint-disable-line
  const { data, loading, error, reload } = useFetch(`/rooms/?${qs}`);
  const dateQuery = f.start && f.end ? `?start=${f.start}&end=${f.end}` : '';

  return (
    <>
      <div className="bg-ink py-16 text-center text-white">
        <h1 className="section-title text-4xl">Our room</h1>
        <p className="mt-5 text-sm text-slate-300">
          {f.start && f.end ? `Available ${fmtDate(f.start)} to ${fmtDate(f.end)}` : 'Choose your dates to see what is free.'}
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Room type">
            {TYPES.map(([v, l]) => (
              <button key={v} onClick={() => set({ room_type: v })}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${f.room_type === v ? 'bg-ember text-white' : 'bg-mist text-slate-600 hover:bg-slate-200'}`}>{l}</button>
            ))}
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn-outline btn-sm ml-auto" aria-expanded={showFilters}><SlidersHorizontal className="h-4 w-4" /> More filters</button>
        </div>

        {showFilters && (
          <div className="mt-5 grid gap-4 rounded-2xl bg-mist p-5 sm:grid-cols-2 lg:grid-cols-6">
            <div><label className="label" htmlFor="f-s">Arrival</label><input id="f-s" type="date" min={todayISO()} className="input" value={f.start} onChange={(e) => set({ start: e.target.value, end: f.end <= e.target.value ? addDaysISO(e.target.value, 1) : f.end })} /></div>
            <div><label className="label" htmlFor="f-e">Departure</label><input id="f-e" type="date" min={f.start ? addDaysISO(f.start, 1) : todayISO()} className="input" value={f.end} onChange={(e) => set({ end: e.target.value })} /></div>
            <div><label className="label" htmlFor="f-p">Max price / night</label><input id="f-p" type="number" min="0" placeholder="Any" className="input" value={f.max_price} onChange={(e) => set({ max_price: e.target.value })} /></div>
            <div><label className="label" htmlFor="f-g">Guests</label><input id="f-g" type="number" min="1" placeholder="Any" className="input" value={f.guests} onChange={(e) => set({ guests: e.target.value })} /></div>
            <div><label className="label" htmlFor="f-o">Sort by</label>
              <select id="f-o" className="input" value={f.ordering} onChange={(e) => set({ ordering: e.target.value })}>
                <option value="">Price: low to high</option><option value="-price">Price: high to low</option><option value="-created_at">Newest</option>
              </select></div>
            <label className="flex items-end gap-2 pb-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-ember" checked={f.wifi === 'true'} onChange={(e) => set({ wifi: e.target.checked ? 'true' : '' })} /> Free wifi only</label>
            <button onClick={() => setSp({}, { replace: true })} className="text-left text-sm text-ember underline sm:col-span-2 lg:col-span-6">Clear all filters</button>
          </div>
        )}

        <div className="mt-10">
          {loading ? <Spinner /> : error ? <ErrorBox text={error} onRetry={reload} /> : data?.length ? (
            <>
              <p className="mb-6 text-sm text-slate-500">{data.length} room{data.length > 1 ? 's' : ''} found</p>
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {data.map((r) => <RoomCard key={r.id} room={r} query={dateQuery} />)}
              </div>
            </>
          ) : (
            <Empty title="No rooms match these filters" text="Try different dates or remove a filter.">
              <button onClick={() => setSp({}, { replace: true })} className="btn-primary btn-sm">Clear filters</button>
            </Empty>
          )}
        </div>
      </div>
    </>
  );
}
