import { useState } from "react";
import { Link } from "react-router-dom";
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

  const statusBadge = (status) => {
    const styles = {
      Pending: "bg-amber-100 text-amber-800",
      Approved: "bg-blue-100 text-blue-800",
      "In Progress": "bg-indigo-100 text-indigo-800",
      Completed: "bg-emerald-100 text-emerald-800",
      Rejected: "bg-rose-100 text-rose-800",
      Cancelled: "bg-gray-100 text-gray-800",
    };
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles[status] || "bg-slate-100 text-slate-800"}`}>
        {status}
      </span>
    );
  };

  // Status Progress Stepper Component
  const StatusStepper = ({ status }) => {
    const steps = [
      { status: "Pending", label: "Submitted", description: "Booking received" },
      { status: "Approved", label: "Approved", description: "Booking confirmed" },
      { status: "In Progress", label: "In Progress", description: "Service in progress" },
      { status: "Completed", label: "Completed", description: "Service completed" },
    ];

    const currentIndex = steps.findIndex(s => s.status === status);
    const isCancelled = status === "Cancelled" || status === "Rejected";

    if (isCancelled) {
      return (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
              <svg className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-rose-800">Booking {status}</p>
              <p className="text-sm text-rose-600">This booking has been {status.toLowerCase()}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-xl bg-brand-card p-4 animate-fade-in">
        <h4 className="text-sm font-semibold text-brand-ink mb-4">Booking Progress</h4>
        <div className="relative">
          {steps.map((step, index) => (
            <div key={step.status} className="flex items-start mb-4 last:mb-0">
              {/* Step Circle */}
              <div className="relative flex flex-col items-center">
                <div 
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    index < currentIndex 
                      ? "bg-emerald-500 text-white" 
                      : index === currentIndex 
                      ? "bg-brand-accent text-brand-ink shadow-md" 
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index < currentIndex ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div 
                    className={`absolute top-8 left-1/2 w-0.5 h-8 -translate-x-1/2 ${
                      index < currentIndex ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
              
              {/* Step Content */}
              <div className="ml-4 flex-1">
                <p className={`text-sm font-semibold ${
                  index <= currentIndex ? "text-brand-ink" : "text-gray-400"
                }`}>
                  {step.label}
                </p>
                <p className="text-xs text-brand-muted">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Get estimated completion time (simplified - would come from backend in real app)
  const getEstimatedTime = () => {
    if (!booking || booking.status === "Completed" || booking.status === "Cancelled" || booking.status === "Rejected") {
      return null;
    }
    // Estimate: if Approved, assume ~2 hours from now; if In Progress, assume ~1 hour
    const baseTime = booking.status === "In Progress" ? 60 : 120;
    return `Approximately ${baseTime} minutes`;
  };

  const estimatedTime = getEstimatedTime();

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <div className="rounded-2xl border border-brand-border bg-white p-7 shadow-sm animate-fade-in">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-brand-ink">Track Booking Status</h2>
            <p className="mt-2 text-sm text-brand-muted">Enter your booking reference and contact used during booking.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
              <div>
                <input
                  placeholder="Booking Reference (e.g. CW-123456-7890)"
                  className="w-full rounded-lg border border-brand-border p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
                  value={form.bookingReference}
                  onChange={(e) => setForm({ ...form, bookingReference: e.target.value })}
                  required
                />
              </div>
              <div>
                <input
                  placeholder="Contact (email or phone)"
                  className="w-full rounded-lg border border-brand-border p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  required
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-brand-accent px-6 py-3 font-bold text-brand-ink transition-all hover:bg-brand-accent-strong hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Checking...
                  </span>
                ) : "Track"}
              </button>
            </div>
            {error && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700 animate-fade-in">
                {error}
              </div>
            )}
          </form>
        </div>

        {booking && (
          <div className="space-y-4 animate-slide-in-right">
            {/* Status Stepper */}
            <StatusStepper status={booking.status} />

            {/* Booking Details */}
            <div className="rounded-2xl border border-brand-border bg-white p-7 shadow-sm">
              <div className="flex items-start justify-between border-b border-brand-border pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-brand-ink">Booking Details</h3>
                  <p className="mt-1 text-sm text-brand-muted">Reference: {booking.bookingReference}</p>
                </div>
                {statusBadge(booking.status)}
              </div>

              {/* Estimated Time */}
              {estimatedTime && (
                <div className="mt-4 rounded-lg bg-brand-soft p-3 flex items-center gap-2">
                  <svg className="h-5 w-5 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-brand-ink">{estimatedTime}</span>
                </div>
              )}

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-brand-muted">Customer Name</p>
                  <p className="text-brand-ink">{booking.customerName}</p>
                </div>
                <div>
                  <p className="font-semibold text-brand-muted">Contact</p>
                  <p className="text-brand-ink">{booking.customerContact}</p>
                </div>
                {booking.customerEmail && (
                  <div>
                    <p className="font-semibold text-brand-muted">Email</p>
                    <p className="text-brand-ink">{booking.customerEmail}</p>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-brand-muted">Service</p>
                  <p className="text-brand-ink">{booking.service?.name || "-"}</p>
                </div>
                <div>
                  <p className="font-semibold text-brand-muted">Date</p>
                  <p className="text-brand-ink">{formatBookingDate(booking.date)}</p>
                </div>
                <div>
                  <p className="font-semibold text-brand-muted">Time</p>
                  <p className="text-brand-ink">{booking.time}</p>
                </div>
                {booking.totalAmount > 0 && (
                  <div>
                    <p className="font-semibold text-brand-muted">Total Amount</p>
                    <p className="text-brand-ink font-bold">GH\u20B5{booking.totalAmount}</p>
                  </div>
                )}
              </div>

              {/* Vehicle Information */}
              {(booking.vehicleMake || booking.vehicleModel || booking.vehiclePlate) && (
                <div className="mt-4 rounded-lg bg-brand-card p-4">
                  <h4 className="font-semibold text-brand-ink flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Vehicle Information
                  </h4>
                  <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
                    {booking.vehicleMake && (
                      <div>
                        <p className="text-brand-muted">Make</p>
                        <p className="text-brand-ink">{booking.vehicleMake}</p>
                      </div>
                    )}
                    {booking.vehicleModel && (
                      <div>
                        <p className="text-brand-muted">Model</p>
                        <p className="text-brand-ink">{booking.vehicleModel}</p>
                      </div>
                    )}
                    {booking.vehiclePlate && (
                      <div>
                        <p className="text-brand-muted">Plate Number</p>
                        <p className="text-brand-ink">{booking.vehiclePlate}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Special Notes */}
              {booking.notes && (
                <div className="mt-4 rounded-lg bg-brand-card p-4">
                  <h4 className="font-semibold text-brand-ink flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Special Instructions
                  </h4>
                  <p className="mt-1 text-sm text-brand-muted">{booking.notes}</p>
                </div>
              )}

              {/* Reschedule Info */}
              {booking.rescheduledAt && (
                <div className="mt-4 rounded-lg bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    This booking was rescheduled on {formatBookingDate(booking.rescheduledAt)}
                  </p>
                </div>
              )}

              {/* Cancellation Info */}
              {booking.cancelledAt && (
                <div className="mt-4 rounded-lg bg-rose-50 p-4">
                  <p className="text-sm font-semibold text-rose-800 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    This booking was cancelled on {formatBookingDate(booking.cancelledAt)}
                    {booking.cancellationReason && ` - Reason: ${booking.cancellationReason}`}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 flex-wrap">
              <Link
                to="/book"
                className="rounded-lg bg-brand-accent px-4 py-2 font-bold text-brand-ink transition-all hover:bg-brand-accent-strong hover:scale-105"
              >
                Book Another Service
              </Link>
              <button
                onClick={() => {
                  setBooking(null);
                  setForm({ bookingReference: "", contact: "" });
                }}
                className="rounded-lg border border-brand-border bg-white px-4 py-2 font-semibold text-brand-muted transition-all hover:bg-brand-card"
              >
                Track Another Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

