import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';

export default function Login() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from;
  const [f, setF] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : from || '/'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const u = await login(f.email, f.password);
      toast.success(`Welcome back, ${u.name}`);
      nav(u.role === 'admin' ? '/admin' : from || '/', { replace: true });
    } catch (err) {
      setError(err.response?.status === 401 ? 'Email or password is incorrect.' : 'Cannot reach the server. Make sure the backend is running.');
    } finally { setBusy(false); }
  };

  return (
    <AuthShell title="Log in" subtitle="Enter your details to continue."
      footer={<>New here? <Link to="/register" state={{ from }} className="font-medium text-ember">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div><label className="label" htmlFor="l-e">Email</label><input id="l-e" type="email" required autoFocus className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div>
          <label className="label" htmlFor="l-p">Password</label>
          <div className="relative">
            <input id="l-p" type={show ? 'text' : 'password'} required className="input pr-11" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
        </div>
        <button disabled={busy} className="btn-primary w-full py-3">{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
  
    </AuthShell>
  );
}
