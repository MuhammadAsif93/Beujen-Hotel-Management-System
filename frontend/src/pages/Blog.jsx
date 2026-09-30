import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { useFetch } from '../lib/api';
import { fmtDate } from '../lib/utils';
import { Empty, ErrorBox, Img, Spinner } from '../components/ui';

export default function Blog() {
  const { data, loading, error, reload } = useFetch('/blog/');
  return (
    <>
      <div className="bg-ink py-16 text-center text-white">
        <h1 className="section-title text-4xl">Blog</h1>
        <p className="mt-5 text-sm text-slate-300">News, travel tips and updates from the hotel.</p>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {loading ? <Spinner /> : error ? <ErrorBox text={error} onRetry={reload} /> : !data.length ? <Empty title="No posts yet" text="Check back soon." /> : (
          <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="group block">
                <Img src={p.image} alt="" className="aspect-[16/10] w-full rounded-2xl" />
                <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays className="h-3.5 w-3.5" />{fmtDate(p.created_at)}</p>
                <h2 className="mt-1 text-xl font-semibold group-hover:text-ember">{p.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-slate-500">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
