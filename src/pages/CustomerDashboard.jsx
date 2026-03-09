import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { toast } from "../assets/components/Toast";
import { BookingCardSkeleton } from "../assets/components/Skeleton";

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
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleForm, setRescheduleForm] = useState({ date: "", time: "" });
  const [timeSlots, setTimeSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, current, past

  const loadBookings = async () => {
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

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (!rescheduleForm.date || !selectedBooking?.service?._id) {
      setTimeSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const { data } = await API.get("/bookings/available-slots", {
          params: { date: rescheduleForm.date, serviceId: selectedBooking.service._id },
        });
        setTimeSlots(data.slots || []);
      } catch (err) {
        console.error("Error fetching slots:", err);
        setTimeSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSlots, 300);
    return () => clearTimeout(timeoutId);
  }, [rescheduleForm.date, selectedBooking?.service?._id]);

  const { currentBookings, pastBookings } = useMemo(() => {
    const now = new Date();
    const current = [];
    const past = [];
    bookings.forEach((booking) => {
      const completedLike = booking.status === "Completed" || booking.status === "Rejected" || booking.status === "Cancelled";
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

  // Filter bookings based on selected filter
  const filteredBookings = useMemo(() => {
    switch (filter) {
      case "current":
        return currentBookings;
      case "past":
        return pastBookings;
      default:
        return bookings;
    }
  }, [filter, bookings, currentBookings, pastBookings]);

  const canCancel = (booking) => {
    return ["Pending", "Approved"].includes(booking.status);
  };

  const canReschedule = (booking) => {
    return ["Pending", "Approved"].includes(booking.status);
  };

  const handleCancel = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await API.patch(`/bookings/${selectedBooking._id}/cancel`, {
        reason: cancelReason,
      });
      toast("Booking cancelled successfully", "success");
      setShowCancelModal(false);
      setCancelReason("");
      setSelectedBooking(null);
      loadBookings();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to cancel booking", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedBooking || !rescheduleForm.date || !rescheduleForm.time) return;
    setActionLoading(true);
    try {
      await API.patch(`/bookings/${selectedBooking._id}/reschedule`, {
        date: rescheduleForm.date,
        time: rescheduleForm.time,
      });
      toast("Booking rescheduled successfully. Please wait for admin approval.", "success");
      setShowRescheduleModal(false);
      setRescheduleForm({ date: "", time: "" });
      setSelectedBooking(null);
      loadBookings();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to reschedule booking", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split("T")[0];
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

  // Status timeline for each booking
  const StatusTimeline = ({ booking }) => {
    const steps = [
      { status: "Pending", label: "Submitted" },
      { status: "Approved", label: "Approved" },
      { status: "In Progress", label: "In Progress" },
      { status: "Completed", label: "Completed" },
    ];

    const currentIndex = steps.findIndex(s => s.status === booking.status);
    // Handle cancelled/rejected
    if (["Cancelled", "Rejected"].includes(booking.status)) {
      return (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-700 font-medium">
            {booking.status}
          </span>
          {booking.cancellationReason && (
            <span className="text-brand-muted">- {booking.cancellationReason}</span>
          )}
        </div>
      );
    }

    return (
      <div className="mt-3 flex items-center gap-1">
        {steps.map((step, index) => (
          <div key={step.status} className="flex items-center">
            <div 
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                index < currentIndex 
                  ? "bg-emerald-500 text-white" 
                  : index === currentIndex 
                  ? "bg-brand-accent text-brand-ink" 
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {index < currentIndex ? "✓" : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div 
                className={`h-0.5 w-4 ${
                  index < currentIndex ? "bg-emerald-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderBookingCard = (booking, index) => (
    <div 
      key={booking._id} 
      className={`rounded-xl border border-brand-border bg-white p-4 shadow-sm hover-lift animate-fade-in stagger-${(index % 5) + 1}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold tracking-wide text-brand-muted">{booking.bookingReference}</p>
          <h4 className="mt-1 text-lg font-bold text-brand-ink">{booking.service?.name || "Service"}</h4>
          <p className="text-sm text-brand-muted">
            {prettyDate(booking.date)} at {booking.time}
          </p>
          {(booking.vehicleMake || booking.vehicleModel || booking.vehiclePlate) && (
            <p className="mt-1 text-xs text-brand-muted">
              Vehicle: {[booking.vehicleMake, booking.vehicleModel, booking.vehiclePlate].filter(Boolean).join(" - ")}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {statusBadge(booking.status)}
          {canCancel(booking) && (
            <button
              onClick={() => {
                setSelectedBooking(booking);
                setShowCancelModal(true);
              }}
              className="rounded-md bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200 transition-colors"
            >
              Cancel
            </button>
          )}
          {canReschedule(booking) && (
            <button
              onClick={() => {
                setSelectedBooking(booking);
                setRescheduleForm({ date: "", time: "" });
                setTimeSlots([]);
                setShowRescheduleModal(true);
              }}
              className="rounded-md bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-ink hover:bg-brand-accent transition-colors"
            >
              Reschedule
            </button>
          )}
        </div>
      </div>
      
      {/* Status Timeline */}
      <StatusTimeline booking={booking} />

      {booking.notes && (
        <div className="mt-3 rounded-lg bg-brand-card p-2">
          <p className="text-xs font-semibold text-brand-muted">Notes:</p>
          <p className="text-sm text-brand-ink">{booking.notes}</p>
        </div>
      )}
      {booking.rescheduledAt && (
        <p className="mt-2 text-xs text-amber-600">Rescheduled on {prettyDate(booking.rescheduledAt)}</p>
      )}
      {booking.cancelledAt && (
        <p className="mt-2 text-xs text-rose-600">
          Cancelled on {prettyDate(booking.cancelledAt)}
          {booking.cancellationReason && ` - ${booking.cancellationReason}`}
        </p>
      )}
    </div>
  );

  // Empty state component
  const EmptyState = ({ type }) => {
    const content = {
      all: {
        title: "No Bookings Yet",
        description: "You haven't made any bookings yet. Book your first car wash service now!",
        action: "Book a Service",
        link: "/book",
        icon: (
          <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
      },
      current: {
        title: "No Current Bookings",
        description: "You don't have any active bookings. Book a service to get started!",
        action: "Book a Service",
        link: "/book",
        icon: (
          <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
      past: {
        title: "No Past Bookings",
        description: "Your completed bookings will appear here.",
        action: null,
        link: null,
        icon: (
          <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    };

    const { title, description, action, link, icon } = content[type];

    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
        <div className="text-brand-soft mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-brand-ink mb-2">{title}</h3>
        <p className="text-brand-muted text-center max-w-md mb-4">{description}</p>
        {action && link && (
          <Link
            to={link}
            className="rounded-lg bg-brand-accent px-6 py-2 font-bold text-brand-ink transition-all hover:bg-brand-accent-strong hover:scale-105"
          >
            {action}
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-brand-ink">My Bookings</h2>
              <p className="mt-2 text-sm text-brand-muted">Track your current and past car wash bookings.</p>
            </div>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-accent px-4 py-2 font-bold text-brand-ink transition-all hover:bg-brand-accent-strong hover:scale-105"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Booking
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="mt-4 flex gap-2 flex-wrap">
            {[
              { id: "all", label: "All", count: bookings.length },
              { id: "current", label: "Current", count: currentBookings.length },
              { id: "past", label: "Past", count: pastBookings.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  filter === tab.id
                    ? "bg-brand-accent text-brand-ink shadow-md"
                    : "bg-brand-soft text-brand-muted hover:bg-brand-accent hover:text-brand-ink"
                }`}
              >
                {tab.label}
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  filter === tab.id ? "bg-white/30" : "bg-white/50"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700 animate-fade-in">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <BookingCardSkeleton />
            <BookingCardSkeleton />
          </div>
        ) : (
          <>
            {filteredBookings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredBookings.map((booking, index) => renderBookingCard(booking, index))}
              </div>
            ) : (
              <div className="rounded-2xl border border-brand-border bg-white p-4">
                <EmptyState type={filter} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-brand-border bg-white p-6 shadow-xl animate-scale-in">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-ink">Cancel Booking</h3>
              <p className="mt-2 text-sm text-brand-muted">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-sm font-semibold text-brand-muted">Reason (optional)</label>
              <textarea
                className="w-full rounded-lg border border-brand-border p-3 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                rows={3}
                placeholder="Why are you cancelling?"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                  setSelectedBooking(null);
                }}
                className="flex-1 rounded-lg border border-brand-border py-2 font-semibold text-brand-muted hover:bg-brand-card transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex-1 rounded-lg bg-rose-600 py-2 font-bold text-white hover:bg-rose-700 disabled:opacity-60 transition-colors"
              >
                {actionLoading ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-brand-border bg-white p-6 shadow-xl animate-scale-in">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft">
                <svg className="h-6 w-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-ink">Reschedule Booking</h3>
              <p className="mt-2 text-sm text-brand-muted">
                Reference: {selectedBooking.bookingReference}
              </p>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-brand-muted">New Date</label>
                <input
                  type="date"
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full rounded-lg border border-brand-border p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                  value={rescheduleForm.date}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value, time: "" })}
                />
              </div>
              {rescheduleForm.date && (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-brand-muted">
                    New Time {slotsLoading && "(loading...)"}
                  </label>
                  {timeSlots.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto rounded-lg border border-brand-border p-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setRescheduleForm({ ...rescheduleForm, time: slot.time })}
                          className={`rounded-md py-2 text-xs font-semibold transition-all ${
                            rescheduleForm.time === slot.time
                              ? "bg-brand-accent text-brand-ink shadow-md"
                              : slot.available
                              ? "bg-brand-soft text-brand-ink hover:bg-brand-accent"
                              : "cursor-not-allowed bg-gray-100 text-gray-400 line-through"
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-brand-muted">Select a date to see available times</p>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setRescheduleForm({ date: "", time: "" });
                  setSelectedBooking(null);
                }}
                className="flex-1 rounded-lg border border-brand-border py-2 font-semibold text-brand-muted hover:bg-brand-card transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={actionLoading || !rescheduleForm.date || !rescheduleForm.time}
                className="flex-1 rounded-lg bg-brand-accent py-2 font-bold text-brand-ink hover:bg-brand-accent-strong disabled:opacity-60 transition-colors"
              >
                {actionLoading ? "Rescheduling..." : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

