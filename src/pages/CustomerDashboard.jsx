import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

function normalizeDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function prettyDate(value) {
  const d = normalizeDate(value);
  return d ? d.toLocaleDateString() : value || "-";
}

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await API.get("/bookings/my");
        setBookings(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const { currentBookings, pastBookings } = useMemo(() => {
    const now = new Date();
    const current = [];
    const past = [];
    bookings.forEach((booking) => {
      const completedLike = booking.status === "Completed" || booking.status === "Rejected";
      const bookingDate = normalizeDate(booking.date);
      const isPastDate = bookingDate ? bookingDate < now : false;
      if (completedLike || isPastDate) {
        past.push(booking);
      } else {
        current.push(booking);
      }
    });
    return { currentBookings: current, pastBookings: past };
  }, [bookings]);

  const renderBookingCard = (booking) => (
    <div key={booking._id} className="rounded-xl border border-brand-border bg-white p-4 shadow-sm">
      <p className="text-xs font-bold tracking-wide text-brand-muted">{booking.bookingReference}</p>
      <h4 className="mt-1 text-lg font-bold text-brand-ink">{booking.service?.name || "Service"}</h4>
      <p className="text-sm text-brand-muted">
        {prettyDate(booking.date)} at {booking.time}
      </p>
      <p className="mt-2 inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-ink">
        {booking.status}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm">
          <h2 className="text-3xl font-bold text-brand-ink">My Bookings</h2>
          <p className="mt-2 text-sm text-brand-muted">Track your current and past car wash bookings.</p>
        </div>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
        {loading && <p className="text-sm font-semibold text-brand-muted">Loading bookings...</p>}

        {!loading && (
          <>
            <section>
              <h3 className="mb-3 text-xl font-bold text-brand-ink">Current Bookings</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {currentBookings.length > 0 ? currentBookings.map(renderBookingCard) : (
                  <p className="rounded-xl border border-brand-border bg-white p-4 text-sm text-brand-muted">No current bookings.</p>
                )}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-xl font-bold text-brand-ink">Past Bookings</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {pastBookings.length > 0 ? pastBookings.map(renderBookingCard) : (
                  <p className="rounded-xl border border-brand-border bg-white p-4 text-sm text-brand-muted">No past bookings yet.</p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
