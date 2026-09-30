export const money = (n) => `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
export const todayISO = () => new Date().toLocaleDateString('en-CA');
export const addDaysISO = (iso, n) => {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-CA');
};
export const nightsBetween = (a, b) => (a && b ? Math.round((new Date(b) - new Date(a)) / 86400000) : 0);
export const fmtDate = (iso) =>
  iso ? new Date(iso.length === 10 ? iso + 'T00:00:00' : iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
export const cx = (...a) => a.filter(Boolean).join(' ');
