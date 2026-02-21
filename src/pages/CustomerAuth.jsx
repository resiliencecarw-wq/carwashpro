import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { isCustomerAuthenticated, setAuthSession } from "../utils/auth";
import registerImage from "../assets/register page.jpg";
import loginImage from "../assets/loginpage.jpg";

export default function CustomerAuth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contact: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isCustomerAuthenticated()) {
    return <Navigate to="/customer/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = mode === "register" ? "/auth/customer/register" : "/auth/customer/login";
      const payload =
        mode === "register"
          ? form
          : { email: form.email, password: form.password };

      const { data } = await API.post(endpoint, payload);
      setAuthSession({
        role: "customer",
        token: data.token,
        user: data.user,
      });
      navigate("/customer/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-brand-border bg-white p-7 shadow-sm">
        <div className="mb-5 overflow-hidden rounded-xl border border-brand-border">
          <img
            src={mode === "register" ? registerImage : loginImage}
            alt={mode === "register" ? "Register" : "Login"}
            className="h-40 w-full object-cover"
          />
        </div>

        <h2 className="text-3xl font-bold text-brand-ink">
          {mode === "register" ? "Create Account" : "Customer Login"}
        </h2>
        <p className="mt-2 text-sm text-brand-muted">
          {mode === "register" ? "Register to manage your bookings." : "Login to view your bookings."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "register" && (
            <>
              <input
                placeholder="Full Name"
                className="w-full rounded-lg border border-brand-border p-3 focus:border-brand-accent focus:outline-none"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                placeholder="Contact"
                className="w-full rounded-lg border border-brand-border p-3 focus:border-brand-accent focus:outline-none"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                required
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border border-brand-border p-3 focus:border-brand-accent focus:outline-none"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full rounded-lg border border-brand-border p-3 pr-20 focus:border-brand-accent focus:outline-none"
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

          {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-accent py-3 font-bold text-brand-ink transition hover:bg-brand-accent-strong disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "register" ? "Register" : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "register" ? "login" : "register")}
          className="mt-4 text-sm font-semibold text-brand-muted hover:text-brand-ink"
        >
          {mode === "register" ? "Already have an account? Login" : "Need an account? Register"}
        </button>
      </div>
    </div>
  );
}
