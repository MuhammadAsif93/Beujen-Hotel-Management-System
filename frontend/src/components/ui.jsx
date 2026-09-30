import { useEffect } from 'react';
import { Loader2, Star, X } from 'lucide-react';
import { cx } from '../lib/utils';

const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#ff6a3d'/><stop offset='1' stop-color='#1b1f3a'/></linearGradient></defs><rect width='800' height='600' fill='url(#g)'/></svg>"
  );

export function Img({ src, alt = '', className = '', ...p }) {
  return (
    <img
      src={src || FALLBACK}
      alt={alt}
      loading="lazy"
      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK; }}
      className={cx('object-cover', className)}
      {...p}
    />
  );
}

export const Spinner = ({ className = '' }) => (
  <div className={cx('flex justify-center py-20', className)} role="status" aria-label="Loading">
    <Loader2 className="h-8 w-8 animate-spin text-ember" />
  </div>
);

export function ErrorBox({ text, onRetry }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
      <p>{text}</p>
      {onRetry && <button onClick={onRetry} className="btn-dark btn-sm mt-4">Try again</button>}
    </div>
  );
}

export function Empty({ title, text, dark, children }) {
  return (
    <div className={cx('rounded-2xl border border-dashed p-10 text-center', dark ? 'border-edge text-slate-400' : 'border-slate-300 text-slate-500')}>
      <p className={cx('text-base font-semibold', dark ? 'text-slate-200' : 'text-ink')}>{title}</p>
      {text && <p className="mt-1 text-sm">{text}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function SectionTitle({ title, text, className = '' }) {
  return (
    <div className={cx('text-center', className)}>
      <h2 className="section-title text-3xl sm:text-4xl">{title}</h2>
      {text && <p className="mx-auto mt-4 max-w-xl text-sm text-slate-500">{text}</p>}
    </div>
  );
}

const STATUS = {
  waiting: 'bg-amber-500/15 text-amber-500',
  approved: 'bg-emerald-500/15 text-emerald-500',
  rejected: 'bg-red-500/15 text-red-500',
  cancelled: 'bg-slate-500/20 text-slate-400',
};
export const StatusBadge = ({ status }) => (
  <span className={cx('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize', STATUS[status])}>{status}</span>
);

export function Stars({ value = 0, size = 16 }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} width={size} height={size} className={n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
      ))}
    </span>
  );
}

export function StarInput({ value, onChange }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button type="button" key={n} onClick={() => onChange(n)} aria-label={`${n} stars`} className="rounded p-0.5">
          <Star className={cx('h-7 w-7', n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
        </button>
      ))}
    </div>
  );
}

/* ---------- Admin (dark) helpers ---------- */
export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-8" onMouseDown={onClose}>
      <div
        role="dialog" aria-modal="true" aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className={cx('a-card w-full text-slate-200 shadow-2xl', wide ? 'max-w-2xl' : 'max-w-lg')}
      >
        <div className="flex items-center justify-between border-b border-edge px-6 py-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-edge hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Confirm({ open, title, text, confirmText = 'Delete', busy, onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-slate-300">{text}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onCancel} className="a-btn bg-edge hover:bg-slate-600">Cancel</button>
        <button onClick={onConfirm} disabled={busy} className="a-btn bg-red-600 hover:bg-red-700">{busy ? 'Please wait…' : confirmText}</button>
      </div>
    </Modal>
  );
}

export const TH = 'whitespace-nowrap bg-sky px-4 py-3 text-left text-xs font-semibold text-ink';
export const TD = 'border-t border-edge px-4 py-3 align-middle text-sm text-slate-200';
