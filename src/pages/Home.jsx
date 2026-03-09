import { Link } from "react-router-dom";
import heroImage from "../assets/homepage.jpg";
import { useEffect, useState } from "react";
import API from "../api/axios";
import { ServiceCardSkeleton } from "../assets/components/Skeleton";

export default function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/services")
      .then((res) => setServices(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const howItWorks = [
    { step: 1, title: "Choose Your Service", description: "Browse our range of car wash packages and select the one that fits your needs." },
    { step: 2, title: "Pick a Time", description: "Select a convenient date and time slot that works for your schedule." },
    { step: 3, title: "Relax & Wait", description: "Our professionals will notify you when your car is ready for pickup." },
  ];

  const testimonials = [
    { name: "Sarah Mensah", role: "Regular Customer", content: "I've been using CarWashPro for months now. The convenience of booking online and tracking my appointment is amazing!", rating: 5 },
    { name: "John Kofi", role: "Business Owner", content: "They handle my company fleet with exceptional care. Professional service every single time.", rating: 5 },
    { name: "Emma Owusu", role: "First-time User", content: "Was skeptical at first, but the results exceeded my expectations. My car has never looked better!", rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-brand-bg">
      <section className="relative overflow-hidden px-6 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(166,196,13,0.28),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(21,73,40,0.12),_transparent_40%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl animate-fade-in">
            <p className="mb-4 inline-flex rounded-full border border-brand-border bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-brand-muted dark:bg-brand-card dark:text-brand-ink">
              Professional Car Wash Services
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-brand-ink md:text-6xl dark:text-white">
              Fast, convenient, and affordable car wash booking.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-brand-muted dark:text-brand-soft">
              Book online in just a few clicks and track every appointment from your dashboard.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/book" className="rounded-lg bg-brand-accent px-6 py-3 font-bold text-brand-ink transition hover:bg-brand-accent-strong hover:scale-105">
                Book a Service Now
              </Link>
              <Link to="/track" className="rounded-lg border border-brand-border bg-white px-6 py-3 font-semibold text-brand-ink transition hover:bg-brand-soft dark:bg-brand-card">
                Track Booking
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-brand-muted dark:text-brand-soft">
              <div className="flex items-center gap-2"><svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg><span>Verified Services</span></div>
              <div className="flex items-center gap-2"><svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg><span>Expert Staff</span></div>
              <div className="flex items-center gap-2"><svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg><span>Fast Turnaround</span></div>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md animate-slide-in-right">
            <div className="absolute -inset-2 rounded-3xl bg-brand-accent/25 blur-xl" />
            <div className="relative overflow-hidden rounded-3xl border border-brand-border bg-white p-2 shadow-xl dark:bg-brand-card">
              <img src={heroImage} alt="Car wash service" className="h-[320px] w-full rounded-2xl object-cover sm:h-[420px]" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-white dark:bg-brand-card">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold text-brand-ink dark:text-white">How It Works</h2>
            <p className="mt-3 text-brand-muted dark:text-brand-soft">Getting your car cleaned has never been easier.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map((item, index) => (
              <div key={item.step} className={`text-center p-6 rounded-2xl border border-brand-border bg-brand-card hover-lift animate-fade-in stagger-${index + 1} dark:bg-brand-ink dark:border-brand-muted`}>
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent text-brand-ink mb-4">
                  <span className="text-2xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-brand-ink dark:text-white mb-2">{item.title}</h3>
                <p className="text-brand-muted dark:text-brand-soft">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between mb-8">
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-brand-ink dark:text-white">Featured Services</h2>
              <p className="mt-2 text-brand-muted dark:text-brand-soft">Choose from our range of professional car wash services.</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {loading ? (<><ServiceCardSkeleton /><ServiceCardSkeleton /><ServiceCardSkeleton /></>) : services.map((service, index) => (
              <article key={service._id} className={`rounded-2xl border border-brand-border bg-white p-6 shadow-sm hover-lift animate-fade-in stagger-${index + 1} dark:bg-brand-card dark:border-brand-muted`}>
                {service.imageUrl && <img src={service.imageUrl} alt={service.name} className="mb-4 h-40 w-full rounded-xl object-cover" />}
                <h3 className="text-xl font-bold text-brand-ink dark:text-white">{service.name}</h3>
                <p className="mt-2 text-sm text-brand-muted dark:text-brand-soft">{service.description}</p>
                <div className="mt-4 inline-flex rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-ink dark:bg-brand-ink dark:text-brand-accent">{`GH\u20B5${service.price}`} | {service.duration} min</div>
              </article>
            ))}
            {services.length === 0 && !loading && <article className="rounded-2xl border border-brand-border bg-white p-6 text-sm text-brand-muted md:col-span-3 dark:bg-brand-card dark:border-brand-muted dark:text-brand-soft">No active services yet.</article>}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-white dark:bg-brand-card">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold text-brand-ink dark:text-white">What Our Customers Say</h2>
            <p className="mt-3 text-brand-muted dark:text-brand-soft">Hear from our satisfied customers.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`p-6 rounded-2xl border border-brand-border bg-brand-card animate-fade-in stagger-${index + 1} dark:bg-brand-ink dark:border-brand-muted`}>
                <div className="flex gap-1 mb-3">{[...Array(testimonial.rating)].map((_, i) => <svg key={i} className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div>
                <p className="text-brand-muted dark:text-brand-soft mb-4">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent font-bold text-brand-ink">{testimonial.name.charAt(0)}</div>
                  <div><p className="font-semibold text-brand-ink dark:text-white">{testimonial.name}</p><p className="text-xs text-brand-muted dark:text-brand-soft">{testimonial.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-brand-bg">
        <div className="mx-auto max-w-4xl">
          <div className="relative rounded-3xl bg-gradient-to-br from-brand-accent to-brand-accent-strong p-8 md:p-12 text-center overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-white/20" />
            <div className="relative animate-fade-in">
              <h2 className="text-3xl font-bold text-brand-ink md:text-4xl">Ready to Get Your Car Sparkling Clean?</h2>
              <p className="mt-4 text-brand-ink/80 max-w-2xl mx-auto font-medium">Book your appointment today and experience the convenience of professional car wash services.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/book" className="rounded-lg bg-brand-ink px-8 py-3 font-bold text-white transition hover:bg-brand-ink-soft hover:scale-105 hover:shadow-lg">Book Now</Link>
                <Link to="/track" className="rounded-lg border-2 border-brand-ink bg-transparent px-8 py-3 font-semibold text-brand-ink transition hover:bg-brand-ink hover:text-white">Track Booking</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white dark:bg-[#0a0d0a] text-brand-ink dark:text-white px-6 py-12 border-t border-brand-border dark:border-brand-muted">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-accent font-bold text-brand-ink">C</span>
                <span className="text-lg font-bold dark:text-white">CarWashPro</span>
              </div>
              <p className="text-brand-muted dark:text-brand-soft max-w-sm">Your trusted partner for professional car wash services.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 dark:text-white">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-brand-muted hover:text-brand-accent dark:text-brand-soft dark:hover:text-brand-accent">Home</Link></li>
                <li><Link to="/book" className="text-brand-muted hover:text-brand-accent dark:text-brand-soft dark:hover:text-brand-accent">Book Service</Link></li>
                <li><Link to="/track" className="text-brand-muted hover:text-brand-accent dark:text-brand-soft dark:hover:text-brand-accent">Track Booking</Link></li>
                <li><Link to="/customer/auth" className="text-brand-muted hover:text-brand-accent dark:text-brand-soft dark:hover:text-brand-accent">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 dark:text-white">Contact</h4>
              <ul className="space-y-2 text-brand-muted dark:text-brand-soft">
                <li>Accra, Ghana</li>
                <li>info@carwashpro.com</li>
                <li>+233 123 456 789</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-brand-border dark:border-brand-muted text-center text-brand-muted dark:text-brand-soft text-sm">
            <p>&copy; {new Date().getFullYear()} CarWashPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

