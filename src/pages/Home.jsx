import { Link } from "react-router-dom";
import heroImage from "../assets/homepage.jpg";
import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Home() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    API.get("/services")
      .then((res) => setServices(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg">
      <section className="relative overflow-hidden px-6 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(166,196,13,0.28),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(21,73,40,0.12),_transparent_40%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full border border-brand-border bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-brand-muted">
              Professional Car Wash Services
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-brand-ink md:text-6xl">
              Fast, convenient, and affordable car wash booking.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-brand-muted">
              Book online in just a few clicks and track every appointment from your dashboard.
            </p>


            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/book" className="rounded-lg bg-brand-accent px-6 py-3 font-bold text-brand-ink transition hover:bg-brand-accent-strong">
                Book a Service Now
              </Link>
              <Link to="/track" className="rounded-lg border border-brand-border bg-white px-6 py-3 font-semibold text-brand-ink transition hover:bg-brand-soft">
                Track Booking
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-2 rounded-3xl bg-brand-accent/25 blur-xl" />
            <div className="relative overflow-hidden rounded-3xl border border-brand-border bg-white p-2 shadow-xl">
              <img
                src={heroImage}
                alt="Car wash service"
                className="h-[320px] w-full rounded-2xl object-cover sm:h-[420px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-3xl font-bold text-brand-ink">Featured Services</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <article key={service._id} className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm">
                {service.imageUrl && (
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="mb-4 h-40 w-full rounded-xl object-cover"
                  />
                )}
                <h3 className="text-xl font-bold text-brand-ink">{service.name}</h3>
                <p className="mt-2 text-sm text-brand-muted">{service.description}</p>
                <div className="mt-4 inline-flex rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-ink">{`GH\u20B5${service.price}`}</div>
              </article>
            ))}
            {services.length === 0 && (
              <article className="rounded-2xl border border-brand-border bg-white p-6 text-sm text-brand-muted shadow-sm md:col-span-3">
                No active services yet.
              </article>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
