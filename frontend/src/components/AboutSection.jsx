import { Link } from 'react-router-dom';
import { Img } from './ui';

export default function AboutSection({ images = [], full }) {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
      <div>
        <h2 className="section-title ml-4 text-3xl sm:text-4xl">About </h2>
        <p className="mt-8 max-w-lg text-[15px] leading-7 text-slate-600">
          Hilton is a city hotel built around one idea: a good night's sleep with a view. Every room faces the skyline, the beds are made up fresh each morning, and the rooftop pool stays open late.
        </p>
        <p className="mt-4 max-w-lg text-[15px] leading-7 text-slate-600">
          {full
            ? 'Choose a Regular room for a quiet base, Premium for extra space and breakfast, or a Deluxe suite when you want the whole floor-to-ceiling window. Book online, pay at the hotel, and our front desk handles the rest.'
            : 'Choose from Regular, Premium and Deluxe rooms, book online in a minute and pay at the hotel.'}
        </p>
        {!full && <Link to="/about" className="btn-dark mt-8">Read more</Link>}
      </div>
      <div className="grid grid-cols-5 grid-rows-2 gap-4">
        <Img src={images[0]} alt="Hotel pool at night" className="col-span-3 row-span-2 h-full min-h-[320px] w-full rounded-2xl" />
        <Img src={images[1]} alt="Hotel interior" className="col-span-2 h-40 w-full rounded-2xl" />
        <Img src={images[2]} alt="Hotel lounge" className="col-span-2 h-40 w-full rounded-2xl" />
      </div>
    </section>
  );
}
