import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { clearAuthSession } from "../utils/auth";

function formatBookingDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFilters, setDateFilters] = useState({ dateFrom: "", dateTo: "" });
  const [activeSection, setActiveSection] = useState("waiting");
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
  });
  const [serviceImage, setServiceImage] = useState(null);
  const [editingServiceId, setEditingServiceId] = useState("");

  const loadDashboardData = async () => {
    setError("");
    setLoading(true);
    try {
      const bookingParams = {};
      if (dateFilters.dateFrom) bookingParams.dateFrom = dateFilters.dateFrom;
      if (dateFilters.dateTo) bookingParams.dateTo = dateFilters.dateTo;

      const [bookingsRes, servicesRes] = await Promise.all([
        API.get("/bookings", { params: bookingParams }),
        API.get("/services", { params: { active: "all" } }),
      ]);

      setBookings(bookingsRes.data);
      setServices(servicesRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        clearAuthSession();
        window.location.href = "/admin/login";
        return;
      }
      setError(err.response?.data?.message || "Could not load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [dateFilters.dateFrom, dateFilters.dateTo]);

  const waitingOrders = useMemo(
    () => bookings.filter((item) => item.status === "Pending"),
    [bookings]
  );
  const activeOrders = useMemo(
    () => bookings.filter((item) => item.status === "Approved" || item.status === "In Progress"),
    [bookings]
  );
  const completedOrders = useMemo(
    () => bookings.filter((item) => item.status === "Completed" || item.status === "Rejected"),
    [bookings]
  );

  const statusClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "approved":
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "rejected":
        return "bg-rose-100 text-rose-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const sectionButtonClass = (id) =>
    [
      "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition",
      activeSection === id
        ? "bg-brand-accent text-brand-ink"
        : "bg-brand-soft text-brand-muted hover:bg-brand-accent hover:text-brand-ink",
    ].join(" ");

  const updateBooking = async (bookingId, payload) => {
    try {
      await API.patch(`/bookings/${bookingId}`, payload);
      await loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update booking");
    }
  };

  const handleReschedule = async (booking) => {
    const newDate = window.prompt("Enter new date (YYYY-MM-DD):", booking.date?.slice(0, 10) || "");
    if (!newDate) return;
    const newTime = window.prompt("Enter new time (HH:MM):", booking.time || "");
    if (!newTime) return;
    await updateBooking(booking._id, { date: newDate, time: newTime });
  };

  const resetServiceForm = () => {
    setServiceForm({
      name: "",
      description: "",
      price: "",
      duration: "",
    });
    setServiceImage(null);
    setEditingServiceId("");
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = new FormData();
      payload.append("name", serviceForm.name);
      payload.append("description", serviceForm.description);
      payload.append("price", String(Number(serviceForm.price)));
      payload.append("duration", String(Number(serviceForm.duration)));
      if (serviceImage) {
        payload.append("image", serviceImage);
      }

      if (editingServiceId) {
        await API.put(`/services/${editingServiceId}`, payload);
      } else {
        await API.post("/services", payload);
      }

      resetServiceForm();
      await loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save service");
    }
  };

  const toggleServiceStatus = async (service) => {
    setError("");
    try {
      const action = service.isActive ? "deactivate" : "activate";
      await API.patch(`/services/${service._id}/${action}`);
      await loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update service status");
    }
  };

  const renderOrdersTable = (rows, mode) => (
    <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="text-left text-sm uppercase tracking-wide text-brand-muted">
              <th className="p-4">Reference</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Service</th>
              <th className="p-4">Date</th>
              <th className="p-4">Time</th>
              <th className="p-4">Status</th>
              {mode !== "completed" && <th className="p-4">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((booking) => (
              <tr key={booking._id} className="border-t border-brand-border text-sm hover:bg-brand-card">
                <td className="p-4 font-semibold text-brand-muted">{booking.bookingReference}</td>
                <td className="p-4 font-semibold text-brand-ink">{booking.customerName}</td>
                <td className="p-4 text-brand-muted">{booking.service?.name}</td>
                <td className="p-4 text-brand-muted">{formatBookingDate(booking.date)}</td>
                <td className="p-4 text-brand-muted">{booking.time}</td>
                <td className="p-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                {mode !== "completed" && (
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {mode === "waiting" && (
                        <>
                          <button type="button" onClick={() => updateBooking(booking._id, { status: "Approved" })} className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">Approve</button>
                          <button type="button" onClick={() => updateBooking(booking._id, { status: "Rejected" })} className="rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">Reject</button>
                        </>
                      )}
                      {mode === "active" && (
                        <>
                          <button type="button" onClick={() => updateBooking(booking._id, { status: "In Progress" })} className="rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">In Progress</button>
                          <button type="button" onClick={() => updateBooking(booking._id, { status: "Completed" })} className="rounded-md bg-brand-soft px-2 py-1 text-xs font-semibold text-brand-ink">Complete</button>
                          <button type="button" onClick={() => updateBooking(booking._id, { status: "Rejected" })} className="rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">Reject</button>
                        </>
                      )}
                      <button type="button" onClick={() => handleReschedule(booking)} className="rounded-md border border-brand-border bg-white px-2 py-1 text-xs font-semibold text-brand-muted">Reschedule</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="p-6 text-center text-sm text-brand-muted" colSpan={mode === "completed" ? 6 : 7}>
                  No records in this section.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-bg p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm">
          <h2 className="text-3xl font-bold text-brand-ink">Admin Dashboard</h2>
          <p className="mt-2 text-sm text-brand-muted">Choose a section to manage waiting orders, active orders, completed orders, or services.</p>
        </div>

        <div className="flex flex-wrap gap-3 rounded-2xl border border-brand-border bg-white p-4 shadow-sm">
          <button type="button" onClick={() => setActiveSection("waiting")} className={sectionButtonClass("waiting")}>
            Waiting Orders <span className="rounded-full bg-white px-2 py-0.5 text-xs text-brand-ink">{waitingOrders.length}</span>
          </button>
          <button type="button" onClick={() => setActiveSection("active")} className={sectionButtonClass("active")}>
            Active Orders <span className="rounded-full bg-white px-2 py-0.5 text-xs text-brand-ink">{activeOrders.length}</span>
          </button>
          <button type="button" onClick={() => setActiveSection("completed")} className={sectionButtonClass("completed")}>
            Completed Orders <span className="rounded-full bg-white px-2 py-0.5 text-xs text-brand-ink">{completedOrders.length}</span>
          </button>
          <button type="button" onClick={() => setActiveSection("services")} className={sectionButtonClass("services")}>
            Services <span className="rounded-full bg-white px-2 py-0.5 text-xs text-brand-ink">{services.length}</span>
          </button>
        </div>

        {activeSection !== "services" && (
          <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-3">
              <input
                type="date"
                className="rounded-lg border border-brand-border bg-white p-2 text-sm focus:border-brand-accent focus:outline-none"
                value={dateFilters.dateFrom}
                onChange={(e) => setDateFilters({ ...dateFilters, dateFrom: e.target.value })}
              />
              <input
                type="date"
                className="rounded-lg border border-brand-border bg-white p-2 text-sm focus:border-brand-accent focus:outline-none"
                value={dateFilters.dateTo}
                onChange={(e) => setDateFilters({ ...dateFilters, dateTo: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setDateFilters({ dateFrom: "", dateTo: "" })}
                className="rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-semibold text-brand-ink hover:bg-brand-card"
              >
                Clear Date Filters
              </button>
            </div>
          </div>
        )}

        {activeSection === "waiting" && renderOrdersTable(waitingOrders, "waiting")}
        {activeSection === "active" && renderOrdersTable(activeOrders, "active")}
        {activeSection === "completed" && renderOrdersTable(completedOrders, "completed")}

        {activeSection === "services" && (
          <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
            <form onSubmit={handleServiceSubmit} className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-brand-ink">{editingServiceId ? "Edit Service" : "Add Service"}</h3>
              <div className="mt-4 space-y-3">
                <input
                  className="w-full rounded-lg border border-brand-border p-3 text-sm focus:border-brand-accent focus:outline-none"
                  placeholder="Service name"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  required
                />
                <textarea
                  className="w-full rounded-lg border border-brand-border p-3 text-sm focus:border-brand-accent focus:outline-none"
                  placeholder="Description"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  rows={3}
                  required
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-brand-border p-3 text-sm focus:border-brand-accent focus:outline-none"
                    placeholder="Price"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-lg border border-brand-border p-3 text-sm focus:border-brand-accent focus:outline-none"
                    placeholder="Duration (mins)"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-brand-muted">Service Image (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full rounded-lg border border-brand-border bg-white p-2 text-sm focus:border-brand-accent focus:outline-none"
                    onChange={(e) => setServiceImage(e.target.files?.[0] || null)}
                  />
                  <p className="mt-1 text-xs text-brand-muted">Image will be compressed and stored in the database.</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-bold text-brand-ink hover:bg-brand-accent-strong">
                  {editingServiceId ? "Update Service" : "Create Service"}
                </button>
                {editingServiceId && (
                  <button
                    type="button"
                    onClick={resetServiceForm}
                    className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-muted hover:bg-brand-card"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-brand-ink">Service Management</h3>
              <div className="mt-4 space-y-3">
                {services.map((service) => (
                  <div key={service._id} className="rounded-xl border border-brand-border bg-brand-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        {service.imageUrl && (
                          <img
                            src={service.imageUrl}
                            alt={service.name}
                            className="mb-3 h-24 w-full max-w-[180px] rounded-lg object-cover"
                          />
                        )}
                        <p className="font-semibold text-brand-ink">{service.name}</p>
                        <p className="mt-1 text-sm text-brand-muted">{service.description}</p>
                        <p className="mt-1 text-xs font-semibold text-brand-muted">
                          {`GH\u20B5`}{service.price} | {service.duration} min | {service.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingServiceId(service._id);
                            setServiceForm({
                              name: service.name,
                              description: service.description,
                              price: String(service.price),
                              duration: String(service.duration),
                            });
                            setServiceImage(null);
                          }}
                          className="rounded-md border border-brand-border bg-white px-3 py-1 text-xs font-semibold text-brand-muted hover:bg-brand-soft"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleServiceStatus(service)}
                          className="rounded-md bg-brand-ink px-3 py-1 text-xs font-semibold text-white hover:bg-brand-ink-soft"
                        >
                          {service.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
