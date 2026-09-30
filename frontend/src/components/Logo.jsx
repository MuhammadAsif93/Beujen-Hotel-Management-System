import { Link } from 'react-router-dom';

export function LogoMark({ className = 'h-8 w-6' }) {
  return (
    <svg viewBox="0 0 24 32" className={className} aria-hidden="true">
      <path d="M12 0l2.4 7C20 15 20.5 23 19 32h-5V21c-.6-2.6-3.4-2.6-4 0v11H5C3.5 23 4 15 9.6 7z" fill="#ff3d00" />
      <path d="M12 6l1.2 3.6c-.8 5-.8 9-1.2 13-.4-4-.4-8-1.2-13z" fill="#fff" opacity=".85" />
    </svg>
  );
}

export default function Logo({ light, to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2" aria-label="Hilton home">
      <LogoMark />
      <span className={`text-2xl font-bold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>Hilton</span>
    </Link>
  );
}
