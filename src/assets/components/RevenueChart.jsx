import { useMemo } from "react";

export default function RevenueChart({ stats, bookings }) {
  // Generate mock daily data for the last 7 days
  const chartData = useMemo(() => {
    const days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      // Filter bookings for this day
      const dayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.date).toISOString().split("T")[0];
        return bookingDate === dateStr && b.status === "Completed";
      });
      
      const revenue = dayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      
      days.push({
        day: dayNames[date.getDay()],
        date: dateStr,
        revenue,
        count: dayBookings.length,
      });
    }
    
    return days;
  }, [bookings]);

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  return (
    <div className="rounded-xl border border-brand-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-brand-ink">Revenue Overview</h3>
        <span className="text-xs text-brand-muted">Last 7 days</span>
      </div>
      
      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-2 h-40 mb-4">
        {chartData.map((data, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="relative w-full flex items-end justify-center h-32">
              <div 
                className="w-full max-w-[40px] rounded-t-md bg-brand-accent transition-all duration-500 hover:bg-brand-accent-strong"
                style={{ 
                  height: `${(data.revenue / maxRevenue) * 100}%`,
                  minHeight: data.revenue > 0 ? "8px" : "2px"
                }}
                title={`GH\u20B5${data.revenue}`}
              />
            </div>
            <span className="text-[10px] text-brand-muted mt-1">{data.day}</span>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-brand-border">
        <div>
          <p className="text-xs text-brand-muted">Total Revenue</p>
          <p className="text-xl font-bold text-emerald-600">
            GH\u20B5{chartData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-brand-muted">Total Bookings</p>
          <p className="text-xl font-bold text-brand-ink">
            {chartData.reduce((sum, d) => sum + d.count, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ServicePieChart({ stats }) {
  if (!stats?.popularServices || stats.popularServices.length === 0) {
    return (
      <div className="rounded-xl border border-brand-border bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-brand-ink mb-4">Service Distribution</h3>
        <p className="text-sm text-brand-muted text-center py-8">No data available</p>
      </div>
    );
  }

  const total = stats.popularServices.reduce((sum, s) => sum + s.count, 0);
  const colors = ["bg-brand-accent", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-purple-500"];

  return (
    <div className="rounded-xl border border-brand-border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-brand-ink mb-4">Service Distribution</h3>
      
      {/* Pie Chart Representation using bars */}
      <div className="space-y-3">
        {stats.popularServices.map((service, index) => {
          const percentage = total > 0 ? (service.count / total) * 100 : 0;
          return (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-brand-ink">{service.serviceName}</span>
                <span className="text-brand-muted">{service.count} ({percentage.toFixed(0)}%)</span>
              </div>
              <div className="h-2 bg-brand-soft rounded-full overflow-hidden">
                <div 
                  className={`h-full ${colors[index % colors.length]} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

