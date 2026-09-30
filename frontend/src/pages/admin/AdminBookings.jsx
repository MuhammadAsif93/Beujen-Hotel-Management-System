import { useMemo, useState } from 'react';
import { Check, Search, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg, useFetch } from '../../lib/api';
import { fmtDate, money } from '../../lib/utils';
import { Confirm, Empty, ErrorBox, Img, Spinner, StatusBadge, TD, TH } from '../../components/ui';

const TABS = [['', 'All'], ['waiting', 'Waiting'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['cancelled', 'Cancelled']];

export default function AdminBookings() {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const { data, loading, error, reload } = useFetch(`/bookings/${status ? `?status=${status}` : ''}`);
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data || []).filter((b) => !s || [b.name, b.email, b.phone, b.room_title, String(b.id)].some((x) => x?.toLowerCase().includes(s)));
  }, [data, q]);

  const act = async (b, what) => {
    try { await api.post(`/bookings/${b.id}/${what}/`); toast.success(what === 'approve' ? 'Booking approved' : 'Booking rejected'); reload(); }
    catch (e) { toast.error(errMsg(e)); }
  };
  const remove = async () => {
    setBusy(true);
    try { await api.delete(`/bookings/${del.id}/`); toast.success('Booking deleted'); setDel(null); reload(); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div>
      <h1 className="mb-5 text-xl font-semibold text-white">Bookings</h1>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {TABS.map(([v, l]) => (
            <button key={v} onClick={() => setStatus(v)} className={`rounded-full px-4 py-1.5 text-sm font-medium ${status === v ? 'bg-ember text-white' : 'bg-panel text-slate-400 hover:text-white'}`}>{l}</button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input aria-label="Search bookings" placeholder="Search name, email, room…" value={q} onChange={(e) => setQ(e.target.value)} className="a-input pl-9" />
        </div>
      </div>

      {loading ? <Spinner /> : error ? <ErrorBox text={error} onRetry={reload} /> : !rows.length ? <Empty dark title="No bookings found" text="Bookings from guests will show up here." /> : (
        <div className="a-card overflow-hidden"><div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead><tr>{['ID', 'Customer', 'Email', 'Phone', 'Arrival', 'Leaving', 'Status', 'Room', 'Total', 'Image', 'Actions'].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <td className={TD}>#{b.id}</td>
                  <td className={`${TD} font-medium text-white`}>{b.name}</td>
                  <td className={TD}>{b.email}</td>
                  <td className={TD}>{b.phone}</td>
                  <td className={`${TD} whitespace-nowrap`}>{fmtDate(b.start_date)}</td>
                  <td className={`${TD} whitespace-nowrap`}>{fmtDate(b.end_date)}</td>
                  <td className={TD}><StatusBadge status={b.status} /></td>
                  <td className={TD}>{b.room_title}<p className="text-xs text-slate-500">{money(b.price)} / night</p></td>
                  <td className={`${TD} font-medium`}>{money(b.total_price)}</td>
                  <td className={TD}><Img src={b.room_image} alt="" className="h-10 w-16 rounded-md" /></td>
                  <td className={TD}>
                    <div className="flex gap-2">
                      {b.status !== 'approved' && <button onClick={() => act(b, 'approve')} className="a-btn bg-emerald-600 hover:bg-emerald-700"><Check className="h-3.5 w-3.5" />Approve</button>}
                      {['waiting', 'approved'].includes(b.status) && <button onClick={() => act(b, 'reject')} className="a-btn bg-amber-500 text-ink hover:bg-amber-400"><X className="h-3.5 w-3.5" />Reject</button>}
                      <button onClick={() => setDel(b)} className="a-btn bg-red-600 hover:bg-red-700" aria-label={`Delete booking ${b.id}`}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      )}
      <Confirm open={!!del} title="Delete this booking?" text={`Booking #${del?.id} by ${del?.name} will be permanently deleted.`} busy={busy} onConfirm={remove} onCancel={() => setDel(null)} />
    </div>
  );
}
