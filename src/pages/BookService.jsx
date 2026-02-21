import { useEffect, useState } from "react";
import API from "../api/axios";
import { getAuthSession } from "../utils/auth";

export default function BookService() {
  const session = getAuthSession();
  const customer = session?.role === "customer" ? session.user : null;
  const [services, setServices] = useState([]);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: customer?.name || "",
    customerContact: customer?.contact || "",
    customerEmail: customer?.email || "",
    service: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    API.get("/services")
      .then(res => setServices(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        customerName: form.customerName || customer?.name || "",
        customerContact: form.customerContact || customer?.contact || "",
        customerEmail: form.customerEmail || customer?.email || "",
      };
      const { data } = await API.post("/bookings", payload);
      setCreatedBooking(data);
      setForm({
        customerName: "",
        customerContact: "",
        customerEmail: "",
        service: "",
        date: "",
        time: "",
      });
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Error submitting booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-muted">CarWashPro</p>
          <h2 className="mt-3 text-3xl font-bold text-brand-ink">Select a Service</h2>
          <p className="mt-2 text-brand-muted">Pick your preferred package and schedule instantly.</p>

          <div className="mt-6 space-y-3">
            {services.map((service) => (
              <div key={service._id} className="rounded-xl border border-brand-border bg-brand-card p-4">
                {service.imageUrl && (
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="mb-3 h-28 w-full rounded-lg object-cover"
                  />
                )}
                <h3 className="font-semibold text-brand-ink">{service.name}</h3>
                <p className="mt-1 text-sm text-brand-muted">{service.description || "Professional wash service"}</p>
                <div className="mt-3 inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-ink">
                  {service.price ? `GH\u20B5${service.price}` : "Contact for price"}
                </div>
              </div>
            ))}
            {services.length === 0 && (
              <div className="rounded-xl border border-brand-border bg-brand-card p-4 text-sm text-brand-muted">
                No active services available.
              </div>
            )}
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-brand-border bg-white p-7 shadow-sm">
          <h3 className="text-2xl font-bold text-brand-ink">Book Your Service</h3>
          {!customer && (
            <p className="rounded-lg border border-brand-border bg-brand-card p-3 text-sm text-brand-muted">
              Tip: Login as a customer to auto-save this booking to your dashboard.
            </p>
          )}
          {createdBooking && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Booking submitted successfully. Reference:{" "}
              <span className="font-bold">{createdBooking.bookingReference}</span>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-muted">Selected Service</label>
            <select
              className="w-full rounded-lg border border-brand-border bg-white p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
              value={form.service}
              onChange={(e) =>
                setForm({ ...form, service: e.target.value })
              }
              required
            >
              <option value="">Select Service</option>
              {services.map(service => (
                <option key={service._id} value={service._id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-brand-muted">Select Date</label>
              <input
                type="date"
                className="w-full rounded-lg border border-brand-border bg-white p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-brand-muted">Select Time</label>
              <input
                type="time"
                className="w-full rounded-lg border border-brand-border bg-white p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                value={form.time}
                onChange={(e) =>
                  setForm({ ...form, time: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-brand-muted">Customer Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full rounded-lg border border-brand-border bg-white p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                value={form.customerName}
                onChange={(e) =>
                  setForm({ ...form, customerName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-brand-muted">Contact (Email or Phone)</label>
              <input
                type="text"
                placeholder="john@email.com or +233..."
                className="w-full rounded-lg border border-brand-border bg-white p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                value={form.customerContact}
                onChange={(e) =>
                  setForm({ ...form, customerContact: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-muted">Email Address (Optional)</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-brand-border bg-white p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
              value={form.customerEmail}
              onChange={(e) =>
                setForm({ ...form, customerEmail: e.target.value })
              }
            />
          </div>

          {submitError && (
            <p className="text-sm font-semibold text-rose-600">{submitError}</p>
          )}

          <button
            disabled={loading}
            className="w-full rounded-lg bg-brand-accent py-3 font-bold text-brand-ink transition hover:bg-brand-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
