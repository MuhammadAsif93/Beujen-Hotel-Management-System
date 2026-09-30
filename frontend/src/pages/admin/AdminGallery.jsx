import { useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg, useFetch } from '../../lib/api';
import { Confirm, Empty, ErrorBox, Img, Spinner } from '../../components/ui';

export default function AdminGallery() {
  const { data, loading, error, reload } = useFetch('/gallery/');
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(null);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please choose an image first.');
    setBusy(true);
    const fd = new FormData();
    fd.append('image', file);
    if (caption) fd.append('caption', caption);
    try {
      await api.post('/gallery/', fd);
      toast.success('Image added');
      setFile(null); setCaption('');
      document.getElementById('gal-file').value = '';
      reload();
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true);
    try { await api.delete(`/gallery/${del.id}/`); toast.success('Image deleted'); setDel(null); reload(); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div>
      <h1 className="mb-5 text-xl font-semibold text-white">Gallery</h1>

      <form onSubmit={upload} className="a-card mb-6 flex flex-wrap items-end gap-4 p-5">
        <div className="flex-1">
          <label className="a-label" htmlFor="gal-file">Upload image</label>
          <input id="gal-file" type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])}
            className="a-input text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-edge file:px-3 file:py-1.5 file:text-sm file:text-white" />
        </div>
        <div className="flex-1">
          <label className="a-label" htmlFor="gal-cap">Caption (optional)</label>
          <input id="gal-cap" className="a-input" value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>
        <button disabled={busy} className="a-btn bg-ember px-5 py-2.5 hover:bg-ember-dark"><Upload className="h-4 w-4" />{busy ? 'Uploading…' : 'Add image'}</button>
      </form>

      {loading ? <Spinner /> : error ? <ErrorBox text={error} onRetry={reload} /> : !data.length ? (
        <Empty dark title="No photos yet" text="Upload the hotel's first photo above." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {data.map((g) => (
            <div key={g.id} className="a-card overflow-hidden">
              <Img src={g.image} alt={g.caption || ''} className="aspect-square w-full" />
              <button onClick={() => setDel(g)} className="a-btn w-full rounded-none bg-red-600/90 py-2 hover:bg-red-700"><Trash2 className="h-3.5 w-3.5" />Delete image</button>
            </div>
          ))}
        </div>
      )}
      <Confirm open={!!del} title="Delete this image?" text="This photo will be removed from the public gallery." busy={busy} onConfirm={remove} onCancel={() => setDel(null)} />
    </div>
  );
}
