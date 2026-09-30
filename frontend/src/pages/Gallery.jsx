import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useFetch } from '../lib/api';
import { Empty, ErrorBox, Img, SectionTitle, Spinner } from '../components/ui';

export default function Gallery() {
  const { data, loading, error, reload } = useFetch('/gallery/');
  const [idx, setIdx] = useState(null);
  const n = data?.length || 0;

  useEffect(() => {
    if (idx === null) return;
    const h = (e) => {
      if (e.key === 'Escape') setIdx(null);
      if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % n);
      if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + n) % n);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [idx, n]);

  return (
    <>
      <div className="bg-ink py-16 text-center text-white">
        <h1 className="section-title text-4xl">Gallery</h1>
        <p className="mt-5 text-sm text-slate-300">Rooms, pool, lounge and the view from the top.</p>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {loading ? <Spinner /> : error ? <ErrorBox text={error} onRetry={reload} /> : n === 0 ? <Empty title="No photos yet" text="Photos will appear here once the hotel uploads them." /> : (
          <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
            {data.map((g, i) => (
              <button key={g.id} onClick={() => setIdx(i)} className="mb-4 block w-full overflow-hidden rounded-xl" aria-label={`Open photo ${i + 1}`}>
                <Img src={g.image} alt={g.caption || 'Hotel photo'} className="w-full" />
              </button>
            ))}
          </div>
        )}
      </div>

      {idx !== null && n > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" onClick={() => setIdx(null)}>
          <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={() => setIdx(null)} aria-label="Close"><X /></button>
          <button className="absolute left-3 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + n) % n); }} aria-label="Previous"><ChevronLeft /></button>
          <img src={data[idx].image} alt={data[idx].caption || ''} onClick={(e) => e.stopPropagation()} className="max-h-[88vh] max-w-full rounded-lg object-contain" />
          <button className="absolute right-3 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % n); }} aria-label="Next"><ChevronRight /></button>
          {data[idx].caption && <p className="absolute bottom-5 text-sm text-white/80">{data[idx].caption}</p>}
        </div>
      )}
    </>
  );
}
