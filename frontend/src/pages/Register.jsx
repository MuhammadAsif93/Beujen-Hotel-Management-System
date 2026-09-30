import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../lib/api';
import AuthShell from '../components/AuthShell';

export default function Register() {
  const { register, user } = useAuth();
  const nav = useNavigate();
  const from = useLocation().state?.from;
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (user) return <Navigate to={from || '/'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await register(f);
      toast.success('Account created');
      nav(from || '/', { replace: true });
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <AuthShell title="Create your account" subtitle="Sign up to book rooms and track your reservations."
      footer={<>Already have an account? <Link to="/login" state={{ from }} className="font-medium text-ember">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div><label className="label" htmlFor="r-n">Full name</label><input id="r-n" required autoFocus className="input" value={f.name} onChange={set('name')} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="r-e">Email</label><input id="r-e" type="email" required className="input" value={f.email} onChange={set('email')} /></div>
          <div><label className="label" htmlFor="r-p">Phone</label><input id="r-p" required className="input" value={f.phone} onChange={set('phone')} /></div>
        </div>
        <div><label className="label" htmlFor="r-pw">Password</label><input id="r-pw" type="password" required minLength={6} className="input" value={f.password} onChange={set('password')} /><p className="mt-1 text-xs text-slate-400">At least 6 characters.</p></div>
        <button disabled={busy} className="btn-primary w-full py-3">{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
    </AuthShell>
  );
}
