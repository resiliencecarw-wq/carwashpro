import { useEffect, useState } from "react";
import API from "../api/axios";
import { getAuthSession } from "../utils/auth";
import { toast } from "../assets/components/Toast";

export default function BookService() {
  const session = getAuthSession();
  const customer = session?.role === "customer" ? session.user : null;
  const [services, setServices] = useState([]);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [expandedService, setExpandedService] = useState(null);
  const [form, setForm] = useState({
    customerName: customer?.name || "",
    customerContact: customer?.contact || "",
    customerEmail: customer?.email || "",
    service: "",
    date: "",
    time: "",
    vehicleMake: "",
    vehicleModel: "",
    vehiclePlate: "",
    notes: "",
  });

  // Get minimum date (today) and max date (30 days from now)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.getFullYear() + "-" + 
           String(maxDate.getMonth() + 1).padStart(2, "0") + "-" + 
           String(maxDate.getDate()).padStart(2, "0");
  };

  useEffect(() => {
    API.get("/services")
      .then(res => setServices(res.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch available time slots when date or service changes
  useEffect(() => {
    if (!form.date || !form.service) {
      setTimeSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const { data } = await API.get("/bookings/available-slots", {
          params: { date: form.date, serviceId: form.service },
        });
        setTimeSlots(data.slots || []);
      } catch (err) {
        console.error("Error fetching slots:", err);
        setTimeSlots([]);
        toast(err.response?.data?.message || "Failed to load time slots", "error");
      } finally {
        setSlotsLoading(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchSlots, 300);
    return () => clearTimeout(timeoutId);
  }, [form.date, form.service]);

  const selectedService = services.find(s => s._id === form.service);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmDialog(false);
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
        customerName: customer?.name || "",
        customerContact: customer?.contact || "",
        customerEmail: customer?.email || "",
        service: "",
        date: "",
        time: "",
        vehicleMake: "",
        vehicleModel: "",
        vehiclePlate: "",
        notes: "",
      });
      setTimeSlots([]);
      toast("Booking submitted successfully!", "success");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error submitting booking";
      setSubmitError(errorMsg);
      toast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Calculate estimated total
  const estimatedTotal = selectedService?.price || 0;

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Services Section */}
        <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm animate-fade-in">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-muted">CarWashPro</p>
          <h2 className="mt-3 text-3xl font-bold text-brand-ink">Select a Service</h2>
          <p className="mt-2 text-brand-muted">Pick your preferred package and schedule instantly.</p>

          <div className="mt-6 space-y-3">
            {services.map((service, index) => (
              <div 
                key={service._id} 
                className={`rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                  form.service === service._id 
                    ? "border-brand-accent bg-brand-soft shadow-md" 
                    : "border-brand-border bg-brand-card hover:border-brand-accent hover:shadow-sm"
                } ${expandedService === service._id ? "ring-2 ring-brand-accent" : ""}`}
                onClick={() => {
                  setForm({ ...form, service: service._id, time: "" });
                  setExpandedService(expandedService === service._id ? null : service._id);
                }}
              >
                {service.imageUrl && (
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="mb-3 h-28 w-full rounded-lg object-cover transition-transform duration-300 hover:scale-[1.02]"
                  />
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-brand-ink">{service.name}</h3>
                    <p className="mt-1 text-sm text-brand-muted">{service.description || "Professional wash service"}</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-ink">
                      {service.price ? `GH\u20B5${service.price}` : "Contact for price"}
                    </div>
                    <p className="mt-1 text-xs text-brand-muted">{service.duration} min</p>
                  </div>
                </div>
                
                {/* Expanded Service Details */}
                {expandedService === service._id && (
                  <div className="mt-4 pt-4 border-t border-brand-border animate-fade-in">
                    <h4 className="text-sm font-semibold text-brand-ink mb-2">Service Includes:</h4>
                    <ul className="text-sm text-brand-muted space-y-1">
                      <li className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Exterior Wash
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Interior Vacuum
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Tire Cleaning
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ))}
            {services.length === 0 && (
              <div className="rounded-xl border border-brand-border bg-brand-card p-4 text-sm text-brand-muted">
                No active services available.
              </div>
            )}
          </div>
        </section>

        {/* Booking Form Section */}
        <form onSubmit={(e) => { e.preventDefault(); setShowConfirmDialog(true); }} className="space-y-4 rounded-2xl border border-brand-border bg-white p-7 shadow-sm animate-slide-in-right">
          <h3 className="text-2xl font-bold text-brand-ink">Book Your Service</h3>
          {!customer && (
            <p className="rounded-lg border border-brand-border bg-brand-card p-3 text-sm text-brand-muted flex items-center gap-2">
              <svg className="h-4 w-4 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tip: Login as a customer to auto-save this booking to your dashboard.
            </p>
          )}
          {createdBooking && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 animate-scale-in">
              Booking submitted successfully. Reference:{" "}
              <span className="font-bold">{createdBooking.bookingReference}</span>
            </div>
          )}

          {/* Booking Summary Sidebar (Mobile) */}
          <div className="lg:hidden">
            <div className="rounded-lg bg-brand-card p-4 mb-4">
              <h4 className="font-semibold text-brand-ink mb-2">Booking Summary</h4>
              {selectedService ? (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Service:</span>
                    <span className="text-brand-ink font-medium">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Duration:</span>
                    <span className="text-brand-ink">{selectedService.duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Date:</span>
                    <span className="text-brand-ink">{form.date || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Time:</span>
                    <span className="text-brand-ink">{form.time || "Not selected"}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-brand-border flex justify-between font-bold">
                    <span className="text-brand-ink">Total:</span>
                    <span className="text-brand-accent">GH\u20B5{estimatedTotal}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-brand-muted">Select a service to see summary</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-muted">Selected Service</label>
            <select
              className="w-full rounded-lg border border-brand-border bg-white p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value, time: "" })}
              required
            >
              <option value="">Select Service</option>
              {services.map(service => (
                <option key={service._id} value={service._id}>
                  {service.name} - GH\u20B5{service.price}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-brand-muted">Select Date</label>
              <input
                type="date"
                min={getMinDate()}
                max={getMaxDate()}
                className="w-full rounded-lg border border-brand-border bg-white p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value, time: "" })}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-brand-muted">
                Select Time
                {slotsLoading && <span className="ml-2 text-xs font-normal text-brand-muted">Loading...</span>}
              </label>
              {form.date && form.service ? (
                timeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto rounded-lg border border-brand-border p-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setForm({ ...form, time: slot.time })}
                        className={`rounded-md py-2 text-xs font-semibold transition-all ${
                          form.time === slot.time
                            ? "bg-brand-accent text-brand-ink shadow-md"
                            : slot.available
                            ? "bg-brand-soft text-brand-ink hover:bg-brand-accent hover:text-brand-ink"
                            : "cursor-not-allowed bg-gray-100 text-gray-400 line-through"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="time"
                    className="w-full rounded-lg border border-brand-border bg-white p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    required
                  />
                )
              ) : (
                <input
                  type="time"
                  disabled
                  placeholder="Select date first"
                  className="w-full rounded-lg border border-brand-border bg-gray-50 p-3 text-brand-muted cursor-not-allowed"
                />
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-brand-muted">Customer Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full rounded-lg border border-brand-border bg-white p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-brand-muted">Contact (Email or Phone)</label>
              <input
                type="text"
                placeholder="john@email.com or +233..."
                className="w-full rounded-lg border border-brand-border bg-white p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
                value={form.customerContact}
                onChange={(e) => setForm({ ...form, customerContact: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-muted">Email Address (Optional)</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-brand-border bg-white p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
              value={form.customerEmail}
              onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
            />
          </div>

          {/* Vehicle Information */}
          <div className="border-t border-brand-border pt-4">
            <h4 className="mb-3 text-sm font-bold text-brand-ink flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Vehicle Information (Optional)
            </h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-muted">Make</label>
                <input
                  type="text"
                  placeholder="Toyota"
                  className="w-full rounded-lg border border-brand-border bg-white p-2 text-sm text-brand-ink focus:border-brand-accent focus:outline-none transition-all"
                  value={form.vehicleMake}
                  onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-muted">Model</label>
                <input
                  type="text"
                  placeholder="Camry"
                  className="w-full rounded-lg border border-brand-border bg-white p-2 text-sm text-brand-ink focus:border-brand-accent focus:outline-none transition-all"
                  value={form.vehicleModel}
                  onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-muted">Plate Number</label>
                <input
                  type="text"
                  placeholder="GT-1234"
                  className="w-full rounded-lg border border-brand-border bg-white p-2 text-sm text-brand-ink focus:border-brand-accent focus:outline-none transition-all"
                  value={form.vehiclePlate}
                  onChange={(e) => setForm({ ...form, vehiclePlate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-muted">Special Instructions (Optional)</label>
            <textarea
              placeholder="Any special requests or areas you'd like us to focus on..."
              rows={2}
              className="w-full rounded-lg border border-brand-border bg-white p-3 text-sm text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {submitError && (
            <p className="text-sm font-semibold text-rose-600 animate-fade-in">{submitError}</p>
          )}

          {/* Desktop Booking Summary */}
          <div className="hidden lg:block rounded-lg bg-brand-card p-4 mt-4">
            <h4 className="font-semibold text-brand-ink mb-2">Booking Summary</h4>
            {selectedService ? (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Service:</span>
                  <span className="text-brand-ink font-medium">{selectedService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Duration:</span>
                  <span className="text-brand-ink">{selectedService.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Date:</span>
                  <span className="text-brand-ink">{form.date || "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Time:</span>
                  <span className="text-brand-ink">{form.time || "Not selected"}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-brand-border flex justify-between font-bold">
                  <span className="text-brand-ink">Total:</span>
                  <span className="text-brand-accent">GH\u20B5{estimatedTotal}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-brand-muted">Select a service to see summary</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || slotsLoading}
            className="w-full rounded-lg bg-brand-accent py-3 font-bold text-brand-ink transition-all duration-300 hover:bg-brand-accent-strong hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? "Submitting..." : "Confirm Booking"}
          </button>
        </form>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-brand-border bg-white p-6 shadow-xl animate-scale-in">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft">
                <svg className="h-6 w-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-ink">Confirm Your Booking</h3>
              <p className="mt-2 text-sm text-brand-muted">Please review your booking details before confirming.</p>
            </div>

            <div className="mt-4 rounded-lg bg-brand-card p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-muted">Service:</span>
                <span className="text-brand-ink font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Date:</span>
                <span className="text-brand-ink">{form.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Time:</span>
                <span className="text-brand-ink">{form.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Customer:</span>
                <span className="text-brand-ink">{form.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Contact:</span>
                <span className="text-brand-ink">{form.customerContact}</span>
              </div>
              {(form.vehicleMake || form.vehicleModel || form.vehiclePlate) && (
                <div className="flex justify-between">
                  <span className="text-brand-muted">Vehicle:</span>
                  <span className="text-brand-ink">
                    {[form.vehicleMake, form.vehicleModel, form.vehiclePlate].filter(Boolean).join(" ")}
                  </span>
                </div>
              )}
              <div className="pt-2 mt-2 border-t border-brand-border flex justify-between font-bold">
                <span className="text-brand-ink">Total Amount:</span>
                <span className="text-brand-accent">GH\u20B5{estimatedTotal}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 rounded-lg border border-brand-border py-2 font-semibold text-brand-muted hover:bg-brand-card transition-colors"
              >
                Edit Booking
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 rounded-lg bg-brand-accent py-2 font-bold text-brand-ink hover:bg-brand-accent-strong transition-colors disabled:opacity-60"
              >
                {loading ? "Confirming..." : "Confirm & Book"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

