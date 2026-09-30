import { Link } from 'react-router-dom';
import { Star, Users, Wifi } from 'lucide-react';
import { Img } from './ui';
import { money } from '../lib/utils';

const TYPE = { regular: 'bg-white text-ink', premium: 'bg-ember text-white', deluxe: 'bg-ink text-white' };

export default function RoomCard({ room, query = '' }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Img src={room.image} alt={room.title} className="h-full w-full" />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold capitalize shadow ${TYPE[room.room_type]}`}>{room.room_type}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold leading-snug">{room.title}</h3>
          {room.avg_rating && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-medium"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{room.avg_rating}</span>
          )}
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{room.description}</p>
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{room.capacity} guests</span>
          {room.free_wifi && <span className="flex items-center gap-1.5"><Wifi className="h-4 w-4" />Free wifi</span>}
        </div>
        <div className="mt-auto flex items-center justify-between pt-5">
          <p><span className="text-2xl font-bold text-ember">{money(room.price)}</span><span className="text-xs text-slate-500"> / night</span></p>
          <Link to={`/rooms/${room.id}${query}`} className="btn-dark btn-sm">Room details</Link>
        </div>
      </div>
    </article>
  );
}
