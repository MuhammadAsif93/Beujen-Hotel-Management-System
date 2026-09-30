import { useState } from 'react';
import { Mail, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg, useFetch } from '../../lib/api';
import { fmtDate } from '../../lib/utils';
import { Confirm, Empty, ErrorBox, Modal, Spinner, TD, TH } from '../../components/ui';

const BLANK = { greeting: 'Hello,', mail_body: '', action_text: '', action_url: '', end_line: 'Best regards,\nHilton Hotel' };

function SendMailForm({ msg, onDone }) {
  const [f, setF] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const { data } = await api.post(`/contact/${msg.id}/send-mail/`, f); toast.success(data.detail); onDone(); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-slate-400">Mail send to {msg.name} ({msg.email})</p>
      <div><label className="a-label" htmlFor="m-g">Greeting</label><input id="m-g" required className="a-input" value={f.greeting} onChange={set('greeting')} /></div>
      <div><label className="a-label" htmlFor="m-b">Mail body</label><textarea id="m-b" required rows={4} className="a-input resize-none" value={f.mail_body} onChange={set('mail_body')} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="a-label" htmlFor="m-at">Action text</label><input id="m-at" placeholder="e.g. View booking" className="a-input" value={f.action_text} onChange={set('action_text')} /></div>
        <div><label className="a-label" htmlFor="m-au">Action URL</label><input id="m-au" type="url" placeholder="https://…" className="a-input" value={f.action_url} onChange={set('action_url')} /></div>
      </div>
      <div><label className="a-label" htmlFor="m-e">End line</label><textarea id="m-e" rows={2} className="a-input resize-none" value={f.end_line} onChange={set('end_line')} /></div>
      <div className="flex justify-end"><button disabled={busy} className="a-btn bg-ember px-5 py-2.5 hover:bg-ember-dark"><Mail className="h-4 w-4" />{busy ? 'Sending…' : 'Send mail'}</button></div>
    </form>
  );
}

export default function AdminMessages() {
  const { data, loading, error, reload } = useFetch('/contact/');
  const [mail, setMail] = useState(null);
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try { await api.delete(`/contact/${del.id}/`); toast.success('Message deleted'); setDel(null); reload(); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const openMail = async (m) => { if (!m.is_read) { try { await api.post(`/contact/${m.id}/mark_read/`); reload(); } catch {} } setMail(m); };

  return (
    <div>
      <h1 className="mb-5 text-xl font-semibold text-white">Messages</h1>
      {loading ? <Spinner /> : error ? <ErrorBox text={error} onRetry={reload} /> : !data.length ? (
        <Empty dark title="No messages yet" text="Messages from the contact form will show up here." />
      ) : (
        <div className="a-card overflow-hidden"><div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead><tr>{['Name', 'Email', 'Phone', 'Message', 'Received', 'Send email', ''].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {data.map((m) => (
                <tr key={m.id} className={!m.is_read ? 'bg-white/[0.03]' : ''}>
                  <td className={`${TD} font-medium text-white`}>{!m.is_read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-ember" />}{m.name}</td>
                  <td className={TD}>{m.email}</td>
                  <td className={TD}>{m.phone || '—'}</td>
                  <td className={`${TD} max-w-xs`}><p className="line-clamp-2 text-slate-400">{m.message}</p></td>
                  <td className={TD}>{fmtDate(m.created_at)}</td>
                  <td className={TD}>
                    <button onClick={() => openMail(m)} className={`a-btn ${m.replied ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-emerald-600 hover:bg-emerald-700'}`}><Mail className="h-3.5 w-3.5" />{m.replied ? 'Replied' : 'Send mail'}</button>
                  </td>
                  <td className={TD}><button onClick={() => setDel(m)} className="a-btn bg-red-600 hover:bg-red-700" aria-label="Delete message"><Trash2 className="h-3.5 w-3.5" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      )}
      <Modal open={!!mail} onClose={() => setMail(null)} title="Reply by email" wide>
        {mail && <SendMailForm msg={mail} onDone={() => { setMail(null); reload(); }} />}
      </Modal>
      <Confirm open={!!del} title="Delete this message?" text={`The message from ${del?.name} will be permanently deleted.`} busy={busy} onConfirm={remove} onCancel={() => setDel(null)} />
    </div>
  );
}
