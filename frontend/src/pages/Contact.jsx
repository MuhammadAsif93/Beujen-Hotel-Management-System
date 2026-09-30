import ContactSection from '../components/ContactSection';

export default function Contact() {
  return (
    <>
      <div className="bg-ink py-16 text-center text-white">
        <h1 className="section-title text-4xl">Contact us</h1>
        <p className="mt-5 text-sm text-slate-300">We usually reply within one working day.</p>
      </div>
      <ContactSection hideTitle />
    </>
  );
}
