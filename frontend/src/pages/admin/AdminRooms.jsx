import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg, useFetch } from '../../lib/api';
import { money } from '../../lib/utils';
import { Confirm, Empty, ErrorBox, Img, Modal, Spinner, TD, TH } from '../../components/ui';

const BLANK = { title: '', description: '', price: '', room_type: 'regular', free_wifi: 'true', capacity: 2, amenities: '', is_active: 'true' };

function RoomForm({ room, onDone, onCancel }) {
  const [f, setF] = useState(room ? {
    title: room.title, description: room.description, price: room.price, room_type: room.room_type,
    free_wifi: String(room.free_wifi), capacity: room.capacity, amenities: room.amenities, is_active: String(room.is_active),
  } : BLANK);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const preview = file ? URL.createObjectURL(file) : room?.image;

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('image', file);
    try {
      if (room) await api.patch(`/rooms/${room.id}/`, fd); else await api.post('/rooms/', fd);
      toast.success(room ? 'Room updated' : 'Room added');
      onDone();
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div><label className="a-label" htmlFor="rm-t">Room title</label><input id="rm-t" required className="a-input" value={f.title} onChange={set('title')} /></div>
      <div><label className="a-label" htmlFor="rm-d">Description</label><textarea id="rm-d" required rows={3} className="a-input resize-none" value={f.description} onChange={set('description')} /></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className="a-label" htmlFor="rm-p">Price / night ($)</label><input id="rm-p" type="number" min="1" step="0.01" required className="a-input" value={f.price} onChange={set('price')} /></div>
        <div><label className="a-label" htmlFor="rm-ty">Room type</label>
          <select id="rm-ty" className="a-input" value={f.room_type} onChange={set('room_type')}><option value="regular">Regular</option><option value="premium">Premium</option><option value="deluxe">Deluxe</option></select></div>
        <div><label className="a-label" htmlFor="rm-c">Max guests</label><input id="rm-c" type="number" min="1" required className="a-input" value={f.capacity} onChange={set('capacity')} /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="a-label" htmlFor="rm-w">Free wifi</label>
          <select id="rm-w" className="a-input" value={f.free_wifi} onChange={set('free_wifi')}><option value="true">Yes</option><option value="false">No</option></select></div>
        <div><label className="a-label" htmlFor="rm-a">Visible on website</label>
          <select id="rm-a" className="a-input" value={f.is_active} onChange={set('is_active')}><option value="true">Yes</option><option value="false">No (hidden)</option></select></div>
      </div>
      <div><label className="a-label" htmlFor="rm-am">Amenities (comma separated)</label><input id="rm-am" className="a-input" placeholder="AC, TV, Breakfast" value={f.amenities} onChange={set('amenities')} /></div>
      <div>
        <label className="a-label" htmlFor="rm-i">Room image</label>
        <div className="flex items-center gap-4">
          {preview && <Img src={preview} alt="" className="h-16 w-24 rounded-lg" />}
          <input id="rm-i" type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-edge file:px-3 file:py-2 file:text-sm file:text-white" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="a-btn bg-edge hover:bg-slate-600">Cancel</button>
        <button disabled={busy} className="a-btn bg-ember px-5 hover:bg-ember-dark">{busy ? 'Saving…' : room ? 'Save changes' : 'Add room'}</button>
      </div>
    </form>
  );
}

export default function AdminRooms() {
  const { data, loading, error, reload } = useFetch('/rooms/');
  const [sp, setSp] = useSearchParams();
  const [modal, setModal] = useState(null); // null | {} (new) | room
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (sp.get('new')) { setModal({}); setSp({}, { replace: true }); } }, [sp]); // eslint-disable-line

  const remove = async () => {
    setBusy(true);
    try { await api.delete(`/rooms/${del.id}/`); toast.success('Room deleted'); setDel(null); reload(); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Hotel rooms</h1>
        <button onClick={() => setModal({})} className="a-btn bg-ember px-4 py-2.5 hover:bg-ember-dark"><Plus className="h-4 w-4" />Add room</button>
      </div>

      {loading ? <Spinner /> : error ? <ErrorBox text={error} onRetry={reload} /> : !data.length ? (
        <Empty dark title="No rooms yet" text="Add your first room so guests can book it." />
      ) : (
        <div className="a-card overflow-hidden"><div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead><tr>{['Image', 'Room title', 'Description', 'Price', 'Wifi', 'Type', 'Guests', 'Status', ''].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id}>
                  <td className={TD}><Img src={r.image} alt="" className="h-12 w-20 rounded-lg" /></td>
                  <td className={`${TD} font-medium text-white`}>{r.title}</td>
                  <td className={`${TD} max-w-xs`}><p className="line-clamp-2 text-slate-400">{r.description}</p></td>
                  <td className={TD}>{money(r.price)}</td>
                  <td className={TD}>{r.free_wifi ? 'Yes' : 'No'}</td>
                  <td className={`${TD} capitalize`}>{r.room_type}</td>
                  <td className={TD}>{r.capacity}</td>
                  <td className={TD}><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.is_active ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/20 text-slate-400'}`}>{r.is_active ? 'Visible' : 'Hidden'}</span></td>
                  <td className={TD}>
                    <div className="flex gap-2">
                      <button onClick={() => setModal(r)} className="a-btn bg-amber-500 text-ink hover:bg-amber-400"><Pencil className="h-3.5 w-3.5" />Update</button>
                      <button onClick={() => setDel(r)} className="a-btn bg-red-600 hover:bg-red-700"><Trash2 className="h-3.5 w-3.5" />Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? 'Update room' : 'Add room'} wide>
        {modal && <RoomForm key={modal.id || 'new'} room={modal.id ? modal : null} onCancel={() => setModal(null)} onDone={() => { setModal(null); reload(); }} />}
      </Modal>
      <Confirm open={!!del} title="Delete this room?" text={`"${del?.title}" and all its bookings will be permanently deleted.`} busy={busy} onConfirm={remove} onCancel={() => setDel(null)} />
    </div>
  );
}
