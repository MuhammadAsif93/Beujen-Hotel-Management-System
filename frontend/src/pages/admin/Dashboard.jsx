import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Banknote, CalendarCheck, Clock, Hotel, Inbox, Mail, Users, CalendarDays } from 'lucide-react';
import { useFetch } from '../../lib/api';
import { fmtDate, money } from '../../lib/utils';
import { Empty, ErrorBox, Spinner, StatusBadge, TD, TH } from '../../components/ui';

const tip = { contentStyle: { background: '#12162a', border: '1px solid #2a3150', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }, cursor: { fill: 'rgba(255,255,255,.04)' } };
const axis = { stroke: '#64748b', fontSize: 12, tickLine: false, axisLine: false };
const STATUS_COLOR = { waiting: '#f59e0b', approved: '#10b981', rejected: '#ef4444', cancelled: '#64748b' };

function Stat({ icon: Icon, label, value, color, to }) {
  return (
    <Link to={to} className="a-card flex items-center gap-4 p-5 transition-colors hover:border-slate-600">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: color + '26', color }}><Icon className="h-6 w-6" /></span>
      <div><p className="text-sm text-slate-400">{label}</p><p className="text-2xl font-bold text-white">{value}</p></div>
    </Link>
  );
}

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch('/admin/stats/');
  if (loading) return <Spinner />;
  if (error) return <ErrorBox text={error} onRetry={reload} />;
  const c = data.cards;
  const pie = Object.entries(data.status_breakdown).map(([name, value]) => ({ name, value })).filter((x) => x.value > 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-white">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Banknote} label="Revenue (approved)" value={money(c.revenue)} color="#a78bfa" to="/admin/bookings" />
        <Stat icon={CalendarCheck} label="Total bookings" value={c.total_bookings} color="#38bdf8" to="/admin/bookings" />
        <Stat icon={Clock} label="Waiting for approval" value={c.pending_bookings} color="#f59e0b" to="/admin/bookings" />
        <Stat icon={Hotel} label="Rooms" value={c.total_rooms} color="#ff3d00" to="/admin/rooms" />
        <Stat icon={Users} label="Registered guests" value={c.total_users} color="#34d399" to="/admin/bookings" />
        <Stat icon={CalendarDays} label="Approved bookings" value={c.approved_bookings} color="#10b981" to="/admin/bookings" />
        <Stat icon={Inbox} label="Unread messages" value={c.unread_messages} color="#f472b6" to="/admin/messages" />
        <Stat icon={Mail} label="Newsletter subscribers" value={c.subscribers} color="#fb923c" to="/admin/messages" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="a-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Bookings per month</h2>
          {data.monthly.length ? (
            <div className="h-64"><ResponsiveContainer><BarChart data={data.monthly}>
              <CartesianGrid stroke="#2a3150" vertical={false} /><XAxis dataKey="month" {...axis} /><YAxis allowDecimals={false} {...axis} width={28} />
              <Tooltip {...tip} /><Bar dataKey="bookings" fill="#7c5cbf" radius={[6, 6, 0, 0]} />
            </BarChart></ResponsiveContainer></div>
          ) : <Empty dark title="No data yet" />}
        </section>

        <section className="a-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Revenue per month</h2>
          {data.monthly.length ? (
            <div className="h-64"><ResponsiveContainer><LineChart data={data.monthly}>
              <CartesianGrid stroke="#2a3150" vertical={false} /><XAxis dataKey="month" {...axis} /><YAxis {...axis} width={44} tickFormatter={(v) => '$' + v} />
              <Tooltip {...tip} formatter={(v) => money(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#ff7a59" strokeWidth={2.5} dot={{ r: 4, fill: '#ff7a59' }} />
            </LineChart></ResponsiveContainer></div>
          ) : <Empty dark title="No data yet" />}
        </section>

        <section className="a-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Booking status</h2>
          {pie.length ? (
            <div className="h-64"><ResponsiveContainer><PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
                {pie.map((p) => <Cell key={p.name} fill={STATUS_COLOR[p.name]} />)}
              </Pie>
              <Tooltip {...tip} /><Legend formatter={(v) => <span className="text-xs capitalize text-slate-300">{v}</span>} />
            </PieChart></ResponsiveContainer></div>
          ) : <Empty dark title="No bookings yet" />}
        </section>
      </div>

      <section className="a-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-sm font-semibold text-white">Recent bookings</h2>
          <Link to="/admin/bookings" className="text-xs text-ember hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead><tr>{['Guest', 'Room', 'Dates', 'Total', 'Status'].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {data.recent_bookings.map((b) => (
                <tr key={b.id}>
                  <td className={TD}>{b.name}<p className="text-xs text-slate-500">{b.email}</p></td>
                  <td className={TD}>{b.room_title}</td>
                  <td className={TD}>{fmtDate(b.start_date)} to {fmtDate(b.end_date)}</td>
                  <td className={TD}>{money(b.total_price)}</td>
                  <td className={TD}><StatusBadge status={b.status} /></td>
                </tr>
              ))}
              {!data.recent_bookings.length && <tr><td colSpan={5} className={`${TD} text-center text-slate-500`}>No bookings yet</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
