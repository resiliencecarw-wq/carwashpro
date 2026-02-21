import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { isAdminAuthenticated, setAuthSession } from "../utils/auth";
import adminImage from "../assets/pic1.jpeg";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAdminAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", form);
      setAuthSession({
        role: "admin",
        token: data.token,
        user: data.admin,
      });
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-brand-border bg-white p-7 shadow-sm">
        <div className="mb-5 overflow-hidden rounded-xl border border-brand-border">
          <img
            src={adminImage}
            alt="Admin login"
            className="h-40 w-full object-cover"
          />
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-muted">Admin Portal</p>
        <h2 className="mt-2 text-3xl font-bold text-brand-ink">Welcome Back</h2>
        <p className="mt-2 text-sm text-brand-muted">Sign in with your authorized admin credentials.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-muted">Username</label>
            <input
              className="w-full rounded-lg border border-brand-border p-3 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-muted">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg border border-brand-border p-3 pr-20 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-brand-soft px-2 py-1 text-xs font-semibold text-brand-muted hover:bg-brand-accent hover:text-brand-ink"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-accent py-3 font-bold text-brand-ink transition hover:bg-brand-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
