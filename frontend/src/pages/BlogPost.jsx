import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../lib/api';
import { fmtDate } from '../lib/utils';
import { ErrorBox, Img, Spinner } from '../components/ui';

export default function BlogPost() {
  const { slug } = useParams();
  const { data, loading, error } = useFetch(`/blog/${slug}/`);
  if (loading) return <Spinner className="min-h-[60vh]" />;
  if (error) return <div className="py-24"><ErrorBox text="We could not find this post." /></div>;
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Link to="/blog" className="text-sm text-slate-500 hover:text-ember">← All posts</Link>
      <h1 className="mt-5 text-4xl font-bold leading-tight">{data.title}</h1>
      <p className="mt-3 text-sm text-slate-500">{fmtDate(data.created_at)}</p>
      <Img src={data.image} alt="" className="mt-8 aspect-[16/9] w-full rounded-2xl" loading="eager" />
      <div className="mt-8 whitespace-pre-line text-[17px] leading-8 text-slate-700">{data.content}</div>
    </article>
  );
}
