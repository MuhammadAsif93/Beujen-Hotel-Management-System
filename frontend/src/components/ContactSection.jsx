import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, MapPin, Phone } from 'lucide-react';
import api, { errMsg } from '../lib/api';
import { SectionTitle } from './ui';
import { HOTEL } from '../lib/config';

export default function ContactSection({ hideTitle }) {
  const empty = { name: '', email: '', phone: '', message: '' };
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/contact/', f);
      toast.success(data.detail);
      setF(empty);
    } catch (err) {
      toast.error(errMsg(err));
    } finally { setBusy(false); }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      {!hideTitle && <SectionTitle title="Contact us" text="Questions about a stay, an event or a special request? Send us a message and we will reply by email." />}
      <div className={`${hideTitle ? '' : 'mt-14 '}grid gap-8 lg:grid-cols-2`}>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label" htmlFor="c-name">Name</label><input id="c-name" required className="input" value={f.name} onChange={set('name')} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="c-email">Email</label><input id="c-email" type="email" required className="input" value={f.email} onChange={set('email')} /></div>
            <div><label className="label" htmlFor="c-phone">Phone number</label><input id="c-phone" className="input" value={f.phone} onChange={set('phone')} /></div>
          </div>
          <div><label className="label" htmlFor="c-msg">Message</label><textarea id="c-msg" required rows={5} className="input resize-none" value={f.message} onChange={set('message')} /></div>
          <button disabled={busy} className="btn-primary px-8">{busy ? 'Sending…' : 'Send message'}</button>
        </form>

        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <iframe
              title="Hotel location"
              className="h-72 w-full lg:h-full lg:min-h-[320px]"
              loading="lazy"
              src={`https://www.google.com/maps?q=${encodeURIComponent(HOTEL.mapQuery)}&output=embed`}
            />
          </div>
          <ul className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-ember" />{HOTEL.address}</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0 text-ember" />{HOTEL.phone}</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-ember" />{HOTEL.email}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
