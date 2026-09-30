import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg, useFetch } from '../../lib/api';
import { fmtDate } from '../../lib/utils';
import { Confirm, Empty, ErrorBox, Img, Modal, Spinner, TD, TH } from '../../components/ui';

const BLANK = { title: '', excerpt: '', content: '', published: 'true' };

function PostForm({ post, onDone, onCancel }) {
  const [f, setF] = useState(post ? { title: post.title, excerpt: post.excerpt, content: post.content, published: String(post.published) } : BLANK);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const preview = file ? URL.createObjectURL(file) : post?.image;

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('image', file);
    try {
      if (post) await api.patch(`/blog/${post.slug}/`, fd); else await api.post('/blog/', fd);
      toast.success(post ? 'Post updated' : 'Post published');
      onDone();
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div><label className="a-label" htmlFor="bp-t">Title</label><input id="bp-t" required className="a-input" value={f.title} onChange={set('title')} /></div>
      <div><label className="a-label" htmlFor="bp-e">Excerpt</label><input id="bp-e" className="a-input" value={f.excerpt} onChange={set('excerpt')} /></div>
      <div><label className="a-label" htmlFor="bp-c">Content</label><textarea id="bp-c" required rows={6} className="a-input resize-none" value={f.content} onChange={set('content')} /></div>
      <div><label className="a-label" htmlFor="bp-p">Status</label>
        <select id="bp-p" className="a-input" value={f.published} onChange={set('published')}><option value="true">Published</option><option value="false">Draft</option></select></div>
      <div>
        <label className="a-label" htmlFor="bp-i">Cover image</label>
        <div className="flex items-center gap-4">{preview && <Img src={preview} alt="" className="h-16 w-24 rounded-lg" />}
          <input id="bp-i" type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-edge file:px-3 file:py-2 file:text-sm file:text-white" /></div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="a-btn bg-edge hover:bg-slate-600">Cancel</button>
        <button disabled={busy} className="a-btn bg-ember px-5 hover:bg-ember-dark">{busy ? 'Saving…' : post ? 'Save changes' : 'Publish post'}</button>
      </div>
    </form>
  );
}

export default function AdminBlog() {
  const { data, loading, error, reload } = useFetch('/blog/');
  const [modal, setModal] = useState(null);
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try { await api.delete(`/blog/${del.slug}/`); toast.success('Post deleted'); setDel(null); reload(); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Blog</h1>
        <button onClick={() => setModal({})} className="a-btn bg-ember px-4 py-2.5 hover:bg-ember-dark"><Plus className="h-4 w-4" />New post</button>
      </div>
      {loading ? <Spinner /> : error ? <ErrorBox text={error} onRetry={reload} /> : !data.length ? (
        <Empty dark title="No posts yet" text="Write your first post so guests can read it." />
      ) : (
        <div className="a-card overflow-hidden"><div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead><tr>{['Cover', 'Title', 'Status', 'Published', ''].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <td className={TD}><Img src={p.image} alt="" className="h-12 w-20 rounded-lg" /></td>
                  <td className={`${TD} font-medium text-white`}>{p.title}</td>
                  <td className={TD}><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.published ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/20 text-slate-400'}`}>{p.published ? 'Published' : 'Draft'}</span></td>
                  <td className={TD}>{fmtDate(p.created_at)}</td>
                  <td className={TD}><div className="flex gap-2">
                    <button onClick={() => setModal(p)} className="a-btn bg-amber-500 text-ink hover:bg-amber-400"><Pencil className="h-3.5 w-3.5" />Update</button>
                    <button onClick={() => setDel(p)} className="a-btn bg-red-600 hover:bg-red-700"><Trash2 className="h-3.5 w-3.5" />Delete</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      )}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? 'Update post' : 'New post'} wide>
        {modal && <PostForm key={modal.id || 'new'} post={modal.id ? modal : null} onCancel={() => setModal(null)} onDone={() => { setModal(null); reload(); }} />}
      </Modal>
      <Confirm open={!!del} title="Delete this post?" text={`"${del?.title}" will be permanently deleted.`} busy={busy} onConfirm={remove} onCancel={() => setDel(null)} />
    </div>
  );
}
