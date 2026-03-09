
import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { clearAuthSession } from "../utils/auth";
import { toast } from "../assets/components/Toast";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("stats");
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
  });
  const [serviceImage, setServiceImage] = useState(null);
  const [editingServiceId, setEditingServiceId] = useState("");
  const [stats, setStats] = useState(null);
  
  // Bulk selection state
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);

  const loadDashboardData = async () => {
    setError("");
    setLoading(true);
    try {
      const bookingParams = {};
      if (dateFilters.dateFrom) bookingParams.dateFrom = dateFilters.dateFrom;
      if (dateFilters.dateTo) bookingParams.dateTo = dateFilters.dateTo;
      if (searchQuery) bookingParams.search = searchQuery;

      const [bookingsRes, servicesRes, statsRes] = await Promise.all([
        API.get("/bookings", { params: bookingParams }),
        API.get("/services", { params: { active: "all" } }),
        API.get("/bookings/stats", { params: bookingParams }),
      ]);

      setBookings(bookingsRes.data);
      setServices(servicesRes.data);
      setStats(statsRes.data);
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadDashboardData();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (activeSection !== "stats") {
      loadDashboardData();
    }
  }, [activeSection]);

  // Handle bulk selection
  const toggleBookingSelection = (bookingId) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
    setShowBulkActions(true);
  };

  const toggleSelectAll = () => {
    const currentBookings = getCurrentSectionBookings();
    if (selectedBookings.length === currentBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(currentBookings.map(b => b._id));
    }
  };

  const getCurrentSectionBookings = () => {
    switch (activeSection) {
      case "waiting":
        return waitingOrders;
      case "active":
        return activeOrders;
      case "completed":
        return completedOrders;
      default:
        return bookings;
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    if (selectedBookings.length === 0) return;
    
    setBulkActionLoading(true);
    try {
      const promises = selectedBookings.map(id => {
        if (action === "approve") {
          return API.patch(`/bookings/${id}`, { status: "Approved" });
        } else if (action === "complete") {
          return API.patch(`/bookings/${id}`, { status: "Completed" });
        } else if (action === "cancel") {
          return API.patch(`/bookings/${id}`, { status: "Cancelled" });
        }
      });
      
      await Promise.all(promises);
      toast(`${selectedBookings.length} bookings ${action}ed successfully`, "success");
      setSelectedBookings([]);
      setShowBulkActions(false);
      loadDashboardData();
    } catch (err) {
      toast(err.response?.data?.message || "Bulk action failed", "error");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const waitingOrders = useMemo(
    () => bookings.filter((item) => item.status === "Pending"),
    [bookings]
  );
  const activeOrders = useMemo(
    () => bookings.filter((item) => item.status === "Approved" || item.status === "In Progress"),
    [bookings]
  );
  const completedOrders = useMemo(
    () => bookings.filter((item) => item.status === "Completed" || item.status === "Rejected" || item.status === "Cancelled"),
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
      case "cancelled":
        return "bg-rose-100 text-rose-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const sectionButtonClass = (id) =>
    [
      "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
      activeSection === id
        ? "bg-brand-accent text-brand-ink shadow-md"
        : "bg-brand-soft text-brand-muted hover:bg-brand-accent hover:text-brand-ink",
    ].join(" ");

  const updateBooking = async (bookingId, payload) => {
    try {
      await API.patch(`/bookings/${bookingId}`, payload);
      toast("Booking updated successfully", "success");
      await loadDashboardData();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to update booking", "error");
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
        toast("Service updated successfully", "success");
      } else {
        await API.post("/services", payload);
        toast("Service created successfully", "success");
      }

      resetServiceForm();
      await loadDashboardData();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to save service", "error");
    }
  };

  const toggleServiceStatus = async (service) => {
    setError("");
    try {
      const action = service.isActive ? "deactivate" : "activate";
      await API.patch(`/services/${service._id}/${action}`);
      toast(`Service ${action}d successfully`, "success");
      await loadDashboardData();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to update service status", "error");
    }
  };

  const deleteBooking = async (bookingId) => {
    const ok = window.confirm("Delete this finished booking permanently? This cannot be undone.");
    if (!ok) return;

    try {
      await API.delete(`/bookings/${bookingId}`);
      toast("Booking deleted successfully", "success");
      await loadDashboardData();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to delete booking", "error");
    }
  };

  const exportToCSV = () => {
    const headers = ["Reference", "Customer", "Contact", "Email", "Service", "Date", "Time", "Status", "Amount", "Vehicle", "Notes"];
    const rows = bookings.map(b => [
      b.bookingReference,
      b.customerName,
      b.customerContact,
      b.customerEmail || "",
      b.service?.name || "",
      formatBookingDate(b.date),
      b.time,
      b.status,
      b.totalAmount || 0,
      [b.vehicleMake, b.vehicleModel, b.vehiclePlate].filter(Boolean).join(" "),
      b.notes || "",
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `bookings_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast("Bookings exported to CSV", "success");
  };

  const renderOrdersTable = (rows, mode) => {
    const currentBookings = getCurrentSectionBookings();
    const allSelected = currentBookings.length > 0 && selectedBookings.length === currentBookings.length;
    const someSelected = selectedBookings.length > 0;

    return (
      <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
        {/* Bulk Actions Bar */}
        {(showBulkActions || someSelected) && mode !== "stats" && (
          <div className="flex flex-wrap items-center gap-3 border-b border-brand-border bg-brand-soft p-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-brand-border text-brand-accent focus:ring-brand-accent"
              />
              <span className="text-sm font-medium text-brand-ink">
                {selectedBookings.length} selected
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {mode === "waiting" && (
                <button
                  onClick={() => handleBulkAction("approve")}
                  disabled={bulkActionLoading}
                  className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-200 transition-colors disabled:opacity-60"
                >
                  Approve Selected
                </button>
              )}
              {mode === "active" && (
                <button
                  onClick={() => handleBulkAction("complete")}
                  disabled={bulkActionLoading}
                  className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-200 transition-colors disabled:opacity-60"
                >
                  Complete Selected
                </button>
              )}
              <button
                onClick={() => handleBulkAction("cancel")}
                disabled={bulkActionLoading}
                className="rounded-md bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200 transition-colors disabled:opacity-60"
              >
                Cancel Selected
              </button>
            </div>
            <button
              onClick={() => {
                setSelectedBookings([]);
                setShowBulkActions(false);
              }}
              className="ml-auto text-xs text-brand-muted hover:text-brand-ink"
            >
              Clear Selection
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="text-left text-sm uppercase tracking-wide text-brand-muted">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-brand-border text-brand-accent focus:ring-brand-accent"
                  />
                </th>
                <th className="p-4">Reference</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Service</th>
                <th className="p-4 hidden md:table-cell">Date</th>
                <th className="p-4 hidden lg:table-cell">Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 hidden sm:table-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((booking) => (
                <tr 
                  key={booking._id} 
                  className="border-t border-brand-border text-sm hover:bg-brand-card transition-colors"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedBookings.includes(booking._id)}
                      onChange={() => toggleBookingSelection(booking._id)}
                      className="h-4 w-4 rounded border-brand-border text-brand-accent focus:ring-brand-accent"
                    />
                  </td>
                  <td className="p-4 font-semibold text-brand-muted">{booking.bookingReference}</td>
                  <td className="p-4">
                    <div className="font-semibold text-brand-ink">{booking.customerName}</div>
                    <div className="text-xs text-brand-muted md:hidden">{booking.customerContact}</div>
                  </td>
                  <td className="p-4 text-brand-muted hidden sm:table-cell">{booking.service?.name}</td>
                  <td className="p-4 text-brand-muted hidden md:table-cell">{formatBookingDate(booking.date)}</td>
                  <td className="p-4 text-brand-muted hidden lg:table-cell">{booking.time}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {mode === "waiting" && (
                        <>
                          <button type="button" onClick={() => updateBooking(booking._id, { status: "Approved" })} className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-200 transition-colors">Approve</button>
                          <button type="button" onClick={() => updateBooking(booking._id, { status: "Rejected" })} className="rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200 transition-colors hidden sm:inline-block">Reject</button>
                        </>
                      )}
                      {mode === "active" && (
                        <>
                          <button type="button" onClick={() => updateBooking(booking._id, { status: "In Progress" })} className="rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-200 transition-colors hidden sm:inline-block">Progress</button>
                          <button type="button" onClick={() => updateBooking(booking._id, { status: "Completed" })} className="rounded-md bg-brand-soft px-2 py-1 text-xs font-semibold text-brand-ink hover:bg-brand-accent transition-colors">Complete</button>
                        </>
                      )}
                      {mode !== "completed" && (
                        <button type="button" onClick={() => handleReschedule(booking)} className="rounded-md border border-brand-border bg-white px-2 py-1 text-xs font-semibold text-brand-muted hover:bg-brand-card transition-colors hidden sm:inline-block">
                          Reschedule
                        </button>
                      )}
                      {mode === "completed" && (
                        <button type="button" onClick={() => deleteBooking(booking._id)} className="rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200 transition-colors">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-sm text-brand-muted" colSpan={8}>
                    No records in this section.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderStats = () => {
    if (!stats) return null;
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-brand-border bg-white p-5 shadow-sm hover-lift animate-fade-in">
            <p className="text-sm font-semibold text-brand-muted">Total Bookings</p>
            <p className="mt-1 text-3xl font-bold text-brand-ink">{stats.totalBookings || 0}</p>
          </div>
          <div className="rounded-xl border border-brand-border bg-white p-5 shadow-sm hover-lift animate-fade-in stagger-1">
            <p className="text-sm font-semibold text-brand-muted">Pending</p>
            <p className="mt-1 text-3xl font-bold text-amber-600">{stats.pendingBookings || 0}</p>
          </div>
          <div className="rounded-xl border border-brand-border bg-white p-5 shadow-sm hover-lift animate-fade-in stagger-2">
            <p className="text-sm font-semibold text-brand-muted">Active</p>
            <p className="mt-1 text-3xl font-bold text-blue-600">{stats.activeBookings || 0}</p>
          </div>
          <div className="rounded-xl border border-brand-border bg-white p-5 shadow-sm hover-lift animate-fade-in stagger-3">
            <p className="text-sm font-semibold text-brand-muted">Total Revenue</p>
            <p className="mt-1 text-3xl font-bold text-emerald-600">GH\u20B5{stats.totalRevenue || 0}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-brand-border bg-white p-5 shadow-sm animate-fade-in stagger-2">
            <h3 className="mb-4 text-lg font-bold text-brand-ink">Booking Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-brand-muted">Completed</span>
                <span className="font-semibold text-emerald-600">{stats.completedBookings || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-brand-muted">Cancelled</span>
                <span className="font-semibold text-rose-600">{stats.cancelledBookings || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-brand-muted">Rejected</span>
                <span className="font-semibold text-rose-600">{stats.rejectedBookings || 0}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-brand-border bg-white p-5 shadow-sm animate-fade-in stagger-3">
            <h3 className="mb-4 text-lg font-bold text-brand-ink">Popular Services</h3>
            {stats.popularServices && stats.popularServices.length > 0 ? (
              <div className="space-y-3">
                {stats.popularServices.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-brand-muted">{item.serviceName}</span>
                    <span className="font-semibold text-brand-ink">{item.count} bookings</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-brand-muted">No data available</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-bg p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Header with Notifications */}
        <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-brand-ink">Admin Dashboard</h2>
              <p className="mt-2 text-sm text-brand-muted">Manage bookings, services, and view analytics.</p>
            </div>
            
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-lg border border-brand-border bg-white p-2 text-brand-muted hover:bg-brand-card transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {waitingOrders.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {waitingOrders.length}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 rounded-lg border border-brand-border bg-white shadow-xl z-50 animate-scale-in">
                  <div className="p-3 border-b border-brand-border">
                    <h4 className="font-semibold text-brand-ink">Notifications</h4>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {waitingOrders.length > 0 ? (
                      <div 
                        className="p-3 hover:bg-brand-card cursor-pointer border-b border-brand-border"
                        onClick={() => {
                          setActiveSection("waiting");
                          setShowNotifications(false);
                        }}
                      >
                        <p className="text-sm font-medium text-brand-ink">{waitingOrders.length} pending booking(s)</p>
                        <p className="text-xs text-brand-muted">Click to view</p>
                      </div>
                    ) : (
                      <div className="p-3 text-sm text-brand-muted">No new notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 rounded-2xl border border-brand-border bg-white p-4 shadow-sm animate-fade-in stagger-1">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by reference, customer, contact, email, plate..."
              className="w-full rounded-lg border border-brand-border bg-white p-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <input
            type="date"
            className="rounded-lg border border-brand-border bg-white p-2 text-sm focus:border-brand-accent focus:outline-none transition-all"
            value={dateFilters.dateFrom}
            onChange={(e) => setDateFilters({ ...dateFilters, dateFrom: e.target.value })}
          />
          <input
            type="date"
            className="rounded-lg border border-brand-border bg-white p-2 text-sm focus:border-brand-accent focus:outline-none transition-all"
            value={dateFilters.dateTo}
            onChange={(e) => setDateFilters({ ...dateFilters, dateTo: e.target.value })}
          />
          <button
            type="button"
            onClick={() => {
              setDateFilters({ dateFrom: "", dateTo: "" });
              setSearchQuery("");
            }}
            className="rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-semibold text-brand-ink hover:bg-brand-card transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={exportToCSV}
            className="rounded-lg bg-brand-accent px-3 py-2 text-sm font-bold text-brand-ink hover:bg-brand-accent-strong transition-colors"
          >
            Export CSV
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-3 rounded-2xl border border-brand-border bg-white p-4 shadow-sm animate-fade-in stagger-2">
          <button type="button" onClick={() => setActiveSection("stats")} className={sectionButtonClass("stats")}>
            Overview
          </button>
          <button type="button" onClick={() => setActiveSection("waiting")} className={sectionButtonClass("waiting")}>
            Waiting <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700">{waitingOrders.length}</span>
          </button>
          <button type="button" onClick={() => setActiveSection("active")} className={sectionButtonClass("active")}>
            Active <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{activeOrders.length}</span>
          </button>
          <button type="button" onClick={() => setActiveSection("completed")} className={sectionButtonClass("completed")}>
            Completed <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">{completedOrders.length}</span>
          </button>
          <button type="button" onClick={() => setActiveSection("services")} className={sectionButtonClass("services")}>
            Services <span className="rounded-full bg-white px-2 py-0.5 text-xs text-brand-ink">{services.length}</span>
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700 animate-fade-in">
            {error}
          </div>
        )}

        {activeSection === "stats" && renderStats()}
        {activeSection === "waiting" && renderOrdersTable(waitingOrders, "waiting")}
        {activeSection === "active" && renderOrdersTable(activeOrders, "active")}
        {activeSection === "completed" && renderOrdersTable(completedOrders, "completed")}

        {activeSection === "services" && (
          <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
            <form onSubmit={handleServiceSubmit} className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm animate-fade-in">
              <h3 className="text-xl font-bold text-brand-ink">{editingServiceId ? "Edit Service" : "Add Service"}</h3>
              <div className="mt-4 space-y-3">
                <input
                  className="w-full rounded-lg border border-brand-border p-3 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
                  placeholder="Service name"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  required
                />
                <textarea
                  className="w-full rounded-lg border border-brand-border p-3 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
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
                    className="w-full rounded-lg border border-brand-border p-3 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
                    placeholder="Price"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-lg border border-brand-border p-3 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
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
                    className="w-full rounded-lg border border-brand-border bg-white p-2 text-sm focus:border-brand-accent focus:outline-none transition-all"
                    onChange={(e) => setServiceImage(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-bold text-brand-ink hover:bg-brand-accent-strong transition-colors">
                  {editingServiceId ? "Update Service" : "Create Service"}
                </button>
                {editingServiceId && (
                  <button
                    type="button"
                    onClick={resetServiceForm}
                    className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-muted hover:bg-brand-card transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm animate-slide-in-right">
              <h3 className="text-xl font-bold text-brand-ink">Service Management</h3>
              <div className="mt-4 space-y-3">
                {services.map((service) => (
                  <div key={service._id} className="rounded-xl border border-brand-border bg-brand-card p-4 hover-lift">
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
                          className="rounded-md border border-brand-border bg-white px-3 py-1 text-xs font-semibold text-brand-muted hover:bg-brand-soft transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleServiceStatus(service)}
                          className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                            service.isActive 
                              ? "bg-rose-100 text-rose-700 hover:bg-rose-200" 
                              : "bg-brand-ink text-white hover:bg-brand-ink-soft"
                          }`}
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
      </div>
    </div>
  );
}


