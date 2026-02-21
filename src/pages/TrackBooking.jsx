import { useState } from "react";
import API from "../api/axios";

function formatBookingDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

export default function TrackBooking() {
  const [form, setForm] = useState({ bookingReference: "", contact: "" });
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBooking(null);
    setLoading(true);
    try {
      const { data } = await API.get(
        `/bookings/track/${encodeURIComponent(form.bookingReference.trim())}`,
        { params: { contact: form.contact.trim() } }
      );
      setBooking(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not find this booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <div className="rounded-2xl border border-brand-border bg-white p-7 shadow-sm">
          <h2 className="text-3xl font-bold text-brand-ink">Track Booking Status</h2>
          <p className="mt-2 text-sm text-brand-muted">Enter your booking reference and contact used during booking.</p>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <input
              placeholder="Booking Reference (e.g. CW-123456-7890)"
              className="rounded-lg border border-brand-border p-3 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
              value={form.bookingReference}
              onChange={(e) => setForm({ ...form, bookingReference: e.target.value })}
              required
            />
            <input
              placeholder="Contact (email or phone)"
              className="rounded-lg border border-brand-border p-3 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              required
            />
            <button
              type="submit"
              className="rounded-lg bg-brand-accent px-6 py-3 font-bold text-brand-ink transition hover:bg-brand-accent-strong"
              disabled={loading}
            >
              {loading ? "Checking..." : "Track"}
            </button>
          </form>
          {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
        </div>

        {booking && (
          <div className="rounded-2xl border border-brand-border bg-white p-7 shadow-sm">
            <h3 className="text-2xl font-bold text-brand-ink">Booking Details</h3>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <p><span className="font-semibold text-brand-ink">Reference:</span> {booking.bookingReference}</p>
              <p><span className="font-semibold text-brand-ink">Status:</span> {booking.status}</p>
              <p><span className="font-semibold text-brand-ink">Customer:</span> {booking.customerName}</p>
              <p><span className="font-semibold text-brand-ink">Service:</span> {booking.service?.name || "-"}</p>
              <p><span className="font-semibold text-brand-ink">Date:</span> {formatBookingDate(booking.date)}</p>
              <p><span className="font-semibold text-brand-ink">Time:</span> {booking.time}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
