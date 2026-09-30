import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Img } from './ui';
import { useFetch } from '../lib/api';

export default function AuthShell({ title, subtitle, children, footer }) {
  const { data } = useFetch('/gallery/');
  const bg = data?.[0]?.image;
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Img src={bg} alt="" className="absolute inset-0 h-full w-full" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/40" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="max-w-sm text-3xl font-bold leading-tight">Your room is waiting above the skyline.</p>
          <p className="mt-3 max-w-sm text-sm text-white/80">Log in to book rooms, see your reservations and manage your stay.</p>
        </div>
      </div>
      <div className="flex flex-col justify-center px-6 py-12 sm:px-14">
        <div className="mx-auto w-full max-w-md">
          <Logo />
          <h1 className="mt-10 text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-center text-sm text-slate-500">{footer}</p>
          <p className="mt-6 text-center"><Link to="/" className="text-xs text-slate-400 hover:text-ember">← Back to website</Link></p>
        </div>
      </div>
    </div>
  );
}
